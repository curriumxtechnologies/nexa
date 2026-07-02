// components/AppUpdateChecker.jsx
import React, { useEffect, useState } from 'react';
import { useCheckAppUpdateQuery, getAppDownloadUrl, useUpdateUserAppVersionMutation } from '../slices/appApiSlice';
import { useSelector } from 'react-redux';
import { 
  Download, 
  X, 
  AlertCircle,
  Loader2
} from 'lucide-react';

const AppUpdateChecker = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentVersion, setCurrentVersion] = useState(null);
  const [isLoadingVersion, setIsLoadingVersion] = useState(true);
  const [isNative, setIsNative] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [versionVerified, setVersionVerified] = useState(false);
  const [updateFromLogin, setUpdateFromLogin] = useState(null);
  
  // ✅ All hooks at the top level
  const { user, token, appUpdate } = useSelector((state) => state.auth);
  const [updateUserVersion] = useUpdateUserAppVersionMutation();

  // ✅ Check for update from login response (using the appUpdate from Redux)
  useEffect(() => {
    if (appUpdate?.hasUpdate) {
      console.log('📱 Update from login response:', appUpdate);
      setUpdateFromLogin(appUpdate);
      setIsVisible(true);
    }
  }, [appUpdate]);

  // Get device version and verify on startup
  useEffect(() => {
    const getAppVersion = async () => {
      try {
        // Check if we're in a native environment
        const isNativePlatform = window.Capacitor?.isNativePlatform();
        setIsNative(!!isNativePlatform);
        
        if (isNativePlatform) {
          const { Device } = await import('@capacitor/device');
          const info = await Device.getInfo();
          
          // Get version from multiple sources
          let version = info.appVersion;
          
          // 1. First priority: user from Redux (database)
          if (user?.appVersion) {
            version = user.appVersion;
            setVersionVerified(true);
          } 
          // 2. Second priority: localStorage (fallback)
          else {
            const storedVersion = localStorage.getItem('appVersion');
            if (storedVersion) {
              version = storedVersion;
            }
          }
          
          setCurrentVersion(version);

          // Verify version with backend on app start
          if (token && version) {
            try {
              const result = await updateUserVersion({
                token,
                version
              }).unwrap();
              
              console.log('✅ Version verified on startup:', result);
              setVersionVerified(true);
              
              if (result.data?.needsUpdate) {
                console.log('📱 Update needed from startup check:', result.data.updateInfo);
                setUpdateFromLogin({
                  hasUpdate: true,
                  ...result.data.updateInfo
                });
                setIsVisible(true);
              }
            } catch (error) {
              console.error('❌ Version verification failed:', error);
              setVersionVerified(true);
            }
          } else if (!token) {
            setVersionVerified(true);
          }
        } else {
          // Not native - still set as verified so we don't block
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
  }, [user?.appVersion, token, updateUserVersion]);

  // Query for periodic updates
  const { data, isLoading, error } = useCheckAppUpdateQuery(
    { 
      platform: 'android', 
      currentVersion,
      token: token || undefined
    },
    { 
      skip: !isNative || isLoadingVersion || !versionVerified || !currentVersion,
      pollingInterval: 3600000,
    }
  );

  // Handle update from API response
  useEffect(() => {
    if (data?.data?.hasUpdate && !isLoading && !isLoadingVersion && versionVerified) {
      console.log('📱 Update from API check:', data.data);
      // Only set if we don't already have an update from login
      if (!updateFromLogin?.hasUpdate) {
        setUpdateFromLogin(data.data);
        setIsVisible(true);
      }
    }
  }, [data, isLoading, isLoadingVersion, versionVerified, updateFromLogin]);

  // Determine if we have an update (from login OR API)
  const hasUpdate = data?.data?.hasUpdate || updateFromLogin?.hasUpdate || false;
  
  // Get update info (prefer login response, fallback to API)
  const updateInfo = updateFromLogin?.hasUpdate ? updateFromLogin : data?.data;

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

      localStorage.setItem('appVersion', updateInfo.version);

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

  // Don't render on web or while loading
  if (!isNative || isLoading || isLoadingVersion || !versionVerified) return null;

  // Only show if we have an update available
  if (!hasUpdate || !updateInfo) return null;

  const isRequired = updateInfo?.isRequired;

  return (
    <>
      {/* Desktop Banner */}
      <div className="hidden md:block fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-5 duration-300">
        <div className={`rounded-xl shadow-2xl border ${
          isRequired 
            ? 'bg-red-50 border-red-200' 
            : 'bg-white border-gray-200'
        } p-4`}>
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${
              isRequired ? 'bg-red-100' : 'bg-purple-100'
            }`}>
              {isRequired ? (
                <AlertCircle className="w-5 h-5 text-red-600" />
              ) : (
                <Download className="w-5 h-5 text-purple-600" />
              )}
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold text-sm ${
                isRequired ? 'text-red-800' : 'text-gray-800'
              }`}>
                {isRequired ? 'Update Required' : 'New Update Available'}
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                Version {updateInfo?.version} is now available.
                {currentVersion && (
                  <span className="block text-gray-400 text-[10px] mt-0.5">
                    Your current version: v{currentVersion}
                  </span>
                )}
              </p>
              {updateInfo?.releaseNotes && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {updateInfo.releaseNotes}
                </p>
              )}
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={handleUpdateNow}
                  disabled={isDownloading}
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                    isRequired
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
                {!isRequired && !isDownloading && (
                  <button
                    onClick={handleLater}
                    className="px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100 rounded-lg transition"
                  >
                    Later
                  </button>
                )}
              </div>
            </div>
            {!isRequired && !isDownloading && (
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
          isRequired 
            ? 'bg-red-50 border-red-200' 
            : 'bg-white border-gray-200'
        } p-4`}>
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${
              isRequired ? 'bg-red-100' : 'bg-purple-100'
            }`}>
              {isRequired ? (
                <AlertCircle className="w-5 h-5 text-red-600" />
              ) : (
                <Download className="w-5 h-5 text-purple-600" />
              )}
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold text-sm ${
                isRequired ? 'text-red-800' : 'text-gray-800'
              }`}>
                {isRequired ? 'Update Required' : 'New Update Available'}
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                Version {updateInfo?.version} is now available.
              </p>
              {updateInfo?.releaseNotes && (
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
                    isRequired
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
                {!isRequired && !isDownloading && (
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
      {isRequired && isVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
      )}
    </>
  );
};

export default AppUpdateChecker;