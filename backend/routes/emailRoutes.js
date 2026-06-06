import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import {
  addResendConfig,
  getResendConfigs,
  createCustomEmail,
  inviteUserToDomain,
  acceptInvitation,
  getDomainAccessUsers,
  updateUserAccess,
  revokeUserAccess,
  getAccessibleDomains,
  sendEmail,
  receiveEmail,
  getCustomEmails,
  getInbox,
  getSentEmails,
  getEmailById,
  markAsRead,
  toggleStar,
  toggleArchive,
  deleteEmail,
  permanentlyDeleteEmail,
  restoreEmail,
  getEmailStats,
  addWebhookSecret,
  getWebhookConfig
} from "../controllers/emailController.js";

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
// Webhook for receiving emails from Resend
router.post("/webhook/receive", receiveEmail);

// ==================== PROTECTED ROUTES (AUTH REQUIRED) ====================
router.use(protect);

// ==================== RESEND CONFIGURATION ROUTES ====================
// Add a new domain with Resend API key
router.post("/resend/config", addResendConfig);
// Get all Resend configurations for the user
router.get("/resend/configs", getResendConfigs);

// ==================== WEBHOOK MANAGEMENT ROUTES ====================
// Add/update webhook secret for a domain
router.post("/webhook/secret", addWebhookSecret);
// Get webhook configuration for a specific domain
router.get("/webhook/secret/:resendConfigId", getWebhookConfig);

// ==================== TEAM ACCESS ROUTES ====================
// Invite a user to access domain emails
router.post("/invite", inviteUserToDomain);
// Accept an invitation
router.post("/accept-invitation/:token", acceptInvitation);
// Get all users with access to a domain
router.get("/domain-access/:resendConfigId", getDomainAccessUsers);
// Update a user's access level
router.put("/access/:accessId", updateUserAccess);
// Revoke a user's access
router.delete("/access/:accessId", revokeUserAccess);
// Get all domains the user has access to
router.get("/accessible-domains", getAccessibleDomains);

// ==================== CUSTOM EMAIL MANAGEMENT ROUTES ====================
// Create a new custom email address
router.post("/custom-emails", uploadProfilePicture.single("profilePicture"), createCustomEmail);
// Get all custom emails for the user
router.get("/custom-emails", getCustomEmails);

// ==================== EMAIL SENDING ROUTE ====================
// Send an email with optional attachments
router.post("/send", uploadAttachments.array("attachments", 10), sendEmail);

// ==================== EMAIL RETRIEVAL ROUTES ====================
// Get inbox emails (paginated)
router.get("/inbox", getInbox);
// Get sent emails (paginated)
router.get("/sent", getSentEmails);
// Get a single email by ID
router.get("/email/:emailId", getEmailById);

// ==================== EMAIL ACTION ROUTES ====================
// Mark an email as read
router.put("/email/:emailId/read", markAsRead);
// Star or unstar an email
router.put("/email/:emailId/star", toggleStar);
// Archive or unarchive an email
router.put("/email/:emailId/archive", toggleArchive);
// Move email to trash
router.delete("/email/:emailId", deleteEmail);
// Permanently delete email from trash
router.delete("/email/:emailId/permanent", permanentlyDeleteEmail);
// Restore email from trash back to inbox
router.put("/email/:emailId/restore", restoreEmail);

// ==================== STATISTICS ROUTE ====================
// Get email statistics for the user
router.get("/stats", getEmailStats);

export default router;