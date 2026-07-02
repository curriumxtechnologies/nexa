// screens/App.jsx
import React, { useState, useEffect } from 'react';
import { Download, Smartphone, CheckCircle, XCircle, Loader2, AlertCircle, ChevronDown, Sparkles, Zap } from 'lucide-react';
import { useGetAppVersionsQuery } from '../slices/adminApiSlice';
import { getAppDownloadUrl, useUpdateUserAppVersionMutation } from '../slices/appApiSlice';
import { useSelector } from 'react-redux';

const App = () => {
  const [currentVersion, setCurrentVersion] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [isLoadingVersion, setIsLoadingVersion] = useState(true);
  const [isNative, setIsNative] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showAllVersions, setShowAllVersions] = useState(false);

  const { user, token } = useSelector((state) => state.auth);

  const { data, isLoading, error, refetch } = useGetAppVersionsQuery({ platform: 'android' });
  const [updateUserVersion] = useUpdateUserAppVersionMutation();

  const versions = data?.data?.versions || [];

  // ⚠️ We deliberately do NOT use data?.data?.latestVersion here.
  // That object is hand-built server-side in getAppVersions() and is
  // missing _id, which breaks every download button that relies on it.
  // `versions` comes straight from AppVersion.find() (full Mongoose
  // docs, real _id guaranteed) and is already sorted newest-first via
  // .sort({ createdAt: -1 }) on the backend, so versions[0] IS the
  // latest version — same data, just with a working _id attached.
  const latestVersion = versions[0] || null;

  // Get app version on mount
  useEffect(() => {
    const getAppVersion = async () => {
      try {
        if (window.Capacitor?.isNativePlatform()) {
          setIsNative(true);
          const { Device } = await import('@capacitor/device');
          const info = await Device.getInfo();

          let version = info.appVersion;

          if (user?.appVersion) {
            version = user.appVersion;
          } else {
            const storedVersion = localStorage.getItem('appVersion');
            if (storedVersion) {
              version = storedVersion;
            }
          }

          setCurrentVersion(version);
        } else {
          const storedVersion = localStorage.getItem('appVersion');
          setCurrentVersion(storedVersion || '1.0.0');
        }
      } catch (error) {
        console.error('Failed to get app version:', error);
        setCurrentVersion('1.0.0');
      } finally {
        setIsLoadingVersion(false);
      }
    };

    getAppVersion();
  }, [user?.appVersion]);

  // Modal handler - just opens the modal with the selected version
  const openDownloadModal = (version) => {
    if (!version?._id) {
      console.error('Attempted to open download modal for a version with no _id', version);
      return;
    }
    setSelectedVersion(version);
    setShowModal(true);
  };

  // Same working approach as the admin panel: window.open() called
  // synchronously inside the click handler, no await/setState before it,
  // so it isn't treated as untrusted and blocked by popup blockers.
  const handleConfirmDownload = () => {
    if (!selectedVersion?._id) {
      setShowModal(false);
      return;
    }

    setIsDownloading(true);

    const downloadUrl = getAppDownloadUrl(selectedVersion._id, token);
    window.open(downloadUrl, isNative ? '_system' : '_blank');

    // Update user's version in database
    if (token && user?.id) {
      updateUserVersion({
        token,
        version: selectedVersion.version
      }).unwrap().catch(err => console.error('Failed to update version:', err));
    }

    localStorage.setItem('appVersion', selectedVersion.version);
    setCurrentVersion(selectedVersion.version);

    // Close modal after a moment
    setTimeout(() => {
      setShowModal(false);
      setIsDownloading(false);
      setSelectedVersion(null);
    }, 1000);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (date) => {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading || isLoadingVersion) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Smartphone className="w-8 h-8 text-white" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
            <p className="text-sm text-gray-500">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 text-sm mb-4">Failed to load app versions</p>
          <button
            onClick={() => refetch()}
            className="px-6 py-2.5 bg-purple-600 text-white text-sm font-medium rounded-xl hover:bg-purple-700 transition shadow-lg shadow-purple-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const needsUpdate = currentVersion && latestVersion && currentVersion !== latestVersion.version;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-purple-100/50 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Nexa</h1>
                <p className="text-[10px] text-gray-400 font-medium">Mobile App</p>
              </div>
            </div>
            {currentVersion && (
              <div className="bg-purple-50 px-3 py-1.5 rounded-full border border-purple-100">
                <span className="text-xs font-medium text-purple-700">v{currentVersion}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Hero Banner */}
        {latestVersion && (
          <div className={`
            relative overflow-hidden rounded-2xl p-6 mb-6
            ${needsUpdate
              ? 'bg-gradient-to-br from-purple-600 to-purple-700'
              : 'bg-gradient-to-br from-gray-800 to-gray-900'
            }
          `}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-2xl font-bold text-white">v{latestVersion.version}</span>
                    {needsUpdate && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-400/20 text-yellow-200 text-xs font-medium rounded-full border border-yellow-400/30">
                        <Zap className="w-3 h-3" />
                        Update Available
                      </span>
                    )}
                    {latestVersion.isRequired && (
                      <span className="px-2.5 py-1 bg-red-500/20 text-red-200 text-xs font-medium rounded-full border border-red-400/30">
                        Required
                      </span>
                    )}
                  </div>

                  {latestVersion.releaseNotes && (
                    <p className="text-white/80 text-sm mb-3 line-clamp-2">
                      {latestVersion.releaseNotes}
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-xs text-white/60">
                    <span className="flex items-center gap-1">
                      <span className="w-1 h-1 bg-white/40 rounded-full" />
                      {formatFileSize(latestVersion.fileSize)}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-1 h-1 bg-white/40 rounded-full" />
                      {formatDate(latestVersion.createdAt)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => openDownloadModal(latestVersion)}
                  className={`
                    flex-shrink-0 px-5 py-2.5 rounded-xl font-semibold text-sm
                    transition-all duration-200 shadow-lg
                    ${needsUpdate
                      ? 'bg-white text-purple-600 hover:bg-purple-50 hover:scale-105 shadow-purple-500/30'
                      : 'bg-purple-500 text-white hover:bg-purple-400 hover:scale-105 shadow-purple-500/30'
                    }
                  `}
                >
                  {needsUpdate ? 'Update Now' : 'Download'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Version Status */}
        {currentVersion && latestVersion && (
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100">
              {needsUpdate ? (
                <>
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span className="text-sm text-gray-700">
                    New version <span className="font-semibold text-purple-600">v{latestVersion.version}</span> available
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-600">You're on the latest version</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* All Versions Toggle */}
        {versions.length > 1 && (
          <button
            onClick={() => setShowAllVersions(!showAllVersions)}
            className="w-full flex items-center justify-center gap-2 py-3 text-sm text-gray-500 hover:text-purple-600 transition group"
          >
            <span className="font-medium">
              {showAllVersions ? 'Hide older versions' : 'View all versions'}
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showAllVersions ? 'rotate-180' : ''}`} />
          </button>
        )}

        {/* All Versions List */}
        {showAllVersions && (
          <div className="space-y-3 mt-3">
            {versions.map((version) => {
              const isLatest = version._id === latestVersion?._id;
              const isCurrent = currentVersion === version.version;

              if (isLatest) return null;

              return (
                <div
                  key={version._id}
                  className={`
                    bg-white rounded-xl shadow-sm border p-4
                    ${isCurrent ? 'border-purple-200 bg-purple-50/30' : 'border-gray-100'}
                    transition hover:shadow-md
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-gray-900">v{version.version}</span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-medium rounded-full">
                            Installed
                          </span>
                        )}
                        {!version.isActive && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-medium rounded-full">
                            Archived
                          </span>
                        )}
                        {version.isRequired && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-medium rounded-full">
                            Required
                          </span>
                        )}
                      </div>
                      {version.releaseNotes && (
                        <p className="text-sm text-gray-500 line-clamp-1">{version.releaseNotes}</p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                        <span>{formatFileSize(version.fileSize)}</span>
                        <span>•</span>
                        <span>{formatDate(version.createdAt)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => openDownloadModal(version)}
                      className={`
                        flex-shrink-0 ml-3 px-4 py-2 rounded-lg text-sm font-medium transition
                        ${isCurrent
                          ? 'bg-gray-100 text-gray-400 cursor-default'
                          : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                        }
                      `}
                      disabled={isCurrent}
                    >
                      {isCurrent ? 'Installed' : 'Download'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Install Instructions */}
        <div className="mt-8 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-100/50 p-4">
          <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">How to install</h4>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-1">
                <span className="text-xs font-bold text-purple-600">1</span>
              </div>
              <p className="text-[10px] text-gray-500 leading-tight">Download APK</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-1">
                <span className="text-xs font-bold text-purple-600">2</span>
              </div>
              <p className="text-[10px] text-gray-500 leading-tight">Allow install</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-1">
                <span className="text-xs font-bold text-purple-600">3</span>
              </div>
              <p className="text-[10px] text-gray-500 leading-tight">Install &amp; open</p>
            </div>
          </div>
        </div>
      </div>

      {/* Download Modal */}
      {showModal && selectedVersion && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full mx-4 shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200">
                    <Download className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {currentVersion && selectedVersion.version !== currentVersion ? 'Update App' : 'Download App'}
                    </h3>
                    <p className="text-xs text-gray-400">Version {selectedVersion.version}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (!isDownloading) {
                      setShowModal(false);
                      setSelectedVersion(null);
                    }
                  }}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100/30 rounded-xl p-4 mb-4">
                {currentVersion && selectedVersion.version !== currentVersion ? (
                  <>
                    <p className="text-sm text-gray-700">
                      Updating from <span className="font-bold text-gray-900">v{currentVersion}</span>
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 bg-purple-200 rounded-full overflow-hidden">
                        <div className="w-full h-full bg-purple-500 rounded-full animate-pulse" />
                      </div>
                      <span className="text-xs font-semibold text-purple-600">v{selectedVersion.version}</span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-700">
                    Download <span className="font-bold text-gray-900">Nexa v{selectedVersion.version}</span>
                  </p>
                )}
                <div className="flex gap-3 text-xs text-gray-400 mt-2 pt-2 border-t border-purple-200/30">
                  <span>{formatFileSize(selectedVersion.fileSize)}</span>
                  <span>•</span>
                  <span>Android APK</span>
                </div>
                {!isNative && (
                  <div className="mt-2 text-xs text-gray-400">
                    File will download in your browser
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (!isDownloading) {
                      setShowModal(false);
                      setSelectedVersion(null);
                    }
                  }}
                  disabled={isDownloading}
                  className={`flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition ${isDownloading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDownload}
                  disabled={isDownloading}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl hover:from-purple-700 hover:to-purple-800 transition disabled:opacity-75 flex items-center justify-center gap-2 shadow-lg shadow-purple-200"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Starting...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;