import React, { useState, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  useGetResendConfigsQuery,
  useInviteUserToDomainMutation,
  useGetDomainAccessUsersQuery,
  useUpdateUserAccessMutation,
  useRevokeUserAccessMutation,
  useGetAccessibleDomainsQuery,
} from "../slices/emailApiSlice";
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
  Filter,
  RefreshCw,
  Lock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "react-hot-toast";

const TeamAccess = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [selectedDomainId, setSelectedDomainId] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [accessLevel, setAccessLevel] = useState("view");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [editingAccess, setEditingAccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [emailExists, setEmailExists] = useState(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: domainsData,
    isLoading: domainsLoading,
    refetch: refetchDomains,
  } = useGetResendConfigsQuery();
  const { data: accessibleDomainsData } = useGetAccessibleDomainsQuery();
  const {
    data: accessData,
    isLoading: accessLoading,
    refetch: refetchAccess,
    error: accessError,
  } = useGetDomainAccessUsersQuery(selectedDomainId, {
    skip: !selectedDomainId,
  });
  const [inviteUser] = useInviteUserToDomainMutation();
  const [updateUserAccess] = useUpdateUserAccessMutation();
  const [revokeUserAccess] = useRevokeUserAccessMutation();

  const ownedDomains = domainsData?.data || [];
  const teamDomains = accessibleDomainsData?.data || [];

  // Check if user has manage permission for a domain
  const canManageDomain = (domainId) => {
    // User owns the domain
    if (ownedDomains.some((d) => d.id === domainId)) return true;

    // User has team access with canManageAccess permission
    const teamDomain = teamDomains.find(
      (d) => d.resendConfigId === domainId || d.id === domainId
    );
    return teamDomain?.permissions?.canManageAccess === true;
  };

  // Get domain info (owned or team)
  const getDomainInfo = (domainId) => {
    const owned = ownedDomains.find((d) => d.id === domainId);
    if (owned) return { ...owned, type: "owned" };

    const team = teamDomains.find((d) => d.resendConfigId === domainId);
    if (team)
      return {
        ...team,
        type: "team",
        domain: team.domain,
        id: team.resendConfigId,
      };

    return null;
  };

  // Fix: for team domains, prefer resendConfigId over _id so the correct
  // UUID is sent to GET /team/access/:resendConfigId
  const domains = [
    ...ownedDomains.map((d) => ({
      id: d.id,
      domain: d.domain,
      canManage: true,
      type: "owned",
    })),
    ...teamDomains.map((d) => ({
      id: d.resendConfigId, // always use the UUID, not the TeamAccess _id
      domain: d.domain,
      canManage: d.permissions?.canManageAccess === true,
      type: "team",
    })),
  ];

  const accessUsers = accessData?.data?.users || [];
  const domainInfo = accessData?.data?.domain || "";

  // Check if email exists in the system
  const checkEmailExists = useCallback(async (email) => {
    if (!email || email.length < 3) {
      setEmailExists(null);
      return;
    }

    setCheckingEmail(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/check-email?email=${encodeURIComponent(email)}`,
      );
      const data = await response.json();
      setEmailExists(data.exists);
    } catch (err) {
      setEmailExists(null);
    } finally {
      setCheckingEmail(false);
    }
  }, []);

  const handleEmailChange = (e) => {
    const email = e.target.value;
    setInviteEmail(email);

    const timeoutId = setTimeout(() => {
      if (email && email.includes("@")) {
        checkEmailExists(email);
      } else {
        setEmailExists(null);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const handleInvite = async (e) => {
    e.preventDefault();

    if (!inviteEmail) {
      toast.error("Please enter an email address");
      return;
    }

    if (!canManageDomain(selectedDomainId)) {
      toast.error("You do not have permission to invite users to this domain");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await inviteUser({
        email: inviteEmail,
        resendConfigId: selectedDomainId,
        accessLevel,
      }).unwrap();

      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail("");
      setAccessLevel("view");
      setEmailExists(null);
      setShowInviteModal(false);
      refetchAccess();
    } catch (err) {
      const errorMessage = err.data?.message || "Failed to send invitation";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateAccess = async (accessId, newLevel) => {
    if (!canManageDomain(selectedDomainId)) {
      toast.error("You do not have permission to update access levels");
      return;
    }

    try {
      await updateUserAccess({
        accessId,
        data: { accessLevel: newLevel },
      }).unwrap();
      toast.success("Access level updated successfully");
      refetchAccess();
      setEditingAccess(null);
    } catch (err) {
      toast.error(err.data?.message || "Failed to update access");
    }
  };

  const handleRevokeAccess = async (accessId, userName) => {
    if (!canManageDomain(selectedDomainId)) {
      toast.error("You do not have permission to revoke access");
      return;
    }

    if (
      window.confirm(`Are you sure you want to revoke access for ${userName}?`)
    ) {
      try {
        await revokeUserAccess(accessId).unwrap();
        toast.success("Access revoked successfully");
        refetchAccess();
      } catch (err) {
        toast.error(err.data?.message || "Failed to revoke access");
      }
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchAccess();
    setRefreshing(false);
  };

  const getAccessLevelBadge = (level) => {
    switch (level) {
      case "admin":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
            <Crown className="w-3 h-3 mr-1" />
            Admin
          </span>
        );
      case "manage":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            <Settings className="w-3 h-3 mr-1" />
            Manage
          </span>
        );
      case "send":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <Send className="w-3 h-3 mr-1" />
            Send
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            <Eye className="w-3 h-3 mr-1" />
            View
          </span>
        );
    }
  };

  const filteredMembers = accessUsers.filter(
    (member) =>
      member?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member?.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Loading state
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

  // No domains state
  if (domains.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="px-4 py-6 lg:px-8">
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No domains found</p>
            <p className="text-gray-400 text-sm mt-1">
              You don't have access to any domains yet
            </p>
            {ownedDomains.length === 0 && (
              <button
                onClick={() => (window.location.href = "/domains")}
                className="mt-4 px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition"
              >
                Add Domain
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const selectedDomain = getDomainInfo(selectedDomainId);
  const hasManagePermission = canManageDomain(selectedDomainId);

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
                <h1 className="text-lg font-semibold text-gray-800">
                  Team Access
                </h1>
                <p className="text-xs text-gray-400 hidden lg:block">
                  Manage who has access to your domain emails
                </p>
              </div>
            </div>
            {selectedDomainId && hasManagePermission && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="p-2 text-gray-400 hover:text-purple-600 transition rounded-lg"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                  />
                </button>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition shadow-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Invite</span>
                </button>
              </div>
            )}
          </div>
          {selectedDomainId && !hasManagePermission && (
            <div className="mt-2 p-2 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700 flex items-center space-x-1">
                <Lock className="w-3 h-3" />
                <span>
                  You have view-only access to team members for this domain.
                  Contact the domain owner to manage access.
                </span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 lg:px-8">
        {/* Domain Selector */}
        <div className="mb-6">
          <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">
            Select Domain
          </label>
          <div className="flex flex-wrap gap-2">
            {domains.map((domain) => (
              <button
                key={domain.id}
                onClick={() => {
                  setSelectedDomainId(domain.id);
                  setSearchTerm("");
                }}
                className={`px-3 py-1.5 rounded-lg text-sm transition flex items-center space-x-1 ${
                  selectedDomainId === domain.id
                    ? "bg-purple-600 text-white shadow-sm"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-purple-300"
                }`}
              >
                <span>{domain.domain}</span>
                {domain.type === "team" && (
                  <span
                    className={`text-xs ${selectedDomainId === domain.id ? "text-purple-200" : "text-gray-400"}`}
                  >
                    (team)
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Team Members Section */}
        {selectedDomainId && (
          <>
            {/* Search and Stats */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search team members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
                />
              </div>
              <div className="text-sm text-gray-500">
                {accessUsers.length}{" "}
                {accessUsers.length === 1 ? "member" : "members"} total
              </div>
            </div>

            {accessLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
              </div>
            ) : accessError ? (
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-600 text-sm">
                  Failed to load team members
                </p>
                <button
                  onClick={handleRefresh}
                  className="mt-2 text-sm text-purple-600 hover:text-purple-700"
                >
                  Try again
                </button>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-100 text-center py-12">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No team members found</p>
                <p className="text-gray-400 text-xs mt-1">
                  {searchTerm
                    ? "Try a different search term"
                    : "Invite team members to collaborate"}
                </p>
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
                          <div className="w-10 h-10 lg:w-8 lg:h-8 bg-gradient-to-br from-purple-100 to-purple-50 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-purple-600 font-medium text-sm">
                              {member.user?.name?.[0]?.toUpperCase() ||
                                member.user?.email?.[0]?.toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 text-sm lg:text-base">
                              {member.user?.name ||
                                member.user?.email?.split("@")[0]}
                            </p>
                            <p className="text-xs text-gray-400">
                              {member.user?.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Access Level - Desktop */}
                      <div className="hidden lg:block lg:col-span-3">
                        {editingAccess === member.id && hasManagePermission ? (
                          <select
                            value={member.accessLevel}
                            onChange={(e) =>
                              handleUpdateAccess(member.id, e.target.value)
                            }
                            className="px-2 py-1 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-400"
                            autoFocus
                          >
                            <option value="view">View Only</option>
                            <option value="send">Send</option>
                            <option value="manage">Manage</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : (
                          <div className="flex items-center space-x-2">
                            {getAccessLevelBadge(member.accessLevel)}
                            {hasManagePermission && (
                              <button
                                onClick={() => setEditingAccess(member.id)}
                                className="text-gray-400 hover:text-purple-600 transition"
                                title="Edit access level"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Added Date - Desktop */}
                      <div className="hidden lg:block lg:col-span-3">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(
                              new Date(member.acceptedAt || member.invitedAt),
                              { addSuffix: true },
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="lg:col-span-1 flex items-center justify-between lg:justify-end mt-3 lg:mt-0">
                        {hasManagePermission && (
                          <button
                            onClick={() =>
                              handleRevokeAccess(
                                member.id,
                                member.user?.name || member.user?.email,
                              )
                            }
                            className="text-gray-400 hover:text-red-600 transition p-1"
                            title="Revoke Access"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        <ChevronRight className="w-4 h-4 text-gray-300 lg:hidden" />
                      </div>
                    </div>

                    {/* Mobile Extended Info */}
                    <div className="lg:hidden px-4 pb-4 pt-0 border-t border-gray-50">
                      <div className="flex items-center justify-between text-xs py-2">
                        <span className="text-gray-500">Access Level:</span>
                        <div className="flex items-center gap-2">
                          {getAccessLevelBadge(member.accessLevel)}
                          {hasManagePermission && (
                            <button
                              onClick={() => setEditingAccess(member.id)}
                              className="text-gray-400 hover:text-purple-600"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                      {editingAccess === member.id && hasManagePermission && (
                        <div className="mt-2 pb-2">
                          <select
                            value={member.accessLevel}
                            onChange={(e) =>
                              handleUpdateAccess(member.id, e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                          >
                            <option value="view">View Only</option>
                            <option value="send">Send</option>
                            <option value="manage">Manage</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-xs py-2">
                        <span className="text-gray-500">Added:</span>
                        <span className="text-gray-600 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(
                            new Date(member.acceptedAt || member.invitedAt),
                            { addSuffix: true },
                          )}
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
      {showInviteModal && hasManagePermission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-purple-50 rounded-lg">
                    <UserPlus className="w-4 h-4 text-purple-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    Invite Team Member
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteEmail("");
                    setEmailExists(null);
                    setError("");
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleInvite} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 rounded-lg flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
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
                  {emailExists === true && !checkingEmail && inviteEmail && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />✓ User has a Nexa
                      account - ready to invite
                    </p>
                  )}
                  {emailExists === false && !checkingEmail && inviteEmail && (
                    <p className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      ⚠️ User doesn't have a Nexa account yet. They will need to
                      register first.
                    </p>
                  )}
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
                    <option value="view">
                      👁️ View Only - Can only view emails
                    </option>
                    <option value="send">
                      📧 Send - Can view and send emails
                    </option>
                    <option value="manage">
                      ⚙️ Manage - Can view, send, and create emails
                    </option>
                    <option value="admin">
                      👑 Admin - Full access including team management
                    </option>
                  </select>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700 font-medium mb-1">
                    Access Level Details:
                  </p>
                  <ul className="text-xs text-blue-600 space-y-0.5">
                    <li>
                      • <strong>View Only:</strong> Can view all emails in this
                      domain
                    </li>
                    <li>
                      • <strong>Send:</strong> Can view and send emails from
                      this domain
                    </li>
                    <li>
                      • <strong>Manage:</strong> Can view, send, and create
                      custom email addresses
                    </li>
                    <li>
                      • <strong>Admin:</strong> Full access including
                      inviting/removing team members
                    </li>
                  </ul>
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowInviteModal(false);
                      setInviteEmail("");
                      setEmailExists(null);
                      setError("");
                    }}
                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                    ) : (
                      "Send Invitation"
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