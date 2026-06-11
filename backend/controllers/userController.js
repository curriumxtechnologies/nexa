import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

// Get user profile
// Already correct - it selects everything except password and OTPs
const getProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select(
      "-password -otp -twoFactorOTP -resetPasswordOTP",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Log for debugging
    console.log("📊 User profile fetched:", {
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      isTwoFactorEnabled: user.isTwoFactorEnabled,
    });

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching profile",
      error: error.message,
    });
  }
};

// Update user profile
// controllers/userController.js - update the updateProfile function
const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, phoneNumber } = req.body;

    console.log("📝 Updating profile for user:", userId);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update fields
    if (name) user.name = name;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;

    // Update profile picture if provided
    if (req.file) {
      console.log("📸 Updating profile picture:", req.file.filename);

      // Optional: Delete old profile picture from Cloudinary
      if (user.profilePicture?.publicId) {
        try {
          const cloudinary = (await import("cloudinary")).v2;
          cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
          });
          await cloudinary.uploader.destroy(user.profilePicture.publicId);
          console.log(
            "🗑️ Deleted old profile picture:",
            user.profilePicture.publicId,
          );
        } catch (err) {
          console.error("Failed to delete old picture:", err);
        }
      }

      user.profilePicture = {
        url: req.file.path,
        publicId: req.file.filename,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
      };
    }

    await user.save();
    console.log("✅ Profile updated successfully");

    // Return user without sensitive data
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      profilePicture: user.profilePicture,
      isEmailVerified: user.isEmailVerified,
      isTwoFactorEnabled: user.isTwoFactorEnabled,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: userData,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message,
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const userId = req.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Error changing password",
      error: error.message,
    });
  }
};

// Enable/Disable 2FA
// In authController.js - remove toggleTwoFactor (keep only in userController)
// Make sure userController.js has the correct implementation:

const toggleTwoFactor = async (req, res) => {
  try {
    const userId = req.userId;
    const { enable } = req.body;

    console.log("🔐 Toggling 2FA for user:", userId, "to:", enable);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isTwoFactorEnabled = enable;
    await user.save();

    console.log(
      "✅ 2FA toggled successfully. New status:",
      user.isTwoFactorEnabled,
    );

    res.status(200).json({
      success: true,
      message: `2FA ${enable ? "enabled" : "disabled"} successfully`,
      data: { isTwoFactorEnabled: user.isTwoFactorEnabled },
    });
  } catch (error) {
    console.error("Toggle 2FA error:", error);
    res.status(500).json({
      success: false,
      message: "Error toggling 2FA",
      error: error.message,
    });
  }
};

// Delete account
const deleteAccount = async (req, res) => {
  try {
    const userId = req.userId;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required to delete account",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Password is incorrect",
      });
    }

    // Delete user
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting account",
      error: error.message,
    });
  }
};

// Export all controllers at the bottom
export {
  getProfile,
  updateProfile,
  changePassword,
  toggleTwoFactor,
  deleteAccount,
};
