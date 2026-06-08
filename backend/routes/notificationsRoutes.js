import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getNotificationPreferences,
  updateEmailNotifications,
  updatePushNotifications,
  registerPushSubscription,
  registerMobileToken,
  sendTestPush,
  getVapidPublicKey,
  sendTestEmail,
} from "../controllers/notificationsController.js";

const router = express.Router();

// Public route for VAPID key (no auth needed)
router.get("/vapid-public-key", getVapidPublicKey);

// All other routes require authentication
router.use(protect);

// Notification preferences
router.get("/preferences", getNotificationPreferences);
router.put("/email", updateEmailNotifications);
router.put("/push", updatePushNotifications);

// Push subscription management
router.post("/push-subscription", registerPushSubscription);  // Web push
router.post("/register-token", registerMobileToken);          // Mobile push (Android/iOS)

// Test notifications
router.post("/test-push", sendTestPush);
router.post("/test-email", sendTestEmail);

export default router;