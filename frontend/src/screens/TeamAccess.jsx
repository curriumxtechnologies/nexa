import React, { useState } from 'react';
import { useGetResendConfigsQuery, useInviteUserToDomainMutation, useGetDomainAccessUsersQuery, useUpdateUserAccessMutation, useRevokeUserAccessMutation } from '../slices/emailApiSlice';
import { 
  Users, 
  Plus, 
  Mail, 
  Shield, 
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserPlus,
  Settings,
  Eye,
  Send,
  Edit,
  Crown,
  UserCheck,
  UserX,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const TeamAccess = () => {
  const [selectedDomainId, setSelectedDomainId] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [accessLevel, setAccessLevel] = useState('view');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingAccess, setEditingAccess] = useState(null);

  const { data: domainsData, isLoading: domainsLoading } = useGetResendConfigsQuery();
  const { data: accessData, isLoading: accessLoading, refetch } = useGetDomainAccessUsersQuery(selectedDomainId, {
    skip: !selectedDomainId,
  });
  const [inviteUser] = useInviteUserToDomainMutation();
  const [updateUserAccess] = useUpdateUserAccessMutation();
  const [revokeUserAccess] = useRevokeUserAccessMutation();

  const domains = domainsData?.data || [];
  const accessUsers = accessData?.data || [];

  const handleInvite = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      await inviteUser({
        email: inviteEmail,
        resendConfigId: selectedDomainId,
        accessLevel,
      }).unwrap();
      setSuccess(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
      setAccessLevel('view');
      setShowInviteModal(false);
      refetch();
    } catch (err) {
      setError(err.data?.message || 'Failed to send invitation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateAccess = async (accessId, newLevel) => {
    try {
      await updateUserAccess({ accessId, data: { accessLevel: newLevel } }).unwrap();
      refetch();
      setEditingAccess(null);
    } catch (err) {
      console.error('Failed to update access:', err);
    }
  };

  const handleRevokeAccess = async (accessId) => {
    if (window.confirm('Are you sure you want to revoke access for this user?')) {
      try {
        await revokeUserAccess(accessId).unwrap();
        refetch();
      } catch (err) {
        console.error('Failed to revoke access:', err);
      }
    }
  };

  const getAccessLevelBadge = (level) => {
    switch (level) {
      case 'admin':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <Crown className="w-3 h-3 mr-1" />
            Admin
          </span>
        );
      case 'manage':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Settings className="w-3 h-3 mr-1" />
            Manage
          </span>
        );
      case 'send':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Send className="w-3 h-3 mr-1" />
            Send
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <Eye className="w-3 h-3 mr-1" />
            View
          </span>
        );
    }
  };

  const getAccessLevelDescription = (level) => {
    switch (level) {
      case 'admin':
        return 'Full access: View, send, create emails, manage team';
      case 'manage':
        return 'Manage: View, send, and create custom emails';
      case 'send':
        return 'Send: View and send emails';
      default:
        return 'View only: Can only view emails';
    }
  };

  if (domainsLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading domains...</p>
        </div>
      </div>
    );
  }

  if (domains.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="px-4 py-6 lg:px-6">
          <div className="text-center py-16">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No domains found</p>
            <p className="text-gray-400 text-sm mt-1">
              Please add a domain first before managing team access
            </p>
          </div>
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
              <Users className="w-6 h-6 text-purple-600" />
              <h1 className="text-xl font-semibold text-gray-800">Team Access</h1>
            </div>
            {selectedDomainId && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                <UserPlus className="w-4 h-4" />
                <span>Invite User</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 lg:px-6">
        {/* Domain Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Domain
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {domains.map((domain) => (
              <button
                key={domain.id}
                onClick={() => setSelectedDomainId(domain.id)}
                className={`p-3 rounded-lg border text-left transition ${
                  selectedDomainId === domain.id
                    ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                    : 'border-gray-200 bg-white hover:border-purple-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-purple-600" />
                    <span className="font-medium text-gray-800">{domain.domain}</span>
                  </div>
                  {domain.isVerified ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Team Members List */}
        {selectedDomainId && (
          <>
            {accessLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <h2 className="text-sm font-medium text-gray-700">Team Members</h2>
                </div>

                {accessUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No team members yet</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Invite team members to collaborate on this domain
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {accessUsers.map((access) => (
                      <div key={access.id} className="p-4 hover:bg-gray-50 transition">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <Mail className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center flex-wrap gap-2">
                                <p className="font-medium text-gray-800">
                                  {access.user?.name || access.user?.email}
                                </p>
                                {getAccessLevelBadge(access.accessLevel)}
                              </div>
                              <p className="text-sm text-gray-500 mt-1">
                                {access.user?.email}
                              </p>
                              <p className="text-xs text-gray-400 mt-2">
                                Invited {formatDistanceToNow(new Date(access.acceptedAt || access.createdAt), { addSuffix: true })}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {getAccessLevelDescription(access.accessLevel)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            {/* Edit Access Level */}
                            {editingAccess === access.id ? (
                              <div className="flex items-center space-x-2">
                                <select
                                  value={access.accessLevel}
                                  onChange={(e) => handleUpdateAccess(access.id, e.target.value)}
                                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                                >
                                  <option value="view">View Only</option>
                                  <option value="send">Send</option>
                                  <option value="manage">Manage</option>
                                  <option value="admin">Admin</option>
                                </select>
                                <button
                                  onClick={() => setEditingAccess(null)}
                                  className="p-1 text-gray-400 hover:text-gray-600"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setEditingAccess(access.id)}
                                className="p-1 text-gray-400 hover:text-purple-600 rounded"
                                title="Edit Access"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleRevokeAccess(access.id)}
                              className="p-1 text-gray-400 hover:text-red-600 rounded"
                              title="Revoke Access"
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
            )}
          </>
        )}
      </div>

      {/* Invite User Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <UserPlus className="w-5 h-5 text-purple-600" />
                  <h2 className="text-xl font-semibold text-gray-800">Invite Team Member</h2>
                </div>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleInvite} className="space-y-4">
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="colleague@example.com"
                      required
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    User must have a Nexa account to accept the invitation
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Access Level
                  </label>
                  <select
                    value={accessLevel}
                    onChange={(e) => setAccessLevel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
                  >
                    <option value="view">View Only - Can only view emails</option>
                    <option value="send">Send - Can view and send emails</option>
                    <option value="manage">Manage - Can view, send, and create emails</option>
                    <option value="admin">Admin - Full access including team management</option>
                  </select>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700">
                    <strong>Access Level Details:</strong>
                    <br />
                    • <strong>View Only:</strong> Can view all emails in this domain
                    <br />
                    • <strong>Send:</strong> Can view and send emails from this domain
                    <br />
                    • <strong>Manage:</strong> Can view, send, and create custom email addresses
                    <br />
                    • <strong>Admin:</strong> Full access including inviting/removing team members
                  </p>
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
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
                        Sending...
                      </span>
                    ) : (
                      'Send Invitation'
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

export default TeamAccess;