// routes/appRoutes.js
import express from 'express';
import { getAppVersion } from '../controllers/appController.js';

const router = express.Router();

// Public route for checking app updates (no authentication needed)
router.get('/version', getAppVersion);

export default router;