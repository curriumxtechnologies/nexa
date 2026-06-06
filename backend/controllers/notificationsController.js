import User from '../models/userModel.js';
import webpush from 'web-push';
import admin from 'firebase-admin';
import { Resend } from 'resend'; // ✅ add this

// Configure web push
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Configure Firebase (for mobile)
if (process.env.FIREBASE_PRIVATE_KEY) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });
}

// Get notification preferences
const getNotificationPreferences = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select('notificationPreferences');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const preferences = user.notificationPreferences || {
      email: {
        newEmail: true,
        loginAlerts: true,
        domainVerified: true,
        teamInvites: true,
        marketing: false
      },
      push: {
        enabled: false,
        newEmail: true,
        loginAlerts: true,
        domainVerified: false,
        teamInvites: true
      }
    };

    res.status(200).json({
      success: true,
      data: preferences
    });

  } catch (error) {
    console.error('Get notification preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notification preferences',
      error: error.message
    });
  }
};

// Update email notification preferences
const updateEmailNotifications = async (req, res) => {
  try {
    const userId = req.userId;
    const { newEmail, loginAlerts, domainVerified, teamInvites, marketing } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.notificationPreferences) {
      user.notificationPreferences = {};
    }
    if (!user.notificationPreferences.email) {
      user.notificationPreferences.email = {};
    }

    user.notificationPreferences.email = {
      newEmail: newEmail !== undefined ? newEmail : user.notificationPreferences.email.newEmail ?? true,
      loginAlerts: loginAlerts !== undefined ? loginAlerts : user.notificationPreferences.email.loginAlerts ?? true,
      domainVerified: domainVerified !== undefined ? domainVerified : user.notificationPreferences.email.domainVerified ?? true,
      teamInvites: teamInvites !== undefined ? teamInvites : user.notificationPreferences.email.teamInvites ?? true,
      marketing: marketing !== undefined ? marketing : user.notificationPreferences.email.marketing ?? false
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email notification preferences updated',
      data: user.notificationPreferences.email
    });

  } catch (error) {
    console.error('Update email notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating email notifications',
      error: error.message
    });
  }
};

// Update push notification preferences
const updatePushNotifications = async (req, res) => {
  try {
    const userId = req.userId;
    const { enabled, newEmail, loginAlerts, domainVerified, teamInvites } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.notificationPreferences) {
      user.notificationPreferences = {};
    }
    if (!user.notificationPreferences.push) {
      user.notificationPreferences.push = {};
    }

    user.notificationPreferences.push = {
      enabled: enabled !== undefined ? enabled : user.notificationPreferences.push.enabled ?? false,
      newEmail: newEmail !== undefined ? newEmail : user.notificationPreferences.push.newEmail ?? true,
      loginAlerts: loginAlerts !== undefined ? loginAlerts : user.notificationPreferences.push.loginAlerts ?? true,
      domainVerified: domainVerified !== undefined ? domainVerified : user.notificationPreferences.push.domainVerified ?? false,
      teamInvites: teamInvites !== undefined ? teamInvites : user.notificationPreferences.push.teamInvites ?? true
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Push notification preferences updated',
      data: user.notificationPreferences.push
    });

  } catch (error) {
    console.error('Update push notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating push notifications',
      error: error.message
    });
  }
};

// Register push subscription (for web)
const registerPushSubscription = async (req, res) => {
  try {
    const userId = req.userId;
    const { subscription, deviceType } = req.body;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({
        success: false,
        message: 'Valid push subscription with endpoint is required',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!user.pushTokens) {
      user.pushTokens = [];
    }

    // Check if subscription already exists
    const existingIndex = user.pushTokens.findIndex(
      (t) => t.token === subscription.endpoint
    );

    const tokenData = {
      token: subscription.endpoint,
      deviceType: deviceType || 'web',
      subscription: subscription, // Store the full subscription object
      isActive: true,
      lastUsed: new Date(),
    };

    if (existingIndex >= 0) {
      user.pushTokens[existingIndex] = {
        ...user.pushTokens[existingIndex],
        ...tokenData,
      };
    } else {
      user.pushTokens.push({
        ...tokenData,
        createdAt: new Date(),
      });
    }

    // Enable push notifications in preferences
    if (!user.notificationPreferences) {
      user.notificationPreferences = {};
    }
    if (!user.notificationPreferences.push) {
      user.notificationPreferences.push = {};
    }
    user.notificationPreferences.push.enabled = true;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Push subscription registered successfully',
    });
  } catch (error) {
    console.error('Register push subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering push subscription',
      error: error.message,
    });
  }
};

// Send push notification to user
const sendPushNotification = async (userId, title, body, data = {}) => {
  try {
    const user = await User.findById(userId);
    if (!user) return false;

    // Check if push notifications are enabled
    if (!user.notificationPreferences?.push?.enabled) return false;

    const pushTokens = user.pushTokens?.filter(t => t.isActive) || [];
    
    if (pushTokens.length === 0) return false;

    let sentCount = 0;

    for (const token of pushTokens) {
      try {
        if (token.deviceType === 'web' && token.subscription) {
          // Web push
          await webpush.sendNotification(
            token.subscription,
            JSON.stringify({
              title,
              body,
              icon: '/nexa-icon.png',
              badge: '/nexa-icon.png',
              data,
              vibrate: [200, 100, 200],
              requireInteraction: true
            })
          );
          sentCount++;
        } else if (token.deviceType === 'ios' || token.deviceType === 'android') {
          // Mobile push via Firebase
          if (admin.apps.length) {
            const message = {
              notification: {
                title,
                body,
              },
              data: data,
              token: token.token,
            };
            await admin.messaging().send(message);
            sentCount++;
          }
        }
      } catch (error) {
        console.error(`Failed to send to ${token.deviceType}:`, error);
        // If token is invalid, mark as inactive
        if (error.statusCode === 410 || error.statusCode === 404) {
          token.isActive = false;
          await user.save();
        }
      }
    }

    return sentCount > 0;

  } catch (error) {
    console.error('Send push notification error:', error);
    return false;
  }
};

// Send test push notification
const sendTestPush = async (req, res) => {
  try {
    const userId = req.userId;
    const success = await sendPushNotification(
      userId,
      'Test Notification',
      'This is a test push notification from Nexa!',
      { type: 'test', timestamp: Date.now().toString() }
    );

    if (success) {
      res.status(200).json({
        success: true,
        message: 'Test push notification sent'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'No active push subscriptions found. Please enable push notifications first.'
      });
    }

  } catch (error) {
    console.error('Send test push error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending test push',
      error: error.message
    });
  }
};

// Get VAPID public key (for web push setup)
const getVapidPublicKey = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        publicKey: process.env.VAPID_PUBLIC_KEY
      }
    });
  } catch (error) {
    console.error('Get VAPID key error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting VAPID public key',
      error: error.message
    });
  }
};

// Send email notification (using Resend)
const sendEmailNotification = async (to, subject, html) => {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY); // ✅ now works
    
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

// Trigger notification on new email
const notifyNewEmail = async (userId, emailData) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    // Check email notification preference
    if (user.notificationPreferences?.email?.newEmail) {
      await sendEmailNotification(
        user.email,
        `New Email: ${emailData.subject}`,
        `
          <h2>New Email Received</h2>
          <p><strong>From:</strong> ${emailData.from}</p>
          <p><strong>Subject:</strong> ${emailData.subject}</p>
          <p><strong>Preview:</strong> ${emailData.preview}</p>
          <a href="${process.env.FRONTEND_URL}/inbox">View in Inbox</a>
        `
      );
    }

    // Check push notification preference
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

// Send test email notification
const sendTestEmail = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    
    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Test Notification from Nexa',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7b3eff;">Test Notification</h2>
          <p>Hello ${user.name},</p>
          <p>This is a test notification to confirm your email notifications are working correctly.</p>
          <p>You received this because you requested a test notification.</p>
          <hr />
          <p style="color: #666; font-size: 12px;">Nexa - Email Communication Reimagined</p>
        </div>
      `
    });

    res.status(200).json({
      success: true,
      message: 'Test email sent successfully'
    });

  } catch (error) {
    console.error('Send test email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message
    });
  }
};

// Export all controllers
export {
  getNotificationPreferences,
  updateEmailNotifications,
  updatePushNotifications,
  registerPushSubscription,
  sendTestPush,
  getVapidPublicKey,
  sendPushNotification,
  sendEmailNotification,
  notifyNewEmail,
  sendTestEmail,
};