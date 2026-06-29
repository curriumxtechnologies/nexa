import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useGetCustomEmailsQuery, useCreateCustomEmailMutation, useGetAccessibleDomainsQuery } from '../slices/emailApiSlice';
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
  Eye,
  Lock,
  Shield
} from 'lucide-react';
import { format } from 'date-fns';
import CreateCustomEmailModal from '../components/CreateCustomEmailModal';
import EmailDetailsModal from '../components/EmailDetailsModal';

const CustomEmails = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  
  // ── Fetch data ──
  const { data, isLoading, refetch } = useGetCustomEmailsQuery();
  const { data: accessibleDomainsData } = useGetAccessibleDomainsQuery();
  const [createCustomEmail] = useCreateCustomEmailMutation();

  const domains = data?.data?.domains || [];
  const customEmails = data?.data?.emails || [];
  const accessibleDomains = accessibleDomainsData?.data || [];

  // ── Permission checks ──
  const canCreateCustomEmails = () => {
    if (domains.length > 0) return true;
    return accessibleDomains.some(domain => 
      domain.permissions?.canCreateCustomEmails === true
    );
  };

  const canDeleteCustomEmails = (email) => {
    if (email.userId === userInfo?._id) return true;
    return accessibleDomains.some(domain => 
      domain.permissions?.canDeleteCustomEmails === true &&
      domain.domain === email.domain
    );
  };

  const isTeamEmail = (email) => email.userId !== userInfo?._id;

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getPermissionBadge = () => {
    if (domains.length > 0) {
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700"><Shield className="w-3 h-3 mr-1" />Owner</span>;
    }
    const teamDomain = accessibleDomains[0];
    if (teamDomain?.permissions?.canCreateCustomEmails) {
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700"><CheckCircle className="w-3 h-3 mr-1" />Can Create</span>;
    }
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600"><Lock className="w-3 h-3 mr-1" />View Only</span>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-purple-600 animate-spin mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Loading custom emails...</p>
      </div>
    );
  }

  const hasCreatePermission = canCreateCustomEmails();
  const availableDomains = [...domains, ...accessibleDomains.filter(d => d.permissions?.canCreateCustomEmails)];

  // ── Delete handler (placeholder) ──
  const handleDelete = (email) => {
    if (window.confirm(`Delete ${email.email}?`)) {
      // call delete mutation here
      console.log('Delete:', email.email);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16 lg:pb-0">
      {/* ─── Header ─── */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="px-4 py-3 lg:py-4 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-purple-50 rounded-lg hidden sm:block">
                <Mail className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-semibold text-gray-800">Custom Emails</h1>
                <p className="text-xs text-gray-400 hidden sm:block">Manage your custom email addresses</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="hidden sm:block">{getPermissionBadge()}</div>
              {hasCreatePermission && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  disabled={availableDomains.length === 0}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-purple-600 text-white text-xs sm:text-sm rounded-lg hover:bg-purple-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden xs:inline">Create Email</span>
                  <span className="xs:hidden">Create</span>
                </button>
              )}
            </div>
          </div>
          {!hasCreatePermission && customEmails.length > 0 && (
            <div className="mt-2 p-2 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700 flex items-center space-x-1">
                <Lock className="w-3 h-3 flex-shrink-0" />
                <span>You have view‑only access. Contact your team admin to create emails.</span>
              </p>
            </div>
          )}
          {availableDomains.length === 0 && hasCreatePermission && (
            <div className="mt-2 p-2 bg-yellow-50 rounded-lg">
              <p className="text-xs text-yellow-700 flex items-center space-x-1">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                <span>Please add and verify a domain first before creating custom emails.</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ─── Content ─── */}
      <div className="px-3 sm:px-4 py-3 lg:px-8">
        {customEmails.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No custom emails yet</p>
            <p className="text-gray-400 text-sm mt-1">
              {hasCreatePermission 
                ? 'Create your first custom email address'
                : 'You do not have permission to create custom emails'}
            </p>
            {hasCreatePermission && availableDomains.length > 0 && (
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
            <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider bg-white rounded-lg border border-gray-100">
              <div className="col-span-4">Email Address</div>
              <div className="col-span-3">Forward To</div>
              <div className="col-span-3">Created</div>
              <div className="col-span-2"></div>
            </div>

            {/* Email Cards */}
            {customEmails.map((email) => (
              <div
                key={email._id}
                className={`bg-white border border-gray-100 rounded-lg lg:rounded-none lg:border-x-0 lg:border-t-0 hover:bg-gray-50/50 transition ${isTeamEmail(email) ? 'border-l-4 border-l-indigo-400' : ''}`}
              >
                <div className="p-3 sm:p-4 lg:grid lg:grid-cols-12 lg:gap-4 lg:items-center lg:p-3">
                  {/* Main Info */}
                  <div className="lg:col-span-4 mb-2 lg:mb-0">
                    <div className="flex items-center space-x-3">
                      {email.profilePicture?.url ? (
                        <img
                          src={email.profilePicture.url}
                          alt={email.displayName}
                          className="w-10 h-10 lg:w-8 lg:h-8 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 lg:w-8 lg:h-8 bg-purple-50 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 lg:w-4 lg:h-4 text-purple-600" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center flex-wrap gap-1">
                          <p className="font-medium text-gray-800 text-sm sm:text-base truncate">
                            {email.displayName || email.username}
                          </p>
                          {email.isDefault && (
                            <span className="px-1.5 py-0.5 text-[10px] bg-green-100 text-green-700 rounded-full whitespace-nowrap">
                              Default
                            </span>
                          )}
                          {isTeamEmail(email) && (
                            <span className="px-1.5 py-0.5 text-[10px] bg-indigo-100 text-indigo-700 rounded-full whitespace-nowrap">
                              Team
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-1 mt-0.5">
                          <p className="text-xs text-gray-500 truncate">{email.email}</p>
                          <button
                            onClick={() => copyToClipboard(email.email, email._id)}
                            className="text-gray-400 hover:text-gray-600 flex-shrink-0"
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
                  <div className="lg:col-span-2 flex items-center justify-between lg:justify-end mt-2 lg:mt-0">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setShowDetailsModal(email)}
                        className="text-gray-400 hover:text-purple-600 transition p-1.5 lg:p-1"
                        aria-label="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {canDeleteCustomEmails(email) && (
                        <button
                          onClick={() => handleDelete(email)}
                          className="text-gray-400 hover:text-red-600 transition p-1.5 lg:p-1"
                          aria-label="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 lg:hidden" />
                  </div>
                </div>

                {/* Mobile Extended Info */}
                <div className="lg:hidden px-4 pb-4 pt-0 border-t border-gray-50 mt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Forward:</span>
                    <span className="text-gray-600 truncate ml-2">{email.forwardToEmail}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="text-gray-500">Created:</span>
                    <span className="text-gray-600">
                      {format(new Date(email.createdAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                  {isTeamEmail(email) && (
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span className="text-gray-500">Type:</span>
                      <span className="text-indigo-600 text-xs">Team Access</span>
                    </div>
                  )}
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

      {/* ─── Modals ─── */}
      {showCreateModal && hasCreatePermission && (
        <CreateCustomEmailModal
          availableDomains={availableDomains}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            refetch();
            setShowCreateModal(false);
          }}
        />
      )}

      {showDetailsModal && (
        <EmailDetailsModal
          email={showDetailsModal}
          isTeamEmail={isTeamEmail(showDetailsModal)}
          onClose={() => setShowDetailsModal(null)}
          onCopy={copyToClipboard}
          copiedId={copiedId}
        />
      )}
    </div>
  );
};

export default CustomEmails;