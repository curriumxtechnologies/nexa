// components/AppUpdateChecker.jsx
import React, { useEffect, useState } from 'react';
import { useCheckAppUpdateQuery } from '../slices/appApiSlice';
import { 
  Download, 
  X, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle,
  Loader2
} from 'lucide-react';

const AppUpdateChecker = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentVersion, setCurrentVersion] = useState(null);
  const [isLoadingVersion, setIsLoadingVersion] = useState(true);

  // Try to get app version from Capacitor (if available)
  useEffect(() => {
    const getAppVersion = async () => {
      try {
        // Check if running in Capacitor
        if (window.Capacitor?.isNativePlatform()) {
          const { Device } = await import('@capacitor/device');
          const info = await Device.getInfo();
          setCurrentVersion(info.appVersion);
        } else {
          // Web version - use package.json version or default
          setCurrentVersion('1.0.0');
        }
      } catch (error) {
        console.error('Failed to get app version:', error);
        setCurrentVersion('1.0.0');
      } finally {
        setIsLoadingVersion(false);
      }
    };

    getAppVersion();
  }, []);

  const { data, isLoading, error } = useCheckAppUpdateQuery(
    { platform: 'android', currentVersion },
    { skip: !currentVersion }
  );

  useEffect(() => {
    if (data?.data?.hasUpdate && !isLoading && !isLoadingVersion) {
      // Show update banner/notification
      setIsVisible(true);
    }
  }, [data, isLoading, isLoadingVersion]);

  const handleUpdateNow = () => {
    // Open official website for download
    window.open('https://nexa.curriumx.online/download', '_blank');
    setIsVisible(false);
  };

  const handleDismiss = () => {
    // Only allow dismissing if update is not required
    if (!data?.data?.isRequired) {
      setIsVisible(false);
    }
  };

  const handleLater = () => {
    if (!data?.data?.isRequired) {
      setIsVisible(false);
    }
  };

  if (!isVisible || isLoading || isLoadingVersion) return null;

  const updateInfo = data?.data;
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
              </p>
              {updateInfo?.releaseNotes && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {updateInfo.releaseNotes}
                </p>
              )}
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={handleUpdateNow}
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                    isRequired
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Update Now</span>
                </button>
                {!isRequired && (
                  <button
                    onClick={handleLater}
                    className="px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100 rounded-lg transition"
                  >
                    Later
                  </button>
                )}
              </div>
            </div>
            {!isRequired && (
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

      {/* Mobile Banner - Bottom Sheet Style */}
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
                  className={`flex-1 flex items-center justify-center gap-1 py-2 text-sm font-medium rounded-lg transition ${
                    isRequired
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Download from Website</span>
                </button>
                {!isRequired && (
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

      {/* Required Update Overlay (blocks app usage) */}
      {isRequired && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
      )}
    </>
  );
};

export default AppUpdateChecker;