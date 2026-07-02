// screens/App.jsx
import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Smartphone, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  AlertCircle, 
  ChevronDown, 
  Sparkles, 
  Zap,
  Share2,
  Copy,
  Check,
  ArrowUpRight,
  Shield,
  Clock,
  Package,
  ExternalLink,
  Info,
  Gift,
  TrendingUp,
  Award
} from 'lucide-react';
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
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [copied, setCopied] = useState(false);

  const { user, token } = useSelector((state) => state.auth);

  const { data, isLoading, error, refetch } = useGetAppVersionsQuery({ platform: 'android' });
  const [updateUserVersion] = useUpdateUserAppVersionMutation();

  const versions = data?.data?.versions || [];

  // We deliberately do NOT use data?.data?.latestVersion here.
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

  const handleShare = async (version) => {
    const shareData = {
      title: 'Nexa App',
      text: `Download Nexa v${version.version} - ${version.releaseNotes || 'Latest update'}`,
      url: getAppDownloadUrl(version._id, token)
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareData.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Share failed:', error);
        // Fallback to clipboard
        try {
          await navigator.clipboard.writeText(shareData.url);
          setCopied(true);
          setTimeout(() => setCopied(false), 3000);
        } catch (clipError) {
          console.error('Clipboard failed:', clipError);
        }
      }
    }
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-2xl shadow-purple-200 animate-pulse relative">
            <Smartphone className="w-10 h-10 text-white" />
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
            <p className="text-sm text-gray-500 font-medium">Loading Nexa...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg border border-red-100">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load</h3>
          <p className="text-gray-500 text-sm mb-6">We couldn't fetch the app version information. Please check your connection and try again.</p>
          <button
            onClick={() => refetch()}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-purple-200 transition-all hover:scale-105"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const needsUpdate = currentVersion && latestVersion && currentVersion !== latestVersion.version;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100/80 sticky top-0 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 bg-gradient-to-br from-purple-600 via-purple-500 to-purple-400 rounded-xl flex items-center justify-center shadow-xl shadow-purple-200/50">
                  <Smartphone className="w-5.5 h-5.5 text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 tracking-tight">Nexa</h1>
                <p className="text-[10px] text-gray-400 font-medium tracking-wider uppercase">Mobile Application</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {currentVersion && (
                <div className="bg-gradient-to-r from-purple-50 to-purple-100/50 px-3.5 py-1.5 rounded-full border border-purple-200/50 shadow-sm">
                  <span className="text-xs font-semibold text-purple-700">v{currentVersion}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Hero Banner */}
        {latestVersion && (
          <div className={`
            relative overflow-hidden rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-6 sm:mb-8
            ${needsUpdate
              ? 'bg-gradient-to-br from-purple-700 via-purple-600 to-purple-800'
              : 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
            }
            shadow-2xl
          `}>
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl" />
            
            {/* Subtle grid pattern */}
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: '24px 24px'
            }} />

            <div className="relative">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                      v{latestVersion.version}
                    </span>
                    {needsUpdate && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-400/20 text-yellow-200 text-xs font-semibold rounded-full border border-yellow-400/30 backdrop-blur-sm">
                        <Zap className="w-3.5 h-3.5" />
                        Update Available
                      </span>
                    )}
                    {latestVersion.isRequired && (
                      <span className="px-3 py-1 bg-red-500/20 text-red-200 text-xs font-semibold rounded-full border border-red-400/30 backdrop-blur-sm">
                        Required
                      </span>
                    )}
                    {!needsUpdate && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-400/20 text-green-200 text-xs font-semibold rounded-full border border-green-400/30 backdrop-blur-sm">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Latest
                      </span>
                    )}
                  </div>

                  {latestVersion.releaseNotes && (
                    <p className="text-white/90 text-sm sm:text-base mb-4 leading-relaxed max-w-2xl">
                      {latestVersion.releaseNotes}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/50">
                    <span className="flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5" />
                      {formatFileSize(latestVersion.fileSize)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDate(latestVersion.createdAt)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5" />
                      Verified Build
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                  <button
                    onClick={() => openDownloadModal(latestVersion)}
                    className={`
                      inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm
                      transition-all duration-300 shadow-lg
                      ${needsUpdate
                        ? 'bg-white text-purple-700 hover:bg-purple-50 hover:scale-105 shadow-purple-500/30'
                        : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 hover:scale-105 shadow-purple-500/30'
                      }
                    `}
                  >
                    {needsUpdate ? (
                      <>
                        <Download className="w-4 h-4" />
                        Update Now
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Download
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleShare(latestVersion)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all duration-300 border border-white/10"
                    aria-label="Share download link"
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="text-sm font-medium hidden sm:inline">Share</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Version Status */}
        {currentVersion && latestVersion && (
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white rounded-2xl shadow-sm border border-gray-100/80 backdrop-blur-sm">
              {needsUpdate ? (
                <>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-700">
                    New version <span className="font-bold text-purple-600">v{latestVersion.version}</span> available
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-purple-500" />
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-600 font-medium">You're on the latest version</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Feature Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {[
            { icon: Zap, label: 'Fast Performance', color: 'from-yellow-500 to-orange-500' },
            { icon: Shield, label: 'Secure', color: 'from-emerald-500 to-teal-500' },
            { icon: TrendingUp, label: 'Auto Updates', color: 'from-blue-500 to-indigo-500' },
            { icon: Award, label: 'Premium', color: 'from-purple-500 to-pink-500' }
          ].map((item, idx) => (
            <div key={idx} className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-100/50 p-3 text-center hover:shadow-lg transition-all hover:-translate-y-0.5">
              <div className={`w-8 h-8 bg-gradient-to-br ${item.color} rounded-lg flex items-center justify-center mx-auto mb-1.5`}>
                <item.icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-[10px] font-medium text-gray-600">{item.label}</p>
            </div>
          ))}
        </div>

        {/* All Versions Toggle */}
        {versions.length > 1 && (
          <button
            onClick={() => setShowAllVersions(!showAllVersions)}
            className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-gray-500 hover:text-purple-600 transition group mb-4"
          >
            <span className="bg-white/60 backdrop-blur-sm px-5 py-2 rounded-full border border-gray-100/80 shadow-sm hover:shadow-md transition flex items-center gap-2">
              {showAllVersions ? 'Hide older versions' : `View all ${versions.length} versions`}
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showAllVersions ? 'rotate-180' : ''}`} />
            </span>
          </button>
        )}

        {/* All Versions List */}
        {showAllVersions && (
          <div className="space-y-3 mt-3 mb-6 sm:mb-8">
            {versions.map((version) => {
              const isLatest = version._id === latestVersion?._id;
              const isCurrent = currentVersion === version.version;

              if (isLatest) return null;

              return (
                <div
                  key={version._id}
                  className={`
                    bg-white rounded-2xl shadow-sm border p-4 sm:p-5
                    ${isCurrent ? 'border-purple-200 bg-purple-50/30 shadow-purple-100' : 'border-gray-100'}
                    transition-all duration-300 hover:shadow-md
                  `}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-bold text-gray-900">v{version.version}</span>
                        {isCurrent && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-semibold rounded-full">
                            <CheckCircle className="w-3 h-3" />
                            Installed
                          </span>
                        )}
                        {!version.isActive && (
                          <span className="px-2.5 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-medium rounded-full">
                            Archived
                          </span>
                        )}
                        {version.isRequired && (
                          <span className="px-2.5 py-0.5 bg-red-100 text-red-700 text-[10px] font-medium rounded-full">
                            Required
                          </span>
                        )}
                      </div>
                      {version.releaseNotes && (
                        <p className="text-sm text-gray-500 line-clamp-2">{version.releaseNotes}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mt-1.5">
                        <span className="flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          {formatFileSize(version.fileSize)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(version.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleShare(version)}
                        className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                        aria-label="Share this version"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openDownloadModal(version)}
                        className={`
                          px-4 py-2 rounded-lg text-sm font-semibold transition
                          ${isCurrent
                            ? 'bg-gray-100 text-gray-400 cursor-default'
                            : 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 hover:from-purple-100 hover:to-purple-200 shadow-sm'
                          }
                        `}
                        disabled={isCurrent}
                      >
                        {isCurrent ? 'Installed' : 'Download'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Install Instructions */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-100/50 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
              <Info className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Installation Guide</h4>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { step: '1', label: 'Download APK', desc: 'Get the latest version' },
              { step: '2', label: 'Allow Install', desc: 'Enable unknown sources' },
              { step: '3', label: 'Install & Open', desc: 'Launch Nexa' }
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl flex items-center justify-center mx-auto mb-1.5 shadow-sm">
                  <span className="text-sm font-bold text-purple-600">{item.step}</span>
                </div>
                <p className="text-xs font-semibold text-gray-700">{item.label}</p>
                <p className="text-[10px] text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Download Modal */}
      {showModal && selectedVersion && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full mx-4 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-6 sm:p-8">
              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-200">
                    {currentVersion && selectedVersion.version !== currentVersion ? (
                      <Zap className="w-6 h-6 text-white" />
                    ) : (
                      <Download className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {currentVersion && selectedVersion.version !== currentVersion ? 'Update Available' : 'Download App'}
                    </h3>
                    <p className="text-sm text-gray-400">Version {selectedVersion.version}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (!isDownloading) {
                      setShowModal(false);
                      setSelectedVersion(null);
                    }
                  }}
                  className="text-gray-400 hover:text-gray-600 transition p-1 hover:bg-gray-100 rounded-lg"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100/30 rounded-xl p-5 mb-5 border border-purple-100">
                {currentVersion && selectedVersion.version !== currentVersion ? (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Current version</span>
                      <span className="text-sm font-bold text-gray-900">v{currentVersion}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-purple-200 rounded-full overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full animate-pulse" />
                      </div>
                      <span className="text-sm font-bold text-purple-600 whitespace-nowrap">v{selectedVersion.version}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">New features and improvements await!</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-700 mb-2">
                      You're about to download <span className="font-bold text-gray-900">Nexa v{selectedVersion.version}</span>
                    </p>
                    {selectedVersion.releaseNotes && (
                      <div className="bg-white/50 rounded-lg p-3 text-sm text-gray-600">
                        {selectedVersion.releaseNotes}
                      </div>
                    )}
                  </>
                )}
                <div className="flex flex-wrap gap-3 text-xs text-gray-400 mt-3 pt-3 border-t border-purple-200/30">
                  <span className="flex items-center gap-1">
                    <Package className="w-3.5 h-3.5" />
                    {formatFileSize(selectedVersion.fileSize)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Smartphone className="w-3.5 h-3.5" />
                    Android APK
                  </span>
                  {selectedVersion.isRequired && (
                    <span className="flex items-center gap-1 text-red-500">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Required update
                    </span>
                  )}
                </div>
                {!isNative && (
                  <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" />
                    File will download in your browser
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (!isDownloading) {
                      setShowModal(false);
                      setSelectedVersion(null);
                    }
                  }}
                  disabled={isDownloading}
                  className={`flex-1 px-4 py-3 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition ${isDownloading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDownload}
                  disabled={isDownloading}
                  className="flex-1 px-4 py-3 text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl hover:from-purple-700 hover:to-purple-800 transition disabled:opacity-75 flex items-center justify-center gap-2 shadow-lg shadow-purple-200"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Preparing...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>{currentVersion && selectedVersion.version !== currentVersion ? 'Update' : 'Download'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Share option */}
              <button
                onClick={() => handleShare(selectedVersion)}
                className="w-full mt-3 flex items-center justify-center gap-2 text-xs text-gray-400 hover:text-purple-600 transition py-2"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Link copied to clipboard!
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    Share download link
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;