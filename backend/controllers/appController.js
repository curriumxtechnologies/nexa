// controllers/appController.js
import AppVersion from '../models/appVersionModel.js';
import https from 'https';

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
        _id: latestVersion._id,
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

/**
 * Download the APK/AAB file for a given version, streamed with the
 * correct filename and extension forced via Content-Disposition —
 * this works even though the file is stored on Cloudinary internally
 * as .zip (to get around their extension restriction on .apk uploads).
 * GET /api/app/download/:versionId
 * Public route - no authentication required
 */
const downloadApp = async (req, res) => {
  try {
    const { versionId } = req.params;
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

    const fileName = appVersion.fileName?.endsWith('.apk')
      ? appVersion.fileName
      : `nexa-v${appVersion.version}.apk`;

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

export {
  getAppVersion,
  downloadApp
};