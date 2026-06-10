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

const apkStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "nexa_app_versions",
    resource_type: "raw",
    allowed_formats: ["apk", "aab", "zip"],
  },
});

const uploadApk = multer({ storage: apkStorage });

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
router.post('/app/upload', uploadApk.single('apkFile'), uploadApp);
router.put('/app/update/:versionId', updateApp);
router.delete('/app/delete/:versionId', deleteApp);

export default router;