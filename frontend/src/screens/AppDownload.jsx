// screens/AppDownload.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGetAppVersionByIdQuery, getAppDownloadUrl } from '../slices/appApiSlice';
import { 
  Download, 
  Smartphone, 
  AlertCircle, 
  Loader2, 
  HardDrive, 
  Calendar, 
  CheckCircle,
  Sparkles,
  Shield,
  Zap,
  Clock,
  Package,
  ArrowLeft,
  Heart,
  Star,
  Users,
  Rocket,
  ExternalLink,
  Info,
  Gift,
  TrendingUp,
  Award
} from 'lucide-react';

const AppDownload = () => {
  const { versionId } = useParams();
  const [downloadStarted, setDownloadStarted] = useState(false);
  const [showInstallTips, setShowInstallTips] = useState(false);
  const [progress, setProgress] = useState(0);

  const { data, isLoading, error } = useGetAppVersionByIdQuery(versionId, {
    skip: !versionId
  });

  const version = data?.data;

  const isNative = typeof window !== 'undefined' && window.Capacitor?.isNativePlatform();

  useEffect(() => {
    let interval;
    if (downloadStarted) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 2;
        });
      }, 80);
    }
    return () => clearInterval(interval);
  }, [downloadStarted]);

  const handleDownload = () => {
    if (!version?._id) return;
    const downloadUrl = getAppDownloadUrl(version._id);
    window.open(downloadUrl, isNative ? '_system' : '_blank');
    setDownloadStarted(true);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-purple-500/20 rounded-full animate-spin border-t-purple-500"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Smartphone className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          <p className="text-gray-400 mt-4 text-sm font-medium">Preparing your download...</p>
        </div>
      </div>
    );
  }

  if (error || !version) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-5 border border-red-500/20">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Download Link Expired</h3>
          <p className="text-gray-400 text-sm mb-6">
            This version is no longer available for download.
          </p>
          <Link
            to="/app"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Go to App
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-y-auto">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-6 min-h-screen flex flex-col">
        {/* Minimal Header */}
        <header className="flex items-center justify-between py-4 border-b border-white/5 flex-shrink-0">
          <Link to="/app" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <Smartphone className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-white">Nexa</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">v{version.version}</span>
            <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
            <span className="text-xs text-green-400 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Verified
            </span>
          </div>
        </header>

        {/* Main Content - Full Screen Split */}
        <div className="flex-1 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center py-6 lg:py-8">
          
          {/* Left Column - Full Phone */}
          <div className="order-2 lg:order-1 flex items-center justify-center">
            <div className="relative flex items-center justify-center w-full">
              {/* Phone Mockup - Taller */}
              <div className="relative max-w-[320px] w-full">
                <div className="absolute -inset-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl blur-3xl opacity-20 animate-pulse"></div>
                <div className="relative bg-gray-900 rounded-[3rem] p-3 border border-white/10 shadow-2xl">
                  <div className="bg-black rounded-[2.5rem] overflow-hidden">
                    {/* Phone Status Bar */}
                    <div className="flex items-center justify-between px-5 py-3 bg-black">
                      <span className="text-xs font-semibold text-white">9:41</span>
                      <div className="flex gap-1">
                        <div className="w-4 h-2 bg-white/70 rounded-sm"></div>
                        <div className="w-3 h-2 bg-white/70 rounded-sm"></div>
                        <div className="w-2 h-2 bg-white/70 rounded-full"></div>
                      </div>
                    </div>
                    
                    {/* Phone Content - Taller with more emails */}
                    <div className="px-4 py-5 space-y-4">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                            <Smartphone className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-sm font-bold text-white">Nexa</span>
                        </div>
                        <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-500/50"></div>
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-500/50"></div>
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                        </div>
                      </div>
                      
                      {/* Email List Preview - More items */}
                      <div className="space-y-2.5">
                        {[
                          { name: 'Sarah Chen', initial: 'S', subject: 'Q4 Strategy Meeting', preview: 'Let us schedule a call...', time: '10:42' },
                          { name: 'Michael O.', initial: 'M', subject: 'New Partnership Deal', preview: 'Exciting opportunities...', time: '9:15' },
                          { name: 'Design Team', initial: 'D', subject: 'Brand Assets Ready', preview: 'Here are the final logos...', time: 'Yesterday' },
                          { name: 'Client Portal', initial: 'C', subject: 'New Message Received', preview: 'You have a new message...', time: 'Yesterday' },
                          { name: 'Alex Rivera', initial: 'A', subject: 'Project Update', preview: 'The team has made progress...', time: '2 days ago' }
                        ].map((item, idx) => (
                          <div key={idx} className="bg-white/5 hover:bg-white/10 rounded-xl p-2.5 flex items-center gap-2.5 transition cursor-pointer">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-white">{item.initial}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-white truncate">{item.name}</span>
                                <span className="text-[8px] text-gray-500 flex-shrink-0 ml-1">{item.time}</span>
                              </div>
                              <p className="text-[9px] font-medium text-gray-300 truncate">{item.subject}</p>
                              <p className="text-[8px] text-gray-500 truncate">{item.preview}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Phone Bottom Nav */}
                    <div className="bg-black/50 border-t border-white/5 px-4 py-2.5 flex justify-around">
                      {['Inbox', 'Team', 'Security', 'More'].map((item, idx) => (
                        <div key={idx} className={`flex flex-col items-center gap-0.5 ${idx === 0 ? 'text-purple-400' : 'text-gray-600'}`}>
                          <div className="w-1 h-1 rounded-full bg-current"></div>
                          <span className="text-[7px] font-medium">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Notch */}
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full"></div>
                  
                  {/* Side Buttons */}
                  <div className="absolute -left-1 top-20 w-1 h-12 bg-gray-800 rounded-l-lg"></div>
                  <div className="absolute -left-1 top-36 w-1 h-20 bg-gray-800 rounded-l-lg"></div>
                  <div className="absolute -right-1 top-24 w-1 h-16 bg-gray-800 rounded-r-lg"></div>
                </div>
              </div>

              {/* Floating Badge - Top Left */}
              <div className="absolute -left-4 lg:-left-12 top-8 bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-3 hidden lg:block animate-float">
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-gray-300">Free Download</span>
                </div>
              </div>

              {/* Floating Badge - Bottom Right */}
              <div className="absolute -right-4 lg:-right-12 bottom-8 bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-3 hidden lg:block animate-float-delayed">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-gray-300">Secure & Verified</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Content */}
          <div className="order-1 lg:order-2 space-y-5 lg:space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-xs text-purple-400 mb-3">
                <Sparkles className="w-3 h-3" />
                Version {version.version}
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                Get the
                <br />
                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Nexa App
                </span>
              </h1>
              <p className="text-gray-400 text-sm leading-relaxed max-w-md mt-2">
                Download the latest version and start managing your emails with power and simplicity.
              </p>
            </div>

            {/* Version Details */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <Package className="w-4 h-4 text-purple-400" />
                <span>{formatFileSize(version.fileSize)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Calendar className="w-4 h-4 text-purple-400" />
                <span>{formatDate(version.releasedAt)}</span>
              </div>
              {version.isRequired && (
                <div className="flex items-center gap-2 text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span>Required Update</span>
                </div>
              )}
            </div>

            {/* Release Notes */}
            {version.releaseNotes && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-sm text-gray-300 leading-relaxed">{version.releaseNotes}</p>
              </div>
            )}

            {/* Download Button with Progress */}
            <div className="space-y-3">
              <button
                onClick={handleDownload}
                disabled={downloadStarted && progress < 100}
                className="w-full relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl"></div>
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl transition-all duration-300"
                  style={{ 
                    width: downloadStarted ? `${progress}%` : '0%',
                    opacity: downloadStarted ? 1 : 0
                  }}
                ></div>
                <div className="relative px-6 py-4 flex items-center justify-center gap-3">
                  {downloadStarted && progress < 100 ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-white" />
                      <span className="text-white font-semibold">Downloading... {progress}%</span>
                    </>
                  ) : downloadStarted && progress >= 100 ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-white" />
                      <span className="text-white font-semibold">Download Started!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 text-white group-hover:scale-110 transition" />
                      <span className="text-white font-semibold">Download APK</span>
                      <Rocket className="w-4 h-4 text-white/70 group-hover:translate-x-1 transition" />
                    </>
                  )}
                </div>
              </button>

              {downloadStarted && progress >= 100 && (
                <p className="text-xs text-gray-400 text-center">
                  If download doesn't start, tap the button again.
                </p>
              )}
            </div>

            {/* Install Guide Toggle */}
            <button
              onClick={() => setShowInstallTips(!showInstallTips)}
              className="text-xs text-gray-500 hover:text-purple-400 transition flex items-center gap-1.5"
            >
              <Info className="w-3 h-3" />
              {showInstallTips ? 'Hide' : 'Show'} installation guide
            </button>

            {showInstallTips && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3 animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-purple-400">1</span>
                  </div>
                  <span className="text-sm text-gray-300">Download the APK file</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-purple-400">2</span>
                  </div>
                  <span className="text-sm text-gray-300">Enable "Install from unknown sources"</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-purple-400">3</span>
                  </div>
                  <span className="text-sm text-gray-300">Open the file and tap Install</span>
                </div>
              </div>
            )}

            {/* Trust Section */}
            <div className="flex items-center gap-4 pt-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-xs text-gray-400">Verified & Secure</span>
              </div>
              <span className="text-xs text-gray-600">•</span>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-gray-400">Latest Version</span>
              </div>
              <span className="text-xs text-gray-600">•</span>
              <div className="flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-gray-400">Android APK</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-3 border-t border-white/5 flex-shrink-0">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
            <span>Built with ❤️ by CurriumX</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Secure Download
              </span>
              <span>v{version.version}</span>
            </div>
          </div>
        </footer>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes floatDelayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(10px); }
        }
        
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: floatDelayed 4s ease-in-out infinite;
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default AppDownload;