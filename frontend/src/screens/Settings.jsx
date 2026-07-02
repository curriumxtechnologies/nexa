// screens/Settings.jsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useGetSettingsQuery, useUpdateSettingsMutation, useUpdateEmailSignatureMutation } from '../slices/settingsApiSlice';
import { useGetNotificationPreferencesQuery, useUpdateEmailNotificationsMutation, useUpdatePushNotificationsMutation, useSendTestEmailMutation, useSendTestPushMutation } from '../slices/notificationsApiSlice';
import { useToggleTwoFactorMutation, useDeleteAccountMutation, useGetProfileQuery } from '../slices/userApiSlice';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { useMobilePushNotifications } from '../hooks/useMobilePushNotifications';
import { useTheme } from '../contexts/ThemeContext';
import { logout } from '../slices/authSlice';
import { 
  Settings as SettingsIcon,
  Bell,
  Moon,
  Sun,
  Globe,
  Shield,
  Database,
  Trash2,
  ChevronRight,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
  Mail,
  Lock,
  Smartphone,
  Languages,
  Save,
  Send,
  Palette,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  User,
  Key,
  LogOut,
  Zap,
  Monitor
} from 'lucide-react';

// ==================== DELETE ACCOUNT MODAL ====================

const DeleteAccountModal = ({ isOpen, onClose, onDelete, isDeleting }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleDelete = () => {
    if (!password) {
      setError('Please enter your password');
      return;
    }
    setError('');
    onDelete(password);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-red-50 dark:bg-red-900/30 rounded-lg">
                <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Delete Account</h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-400">
                <strong>Warning:</strong> This action cannot be undone. All your data will be permanently deleted.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Enter your password to confirm</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg focus:ring-2 focus:ring-red-400 outline-none dark:text-white" 
                placeholder="Your password" 
              />
              {error && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>}
            </div>
            <div className="flex space-x-3">
              <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={isDeleting} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50">
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== SETTINGS HOOK ====================

const useSettings = () => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const { isDarkMode, toggleTheme, setThemeMode, theme } = useTheme();
  
  // Settings API
  const { data: settingsData, isLoading: settingsLoading, refetch: refetchSettings } = useGetSettingsQuery();
  const [updateSettings, { isLoading: isUpdatingSettings }] = useUpdateSettingsMutation();
  const [updateEmailSignature, { isLoading: isUpdatingSignature }] = useUpdateEmailSignatureMutation();
  
  // Notifications API
  const { data: notificationsData, isLoading: notificationsLoading, refetch: refetchNotifications } = useGetNotificationPreferencesQuery();
  const [updateEmailNotifications, { isLoading: isUpdatingEmailNotif }] = useUpdateEmailNotificationsMutation();
  const [updatePushNotifications, { isLoading: isUpdatingPushNotif }] = useUpdatePushNotificationsMutation();
  const [sendTestEmail, { isLoading: isSendingTestEmail }] = useSendTestEmailMutation();
  const [sendTestPush, { isLoading: isSendingTestPush }] = useSendTestPushMutation();
  
  // User API
  const { data: profileData, refetch: refetchProfile } = useGetProfileQuery();
  const [toggleTwoFactor, { isLoading: isToggling2FA }] = useToggleTwoFactorMutation();
  const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();
  
  // Push notification hooks
  const isMobile = window.Capacitor?.isNativePlatform();
  const webPush = usePushNotifications();
  const mobilePush = useMobilePushNotifications();
  const push = isMobile ? mobilePush : webPush;
  
  // Local state
  const [settings, setSettings] = useState({
    language: 'en',
    autoSave: true,
    confirmBeforeSend: true
  });
  
  const [emailNotif, setEmailNotif] = useState({
    newEmail: true,
    loginAlerts: true,
    domainVerified: true,
    teamInvites: true,
    marketing: false
  });
  
  const [pushNotif, setPushNotif] = useState({
    enabled: false,
    newEmail: true,
    loginAlerts: true,
    domainVerified: false,
    teamInvites: true
  });
  
  const [emailSignature, setEmailSignature] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Load settings from API
  useEffect(() => {
    if (settingsData?.data) {
      const appearance = settingsData.data.appearance || {};
      const emailPref = settingsData.data.email || {};
      
      setSettings({
        language: appearance.language || 'en',
        autoSave: emailPref.autoSave ?? true,
        confirmBeforeSend: emailPref.confirmBeforeSend ?? true
      });
      
      setEmailSignature(emailPref.signature || '');
    }
  }, [settingsData]);

  // Load notification preferences from API
  useEffect(() => {
    if (notificationsData?.data) {
      const email = notificationsData.data.email || {};
      const push = notificationsData.data.push || {};
      
      setEmailNotif({
        newEmail: email.newEmail ?? true,
        loginAlerts: email.loginAlerts ?? true,
        domainVerified: email.domainVerified ?? true,
        teamInvites: email.teamInvites ?? true,
        marketing: email.marketing || false
      });
      
      setPushNotif({
        enabled: push.enabled || false,
        newEmail: push.newEmail ?? true,
        loginAlerts: push.loginAlerts ?? true,
        domainVerified: push.domainVerified || false,
        teamInvites: push.teamInvites ?? true
      });
    }
  }, [notificationsData]);

  // Load 2FA status from profile API
  useEffect(() => {
    if (profileData?.data?.isTwoFactorEnabled !== undefined) {
      setTwoFactorEnabled(profileData.data.isTwoFactorEnabled);
    } else if (userInfo?.isTwoFactorEnabled !== undefined) {
      setTwoFactorEnabled(userInfo.isTwoFactorEnabled);
    }
  }, [profileData, userInfo]);

  // Keep push notification enabled state in sync with subscription
  useEffect(() => {
    if (push.isSubscribed && pushNotif.enabled !== true) {
      setPushNotif(prev => ({ ...prev, enabled: true }));
    } else if (!push.isSubscribed && pushNotif.enabled) {
      setPushNotif(prev => ({ ...prev, enabled: false }));
    }
  }, [push.isSubscribed]);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleEmailNotifChange = (key, value) => {
    setEmailNotif(prev => ({ ...prev, [key]: value }));
  };

  const handlePushNotifChange = (key, value) => {
    setPushNotif(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setError('');
    setSuccess('');
    
    try {
      await updateSettings({
        appearance: {
          language: settings.language
        },
        email: {
          autoSave: settings.autoSave,
          confirmBeforeSend: settings.confirmBeforeSend
        }
      }).unwrap();
      
      await updateEmailSignature({ signature: emailSignature }).unwrap();
      await updateEmailNotifications(emailNotif).unwrap();
      await updatePushNotifications(pushNotif).unwrap();
      
      setSuccess('Settings saved successfully');
      setTimeout(() => setSuccess(''), 3000);
      
      refetchSettings();
      refetchNotifications();
    } catch (err) {
      setError(err.data?.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle2FA = async () => {
    try {
      const result = await toggleTwoFactor({ enable: !twoFactorEnabled }).unwrap();
      setTwoFactorEnabled(!twoFactorEnabled);
      await refetchProfile();
      setSuccess(`2FA ${!twoFactorEnabled ? 'enabled' : 'disabled'} successfully`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.data?.message || 'Failed to toggle 2FA');
    }
  };

  const handleSendTestEmail = async () => {
    try {
      await sendTestEmail().unwrap();
      setSuccess('Test email sent! Check your inbox.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.data?.message || 'Failed to send test email');
    }
  };

  const handleSendTestPush = async () => {
    try {
      await sendTestPush().unwrap();
      setSuccess('Test push notification sent!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.data?.message || 'Failed to send test push');
    }
  };

  const handleDeleteAccount = async (password) => {
    try {
      await deleteAccount({ password }).unwrap();
      dispatch(logout());
      window.location.href = '/login';
    } catch (err) {
      setDeleteError(err.data?.message || 'Failed to delete account');
    }
  };

  const handlePushToggle = async (checked) => {
    if (checked) {
      const success = await push.subscribe();
      if (success) {
        setPushNotif(prev => ({ ...prev, enabled: true }));
        setSuccess(`Push notifications enabled on ${isMobile ? 'your device' : 'this browser'}!`);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setPushNotif(prev => ({ ...prev, enabled: false }));
        setError('Please allow notifications in your settings.');
        setTimeout(() => setError(''), 4000);
      }
    } else {
      await push.unsubscribe();
      setPushNotif(prev => ({ ...prev, enabled: false }));
      setSuccess('Push notifications disabled.');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const isLoading = settingsLoading || notificationsLoading;

  return {
    // Theme
    isDarkMode,
    toggleTheme,
    setThemeMode,
    theme,
    
    // State
    settings,
    emailNotif,
    pushNotif,
    emailSignature,
    twoFactorEnabled,
    showDeleteModal,
    deletePassword,
    deleteError,
    success,
    error,
    isSaving,
    isMobile,
    push,
    isLoading,
    isDeleting,
    isSendingTestEmail,
    isSendingTestPush,
    isToggling2FA,
    
    // Setters
    setShowDeleteModal,
    setDeletePassword,
    setDeleteError,
    setEmailSignature,
    
    // Handlers
    handleSettingChange,
    handleEmailNotifChange,
    handlePushNotifChange,
    handleSaveSettings,
    handleToggle2FA,
    handleSendTestEmail,
    handleSendTestPush,
    handleDeleteAccount,
    handlePushToggle
  };
};

// ==================== THEME TOGGLE COMPONENT ====================

const ThemeToggle = ({ isDarkMode, toggleTheme, theme, setThemeMode }) => {
  const [showMenu, setShowMenu] = useState(false);

  const getIcon = () => {
    if (theme === 'dark') return <Moon className="w-4 h-4" />;
    if (theme === 'light') return <Sun className="w-4 h-4" />;
    return <Monitor className="w-4 h-4" />;
  };

  const getLabel = () => {
    if (theme === 'dark') return 'Dark';
    if (theme === 'light') return 'Light';
    return 'System';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
        aria-label="Toggle theme"
      >
        {getIcon()}
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
          <button
            onClick={() => {
              setThemeMode('light');
              setShowMenu(false);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300"
          >
            <Sun className="w-4 h-4" />
            <span>Light</span>
            {theme === 'light' && <CheckCircle className="w-3 h-3 ml-auto text-purple-600" />}
          </button>
          <button
            onClick={() => {
              setThemeMode('dark');
              setShowMenu(false);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300"
          >
            <Moon className="w-4 h-4" />
            <span>Dark</span>
            {theme === 'dark' && <CheckCircle className="w-3 h-3 ml-auto text-purple-600" />}
          </button>
          <button
            onClick={() => {
              setThemeMode('system');
              setShowMenu(false);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300"
          >
            <Monitor className="w-4 h-4" />
            <span>System</span>
            {theme === 'system' && <CheckCircle className="w-3 h-3 ml-auto text-purple-600" />}
          </button>
        </div>
      )}
    </div>
  );
};

// ==================== DESKTOP VIEW ====================

const DesktopSettings = ({ state }) => {
  const {
    settings,
    emailNotif,
    pushNotif,
    emailSignature,
    twoFactorEnabled,
    isDarkMode,
    theme,
    setThemeMode,
    isMobile,
    push,
    isSaving,
    isToggling2FA,
    isSendingTestEmail,
    isSendingTestPush,
    error,
    success,
    handleSettingChange,
    handleEmailNotifChange,
    handlePushNotifChange,
    handleSaveSettings,
    handleToggle2FA,
    handleSendTestEmail,
    handleSendTestPush,
    handlePushToggle,
    setEmailSignature,
    setShowDeleteModal
  } = state;

  return (
    <div className="hidden md:block min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="px-6 py-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                  <SettingsIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-800 dark:text-white">Settings</h1>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Manage your account preferences</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <ThemeToggle 
                  isDarkMode={isDarkMode} 
                  theme={theme} 
                  setThemeMode={setThemeMode} 
                />
                <button 
                  onClick={handleSaveSettings} 
                  disabled={isSaving} 
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400" />
              <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Appearance */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
                <div className="px-5 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    <Palette className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <h2 className="text-sm font-semibold text-gray-800 dark:text-white">Appearance</h2>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {isDarkMode ? <Moon className="w-4 h-4 text-gray-500 dark:text-gray-400" /> : <Sun className="w-4 h-4 text-gray-500 dark:text-gray-400" />}
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Dark Mode</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">Switch between light and dark theme</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {isDarkMode ? 'On' : 'Off'}
                      </span>
                      <button
                        onClick={() => setThemeMode(isDarkMode ? 'light' : 'dark')}
                        className="relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                        style={{ backgroundColor: isDarkMode ? '#7c3aed' : '#d1d5db' }}
                      >
                        <span
                          className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                            isDarkMode ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Languages className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Language</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">Select your preferred language</p>
                      </div>
                    </div>
                    <select 
                      value={settings.language} 
                      onChange={(e) => handleSettingChange('language', e.target.value)} 
                      className="px-3 py-1 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-purple-400 outline-none"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="zh">Chinese</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Security */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
                <div className="px-5 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <h2 className="text-sm font-semibold text-gray-800 dark:text-white">Security</h2>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Lock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Two-Factor Authentication</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">Add an extra layer of security</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleToggle2FA} 
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                        twoFactorEnabled 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {isToggling2FA ? <Loader2 className="w-3 h-3 animate-spin" /> : (twoFactorEnabled ? 'Enabled' : 'Disabled')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Data */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
                <div className="px-5 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    <Database className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <h2 className="text-sm font-semibold text-gray-800 dark:text-white">Data</h2>
                  </div>
                </div>
                <div className="p-5">
                  <button 
                    onClick={() => setShowDeleteModal(true)} 
                    className="w-full flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition"
                  >
                    <div className="flex items-center space-x-3">
                      <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-red-700 dark:text-red-400">Delete Account</p>
                        <p className="text-xs text-red-600 dark:text-red-300">Permanently delete your account</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Email Notifications */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
                <div className="px-5 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <h2 className="text-sm font-semibold text-gray-800 dark:text-white">Email Notifications</h2>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  {Object.entries({
                    newEmail: { label: 'New Email', desc: 'Get notified when you receive new emails' },
                    loginAlerts: { label: 'Login Alerts', desc: 'Get notified when someone logs into your account' },
                    domainVerified: { label: 'Domain Verified', desc: 'Get notified when your domain is verified' },
                    teamInvites: { label: 'Team Invites', desc: 'Get notified when invited to a team' },
                    marketing: { label: 'Marketing Emails', desc: 'Product updates and promotions' }
                  }).map(([key, { label, desc }]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={emailNotif[key]} 
                          onChange={(e) => handleEmailNotifChange(key, e.target.checked)} 
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  ))}
                  <button 
                    onClick={handleSendTestEmail} 
                    disabled={isSendingTestEmail} 
                    className="w-full flex items-center justify-center space-x-2 py-2 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition text-sm"
                  >
                    {isSendingTestEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>Send Test Email</span>
                  </button>
                </div>
              </div>

              {/* Push Notifications */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
                <div className="px-5 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    {isMobile ? <Smartphone className="w-4 h-4 text-purple-600 dark:text-purple-400" /> : <Bell className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                    <h2 className="text-sm font-semibold text-gray-800 dark:text-white">
                      {isMobile ? 'Mobile Push Notifications' : 'Web Push Notifications'}
                    </h2>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Push</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {isMobile ? 'Get notifications on your mobile device' : 'Get notifications in your browser'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={pushNotif.enabled} 
                        onChange={(e) => handlePushToggle(e.target.checked)} 
                        disabled={!push.isSupported || push.permission === 'denied'} 
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600 disabled:opacity-50"></div>
                    </label>
                  </div>
                  
                  {pushNotif.enabled && push.isSubscribed && (
                    <>
                      {['newEmail', 'loginAlerts', 'teamInvites'].map((key) => (
                        <div key={key} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {key === 'newEmail' ? 'New Email' : key === 'loginAlerts' ? 'Login Alerts' : 'Team Invites'}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                              Push for {key === 'newEmail' ? 'new emails' : key === 'loginAlerts' ? 'login activity' : 'team invitations'}
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={pushNotif[key]} onChange={(e) => handlePushNotifChange(key, e.target.checked)} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                          </label>
                        </div>
                      ))}
                      
                      {isMobile && push.fcmToken && (
                        <div className="p-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                          <p className="text-xs text-gray-500 dark:text-gray-400 break-all">
                            Device registered: {push.fcmToken.substring(0, 20)}...
                          </p>
                        </div>
                      )}
                      
                      <button onClick={handleSendTestPush} disabled={isSendingTestPush} className="w-full flex items-center justify-center space-x-2 py-2 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition text-sm">
                        {isSendingTestPush ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        <span>Send Test Push</span>
                      </button>
                    </>
                  )}
                  
                  {push.permission === 'denied' && (
                    <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <p className="text-xs text-yellow-600 dark:text-yellow-400">
                        {isMobile ? 'Please enable notifications in your device settings' : 'Please allow notifications in your browser settings'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Email Preferences */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
                <div className="px-5 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <h2 className="text-sm font-semibold text-gray-800 dark:text-white">Email Preferences</h2>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Signature</label>
                    <textarea 
                      value={emailSignature} 
                      onChange={(e) => setEmailSignature(e.target.value)} 
                      rows="3" 
                      className="w-full mt-1 px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-purple-400 outline-none" 
                      placeholder="Best regards,&#10;Your Name" 
                    />
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Added to all outgoing emails</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto-save drafts</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">Automatically save email drafts</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={settings.autoSave} onChange={(e) => handleSettingChange('autoSave', e.target.checked)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirm before sending</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">Show confirmation before sending</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={settings.confirmBeforeSend} onChange={(e) => handleSettingChange('confirmBeforeSend', e.target.checked)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== MOBILE VIEW ====================

const MobileSettings = ({ state }) => {
  const {
    settings,
    emailNotif,
    pushNotif,
    emailSignature,
    twoFactorEnabled,
    isDarkMode,
    theme,
    setThemeMode,
    isMobile,
    push,
    isSaving,
    isToggling2FA,
    isSendingTestEmail,
    isSendingTestPush,
    error,
    success,
    handleSettingChange,
    handleEmailNotifChange,
    handlePushNotifChange,
    handleSaveSettings,
    handleToggle2FA,
    handleSendTestEmail,
    handleSendTestPush,
    handlePushToggle,
    setEmailSignature,
    setShowDeleteModal
  } = state;

  return (
    <div className="md:hidden bg-gray-50 dark:bg-gray-900 min-h-screen pb-20 transition-colors duration-300">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <SettingsIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h1 className="text-base font-semibold text-gray-800 dark:text-white">Settings</h1>
          </div>
          <ThemeToggle 
            isDarkMode={isDarkMode} 
            theme={theme} 
            setThemeMode={setThemeMode} 
          />
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400" />
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400" />
            <p className="text-xs text-green-600 dark:text-green-400">{success}</p>
          </div>
        )}

        {/* Appearance Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Palette className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h2 className="text-sm font-semibold text-gray-800 dark:text-white">Appearance</h2>
            </div>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {isDarkMode ? <Moon className="w-4 h-4 text-gray-500 dark:text-gray-400" /> : <Sun className="w-4 h-4 text-gray-500 dark:text-gray-400" />}
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Dark Mode</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Switch between light and dark</p>
                </div>
              </div>
              <button
                onClick={() => setThemeMode(isDarkMode ? 'light' : 'dark')}
                className="relative inline-flex items-center h-5 rounded-full w-10 transition-colors focus:outline-none"
                style={{ backgroundColor: isDarkMode ? '#7c3aed' : '#d1d5db' }}
              >
                <span
                  className={`inline-block w-3.5 h-3.5 transform bg-white rounded-full transition-transform ${
                    isDarkMode ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Languages className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Language</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Select your language</p>
                </div>
              </div>
              <select 
                value={settings.language} 
                onChange={(e) => handleSettingChange('language', e.target.value)} 
                className="text-sm border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg px-2 py-1 focus:ring-2 focus:ring-purple-400 outline-none"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="zh">Chinese</option>
              </select>
            </div>
          </div>
        </div>

        {/* Email Notifications Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h2 className="text-sm font-semibold text-gray-800 dark:text-white">Email Notifications</h2>
            </div>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
            {Object.entries({
              newEmail: 'New Email',
              loginAlerts: 'Login Alerts',
              domainVerified: 'Domain Verified',
              teamInvites: 'Team Invites',
              marketing: 'Marketing Emails'
            }).map(([key, label]) => (
              <div key={key} className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {key === 'newEmail' ? 'When you receive new emails' : 
                     key === 'loginAlerts' ? 'When someone logs into your account' : 
                     key === 'domainVerified' ? 'When your domain is verified' : 
                     key === 'teamInvites' ? 'When you get team invitations' : 
                     'Product updates and promotions'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={emailNotif[key]} onChange={(e) => handleEmailNotifChange(key, e.target.checked)} className="sr-only peer" />
                  <div className="w-10 h-5 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            ))}
            <div className="p-4">
              <button onClick={handleSendTestEmail} disabled={isSendingTestEmail} className="w-full flex items-center justify-center space-x-2 py-2 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 text-sm rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition">
                {isSendingTestEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Send Test Email</span>
              </button>
            </div>
          </div>
        </div>

        {/* Push Notifications Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              {isMobile ? <Smartphone className="w-4 h-4 text-purple-600 dark:text-purple-400" /> : <Bell className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
              <h2 className="text-sm font-semibold text-gray-800 dark:text-white">
                {isMobile ? 'Mobile Push' : 'Web Push'}
              </h2>
            </div>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Push</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Get notifications on your device</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={pushNotif.enabled} 
                  onChange={(e) => handlePushToggle(e.target.checked)} 
                  disabled={!push.isSupported || push.permission === 'denied'} 
                  className="sr-only peer" 
                />
                <div className="w-10 h-5 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600 disabled:opacity-50"></div>
              </label>
            </div>
            
            {pushNotif.enabled && push.isSubscribed && (
              <>
                {['newEmail', 'loginAlerts', 'teamInvites'].map((key) => (
                  <div key={key} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{key === 'newEmail' ? 'New Email' : key === 'loginAlerts' ? 'Login Alerts' : 'Team Invites'}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">Push notification for {key === 'newEmail' ? 'new emails' : key === 'loginAlerts' ? 'login activity' : 'team invitations'}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={pushNotif[key]} onChange={(e) => handlePushNotifChange(key, e.target.checked)} className="sr-only peer" />
                      <div className="w-10 h-5 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                ))}
                
                {isMobile && push.fcmToken && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/50">
                    <p className="text-xs text-gray-500 dark:text-gray-400 break-all">
                      Device registered: {push.fcmToken.substring(0, 20)}...
                    </p>
                  </div>
                )}
                
                <div className="p-4">
                  <button onClick={handleSendTestPush} disabled={isSendingTestPush} className="w-full flex items-center justify-center space-x-2 py-2 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 text-sm rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition">
                    {isSendingTestPush ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>Send Test Push</span>
                  </button>
                </div>
              </>
            )}
            
            {push.permission === 'denied' && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20">
                <p className="text-xs text-yellow-600 dark:text-yellow-400">
                  Please enable notifications in your device settings
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h2 className="text-sm font-semibold text-gray-800 dark:text-white">Security</h2>
            </div>
          </div>
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Lock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Two-Factor Auth</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Add extra security to your account</p>
              </div>
            </div>
            <button 
              onClick={handleToggle2FA} 
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                twoFactorEnabled 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {isToggling2FA ? <Loader2 className="w-3 h-3 animate-spin" /> : (twoFactorEnabled ? 'Enabled' : 'Disabled')}
            </button>
          </div>
        </div>

        {/* Email Preferences Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h2 className="text-sm font-semibold text-gray-800 dark:text-white">Email Preferences</h2>
            </div>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
            <div className="p-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Signature</label>
              <textarea 
                value={emailSignature} 
                onChange={(e) => setEmailSignature(e.target.value)} 
                rows="2" 
                className="w-full mt-1 px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-purple-400 outline-none" 
                placeholder="Best regards,&#10;Your Name" 
              />
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Added to all outgoing emails</p>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto-save drafts</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Automatically save email drafts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={settings.autoSave} onChange={(e) => handleSettingChange('autoSave', e.target.checked)} className="sr-only peer" />
                <div className="w-10 h-5 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirm before sending</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Show confirmation before sending</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={settings.confirmBeforeSend} onChange={(e) => handleSettingChange('confirmBeforeSend', e.target.checked)} className="sr-only peer" />
                <div className="w-10 h-5 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Data Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h2 className="text-sm font-semibold text-gray-800 dark:text-white">Data</h2>
            </div>
          </div>
          <div className="p-4">
            <button onClick={() => setShowDeleteModal(true)} className="w-full flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition">
              <div className="flex items-center space-x-3">
                <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                <div>
                  <p className="text-sm font-medium text-red-700 dark:text-red-400">Delete Account</p>
                  <p className="text-xs text-red-600 dark:text-red-300">Permanently delete your account</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-red-600 dark:text-red-400" />
            </button>
          </div>
        </div>

        {/* Save Button */}
        <button 
          onClick={handleSaveSettings} 
          disabled={isSaving} 
          className="w-full py-3 bg-purple-600 text-white rounded-xl font-medium text-sm hover:bg-purple-700 transition disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Save All Settings'}
        </button>
      </div>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================

const Settings = () => {
  const state = useSettings();

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-purple-600 dark:text-purple-400 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400 dark:text-gray-500">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <DesktopSettings state={state} />
      <MobileSettings state={state} />
      <DeleteAccountModal 
        isOpen={state.showDeleteModal}
        onClose={() => state.setShowDeleteModal(false)}
        onDelete={state.handleDeleteAccount}
        isDeleting={state.isDeleting}
      />
    </>
  );
};

export default Settings;