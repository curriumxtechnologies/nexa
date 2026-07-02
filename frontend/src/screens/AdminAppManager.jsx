import React, { useState, useEffect } from 'react';
import { useGetAppVersionsQuery, useUploadAppMutation, useUpdateAppMutation, useDeleteAppMutation } from '../slices/adminApiSlice';
import { getAppDownloadUrl } from '../slices/appApiSlice';
import { 
  Code, 
  Upload, 
  Download, 
  Trash2, 
  Edit2, 
  PlusCircle,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Globe,
  Smartphone,
  Calendar,
  HardDrive,
  Tag,
  FileText,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  X
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'react-hot-toast';

const AdminAppManager = () => {
  const [platform, setPlatform] = useState('android');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [uploadData, setUploadData] = useState({
    version: '',
    releaseNotes: '',
    isRequired: false,
    file: null
  });
  const [editData, setEditData] = useState({
    version: '',
    releaseNotes: '',
    isRequired: false,
    isActive: true
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);

  const { data, isLoading, error, refetch } = useGetAppVersionsQuery({ platform });
  const [uploadApp, { isLoading: isUploading }] = useUploadAppMutation();
  const [updateApp, { isLoading: isUpdating }] = useUpdateAppMutation();
  const [deleteApp, { isLoading: isDeleting }] = useDeleteAppMutation();

  const versions = data?.data?.versions || [];
  const latestVersion = data?.data?.latestVersion;

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.endsWith('.apk') && !file.name.endsWith('.aab')) {
        toast.error('Please upload an APK or AAB file');
        return;
      }
      if (file.size > 100 * 1024 * 1024) {
        toast.error('File size must be less than 100MB');
        return;
      }
      setSelectedFile(file);
      setUploadData(prev => ({ ...prev, file }));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadData.version) {
      toast.error('Please enter a version number');
      return;
    }
    if (!uploadData.file) {
      toast.error('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('version', uploadData.version);
    formData.append('releaseNotes', uploadData.releaseNotes);
    formData.append('isRequired', uploadData.isRequired);
    formData.append('platform', platform);
    formData.append('apkFile', uploadData.file);

    try {
      await uploadApp(formData).unwrap();
      toast.success('App version uploaded successfully');
      setShowUploadModal(false);
      setUploadData({ version: '', releaseNotes: '', isRequired: false, file: null });
      setSelectedFile(null);
      refetch();
    } catch (err) {
      toast.error(err.data?.message || 'Failed to upload app');
    }
  };

  const handleUpdate = async (versionId) => {
    try {
      await updateApp({ 
        versionId, 
        data: {
          version: editData.version,
          releaseNotes: editData.releaseNotes,
          isRequired: editData.isRequired,
          isActive: editData.isActive
        }
      }).unwrap();
      toast.success('App version updated successfully');
      setShowEditModal(null);
      refetch();
    } catch (err) {
      toast.error(err.data?.message || 'Failed to update app');
    }
  };

  const handleDelete = async (versionId) => {
    try {
      await deleteApp(versionId).unwrap();
      toast.success('App version deleted successfully');
      setShowDeleteConfirm(null);
      refetch();
    } catch (err) {
      toast.error(err.data?.message || 'Failed to delete app');
    }
  };

  const openEditModal = (version) => {
    setEditData({
      version: version.version,
      releaseNotes: version.releaseNotes || '',
      isRequired: version.isRequired,
      isActive: version.isActive
    });
    setShowEditModal(version);
  };

  // Opens the backend download proxy, which streams the file with the
  // correct .apk filename forced via Content-Disposition — same route
  // used everywhere else in the app, instead of fetching Cloudinary
  // directly and doing a client-side blob rename.
  const handleDownload = (version) => {
    if (!version?._id) return;
    const downloadUrl = getAppDownloadUrl(version._id);
    window.open(downloadUrl, '_blank');
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getVersionBadge = (isRequired, isActive) => {
    if (!isActive) {
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">Inactive</span>;
    }
    if (isRequired) {
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Required</span>;
    }
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Optional</span>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-purple-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">Loading app versions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center px-6">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-gray-700 font-medium mb-1">Failed to load app versions</p>
          <p className="text-gray-400 text-sm mb-4">{error.data?.message || 'Something went wrong'}</p>
          <button onClick={() => refetch()} className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg">
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
        <div className="px-4 py-4 lg:px-8">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-purple-50 rounded-lg">
                <Code className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-800">App Manager</h1>
                <p className="text-xs text-gray-400 hidden lg:block">Manage mobile app versions and updates</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => refetch()}
                className="p-2 text-gray-400 hover:text-purple-600 transition rounded-lg"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition shadow-sm"
              >
                <Upload className="w-4 h-4" />
                <span>Upload New Version</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 lg:px-8 space-y-6">
        {/* Platform Selector */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => setPlatform('android')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                platform === 'android'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Android</span>
            </button>
            <button
              disabled
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
            >
              <Globe className="w-4 h-4" />
              <span>iOS (Coming Soon)</span>
            </button>
          </div>
        </div>

        {/* Latest Version Banner */}
        {latestVersion && (
          <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl p-5 text-white">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Tag className="w-4 h-4" />
                  <span className="text-xs font-medium opacity-80">Latest Version</span>
                </div>
                <h2 className="text-2xl font-bold mb-1">v{latestVersion.version}</h2>
                <p className="text-sm text-purple-200 mb-3 max-w-md">{latestVersion.releaseNotes || 'No release notes'}</p>
                <div className="flex items-center space-x-4 text-xs text-purple-200">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>Released {formatDistanceToNow(new Date(latestVersion.releasedAt), { addSuffix: true })}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <HardDrive className="w-3 h-3" />
                    <span>{formatFileSize(latestVersion.fileSize)}</span>
                  </div>
                  {latestVersion.isRequired && (
                    <div className="flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>Required Update</span>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDownload(latestVersion)}
                className="flex items-center space-x-2 px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                <span>Download APK</span>
              </button>
            </div>
          </div>
        )}

        {/* Version History */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700">Version History</h3>
          </div>
          
          {versions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Code className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No versions uploaded yet</p>
              <p className="text-gray-400 text-sm mt-1">Upload your first APK to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {versions.map((version, index) => (
                <div key={version._id} className="p-5 hover:bg-gray-50/50 transition">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-lg font-semibold text-gray-800">v{version.version}</span>
                        {getVersionBadge(version.isRequired, version.isActive)}
                        {index === 0 && version.isActive && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                            Latest
                          </span>
                        )}
                      </div>
                      {version.releaseNotes && (
                        <p className="text-sm text-gray-600 mb-2">{version.releaseNotes}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{format(new Date(version.createdAt), 'MMM d, yyyy')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <HardDrive className="w-3 h-3" />
                          <span>{formatFileSize(version.fileSize)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FileText className="w-3 h-3" />
                          <span>{version.fileName}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleDownload(version)}
                        className="p-2 text-gray-400 hover:text-purple-600 transition rounded-lg"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(version)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition rounded-lg"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(version)}
                        className="p-2 text-gray-400 hover:text-red-600 transition rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-purple-50 rounded-lg">
                    <Upload className="w-4 h-4 text-purple-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800">Upload New Version</h2>
                </div>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadData({ version: '', releaseNotes: '', isRequired: false, file: null });
                    setSelectedFile(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Version Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={uploadData.version}
                    onChange={(e) => setUploadData(prev => ({ ...prev, version: e.target.value }))}
                    placeholder="1.0.0"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none text-sm"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">Use semantic versioning (e.g., 1.0.0, 2.1.3)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Release Notes
                  </label>
                  <textarea
                    value={uploadData.releaseNotes}
                    onChange={(e) => setUploadData(prev => ({ ...prev, releaseNotes: e.target.value }))}
                    rows="3"
                    placeholder="What's new in this version..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    APK/AAB File <span className="text-red-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-purple-300 transition cursor-pointer"
                    onClick={() => document.getElementById('fileInput').click()}>
                    <input
                      id="fileInput"
                      type="file"
                      accept=".apk,.aab"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    {selectedFile ? (
                      <div className="flex items-center justify-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-sm text-gray-600">{selectedFile.name}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(null);
                            setUploadData(prev => ({ ...prev, file: null }));
                          }}
                          className="text-red-500 hover:text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center space-y-2">
                        <Upload className="w-8 h-8 text-gray-400" />
                        <p className="text-sm text-gray-500">Click to select APK/AAB file</p>
                        <p className="text-xs text-gray-400">Max size: 100MB</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isRequired"
                    checked={uploadData.isRequired}
                    onChange={(e) => setUploadData(prev => ({ ...prev, isRequired: e.target.checked }))}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="isRequired" className="text-sm text-gray-700">
                    Mark as required update
                  </label>
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUploadModal(false);
                      setUploadData({ version: '', releaseNotes: '', isRequired: false, file: null });
                      setSelectedFile(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
                  >
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Upload'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-blue-50 rounded-lg">
                    <Edit2 className="w-4 h-4 text-blue-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800">Edit Version</h2>
                </div>
                <button
                  onClick={() => setShowEditModal(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Version Number
                  </label>
                  <input
                    type="text"
                    value={editData.version}
                    onChange={(e) => setEditData(prev => ({ ...prev, version: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Release Notes
                  </label>
                  <textarea
                    value={editData.releaseNotes}
                    onChange={(e) => setEditData(prev => ({ ...prev, releaseNotes: e.target.value }))}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none text-sm"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="editIsRequired"
                    checked={editData.isRequired}
                    onChange={(e) => setEditData(prev => ({ ...prev, isRequired: e.target.checked }))}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="editIsRequired" className="text-sm text-gray-700">
                    Mark as required update
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="editIsActive"
                    checked={editData.isActive}
                    onChange={(e) => setEditData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="editIsActive" className="text-sm text-gray-700">
                    Active (visible to users)
                  </label>
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <button
                    onClick={() => setShowEditModal(null)}
                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleUpdate(showEditModal._id)}
                    disabled={isUpdating}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
                  >
                    {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800">Delete Version</h2>
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-700">
                    Are you sure you want to delete version <strong>v{showDeleteConfirm.version}</strong>?
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">
                    This action cannot be undone. Users will no longer see this version as an update option.
                  </p>
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(showDeleteConfirm._id)}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                  >
                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Delete'}
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

export default AdminAppManager;