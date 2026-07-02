// screens/AppDownload.jsx
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGetAppVersionByIdQuery, getAppDownloadUrl } from '../slices/appApiSlice';
import { Download, Smartphone, AlertCircle, Loader2, HardDrive, Calendar, CheckCircle } from 'lucide-react';

const AppDownload = () => {
  const { versionId } = useParams();
  const [downloadStarted, setDownloadStarted] = useState(false);

  const { data, isLoading, error } = useGetAppVersionByIdQuery(versionId, {
    skip: !versionId
  });

  const version = data?.data;

  const isNative = typeof window !== 'undefined' && window.Capacitor?.isNativePlatform();

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading version details...</p>
        </div>
      </div>
    );
  }

  if (error || !version) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-sm">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-gray-800 font-semibold mb-2">Version not found</p>
          <p className="text-gray-500 text-sm">
            This download link may be invalid or the version is no longer available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-br from-purple-600 to-purple-700 px-6 py-8 text-center text-white">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold mb-1">Nexa Mobile App</h1>
            <p className="text-purple-200 text-sm">Version {version.version}</p>
          </div>

          <div className="p-6 space-y-5">
            {version.releaseNotes && (
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                  What's new
                </h3>
                <p className="text-sm text-gray-700">{version.releaseNotes}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-gray-500">
                <HardDrive className="w-4 h-4" />
                <span>{formatFileSize(version.fileSize)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(version.releasedAt)}</span>
              </div>
            </div>

            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition font-semibold shadow-sm"
            >
              <Download className="w-5 h-5" />
              {downloadStarted ? 'Download Started' : 'Download APK'}
            </button>

            {downloadStarted && (
              <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg text-xs text-green-700">
                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>
                  If the download didn't start automatically, tap the button again or check your browser's downloads.
                </p>
              </div>
            )}

            <div className="p-3 bg-yellow-50 rounded-lg">
              <p className="text-xs text-yellow-700">
                <strong>Note:</strong> After downloading, you may need to enable "Install from unknown sources" in your device settings to install the app.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppDownload;