// routes/adminRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import {
  getUsers,
  getUserById,
  getAdmins,
  assignRole,
  deleteUser,
  getEmailStats,
  uploadApp,
  updateApp,
  deleteApp,
  getAppVersions
} from '../controllers/adminController.js';

const router = express.Router();

// Cloudinary config for APK uploads
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// routes/adminRoutes.js — storage config only
const apkStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'nexa_app_versions',
      resource_type: 'raw',
      public_id: `${Date.now()}-${file.originalname.replace(/\.[^/.]+$/, '')}`,
      format: 'zip', // Cloudinary allows this extension for raw uploads
    };
  },
});

const uploadApk = multer({
  storage: apkStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB, matches frontend check
});

// Wraps multer so upload errors (Cloudinary auth, format rejection, etc.)
// are caught and logged instead of silently crashing before reaching the controller.
const handleApkUpload = (req, res, next) => {
  uploadApk.single('apkFile')(req, res, (err) => {
    if (err) {
      console.error('Multer/Cloudinary upload error:', err);
      return res.status(500).json({
        success: false,
        message: 'File upload failed',
        error: err.message
      });
    }
    next();
  });
};

// Public routes (no auth needed for checking updates)
router.get('/app/versions', getAppVersions);

// All routes below require authentication
router.use(protect);

// User management
router.get('/users', getUsers);
router.get('/users/:userId', getUserById);
router.get('/admins', getAdmins);
router.put('/users/:userId/role', assignRole);
router.delete('/users/:userId', deleteUser);

// Email statistics
router.get('/stats/emails', getEmailStats);

// App management
router.post('/app/upload', handleApkUpload, uploadApp);
router.put('/app/update/:versionId', updateApp);
router.delete('/app/delete/:versionId', deleteApp);

export default router;