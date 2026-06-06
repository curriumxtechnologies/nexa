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
  Camera
} from 'lucide-react';
import { format } from 'date-fns';

const CustomEmails = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
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
      setSuccess(`Custom email ${username}@${domains.find(d => d.id === selectedResendConfigId)?.domain} created successfully!`);
      
      // Reset form
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
      
      setTimeout(() => setSuccess(''), 3000);
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
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading custom emails...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4 lg:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Mail className="w-6 h-6 text-purple-600" />
              <h1 className="text-xl font-semibold text-gray-800">Custom Emails</h1>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              disabled={domains.length === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              <span>Create Email</span>
            </button>
          </div>
          {domains.length === 0 && (
            <p className="text-sm text-yellow-600 mt-2">
              Please add and verify a domain first before creating custom emails.
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 lg:px-6">
        {customEmails.length === 0 ? (
          <div className="text-center py-16">
            <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No custom emails created yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Create your first custom email address to start sending emails
            </p>
            {domains.length > 0 && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                Create Custom Email
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {customEmails.map((email) => (
              <div
                key={email._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
              >
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {email.profilePicture?.url ? (
                        <img
                          src={email.profilePicture.url}
                          alt={email.displayName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-purple-600" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {email.displayName || email.username}
                          </h3>
                          {email.isDefault && (
                            <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{email.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(email.email, email._id)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="Copy email"
                    >
                      {copiedId === email._id ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Forward to:</span>
                    <span className="text-gray-700">{email.forwardToEmail}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Created:</span>
                    <span className="text-gray-700">
                      {format(new Date(email.createdAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                  {email.signature && (
                    <div className="text-sm">
                      <span className="text-gray-500">Signature:</span>
                      <p className="text-gray-700 mt-1 text-xs line-clamp-2">{email.signature}</p>
                    </div>
                  )}
                </div>

                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AtSign className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500">{email.domain}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Custom Email Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Plus className="w-5 h-5 text-purple-600" />
                  <h2 className="text-xl font-semibold text-gray-800">Create Custom Email</h2>
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

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-600">{success}</p>
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
                          className="w-20 h-20 rounded-full object-cover border-2 border-purple-200"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center border-2 border-purple-200">
                          <Camera className="w-8 h-8 text-purple-600" />
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
                    required
                  >
                    <option value="">Select a domain</option>
                    {domains.map((domain) => (
                      <option key={domain.id} value={domain.id}>
                        {domain.domain} {domain.verified ? '(Verified)' : '(Pending)'}
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
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
                      required
                    />
                    <span className="text-gray-500">@</span>
                    <span className="text-gray-600">
                      {domains.find(d => d.id === selectedResendConfigId)?.domain || 'domain.com'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    This will create {username}@{domains.find(d => d.id === selectedResendConfigId)?.domain || 'domain.com'}
                  </p>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Emails sent to this custom address will be forwarded here
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
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
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
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
        </div>
      )}
    </div>
  );
};

export default CustomEmails;