import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  useLoginMutation,
  useVerify2FAMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} from '../slices/authApiSlice';
import { setCredentials } from '../slices/authSlice';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Shield, X, Sparkles, CheckCircle, ArrowRight } from 'lucide-react';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/inbox';

  // Auth mutations
  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [verify2FA, { isLoading: is2FALoading }] = useVerify2FAMutation();
  const [forgotPassword, { isLoading: isForgotLoading }] =
    useForgotPasswordMutation();
  const [resetPassword, { isLoading: isResetLoading }] =
    useResetPasswordMutation();

  // Login state
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [userId, setUserId] = useState('');
  const [otpCode, setOtpCode] = useState('');

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState('email'); // 'email' | 'reset'
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  // --- Login handlers ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const result = await login(formData).unwrap();
      if (result.requiresTwoFactor) {
        setRequiresTwoFactor(true);
        setUserId(result.userId);
      } else {
        dispatch(setCredentials(result.data));
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.data?.message || 'Login failed. Please try again.');
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const result = await verify2FA({ userId, otp: otpCode }).unwrap();
      dispatch(setCredentials(result.data));
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.data?.message || 'Invalid 2FA code. Please try again.');
    }
  };

  // --- Forgot password modal handlers ---
  const openForgotModal = () => {
    setShowForgotModal(true);
    setForgotStep('email');
    setForgotEmail('');
    setResetOtp('');
    setResetNewPassword('');
    setResetConfirmPassword('');
    setForgotError('');
    setForgotSuccess('');
  };

  const closeForgotModal = () => {
    setShowForgotModal(false);
    setForgotStep('email');
    setForgotEmail('');
    setResetOtp('');
    setResetNewPassword('');
    setResetConfirmPassword('');
    setForgotError('');
    setForgotSuccess('');
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    try {
      await forgotPassword({ email: forgotEmail }).unwrap();
      setForgotSuccess('OTP sent to your email. Please check your inbox.');
      setForgotStep('reset');
    } catch (err) {
      setForgotError(err.data?.message || 'Failed to send OTP. Try again.');
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');

    if (resetNewPassword !== resetConfirmPassword) {
      setForgotError('Passwords do not match.');
      return;
    }
    if (resetNewPassword.length < 6) {
      setForgotError('Password must be at least 6 characters.');
      return;
    }

    try {
      await resetPassword({
        email: forgotEmail,
        otp: resetOtp,
        newPassword: resetNewPassword,
      }).unwrap();
      setForgotSuccess('Password reset successfully! You can now login.');
      setTimeout(() => {
        closeForgotModal();
      }, 2000);
    } catch (err) {
      setForgotError(err.data?.message || 'Failed to reset password. Try again.');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a0f]">
      {/* Left Section - Full Height with Image */}
      <div className="hidden lg:flex lg:w-1/2 h-full relative overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1557200134-90327ee9fafa?q=80&w=2070&auto=format&fit=crop"
            alt="Email illustration"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 via-[#0a0a0f]/70 to-[#0a0a0f]/90" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-between h-full w-full px-12 lg:px-16 xl:px-20 py-12">
          <div>
            <img 
              src="/nexa-logo.png" 
              alt="Nexa Logo" 
              className="h-10 w-auto brightness-0 invert"
            />
          </div>
          
          <div className="py-8 flex-1 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-4 py-1.5 mb-6 w-fit">
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              <span className="text-[10px] text-gray-300 tracking-wider font-light">WELCOME BACK</span>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-light text-white mb-4 leading-tight">
              Sign in to<br />
              <span className="bg-gradient-to-r from-purple-300 to-purple-400 bg-clip-text text-transparent font-medium">
                your account
              </span>
            </h1>
            
            <p className="text-gray-300 text-sm font-light max-w-sm leading-relaxed">
              Access your Nexa dashboard and start managing your email with custom domains.
            </p>
            
            <div className="mt-8 space-y-3">
              {[
                'Custom domain email sending',
                'Resend API integration',
                '2-Step verification for security'
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm text-gray-300 font-light">
                  <div className="w-5 h-5 rounded-full bg-purple-500/30 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-3 h-3 text-purple-300" />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/10">
            <p className="text-xs text-gray-400 font-light">
              Don't have an account?{' '}
              <Link to="/register" className="text-purple-300 hover:text-purple-200 transition font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="flex-1 flex items-start justify-center p-4 sm:p-6 overflow-y-auto bg-[#0a0a0f] min-h-screen">
        <div className="w-full max-w-md py-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-6">
            <img 
              src="/nexa-logo.png" 
              alt="Nexa Logo" 
              className="h-10 w-auto brightness-0 invert"
            />
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5 sm:p-6 shadow-2xl">
            <div className="text-center mb-5">
              <h2 className="text-xl font-light text-white">
                {requiresTwoFactor ? '2-Step Verification' : 'Sign in'}
              </h2>
              <p className="mt-0.5 text-xs text-gray-400 font-light">
                {requiresTwoFactor
                  ? 'Enter the 6-digit code sent to your email'
                  : 'Welcome back to Nexa'}
              </p>
            </div>

            {error && (
              <div className="mb-3 p-2.5 bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-xl">
                <p className="text-sm text-red-400 font-light">{error}</p>
              </div>
            )}

            {!requiresTwoFactor ? (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-0.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                    <input
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 outline-none transition text-sm text-white placeholder-gray-500"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-0.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-9 pr-9 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 outline-none transition text-sm text-white placeholder-gray-500"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? (
                        <EyeOff className="w-3.5 h-3.5 text-gray-500 hover:text-gray-300 transition" />
                      ) : (
                        <Eye className="w-3.5 h-3.5 text-gray-500 hover:text-gray-300 transition" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-3.5 w-3.5 bg-white/5 border border-white/10 rounded focus:ring-purple-500 focus:ring-1"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-xs text-gray-400 font-light">
                      Remember me
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={openForgotModal}
                    className="text-xs text-purple-400 hover:text-purple-300 transition font-medium"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoginLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 flex items-center justify-center gap-2 text-sm"
                >
                  {isLoginLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerify2FA} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-0.5">
                    Verification Code
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                    <input
                      type="text"
                      required
                      maxLength="6"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 outline-none transition text-sm text-white placeholder-gray-500 text-center text-2xl tracking-widest font-mono"
                      placeholder="000000"
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-gray-500 font-light">Enter the 6-digit code sent to your email</p>
                </div>

                <button
                  type="submit"
                  disabled={is2FALoading || otpCode.length !== 6}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 flex items-center justify-center gap-2 text-sm"
                >
                  {is2FALoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Verifying...
                    </>
                  ) : (
                    'Verify & Continue'
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => { setRequiresTwoFactor(false); setOtpCode(''); setUserId(''); }}
                  className="w-full text-center text-xs text-purple-400 hover:text-purple-300 transition font-medium"
                >
                  ← Back to login
                </button>
              </form>
            )}

            {/* Mobile Sign Up */}
            <div className="lg:hidden mt-4 text-center pt-4 border-t border-white/5">
              <p className="text-sm text-gray-400 font-light">
                Don't have an account?{' '}
                <Link to="/register" className="text-purple-400 hover:text-purple-300 font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1a1a2e] rounded-2xl shadow-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto border border-white/10">
            <button
              onClick={closeForgotModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 transition"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="text-center mb-6">
              <h3 className="text-xl font-light text-white">
                {forgotStep === 'email' ? 'Reset Password' : 'Enter OTP'}
              </h3>
              <p className="text-xs text-gray-400 font-light mt-1">
                {forgotStep === 'email'
                  ? 'Enter your email to receive a 6-digit OTP'
                  : 'Check your email for the OTP and set a new password'}
              </p>
            </div>

            {forgotError && (
              <div className="mb-4 p-2.5 bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-400 font-light">{forgotError}</p>
              </div>
            )}
            {forgotSuccess && (
              <div className="mb-4 p-2.5 bg-green-500/10 backdrop-blur-sm border border-green-500/20 rounded-lg">
                <p className="text-sm text-green-400 font-light">{forgotSuccess}</p>
              </div>
            )}

            {forgotStep === 'email' ? (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-0.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 outline-none transition text-sm text-white placeholder-gray-500"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isForgotLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20 text-sm"
                >
                  {isForgotLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    'Send OTP'
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-0.5">
                    OTP Code
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                    <input
                      type="text"
                      required
                      maxLength="6"
                      value={resetOtp}
                      onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 outline-none transition text-sm text-white placeholder-gray-500 text-center text-2xl tracking-widest font-mono"
                      placeholder="000000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-0.5">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                    <input
                      type="password"
                      required
                      value={resetNewPassword}
                      onChange={(e) => setResetNewPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 outline-none transition text-sm text-white placeholder-gray-500"
                      placeholder="Min 6 characters"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-0.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                    <input
                      type="password"
                      required
                      value={resetConfirmPassword}
                      onChange={(e) => setResetConfirmPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 outline-none transition text-sm text-white placeholder-gray-500"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isResetLoading || resetOtp.length !== 6 || resetNewPassword.length < 6 || resetNewPassword !== resetConfirmPassword}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20 text-sm"
                >
                  {isResetLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Resetting...
                    </span>
                  ) : (
                    'Reset Password'
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setForgotStep('email')}
                  className="w-full text-center text-xs text-purple-400 hover:text-purple-300 transition font-medium"
                >
                  ← Back to email
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;