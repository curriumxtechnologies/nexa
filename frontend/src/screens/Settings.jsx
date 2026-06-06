import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useGetSettingsQuery, useUpdateSettingsMutation, useUpdateEmailSignatureMutation, useToggleDarkModeMutation } from '../slices/settingsApiSlice';
import { useGetNotificationPreferencesQuery, useUpdateEmailNotificationsMutation, useUpdatePushNotificationsMutation, useSendTestEmailMutation, useSendTestPushMutation } from '../slices/notificationsApiSlice';
import { useToggleUser2FAMutation, useDeleteAccountMutation } from '../slices/userApiSlice';
import { usePushNotifications } from '../hooks/usePushNotifications';
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
  Send
} from 'lucide-react';

const Settings = () => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  
  // Settings API
  const { data: settingsData, isLoading: settingsLoading, refetch: refetchSettings } = useGetSettingsQuery();
  const [updateSettings, { isLoading: isUpdatingSettings }] = useUpdateSettingsMutation();
  const [updateEmailSignature, { isLoading: isUpdatingSignature }] = useUpdateEmailSignatureMutation();
  const [toggleDarkMode, { isLoading: isTogglingDarkMode }] = useToggleDarkModeMutation();
  
  // Notifications API
  const { data: notificationsData, isLoading: notificationsLoading, refetch: refetchNotifications } = useGetNotificationPreferencesQuery();
  const [updateEmailNotifications, { isLoading: isUpdatingEmailNotif }] = useUpdateEmailNotificationsMutation();
  const [updatePushNotifications, { isLoading: isUpdatingPushNotif }] = useUpdatePushNotificationsMutation();
  const [sendTestEmail, { isLoading: isSendingTestEmail }] = useSendTestEmailMutation();
  const [sendTestPush, { isLoading: isSendingTestPush }] = useSendTestPushMutation();
  
  // User API
  const [toggle2FA, { isLoading: isToggling2FA }] = useToggleUser2FAMutation();
  const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();
  
  // Push notification hook
  const {
    isSupported,
    isSubscribed,
    permission,
    subscribe,
    unsubscribe,
  } = usePushNotifications();
  
  // Local state
  const [settings, setSettings] = useState({
    darkMode: false,
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
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(userInfo?.isTwoFactorEnabled || false);
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
        darkMode: appearance.darkMode || false,
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
      
      // ONLY enable push in UI if browser is actually subscribed
      setPushNotif({
        enabled: isSubscribed && (push.enabled || false),
        newEmail: push.newEmail ?? true,
        loginAlerts: push.loginAlerts ?? true,
        domainVerified: push.domainVerified || false,
        teamInvites: push.teamInvites ?? true
      });
    }
  }, [notificationsData, isSubscribed]);

  // Keep UI in sync when subscription state changes
  useEffect(() => {
    setPushNotif(prev => ({
      ...prev,
      enabled: isSubscribed && prev.enabled
    }));
  }, [isSubscribed]);

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
      // Update appearance and email settings
      await updateSettings({
        appearance: {
          darkMode: settings.darkMode,
          language: settings.language
        },
        email: {
          autoSave: settings.autoSave,
          confirmBeforeSend: settings.confirmBeforeSend
        }
      }).unwrap();
      
      // Update email signature
      await updateEmailSignature({ signature: emailSignature }).unwrap();
      
      // Update notification preferences
      await updateEmailNotifications(emailNotif).unwrap();
      await updatePushNotifications(pushNotif).unwrap();
      
      setSuccess('All settings saved successfully');
      setTimeout(() => setSuccess(''), 3000);
      
      // Refetch to ensure UI is in sync
      refetchSettings();
      refetchNotifications();
    } catch (err) {
      setError(err.data?.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleDarkMode = async (value) => {
    try {
      await toggleDarkMode({ darkMode: value }).unwrap();
      setSettings(prev => ({ ...prev, darkMode: value }));
    } catch (err) {
      console.error('Failed to toggle dark mode:', err);
    }
  };

  const handleToggle2FA = async () => {
    try {
      await toggle2FA({ enable: !twoFactorEnabled }).unwrap();
      setTwoFactorEnabled(!twoFactorEnabled);
      setSuccess(`2FA ${!twoFactorEnabled ? 'enabled' : 'disabled'} successfully`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.data?.message || 'Failed to toggle 2FA');
    }
  };

  const handleSendTestEmail = async () => {
    try {
      await sendTestEmail().unwrap();
      setSuccess('Test email sent successfully! Check your inbox.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.data?.message || 'Failed to send test email');
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError('Please enter your password');
      return;
    }
    
    setDeleteError('');
    
    try {
      await deleteAccount({ password: deletePassword }).unwrap();
      dispatch(logout());
      window.location.href = '/login';
    } catch (err) {
      setDeleteError(err.data?.message || 'Failed to delete account');
    }
  };

  const handlePushToggle = async (checked) => {
    if (checked) {
      // User wants to enable — request browser permission
      const success = await subscribe();
      if (success) {
        setPushNotif(prev => ({ ...prev, enabled: true }));
        setSuccess('Push notifications enabled!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        // Browser denied or failed — keep toggle OFF
        setPushNotif(prev => ({ ...prev, enabled: false }));
        setError('Push notifications blocked by browser. Please allow notifications in your browser settings.');
        setTimeout(() => setError(''), 4000);
      }
    } else {
      // User wants to disable
      await unsubscribe();
      setPushNotif(prev => ({ ...prev, enabled: false }));
      setSuccess('Push notifications disabled.');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  if (settingsLoading || notificationsLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading settings...</p>
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
              <SettingsIcon className="w-6 h-6 text-purple-600" />
              <h1 className="text-xl font-semibold text-gray-800">Settings</h1>
            </div>
            <button
              onClick={handleSaveSettings}
              disabled={isSaving || isUpdatingSettings || isUpdatingSignature || isUpdatingEmailNotif || isUpdatingPushNotif}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
            >
              {(isSaving || isUpdatingSettings || isUpdatingSignature || isUpdatingEmailNotif || isUpdatingPushNotif) ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 lg:px-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}

          {/* Appearance Settings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <Sun className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-800">Appearance</h2>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {settings.darkMode ? (
                    <Moon className="w-5 h-5 text-gray-600" />
                  ) : (
                    <Sun className="w-5 h-5 text-gray-600" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-700">Dark Mode</p>
                    <p className="text-xs text-gray-500">Switch between light and dark theme</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.darkMode}
                    onChange={(e) => handleToggleDarkMode(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Languages className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Language</p>
                    <p className="text-xs text-gray-500">Select your preferred language</p>
                  </div>
                </div>
                <select
                  value={settings.language}
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none text-sm"
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

          {/* Email Notifications */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-800">Email Notifications</h2>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">New Email</p>
                  <p className="text-xs text-gray-500">Get notified when you receive a new email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailNotif.newEmail}
                    onChange={(e) => handleEmailNotifChange('newEmail', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Login Alerts</p>
                  <p className="text-xs text-gray-500">Get notified when someone logs into your account</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailNotif.loginAlerts}
                    onChange={(e) => handleEmailNotifChange('loginAlerts', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Domain Verified</p>
                  <p className="text-xs text-gray-500">Get notified when your domain is verified</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailNotif.domainVerified}
                    onChange={(e) => handleEmailNotifChange('domainVerified', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Team Invites</p>
                  <p className="text-xs text-gray-500">Get notified when someone invites you to a team</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailNotif.teamInvites}
                    onChange={(e) => handleEmailNotifChange('teamInvites', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Marketing Emails</p>
                  <p className="text-xs text-gray-500">Receive product updates and promotions</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailNotif.marketing}
                    onChange={(e) => handleEmailNotifChange('marketing', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <button
                onClick={handleSendTestEmail}
                disabled={isSendingTestEmail}
                className="w-full mt-2 flex items-center justify-center space-x-2 px-4 py-2 border border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50 transition disabled:opacity-50"
              >
                {isSendingTestEmail ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Send Test Email</span>
              </button>
            </div>
          </div>

          {/* Push Notifications */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-800">Push Notifications</h2>
              </div>
            </div>
            <div className="p-4 space-y-4">
              {!isSupported && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-700">
                    Push notifications are not supported in this browser. Try Chrome, Edge, or Safari.
                  </p>
                </div>
              )}

              {isSupported && permission === 'denied' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">
                    Notification permission was denied. Please enable it in your browser settings to receive push notifications.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Enable Push Notifications</p>
                  <p className="text-xs text-gray-500">
                    {isSubscribed
                      ? 'Push notifications are active'
                      : 'Get notifications on your device even when the app is closed'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pushNotif.enabled}
                    onChange={(e) => handlePushToggle(e.target.checked)}
                    disabled={!isSupported || permission === 'denied'}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600 disabled:opacity-50"></div>
                </label>
              </div>

              {pushNotif.enabled && isSubscribed && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">New Email</p>
                      <p className="text-xs text-gray-500">Push notification for new emails</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pushNotif.newEmail}
                        onChange={(e) => handlePushNotifChange('newEmail', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Login Alerts</p>
                      <p className="text-xs text-gray-500">Push notification for login activity</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pushNotif.loginAlerts}
                        onChange={(e) => handlePushNotifChange('loginAlerts', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Team Invites</p>
                      <p className="text-xs text-gray-500">Push notification for team invitations</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pushNotif.teamInvites}
                        onChange={(e) => handlePushNotifChange('teamInvites', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  <button
                    onClick={async () => {
                      try {
                        await sendTestPush().unwrap();
                        setSuccess('Test push notification sent! Check your device.');
                        setTimeout(() => setSuccess(''), 3000);
                      } catch (err) {
                        setError(err.data?.message || 'Failed to send test push');
                        setTimeout(() => setError(''), 3000);
                      }
                    }}
                    disabled={isSendingTestPush}
                    className="w-full mt-2 flex items-center justify-center space-x-2 px-4 py-2 border border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50 transition disabled:opacity-50"
                  >
                    {isSendingTestPush ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>Send Test Push</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-800">Security</h2>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Lock className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Two-Factor Authentication</p>
                    <p className="text-xs text-gray-500">Add an extra layer of security to your account</p>
                  </div>
                </div>
                <button
                  onClick={handleToggle2FA}
                  disabled={isToggling2FA}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                    twoFactorEnabled
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {isToggling2FA ? <Loader2 className="w-3 h-3 animate-spin" /> : (twoFactorEnabled ? 'Enabled' : 'Disabled')}
                </button>
              </div>
            </div>
          </div>

          {/* Email Preferences */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-800">Email Preferences</h2>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Signature
                </label>
                <textarea
                  value={emailSignature}
                  onChange={(e) => setEmailSignature(e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
                  placeholder="Best regards,&#10;Your Name"
                />
                <p className="text-xs text-gray-500 mt-1">This signature will be added to all outgoing emails</p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Auto-save drafts</p>
                  <p className="text-xs text-gray-500">Automatically save email drafts</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoSave}
                    onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Confirm before sending</p>
                  <p className="text-xs text-gray-500">Show confirmation dialog before sending emails</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.confirmBeforeSend}
                    onChange={(e) => handleSettingChange('confirmBeforeSend', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Data */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-800">Data</h2>
              </div>
            </div>
            <div className="p-4">
              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition"
              >
                <div className="flex items-center space-x-3">
                  <Trash2 className="w-5 h-5 text-red-600" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-red-700">Delete Account</p>
                    <p className="text-xs text-red-600">Permanently delete your account and all data</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-red-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Trash2 className="w-5 h-5 text-red-600" />
                  <h2 className="text-xl font-semibold text-gray-800">Delete Account</h2>
                </div>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletePassword('');
                    setDeleteError('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-700">
                    <strong>Warning:</strong> This action cannot be undone. All your data, including emails, domains, and custom email addresses will be permanently deleted.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Enter your password to confirm
                  </label>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none"
                    placeholder="Your password"
                  />
                  {deleteError && (
                    <p className="text-xs text-red-600 mt-1">{deleteError}</p>
                  )}
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeletePassword('');
                      setDeleteError('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                    ) : (
                      'Delete Account'
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

export default Settings;