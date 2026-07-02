// screens/App.jsx
import React, { useState, useEffect } from 'react';
import { Download, Smartphone, CheckCircle, XCircle, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { useGetAppVersionsQuery } from '../slices/adminApiSlice';
import { getAppDownloadUrl } from '../slices/appApiSlice';

const App = () => {
  const [currentVersion, setCurrentVersion] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [isLoadingVersion, setIsLoadingVersion] = useState(true);
  const [isNative, setIsNative] = useState(false);

  const { data, isLoading, error, refetch } = useGetAppVersionsQuery({ platform: 'android' });

  const versions = data?.data?.versions || [];
  const latestVersion = data?.data?.latestVersion;

  useEffect(() => {
    const getAppVersion = async () => {
      try {
        if (window.Capacitor?.isNativePlatform()) {
          setIsNative(true);
          const { Device } = await import('@capacitor/device');
          const info = await Device.getInfo();
          setCurrentVersion(info.appVersion);
        } else {
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

  const handleDownload = (version) => {
    setSelectedVersion(version);
    setShowModal(true);
  };

  const handleConfirmDownload = () => {
    if (!selectedVersion?._id) {
      setShowModal(false);
      return;
    }

    // Backend streams the file and forces the correct .apk filename via
    // Content-Disposition, so this works reliably in both a regular
    // browser and handed off to Chrome from inside Capacitor.
    const downloadUrl = getAppDownloadUrl(selectedVersion._id);
    window.open(downloadUrl, isNative ? '_system' : '_blank');

    setShowModal(false);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date) => {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading || isLoadingVersion) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading app versions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center px-6">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-gray-700 font-medium mb-2">Failed to load app versions</p>
          <p className="text-gray-400 text-sm mb-4">{error.data?.message || 'Something went wrong'}</p>
          <button 
            onClick={() => refetch()} 
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Nexa Mobile App</h1>
                <p className="text-xs text-gray-500">Download the latest version</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Latest Version Banner */}
        {latestVersion && (
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-6 mb-8 text-white">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 mb-3">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">Latest Version</span>
                </div>
                <h2 className="text-2xl font-bold mb-2">Version {latestVersion.version}</h2>
                {latestVersion.releaseNotes && (
                  <p className="text-purple-100 text-sm mb-4">{latestVersion.releaseNotes}</p>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-purple-200">
                  <div className="flex items-center gap-1">
                    <span>Released:</span>
                    <span>{formatDate(latestVersion.releasedAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>Size:</span>
                    <span>{formatFileSize(latestVersion.fileSize)}</span>
                  </div>
                  {latestVersion.isRequired && (
                    <div className="flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>Required Update</span>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDownload(latestVersion)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-xl hover:bg-gray-100 transition font-semibold shadow-lg"
              >
                <Download className="w-5 h-5" />
                Download APK
              </button>
            </div>
          </div>
        )}

        {/* All Versions Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">All Versions</h3>
            <p className="text-sm text-gray-500">Previous releases and updates</p>
          </div>
          
          {versions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No versions available</p>
              <p className="text-gray-400 text-sm mt-1">Check back later for updates</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {versions.map((version, index) => (
                <div key={version._id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg font-semibold text-gray-900">v{version.version}</span>
                        {index === 0 && version.isActive && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            <CheckCircle className="w-3 h-3" />
                            Latest
                          </span>
                        )}
                        {!version.isActive && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">
                            Archived
                          </span>
                        )}
                        {version.isRequired && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                            Required Update
                          </span>
                        )}
                      </div>
                      {version.releaseNotes && (
                        <p className="text-gray-600 text-sm mb-2">{version.releaseNotes}</p>
                      )}
                      <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                        <span>Released: {formatDate(version.createdAt)}</span>
                        <span>Size: {formatFileSize(version.fileSize)}</span>
                        <span>File: {version.fileName}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownload(version)}
                      className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-gray-50 rounded-2xl p-6 border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">How to Install</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-purple-600">1</span>
              </div>
              <p className="text-sm text-gray-600">Download the APK file to your Android device</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-purple-600">2</span>
              </div>
              <p className="text-sm text-gray-600">Open the file and allow installation from unknown sources if prompted</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-purple-600">3</span>
              </div>
              <p className="text-sm text-gray-600">Follow the installation wizard and open the app</p>
            </div>
          </div>
        </div>

        {/* Current Version Info */}
        {currentVersion && (
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              Your current version: <span className="font-medium text-gray-600">v{currentVersion}</span>
              {latestVersion && currentVersion !== latestVersion.version && (
                <span className="text-purple-600 ml-2">Update available!</span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Download Confirmation Modal */}
      {showModal && selectedVersion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Download className="w-5 h-5 text-purple-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Download APK</h2>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-2">
                    You are about to download <span className="font-semibold text-gray-900">Nexa v{selectedVersion.version}</span>
                  </p>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Size: {formatFileSize(selectedVersion.fileSize)}</span>
                    <span>Platform: Android</span>
                  </div>
                </div>

                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-xs text-yellow-700">
                    <strong>Note:</strong> Make sure you have enabled installation from unknown sources in your device settings.
                    Go to Settings → Security → Install unknown apps → Allow from this source.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDownload}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                  >
                    Download
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

export default App;