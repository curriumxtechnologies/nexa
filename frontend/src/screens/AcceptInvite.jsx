import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAcceptInvitationMutation } from '../slices/emailApiSlice';
import { CheckCircle, XCircle, Loader2, Mail, ArrowRight, LogIn } from 'lucide-react';

const AcceptInvite = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [acceptInvitation, { isLoading }] = useAcceptInvitationMutation();

  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [invitedEmail, setInvitedEmail] = useState('');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // If not logged in, don't call the API at all — just show login prompt
    if (!userInfo) {
      setStatus('requires-login');
      return;
    }

    // Prevent calling if already processed
    if (status !== 'idle') return;

    const acceptInvite = async () => {
      setStatus('loading');
      try {
        const result = await acceptInvitation({
          token,
          userId: userInfo._id,
          email: userInfo.email,
        }).unwrap();

        setStatus('success');
        setMessage(result.message || 'Invitation accepted successfully!');

        const interval = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              navigate('/team');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(interval);
      } catch (err) {
        if (err.data?.expectedEmail) {
          setStatus('email-mismatch');
          setMessage(err.data?.message || 'This invitation is for a different email account');
          setInvitedEmail(err.data?.expectedEmail);
        } else {
          setStatus('error');
          setMessage(err.data?.message || 'Invalid or expired invitation');
        }
      }
    };

    acceptInvite();
  }, [userInfo]); // only re-run when login state changes

  // Loading
  if (status === 'loading' || status === 'idle') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Mail className="w-10 h-10 text-purple-600" />
          </div>
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Verifying your invitation...</p>
          <p className="text-sm text-gray-400 mt-1">Please wait while we confirm your access</p>
        </div>
      </div>
    );
  }

  // Requires Login
  if (status === 'requires-login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-10 h-10 text-yellow-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-2">Login Required</h1>
          <p className="text-gray-600 mb-4">You need to be logged in to accept this invitation.</p>

          <div className="bg-yellow-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-700">
              Make sure to log in with the account that received this invitation.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/login', { state: { from: `/accept-invitation/${token}` } })}
              className="w-full py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition flex items-center justify-center space-x-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Go to Login</span>
            </button>

            <button
              onClick={() => navigate('/register')}
              className="w-full py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
            >
              Create an Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Email Mismatch
  if (status === 'email-mismatch') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-2">Wrong Account</h1>
          <p className="text-gray-600 mb-4">{message}</p>

          <div className="bg-red-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-700">
              This invitation was sent to <strong>{invitedEmail}</strong>.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/login', { state: { from: `/accept-invitation/${token}` } })}
              className="w-full py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition"
            >
              Switch Account
            </button>

            <button
              onClick={() => navigate('/')}
              className="w-full py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Nexa! 🎉</h1>
          <p className="text-gray-600 mb-6">{message}</p>

          <div className="bg-green-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-700">
              You now have access to the team's domain emails.
              You can start sending and receiving emails immediately.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/team')}
              className="w-full py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition flex items-center justify-center space-x-2"
            >
              <span>Go to Team Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-xs text-gray-400">Redirecting in {countdown} seconds...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-10 h-10 text-red-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">Invitation Failed</h1>
        <p className="text-gray-600 mb-4">{message}</p>

        <div className="bg-amber-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-amber-700 font-medium mb-2">Possible reasons:</p>
          <ul className="text-xs text-amber-600 space-y-1 text-left list-disc list-inside">
            <li>The invitation link has expired (invitations are valid for 7 days)</li>
            <li>The invitation has already been used</li>
            <li>The invitation was cancelled by the team owner</li>
            <li>The link was copied incorrectly</li>
          </ul>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/login')}
            className="w-full py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition"
          >
            Go to Login
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default AcceptInvite;