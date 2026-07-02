import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useGetProfileQuery, useUpdateProfileMutation, useChangePasswordMutation, useToggleTwoFactorMutation } from '../slices/userApiSlice';
import { setCredentials, logout } from '../slices/authSlice';
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
  LogOut,
  ChevronRight,
  Edit2,
  Eye,
  EyeOff
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

const Profile = () => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  
  const { data: profileData, isLoading: profileLoading, error: profileError, refetch } = useGetProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();
  const [toggleTwoFactor, { isLoading: isToggling2FA }] = useToggleTwoFactorMutation();
  
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
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [show2FAModal, setShow2FAModal] = useState(false);

  const user = profileData?.data || userInfo;

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

  const handleChange = useCallback((e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError('');
    setSuccess('');
  }, []);

  const handlePasswordChange = useCallback((e) => {
    setPasswordData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError('');
    setSuccess('');
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Profile picture must be less than 5MB');
        return;
      }
      
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only image files are allowed (JPEG, PNG, GIF, WEBP)');
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
      dispatch(setCredentials({ user: result.data, token: userInfo?.token }));
      toast.success('Profile updated successfully');
      setSuccess('Profile updated successfully');
      setIsEditing(false);
      setProfilePicture(null);
      refetch();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const errorMsg = err.data?.message || 'Failed to update profile';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      const errorMsg = 'New passwords do not match';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      const errorMsg = 'New password must be at least 6 characters';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      }).unwrap();
      
      toast.success('Password changed successfully');
      setSuccess('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setIsChangingPass(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const errorMsg = err.data?.message || 'Failed to change password';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleToggle2FA = async () => {
    try {
      const result = await toggleTwoFactor({ enable: !user?.isTwoFactorEnabled }).unwrap();
      refetch();
      setShow2FAModal(false);
      if (userInfo) {
        dispatch(setCredentials({ 
          user: { ...userInfo, isTwoFactorEnabled: result.data.isTwoFactorEnabled }, 
          token: userInfo.token 
        }));
      }
      const message = `2FA ${!user?.isTwoFactorEnabled ? 'enabled' : 'disabled'} successfully`;
      toast.success(message);
      setSuccess(message);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const errorMsg = err.data?.message || 'Failed to toggle 2FA';
      setError(errorMsg);
      toast.error(errorMsg);
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
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-500 mb-2">Failed to load profile</p>
          <button onClick={() => refetch()} className="mt-2 px-4 py-2 bg-purple-600 text-white text-sm rounded-lg">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-purple-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Mobile View — plain JSX variable, NOT a component function.
  // Defining these as components (e.g. const MobileView = () => (...))
  // makes React remount the whole tree on every keystroke, which is
  // what was stealing focus from your inputs.
  const mobileView = (
    <div className="md:hidden bg-gray-50 min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-purple-600" />
            <h1 className="text-base font-semibold text-gray-800">Profile</h1>
          </div>
          {!isEditing && !isChangingPass && (
            <button onClick={() => setIsEditing(true)} className="text-purple-600 text-sm">
              Edit
            </button>
          )}
        </div>
      </div>

      <div className="px-4 py-4">
        {error && (
          <div className="mb-4 p-2 bg-red-50 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-2 bg-green-50 rounded-lg flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <p className="text-xs text-green-600">{success}</p>
          </div>
        )}

        {/* Profile Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            {isEditing ? (
              <label className="cursor-pointer">
                <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center border-3 border-white shadow-md overflow-hidden">
                  {profilePreview ? (
                    <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-6 h-6 text-purple-600" />
                  )}
                </div>
                <div className="absolute bottom-0 right-0 bg-purple-600 rounded-full p-1 border-2 border-white">
                  <Camera className="w-3 h-3 text-white" />
                </div>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            ) : (
              <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center shadow-md overflow-hidden">
                {profilePreview ? (
                  <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-purple-600" />
                )}
              </div>
            )}
          </div>
          <h2 className="text-base font-semibold text-gray-800 mt-2">{user?.name || 'User'}</h2>
          <p className="text-xs text-gray-400">{user?.email}</p>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-400 outline-none"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-400 outline-none"
                placeholder="Not provided"
              />
            </div>
            <div className="flex space-x-3 pt-2">
              <button type="button" onClick={handleCancel} className="flex-1 px-3 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg">
                Cancel
              </button>
              <button type="submit" disabled={isUpdating} className="flex-1 px-3 py-2 bg-purple-600 text-white text-sm rounded-lg disabled:opacity-50">
                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Save'}
              </button>
            </div>
          </form>
        ) : isChangingPass ? (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500">Current Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-400 outline-none pr-9"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                  {showPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">New Password</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-400 outline-none pr-9"
                  required
                />
                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                  {showNewPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-400 outline-none pr-9"
                  required
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                  {showConfirmPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                </button>
              </div>
            </div>
            <div className="flex space-x-3 pt-2">
              <button type="button" onClick={handleCancelPassword} className="flex-1 px-3 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg">
                Cancel
              </button>
              <button type="submit" disabled={isChangingPassword} className="flex-1 px-3 py-2 bg-purple-600 text-white text-sm rounded-lg disabled:opacity-50">
                {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Update'}
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="space-y-3">
              <div className="bg-white rounded-lg border border-gray-100 p-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-50 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Name</p>
                    <p className="text-sm font-medium text-gray-800">{user?.name || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-100 p-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-50 rounded-full flex items-center justify-center">
                    <Mail className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Email</p>
                    <p className="text-sm font-medium text-gray-800">{user?.email || 'Not provided'}</p>
                  </div>
                </div>
                {user?.isEmailVerified ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                )}
              </div>

              <div className="bg-white rounded-lg border border-gray-100 p-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-50 rounded-full flex items-center justify-center">
                    <Phone className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Phone</p>
                    <p className="text-sm font-medium text-gray-800">{user?.phoneNumber || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-100 p-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-50 rounded-full flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Member Since</p>
                    <p className="text-sm font-medium text-gray-800">
                      {user?.createdAt ? format(new Date(user.createdAt), 'MMM d, yyyy') : 'Not available'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-100 p-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-50 rounded-full flex items-center justify-center">
                    <Shield className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">2-Step Verification</p>
                    <p className="text-sm font-medium text-gray-800">{user?.isTwoFactorEnabled ? 'Enabled' : 'Disabled'}</p>
                  </div>
                </div>
                <button onClick={() => setShow2FAModal(true)} className="text-purple-600">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <button
                onClick={() => setIsChangingPass(true)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-200 text-gray-700 text-sm rounded-lg"
              >
                <Lock className="w-4 h-4" />
                <span>Change Password</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-50 text-red-600 text-sm rounded-lg"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  // Desktop View — also a plain JSX variable, same reasoning as above.
  const desktopView = (
    <div className="hidden md:block min-h-screen bg-gray-50">
      <div className="px-6 py-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-purple-50 rounded-lg">
                  <User className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-800">Profile</h1>
                  <p className="text-xs text-gray-400">Manage your account information</p>
                </div>
              </div>
              {!isEditing && !isChangingPass && (
                <button onClick={() => setIsEditing(true)} className="flex items-center space-x-1 px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg">
                  <Edit2 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 rounded-lg flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 px-6 py-8 relative">
              <div className="absolute -bottom-12 left-6">
                {isEditing ? (
                  <label className="cursor-pointer">
                    <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
                      {profilePreview ? (
                        <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-8 h-8 text-purple-600" />
                      )}
                    </div>
                    <div className="absolute bottom-0 right-0 bg-purple-600 rounded-full p-1 border-2 border-white">
                      <Camera className="w-3 h-3 text-white" />
                    </div>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
                    {profilePreview ? (
                      <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-purple-600" />
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-16 pb-6 px-6">
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email (read-only)</label>
                      <input
                        type="email"
                        value={formData.email}
                        disabled
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none"
                      placeholder="Not provided"
                    />
                  </div>
                  <div className="flex space-x-3 pt-2">
                    <button type="button" onClick={handleCancel} className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg">Cancel</button>
                    <button type="submit" disabled={isUpdating} className="px-4 py-2 bg-purple-600 text-white rounded-lg disabled:opacity-50">
                      {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                    </button>
                  </div>
                </form>
              ) : isChangingPass ? (
                <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none pr-9"
                        required
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                        {showPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none pr-9"
                        required
                      />
                      <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                        {showNewPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm your Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none pr-9"
                        required
                      />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                        {showConfirmPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex space-x-3 pt-2">
                    <button type="button" onClick={handleCancelPassword} className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg">Cancel</button>
                    <button type="submit" disabled={isChangingPassword} className="px-4 py-2 bg-purple-600 text-white rounded-lg disabled:opacity-50">
                      {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Change Password'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                      <span className="text-sm text-gray-500">Name</span>
                      <span className="text-sm font-medium text-gray-800">{user?.name || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                      <span className="text-sm text-gray-500">Email</span>
                      <span className="text-sm font-medium text-gray-800">{user?.email || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                      <span className="text-sm text-gray-500">Phone</span>
                      <span className="text-sm font-medium text-gray-800">{user?.phoneNumber || 'Not provided'}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                      <span className="text-sm text-gray-500">Member Since</span>
                      <span className="text-sm font-medium text-gray-800">
                        {user?.createdAt ? format(new Date(user.createdAt), 'MMMM d, yyyy') : 'Not available'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                      <span className="text-sm text-gray-500">Email Verified</span>
                      {user?.isEmailVerified ? (
                        <span className="text-sm font-medium text-green-600 flex items-center gap-1">Yes <CheckCircle className="w-4 h-4" /></span>
                      ) : (
                        <span className="text-sm font-medium text-yellow-600 flex items-center gap-1">Pending <AlertCircle className="w-4 h-4" /></span>
                      )}
                    </div>
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                      <span className="text-sm text-gray-500">2-Step Verification</span>
                      <button onClick={() => setShow2FAModal(true)} className="text-sm font-medium text-purple-600 hover:text-purple-700">
                        {user?.isTwoFactorEnabled ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {!isEditing && !isChangingPass && (
                <div className="mt-6 pt-4 border-t border-gray-100 flex space-x-3">
                  <button onClick={() => setIsChangingPass(true)} className="flex items-center space-x-2 px-4 py-2 border border-gray-200 text-gray-700 text-sm rounded-lg">
                    <Lock className="w-4 h-4" />
                    <span>Change Password</span>
                  </button>
                  <button onClick={handleLogout} className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 text-sm rounded-lg">
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {mobileView}
      {desktopView}

      {/* 2FA Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-purple-50 rounded-lg">
                    <Shield className="w-4 h-4 text-purple-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800">Two-Factor Authentication</h2>
                </div>
                <button onClick={() => setShow2FAModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-gray-600">Add an extra layer of security to your account by requiring a verification code on each login.</p>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-xs text-yellow-700">When enabled, you will receive a 6-digit code via email each time you log in.</p>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Current Status</span>
                  <span className={`text-sm font-medium ${user?.isTwoFactorEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                    {user?.isTwoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center space-x-3 pt-2">
                  <button onClick={() => setShow2FAModal(false)} className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg">Close</button>
                  <button onClick={handleToggle2FA} disabled={isToggling2FA} className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg disabled:opacity-50">
                    {isToggling2FA ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (user?.isTwoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;