import React, { useState } from 'react';
import { useGetCustomEmailsQuery, useCreateCustomEmailMutation } from '../slices/emailApiSlice';
import { 
  Mail, 
  Plus, 
  Trash2, 
  Star,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  Copy,
  Check,
  ExternalLink,
  User,
  AtSign,
  Camera,
  ChevronRight,
  Settings,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';

const CustomEmails = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(null);
  const [username, setUsername] = useState('');
  const [forwardToEmail, setForwardToEmail] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [signature, setSignature] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [selectedResendConfigId, setSelectedResendConfigId] = useState('');

  const { data, isLoading, refetch } = useGetCustomEmailsQuery();
  const [createCustomEmail] = useCreateCustomEmailMutation();

  const domains = data?.data?.domains || [];
  const customEmails = data?.data?.emails || [];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Profile picture must be less than 5MB');
        return;
      }
      
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('Only image files are allowed (JPEG, PNG, GIF, WEBP)');
        return;
      }
      
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    if (!selectedResendConfigId) {
      setError('Please select a domain');
      setIsSubmitting(false);
      return;
    }

    if (!username) {
      setError('Please enter a username');
      setIsSubmitting(false);
      return;
    }

    if (!forwardToEmail) {
      setError('Please enter a forward email address');
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('forwardToEmail', forwardToEmail);
      formData.append('resendConfigId', selectedResendConfigId);
      if (isDefault) formData.append('isDefault', true);
      if (displayName) formData.append('displayName', displayName);
      if (signature) formData.append('signature', signature);
      if (profilePicture) formData.append('profilePicture', profilePicture);

      await createCustomEmail(formData).unwrap();
      
      setUsername('');
      setForwardToEmail('');
      setIsDefault(false);
      setDisplayName('');
      setSignature('');
      setProfilePicture(null);
      setProfilePreview(null);
      setSelectedResendConfigId('');
      setShowCreateModal(false);
      
      refetch();
    } catch (err) {
      setError(err.data?.message || 'Failed to create custom email');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-purple-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading custom emails...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="px-4 py-4 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-purple-50 rounded-lg">
                <Mail className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-800">Custom Emails</h1>
                <p className="text-xs text-gray-400 hidden lg:block">Manage your custom email addresses</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              disabled={domains.length === 0}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              <span>Create Email</span>
            </button>
          </div>
          {domains.length === 0 && (
            <div className="mt-2 p-2 bg-yellow-50 rounded-lg">
              <p className="text-xs text-yellow-700 flex items-center space-x-1">
                <AlertCircle className="w-3 h-3" />
                <span>Please add and verify a domain first before creating custom emails.</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 lg:px-8">
        {customEmails.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No custom emails created yet</p>
            <p className="text-gray-400 text-sm mt-1">Create your first custom email address</p>
            {domains.length > 0 && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition"
              >
                Create Custom Email
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {/* Desktop Table Header */}
            <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="col-span-4">Email Address</div>
              <div className="col-span-3">Forward To</div>
              <div className="col-span-3">Created</div>
              <div className="col-span-2"></div>
            </div>

            {/* Email List Items */}
            {customEmails.map((email) => (
              <div
                key={email._id}
                className="bg-white border border-gray-100 rounded-lg lg:rounded-none lg:border-x-0 lg:border-t-0 hover:bg-gray-50/50 transition"
              >
                <div className="p-4 lg:grid lg:grid-cols-12 lg:gap-4 lg:items-center lg:p-3">
                  {/* Email Info */}
                  <div className="lg:col-span-4 mb-3 lg:mb-0">
                    <div className="flex items-center space-x-3">
                      {email.profilePicture?.url ? (
                        <img
                          src={email.profilePicture.url}
                          alt={email.displayName}
                          className="w-10 h-10 lg:w-8 lg:h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 lg:w-8 lg:h-8 bg-purple-50 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 lg:w-4 lg:h-4 text-purple-600" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <p className="font-medium text-gray-800 text-sm lg:text-base">
                            {email.displayName || email.username}
                          </p>
                          {email.isDefault && (
                            <span className="px-1.5 py-0.5 text-[10px] bg-green-100 text-green-700 rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-1 mt-0.5">
                          <p className="text-xs text-gray-500">{email.email}</p>
                          <button
                            onClick={() => copyToClipboard(email.email, email._id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {copiedId === email._id ? (
                              <Check className="w-3 h-3 text-green-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Forward To - Desktop */}
                  <div className="hidden lg:block lg:col-span-3">
                    <p className="text-sm text-gray-600 truncate">{email.forwardToEmail}</p>
                  </div>

                  {/* Created Date - Desktop */}
                  <div className="hidden lg:block lg:col-span-3">
                    <p className="text-xs text-gray-500">
                      {format(new Date(email.createdAt), 'MMM d, yyyy')}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="lg:col-span-2 flex items-center justify-between lg:justify-end mt-3 lg:mt-0">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setShowDetailsModal(email)}
                        className="text-gray-400 hover:text-purple-600 transition p-1"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 lg:hidden" />
                  </div>
                </div>

                {/* Mobile Extended Info */}
                <div className="lg:hidden px-4 pb-4 pt-0 border-t border-gray-50 mt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Forward to:</span>
                    <span className="text-gray-600 truncate ml-2">{email.forwardToEmail}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="text-gray-500">Created:</span>
                    <span className="text-gray-600">
                      {format(new Date(email.createdAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                  {email.signature && (
                    <div className="mt-2 pt-2 border-t border-gray-50">
                      <p className="text-xs text-gray-500 mb-1">Signature:</p>
                      <p className="text-xs text-gray-600 line-clamp-2">{email.signature}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Custom Email Modal - Fixed for mobile */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end lg:items-center justify-center z-50 p-0 lg:p-4">
          <div className="bg-white rounded-t-xl lg:rounded-xl shadow-xl w-full max-w-md max-h-[85vh] overflow-y-auto lg:max-h-[90vh]">
            <div className="p-5 sticky top-0 bg-white border-b border-gray-100 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-purple-50 rounded-lg">
                    <Plus className="w-4 h-4 text-purple-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800">Create Custom Email</h2>
                </div>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setError('');
                    setUsername('');
                    setForwardToEmail('');
                    setIsDefault(false);
                    setDisplayName('');
                    setSignature('');
                    setProfilePicture(null);
                    setProfilePreview(null);
                    setSelectedResendConfigId('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 pb-8">
              {error && (
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Profile Picture */}
              <div className="flex justify-center">
                <label className="cursor-pointer">
                  <div className="relative">
                    {profilePreview ? (
                      <img
                        src={profilePreview}
                        alt="Profile preview"
                        className="w-16 h-16 rounded-full object-cover border-2 border-purple-200"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center border-2 border-purple-200">
                        <Camera className="w-6 h-6 text-purple-600" />
                      </div>
                    )}
                    <div className="absolute bottom-0 right-0 bg-purple-600 rounded-full p-1 border-2 border-white">
                      <Camera className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Domain Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Domain
                </label>
                <select
                  value={selectedResendConfigId}
                  onChange={(e) => setSelectedResendConfigId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none text-sm"
                  required
                >
                  <option value="">Select a domain</option>
                  {domains.map((domain) => (
                    <option key={domain.id} value={domain.id}>
                      {domain.domain}
                    </option>
                  ))}
                </select>
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase())}
                    placeholder="support"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none text-sm"
                    required
                  />
                  <span className="text-gray-500 text-sm">@</span>
                  <span className="text-gray-600 text-sm">
                    {domains.find(d => d.id === selectedResendConfigId)?.domain || 'domain.com'}
                  </span>
                </div>
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name (Optional)
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none text-sm"
                />
              </div>

              {/* Forward To Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Forward To Email
                </label>
                <input
                  type="email"
                  value={forwardToEmail}
                  onChange={(e) => setForwardToEmail(e.target.value)}
                  placeholder="your-personal@email.com"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none text-sm"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  Emails will be forwarded to this address
                </p>
              </div>

              {/* Signature */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Signature (Optional)
                </label>
                <textarea
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  rows="2"
                  placeholder="Best regards,&#10;John Doe"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none text-sm"
                />
              </div>

              {/* Default Checkbox */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="isDefault" className="text-sm text-gray-700">
                  Set as default email address
                </label>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setError('');
                    setUsername('');
                    setForwardToEmail('');
                    setIsDefault(false);
                    setDisplayName('');
                    setSignature('');
                    setProfilePicture(null);
                    setProfilePreview(null);
                    setSelectedResendConfigId('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  ) : (
                    'Create Email'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Email Details Modal - Fixed for mobile */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end lg:items-center justify-center z-50 p-0 lg:p-4">
          <div className="bg-white rounded-t-xl lg:rounded-xl shadow-xl w-full max-w-md max-h-[85vh] overflow-y-auto">
            <div className="p-5 sticky top-0 bg-white border-b border-gray-100 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-purple-50 rounded-lg">
                    <Mail className="w-4 h-4 text-purple-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800">Email Details</h2>
                </div>
                <button
                  onClick={() => setShowDetailsModal(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4 pb-8">
              <div className="flex items-center space-x-3">
                {showDetailsModal.profilePicture?.url ? (
                  <img
                    src={showDetailsModal.profilePicture.url}
                    alt={showDetailsModal.displayName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-purple-600" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-800">{showDetailsModal.displayName || showDetailsModal.username}</p>
                  <p className="text-sm text-gray-500">{showDetailsModal.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Forward To:</span>
                  <span className="text-sm text-gray-700">{showDetailsModal.forwardToEmail}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Domain:</span>
                  <span className="text-sm text-gray-700">{showDetailsModal.domain}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Created:</span>
                  <span className="text-sm text-gray-700">
                    {format(new Date(showDetailsModal.createdAt), 'MMM d, yyyy')}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Default:</span>
                  <span className="text-sm">
                    {showDetailsModal.isDefault ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <X className="w-4 h-4 text-gray-400" />
                    )}
                  </span>
                </div>
                {showDetailsModal.signature && (
                  <div className="py-2">
                    <p className="text-sm text-gray-500 mb-1">Signature:</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{showDetailsModal.signature}</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  copyToClipboard(showDetailsModal.email, showDetailsModal._id);
                  setShowDetailsModal(null);
                }}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                <Copy className="w-4 h-4" />
                <span>Copy Email Address</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomEmails;