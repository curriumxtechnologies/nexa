import React, { useState, useEffect } from 'react';
import { useGetResendConfigsQuery, useAddResendConfigMutation, useVerifyDomainMutation } from '../slices/emailApiSlice';
import { 
  Globe, 
  Plus, 
  CheckCircle, 
  XCircle, 
  Loader2,
  ExternalLink,
  Trash2,
  Mail,
  Clock,
  AlertCircle,
  Shield,
  Server,
  Copy,
  Check
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const Domains = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [domain, setDomain] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const { data, isLoading, error: fetchError, refetch } = useGetResendConfigsQuery();
  const [addResendConfig] = useAddResendConfigMutation();
  const [verifyDomain] = useVerifyDomainMutation();

  const domains = data?.data || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await addResendConfig({ resendApiKey: apiKey, domain }).unwrap();
      setShowAddModal(false);
      setDomain('');
      setApiKey('');
      refetch();
    } catch (err) {
      setError(err.data?.message || 'Failed to add domain');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyDomain = async (token) => {
    try {
      await verifyDomain(token).unwrap();
      refetch();
    } catch (err) {
      console.error('Verification failed:', err);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (isVerified) => {
    if (isVerified) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Verified
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <Clock className="w-3 h-3 mr-1" />
        Pending Verification
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading domains...</p>
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
              <Globe className="w-6 h-6 text-purple-600" />
              <h1 className="text-xl font-semibold text-gray-800">Domains</h1>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Domain</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 lg:px-6">
        {domains.length === 0 ? (
          <div className="text-center py-16">
            <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No domains added yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Add your first domain to start sending emails
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Add Domain
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {domains.map((domain) => (
              <div
                key={domain.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
              >
                {/* Domain Header */}
                <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-white">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Globe className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{domain.domain}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          {getStatusBadge(domain.isVerified)}
                          <button
                            onClick={() => copyToClipboard(domain.domain, domain.id)}
                            className="text-gray-400 hover:text-gray-600"
                            title="Copy domain"
                          >
                            {copiedId === domain.id ? (
                              <Check className="w-3 h-3 text-green-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    {domain.isVerified && (
                      <Shield className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                </div>

                {/* Domain Details */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Added:</span>
                    <span className="text-gray-700">
                      {formatDistanceToNow(new Date(domain.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  {domain.verifiedAt && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Verified:</span>
                      <span className="text-gray-700">
                        {formatDistanceToNow(new Date(domain.verifiedAt), { addSuffix: true })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                  {!domain.isVerified ? (
                    <div className="flex items-center space-x-2 text-xs text-yellow-600">
                      <AlertCircle className="w-4 h-4" />
                      <span>Awaiting verification</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-xs text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>Active</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => window.open(`https://resend.com/domains/${domain.domain}`, '_blank')}
                      className="text-sm text-purple-600 hover:text-purple-700 flex items-center space-x-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Resend</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Domain Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Plus className="w-5 h-5 text-purple-600" />
                  <h2 className="text-xl font-semibold text-gray-800">Add Domain</h2>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Domain Name
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      placeholder="example.com"
                      required
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Enter your domain name (e.g., yourcompany.com)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Resend API Key
                  </label>
                  <div className="relative">
                    <Server className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="re_xxxxxxxxxxxxxxxx"
                      required
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Your Resend API key from the Resend dashboard
                  </p>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700">
                    <strong>Note:</strong> Make sure your domain is already added and verified in your Resend account. 
                    We'll send a verification email to verify@{domain} to confirm ownership.
                  </p>
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Adding...
                      </span>
                    ) : (
                      'Add Domain'
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

export default Domains;