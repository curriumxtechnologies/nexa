import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import {
  getProfile,
  updateProfile,
  changePassword,
  toggleTwoFactor,  // ✅ Only here
  deleteAccount
} from "../controllers/userController.js";

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
    folder: "nexa_user_profiles",
    allowed_formats: [
      "jpg", "jpeg", "png", "webp", "avif", "heic", "heif", "gif",
      "bmp", "tif", "tiff", "svg", "ico", "apng", "jfif", "dng",
    ],
    transformation: [{ width: 500, height: 500, crop: "fill", gravity: "face" }],
  },
});

const uploadProfilePicture = multer({ storage: profilePictureStorage });

// Test connection
cloudinary.api
  .ping()
  .then(() => console.log("✅ Cloudinary connected successfully for user profiles"))
  .catch((err) => console.error("❌ Cloudinary not connected:", err.message));

// All routes require authentication
router.use(protect);

// Profile routes
router.get("/profile", getProfile);
router.put("/profile", uploadProfilePicture.single("profilePicture"), updateProfile);
router.put("/change-password", changePassword);
router.put("/toggle-2fa", toggleTwoFactor);  // ✅ Keep only here
router.delete("/account", deleteAccount);

export default router;