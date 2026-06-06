import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useVerifyEmailMutation, useResendVerificationMutation } from '../slices/authApiSlice';
import { Mail, RefreshCw, ArrowLeft } from 'lucide-react';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [verifyEmail, { isLoading: isVerifying }] = useVerifyEmailMutation();
  const [resendVerification, { isLoading: isResending }] = useResendVerificationMutation();
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const storedEmail = location.state?.email || localStorage.getItem('pendingVerificationEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      navigate('/register');
    }
  }, [location, navigate]);

  const handleOtpChange = (index, value) => {
    if (value && !/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(0, 1);
    setOtp(newOtp);
    
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }
    
    try {
      await verifyEmail({ email, otp: otpCode }).unwrap();
      setSuccess('Email verified successfully! Redirecting...');
      localStorage.removeItem('pendingVerificationEmail');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.data?.message || 'Invalid verification code. Please try again.');
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setSuccess('');
    
    try {
      await resendVerification({ email }).unwrap();
      setSuccess('New verification code sent to your email!');
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    } catch (err) {
      setError(err.data?.message || 'Failed to resend code. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-purple-50 flex flex-col">
      {/* Mobile Header */}
      <div className="sticky top-0 z-10 bg-purple-50 px-4 py-3 md:hidden">
        <button onClick={() => navigate('/register')} className="p-1 -ml-1">
          <ArrowLeft className="w-5 h-5 text-purple-600" />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-4 md:px-6 md:py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg md:shadow-xl p-5 md:p-8">
            <div className="text-center mb-6 md:mb-8">
              <div className="mx-auto w-14 h-14 md:w-16 md:h-16 bg-purple-100 rounded-full flex items-center justify-center mb-3 md:mb-4">
                <Mail className="h-7 w-7 md:h-8 md:w-8 text-purple-600" />
              </div>
              <h2 className="text-xl md:text-3xl font-bold text-purple-800">
                Verify Your Email
              </h2>
              <p className="text-xs md:text-sm text-gray-500 mt-2">
                We've sent a 6-digit verification code to
              </p>
              <p className="text-sm md:text-base font-semibold text-purple-600 mt-1 break-all px-2">
                {email}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-2 md:p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs md:text-sm text-red-600">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 p-2 md:p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs md:text-sm text-green-600">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
              <div>
                <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2 md:mb-3 text-center">
                  Enter Verification Code
                </label>
                <div className="flex justify-center gap-1.5 md:gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      pattern="\d*"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-10 h-10 md:w-12 md:h-12 text-center text-xl md:text-2xl font-bold border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition bg-gray-50 hover:bg-white"
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 px-4 rounded-lg transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-sm md:text-base"
              >
                {isVerifying ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 md:h-5 md:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  'Verify Email'
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isResending}
                  className="text-purple-600 hover:text-purple-700 font-semibold text-xs md:text-sm inline-flex items-center gap-1.5"
                >
                  <RefreshCw className={`h-3.5 w-3.5 md:h-4 md:w-4 ${isResending ? 'animate-spin' : ''}`} />
                  {isResending ? 'Sending...' : 'Resend verification code'}
                </button>
              </div>
            </form>

            <div className="mt-5 md:mt-6 text-center">
              <p className="text-xs md:text-sm text-gray-500">
                Wrong email?{' '}
                <button
                  onClick={() => navigate('/register')}
                  className="text-purple-600 hover:text-purple-700 font-semibold"
                >
                  Go back to registration
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;