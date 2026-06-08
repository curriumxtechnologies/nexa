import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// Import from separated controllers
import {
  addResendConfig,
  getResendConfigs,
  addWebhookSecret,
  updateWebhookSecret,
  getWebhookConfig
} from "../controllers/resendController.js";

import {
  sendEmail,
  receiveEmail,
  createCustomEmail,
  getCustomEmails,
  updateCustomEmail,
  deleteCustomEmail,
  getInbox,
  getSentEmails,
  getEmailById,
  getEmailStats
} from "../controllers/emailController.js";

import {
  markAsRead,
  markAsUnread,
  toggleStar,
  toggleArchive,
  deleteEmail,
  restoreEmail,
  permanentlyDeleteEmail,
  bulkMarkAsRead,
  bulkMoveToTrash,
  bulkRestoreFromTrash,
  bulkToggleStar,
  emptyTrash
} from "../controllers/emailActionsController.js";

import {
  inviteUserToDomain,
  acceptInvitation,
  declineInvitation,
  resendInvitation,
  getDomainAccessUsers,
  updateUserAccess,
  revokeUserAccess,
  getAccessibleDomains,
  getPendingInvitations,
  getTeamMembers
} from "../controllers/teamController.js";

const router = express.Router();

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer -> Cloudinary storage for profile pictures
const profilePictureStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "nexa_custom_email_profiles",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "avif", "gif"],
    transformation: [{ width: 200, height: 200, crop: "fill", gravity: "face" }],
  },
});

// Multer -> Cloudinary storage for email attachments
const attachmentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "nexa_email_attachments",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "pdf", "doc", "docx", "txt", "mp4", "zip"],
    resource_type: "auto",
  },
});

const uploadProfilePicture = multer({ storage: profilePictureStorage });
const uploadAttachments = multer({ storage: attachmentStorage });

// Test Cloudinary connection
cloudinary.api
  .ping()
  .then(() => console.log("✅ Cloudinary connected successfully"))
  .catch((err) => console.error("❌ Cloudinary not connected:", err.message));

// ==================== PUBLIC WEBHOOK ROUTE (NO AUTH) ====================
router.post("/webhook/receive", receiveEmail);

// ==================== PROTECTED ROUTES (AUTH REQUIRED) ====================
router.use(protect);

// ==================== RESEND CONFIGURATION ROUTES ====================
router.post("/resend/config", addResendConfig);
router.get("/resend/configs", getResendConfigs);

// ==================== WEBHOOK MANAGEMENT ROUTES ====================
router.post("/webhook/secret", addWebhookSecret);
router.get("/webhook/secret/:resendConfigId", getWebhookConfig);
router.put("/webhook/secret/:resendConfigId", updateWebhookSecret);

// ==================== TEAM ACCESS ROUTES ====================
router.post("/team/invite", inviteUserToDomain);
router.post("/team/accept/:token", acceptInvitation);
router.post("/team/decline/:token", declineInvitation);
router.post("/team/resend/:accessId", resendInvitation);
router.get("/team/access/:resendConfigId", getDomainAccessUsers);
router.put("/team/access/:accessId", updateUserAccess);
router.delete("/team/access/:accessId", revokeUserAccess);
router.get("/team/my-domains", getAccessibleDomains);
router.get("/team/pending-invites", getPendingInvitations);
router.get("/team/members/:resendConfigId", getTeamMembers);

// ==================== CUSTOM EMAIL MANAGEMENT ROUTES ====================
router.post("/custom-emails", uploadProfilePicture.single("profilePicture"), createCustomEmail);
router.get("/custom-emails", getCustomEmails);
router.put("/custom-emails/:emailId", uploadProfilePicture.single("profilePicture"), updateCustomEmail);
router.delete("/custom-emails/:emailId", deleteCustomEmail);

// ==================== EMAIL SENDING ROUTE ====================
router.post("/send", uploadAttachments.array("attachments", 10), sendEmail);

// ==================== EMAIL RETRIEVAL ROUTES ====================
router.get("/inbox", getInbox);
router.get("/sent", getSentEmails);
router.get("/:emailId", getEmailById);

// ==================== SINGLE EMAIL ACTIONS ====================
router.put("/:emailId/read", markAsRead);
router.put("/:emailId/unread", markAsUnread);
router.put("/:emailId/star", toggleStar);
router.put("/:emailId/archive", toggleArchive);
router.delete("/:emailId", deleteEmail);
router.put("/:emailId/restore", restoreEmail);
router.delete("/:emailId/permanent", permanentlyDeleteEmail);

// ==================== BULK EMAIL ACTIONS ====================
router.put("/bulk/read", bulkMarkAsRead);
router.post("/bulk/trash", bulkMoveToTrash);
router.post("/bulk/restore", bulkRestoreFromTrash);
router.post("/bulk/star", bulkToggleStar);
router.delete("/trash/empty", emptyTrash);

// ==================== STATISTICS ROUTE ====================
router.get("/stats", getEmailStats);

export default router;