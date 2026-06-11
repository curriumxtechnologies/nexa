// controllers/appController.js
import AppVersion from '../models/appVersionModel.js';

/**
 * Get latest app version for updates
 * GET /api/app/version
 * Public route - no authentication required
 */
const getAppVersion = async (req, res) => {
  try {
    const { platform = 'android', currentVersion } = req.query;

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

    // Check if update is needed
    let hasUpdate = false;
    let isRequired = false;

    if (currentVersion) {
      // Compare versions (simple string comparison, you can use semver library for better comparison)
      hasUpdate = latestVersion.version !== currentVersion;
      isRequired = latestVersion.isRequired && hasUpdate;
    } else {
      hasUpdate = true;
      isRequired = latestVersion.isRequired;
    }

    res.status(200).json({
      success: true,
      data: {
        hasUpdate,
        isRequired,
        version: latestVersion.version,
        releaseNotes: latestVersion.releaseNotes,
        fileUrl: latestVersion.fileUrl,
        fileSize: latestVersion.fileSize,
        fileName: latestVersion.fileName,
        releasedAt: latestVersion.createdAt
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

export {
  getAppVersion
};