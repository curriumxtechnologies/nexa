import React, { useEffect, useState } from 'react';
import { useCheckAppUpdateQuery, getAppDownloadUrl, useUpdateUserAppVersionMutation } from '../slices/appApiSlice';
import { useSelector } from 'react-redux';
import { App as CapacitorApp } from '@capacitor/app';
import { PushNotifications } from '@capacitor/push-notifications';
import {
  Download,
  X,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useMobilePushNotifications } from '../hooks/useMobilePushNotifications';

// Helper to normalize version strings (strip 'v' prefix)
const normalizeVersion = (v) => {
  if (!v) return '';
  return v.replace(/^v/i, '').trim();
};

const AppUpdateChecker = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentVersion, setCurrentVersion] = useState(null);
  const [isLoadingVersion, setIsLoadingVersion] = useState(true);
  const [isNative, setIsNative] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [versionVerified, setVersionVerified] = useState(false);
  const [updateFromLogin, setUpdateFromLogin] = useState(null);

  const { user, token, appUpdate } = useSelector((state) => state.auth);
  const [updateUserVersion] = useUpdateUserAppVersionMutation();
  const { isSupported } = useMobilePushNotifications();

  // ---- 1. Debug: log component state ----
  useEffect(() => {
    console.log('🔍 AppUpdateChecker state:', {
      isNative,
      isLoadingVersion,
      versionVerified,
      currentVersion,
      hasToken: !!token,
      hasUpdate: !!updateFromLogin?.hasUpdate,
      isVisible,
      updateInfo: updateFromLogin || null,
    });
  }, [isNative, isLoadingVersion, versionVerified, currentVersion, token, updateFromLogin, isVisible]);

  // ---- 2. Check for update from login response ----
  useEffect(() => {
    if (appUpdate?.hasUpdate) {
      console.log('📱 Update from login response:', appUpdate);
      setUpdateFromLogin(appUpdate);
      setIsVisible(true);
    }
  }, [appUpdate]);

  // ---- 3. Get device version on startup ----
  // ALWAYS trust Device.getInfo().appVersion as the source of truth.
  // Never let DB (user.appVersion) or localStorage override the real
  // installed version — that was the bug causing false "update available"
  // prompts after a fresh install, and it also broke logged-out users.
  useEffect(() => {
    const getAppVersion = async () => {
      try {
        const isNativePlatform = window.Capacitor?.isNativePlatform();
        setIsNative(!!isNativePlatform);

        if (isNativePlatform) {
          const { Device } = await import('@capacitor/device');
          const info = await Device.getInfo();

          const deviceVersion = normalizeVersion(info.appVersion);
          setCurrentVersion(deviceVersion);
          setVersionVerified(true); // we know the true version immediately, no need to wait on network

          console.log('📱 Device version (source of truth):', deviceVersion);

          // Sync this true version to the DB in the background (non-blocking).
          // This is a one-way push OUT to the server — it must never feed
          // back into what the UI considers "current".
          if (token && deviceVersion) {
            try {
              const result = await updateUserVersion({
                token,
                version: deviceVersion
              }).unwrap();
              console.log('✅ Version synced to DB:', result);

              if (result.data?.needsUpdate) {
                console.log('📱 Update needed from startup check:', result.data.updateInfo);
                setUpdateFromLogin({
                  hasUpdate: true,
                  ...result.data.updateInfo
                });
                setIsVisible(true);
              }
            } catch (error) {
              console.error('❌ Version sync failed (non-blocking):', error);
            }
          }
        } else {
          // Not native – still mark as verified so we don't block forever
          setVersionVerified(true);
        }
      } catch (error) {
        console.error('Failed to get app version:', error);
        setVersionVerified(true);
      } finally {
        setIsLoadingVersion(false);
      }
    };

    getAppVersion();
  }, [token, updateUserVersion]);

  // ---- 4. Polling query ----
  const queryVersion = currentVersion || '0.0.0';
  const { data, isLoading, error, refetch } = useCheckAppUpdateQuery(
    {
      platform: 'android',
      currentVersion: queryVersion,
      token: token || undefined,
    },
    {
      skip: !isNative || isLoadingVersion || !versionVerified,
      pollingInterval: 120000, // 2 minutes
    }
  );

  // ---- 5. Debug: log API response ----
  useEffect(() => {
    if (data) {
      console.log('📡 API check response:', data);
    }
    if (error) {
      console.error('❌ API check error:', error);
    }
  }, [data, error]);

  // ---- 6. Real‑time push listener (Capacitor) ----
  useEffect(() => {
    if (!isNative) return;

    let pushListener;

    const setupPushListener = async () => {
      try {
        pushListener = await PushNotifications.addListener(
          'pushNotificationReceived',
          (notification) => {
            console.log('📩 PUSH RECEIVED (raw):', notification);
            const payload = notification?.data || notification?.payload || {};
            console.log('📩 Extracted data:', payload);

            if (payload.type === 'APP_UPDATE') {
              console.log('🔄 APP_UPDATE push – calling refetch()');
              refetch();
            } else {
              console.log('⏭️ Ignoring push with type:', payload.type);
            }
          }
        );
        console.log('✅ Push listener registered');
      } catch (err) {
        console.error('❌ Failed to register push listener:', err);
      }
    };

    setupPushListener();

    return () => {
      if (pushListener) {
        pushListener.remove();
        console.log('🗑️ Push listener removed');
      }
    };
  }, [isNative, refetch]);

  // ---- 7. Resume listener (app comes to foreground) ----
  useEffect(() => {
    if (!isNative) return;

    let listenerHandle;

    const setupResumeListener = async () => {
      listenerHandle = await CapacitorApp.addListener('appStateChange', ({ isActive }) => {
        if (isActive) {
          console.log('📱 App resumed – checking for updates');
          refetch();
        }
      });
    };

    setupResumeListener();

    return () => {
      listenerHandle?.remove();
    };
  }, [isNative, refetch]);

  // ---- 8. Update from API response ----
  useEffect(() => {
    if (data?.data?.hasUpdate && !isLoading && !isLoadingVersion && versionVerified) {
      console.log('📱 Update from API check:', data.data);

      // Don't show if the update version matches current (device) version
      const apiVersion = data.data.version;
      const currentVer = normalizeVersion(currentVersion);
      const normalizedApiVersion = normalizeVersion(apiVersion);

      if (normalizedApiVersion === currentVer) {
        console.log('⏭️ API version matches current - no update needed');
        return;
      }

      if (!updateFromLogin?.hasUpdate) {
        setUpdateFromLogin(data.data);
        setIsVisible(true);
      }
    }
  }, [data, isLoading, isLoadingVersion, versionVerified, updateFromLogin, currentVersion]);

  // ---- 9. Determine if we have an update ----
  const hasUpdate = data?.data?.hasUpdate || updateFromLogin?.hasUpdate || false;
  const updateInfo = updateFromLogin?.hasUpdate ? updateFromLogin : data?.data;

  // ---- 10. Download handler ----
  const handleUpdateNow = async () => {
    if (!updateInfo?._id) {
      console.error('No version ID available');
      return;
    }

    setIsDownloading(true);

    try {
      const downloadUrl = getAppDownloadUrl(updateInfo._id, token);
      window.open(downloadUrl, '_system');

      if (token && user?.id) {
        try {
          await updateUserVersion({
            token,
            version: updateInfo.version
          }).unwrap();
          console.log('✅ User version updated successfully');
        } catch (updateError) {
          console.error('❌ Failed to update version in database:', updateError);
        }
      }

      if (!updateInfo?.isRequired) {
        setIsVisible(false);
      }
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDismiss = () => {
    if (!updateInfo?.isRequired) {
      setIsVisible(false);
    }
  };

  const handleLater = () => {
    if (!updateInfo?.isRequired) {
      setIsVisible(false);
    }
  };

  // ---- 11. Manual refetch (debug) ----
  const forceCheck = () => {
    console.log('🔄 Manual refetch triggered');
    refetch();
  };

  // ---- 12. Render ----
  if (!isNative || isLoading || isLoadingVersion || !versionVerified) {
    return null;
  }

  const isDev = import.meta.env.DEV;

  return (
    <>
      {/* Debug button (only in development) */}
      {isDev && (
        <button
          onClick={forceCheck}
          style={{
            position: 'fixed',
            bottom: 80,
            right: 10,
            zIndex: 9999,
            background: 'blue',
            color: 'white',
            padding: '8px 12px',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 'bold',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          Force Check
        </button>
      )}

      {/* Only show update banner if we have an update */}
      {hasUpdate && updateInfo && (
        <>
          {/* Desktop Banner */}
          <div className="hidden md:block fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-5 duration-300">
            <div className={`rounded-xl shadow-2xl border ${
              updateInfo.isRequired
                ? 'bg-red-50 border-red-200'
                : 'bg-white border-gray-200'
            } p-4`}>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  updateInfo.isRequired ? 'bg-red-100' : 'bg-purple-100'
                }`}>
                  {updateInfo.isRequired ? (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  ) : (
                    <Download className="w-5 h-5 text-purple-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold text-sm ${
                    updateInfo.isRequired ? 'text-red-800' : 'text-gray-800'
                  }`}>
                    {updateInfo.isRequired ? 'Update Required' : 'New Update Available'}
                  </h3>
                  <p className="text-xs text-gray-600 mt-1">
                    Version {updateInfo.version} is now available.
                    {currentVersion && (
                      <span className="block text-gray-400 text-[10px] mt-0.5">
                        Your current version: v{currentVersion}
                      </span>
                    )}
                  </p>
                  {updateInfo.releaseNotes && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {updateInfo.releaseNotes}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={handleUpdateNow}
                      disabled={isDownloading}
                      className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                        updateInfo.isRequired
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-purple-600 text-white hover:bg-purple-700'
                      } ${isDownloading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Downloading...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>Update Now</span>
                        </>
                      )}
                    </button>
                    {!updateInfo.isRequired && !isDownloading && (
                      <button
                        onClick={handleLater}
                        className="px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100 rounded-lg transition"
                      >
                        Later
                      </button>
                    )}
                  </div>
                </div>
                {!updateInfo.isRequired && !isDownloading && (
                  <button
                    onClick={handleDismiss}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Banner */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom-5 duration-300">
            <div className={`rounded-t-2xl shadow-2xl border-t ${
              updateInfo.isRequired
                ? 'bg-red-50 border-red-200'
                : 'bg-white border-gray-200'
            } p-4`}>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  updateInfo.isRequired ? 'bg-red-100' : 'bg-purple-100'
                }`}>
                  {updateInfo.isRequired ? (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  ) : (
                    <Download className="w-5 h-5 text-purple-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold text-sm ${
                    updateInfo.isRequired ? 'text-red-800' : 'text-gray-800'
                  }`}>
                    {updateInfo.isRequired ? 'Update Required' : 'New Update Available'}
                  </h3>
                  <p className="text-xs text-gray-600 mt-1">
                    Version {updateInfo.version} is now available.
                  </p>
                  {updateInfo.releaseNotes && (
                    <p className="text-xs text-gray-500 mt-1">
                      {updateInfo.releaseNotes.length > 80
                        ? updateInfo.releaseNotes.slice(0, 80) + '...'
                        : updateInfo.releaseNotes}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={handleUpdateNow}
                      disabled={isDownloading}
                      className={`flex-1 flex items-center justify-center gap-1 py-2 text-sm font-medium rounded-lg transition ${
                        updateInfo.isRequired
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-purple-600 text-white hover:bg-purple-700'
                      } ${isDownloading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Downloading...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          <span>Download Update</span>
                        </>
                      )}
                    </button>
                    {!updateInfo.isRequired && !isDownloading && (
                      <button
                        onClick={handleLater}
                        className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition"
                      >
                        Later
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Required Update Overlay */}
          {updateInfo.isRequired && isVisible && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
          )}
        </>
      )}
    </>
  );
};

export default AppUpdateChecker;