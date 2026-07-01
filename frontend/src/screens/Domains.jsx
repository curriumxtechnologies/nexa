import React, { useState, useEffect } from 'react';
import { 
  useGetResendConfigsQuery, 
  useAddResendConfigMutation, 
  useAddWebhookSecretMutation,
  useUpdateWebhookSecretMutation,
  useDeleteWebhookSecretMutation,
  useGetWebhookConfigQuery,
  useGetAccessibleDomainsQuery
} from '../slices/emailApiSlice';
import { 
  Globe, 
  Plus, 
  CheckCircle, 
  XCircle, 
  Loader2,
  ExternalLink,
  Mail,
  Clock,
  AlertCircle,
  Shield,
  Server,
  Copy,
  Check,
  Webhook,
  Key,
  Link as LinkIcon,
  Zap,
  Settings,
  ChevronRight,
  Edit,
  Trash2,
  RefreshCw,
  Users,
  Crown
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const Domains = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showWebhookModal, setShowWebhookModal] = useState(null);
  const [webhookMode, setWebhookMode] = useState('add');
  const [domain, setDomain] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddingWebhook, setIsAddingWebhook] = useState(false);
  const [error, setError] = useState('');
  const [webhookError, setWebhookError] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [isDeletingWebhook, setIsDeletingWebhook] = useState(false);

  const { data, isLoading, error: fetchError, refetch } = useGetResendConfigsQuery();
  const { data: accessibleData, isLoading: isLoadingAccessible, refetch: refetchAccessible } = useGetAccessibleDomainsQuery();
  const [addResendConfig] = useAddResendConfigMutation();
  const [addWebhookSecret] = useAddWebhookSecretMutation();
  const [updateWebhookSecret] = useUpdateWebhookSecretMutation();
  const [deleteWebhookSecret] = useDeleteWebhookSecretMutation();

  const ownedDomains = data?.data || [];
  const teamDomains = accessibleData?.data || [];
  
  const API_URL = import.meta.env.VITE_API_URL || 'https://nexa-tq69.onrender.com';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = await addResendConfig({ resendApiKey: apiKey, domain }).unwrap();
      setShowAddModal(false);
      setDomain('');
      setApiKey('');
      refetch();
      
      if (result.data?.configId) {
        setTimeout(() => {
          setWebhookMode('add');
          setShowWebhookModal(result.data.configId);
        }, 500);
      }
    } catch (err) {
      setError(err.data?.message || 'Failed to add domain');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveWebhookSecret = async (configId) => {
    if (!webhookSecret) {
      setWebhookError('Please enter a webhook secret');
      return;
    }
    
    setWebhookError('');
    setIsAddingWebhook(true);
    
    try {
      if (webhookMode === 'edit') {
        await updateWebhookSecret({ 
          resendConfigId: configId, 
          data: { webhookSecret }
        }).unwrap();
      } else {
        await addWebhookSecret({ 
          resendConfigId: configId, 
          webhookSecret 
        }).unwrap();
      }
      setShowWebhookModal(null);
      setWebhookSecret('');
      setWebhookMode('add');
      refetch();
    } catch (err) {
      setWebhookError(err.data?.message || 'Failed to save webhook secret');
    } finally {
      setIsAddingWebhook(false);
    }
  };

  const handleDeleteWebhookSecret = async (configId) => {
    setIsDeletingWebhook(true);
    try {
      await deleteWebhookSecret(configId).unwrap();
      setShowDeleteConfirm(null);
      setShowWebhookModal(null);
      refetch();
    } catch (err) {
      setWebhookError(err.data?.message || 'Failed to delete webhook secret');
    } finally {
      setIsDeletingWebhook(false);
    }
  };

  const openWebhookModal = (configId, hasSecret, mode = 'edit') => {
    setWebhookMode(mode);
    setShowWebhookModal(configId);
    setWebhookSecret('');
    setWebhookError('');
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const copyWebhookUrl = (url) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const getStatusBadge = (isVerified) => {
    if (isVerified) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
          <CheckCircle className="w-3 h-3 mr-1" />
          Verified
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
        <Clock className="w-3 h-3 mr-1" />
        Pending
      </span>
    );
  };

  const getWebhookStatusBadge = (hasWebhookSecret) => {
    if (hasWebhookSecret) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
          <Zap className="w-3 h-3 mr-1" />
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
        <AlertCircle className="w-3 h-3 mr-1" />
        Not Configured
      </span>
    );
  };

  const getAccessLevelBadge = (accessLevel) => {
    const colors = {
      view: 'bg-blue-100 text-blue-700',
      send: 'bg-indigo-100 text-indigo-700',
      manage: 'bg-orange-100 text-orange-700',
      admin: 'bg-red-100 text-red-700',
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[accessLevel] || 'bg-gray-100 text-gray-600'}`}>
        <Users className="w-3 h-3 mr-1" />
        {accessLevel?.charAt(0).toUpperCase() + accessLevel?.slice(1)}
      </span>
    );
  };

  if (isLoading || isLoadingAccessible) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-purple-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading domains...</p>
        </div>
      </div>
    );
  }

  const hasAnyDomains = ownedDomains.length > 0 || teamDomains.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="px-4 py-4 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-purple-50 rounded-lg">
                <Globe className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-800">Domains</h1>
                <p className="text-xs text-gray-400 hidden lg:block">Manage your sending domains and webhooks</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Domain</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 lg:px-8">
        {!hasAnyDomains ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No domains added yet</p>
            <p className="text-gray-400 text-sm mt-1">Add your first domain to start sending emails</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition"
            >
              Add Domain
            </button>
          </div>
        ) : (
          <div className="space-y-6">

            {/* ── OWNED DOMAINS ── */}
            {ownedDomains.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Crown className="w-4 h-4 text-purple-600" />
                  <h2 className="text-sm font-semibold text-gray-700">My Domains</h2>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{ownedDomains.length}</span>
                </div>

                <div className="space-y-2">
                  {/* Desktop Table Header */}
                  <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="col-span-4">Domain</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-3">Webhook</div>
                    <div className="col-span-2">Added</div>
                    <div className="col-span-1"></div>
                  </div>

                  {ownedDomains.map((domainItem) => (
                    <div
                      key={domainItem.id}
                      className="bg-white border border-gray-100 rounded-lg lg:rounded-none lg:border-x-0 lg:border-t-0 hover:bg-gray-50/50 transition"
                    >
                      <div className="p-4 lg:grid lg:grid-cols-12 lg:gap-4 lg:items-center lg:p-3">
                        {/* Domain Info */}
                        <div className="lg:col-span-4 mb-3 lg:mb-0">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 lg:w-8 lg:h-8 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Globe className="w-5 h-5 lg:w-4 lg:h-4 text-purple-600" />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <p className="font-medium text-gray-800 text-sm lg:text-base">{domainItem.domain}</p>
                                <button
                                  onClick={() => copyToClipboard(domainItem.domain, domainItem.id)}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  {copiedId === domainItem.id ? (
                                    <Check className="w-3.5 h-3.5 text-green-500" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                              <div className="flex items-center space-x-2 mt-1 lg:hidden">
                                {getStatusBadge(domainItem.isVerified)}
                                {getWebhookStatusBadge(domainItem.hasWebhookSecret)}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Status - Desktop */}
                        <div className="hidden lg:block lg:col-span-2">
                          {getStatusBadge(domainItem.isVerified)}
                        </div>

                        {/* Webhook Status - Desktop */}
                        <div className="hidden lg:block lg:col-span-3">
                          <div className="flex items-center justify-between">
                            {getWebhookStatusBadge(domainItem.hasWebhookSecret)}
                            {!domainItem.hasWebhookSecret && domainItem.isVerified && (
                              <button
                                onClick={() => openWebhookModal(domainItem.id, false, 'add')}
                                className="text-xs text-purple-600 hover:text-purple-700 flex items-center space-x-1"
                              >
                                <Settings className="w-3 h-3" />
                                <span>Configure</span>
                              </button>
                            )}
                            {domainItem.hasWebhookSecret && (
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => openWebhookModal(domainItem.id, true, 'edit')}
                                  className="text-xs text-gray-500 hover:text-purple-600 flex items-center space-x-1"
                                >
                                  <Edit className="w-3 h-3" />
                                  <span>Update</span>
                                </button>
                                <button
                                  onClick={() => setShowDeleteConfirm(domainItem.id)}
                                  className="text-xs text-gray-500 hover:text-red-600 flex items-center space-x-1"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Remove</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Added Date - Desktop */}
                        <div className="hidden lg:block lg:col-span-2">
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(domainItem.createdAt), { addSuffix: true })}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="lg:col-span-1 flex items-center justify-between lg:justify-end mt-3 lg:mt-0">
                          <div className="flex items-center space-x-3">
                            {!domainItem.hasWebhookSecret && domainItem.isVerified && (
                              <button
                                onClick={() => openWebhookModal(domainItem.id, false, 'add')}
                                className="lg:hidden text-xs text-purple-600 flex items-center space-x-1"
                              >
                                <Webhook className="w-3.5 h-3.5" />
                                <span>Setup Webhook</span>
                              </button>
                            )}
                            {domainItem.hasWebhookSecret && (
                              <div className="lg:hidden flex items-center space-x-2">
                                <button
                                  onClick={() => openWebhookModal(domainItem.id, true, 'edit')}
                                  className="text-xs text-gray-500 flex items-center space-x-1"
                                >
                                  <Edit className="w-3 h-3" />
                                  <span>Update</span>
                                </button>
                                <button
                                  onClick={() => setShowDeleteConfirm(domainItem.id)}
                                  className="text-xs text-gray-500 flex items-center space-x-1"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Remove</span>
                                </button>
                              </div>
                            )}
                            <button
                              onClick={() => window.open(`https://resend.com/domains/${domainItem.domain}`, '_blank')}
                              className="text-gray-400 hover:text-purple-600 transition p-1"
                              title="Open in Resend"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-300 lg:hidden" />
                        </div>
                      </div>

                      {/* Mobile Extended Info */}
                      <div className="lg:hidden px-4 pb-4 pt-0 border-t border-gray-50 mt-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Added:</span>
                          <span className="text-gray-600">
                            {formatDistanceToNow(new Date(domainItem.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        {domainItem.verifiedAt && (
                          <div className="flex items-center justify-between text-xs mt-1">
                            <span className="text-gray-500">Verified:</span>
                            <span className="text-gray-600">
                              {formatDistanceToNow(new Date(domainItem.verifiedAt), { addSuffix: true })}
                            </span>
                          </div>
                        )}
                        {domainItem.webhookConfiguredAt && (
                          <div className="flex items-center justify-between text-xs mt-1">
                            <span className="text-gray-500">Webhook:</span>
                            <span className="text-green-600">
                              {formatDistanceToNow(new Date(domainItem.webhookConfiguredAt), { addSuffix: true })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── TEAM DOMAINS ── */}
            {teamDomains.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="w-4 h-4 text-indigo-500" />
                  <h2 className="text-sm font-semibold text-gray-700">Team Domains</h2>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{teamDomains.length}</span>
                </div>

                <div className="space-y-2">
                  {/* Desktop Table Header */}
                  <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="col-span-4">Domain</div>
                    <div className="col-span-2">Access Level</div>
                    <div className="col-span-3">Owner</div>
                    <div className="col-span-3">Joined</div>
                  </div>

                  {teamDomains.map((teamDomain) => (
                    <div
                      key={teamDomain.id}
                      className="bg-white border border-gray-100 rounded-lg lg:rounded-none lg:border-x-0 lg:border-t-0 hover:bg-gray-50/50 transition"
                    >
                      <div className="p-4 lg:grid lg:grid-cols-12 lg:gap-4 lg:items-center lg:p-3">
                        {/* Domain Info */}
                        <div className="lg:col-span-4 mb-3 lg:mb-0">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 lg:w-8 lg:h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Globe className="w-5 h-5 lg:w-4 lg:h-4 text-indigo-500" />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <p className="font-medium text-gray-800 text-sm lg:text-base">{teamDomain.domain}</p>
                                <button
                                  onClick={() => copyToClipboard(teamDomain.domain, teamDomain.id)}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  {copiedId === teamDomain.id ? (
                                    <Check className="w-3.5 h-3.5 text-green-500" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                              {/* Mobile badges */}
                              <div className="flex items-center space-x-2 mt-1 lg:hidden">
                                {getAccessLevelBadge(teamDomain.accessLevel)}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Access Level - Desktop */}
                        <div className="hidden lg:block lg:col-span-2">
                          {getAccessLevelBadge(teamDomain.accessLevel)}
                        </div>

                        {/* Owner - Desktop */}
                        <div className="hidden lg:flex lg:col-span-3 items-center space-x-2">
                          {teamDomain.owner?.profilePicture ? (
                            <img
                              src={teamDomain.owner.profilePicture}
                              alt={teamDomain.owner.name}
                              className="w-5 h-5 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center">
                              <span className="text-xs text-purple-600 font-medium">
                                {teamDomain.owner?.name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <span className="text-xs text-gray-600">{teamDomain.owner?.name}</span>
                        </div>

                        {/* Joined Date - Desktop */}
                        <div className="hidden lg:block lg:col-span-3">
                          <p className="text-xs text-gray-500">
                            Joined {formatDistanceToNow(new Date(teamDomain.acceptedAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>

                      {/* Mobile Extended Info */}
                      <div className="lg:hidden px-4 pb-4 pt-0 border-t border-gray-50 mt-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Owner:</span>
                          <div className="flex items-center space-x-1">
                            {teamDomain.owner?.profilePicture ? (
                              <img
                                src={teamDomain.owner.profilePicture}
                                alt={teamDomain.owner.name}
                                className="w-4 h-4 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-4 h-4 rounded-full bg-purple-100 flex items-center justify-center">
                                <span className="text-xs text-purple-600 font-medium">
                                  {teamDomain.owner?.name?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <span className="text-gray-600">{teamDomain.owner?.name}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs mt-1">
                          <span className="text-gray-500">Joined:</span>
                          <span className="text-gray-600">
                            {formatDistanceToNow(new Date(teamDomain.acceptedAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>

      {/* Add Domain Modal — unchanged */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-purple-50 rounded-lg">
                    <Plus className="w-4 h-4 text-purple-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800">Add Domain</h2>
                </div>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Domain Name</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      placeholder="example.com"
                      required
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Resend API Key</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="re_xxxxxxxxxxxxxxxx"
                      required
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none text-sm"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Add Domain'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Webhook Modal — unchanged */}
      {showWebhookModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-purple-50 rounded-lg">
                    <Webhook className="w-4 h-4 text-purple-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    {webhookMode === 'edit' ? 'Update Webhook' : 'Configure Webhook'}
                  </h2>
                </div>
                <button
                  onClick={() => { setShowWebhookModal(null); setWebhookSecret(''); setWebhookError(''); setWebhookMode('add'); }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-700 mb-2">Step 1: Copy Webhook URL</p>
                  <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-2">
                    <code className="text-xs text-gray-600 truncate">{`${API_URL}/api/email/webhook/receive`}</code>
                    <button
                      onClick={() => copyWebhookUrl(`${API_URL}/api/email/webhook/receive`)}
                      className="text-gray-400 hover:text-purple-600 ml-2 flex-shrink-0"
                    >
                      {copiedUrl ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-700 mb-2">Step 2: Configure in Resend</p>
                  <button
                    onClick={() => window.open('https://resend.com/webhooks', '_blank')}
                    className="w-full flex items-center justify-between p-2 bg-white border border-gray-200 rounded-lg hover:border-purple-200 transition"
                  >
                    <div className="flex items-center space-x-2">
                      <ExternalLink className="w-4 h-4 text-purple-600" />
                      <span className="text-sm text-gray-700">Go to Resend Webhooks</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                  <p className="text-xs text-gray-500 mt-2">Create a new webhook, paste the URL above, and get your signing secret</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Step 3: Enter Webhook Signing Secret</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      value={webhookSecret}
                      onChange={(e) => setWebhookSecret(e.target.value)}
                      placeholder="whsec_xxxxxxxxxxxxxxxx"
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none text-sm"
                    />
                  </div>
                  {webhookError && <p className="text-xs text-red-500 mt-1">{webhookError}</p>}
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowWebhookModal(null); setWebhookSecret(''); setWebhookError(''); setWebhookMode('add'); }}
                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSaveWebhookSecret(showWebhookModal)}
                    disabled={isAddingWebhook}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
                  >
                    {isAddingWebhook ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : webhookMode === 'edit' ? 'Update Secret' : 'Save Secret'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal — unchanged */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800">Remove Webhook</h2>
                </div>
                <button onClick={() => setShowDeleteConfirm(null)} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Are you sure you want to remove the webhook secret for this domain? You will no longer receive incoming emails.
                </p>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteWebhookSecret(showDeleteConfirm)}
                    disabled={isDeletingWebhook}
                    className="flex-1 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                  >
                    {isDeletingWebhook ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Remove'}
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

export default Domains;