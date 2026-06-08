// controllers/email/teamController.js
import User from '../models/userModel.js';
import TeamAccess from '../models/teamAccessModel.js';
import CustomEmail from '../models/customEmailModel.js';
import { Resend } from 'resend';
import { v4 as uuidv4 } from 'uuid';

// ==================== HELPER FUNCTIONS ====================

// Generate random token
const generateToken = () => {
  return uuidv4() + Date.now();
};

// Send email notification
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

// Send push notification
const sendPushNotification = async (userId, title, body, data = {}) => {
  try {
    const user = await User.findById(userId);
    if (!user) return false;
    if (!user.notificationPreferences?.push?.enabled) return false;
    const pushTokens = user.pushTokens?.filter(t => t.isActive) || [];
    if (pushTokens.length === 0) return false;
    console.log(`Would send push notification to ${pushTokens.length} devices:`, { title, body, data });
    return true;
  } catch (error) {
    console.error('Send push notification error:', error);
    return false;
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

// Get permissions based on access level
const getPermissionsFromLevel = (accessLevel) => {
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

  return permissions;
};

// ==================== INVITATION MANAGEMENT ====================

/**
 * Invite user to access domain emails
 * POST /api/email/team/invite
 */
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

    const invitedUser = await User.findOne({ email: email.toLowerCase() });
    if (!invitedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email. They need to register first.'
      });
    }

    if (invitedUser._id.toString() === ownerId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot invite yourself'
      });
    }

    // Check if user already has access
    const existingAccess = await TeamAccess.findOne({
      resendConfigId,
      ownerId,
      userId: invitedUser._id,
      status: { $ne: 'revoked' }
    });

    if (existingAccess) {
      return res.status(400).json({
        success: false,
        message: 'User already has access to this domain',
        data: {
          status: existingAccess.status,
          accessLevel: existingAccess.accessLevel
        }
      });
    }

    const permissions = getPermissionsFromLevel(accessLevel);

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
            <hr />
            <p style="color: #666; font-size: 12px;">Nexa - Email Communication Reimagined</p>
          </div>
        `
      });
    } catch (emailError) {
      // Rollback if email fails
      await TeamAccess.findByIdAndDelete(teamAccess._id);
      return res.status(500).json({
        success: false,
        message: 'Failed to send invitation email. Please try again.',
        error: emailError.message
      });
    }

    await notifyTeamInvite(invitedUser._id, owner.name, resendConfig.domain, accessLevel);

    res.status(200).json({
      success: true,
      message: `Invitation sent to ${email} successfully`,
      data: { 
        invitationId: teamAccess._id,
        expiresIn: '7 days',
        accessLevel
      }
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

/**
 * Accept invitation
 * POST /api/email/team/accept/:token
 */
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

    // Notify the owner that invitation was accepted
    const owner = await User.findById(teamAccess.ownerId);
    const user = await User.findById(userId);
    
    if (owner && user) {
      await sendEmailNotification(
        owner.email,
        `Invitation Accepted: ${teamAccess.domain}`,
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7b3eff;">Invitation Accepted</h2>
            <p><strong>${user.name}</strong> has accepted your invitation to access <strong>${teamAccess.domain}</strong>.</p>
            <p>Access Level: <strong>${teamAccess.accessLevel}</strong></p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/team/access" style="background-color: #7b3eff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">Manage Team Access</a>
            </div>
            <hr />
            <p style="color: #666; font-size: 12px;">Nexa - Email Communication Reimagined</p>
          </div>
        `
      );
    }

    res.status(200).json({
      success: true,
      message: 'Invitation accepted successfully! You now have access to the domain emails.',
      data: {
        domain: teamAccess.domain,
        accessLevel: teamAccess.accessLevel
      }
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

/**
 * Decline invitation
 * DELETE /api/email/team/decline/:token
 */
const declineInvitation = async (req, res) => {
  try {
    const userId = req.userId;
    const { token } = req.params;

    const teamAccess = await TeamAccess.findOne({
      invitationToken: token,
      status: 'pending'
    });

    if (!teamAccess) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found'
      });
    }

    if (teamAccess.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'This invitation is not for you'
      });
    }

    teamAccess.status = 'declined';
    teamAccess.declinedAt = new Date();
    teamAccess.invitationToken = null;
    teamAccess.tokenExpiry = null;
    await teamAccess.save();

    res.status(200).json({
      success: true,
      message: 'Invitation declined'
    });

  } catch (error) {
    console.error('Decline invitation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error declining invitation',
      error: error.message
    });
  }
};

/**
 * Resend invitation
 * POST /api/email/team/resend-invite/:accessId
 */
const resendInvitation = async (req, res) => {
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
        message: 'You do not have permission to resend this invitation'
      });
    }

    if (teamAccess.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot resend invitation. Current status: ${teamAccess.status}`
      });
    }

    const owner = await User.findById(ownerId);
    const invitedUser = await User.findById(teamAccess.userId);
    const resendConfig = owner.resendConfigs.find(
      c => c.id === teamAccess.resendConfigId || c._id?.toString() === teamAccess.resendConfigId?.toString()
    );

    if (!resendConfig) {
      return res.status(404).json({
        success: false,
        message: 'Resend configuration not found'
      });
    }

    // Generate new token
    const newToken = generateToken();
    const newExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    
    teamAccess.invitationToken = newToken;
    teamAccess.tokenExpiry = newExpiry;
    await teamAccess.save();

    const resend = new Resend(resendConfig.apiKey);
    const acceptLink = `${process.env.FRONTEND_URL}/accept-invitation/${newToken}`;

    await resend.emails.send({
      from: `notifications@${resendConfig.domain}`,
      to: invitedUser.email,
      subject: `Reminder: Invitation to access ${resendConfig.domain} emails on Nexa`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7b3eff;">Domain Access Invitation (Reminder)</h2>
          <p>Hello ${invitedUser.name},</p>
          <p><strong>${owner.name}</strong> has invited you to access emails for domain <strong>${resendConfig.domain}</strong>.</p>
          <p>Access Level: <strong>${teamAccess.accessLevel}</strong></p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${acceptLink}" style="background-color: #7b3eff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">
              Accept Invitation
            </a>
          </div>
          <p>This invitation expires in 7 days.</p>
          <hr />
          <p style="color: #666; font-size: 12px;">Nexa - Email Communication Reimagined</p>
        </div>
      `
    });

    res.status(200).json({
      success: true,
      message: 'Invitation resent successfully',
      data: {
        expiresIn: '7 days'
      }
    });

  } catch (error) {
    console.error('Resend invitation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resending invitation',
      error: error.message
    });
  }
};

// ==================== ACCESS MANAGEMENT ====================

/**
 * Get all users with access to a domain
 * GET /api/email/team/access/:resendConfigId
 */
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
      status: { $ne: 'revoked' }
    }).populate('userId', 'name email profilePicture createdAt');

    // Get custom emails for this domain
    const customEmails = await CustomEmail.find({
      resendConfigId,
      isActive: true
    }).select('_id email displayName');

    res.status(200).json({
      success: true,
      data: {
        domain: resendConfig.domain,
        customEmails,
        users: accessList.map(access => ({
          id: access._id,
          user: access.userId,
          accessLevel: access.accessLevel,
          permissions: access.permissions,
          accessibleEmails: access.accessibleEmails,
          status: access.status,
          invitedAt: access.createdAt,
          acceptedAt: access.acceptedAt,
          invitedBy: access.invitedBy
        }))
      }
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

/**
 * Update user access level
 * PUT /api/email/team/access/:accessId
 */
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

    if (teamAccess.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: `Cannot update access. Current status: ${teamAccess.status}`
      });
    }

    const permissions = getPermissionsFromLevel(accessLevel);

    teamAccess.accessLevel = accessLevel;
    teamAccess.permissions = permissions;
    if (customEmailIds) {
      teamAccess.accessibleEmails = customEmailIds;
    }
    teamAccess.updatedAt = new Date();
    await teamAccess.save();

    // Notify user about access level change
    const user = await User.findById(teamAccess.userId);
    const owner = await User.findById(ownerId);
    
    if (user && owner) {
      await sendEmailNotification(
        user.email,
        `Access Level Updated: ${teamAccess.domain}`,
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7b3eff;">Access Level Updated</h2>
            <p>Hello ${user.name},</p>
            <p>Your access level for domain <strong>${teamAccess.domain}</strong> has been updated.</p>
            <p>New Access Level: <strong>${accessLevel}</strong></p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/dashboard" style="background-color: #7b3eff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">View Dashboard</a>
            </div>
            <hr />
            <p style="color: #666; font-size: 12px;">Nexa - Email Communication Reimagined</p>
          </div>
        `
      );
    }

    res.status(200).json({
      success: true,
      message: 'User access updated successfully',
      data: {
        userId: teamAccess.userId,
        accessLevel: teamAccess.accessLevel,
        permissions: teamAccess.permissions
      }
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

/**
 * Revoke user access
 * DELETE /api/email/team/access/:accessId
 */
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

    // Notify user about access revocation
    const user = await User.findById(teamAccess.userId);
    const owner = await User.findById(ownerId);
    
    if (user && owner) {
      await sendEmailNotification(
        user.email,
        `Access Revoked: ${teamAccess.domain}`,
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7b3eff;">Access Revoked</h2>
            <p>Hello ${user.name},</p>
            <p>Your access to domain <strong>${teamAccess.domain}</strong> has been revoked by ${owner.name}.</p>
            <p>You no longer have access to emails or resources for this domain.</p>
            <hr />
            <p style="color: #666; font-size: 12px;">Nexa - Email Communication Reimagined</p>
          </div>
        `
      );
    }

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

// ==================== USER'S ACCESSIBLE DOMAINS ====================

/**
 * Get domains user has access to (as a team member)
 * GET /api/email/team/my-domains
 */
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
      
      // Get accessible custom emails for this domain
      let accessibleEmails = [];
      if (access.accessibleEmails && access.accessibleEmails.length > 0) {
        accessibleEmails = await CustomEmail.find({
          _id: { $in: access.accessibleEmails },
          isActive: true
        }).select('email displayName profilePicture');
      } else if (access.permissions.canViewEmails) {
        accessibleEmails = await CustomEmail.find({
          resendConfigId: access.resendConfigId,
          isActive: true
        }).select('email displayName profilePicture');
      }
      
      return {
        id: access._id,
        domain: access.domain,
        resendConfigId: access.resendConfigId,
        accessLevel: access.accessLevel,
        permissions: access.permissions,
        accessibleEmails,
        owner: {
          id: owner._id,
          name: owner.name,
          email: owner.email,
          profilePicture: owner.profilePicture
        },
        acceptedAt: access.acceptedAt
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

/**
 * Get pending invitations for current user
 * GET /api/email/team/pending-invites
 */
const getPendingInvitations = async (req, res) => {
  try {
    const userId = req.userId;

    const pendingInvites = await TeamAccess.find({
      userId,
      status: 'pending',
      tokenExpiry: { $gt: new Date() }
    }).populate('ownerId', 'name email profilePicture');

    const invites = pendingInvites.map(invite => ({
      id: invite._id,
      domain: invite.domain,
      accessLevel: invite.accessLevel,
      invitedBy: invite.ownerId,
      invitedAt: invite.createdAt,
      expiresAt: invite.tokenExpiry
    }));

    res.status(200).json({
      success: true,
      data: invites
    });

  } catch (error) {
    console.error('Get pending invitations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending invitations',
      error: error.message
    });
  }
};

/**
 * Get team members for a domain (for team members with manage access)
 * GET /api/email/team/members/:resendConfigId
 */
const getTeamMembers = async (req, res) => {
  try {
    const userId = req.userId;
    const { resendConfigId } = req.params;

    // Check if user has access to this domain
    const teamAccess = await TeamAccess.findOne({
      userId,
      resendConfigId,
      status: 'active',
      'permissions.canManageAccess': true
    });

    if (!teamAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view team members for this domain'
      });
    }

    // Get all team members for this domain
    const members = await TeamAccess.find({
      resendConfigId,
      ownerId: teamAccess.ownerId,
      status: 'active'
    }).populate('userId', 'name email profilePicture');

    const owner = await User.findById(teamAccess.ownerId);

    res.status(200).json({
      success: true,
      data: {
        domain: teamAccess.domain,
        owner: {
          id: owner._id,
          name: owner.name,
          email: owner.email
        },
        members: members.map(member => ({
          id: member._id,
          user: member.userId,
          accessLevel: member.accessLevel,
          permissions: member.permissions,
          acceptedAt: member.acceptedAt
        }))
      }
    });

  } catch (error) {
    console.error('Get team members error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching team members',
      error: error.message
    });
  }
};

// ==================== EXPORTS ====================

export {
  // Invitation management
  inviteUserToDomain,
  acceptInvitation,
  declineInvitation,
  resendInvitation,
  
  // Access management
  getDomainAccessUsers,
  updateUserAccess,
  revokeUserAccess,
  
  // User queries
  getAccessibleDomains,
  getPendingInvitations,
  getTeamMembers
};