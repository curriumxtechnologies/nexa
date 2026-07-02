import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { 
  sendVerificationOTP, 
  sendTwoFactorOTP, 
  sendResetPasswordOTP,
  sendResendVerificationOTP 
} from '../utils/sendOTPEmail.js';

// Generate OTP (6 digit number)
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Register user
// Register user
const register = async (req, res) => {
  try {
    const { email, password, name, phoneNumber, enable2FA = false } = req.body;

    // Find existing user
    const existingUser = await User.findOne({ email });

    // If user exists and is verified, reject registration
    if (existingUser && existingUser.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered and verified.'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    let user;
    let isNewUser = false;
    let oldProfilePicture = null;     // to restore on rollback
    let oldUserData = null;          // for full rollback of unverified user

    if (existingUser) {
      // ------------------------------------------------------------
      // CASE: Unverified user exists → override with new data
      // ------------------------------------------------------------
      oldUserData = { ...existingUser._doc };   // shallow copy for rollback
      oldProfilePicture = existingUser.profilePicture
        ? { ...existingUser.profilePicture }
        : null;

      // Update fields
      existingUser.name = name;
      existingUser.password = hashedPassword;
      existingUser.phoneNumber = phoneNumber;
      existingUser.isTwoFactorEnabled = enable2FA;
      existingUser.otp = { code: otp, expiresAt: otpExpiry };
      existingUser.isEmailVerified = false;     // ensure false (should already be)

      // Clear any leftover 2FA / reset OTPs
      existingUser.twoFactorOTP = { code: null, expiresAt: null };
      existingUser.resetPasswordOTP = { code: null, expiresAt: null };

      // Handle profile picture
      if (req.file) {
        // New picture uploaded → we'll delete old one after email success
        existingUser.profilePicture = {
          url: req.file.path,
          publicId: req.file.filename,
          fileName: req.file.originalname,
          fileSize: req.file.size,
          mimeType: req.file.mimetype
        };
        // (old picture deletion deferred until email is sent successfully)
      } else {
        // Keep existing profile picture (no change)
        // existingUser.profilePicture remains as is
      }

      user = existingUser;
    } else {
      // ------------------------------------------------------------
      // CASE: Completely new user
      // ------------------------------------------------------------
      isNewUser = true;
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        phoneNumber,
        isTwoFactorEnabled: enable2FA,
        otp: { code: otp, expiresAt: otpExpiry },
        isEmailVerified: false,
        profilePicture: req.file ? {
          url: req.file.path,
          publicId: req.file.filename,
          fileName: req.file.originalname,
          fileSize: req.file.size,
          mimeType: req.file.mimetype
        } : {
          url: null,
          publicId: null,
          fileName: null,
          fileSize: null,
          mimeType: null
        }
      });
      user = newUser;
    }

    // Save the user
    await user.save();

    // Send OTP email
    const emailResult = await sendVerificationOTP(email, name, otp);

    // ------------------------------------------------------------
    // If email sending fails → rollback everything
    // ------------------------------------------------------------
    if (!emailResult.success) {
      // Delete the newly uploaded picture (if any)
      if (req.file && req.file.filename) {
        const cloudinary = (await import('cloudinary')).v2;
        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
        });
        await cloudinary.uploader.destroy(req.file.filename);
      }

      if (isNewUser) {
        // Delete the newly created user
        await User.findByIdAndDelete(user._id);
      } else {
        // Revert unverified user to previous state
        const { _id, __v, ...updateData } = oldUserData;
        await User.findByIdAndUpdate(user._id, updateData);
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email',
        error: emailResult.error
      });
    }

    // ------------------------------------------------------------
    // Email sent successfully → finalize
    // ------------------------------------------------------------
    // If we replaced an old profile picture, delete it now
    if (existingUser && req.file && oldProfilePicture && oldProfilePicture.publicId) {
      const cloudinary = (await import('cloudinary')).v2;
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });
      // Fire-and-forget (but we await to catch errors)
      await cloudinary.uploader.destroy(oldProfilePicture.publicId)
        .catch(err => console.error('Failed to delete old profile picture:', err));
    }

    // Success response
    res.status(201).json({
      success: true,
      message: 'Registration successful! Please verify your email with the OTP sent.',
      data: {
        userId: user._id,
        email: user.email,
        requiresOTPVerification: true
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    // If an unexpected error occurs after we've saved but before we could clean up,
    // we might have inconsistencies. However, the main flows are covered above.
    res.status(500).json({
      success: false,
      message: 'Error during registration',
      error: error.message
    });
  }
};

// Verify email OTP (after registration)
const verifyEmailOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Check if already verified
    if (user.isEmailVerified) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already verified' 
      });
    }

    // Check OTP validity
    if (user.otp.code !== otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid OTP' 
      });
    }

    if (user.otp.expiresAt < new Date()) {
      return res.status(400).json({ 
        success: false, 
        message: 'OTP has expired. Please request a new one.' 
      });
    }

    // Mark email as verified and clear OTP
    user.isEmailVerified = true;
    user.otp = { code: null, expiresAt: null };
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Email verified successfully!',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          profilePicture: user.profilePicture,
          isTwoFactorEnabled: user.isTwoFactorEnabled
        }
      }
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error verifying OTP', 
      error: error.message 
    });
  }
};

// Resend verification OTP
const resendVerificationOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already verified' 
      });
    }

    // Generate new OTP
    const newOTP = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = {
      code: newOTP,
      expiresAt: otpExpiry
    };
    await user.save();

    // Send new OTP via email
    const emailResult = await sendResendVerificationOTP(email, user.name, newOTP);
    
    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email',
        error: emailResult.error
      });
    }

    res.status(200).json({
      success: true,
      message: 'New OTP sent to your email'
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error resending OTP', 
      error: error.message 
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(401).json({ 
        success: false, 
        message: 'Please verify your email first. Check your inbox for OTP.' 
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check if 2FA is enabled
    if (user.isTwoFactorEnabled) {
      // Generate and send 2FA OTP
      const twoFACode = generateOTP();
      const twoFAExpiry = new Date(Date.now() + 10 * 60 * 1000);

      user.twoFactorOTP = {
        code: twoFACode,
        expiresAt: twoFAExpiry
      };
      await user.save();

      // Send 2FA OTP via email
      const emailResult = await sendTwoFactorOTP(email, user.name, twoFACode);
      
      if (!emailResult.success) {
        return res.status(500).json({
          success: false,
          message: 'Failed to send 2FA code',
          error: emailResult.error
        });
      }

      return res.status(200).json({
        success: true,
        message: '2-step verification required. OTP sent to your email.',
        requiresTwoFactor: true,
        userId: user._id
      });
    }

    // No 2FA, generate token directly
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          profilePicture: user.profilePicture,
          isTwoFactorEnabled: user.isTwoFactorEnabled
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error during login', 
      error: error.message 
    });
  }
};

// Verify 2FA OTP during login
const verifyTwoFactorOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Check 2FA OTP
    if (!user.twoFactorOTP || user.twoFactorOTP.code !== otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid 2FA code' 
      });
    }

    if (user.twoFactorOTP.expiresAt < new Date()) {
      return res.status(400).json({ 
        success: false, 
        message: '2FA code has expired. Please login again.' 
      });
    }

    // Clear 2FA OTP
    user.twoFactorOTP = { code: null, expiresAt: null };
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: '2FA verification successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          profilePicture: user.profilePicture,
          isTwoFactorEnabled: user.isTwoFactorEnabled
        }
      }
    });

  } catch (error) {
    console.error('2FA verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error verifying 2FA code', 
      error: error.message 
    });
  }
};

// Forgot password - send OTP
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const resetOTP = generateOTP();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    user.resetPasswordOTP = {
      code: resetOTP,
      expiresAt: otpExpiry
    };
    await user.save();

    // Send reset password OTP
    const emailResult = await sendResetPasswordOTP(email, user.name, resetOTP);
    
    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send reset password email',
        error: emailResult.error
      });
    }

    res.status(200).json({
      success: true,
      message: 'Password reset OTP sent to your email'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error sending reset OTP', 
      error: error.message 
    });
  }
};

// Reset password with OTP
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (!user.resetPasswordOTP || user.resetPasswordOTP.code !== otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid OTP' 
      });
    }

    if (user.resetPasswordOTP.expiresAt < new Date()) {
      return res.status(400).json({ 
        success: false, 
        message: 'OTP has expired' 
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordOTP = { code: null, expiresAt: null };
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error resetting password', 
      error: error.message 
    });
  }
};

// Export all controllers at the bottom
export {
  register,
  verifyEmailOTP,
  resendVerificationOTP,
  login,
  verifyTwoFactorOTP,
  forgotPassword,
  resetPassword
};