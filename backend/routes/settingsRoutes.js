import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getSettings,
  updateSettings,
  updateEmailSignature,
  toggleDarkMode
} from "../controllers/settingsController.js";

const router = express.Router();

// All settings routes require authentication
router.use(protect);

// Get user settings
router.get("/", getSettings);

// Update all settings
router.put("/", updateSettings);

// Update email signature only
router.put("/email-signature", updateEmailSignature);

// Toggle dark mode
router.put("/dark-mode", toggleDarkMode);

export default router;