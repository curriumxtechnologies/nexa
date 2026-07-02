// routes/appRoutes.js
import express from 'express';
import { getAppVersion, downloadApp } from '../controllers/appController.js';

const router = express.Router();

// Public route for checking app updates (no authentication needed)
router.get('/version', getAppVersion);

// Public route for downloading the APK — streams the file with the
// correct .apk filename forced via Content-Disposition
router.get('/download/:versionId', downloadApp);

export default router;