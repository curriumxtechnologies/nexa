import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLoginMutation, useVerify2FAMutation } from '../slices/authApiSlice';
import { setCredentials } from '../slices/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Shield } from 'lucide-react';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [verify2FA, { isLoading: is2FALoading }] = useVerify2FAMutation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [userId, setUserId] = useState('');
  const [otpCode, setOtpCode] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
        navigate('/inbox');
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
      navigate('/inbox');
    } catch (err) {
      setError(err.data?.message || 'Invalid 2FA code. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen bg-purple-50">
      {/* Left Section - Writeup with Background */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("/email-background.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-purple-900/85" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-12 lg:px-16 xl:px-20 text-white">
          <div className="mb-8">
            <img 
              src="/nexa-logo.png" 
              alt="Nexa Logo" 
              className="h-12 w-auto brightness-0 invert"
            />
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            Email Communication<br />
            <span className="text-purple-300">Reimagined</span>
          </h1>
          
          <p className="text-lg lg:text-xl text-white/90 mb-8 leading-relaxed">
            Send emails with your custom domain using Nexa's powerful API. 
            Built for developers and companies who need reliable email delivery 
            at scale.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                <svg className="w-5 h-5 text-purple-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-white/90">Custom domain email sending</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                <svg className="w-5 h-5 text-purple-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-white/90">Resend API integration</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                <svg className="w-5 h-5 text-purple-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-white/90">2-Step verification for security</span>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-sm text-white/70">
              Trusted by developers and companies worldwide
            </p>
          </div>
        </div>
      </div>

      {/* Right Section - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-8 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <img src="/nexa-logo.png" alt="Nexa Logo" className="h-10 w-auto" />
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-purple-800">
                {requiresTwoFactor ? '2-Step Verification' : 'Welcome back'}
              </h2>
              <p className="mt-2 text-gray-500">
                {requiresTwoFactor 
                  ? 'Enter the 6-digit code sent to your email' 
                  : 'Sign in to your account to continue'}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {!requiresTwoFactor ? (
              <form onSubmit={handleSubmit} className="space-y-5">
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
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600">
                      Remember me
                    </label>
                  </div>
                  <Link to="/forgot-password" className="text-sm text-purple-600 hover:text-purple-700 font-semibold">
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isLoginLoading}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                  {isLoginLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerify2FA} className="space-y-5">
                <div>
                  <label htmlFor="otp" className="block text-sm font-semibold text-gray-700 mb-2">
                    Verification Code
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Shield className="h-5 w-5 text-purple-400" />
                    </div>
                    <input
                      id="otp"
                      name="otp"
                      type="text"
                      required
                      maxLength="6"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition bg-gray-50 hover:bg-white text-center text-2xl tracking-widest font-mono"
                      placeholder="000000"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Enter the 6-digit code sent to your email
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={is2FALoading || otpCode.length !== 6}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                  {is2FALoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </span>
                  ) : (
                    'Verify & Continue'
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRequiresTwoFactor(false);
                    setOtpCode('');
                    setUserId('');
                  }}
                  className="w-full text-center text-sm text-purple-600 hover:text-purple-700 font-semibold"
                >
                  ← Back to login
                </button>
              </form>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Don't have an account?{' '}
                <Link to="/register" className="text-purple-600 hover:text-purple-700 font-semibold">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;