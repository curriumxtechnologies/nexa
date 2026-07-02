// controllers/appController.js
import AppVersion from '../models/appVersionModel.js';
import User from '../models/userModel.js';
import https from 'https';
import jwt from 'jsonwebtoken';

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

    // Check if update is needed
    let hasUpdate = false;
    let isRequired = false;

    if (userVersion) {
      // Compare versions (simple string comparison)
      hasUpdate = latestVersion.version !== userVersion;
      isRequired = latestVersion.isRequired && hasUpdate;
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

    // 🔄 HYBRID APPROACH - PART 1: Update user's app version on download
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
        // Token invalid - continue with download without updating
        console.log('⚠️ Download: Token verification failed, skipping version update');
      }
    }

    // Always use a consistent branded filename
    const fileName = `nexa-v${appVersion.version}.apk`;

    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    if (appVersion.fileSize) {
      res.setHeader('Content-Length', appVersion.fileSize);
    }

    https.get(appVersion.fileUrl, (fileRes) => {
      if (fileRes.statusCode !== 200) {
        console.error('Cloudinary fetch failed with status:', fileRes.statusCode);
        if (!res.headersSent) {
          return res.status(502).json({
            success: false,
            message: 'Failed to fetch file from storage'
          });
        }
        return res.end();
      }
      fileRes.pipe(res);
    }).on('error', (err) => {
      console.error('Download proxy error:', err);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error downloading file'
        });
      } else {
        res.end();
      }
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

      if (latestVersion && latestVersion.version !== version) {
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
    if (latestVersion && versionToSave && latestVersion.version !== versionToSave) {
      needsUpdate = true;
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
  verifyAndUpdateVersionOnLogin // Export for auth controller
};