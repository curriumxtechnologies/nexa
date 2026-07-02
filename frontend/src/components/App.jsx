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
  Award,
  Star,
  Crown,
  Rocket,
  MoveRight,
  Play,
  Layers,
  Grid3x3,
  Circle,
  Hexagon,
  Triangle,
  Square
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
  const [copied, setCopied] = useState(false);

  const { user, token } = useSelector((state) => state.auth);

  const { data, isLoading, error, refetch } = useGetAppVersionsQuery({ platform: 'android' });
  const [updateUserVersion] = useUpdateUserAppVersionMutation();

  const versions = data?.data?.versions || [];
  const latestVersion = versions[0] || null;

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

  const openDownloadModal = (version) => {
    if (!version?._id) return;
    setSelectedVersion(version);
    setShowModal(true);
  };

  const handleConfirmDownload = () => {
    if (!selectedVersion?._id) {
      setShowModal(false);
      return;
    }
    setIsDownloading(true);
    const downloadUrl = getAppDownloadUrl(selectedVersion._id, token);
    window.open(downloadUrl, isNative ? '_system' : '_blank');
    if (token && user?.id) {
      updateUserVersion({
        token,
        version: selectedVersion.version
      }).unwrap().catch(err => console.error('Failed to update version:', err));
    }
    localStorage.setItem('appVersion', selectedVersion.version);
    setCurrentVersion(selectedVersion.version);
    setTimeout(() => {
      setShowModal(false);
      setIsDownloading(false);
      setSelectedVersion(null);
    }, 1000);
  };

  const handleShare = async (version) => {
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/app/download/${version._id}`;
    const shareData = {
      title: 'Nexa App',
      text: `Download Nexa v${version.version} - ${version.releaseNotes || 'Latest update'}`,
      url: shareUrl
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Share failed:', error);
        try {
          await navigator.clipboard.writeText(shareUrl);
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
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin mx-auto"></div>
            <Smartphone className="w-10 h-10 text-purple-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-6 text-gray-400 font-light tracking-wider">LOADING</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-5 border border-red-500/20">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
          <h3 className="text-lg font-light text-white mb-2">Connection Error</h3>
          <p className="text-gray-400 text-sm mb-6 font-light">Unable to load app information</p>
          <button
            onClick={() => refetch()}
            className="px-8 py-3 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full hover:bg-purple-500/20 transition text-sm font-light tracking-wider"
          >
            RETRY
          </button>
        </div>
      </div>
    );
  }

  const needsUpdate = currentVersion && latestVersion && currentVersion !== latestVersion.version;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Geometric Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-64 h-64 border border-purple-500/5 rounded-full animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 border border-purple-500/5 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-purple-500/5 rotate-45 animate-pulse delay-700"></div>
          <div className="absolute top-1/4 right-1/4 w-32 h-32 border border-purple-400/10 rotate-12"></div>
          <div className="absolute bottom-1/3 left-1/3 w-48 h-48 border border-purple-400/10 -rotate-12"></div>
        </div>
      </div>

      {/* Minimal Header */}
      <header className="relative z-20 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5 sticky top-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-light text-white tracking-wider">NEXA</span>
            </div>
            {currentVersion && (
              <span className="text-xs text-gray-500 font-light tracking-wider px-4 py-1.5 border border-white/5 rounded-full">
                v{currentVersion}
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 relative z-10">
        {/* Hero - Minimalist */}
        {latestVersion && (
          <div className="mb-12">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-5xl sm:text-6xl font-light text-white tracking-tight">
                    {latestVersion.version}
                  </span>
                  {needsUpdate ? (
                    <span className="px-3 py-1 border border-yellow-500/30 text-yellow-400 text-xs rounded-full font-light tracking-wider">
                      UPDATE
                    </span>
                  ) : (
                    <span className="px-3 py-1 border border-green-500/30 text-green-400 text-xs rounded-full font-light tracking-wider">
                      LATEST
                    </span>
                  )}
                  {latestVersion.isRequired && (
                    <span className="px-3 py-1 border border-red-500/30 text-red-400 text-xs rounded-full font-light tracking-wider">
                      REQUIRED
                    </span>
                  )}
                </div>
                
                {latestVersion.releaseNotes && (
                  <p className="text-gray-400 text-sm font-light max-w-xl leading-relaxed">
                    {latestVersion.releaseNotes}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-6 mt-4 text-xs text-gray-500 font-light">
                  <span>{formatFileSize(latestVersion.fileSize)}</span>
                  <span>•</span>
                  <span>{formatDate(latestVersion.createdAt)}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Verified
                  </span>
                </div>
              </div>

              <div className="flex gap-3 flex-shrink-0">
                <button
                  onClick={() => openDownloadModal(latestVersion)}
                  className="group px-8 py-3.5 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition flex items-center gap-2 text-sm font-light tracking-wider"
                >
                  {needsUpdate ? 'Update' : 'Download'}
                  <MoveRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </button>
                <button
                  onClick={() => handleShare(latestVersion)}
                  className="px-4 py-3.5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 rounded-full transition"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status Line */}
        {currentVersion && latestVersion && (
          <div className="mb-10">
            <div className="flex items-center gap-3 text-sm">
              <div className={`w-1.5 h-1.5 rounded-full ${needsUpdate ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
              <span className="text-gray-500 font-light">
                {needsUpdate ? (
                  <>New version <span className="text-purple-400">v{latestVersion.version}</span> available</>
                ) : (
                  'Latest version installed'
                )}
              </span>
            </div>
          </div>
        )}

        {/* Feature Grid - Minimal */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          {[
            { label: 'Fast', icon: Zap },
            { label: 'Secure', icon: Shield },
            { label: 'Auto', icon: TrendingUp },
            { label: 'Free', icon: Crown }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="border border-white/5 rounded-2xl p-4 text-center hover:border-white/10 transition">
                <Icon className="w-5 h-5 text-purple-400 mx-auto mb-2" />
                <p className="text-[10px] text-gray-500 font-light tracking-wider">{item.label}</p>
              </div>
            );
          })}
        </div>

        {/* Versions - Minimal */}
        {versions.length > 1 && (
          <button
            onClick={() => setShowAllVersions(!showAllVersions)}
            className="w-full flex items-center justify-center gap-2 py-4 text-xs text-gray-500 hover:text-gray-300 transition font-light tracking-wider"
          >
            {showAllVersions ? 'Hide older versions' : `View all ${versions.length} versions`}
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showAllVersions ? 'rotate-180' : ''}`} />
          </button>
        )}

        {showAllVersions && (
          <div className="space-y-2 mt-4 mb-10">
            {versions.map((version) => {
              const isLatest = version._id === latestVersion?._id;
              const isCurrent = currentVersion === version.version;
              if (isLatest) return null;

              return (
                <div
                  key={version._id}
                  className={`group border ${isCurrent ? 'border-purple-500/20 bg-purple-500/5' : 'border-white/5'} rounded-2xl p-4 hover:border-white/10 transition`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-white font-light">v{version.version}</span>
                      {isCurrent && (
                        <span className="text-[10px] text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full font-light">INSTALLED</span>
                      )}
                      {version.isRequired && (
                        <span className="text-[10px] text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full font-light">REQUIRED</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleShare(version)}
                        className="p-2 text-gray-500 hover:text-gray-300 transition rounded-full"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openDownloadModal(version)}
                        disabled={isCurrent}
                        className={`px-4 py-1.5 rounded-full text-xs font-light tracking-wider transition ${
                          isCurrent
                            ? 'text-gray-500 cursor-default'
                            : 'border border-white/10 text-gray-300 hover:bg-white/5'
                        }`}
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

        {/* Instructions - Minimal */}
        <div className="border border-white/5 rounded-2xl p-6">
          <p className="text-[10px] text-gray-500 tracking-wider mb-4 font-light">INSTALLATION</p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { step: '01', label: 'Download' },
              { step: '02', label: 'Allow' },
              { step: '03', label: 'Install' }
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="text-xs text-purple-400 font-light mb-1">{item.step}</div>
                <p className="text-xs text-gray-400 font-light">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal - Minimal */}
      {showModal && selectedVersion && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50 p-4">
          <div className="bg-[#12121a] border border-white/5 rounded-3xl max-w-md w-full p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-light text-white">
                  {currentVersion && selectedVersion.version !== currentVersion ? 'Update' : 'Download'}
                </h3>
                <p className="text-sm text-gray-500 font-light">v{selectedVersion.version}</p>
              </div>
              <button
                onClick={() => {
                  if (!isDownloading) {
                    setShowModal(false);
                    setSelectedVersion(null);
                  }
                }}
                className="text-gray-500 hover:text-gray-300 transition"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="border border-white/5 rounded-2xl p-4 mb-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-500 font-light">Size</span>
                <span className="text-white font-light">{formatFileSize(selectedVersion.fileSize)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 font-light">Platform</span>
                <span className="text-white font-light">Android</span>
              </div>
              {selectedVersion.releaseNotes && (
                <div className="mt-3 pt-3 border-t border-white/5 text-sm text-gray-400 font-light">
                  {selectedVersion.releaseNotes}
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
                className="flex-1 px-4 py-3 border border-white/5 text-gray-400 rounded-full hover:bg-white/5 transition font-light text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDownload}
                disabled={isDownloading}
                className="flex-1 px-4 py-3 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition flex items-center justify-center gap-2 font-light text-sm"
              >
                {isDownloading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Confirm
                  </>
                )}
              </button>
            </div>

            <button
              onClick={() => handleShare(selectedVersion)}
              className="w-full mt-4 flex items-center justify-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition font-light py-2"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Share2 className="w-3.5 h-3.5" />
              )}
              {copied ? 'Link copied' : 'Share download link'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;