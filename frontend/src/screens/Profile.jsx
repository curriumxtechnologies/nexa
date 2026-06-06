import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useGetProfileQuery, useUpdateProfileMutation, useChangePasswordMutation, useToggleUser2FAMutation } from '../slices/userApiSlice';
import { logout } from '../slices/authSlice';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Shield, 
  Camera, 
  Save, 
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Calendar,
  LogOut
} from 'lucide-react';
import { format } from 'date-fns';

const Profile = () => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  
  const { data: profileData, isLoading: profileLoading, error: profileError, refetch } = useGetProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();
  const [toggle2FA, { isLoading: isToggling2FA }] = useToggleUser2FAMutation();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [show2FAModal, setShow2FAModal] = useState(false);

  // Use profileData from API or fallback to userInfo from Redux
  // Check the actual structure of your data
  const user = profileData?.data || userInfo?.user || userInfo;

  console.log('Profile Data:', profileData);
  console.log('User Info from Redux:', userInfo);
  console.log('Final user object:', user);
  console.log('User name:', user?.name);
  console.log('User email:', user?.email);
  console.log('User phone:', user?.phoneNumber);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
      });
      if (user.profilePicture?.url) {
        setProfilePreview(user.profilePicture.url);
      }
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
    setSuccess('');
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
    setError('');
    setSuccess('');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('phoneNumber', formData.phoneNumber);
      if (profilePicture) {
        formDataToSend.append('profilePicture', profilePicture);
      }

      const result = await updateProfile(formDataToSend).unwrap();
      dispatch(setCredentials(result.data));
      setSuccess('Profile updated successfully');
      setIsEditing(false);
      setProfilePicture(null);
      refetch();
    } catch (err) {
      setError(err.data?.message || 'Failed to update profile');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      }).unwrap();
      setSuccess('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setIsChangingPass(false);
    } catch (err) {
      setError(err.data?.message || 'Failed to change password');
    }
  };

  const handleToggle2FA = async () => {
    try {
      await toggle2FA({ enable: !user?.isTwoFactorEnabled }).unwrap();
      refetch();
      setShow2FAModal(false);
      setSuccess(`2FA ${!user?.isTwoFactorEnabled ? 'enabled' : 'disabled'} successfully`);
    } catch (err) {
      setError(err.data?.message || 'Failed to toggle 2FA');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
    });
    setProfilePreview(user?.profilePicture?.url || null);
    setProfilePicture(null);
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  const handleCancelPassword = () => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setIsChangingPass(false);
    setError('');
    setSuccess('');
  };

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = '/login';
  };

  if (profileError) {
    console.error('Profile fetch error:', profileError);
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 mb-2">Failed to load profile</p>
          <p className="text-gray-500 text-sm">Please try again later</p>
          <button 
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4 lg:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <User className="w-6 h-6 text-purple-600" />
              <h1 className="text-xl font-semibold text-gray-800">Profile</h1>
            </div>
            <div className="flex items-center space-x-2">
              {!isEditing && !isChangingPass && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 lg:px-6">
        <div className="max-w-3xl mx-auto">
          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Cover / Profile Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 h-32 relative">
              <div className="absolute -bottom-12 left-6">
                <div className="relative">
                  {isEditing ? (
                    <label className="cursor-pointer">
                      <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
                        {profilePreview ? (
                          <img
                            src={profilePreview}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Camera className="w-8 h-8 text-purple-600" />
                        )}
                      </div>
                      <div className="absolute bottom-0 right-0 bg-purple-600 rounded-full p-1 border-2 border-white">
                        <Camera className="w-3 h-3 text-white" />
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
                      {profilePreview ? (
                        <img
                          src={profilePreview}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-12 h-12 text-purple-600" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="pt-16 pb-6 px-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <p className="text-sm text-green-600">{success}</p>
                </div>
              )}

              {isEditing ? (
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
                          placeholder="Your name"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="tel"
                          name="phoneNumber"
                          value={formData.phoneNumber || ''}
                          onChange={handleChange}
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
                          placeholder="+1 234 567 8900"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 pt-2">
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isUpdating}
                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
                      >
                        {isUpdating ? (
                          <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                        ) : (
                          'Save Changes'
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              ) : isChangingPass ? (
                <form onSubmit={handlePasswordSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="password"
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
                          placeholder="Enter current password"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="password"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
                          placeholder="Enter new password"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="password"
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
                          placeholder="Confirm new password"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 pt-2">
                      <button
                        type="button"
                        onClick={handleCancelPassword}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isChangingPassword}
                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
                      >
                        {isChangingPassword ? (
                          <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                        ) : (
                          'Change Password'
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <>
                  {/* User Info Display */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-500">Name</span>
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700 font-medium">
                          {user?.name || 'Not provided'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-500">Email</span>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">
                          {user?.email || 'Not provided'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-500">Phone</span>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">
                          {user?.phoneNumber || 'Not provided'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-500">Member Since</span>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">
                          {user?.createdAt ? format(new Date(user.createdAt), 'MMMM d, yyyy') : 'Not available'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-500">Email Verified</span>
                      <span className="flex items-center">
                        {user?.isEmailVerified ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-yellow-500" />
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-500">2-Step Verification</span>
                      <button
                        onClick={() => setShow2FAModal(true)}
                        className="flex items-center space-x-1 text-purple-600 hover:text-purple-700"
                      >
                        <Shield className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {user?.isTwoFactorEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 space-y-3">
                    <button
                      onClick={() => setIsChangingPass(true)}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Change Password</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2FA Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-purple-600" />
                  <h2 className="text-xl font-semibold text-gray-800">Two-Factor Authentication</h2>
                </div>
                <button
                  onClick={() => setShow2FAModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-gray-600">
                  Add an extra layer of security to your account by requiring a verification code on each login.
                </p>
                
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-700">
                    <strong>Note:</strong> When enabled, you will receive a 6-digit code via email each time you log in.
                  </p>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Current Status</span>
                  <span className={`text-sm font-medium ${user?.isTwoFactorEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                    {user?.isTwoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <button
                    onClick={() => setShow2FAModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleToggle2FA}
                    disabled={isToggling2FA}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
                  >
                    {isToggling2FA ? (
                      <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                    ) : (
                      user?.isTwoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;