// routes/appRoutes.js
import express from 'express';
import { getAppVersion, getAppVersionById, downloadApp } from '../controllers/appController.js';

const router = express.Router();

router.get('/version', getAppVersion);
router.get('/version/:versionId', getAppVersionById);
router.get('/download/:versionId', downloadApp);

export default router;