import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRegisterMutation } from '../slices/authApiSlice';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, Shield, Upload, X } from 'lucide-react';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    enable2FA: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);

  // Modal states
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    setError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Profile picture must be less than 5MB');
        return;
      }
      
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('Only image files are allowed (JPEG, PNG, GIF, WEBP)');
        return;
      }
      
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProfilePicture = () => {
    setProfilePicture(null);
    setProfilePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('phoneNumber', formData.phoneNumber);
      formDataToSend.append('enable2FA', formData.enable2FA);
      if (profilePicture) {
        formDataToSend.append('profilePicture', profilePicture);
      }

      const result = await register(formDataToSend).unwrap();
      
      localStorage.setItem('pendingVerificationEmail', formData.email);
      navigate('/verify-email', { state: { email: formData.email } });
    } catch (err) {
      setError(err.data?.message || 'Registration failed. Please try again.');
    }
  };

  const openTerms = () => setShowTermsModal(true);
  const closeTerms = () => setShowTermsModal(false);
  const openPrivacy = () => setShowPrivacyModal(true);
  const closePrivacy = () => setShowPrivacyModal(false);

  return (
    <div className="flex h-screen overflow-hidden bg-purple-50">
      {/* Left Section - unchanged */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1557200134-90327ee9fafa?q=80&w=2070&auto=format&fit=crop")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 to-purple-800/80" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-between h-full w-full px-12 lg:px-16 xl:px-20 py-12 text-white">
          <div>
            <img 
              src="/nexa-logo.png" 
              alt="Nexa Logo" 
              className="h-12 w-auto brightness-0 invert"
            />
          </div>
          
          <div className="py-8">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              Join the Future of<br />
              <span className="text-purple-300">Email Communication</span>
            </h1>
            
            <p className="text-lg lg:text-xl text-white/90 mb-8 leading-relaxed">
              Create your account and start sending emails with custom domains using Nexa's powerful API.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-5 h-5 text-purple-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-white/90">Free trial with 100 emails/month</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-5 h-5 text-purple-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-white/90">Scalable pricing as you grow</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-5 h-5 text-purple-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-white/90">Enterprise-grade security</span>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/20">
            <p className="text-sm text-white/70">
              Join 10,000+ developers already using Nexa
            </p>
          </div>
        </div>
      </div>

      {/* Right Section - Scrollable Form */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        <div className="flex-1 overflow-y-auto px-6 py-8 lg:px-8">
          <div className="max-w-md mx-auto">
            <div className="lg:hidden flex justify-center mb-8">
              <img src="/nexa-logo.png" alt="Nexa Logo" className="h-10 w-auto" />
            </div>

            <div className="bg-white rounded-2xl">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-purple-800">
                  Create an account
                </h2>
                <p className="mt-2 text-gray-500">
                  Get started with Nexa today
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Profile Picture Upload */}
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    {profilePreview ? (
                      <div className="relative">
                        <img
                          src={profilePreview}
                          alt="Profile preview"
                          className="w-24 h-24 rounded-full object-cover border-4 border-purple-200"
                        />
                        <button
                          type="button"
                          onClick={removeProfilePicture}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center border-4 border-purple-200 hover:bg-purple-200 transition">
                          <Upload className="w-8 h-8 text-purple-500" />
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-purple-400" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition bg-gray-50 hover:bg-white"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-purple-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition bg-gray-50 hover:bg-white"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-purple-400" />
                    </div>
                    <input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition bg-gray-50 hover:bg-white"
                      placeholder="+1234567890"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-purple-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition bg-gray-50 hover:bg-white"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-purple-500" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-purple-500" />
                      )}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Must be at least 6 characters</p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-purple-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition bg-gray-50 hover:bg-white"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-purple-500" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-purple-500" />
                      )}
                    </button>
                  </div>
                </div>

                {/* 2FA Toggle */}
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Enable 2-Step Verification</p>
                      <p className="text-xs text-gray-500">Add an extra layer of security</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="enable2FA"
                      checked={formData.enable2FA}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg mt-6"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating account...
                    </span>
                  ) : (
                    'Sign up'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Already have an account?{' '}
                  <Link to="/login" className="text-purple-600 hover:text-purple-700 font-semibold">
                    Sign in
                  </Link>
                </p>
              </div>

              <div className="mt-4 text-center text-xs text-gray-400 pb-4">
                By signing up, you agree to our{' '}
                <button
                  type="button"
                  onClick={openTerms}
                  className="text-purple-500 hover:text-purple-600 underline-offset-2 hover:underline focus:outline-none"
                >
                  Terms of Service
                </button>{' '}
                and{' '}
                <button
                  type="button"
                  onClick={openPrivacy}
                  className="text-purple-500 hover:text-purple-600 underline-offset-2 hover:underline focus:outline-none"
                >
                  Privacy Policy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== TERMS OF SERVICE MODAL ===== */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 relative max-h-[90vh] flex flex-col">
            <button
              onClick={closeTerms}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="mb-4">
              <h3 className="text-2xl font-bold text-purple-800">Terms of Service</h3>
              <p className="text-sm text-gray-500">Last updated: January 2026</p>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-gray-700 text-sm leading-relaxed">
              <p>
                <strong>1. Acceptance of Terms</strong><br />
                By using Nexa, you agree to these Terms. If you don't agree, please don't use our service.
              </p>
              <p>
                <strong>2. Description of Service</strong><br />
                Nexa provides email sending services via API. You may send emails through your custom domains.
              </p>
              <p>
                <strong>3. User Accounts</strong><br />
                You are responsible for your account credentials and all activities under your account.
              </p>
              <p>
                <strong>4. Acceptable Use</strong><br />
                You agree not to send spam, illegal content, or harmful material. We reserve the right to suspend accounts that violate this policy.
              </p>
              <p>
                <strong>5. Privacy</strong><br />
                Your data is handled as described in our Privacy Policy.
              </p>
              <p>
                <strong>6. Termination</strong><br />
                We may terminate or suspend your account at any time for violations.
              </p>
              <p>
                <strong>7. Changes to Terms</strong><br />
                We may update these terms; we'll notify you of significant changes.
              </p>
              <p>
                <strong>8. Contact</strong><br />
                For questions, contact us at support@nexa.com.
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={closeTerms}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== PRIVACY POLICY MODAL ===== */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 relative max-h-[90vh] flex flex-col">
            <button
              onClick={closePrivacy}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="mb-4">
              <h3 className="text-2xl font-bold text-purple-800">Privacy Policy</h3>
              <p className="text-sm text-gray-500">Last updated: January 2026</p>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-gray-700 text-sm leading-relaxed">
              <p>
                <strong>1. Information We Collect</strong><br />
                We collect your name, email, phone number, and profile picture. We also collect usage data for analytics.
              </p>
              <p>
                <strong>2. How We Use Your Information</strong><br />
                To provide email services, improve our platform, and communicate with you.
              </p>
              <p>
                <strong>3. Data Security</strong><br />
                We use industry-standard encryption and security measures to protect your data.
              </p>
              <p>
                <strong>4. Third-Party Sharing</strong><br />
                We do not sell your data. We may share with service providers (e.g., email delivery partners) to operate our service.
              </p>
              <p>
                <strong>5. Cookies</strong><br />
                We use cookies to improve user experience. You can manage cookie preferences.
              </p>
              <p>
                <strong>6. Your Rights</strong><br />
                You can access, correct, or delete your personal data by contacting us.
              </p>
              <p>
                <strong>7. Changes to Policy</strong><br />
                We'll notify you of material changes.
              </p>
              <p>
                <strong>8. Contact</strong><br />
                Privacy questions: <a href="mailto:privacy@lovohcreate.com" className="text-purple-600 hover:underline">privacy@lovohcreate.com</a>
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={closePrivacy}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;