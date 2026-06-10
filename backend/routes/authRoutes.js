import express from "express";
import {
  register,
  verifyEmailOTP,
  resendVerificationOTP,
  login,
  verifyTwoFactorOTP,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const router = express.Router();

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer -> Cloudinary storage for profile pictures
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "nexa_profile_pictures",
    allowed_formats: [
      "jpg", "jpeg", "png", "webp", "avif", "heic", "heif", "gif", 
      "bmp", "tif", "tiff", "svg", "ico", "apng", "jfif", "dng",
    ],
    transformation: [{ width: 500, height: 500, crop: "fill", gravity: "face" }],
  },
});

const upload = multer({ storage });

// Test connection
cloudinary.api
  .ping()
  .then(() => console.log("✅ Cloudinary connected successfully"))
  .catch((err) => console.error("❌ Cloudinary not connected:", err.message));

// Public auth routes (no auth required)
router.post("/register", upload.single("profilePicture"), register);
router.post("/verify-email", verifyEmailOTP);
router.post("/resend-verification", resendVerificationOTP);
router.post("/login", login);
router.post("/verify-2fa", verifyTwoFactorOTP);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Protected routes (auth required)
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password -otp -twoFactorOTP -resetPasswordOTP');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
});

export default router;