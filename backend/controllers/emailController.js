import User from '../models/userModel.js';
import CustomEmail from '../models/customEmailModel.js';
import Email from '../models/emailModel.js';
import TeamAccess from '../models/teamAccessModel.js';
import { Resend } from 'resend';
import { v4 as uuidv4 } from 'uuid';

// Generate random token
const generateToken = () => {
  return uuidv4() + Date.now();
};

// Helper function to get accessible custom emails for a user
const getAccessibleCustomEmails = async (userId) => {
  // Get user's own emails
  const ownEmails = await CustomEmail.find({ userId, isActive: true });

  // Get emails from team access
  const teamAccess = await TeamAccess.find({
    userId,
    status: 'active',
    'permissions.canViewEmails': true
  });

  let accessibleEmails = [];
  for (const access of teamAccess) {
    if (access.accessibleEmails && access.accessibleEmails.length > 0) {
      const emails = await CustomEmail.find({
        _id: { $in: access.accessibleEmails },
        isActive: true
      });
      accessibleEmails.push(...emails);
    } else {
      // Access to all emails under this domain
      const emails = await CustomEmail.find({
        resendConfigId: access.resendConfigId,
        isActive: true
      });
      accessibleEmails.push(...emails);
    }
  }

  // Combine and deduplicate
  const allEmails = [...ownEmails, ...accessibleEmails];
  return allEmails.filter((email, index, self) => 
    index === self.findIndex(e => e._id.toString() === email._id.toString())
  );
};

// Send email notification (email)
const sendEmailNotification = async (to, subject, html) => {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: to,
      subject: subject,
      html: html
    });
    
    return true;
  } catch (error) {
    console.error('Send email notification error:', error);
    return false;
  }
};

// Send push notification (placeholder - will be implemented with web-push)
const sendPushNotification = async (userId, title, body, data = {}) => {
  try {
    const user = await User.findById(userId);
    if (!user) return false;

    // Check if push notifications are enabled
    if (!user.notificationPreferences?.push?.enabled) return false;

    const pushTokens = user.pushTokens?.filter(t => t.isActive) || [];
    
    if (pushTokens.length === 0) return false;

    // TODO: Implement actual push notification sending with web-push library
    // For now, just log
    console.log(`Would send push notification to ${pushTokens.length} devices:`, { title, body, data });
    
    return true;
  } catch (error) {
    console.error('Send push notification error:', error);
    return false;
  }
};

// Notify user about new email
const notifyNewEmail = async (userId, emailData) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    // Send email notification if enabled
    if (user.notificationPreferences?.email?.newEmail) {
      await sendEmailNotification(
        user.email,
        `New Email: ${emailData.subject}`,
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7b3eff;">New Email Received</h2>
            <p><strong>From:</strong> ${emailData.from}</p>
            <p><strong>Subject:</strong> ${emailData.subject}</p>
            <p><strong>Preview:</strong> ${emailData.preview}</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/inbox" style="background-color: #7b3eff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">View in Inbox</a>
            </div>
            <hr />
            <p style="color: #666; font-size: 12px;">Nexa - Email Communication Reimagined</p>
          </div>
        `
      );
    }

    // Send push notification if enabled
    if (user.notificationPreferences?.push?.newEmail) {
      await sendPushNotification(
        userId,
        'New Email',
        `From: ${emailData.from}`,
        { type: 'new_email', emailId: emailData.id }
      );
    }

  } catch (error) {
    console.error('Notify new email error:', error);
  }
};

// Notify user about login alert
const notifyLoginAlert = async (userId, ip, device) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    // Send email notification if enabled
    if (user.notificationPreferences?.email?.loginAlerts) {
      await sendEmailNotification(
        user.email,
        'New Login to Your Account',
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7b3eff;">New Login Detected</h2>
            <p>Hello ${user.name},</p>
            <p>A new login was detected on your account:</p>
            <ul>
              <li><strong>IP Address:</strong> ${ip}</li>
              <li><strong>Device:</strong> ${device}</li>
              <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
            </ul>
            <p>If this wasn't you, please change your password immediately.</p>
            <hr />
            <p style="color: #666; font-size: 12px;">Nexa - Email Communication Reimagined</p>
          </div>
        `
      );
    }

    // Send push notification if enabled
    if (user.notificationPreferences?.push?.loginAlerts) {
      await sendPushNotification(
        userId,
        'New Login Alert',
        `New login from ${device}`,
        { type: 'login_alert', ip, device }
      );
    }

  } catch (error) {
    console.error('Notify login alert error:', error);
  }
};

// Notify user about domain verified
const notifyDomainVerified = async (userId, domain) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    if (user.notificationPreferences?.email?.domainVerified) {
      await sendEmailNotification(
        user.email,
        `Domain Verified: ${domain}`,
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7b3eff;">Domain Verified Successfully!</h2>
            <p>Hello ${user.name},</p>
            <p>Your domain <strong>${domain}</strong> has been successfully verified.</p>
            <p>You can now start creating custom email addresses and sending emails.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/domains" style="background-color: #7b3eff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">View Domains</a>
            </div>
            <hr />
            <p style="color: #666; font-size: 12px;">Nexa - Email Communication Reimagined</p>
          </div>
        `
      );
    }

  } catch (error) {
    console.error('Notify domain verified error:', error);
  }
};

// Notify user about team invite
const notifyTeamInvite = async (userId, invitedBy, domain, accessLevel) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    if (user.notificationPreferences?.email?.teamInvites) {
      await sendEmailNotification(
        user.email,
        `Team Invitation: ${domain}`,
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7b3eff;">Team Invitation</h2>
            <p>Hello ${user.name},</p>
            <p><strong>${invitedBy}</strong> has invited you to join their team on <strong>${domain}</strong>.</p>
            <p>Access Level: <strong>${accessLevel}</strong></p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/team" style="background-color: #7b3eff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">View Invitation</a>
            </div>
            <hr />
            <p style="color: #666; font-size: 12px;">Nexa - Email Communication Reimagined</p>
          </div>
        `
      );
    }

    if (user.notificationPreferences?.push?.teamInvites) {
      await sendPushNotification(
        userId,
        'Team Invitation',
        `${invitedBy} invited you to join ${domain}`,
        { type: 'team_invite', domain, accessLevel }
      );
    }

  } catch (error) {
    console.error('Notify team invite error:', error);
  }
};

// Add Resend API Key and Domain
const addResendConfig = async (req, res) => {
  try {
    const userId = req.userId;
    const { resendApiKey, domain } = req.body;

    if (!resendApiKey || !domain) {
      return res.status(400).json({
        success: false,
        message: 'Resend API key and domain are required'
      });
    }

    const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid domain format. Example: example.com'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if domain already exists in user's account
    const existingDomain = user.resendConfigs.find(c => c.domain === domain && c.isActive);
    if (existingDomain) {
      return res.status(400).json({
        success: false,
        message: 'This domain already exists in your account'
      });
    }

    // Validate API key and check domain is verified in Resend
    const resend = new Resend(resendApiKey);

    let domainsList = [];
    try {
      const response = await resend.domains.list();

      if (Array.isArray(response)) {
        domainsList = response;
      } else if (Array.isArray(response?.data)) {
        domainsList = response.data;
      } else if (Array.isArray(response?.data?.data)) {
        domainsList = response.data.data;
      } else {
        domainsList = [];
      }
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Resend API key. Please check and try again.',
        error: error.message
      });
    }

    const domainInResend = domainsList.find(d => d.name === domain);

    if (!domainInResend) {
      return res.status(400).json({
        success: false,
        message: `Domain "${domain}" not found in your Resend account.`,
        suggestion: 'Go to https://resend.com/domains to add your domain first'
      });
    }

    if (domainInResend.status !== 'verified') {
      return res.status(400).json({
        success: false,
        message: `Domain "${domain}" is not verified in Resend yet.`,
        suggestion: 'Please verify your domain in Resend first before adding it here'
      });
    }

    // Domain is verified in Resend — save it directly as verified
    const configId = uuidv4();

    user.resendConfigs.push({
      id: configId,
      apiKey: resendApiKey,
      domain,
      isVerified: true,
      verifiedAt: new Date(),
      createdAt: new Date(),
      isActive: true
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: `Domain "${domain}" added and verified successfully!`,
      data: { domain, configId }
    });

  } catch (error) {
    console.error('Add Resend config error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding Resend configuration',
      error: error.message
    });
  }
};

// Get user's resend configs (domains)
const getResendConfigs = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const configs = user.resendConfigs.filter(c => c.isActive).map(c => ({
      id: c.id,
      domain: c.domain,
      isVerified: c.isVerified,
      verifiedAt: c.verifiedAt,
      createdAt: c.createdAt
    }));

    res.status(200).json({
      success: true,
      data: configs
    });

  } catch (error) {
    console.error('Get resend configs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching resend configs',
      error: error.message
    });
  }
};

// Verify domain ownership
const verifyDomainOwnership = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      'resendConfigs.verificationToken': token,
      'resendConfigs.tokenExpiry': { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token.'
      });
    }

    const configIndex = user.resendConfigs.findIndex(c => c.verificationToken === token);
    if (configIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'Configuration not found'
      });
    }

    const domain = user.resendConfigs[configIndex].domain;
    
    user.resendConfigs[configIndex].isVerified = true;
    user.resendConfigs[configIndex].verificationToken = null;
    user.resendConfigs[configIndex].tokenExpiry = null;
    user.resendConfigs[configIndex].verifiedAt = new Date();
    
    await user.save();

    // Send notification about domain verification
    await notifyDomainVerified(user._id, domain);

    res.status(200).json({
      success: true,
      message: 'Domain verified successfully!',
      data: { domain }
    });

  } catch (error) {
    console.error('Domain verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying domain',
      error: error.message
    });
  }
};

// Create custom email address
const createCustomEmail = async (req, res) => {
  try {
    const userId = req.userId;
    const { username, forwardToEmail, isDefault = false, displayName, signature, resendConfigId } = req.body;

    if (!username || !forwardToEmail) {
      return res.status(400).json({
        success: false,
        message: 'Username and forward email are required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find resend config — check user's own configs first
    let resendConfig = null;
    let isOwner = true;
    let ownerId = userId;

    resendConfig = user.resendConfigs.find(
      c => (c.id === resendConfigId || c._id?.toString() === resendConfigId?.toString()) 
      && c.isVerified 
      && c.isActive
    );

    if (!resendConfig) {
      // Check team access
      const teamAccess = await TeamAccess.findOne({
        userId,
        resendConfigId,
        status: 'active',
        'permissions.canCreateCustomEmails': true
      });

      if (teamAccess) {
        const owner = await User.findById(teamAccess.ownerId);
        resendConfig = owner.resendConfigs.find(
          c => c.id === resendConfigId ||
          c._id?.toString() === resendConfigId?.toString()
        );
        isOwner = false;
        ownerId = teamAccess.ownerId;
      }
    }

    if (!resendConfig) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to create custom emails for this domain'
      });
    }

    const { domain, id: configId } = resendConfig;
    const emailAddress = `${username}@${domain}`;

    // Check if email already exists
    const existingEmail = await CustomEmail.findOne({ email: emailAddress });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'This email address already exists'
      });
    }

    // Handle profile picture upload
    let profilePicture = {
      url: null,
      publicId: null,
      fileName: null,
      fileSize: null,
      mimeType: null
    };

    if (req.file) {
      profilePicture = {
        url: req.file.path,
        publicId: req.file.filename,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype
      };
    }

    // If setting as default, remove default from others
    if (isDefault) {
      await CustomEmail.updateMany(
        { userId: ownerId, isDefault: true },
        { isDefault: false }
      );
    }

    const customEmail = new CustomEmail({
      userId: ownerId,
      createdBy: isOwner ? null : userId,
      resendConfigId: configId,
      domain,
      username,
      email: emailAddress,
      forwardToEmail,
      isDefault,
      isActive: true,
      profilePicture,
      displayName: displayName || username,
      signature: signature || null
    });

    await customEmail.save();

    // Send welcome email via Resend
    const resend = new Resend(resendConfig.apiKey);
    try {
      await resend.emails.send({
        from: emailAddress,
        to: forwardToEmail,
        subject: 'Your Custom Email is Ready!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7b3eff;">Welcome to Nexa!</h2>
            <p>Your new email address <strong>${emailAddress}</strong> has been created successfully.</p>
            <p>Emails sent to this address will be forwarded to <strong>${forwardToEmail}</strong>.</p>
            <p>You can now start sending and receiving emails using this address.</p>
            <hr />
            <p style="color: #666; font-size: 12px;">Nexa - Email Communication Reimagined</p>
          </div>
        `
      });
    } catch (emailError) {
      // Don't fail the whole request if welcome email fails
      console.error('Welcome email failed:', emailError.message);
    }

    res.status(201).json({
      success: true,
      message: `Custom email ${emailAddress} created successfully`,
      data: customEmail
    });

  } catch (error) {
    console.error('Create custom email error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating custom email',
      error: error.message
    });
  }
};

// Invite user to access domain emails
const inviteUserToDomain = async (req, res) => {
  try {
    const ownerId = req.userId;
    const { email, resendConfigId, accessLevel, customEmailIds = [] } = req.body;

    if (!email || !resendConfigId) {
      return res.status(400).json({
        success: false,
        message: 'Email and resendConfigId are required'
      });
    }

    if (!accessLevel || !['view', 'send', 'manage', 'admin'].includes(accessLevel)) {
      return res.status(400).json({
        success: false,
        message: 'Valid access level is required: view, send, manage, or admin'
      });
    }

    const owner = await User.findById(ownerId);
    if (!owner) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find the resend config — check both id and _id
    const resendConfig = owner.resendConfigs.find(
      c => (c.id === resendConfigId || c._id?.toString() === resendConfigId?.toString())
      && c.isActive
    );

    if (!resendConfig) {
      return res.status(403).json({
        success: false,
        message: 'You do not own this domain configuration'
      });
    }

    // Find the user to invite
    const invitedUser = await User.findOne({ email: email.toLowerCase() });
    if (!invitedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email. They need to register first.'
      });
    }

    // Prevent inviting yourself
    if (invitedUser._id.toString() === ownerId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot invite yourself'
      });
    }

    // Check if already invited
    const existingAccess = await TeamAccess.findOne({
      resendConfigId,
      ownerId,
      userId: invitedUser._id,
      status: { $ne: 'revoked' }
    });

    if (existingAccess) {
      return res.status(400).json({
        success: false,
        message: 'User already has access to this domain'
      });
    }

    // Set permissions based on access level
    let permissions = {
      canViewEmails: true,
      canSendEmails: false,
      canCreateCustomEmails: false,
      canDeleteCustomEmails: false,
      canManageAccess: false
    };

    switch (accessLevel) {
      case 'view':
        permissions.canViewEmails = true;
        break;
      case 'send':
        permissions.canViewEmails = true;
        permissions.canSendEmails = true;
        break;
      case 'manage':
        permissions.canViewEmails = true;
        permissions.canSendEmails = true;
        permissions.canCreateCustomEmails = true;
        break;
      case 'admin':
        permissions.canViewEmails = true;
        permissions.canSendEmails = true;
        permissions.canCreateCustomEmails = true;
        permissions.canDeleteCustomEmails = true;
        permissions.canManageAccess = true;
        break;
    }

    const invitationToken = generateToken();
    const tokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const teamAccess = new TeamAccess({
      resendConfigId,
      domain: resendConfig.domain,
      ownerId,
      userId: invitedUser._id,
      accessLevel,
      permissions,
      accessibleEmails: customEmailIds,
      invitedBy: ownerId,
      status: 'pending',
      invitationToken,
      tokenExpiry
    });

    await teamAccess.save();

    // Send invitation email
    const resend = new Resend(resendConfig.apiKey);
    const acceptLink = `${process.env.FRONTEND_URL}/accept-invitation/${invitationToken}`;

    try {
      await resend.emails.send({
        from: `notifications@${resendConfig.domain}`,
        to: email,
        subject: `Invitation to access ${resendConfig.domain} emails on Nexa`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7b3eff;">Domain Access Invitation</h2>
            <p>Hello ${invitedUser.name},</p>
            <p><strong>${owner.name}</strong> has invited you to access emails for domain <strong>${resendConfig.domain}</strong>.</p>
            <p>Access Level: <strong>${accessLevel}</strong></p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${acceptLink}" style="background-color: #7b3eff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">
                Accept Invitation
              </a>
            </div>
            <p>This invitation expires in 7 days.</p>
            <p>If you did not expect this invitation, you can safely ignore this email.</p>
            <hr />
            <p style="color: #666; font-size: 12px;">Nexa - Email Communication Reimagined</p>
          </div>
        `
      });
    } catch (emailError) {
      // Remove team access record if email fails
      await TeamAccess.findByIdAndDelete(teamAccess._id);
      return res.status(500).json({
        success: false,
        message: 'Failed to send invitation email. Please try again.',
        error: emailError.message
      });
    }

    // Send in-app notification to invited user
    await notifyTeamInvite(invitedUser._id, owner.name, resendConfig.domain, accessLevel);

    res.status(200).json({
      success: true,
      message: `Invitation sent to ${email} successfully`,
      data: { expiresIn: '7 days' }
    });

  } catch (error) {
    console.error('Invite user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending invitation',
      error: error.message
    });
  }
};

// Accept invitation
const acceptInvitation = async (req, res) => {
  try {
    const userId = req.userId;
    const { token } = req.params;

    const teamAccess = await TeamAccess.findOne({
      invitationToken: token,
      tokenExpiry: { $gt: new Date() },
      status: 'pending'
    });

    if (!teamAccess) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired invitation'
      });
    }

    if (teamAccess.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'This invitation is not for you'
      });
    }

    teamAccess.status = 'active';
    teamAccess.acceptedAt = new Date();
    teamAccess.invitationToken = null;
    teamAccess.tokenExpiry = null;
    await teamAccess.save();

    res.status(200).json({
      success: true,
      message: 'Invitation accepted successfully! You now have access to the domain emails.'
    });

  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error accepting invitation',
      error: error.message
    });
  }
};

// Get all users with access to a domain
const getDomainAccessUsers = async (req, res) => {
  try {
    const ownerId = req.userId;
    const { resendConfigId } = req.params;

    const owner = await User.findById(ownerId);
    if (!owner) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if owner owns this config
    const resendConfig = owner.resendConfigs.find(c => c.id === resendConfigId);
    if (!resendConfig) {
      return res.status(403).json({
        success: false,
        message: 'You do not own this domain configuration'
      });
    }

    const accessList = await TeamAccess.find({
      resendConfigId,
      ownerId,
      status: 'active'
    }).populate('userId', 'name email profilePicture');

    res.status(200).json({
      success: true,
      data: accessList.map(access => ({
        id: access._id,
        user: access.userId,
        accessLevel: access.accessLevel,
        permissions: access.permissions,
        accessibleEmails: access.accessibleEmails,
        acceptedAt: access.acceptedAt
      }))
    });

  } catch (error) {
    console.error('Get domain access error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching domain access',
      error: error.message
    });
  }
};

// Update user access level
const updateUserAccess = async (req, res) => {
  try {
    const ownerId = req.userId;
    const { accessId } = req.params;
    const { accessLevel, customEmailIds } = req.body;

    const teamAccess = await TeamAccess.findById(accessId);
    if (!teamAccess) {
      return res.status(404).json({
        success: false,
        message: 'Access record not found'
      });
    }

    if (teamAccess.ownerId.toString() !== ownerId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this access'
      });
    }

    // Set permissions based on access level
    let permissions = {
      canViewEmails: true,
      canSendEmails: false,
      canCreateCustomEmails: false,
      canDeleteCustomEmails: false,
      canManageAccess: false
    };

    switch (accessLevel) {
      case 'view':
        permissions.canViewEmails = true;
        break;
      case 'send':
        permissions.canViewEmails = true;
        permissions.canSendEmails = true;
        break;
      case 'manage':
        permissions.canViewEmails = true;
        permissions.canSendEmails = true;
        permissions.canCreateCustomEmails = true;
        break;
      case 'admin':
        permissions.canViewEmails = true;
        permissions.canSendEmails = true;
        permissions.canCreateCustomEmails = true;
        permissions.canDeleteCustomEmails = true;
        permissions.canManageAccess = true;
        break;
    }

    teamAccess.accessLevel = accessLevel;
    teamAccess.permissions = permissions;
    if (customEmailIds) {
      teamAccess.accessibleEmails = customEmailIds;
    }
    await teamAccess.save();

    res.status(200).json({
      success: true,
      message: 'User access updated successfully',
      data: teamAccess
    });

  } catch (error) {
    console.error('Update user access error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user access',
      error: error.message
    });
  }
};

// Revoke user access
const revokeUserAccess = async (req, res) => {
  try {
    const ownerId = req.userId;
    const { accessId } = req.params;

    const teamAccess = await TeamAccess.findById(accessId);
    if (!teamAccess) {
      return res.status(404).json({
        success: false,
        message: 'Access record not found'
      });
    }

    if (teamAccess.ownerId.toString() !== ownerId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to revoke this access'
      });
    }

    teamAccess.status = 'revoked';
    teamAccess.revokedAt = new Date();
    await teamAccess.save();

    res.status(200).json({
      success: true,
      message: 'User access revoked successfully'
    });

  } catch (error) {
    console.error('Revoke user access error:', error);
    res.status(500).json({
      success: false,
      message: 'Error revoking user access',
      error: error.message
    });
  }
};

// Get domains user has access to
const getAccessibleDomains = async (req, res) => {
  try {
    const userId = req.userId;

    const accessList = await TeamAccess.find({
      userId,
      status: 'active'
    });

    const domains = await Promise.all(accessList.map(async (access) => {
      const owner = await User.findById(access.ownerId);
      const resendConfig = owner.resendConfigs.find(c => c.id === access.resendConfigId);
      
      return {
        domain: access.domain,
        resendConfigId: access.resendConfigId,
        accessLevel: access.accessLevel,
        permissions: access.permissions,
        owner: {
          id: owner._id,
          name: owner.name,
          email: owner.email
        }
      };
    }));

    res.status(200).json({
      success: true,
      data: domains
    });

  } catch (error) {
    console.error('Get accessible domains error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching accessible domains',
      error: error.message
    });
  }
};

// Send email
const sendEmail = async (req, res) => {
  try {
    const userId = req.userId;
    const { to, subject, html, customEmailId, replyToEmailId, cc, bcc } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get the custom email to send from
    const customEmail = await CustomEmail.findOne({ _id: customEmailId, isActive: true });
    if (!customEmail) {
      return res.status(404).json({
        success: false,
        message: 'Custom email not found'
      });
    }

    // Check if user has permission to send from this email
    let resendConfig = null;
    let hasPermission = false;

    if (customEmail.userId.toString() === userId.toString()) {
      // User owns this email
      resendConfig = user.resendConfigs.find(
        c => c.id === customEmail.resendConfigId ||
        c._id?.toString() === customEmail.resendConfigId?.toString()
      );
      if (resendConfig?.isVerified) {
        hasPermission = true;
      }
    } else {
      // Check team access
      const teamAccess = await TeamAccess.findOne({
        userId,
        resendConfigId: customEmail.resendConfigId,
        status: 'active',
        'permissions.canSendEmails': true
      });

      if (teamAccess) {
        const owner = await User.findById(teamAccess.ownerId);
        resendConfig = owner.resendConfigs.find(
          c => c.id === customEmail.resendConfigId ||
          c._id?.toString() === customEmail.resendConfigId?.toString()
        );
        if (resendConfig?.isVerified) {
          hasPermission = true;
        }
      }
    }

    if (!hasPermission || !resendConfig) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to send emails from this address'
      });
    }

    // Process attachments
    const attachments = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        attachments.push({
          filename: file.originalname,
          originalName: file.originalname,
          url: file.path,
          publicId: file.filename,
          fileSize: file.size,
          mimeType: file.mimetype,
          cid: uuidv4()
        });
      }
    }

    const resend = new Resend(resendConfig.apiKey);
    const fromDisplay = customEmail.displayName || customEmail.username;
    const fromAddress = `${fromDisplay} <${customEmail.email}>`;
    const toArray = Array.isArray(to) ? to : [to];

    const emailData = {
      from: fromAddress,
      to: toArray,
      subject,
      html,
      attachments: attachments.map(a => ({
        filename: a.filename,
        path: a.url,
        cid: a.cid
      }))
    };

    if (replyToEmailId) {
      const replyToEmail = await Email.findOne({ emailId: replyToEmailId });
      if (replyToEmail) {
        emailData.replyTo = replyToEmail.from.email;
        emailData.inReplyTo = replyToEmailId;
      }
    }

    if (cc && cc.length > 0) emailData.cc = cc;
    if (bcc && bcc.length > 0) emailData.bcc = bcc;

    const { data, error } = await resend.emails.send(emailData);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to send email',
        error: error.message
      });
    }

    // Save sent email to DB
    const sentEmail = new Email({
      userId: customEmail.userId,
      sentBy: userId,
      customEmailId: customEmail._id,
      direction: 'sent',
      emailId: data.id,
      from: {
        email: customEmail.email,
        name: customEmail.displayName
      },
      to: toArray.map(t => ({ email: t, name: null })),
      cc: cc ? cc.map(c => ({ email: c, name: null })) : [],
      bcc: bcc ? bcc.map(b => ({ email: b, name: null })) : [],
      subject,
      content: html,
      contentType: 'html',
      attachments,
      isReply: !!replyToEmailId,
      replyToEmailId: replyToEmailId || null,
      status: 'sent',
      sentAt: new Date(),
      resendResponse: data
    });

    await sentEmail.save();

    if (replyToEmailId) {
      await Email.findOneAndUpdate(
        { emailId: replyToEmailId },
        { status: 'replied', repliedAt: new Date() }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      data: { id: data.id, from: customEmail.email, to: toArray, subject }
    });

  } catch (error) {
    console.error('Send email error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending email',
      error: error.message
    });
  }
};

// Receive email (webhook from Resend)
const receiveEmail = async (req, res) => {
  try {
    const payload = req.body;

    // Resend webhook sends data nested under 'data'
    const emailPayload = payload.data || payload;

    const {
      to,
      from,
      subject,
      html,
      text,
      attachments
    } = emailPayload;

    // Get the recipient email address
    const toEmail = Array.isArray(to) ? to[0] : to;

    if (!toEmail) {
      return res.status(400).json({
        success: false,
        message: 'No recipient email found in webhook payload'
      });
    }

    // Find which custom email this belongs to
    const customEmail = await CustomEmail.findOne({ 
      email: toEmail.toLowerCase(), 
      isActive: true 
    });

    if (!customEmail) {
      return res.status(404).json({
        success: false,
        message: 'No custom email found for this address'
      });
    }

    const user = await User.findById(customEmail.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Process attachments
    const processedAttachments = [];
    if (attachments && attachments.length > 0) {
      for (const attachment of attachments) {
        if (attachment.url) {
          processedAttachments.push({
            filename: attachment.filename || attachment.name,
            originalName: attachment.filename || attachment.name,
            url: attachment.url,
            publicId: null,
            fileSize: attachment.size || 0,
            mimeType: attachment.mimetype || attachment.type || 'application/octet-stream',
            cid: attachment.cid || null
          });
        }
      }
    }

    // Save received email to DB
    const emailId = uuidv4();
    const receivedEmail = new Email({
      userId: user._id,
      customEmailId: customEmail._id,
      direction: 'received',
      emailId,
      from: {
        email: typeof from === 'object' ? from.email : from,
        name: typeof from === 'object' ? from.name : null
      },
      to: [{ email: toEmail, name: null }],
      subject: subject || '(No Subject)',
      content: html || text || '',
      contentType: html ? 'html' : 'text',
      attachments: processedAttachments,
      status: 'received',
      receivedAt: new Date(),
      webhookData: req.body
    });

    await receivedEmail.save();

    // Notify user about new email
    const preview = (html || text || '')
      .replace(/<[^>]*>/g, '')
      .substring(0, 100);

    await notifyNewEmail(user._id, {
      from: typeof from === 'object' ? from.email : from,
      subject: subject || '(No Subject)',
      preview,
      id: emailId
    });

    // Forward to user's forward email if set
    if (customEmail.forwardToEmail) {
      const resendConfig = user.resendConfigs.find(
        c => (c.id === customEmail.resendConfigId ||
        c._id?.toString() === customEmail.resendConfigId?.toString())
        && c.isVerified
        && c.isActive
      );

      if (resendConfig) {
        const resend = new Resend(resendConfig.apiKey);
        try {
          await resend.emails.send({
            from: toEmail,
            to: customEmail.forwardToEmail,
            subject: `Fwd: ${subject || '(No Subject)'}`,
            html: `
              <div style="font-family: Arial, sans-serif;">
                <p><strong>From:</strong> ${typeof from === 'object' ? from.email : from}</p>
                <p><strong>To:</strong> ${toEmail}</p>
                <p><strong>Subject:</strong> ${subject || '(No Subject)'}</p>
                <hr />
                ${html || `<p>${text}</p>` || ''}
              </div>
            `
          });
        } catch (forwardError) {
          // Don't fail the webhook if forwarding fails
          console.error('Email forwarding failed:', forwardError.message);
        }
      }
    }

    res.status(200).json({
      success: true,
      message: 'Email received and stored'
    });

  } catch (error) {
    console.error('Receive email error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing received email',
      error: error.message
    });
  }
};

// Get all custom emails for user (including accessible ones)
const getCustomEmails = async (req, res) => {
  try {
    const userId = req.userId;
    const { resendConfigId } = req.query;

    // Get user's own emails
    let query = { isActive: true };
    
    if (resendConfigId) {
      query.resendConfigId = resendConfigId;
    }

    const ownEmails = await CustomEmail.find({ ...query, userId })
      .sort({ isDefault: -1, createdAt: -1 });

    // Get emails from team access
    const teamAccess = await TeamAccess.find({
      userId,
      status: 'active'
    });

    let accessibleEmails = [];
    for (const access of teamAccess) {
      if (access.accessibleEmails && access.accessibleEmails.length > 0) {
        const emails = await CustomEmail.find({
          _id: { $in: access.accessibleEmails },
          isActive: true
        });
        accessibleEmails.push(...emails);
      } else if (access.permissions.canViewEmails) {
        // Access to all emails under this domain
        const emails = await CustomEmail.find({
          resendConfigId: access.resendConfigId,
          isActive: true
        });
        accessibleEmails.push(...emails);
      }
    }

    // Combine and deduplicate
    const allEmails = [...ownEmails, ...accessibleEmails];
    const uniqueEmails = allEmails.filter((email, index, self) => 
      index === self.findIndex(e => e._id.toString() === email._id.toString())
    );

    const user = await User.findById(userId);
    const domains = user.resendConfigs.filter(c => c.isVerified && c.isActive).map(c => ({
      id: c.id,
      domain: c.domain,
      verified: c.isVerified,
      verifiedAt: c.verifiedAt
    }));

    res.status(200).json({
      success: true,
      data: {
        domains,
        emails: uniqueEmails
      }
    });

  } catch (error) {
    console.error('Get custom emails error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching custom emails',
      error: error.message
    });
  }
};

// Get all emails (inbox)
const getInbox = async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 20, folder = 'inbox' } = req.query;

    // Get all custom emails user has access to
    const customEmails = await getAccessibleCustomEmails(userId);
    const customEmailIds = customEmails.map(e => e._id);

    let query = { 
      customEmailId: { $in: customEmailIds },
      direction: 'received', 
      isTrashed: false 
    };
    
    if (folder === 'starred') query.isStarred = true;
    else if (folder === 'archived') query.isArchived = true;
    else if (folder === 'inbox') query.isArchived = false;

    const total = await Email.countDocuments(query);
    const emails = await Email.find(query)
      .sort({ receivedAt: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('customEmailId', 'email displayName profilePicture');

    res.status(200).json({
      success: true,
      data: {
        emails,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get inbox error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inbox',
      error: error.message
    });
  }
};

// Get sent emails
const getSentEmails = async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 20 } = req.query;

    const customEmails = await getAccessibleCustomEmails(userId);
    const customEmailIds = customEmails.map(e => e._id);

    const total = await Email.countDocuments({ 
      customEmailId: { $in: customEmailIds },
      direction: 'sent', 
      isTrashed: false 
    });
    
    const emails = await Email.find({ 
      customEmailId: { $in: customEmailIds },
      direction: 'sent', 
      isTrashed: false 
    })
      .sort({ sentAt: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('customEmailId', 'email displayName profilePicture');

    res.status(200).json({
      success: true,
      data: {
        emails,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get sent emails error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sent emails',
      error: error.message
    });
  }
};

// Get single email by ID
const getEmailById = async (req, res) => {
  try {
    const userId = req.userId;
    const { emailId } = req.params;

    const email = await Email.findOne({ emailId })
      .populate('customEmailId', 'email displayName profilePicture signature');

    if (!email) {
      return res.status(404).json({
        success: false,
        message: 'Email not found'
      });
    }

    // Check if user has access to this email
    const accessibleEmails = await getAccessibleCustomEmails(userId);
    const hasAccess = accessibleEmails.some(e => e._id.toString() === email.customEmailId._id.toString());

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this email'
      });
    }

    // Mark as read if it's a received email and not read yet
    if (email.direction === 'received' && email.status === 'received') {
      email.status = 'read';
      email.readAt = new Date();
      await email.save();
    }

    res.status(200).json({
      success: true,
      data: email
    });

  } catch (error) {
    console.error('Get email by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching email',
      error: error.message
    });
  }
};

// Mark email as read
const markAsRead = async (req, res) => {
  try {
    const userId = req.userId;
    const { emailId } = req.params;

    const email = await Email.findOne({ emailId });
    if (!email) {
      return res.status(404).json({
        success: false,
        message: 'Email not found'
      });
    }

    const accessibleEmails = await getAccessibleCustomEmails(userId);
    const hasAccess = accessibleEmails.some(e => e._id.toString() === email.customEmailId.toString());

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this email'
      });
    }

    email.status = 'read';
    email.readAt = new Date();
    await email.save();

    res.status(200).json({
      success: true,
      message: 'Email marked as read'
    });

  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking email as read',
      error: error.message
    });
  }
};

// Star/Unstar email
const toggleStar = async (req, res) => {
  try {
    const userId = req.userId;
    const { emailId } = req.params;

    const email = await Email.findOne({ emailId });
    if (!email) {
      return res.status(404).json({
        success: false,
        message: 'Email not found'
      });
    }

    const accessibleEmails = await getAccessibleCustomEmails(userId);
    const hasAccess = accessibleEmails.some(e => e._id.toString() === email.customEmailId.toString());

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this email'
      });
    }

    email.isStarred = !email.isStarred;
    await email.save();

    res.status(200).json({
      success: true,
      message: email.isStarred ? 'Email starred' : 'Email unstarred',
      data: { isStarred: email.isStarred }
    });

  } catch (error) {
    console.error('Toggle star error:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling star',
      error: error.message
    });
  }
};

// Archive/Unarchive email
const toggleArchive = async (req, res) => {
  try {
    const userId = req.userId;
    const { emailId } = req.params;

    const email = await Email.findOne({ emailId });
    if (!email) {
      return res.status(404).json({
        success: false,
        message: 'Email not found'
      });
    }

    const accessibleEmails = await getAccessibleCustomEmails(userId);
    const hasAccess = accessibleEmails.some(e => e._id.toString() === email.customEmailId.toString());

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this email'
      });
    }

    email.isArchived = !email.isArchived;
    await email.save();

    res.status(200).json({
      success: true,
      message: email.isArchived ? 'Email archived' : 'Email unarchived',
      data: { isArchived: email.isArchived }
    });

  } catch (error) {
    console.error('Toggle archive error:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling archive',
      error: error.message
    });
  }
};

// Delete email (move to trash)
const deleteEmail = async (req, res) => {
  try {
    const userId = req.userId;
    const { emailId } = req.params;

    const email = await Email.findOne({ emailId });
    if (!email) {
      return res.status(404).json({
        success: false,
        message: 'Email not found'
      });
    }

    const accessibleEmails = await getAccessibleCustomEmails(userId);
    const hasAccess = accessibleEmails.some(e => e._id.toString() === email.customEmailId.toString());

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this email'
      });
    }

    email.isTrashed = true;
    await email.save();

    res.status(200).json({
      success: true,
      message: 'Email moved to trash'
    });

  } catch (error) {
    console.error('Delete email error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting email',
      error: error.message
    });
  }
};

// Get email stats
const getEmailStats = async (req, res) => {
  try {
    const userId = req.userId;

    const customEmails = await getAccessibleCustomEmails(userId);
    const customEmailIds = customEmails.map(e => e._id);

    const totalSent = await Email.countDocuments({ 
      customEmailId: { $in: customEmailIds },
      direction: 'sent', 
      isTrashed: false 
    });
    
    const totalReceived = await Email.countDocuments({ 
      customEmailId: { $in: customEmailIds },
      direction: 'received', 
      isTrashed: false 
    });
    
    const unread = await Email.countDocuments({ 
      customEmailId: { $in: customEmailIds },
      direction: 'received', 
      status: 'received', 
      isTrashed: false 
    });
    
    const starred = await Email.countDocuments({ 
      customEmailId: { $in: customEmailIds },
      isStarred: true, 
      isTrashed: false 
    });
    
    const customEmailsCount = customEmails.length;
    
    const user = await User.findById(userId);
    const domainsCount = user.resendConfigs.filter(c => c.isVerified && c.isActive).length;

    res.status(200).json({
      success: true,
      data: {
        totalSent,
        totalReceived,
        unread,
        starred,
        customEmailsCount,
        domainsCount
      }
    });

  } catch (error) {
    console.error('Get email stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching email stats',
      error: error.message
    });
  }
};

// Export all controllers at the bottom
export {
  addResendConfig,
  getResendConfigs,
  verifyDomainOwnership,
  createCustomEmail,
  inviteUserToDomain,
  acceptInvitation,
  getDomainAccessUsers,
  updateUserAccess,
  revokeUserAccess,
  getAccessibleDomains,
  sendEmail,
  receiveEmail,
  getCustomEmails,
  getInbox,
  getSentEmails,
  getEmailById,
  markAsRead,
  toggleStar,
  toggleArchive,
  deleteEmail,
  getEmailStats,
  notifyLoginAlert,
  notifyDomainVerified,
  notifyTeamInvite,
  notifyNewEmail
};