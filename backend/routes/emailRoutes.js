import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import {
  addResendConfig,
  getResendConfigs,
  verifyDomainOwnership,
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
  getEmailStats
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

// Webhook for receiving emails (no auth)
router.post("/webhook/receive", receiveEmail);

// All other routes require authentication
router.use(protect);

// Resend configuration routes
router.post("/resend/config", addResendConfig);
router.get("/resend/configs", getResendConfigs);
router.get("/verify-domain/:token", verifyDomainOwnership);

// Team access routes
router.post("/invite", inviteUserToDomain);
router.post("/accept-invitation/:token", acceptInvitation);
router.get("/domain-access/:resendConfigId", getDomainAccessUsers);
router.put("/access/:accessId", updateUserAccess);
router.delete("/access/:accessId", revokeUserAccess);
router.get("/accessible-domains", getAccessibleDomains);

// Custom email management routes
router.post("/custom-emails", uploadProfilePicture.single("profilePicture"), createCustomEmail);
router.get("/custom-emails", getCustomEmails);

// Email sending route
router.post("/send", uploadAttachments.array("attachments", 10), sendEmail);

// Email retrieval routes
router.get("/inbox", getInbox);
router.get("/sent", getSentEmails);
router.get("/email/:emailId", getEmailById);

// Email action routes
router.put("/email/:emailId/read", markAsRead);
router.put("/email/:emailId/star", toggleStar);
router.put("/email/:emailId/archive", toggleArchive);
router.delete("/email/:emailId", deleteEmail);

// Statistics
router.get("/stats", getEmailStats);

export default router;