// controllers/appController.js
import AppVersion from '../models/appVersionModel.js';
import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import axios from 'axios';
// (import semver if you want robust version comparison)

// ─── Helper: admin check ──────────────────────────────────────────────
const isAdmin = (user) => {
  return user?.role === 'admin' || user?.role === 'super_admin';
};

// ─── GET latest version ────────────────────────────────────────────────
/**
 * GET /api/app/version
 * Public route – accepts token (optional) to get user's current version.
 * Query: ?platform=android&currentVersion=1.0.0&token=...
 */
export const getAppVersion = async (req, res) => {
  try {
    const { platform = 'android', currentVersion, token } = req.query;

    const latestVersion = await AppVersion.findOne({ platform, isActive: true })
      .sort({ createdAt: -1 });

    if (!latestVersion) {
      return res.status(200).json({
        success: true,
        data: { hasUpdate: false, message: 'No active version found' },
      });
    }

    // Resolve user's current version from token if provided
    let userVersion = currentVersion;
    let userId = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
        const user = await User.findById(userId).select('appVersion');
        if (user?.appVersion) {
          userVersion = user.appVersion;
        }
      } catch (error) {
        console.log('Token verification failed, using provided version');
      }
    }

    // Check if update is needed
    let hasUpdate = false;
    let isRequired = false;

    if (userVersion) {
      try {
        const semver = await import('semver');
        hasUpdate = semver.gt(latestVersion.version, userVersion);
        isRequired = latestVersion.isRequired && hasUpdate;
      } catch {
        // fallback to simple string comparison
        hasUpdate = latestVersion.version !== userVersion;
        isRequired = latestVersion.isRequired && hasUpdate;
      }
    } else {
      // No version provided – assume update needed
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
        userVersion,
      },
    });
  } catch (error) {
    console.error('getAppVersion error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching app version',
      error: error.message,
    });
  }
};

// ─── GET version by ID ────────────────────────────────────────────────
/**
 * GET /api/app/version/:versionId
 * Public – returns details of a specific version.
 */
export const getAppVersionById = async (req, res) => {
  try {
    const { versionId } = req.params;
    const version = await AppVersion.findById(versionId);

    if (!version || !version.isActive) {
      return res.status(404).json({
        success: false,
        message: 'App version not found',
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
        releasedAt: version.createdAt,
      },
    });
  } catch (error) {
    console.error('getAppVersionById error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching version',
      error: error.message,
    });
  }
};

// ─── DOWNLOAD file & update user version ─────────────────────────────
/**
 * GET /api/app/download/:versionId
 * Public – streams the file and updates the user's appVersion.
 * Query: ?token=...
 */
export const downloadApp = async (req, res) => {
  try {
    const { versionId } = req.params;
    const { token } = req.query;

    const appVersion = await AppVersion.findById(versionId);
    if (!appVersion || !appVersion.isActive) {
      return res.status(404).json({
        success: false,
        message: 'App version not found or inactive',
      });
    }

    // Update user's appVersion if token is valid
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
        await User.findByIdAndUpdate(userId, {
          appVersion: appVersion.version,
          appVersionUpdatedAt: new Date(),
        });
        console.log(`✅ User ${userId} version updated to ${appVersion.version} on download`);
      } catch (error) {
        console.log('⚠️ Download token invalid, skipping version update');
      }
    }

    const fileName = `nexa-v${appVersion.version}.apk`; // or .aab
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (appVersion.fileSize) {
      res.setHeader('Content-Length', appVersion.fileSize);
    }

    // Stream the file from Cloudinary (or any URL)
    const response = await axios({
      method: 'get',
      url: appVersion.fileUrl,
      responseType: 'stream',
      timeout: 30000,
    });

    response.data.pipe(res);

    response.data.on('error', (err) => {
      console.error('Stream error:', err);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: 'Error streaming file' });
      }
      res.end();
    });

    res.on('finish', () => {
      console.log(`✅ Download complete: ${fileName}`);
    });
  } catch (error) {
    console.error('downloadApp error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Error downloading app',
        error: error.message,
      });
    }
  }
};

// ─── UPDATE user's app version (on login/startup) ────────────────────
/**
 * POST /api/app/update-version
 * Public – expects { token, version }
 */
export const updateUserAppVersion = async (req, res) => {
  try {
    const { token, version } = req.body;

    if (!token || !version) {
      return res.status(400).json({
        success: false,
        message: 'Token and version are required',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    const userId = decoded.id;
    const user = await User.findByIdAndUpdate(
      userId,
      { appVersion: version, appVersionUpdatedAt: new Date() },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if there is a newer version available
    const latestVersion = await AppVersion.findOne({ platform: 'android', isActive: true })
      .sort({ createdAt: -1 });

    let needsUpdate = false;
    let isRequired = false;
    let updateInfo = null;

    if (latestVersion) {
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
          isRequired: latestVersion.isRequired,
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
        updateInfo,
      },
    });
  } catch (error) {
    console.error('updateUserAppVersion error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating app version',
      error: error.message,
    });
  }
};

// ─── ADMIN endpoints ──────────────────────────────────────────────────

/**
 * POST /api/admin/app/upload
 * Admin only – upload a new APK/AAB.
 * Uses multer (file must be sent as multipart/form-data with field name "file")
 * Body: { version, releaseNotes, isRequired, platform }
 */
export const uploadApp = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user || !isAdmin(user)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
      });
    }

    const { version, releaseNotes, isRequired = false, platform = 'android' } = req.body;

    if (!version || !req.file) {
      return res.status(400).json({
        success: false,
        message: 'Version and APK file are required',
      });
    }

    // Check for duplicate version
    const existing = await AppVersion.findOne({ version, platform });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Version ${version} already exists for ${platform}`,
      });
    }

    // Get the file URL from multer (Cloudinary or local)
    const fileUrl = req.file.path || req.file.secure_url || req.file.url;
    const filePublicId = req.file.filename || req.file.public_id;

    if (!fileUrl) {
      console.error('Upload error: no file URL', req.file);
      return res.status(500).json({
        success: false,
        message: 'File upload succeeded but no URL returned',
      });
    }

    const appVersion = new AppVersion({
      version,
      releaseNotes: releaseNotes || '',
      fileUrl,
      fileSize: req.file.size,
      fileName: req.file.originalname,
      filePublicId,
      isRequired: isRequired === 'true' || isRequired === true,
      platform,
      uploadedBy: userId,
      isActive: true,
    });

    await appVersion.save();

    res.status(201).json({
      success: true,
      message: 'App version uploaded successfully',
      data: {
        id: appVersion._id,
        version: appVersion.version,
        platform: appVersion.platform,
        fileSize: appVersion.fileSize,
        createdAt: appVersion.createdAt,
      },
    });
  } catch (error) {
    console.error('uploadApp error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading app',
      error: error.message,
    });
  }
};

/**
 * PUT /api/admin/app/update/:versionId
 * Admin only – update version metadata.
 */
export const updateApp = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user || !isAdmin(user)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
      });
    }

    const { versionId } = req.params;
    const { version, releaseNotes, isRequired, isActive } = req.body;

    const appVersion = await AppVersion.findById(versionId);
    if (!appVersion) {
      return res.status(404).json({ success: false, message: 'Version not found' });
    }

    if (version) appVersion.version = version;
    if (releaseNotes !== undefined) appVersion.releaseNotes = releaseNotes;
    if (isRequired !== undefined) appVersion.isRequired = isRequired;
    if (isActive !== undefined) appVersion.isActive = isActive;
    appVersion.updatedAt = new Date();

    await appVersion.save();

    res.status(200).json({
      success: true,
      message: 'App version updated',
      data: appVersion,
    });
  } catch (error) {
    console.error('updateApp error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating app',
      error: error.message,
    });
  }
};

/**
 * DELETE /api/admin/app/delete/:versionId
 * Admin only – delete a version and its file.
 */
export const deleteApp = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user || !isAdmin(user)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
      });
    }

    const { versionId } = req.params;
    const appVersion = await AppVersion.findById(versionId);
    if (!appVersion) {
      return res.status(404).json({ success: false, message: 'Version not found' });
    }

    // Delete from Cloudinary if possible
    if (appVersion.filePublicId) {
      try {
        const cloudinary = (await import('cloudinary')).v2;
        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
        });
        await cloudinary.uploader.destroy(appVersion.filePublicId);
      } catch (err) {
        console.error('Cloudinary deletion failed:', err);
      }
    }

    await AppVersion.findByIdAndDelete(versionId);
    res.status(200).json({
      success: true,
      message: 'App version deleted',
    });
  } catch (error) {
    console.error('deleteApp error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting app',
      error: error.message,
    });
  }
};

/**
 * GET /api/admin/app/versions
 * Admin only – list all versions.
 */
export const getAppVersions = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user || !isAdmin(user)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
      });
    }

    const { platform = 'android' } = req.query;
    const versions = await AppVersion.find({ platform }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: versions,
    });
  } catch (error) {
    console.error('getAppVersions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching versions',
      error: error.message,
    });
  }
};