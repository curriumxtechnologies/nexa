import React, { useState } from 'react';
import { useCreateCustomEmailMutation } from '../slices/emailApiSlice';
import { X, Plus, Loader2, AlertCircle, Camera } from 'lucide-react';

const CreateCustomEmailModal = ({ availableDomains, onClose, onSuccess }) => {
  const [createCustomEmail, { isLoading }] = useCreateCustomEmailMutation();

  const [username, setUsername] = useState('');
  const [forwardToEmail, setForwardToEmail] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [signature, setSignature] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [selectedResendConfigId, setSelectedResendConfigId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
      reader.onloadend = () => setProfilePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!selectedResendConfigId) return setError('Please select a domain');
    if (!username) return setError('Please enter a username');
    if (!forwardToEmail) return setError('Please enter a forward email address');

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
      setSuccess('Custom email created successfully!');
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1000);
    } catch (err) {
      setError(err.data?.message || 'Failed to create custom email');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-[9999] p-0 sm:p-4">
      <div className="bg-white rounded-t-xl sm:rounded-xl shadow-xl w-full max-w-md max-h-[75vh] sm:max-h-[90vh] mb-16 sm:mb-0 overflow-y-auto flex flex-col">
        <div className="p-4 sm:p-5 sticky top-0 bg-white border-b border-gray-100 z-10 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-purple-50 rounded-lg">
                <Plus className="w-4 h-4 text-purple-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Create Custom Email</h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}

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
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Domain</label>
            <select
              value={selectedResendConfigId}
              onChange={(e) => setSelectedResendConfigId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none text-sm"
              required
            >
              <option value="">Select a domain</option>
              {availableDomains.map((domain) => (
                <option key={domain.id || domain.resendConfigId} value={domain.id || domain.resendConfigId}>
                  {domain.domain}
                  {domain.permissions?.canCreateCustomEmails && !domain.owner && ' (Team)'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                placeholder="support"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none text-sm"
                required
              />
              <span className="text-gray-500 text-sm">@</span>
              <span className="text-gray-600 text-sm truncate max-w-[120px]">
                {availableDomains.find(d => (d.id || d.resendConfigId) === selectedResendConfigId)?.domain || 'domain.com'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Name (Optional)</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="John Doe"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Forward To Email</label>
            <input
              type="email"
              value={forwardToEmail}
              onChange={(e) => setForwardToEmail(e.target.value)}
              placeholder="your-personal@email.com"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none text-sm"
              required
            />
            <p className="text-xs text-gray-400 mt-1">Emails will be forwarded to this address</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Signature (Optional)</label>
            <textarea
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              rows="2"
              placeholder="Best regards,&#10;John Doe"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none text-sm"
            />
          </div>

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

          <div className="flex items-center space-x-3 pt-2 pb-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Create Email'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCustomEmailModal;