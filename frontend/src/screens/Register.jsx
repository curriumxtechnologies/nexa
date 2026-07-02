import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRegisterMutation } from '../slices/authApiSlice';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, Shield, Upload, X, ArrowRight, CheckCircle, Sparkles } from 'lucide-react';

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

      await register(formDataToSend).unwrap();
      
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
              <span className="text-[10px] text-gray-300 tracking-wider font-light">JOIN NEXA</span>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-light text-white mb-4 leading-tight">
              Start your<br />
              <span className="bg-gradient-to-r from-purple-300 to-purple-400 bg-clip-text text-transparent font-medium">
                email journey
              </span>
            </h1>
            
            <p className="text-gray-300 text-sm font-light max-w-sm leading-relaxed">
              Create your account and start sending emails with custom domains using Nexa's powerful platform.
            </p>
            
            <div className="mt-8 space-y-3">
              {[
                '100 free emails to start',
                'Custom domain support',
                'Enterprise-grade security'
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
              Already have an account?{' '}
              <a href="/login" className="text-purple-300 hover:text-purple-200 transition font-medium">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Right Section - Scrollable Form */}
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
            <div className="text-center mb-4">
              <h2 className="text-xl font-light text-white">
                Create account
              </h2>
              <p className="mt-0.5 text-xs text-gray-400 font-light">
                Start your journey with Nexa
              </p>
            </div>

            {error && (
              <div className="mb-3 p-2.5 bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-xl">
                <p className="text-sm text-red-400 font-light">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-2.5">
              {/* Profile Picture */}
              <div className="flex justify-center mb-2">
                <div className="relative">
                  {profilePreview ? (
                    <div className="relative">
                      <img
                        src={profilePreview}
                        alt="Profile preview"
                        className="w-16 h-16 rounded-full object-cover border-2 border-purple-500/30"
                      />
                      <button
                        type="button"
                        onClick={removeProfilePicture}
                        className="absolute -top-1 -right-1 bg-gray-800 text-gray-400 rounded-full p-1 hover:bg-gray-700 transition border border-gray-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer group">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border-2 border-dashed border-white/10 group-hover:border-purple-500/50 group-hover:bg-purple-500/10 transition">
                        <Upload className="w-5 h-5 text-gray-500 group-hover:text-purple-400 transition" />
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
                <label className="block text-xs font-medium text-gray-400 mb-0.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                  <input
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 outline-none transition text-sm text-white placeholder-gray-500"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Email */}
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

              {/* Phone */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-0.5">
                  Phone Number <span className="text-gray-500 font-light">(Optional)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                  <input
                    name="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 outline-none transition text-sm text-white placeholder-gray-500"
                    placeholder="+234 800 000 0000"
                  />
                </div>
              </div>

              {/* Password */}
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
                <p className="mt-0.5 text-[10px] text-gray-500 font-light">Minimum 6 characters</p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-0.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-9 pr-9 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 outline-none transition text-sm text-white placeholder-gray-500"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-3.5 h-3.5 text-gray-500 hover:text-gray-300 transition" />
                    ) : (
                      <Eye className="w-3.5 h-3.5 text-gray-500 hover:text-gray-300 transition" />
                    )}
                  </button>
                </div>
              </div>

              {/* 2FA Toggle */}
              <div className="flex items-center justify-between p-2.5 bg-white/5 rounded-lg border border-white/5">
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-300 font-light">2-Step Verification</p>
                    <p className="text-[10px] text-gray-500 font-light">Extra security layer</p>
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
                  <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500"></div>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 flex items-center justify-center gap-2 text-sm"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Footer Links */}
            <div className="mt-3 text-center">
              <p className="text-[10px] text-gray-500 font-light">
                By signing up, you agree to our{' '}
                <button
                  type="button"
                  onClick={openTerms}
                  className="text-gray-400 hover:text-purple-400 transition font-medium"
                >
                  Terms
                </button>
                {' '}and{' '}
                <button
                  type="button"
                  onClick={openPrivacy}
                  className="text-gray-400 hover:text-purple-400 transition font-medium"
                >
                  Privacy Policy
                </button>
              </p>
            </div>

            {/* Mobile Sign In */}
            <div className="lg:hidden mt-3 text-center pt-3 border-t border-white/5">
              <p className="text-sm text-gray-400 font-light">
                Already have an account?{' '}
                <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Terms Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1a1a2e] rounded-2xl shadow-2xl w-full max-w-2xl p-6 relative max-h-[90vh] flex flex-col border border-white/10">
            <button onClick={closeTerms} className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 transition">
              <X className="h-6 w-6" />
            </button>
            <div className="mb-4">
              <h3 className="text-2xl font-light text-white">Terms of Service</h3>
              <p className="text-sm text-gray-400 font-light">Last updated: January 2026</p>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-gray-400 text-sm font-light leading-relaxed">
              <p><strong className="text-white">1. Acceptance of Terms</strong><br />By using Nexa, you agree to these Terms. If you don't agree, please don't use our service.</p>
              <p><strong className="text-white">2. Description of Service</strong><br />Nexa provides email sending services via API. You may send emails through your custom domains.</p>
              <p><strong className="text-white">3. User Accounts</strong><br />You are responsible for your account credentials and all activities under your account.</p>
              <p><strong className="text-white">4. Acceptable Use</strong><br />You agree not to send spam, illegal content, or harmful material. We reserve the right to suspend accounts that violate this policy.</p>
              <p><strong className="text-white">5. Privacy</strong><br />Your data is handled as described in our Privacy Policy.</p>
              <p><strong className="text-white">6. Termination</strong><br />We may terminate or suspend your account at any time for violations.</p>
              <p><strong className="text-white">7. Changes to Terms</strong><br />We may update these terms; we'll notify you of significant changes.</p>
              <p><strong className="text-white">8. Contact</strong><br />For questions, contact us at support@nexa.com.</p>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 flex justify-end">
              <button onClick={closeTerms} className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition text-sm">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1a1a2e] rounded-2xl shadow-2xl w-full max-w-2xl p-6 relative max-h-[90vh] flex flex-col border border-white/10">
            <button onClick={closePrivacy} className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 transition">
              <X className="h-6 w-6" />
            </button>
            <div className="mb-4">
              <h3 className="text-2xl font-light text-white">Privacy Policy</h3>
              <p className="text-sm text-gray-400 font-light">Last updated: January 2026</p>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-gray-400 text-sm font-light leading-relaxed">
              <p><strong className="text-white">1. Information We Collect</strong><br />We collect your name, email, phone number, and profile picture. We also collect usage data for analytics.</p>
              <p><strong className="text-white">2. How We Use Your Information</strong><br />To provide email services, improve our platform, and communicate with you.</p>
              <p><strong className="text-white">3. Data Security</strong><br />We use industry-standard encryption and security measures to protect your data.</p>
              <p><strong className="text-white">4. Third-Party Sharing</strong><br />We do not sell your data. We may share with service providers (e.g., email delivery partners) to operate our service.</p>
              <p><strong className="text-white">5. Cookies</strong><br />We use cookies to improve user experience. You can manage cookie preferences.</p>
              <p><strong className="text-white">6. Your Rights</strong><br />You can access, correct, or delete your personal data by contacting us.</p>
              <p><strong className="text-white">7. Changes to Policy</strong><br />We'll notify you of material changes.</p>
              <p><strong className="text-white">8. Contact</strong><br />Privacy questions: <a href="mailto:privacy@lovohcreate.com" className="text-purple-400 hover:underline">privacy@lovohcreate.com</a></p>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 flex justify-end">
              <button onClick={closePrivacy} className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition text-sm">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;