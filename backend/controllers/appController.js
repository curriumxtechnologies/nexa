import AppVersion from '../models/appVersionModel.js';
import User from '../models/userModel.js';
import https from 'https';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import admin from 'firebase-admin'; // Add Firebase Admin SDK

// Initialize Firebase Admin (if not already initialized elsewhere)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

// ============= NEW: Push notification helper =============

/**
 * Send a push notification to all users with a valid FCM token
 * @param {Object} versionData - { version, isRequired, releaseNotes, _id }
 */
const sendAppUpdatePushNotification = async (versionData) => {
  try {
    // Fetch all users that have push tokens
    const users = await User.find({ 
      pushTokens: { $exists: true, $ne: [] } 
    }).select('pushTokens');

    if (!users.length) {
      console.log('📭 No users with push tokens found');
      return;
    }

    // Flatten all tokens (assuming each user has an array of tokens)
    const tokens = users.flatMap(user => user.pushTokens).filter(Boolean);

    if (!tokens.length) {
      console.log('📭 No valid push tokens found');
      return;
    }

    const payload = {
      data: {
        type: 'APP_UPDATE',
        version: versionData.version || '',
        isRequired: String(versionData.isRequired || false),
        versionId: versionData._id || '',
        releaseNotes: versionData.releaseNotes || '',
        timestamp: Date.now().toString(),
      },
      android: {
        priority: 'high',
        ttl: 3600 * 1000, // 1 hour
      },
      apns: {
        headers: {
          'apns-priority': '10',
        },
        payload: {
          aps: {
            'content-available': 1,
            sound: 'default',
          },
        },
      },
      tokens: tokens,
    };

    // Send multicast
    const response = await admin.messaging().sendEachForMulticast(payload);
    console.log(`📨 Push sent: ${response.successCount} succeeded, ${response.failureCount} failed`);

    // Log failures for debugging
    if (response.failureCount > 0) {
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(tokens[idx]);
          console.error(`❌ Push failure for token ${tokens[idx]}:`, resp.error);
        }
      });
      // Optionally clean up invalid tokens from the database
      // (you can implement a cleanup function here)
    }
  } catch (error) {
    console.error('❌ Failed to send push notification:', error);
  }
};

/**
 * Broadcast an app update to all users (to be called after a new version is uploaded)
 * @param {string} versionId - The ID of the new version
 */
const broadcastAppUpdate = async (versionId) => {
  try {
    const version = await AppVersion.findById(versionId);
    if (!version) {
      console.error(`❌ Version ${versionId} not found for push broadcast`);
      return;
    }

    await sendAppUpdatePushNotification({
      _id: version._id,
      version: version.version,
      isRequired: version.isRequired,
      releaseNotes: version.releaseNotes,
    });
  } catch (error) {
    console.error('❌ Error broadcasting app update:', error);
  }
};

// ============= Existing endpoints =============

/**
 * Get latest app version for updates
 * GET /api/app/version
 * Public route - uses token from query params if available
 */
const getAppVersion = async (req, res) => {
  try {
    const { platform = 'android', currentVersion, token } = req.query;

    // Find the latest active version for the platform
    const latestVersion = await AppVersion.findOne({ 
      platform, 
      isActive: true 
    }).sort({ createdAt: -1 });

    if (!latestVersion) {
      return res.status(200).json({
        success: true,
        data: {
          hasUpdate: false,
          message: 'No app version found'
        }
      });
    }

    // Try to get user's current version from token if provided
    let userVersion = currentVersion;
    let userId = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
        const user = await User.findById(userId).select('appVersion');
        if (user && user.appVersion) {
          userVersion = user.appVersion;
        }
      } catch (error) {
        // Token invalid or expired - continue with provided currentVersion
        console.log('Token verification failed, using provided version');
      }
    }

    // Check if update is needed using semver (better comparison)
    let hasUpdate = false;
    let isRequired = false;

    if (userVersion) {
      try {
        // Use semver for robust comparison
        const semver = await import('semver');
        hasUpdate = semver.gt(latestVersion.version, userVersion);
        isRequired = latestVersion.isRequired && hasUpdate;
      } catch {
        // Fallback to simple string comparison if semver not available
        hasUpdate = latestVersion.version !== userVersion;
        isRequired = latestVersion.isRequired && hasUpdate;
      }
    } else {
      // If no version provided, assume update is needed
      hasUpdate = true;
      isRequired = latestVersion.isRequired;
    }

    res.status(200).json({
      success: true,
      data: {
        hasUpdate,
        isRequired,
        _id: latestVersion._id,
        version: latestVersion.version,
        releaseNotes: latestVersion.releaseNotes,
        fileUrl: latestVersion.fileUrl,
        fileSize: latestVersion.fileSize,
        fileName: latestVersion.fileName,
        releasedAt: latestVersion.createdAt,
        userVersion: userVersion // Include for debugging
      }
    });

  } catch (error) {
    console.error('Get app version error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching app version',
      error: error.message
    });
  }
};

/**
 * Download the APK/AAB file and update user's version
 * GET /api/app/download/:versionId
 * Public route - uses token from query params if available
 */
const downloadApp = async (req, res) => {
  try {
    const { versionId } = req.params;
    const { token } = req.query;

    const appVersion = await AppVersion.findById(versionId);

    if (!appVersion) {
      return res.status(404).json({
        success: false,
        message: 'App version not found'
      });
    }

    if (!appVersion.isActive) {
      return res.status(403).json({
        success: false,
        message: 'This version is no longer available'
      });
    }

    // 🔄 Update user's app version on download
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
        
        await User.findByIdAndUpdate(userId, {
          appVersion: appVersion.version,
          appVersionUpdatedAt: new Date()
        });
        console.log(`✅ Download: Updated user ${userId} app version to ${appVersion.version}`);
      } catch (error) {
        console.log('⚠️ Download: Token verification failed, skipping version update');
      }
    }

    // Always use a consistent branded filename
    const fileName = `nexa-v${appVersion.version}.apk`;

    // Set headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    
    if (appVersion.fileSize) {
      res.setHeader('Content-Length', appVersion.fileSize);
    }

    // Use axios to handle the file download better
    const response = await axios({
      method: 'get',
      url: appVersion.fileUrl,
      responseType: 'stream',
      timeout: 30000, // 30 seconds timeout
    });

    // Pipe the file stream to the response
    response.data.pipe(res);

    // Handle errors
    response.data.on('error', (err) => {
      console.error('Stream error:', err);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error streaming file'
        });
      }
      res.end();
    });

    // Handle response end
    res.on('finish', () => {
      console.log(`✅ Download complete: ${fileName}`);
    });

  } catch (error) {
    console.error('Download app error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Error downloading app',
        error: error.message
      });
    }
  }
};

/**
 * Get details for a single app version
 * GET /api/app/version/:versionId
 * Public route - no authentication required
 */
const getAppVersionById = async (req, res) => {
  try {
    const { versionId } = req.params;
    const version = await AppVersion.findById(versionId);

    if (!version || !version.isActive) {
      return res.status(404).json({
        success: false,
        message: 'App version not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: version._id,
        version: version.version,
        releaseNotes: version.releaseNotes,
        fileSize: version.fileSize,
        fileName: version.fileName,
        isRequired: version.isRequired,
        platform: version.platform,
        releasedAt: version.createdAt
      }
    });

  } catch (error) {
    console.error('Get app version by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching app version',
      error: error.message
    });
  }
};

/**
 * Update user's app version manually (called during login/startup)
 * POST /api/app/update-version
 * Public route - uses token from body
 */
const updateUserAppVersion = async (req, res) => {
  try {
    const { token, version } = req.body;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token is required'
      });
    }

    if (!version) {
      return res.status(400).json({
        success: false,
        message: 'Version is required'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;

      const user = await User.findByIdAndUpdate(
        userId,
        {
          appVersion: version,
          appVersionUpdatedAt: new Date()
        },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      console.log(`✅ Login/Startup: Verified user ${userId} app version to ${version}`);

      // Get latest version to check if update is needed
      const latestVersion = await AppVersion.findOne({ 
        platform: 'android', 
        isActive: true 
      }).sort({ createdAt: -1 });

      let needsUpdate = false;
      let isRequired = false;
      let updateInfo = null;

      if (latestVersion) {
        // Compare using semver if available
        let hasUpdate = false;
        try {
          const semver = await import('semver');
          hasUpdate = semver.gt(latestVersion.version, version);
        } catch {
          hasUpdate = latestVersion.version !== version;
        }
        if (hasUpdate) {
          needsUpdate = true;
          isRequired = latestVersion.isRequired || false;
          updateInfo = {
            _id: latestVersion._id,
            version: latestVersion.version,
            releaseNotes: latestVersion.releaseNotes,
            fileSize: latestVersion.fileSize,
            fileName: latestVersion.fileName,
            isRequired: latestVersion.isRequired
          };
        }
      }

      res.status(200).json({
        success: true,
        data: {
          appVersion: user.appVersion,
          appVersionUpdatedAt: user.appVersionUpdatedAt,
          needsUpdate,
          isRequired,
          updateInfo
        }
      });

    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        error: error.message
      });
    }

  } catch (error) {
    console.error('Update user app version error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating app version',
      error: error.message
    });
  }
};

/**
 * 🔄 HYBRID APPROACH - PART 2: Verify and correct version during login
 * This is called from the login controller to ensure version accuracy
 */
const verifyAndUpdateVersionOnLogin = async (userId, deviceVersion) => {
  try {
    if (!userId) return null;

    // Get the latest active version
    const latestVersion = await AppVersion.findOne({ 
      platform: 'android', 
      isActive: true 
    }).sort({ createdAt: -1 });

    // Get current user
    const user = await User.findById(userId);
    if (!user) return null;

    let updated = false;
    let needsUpdate = false;
    let versionToSave = user.appVersion;

    // Case 1: User has no version in DB but device sent one
    if (!user.appVersion && deviceVersion) {
      versionToSave = deviceVersion;
      updated = true;
      console.log(`🔄 Login: User ${userId} had no version, set to ${deviceVersion}`);
    }
    
    // Case 2: Device version doesn't match DB version (user updated manually via Play Store)
    if (deviceVersion && user.appVersion && user.appVersion !== deviceVersion) {
      versionToSave = deviceVersion;
      updated = true;
      console.log(`🔄 Login: User ${userId} version corrected from ${user.appVersion} to ${deviceVersion}`);
    }

    // Case 3: User has version but device didn't send one (fallback)
    if (!deviceVersion && user.appVersion) {
      versionToSave = user.appVersion;
    }

    // Save updated version if needed
    if (updated && versionToSave) {
      await User.findByIdAndUpdate(userId, {
        appVersion: versionToSave,
        appVersionUpdatedAt: new Date()
      });
    }

    // Check if update is needed against latest version
    if (latestVersion && versionToSave) {
      let hasUpdate = false;
      try {
        const semver = await import('semver');
        hasUpdate = semver.gt(latestVersion.version, versionToSave);
      } catch {
        hasUpdate = latestVersion.version !== versionToSave;
      }
      if (hasUpdate) {
        needsUpdate = true;
      }
    }

    return {
      currentVersion: versionToSave || deviceVersion || null,
      latestVersion: latestVersion?.version || null,
      needsUpdate,
      isRequired: needsUpdate ? latestVersion?.isRequired || false : false,
      versionId: needsUpdate ? latestVersion?._id : null,
      releaseNotes: needsUpdate ? latestVersion?.releaseNotes : null,
      corrected: updated
    };

  } catch (error) {
    console.error('Version verification error:', error);
    return null;
  }
};

export {
  getAppVersion,
  getAppVersionById,
  downloadApp,
  updateUserAppVersion,
  verifyAndUpdateVersionOnLogin,
  // Export the push broadcasting function
  broadcastAppUpdate,
  sendAppUpdatePushNotification, // optional, for testing
};