import React, { useState, useMemo } from 'react';
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
  Clock,
  Globe,
  ChevronRight,
  Search,
  Filter
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
  const [searchTerm, setSearchTerm] = useState('');
  const [emailExists, setEmailExists] = useState(null);
  const [checkingEmail, setCheckingEmail] = useState(false);

  const { data: domainsData, isLoading: domainsLoading } = useGetResendConfigsQuery();
  const { data: accessData, isLoading: accessLoading, refetch } = useGetDomainAccessUsersQuery(selectedDomainId, {
    skip: !selectedDomainId,
  });
  const [inviteUser] = useInviteUserToDomainMutation();
  const [updateUserAccess] = useUpdateUserAccessMutation();
  const [revokeUserAccess] = useRevokeUserAccessMutation();

  const domains = domainsData?.data || [];
  const accessUsers = accessData?.data || [];

  // Check if email exists in the system (simple debounced check)
  const checkEmailExists = useMemo(() => {
    let timeoutId;
    return async (email) => {
      if (!email || email.length < 3) {
        setEmailExists(null);
        return;
      }
      
      clearTimeout(timeoutId);
      setCheckingEmail(true);
      
      timeoutId = setTimeout(async () => {
        try {
          // Try to fetch user by email (you'll need an endpoint for this)
          // For now, we'll simulate by checking if the user can be found
          // You can add a GET endpoint like /api/users/check-email?email=xxx
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/check-email?email=${encodeURIComponent(email)}`);
          const data = await response.json();
          setEmailExists(data.exists);
        } catch (err) {
          setEmailExists(null);
        } finally {
          setCheckingEmail(false);
        }
      }, 500);
    };
  }, []);

  const handleEmailChange = (e) => {
    const email = e.target.value;
    setInviteEmail(email);
    checkEmailExists(email);
  };

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
      setEmailExists(null);
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
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">Admin</span>;
      case 'manage':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Manage</span>;
      case 'send':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Send</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">View</span>;
    }
  };

  const getAccessLevelColor = (level) => {
    switch (level) {
      case 'admin': return 'text-purple-600';
      case 'manage': return 'text-blue-600';
      case 'send': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  // Filter team members
  const filteredMembers = accessUsers.filter(member =>
    member.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (domainsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-purple-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">Loading domains...</p>
        </div>
      </div>
    );
  }

  if (domains.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="px-4 py-6 lg:px-8">
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No domains found</p>
            <p className="text-gray-400 text-sm mt-1">Please add a domain first before managing team access</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="px-4 py-4 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-purple-50 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-800">Team Access</h1>
                <p className="text-xs text-gray-400 hidden lg:block">Manage who has access to your domain emails</p>
              </div>
            </div>
            {selectedDomainId && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                <span>Invite</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 lg:px-8">
        {/* Domain Selector */}
        <div className="mb-6">
          <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Select Domain</label>
          <div className="flex flex-wrap gap-2">
            {domains.map((domain) => (
              <button
                key={domain.id}
                onClick={() => setSelectedDomainId(domain.id)}
                className={`px-3 py-1.5 rounded-lg text-sm transition ${
                  selectedDomainId === domain.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-purple-300'
                }`}
              >
                {domain.domain}
              </button>
            ))}
          </div>
        </div>

        {/* Team Members Section */}
        {selectedDomainId && (
          <>
            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search team members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {accessLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-100 text-center py-12">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No team members yet</p>
                <p className="text-gray-400 text-xs mt-1">Invite team members to collaborate</p>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Desktop Table Header */}
                <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider bg-transparent">
                  <div className="col-span-5">Team Member</div>
                  <div className="col-span-3">Access Level</div>
                  <div className="col-span-3">Added</div>
                  <div className="col-span-1"></div>
                </div>

                {/* Member List */}
                {filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className="bg-white border border-gray-100 rounded-lg lg:rounded-none lg:border-x-0 lg:border-t-0 hover:bg-gray-50/50 transition"
                  >
                    <div className="p-4 lg:grid lg:grid-cols-12 lg:gap-4 lg:items-center lg:p-3">
                      {/* Member Info */}
                      <div className="lg:col-span-5 mb-3 lg:mb-0">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 lg:w-8 lg:h-8 bg-purple-50 rounded-full flex items-center justify-center flex-shrink-0">
                            <Mail className="w-5 h-5 lg:w-4 lg:h-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 text-sm lg:text-base">
                              {member.user?.name || member.user?.email?.split('@')[0]}
                            </p>
                            <p className="text-xs text-gray-400">{member.user?.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* Access Level - Desktop */}
                      <div className="hidden lg:block lg:col-span-3">
                        {editingAccess === member.id ? (
                          <select
                            value={member.accessLevel}
                            onChange={(e) => handleUpdateAccess(member.id, e.target.value)}
                            className="px-2 py-1 border border-gray-200 rounded text-sm"
                          >
                            <option value="view">View Only</option>
                            <option value="send">Send</option>
                            <option value="manage">Manage</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : (
                          <div className="flex items-center space-x-2">
                            {getAccessLevelBadge(member.accessLevel)}
                            <button
                              onClick={() => setEditingAccess(member.id)}
                              className="text-gray-400 hover:text-purple-600"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Added Date - Desktop */}
                      <div className="hidden lg:block lg:col-span-3">
                        <p className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(member.acceptedAt || member.createdAt), { addSuffix: true })}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="lg:col-span-1 flex items-center justify-between lg:justify-end mt-3 lg:mt-0">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleRevokeAccess(member.id)}
                            className="text-gray-400 hover:text-red-600 transition p-1"
                            title="Revoke Access"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 lg:hidden" />
                      </div>
                    </div>

                    {/* Mobile Extended Info */}
                    <div className="lg:hidden px-4 pb-4 pt-0 border-t border-gray-50 mt-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Access Level:</span>
                        <div className="flex items-center gap-2">
                          {getAccessLevelBadge(member.accessLevel)}
                          <button
                            onClick={() => setEditingAccess(member.id)}
                            className="text-gray-400 hover:text-purple-600"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      {editingAccess === member.id && (
                        <div className="mt-2">
                          <select
                            value={member.accessLevel}
                            onChange={(e) => handleUpdateAccess(member.id, e.target.value)}
                            className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
                          >
                            <option value="view">View Only</option>
                            <option value="send">Send</option>
                            <option value="manage">Manage</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-xs mt-2">
                        <span className="text-gray-500">Added:</span>
                        <span className="text-gray-600">
                          {formatDistanceToNow(new Date(member.acceptedAt || member.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Invite User Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-purple-50 rounded-lg">
                    <UserPlus className="w-4 h-4 text-purple-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800">Invite Team Member</h2>
                </div>
                <button
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteEmail('');
                    setEmailExists(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleInvite} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={handleEmailChange}
                      placeholder="colleague@example.com"
                      required
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none text-sm"
                    />
                  </div>
                  {checkingEmail && (
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Checking...
                    </p>
                  )}
                  {emailExists === true && !checkingEmail && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      User has a Nexa account
                    </p>
                  )}
                  {emailExists === false && !checkingEmail && inviteEmail.length > 3 && (
                    <p className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      User doesn't have a Nexa account yet. They will need to register first.
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
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
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none text-sm"
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
                    onClick={() => {
                      setShowInviteModal(false);
                      setInviteEmail('');
                      setEmailExists(null);
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