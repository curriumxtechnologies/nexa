import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationOTP = async (email, name, otp) => {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Verify your email - OTP Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Our Platform!</h2>
          <p>Hello ${name},</p>
          <p>Thank you for registering. Please use the following OTP to verify your email address:</p>
          <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px;">
            ${otp}
          </div>
          <p>This OTP is valid for 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr />
          <p style="color: #666; font-size: 12px;">Best regards,<br/>Your Team</p>
        </div>
      `
    });
    return { success: true };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, error: error.message };
  }
};

export const sendTwoFactorOTP = async (email, name, otp) => {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: '2-Step Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>2-Step Verification</h2>
          <p>Hello ${name},</p>
          <p>Your 2-step verification code is:</p>
          <div style="background-color: #f4f4f4; padding: 15px; font-size: 32px; font-weight: bold; text-align: center;">
            ${otp}
          </div>
          <p>This code is valid for 10 minutes.</p>
          <p>If you didn't attempt to login, please change your password immediately.</p>
        </div>
      `
    });
    return { success: true };
  } catch (error) {
    console.error('Error sending 2FA email:', error);
    return { success: false, error: error.message };
  }
};

export const sendResetPasswordOTP = async (email, name, otp) => {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Password Reset OTP',
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Password Reset Request</h2>
          <p>Hello ${name},</p>
          <p>You requested to reset your password. Use this OTP:</p>
          <div style="background-color: #f4f4f4; padding: 15px; font-size: 32px; font-weight: bold; text-align: center;">
            ${otp}
          </div>
          <p>Valid for 15 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `
    });
    return { success: true };
  } catch (error) {
    console.error('Error sending reset password email:', error);
    return { success: false, error: error.message };
  }
};

export const sendResendVerificationOTP = async (email, name, otp) => {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'New Verification OTP',
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>New Verification Code</h2>
          <p>Hello ${name},</p>
          <p>Your new verification OTP is:</p>
          <div style="background-color: #f4f4f4; padding: 15px; font-size: 28px; font-weight: bold;">
            ${otp}
          </div>
          <p>Valid for 10 minutes.</p>
        </div>
      `
    });
    return { success: true };
  } catch (error) {
    console.error('Error resending verification email:', error);
    return { success: false, error: error.message };
  }
};