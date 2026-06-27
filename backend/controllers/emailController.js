// controllers/email/emailController.js
import User from '../models/userModel.js';
import CustomEmail from '../models/customEmailModel.js';
import Email from '../models/emailModel.js';
import TeamAccess from '../models/teamAccessModel.js';
import { Resend } from 'resend';
import { v4 as uuidv4 } from 'uuid';
import { Webhook } from 'svix';
import { notifyNewEmail} from './notificationsController.js';
import { v2 as cloudinary } from 'cloudinary';

// ==================== HELPER FUNCTIONS ====================

// Generate random token
const generateToken = () => {
  return uuidv4() + Date.now();
};

// Helper function to get accessible custom emails for a user
const getAccessibleCustomEmails = async (userId) => {
  const ownEmails = await CustomEmail.find({ userId, isActive: true });

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
      const emails = await CustomEmail.find({
        resendConfigId: access.resendConfigId,
        isActive: true
      });
      accessibleEmails.push(...emails);
    }
  }

  const allEmails = [...ownEmails, ...accessibleEmails];
  return allEmails.filter((email, index, self) => 
    index === self.findIndex(e => e._id.toString() === email._id.toString())
  );
};

// Send email notification (simplified version)
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

// // Notify user about new email
// const notifyNewEmail = async (userId, emailData) => {
//   try {
//     const user = await User.findById(userId);
//     if (!user) return;

//     if (user.notificationPreferences?.email?.newEmail) {
//       await sendEmailNotification(
//         user.email,
//         `New Email: ${emailData.subject}`,
//         `
//           <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//             <h2 style="color: #7b3eff;">New Email Received</h2>
//             <p><strong>From:</strong> ${emailData.from}</p>
//             <p><strong>Subject:</strong> ${emailData.subject}</p>
//             <p><strong>Preview:</strong> ${emailData.preview}</p>
//             <div style="text-align: center; margin: 30px 0;">
//               <a href="${process.env.FRONTEND_URL}/inbox" style="background-color: #7b3eff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">View in Inbox</a>
//             </div>
//             <hr />
//             <p style="color: #666; font-size: 12px;">Nexa - Email Communication Reimagined</p>
//           </div>
//         `
//       );
//     }

//     // Push notification would go here
//     if (user.notificationPreferences?.push?.newEmail) {
//       console.log('Would send push notification for new email');
//     }
//   } catch (error) {
//     console.error('Notify new email error:', error);
//   }
// };

// ==================== SEND EMAIL ====================

/**
 * Send email from custom email address
 * POST /api/email/send
 */
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

    const customEmail = await CustomEmail.findOne({ _id: customEmailId, isActive: true });
    if (!customEmail) {
      return res.status(404).json({
        success: false,
        message: 'Custom email not found'
      });
    }

    let resendConfig = null;
    let hasPermission = false;

    // Check if user owns this email
    if (customEmail.userId.toString() === userId.toString()) {
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
    
    // Parse to array - handle both string and array formats
    let toArray = [];
    if (typeof to === 'string') {
      toArray = to.split(',').map(email => email.trim()).filter(email => email);
    } else if (Array.isArray(to)) {
      toArray = to;
    }
    
    // Parse cc if present
    let ccArray = [];
    if (cc) {
      if (typeof cc === 'string') {
        ccArray = cc.split(',').map(email => email.trim()).filter(email => email);
      } else if (Array.isArray(cc)) {
        ccArray = cc;
      }
    }
    
    // Parse bcc if present
    let bccArray = [];
    if (bcc) {
      if (typeof bcc === 'string') {
        bccArray = bcc.split(',').map(email => email.trim()).filter(email => email);
      } else if (Array.isArray(bcc)) {
        bccArray = bcc;
      }
    }

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

    // Add reply-to if it's a reply
    if (replyToEmailId) {
      const replyToEmail = await Email.findOne({ emailId: replyToEmailId });
      if (replyToEmail) {
        emailData.replyTo = replyToEmail.from.email;
        emailData.inReplyTo = replyToEmailId;
      }
    }

    // Add cc and bcc only if they have values
    if (ccArray.length > 0) emailData.cc = ccArray;
    if (bccArray.length > 0) emailData.bcc = bccArray;

    console.log('📧 Sending email with:', {
      from: fromAddress,
      to: toArray,
      cc: ccArray,
      bcc: bccArray,
      subject
    });

    const { data, error } = await resend.emails.send(emailData);

    if (error) {
      console.error('❌ Resend error:', error);
      return res.status(400).json({
        success: false,
        message: 'Failed to send email',
        error: error.message
      });
    }

    // Save sent email to database
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
      cc: ccArray.map(c => ({ email: c, name: null })),
      bcc: bccArray.map(b => ({ email: b, name: null })),
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

    // Update original email if this is a reply
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

// ==================== RECEIVE EMAIL (WEBHOOK) ====================

/**
 * Receive email (webhook from Resend)
 * POST /api/email/webhook/receive
 */
// In your emailController.js

/**
 * Receive email (webhook from Resend)
 * POST /api/email/webhook/receive
 */
const receiveEmail = async (req, res) => {
  try {
    console.log('📩 Webhook received, raw body:', JSON.stringify(req.body, null, 2));

    const payload = req.body;
    const emailPayload = payload.data || payload;
    const { to, from, subject, email_id } = emailPayload;

    const toEmail = Array.isArray(to) ? to[0] : to;

    if (!toEmail) {
      return res.status(400).json({
        success: false,
        message: 'No recipient email found in webhook payload'
      });
    }

    // ... (find customEmail, user, resendConfig – same as before) ...

    // ========== FETCH FULL EMAIL ==========
    let emailHtml = '';
    let emailText = '';
    let attachments = emailPayload.attachments || [];

    if (email_id) {
      const resend = new Resend(resendConfig.apiKey);
      try {
        const { data: emailData, error: fetchError } = await resend.emails.receiving.get(email_id);
        if (!fetchError && emailData) {
          emailHtml = emailData.html || '';
          emailText = emailData.text || '';
          console.log('📧 Resend API emailData:', JSON.stringify(emailData, null, 2));
          if (emailData.attachments && emailData.attachments.length > 0) {
            attachments = emailData.attachments;
            console.log(`📎 Found ${attachments.length} attachments from API.`);
          } else {
            console.warn('⚠️ No attachments from Resend API.');
          }
        } else {
          console.error('Failed to fetch email content:', fetchError);
        }
      } catch (fetchError) {
        console.error('Error fetching email from Resend:', fetchError);
      }
    }

    // If still no attachments, try to extract data URIs from HTML (inline files)
    if (attachments.length === 0 && emailHtml) {
      // Extract all src="data:..." from HTML
      const dataUriRegex = /src="(data:[^"]+)"/gi;
      let match;
      const dataUris = [];
      while ((match = dataUriRegex.exec(emailHtml)) !== null) {
        dataUris.push(match[1]);
      }
      if (dataUris.length > 0) {
        console.log(`📎 Extracted ${dataUris.length} inline data URIs from HTML.`);
        // Create pseudo-attachments for each data URI
        dataUris.forEach((uri, index) => {
          const mimeMatch = uri.match(/^data:([^;]+);/);
          const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
          attachments.push({
            filename: `inline-${index + 1}.${mimeType.split('/')[1] || 'bin'}`,
            mimetype: mimeType,
            content: uri,
            size: uri.length,
            cid: null,
          });
        });
      }
    }

    // ========== PROCESS ATTACHMENTS ==========
    const processedAttachments = [];

    for (const attachment of attachments) {
      const filename = attachment.filename || attachment.name || 'file';
      const mimeType = attachment.mimetype || attachment.type || 'application/octet-stream';
      const size = attachment.size || attachment.fileSize || 0;
      const cid = attachment.cid || null;

      let url = attachment.url || null;
      let publicId = null;

      if (!url && attachment.content) {
        try {
          let base64Data = attachment.content;
          if (base64Data.includes(';base64,')) {
            base64Data = base64Data.split(';base64,')[1];
          }

          // Try Cloudinary upload
          let resourceType = 'auto';
          if (mimeType.startsWith('image/')) resourceType = 'image';
          else if (mimeType.startsWith('video/')) resourceType = 'video';
          else resourceType = 'raw';

          const uploadResult = await cloudinary.uploader.upload(
            `data:${mimeType};base64,${base64Data}`,
            {
              folder: 'nexa_email_attachments',
              resource_type: resourceType,
              public_id: `${Date.now()}-${filename.replace(/\.[^.]+$/, '')}`,
            }
          );
          url = uploadResult.secure_url;
          publicId = uploadResult.public_id;
          console.log(`✅ Uploaded attachment: ${filename}`);
        } catch (uploadError) {
          console.error(`Failed to upload ${filename}, using data URI.`, uploadError);
          url = `data:${mimeType};base64,${attachment.content}`;
        }
      }

      if (url) {
        processedAttachments.push({
          filename,
          originalName: filename,
          url,
          publicId,
          fileSize: size,
          mimeType,
          cid,
        });
      } else {
        console.warn(`Skipping attachment "${filename}" – no URL or content.`);
      }
    }

    // ========== SAVE EMAIL ==========
    const emailUuid = uuidv4();
    const receivedEmail = new Email({
      userId: user._id,
      customEmailId: customEmail._id,
      direction: 'received',
      emailId: emailUuid,
      from: {
        email: typeof from === 'object' ? from.email : from,
        name: typeof from === 'object' ? from.name : null
      },
      to: [{ email: toEmail, name: null }],
      subject: subject || '(No Subject)',
      content: emailHtml || emailText || '',
      contentType: emailHtml ? 'html' : 'text',
      attachments: processedAttachments,
      status: 'received',
      receivedAt: new Date(),
      webhookData: req.body,
      resendEmailId: email_id
    });

    await receivedEmail.save();

    // ... (rest: notifications, forwarding) ...

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

// ==================== CUSTOM EMAIL MANAGEMENT ====================

/**
 * Create custom email address
 * POST /api/email/custom/create
 */
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

    let resendConfig = null;
    let isOwner = true;
    let ownerId = userId;

    // Check if user owns this config
    resendConfig = user.resendConfigs.find(
      c => (c.id === resendConfigId || c._id?.toString() === resendConfigId?.toString()) 
      && c.isVerified 
      && c.isActive
    );

    // If not, check team access
    if (!resendConfig) {
      const teamAccess = await TeamAccess.findOne({
        userId,
        resendConfigId,
        status: 'active',
        'permissions.canCreateCustomEmails': true
      });

      if (teamAccess) {
        const owner = await User.findById(teamAccess.ownerId);
        resendConfig = owner.resendConfigs.find(
          c => c.id === resendConfigId || c._id?.toString() === resendConfigId?.toString()
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

    // Handle profile picture if uploaded
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

    // If this is default, unset other defaults
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

    // Send welcome email
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
            <p>To receive webhooks, configure your webhook secret in the Nexa dashboard.</p>
            <p>Webhook URL: ${process.env.API_URL || process.env.BACKEND_URL}/api/email/webhook/receive</p>
            <hr />
            <p style="color: #666; font-size: 12px;">Nexa - Email Communication Reimagined</p>
          </div>
        `
      });
    } catch (emailError) {
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

/**
 * Get all custom emails for user
 * GET /api/email/custom/list
 */
const getCustomEmails = async (req, res) => {
  try {
    const userId = req.userId;
    const { resendConfigId } = req.query;

    let query = { isActive: true };
    if (resendConfigId) {
      query.resendConfigId = resendConfigId;
    }

    // Get user's own emails
    const ownEmails = await CustomEmail.find({ ...query, userId })
      .sort({ isDefault: -1, createdAt: -1 });

    // Get team accessible emails
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

    // Get domains for reference
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

/**
 * Update custom email
 * PUT /api/email/custom/:emailId
 */
const updateCustomEmail = async (req, res) => {
  try {
    const userId = req.userId;
    const { emailId } = req.params;
    const { displayName, signature, forwardToEmail, isDefault } = req.body;

    const customEmail = await CustomEmail.findById(emailId);
    if (!customEmail) {
      return res.status(404).json({
        success: false,
        message: 'Custom email not found'
      });
    }

    // Check permission
    const hasAccess = customEmail.userId.toString() === userId.toString();
    if (!hasAccess) {
      const teamAccess = await TeamAccess.findOne({
        userId,
        resendConfigId: customEmail.resendConfigId,
        status: 'active',
        'permissions.canCreateCustomEmails': true
      });
      
      if (!teamAccess) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to update this email'
        });
      }
    }

    // Update fields
    if (displayName) customEmail.displayName = displayName;
    if (signature !== undefined) customEmail.signature = signature;
    if (forwardToEmail) customEmail.forwardToEmail = forwardToEmail;
    
    if (isDefault !== undefined) {
      if (isDefault) {
        await CustomEmail.updateMany(
          { userId: customEmail.userId, isDefault: true },
          { isDefault: false }
        );
        customEmail.isDefault = true;
      } else {
        customEmail.isDefault = false;
      }
    }

    // Handle profile picture update
    if (req.file) {
      customEmail.profilePicture = {
        url: req.file.path,
        publicId: req.file.filename,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype
      };
    }

    await customEmail.save();

    res.status(200).json({
      success: true,
      message: 'Custom email updated successfully',
      data: customEmail
    });

  } catch (error) {
    console.error('Update custom email error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating custom email',
      error: error.message
    });
  }
};

/**
 * Delete custom email (soft delete)
 * DELETE /api/email/custom/:emailId
 */
const deleteCustomEmail = async (req, res) => {
  try {
    const userId = req.userId;
    const { emailId } = req.params;

    const customEmail = await CustomEmail.findById(emailId);
    if (!customEmail) {
      return res.status(404).json({
        success: false,
        message: 'Custom email not found'
      });
    }

    // Check permission
    const hasAccess = customEmail.userId.toString() === userId.toString();
    if (!hasAccess) {
      const teamAccess = await TeamAccess.findOne({
        userId,
        resendConfigId: customEmail.resendConfigId,
        status: 'active',
        'permissions.canDeleteCustomEmails': true
      });
      
      if (!teamAccess) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to delete this email'
        });
      }
    }

    customEmail.isActive = false;
    customEmail.deletedAt = new Date();
    await customEmail.save();

    res.status(200).json({
      success: true,
      message: 'Custom email deleted successfully'
    });

  } catch (error) {
    console.error('Delete custom email error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting custom email',
      error: error.message
    });
  }
};

// ==================== INBOX & EMAIL RETRIEVAL ====================

/**
 * Get all emails (inbox)
 * GET /api/email/inbox
 */
const getInbox = async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 20, folder = 'inbox' } = req.query;

    const customEmails = await getAccessibleCustomEmails(userId);
    const customEmailIds = customEmails.map(e => e._id);

    let query = { 
      customEmailId: { $in: customEmailIds },
      direction: 'received',
      isTrashed: false 
    };
    
    if (folder === 'starred') {
      query.isStarred = true;
      query.isTrashed = false;
    } else if (folder === 'archived') {
      query.isArchived = true;
      query.isTrashed = false;
    } else if (folder === 'inbox') {
      query.isArchived = false;
      query.isTrashed = false;
    } else if (folder === 'trash') {
      query = { 
        customEmailId: { $in: customEmailIds },
        direction: 'received',
        isTrashed: true
      };
    }

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

/**
 * Get sent emails
 * GET /api/email/sent
 */
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

/**
 * Get single email by ID
 * GET /api/email/:emailId
 */
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

    const accessibleEmails = await getAccessibleCustomEmails(userId);
    const hasAccess = accessibleEmails.some(e => e._id.toString() === email.customEmailId._id.toString());

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this email'
      });
    }

    // Mark as read if it's a received email and not read yet
    if (email.direction === 'received' && !email.isRead) {
      email.isRead = true;
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

/**
 * Get email stats
 * GET /api/email/stats
 */
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

// ==================== EXPORTS ====================

export {
  // Send/Receive
  sendEmail,
  receiveEmail,
  
  // Custom email management
  createCustomEmail,
  getCustomEmails,
  updateCustomEmail,
  deleteCustomEmail,
  
  // Email retrieval
  getInbox,
  getSentEmails,
  getEmailById,
  getEmailStats
};