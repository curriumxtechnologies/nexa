// routes/appRoutes.js
import express from 'express';
import { 
  getAppVersion, 
  getAppVersionById, 
  downloadApp,
  updateUserAppVersion 
} from '../controllers/appController.js';

const router = express.Router();

// All routes are public - authentication handled via token query param
router.get('/version', getAppVersion);
router.get('/version/:versionId', getAppVersionById);
router.get('/download/:versionId', downloadApp);
router.post('/update-version', updateUserAppVersion);

export default router;