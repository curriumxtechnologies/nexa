import React, { useState } from 'react';
import { useGetUsersQuery, useAssignRoleMutation } from '../slices/adminApiSlice';
import { 
  Crown, 
  Shield, 
  User, 
  Search, 
  Filter, 
  RefreshCw, 
  Loader2, 
  AlertCircle,
  CheckCircle,
  Mail,
  Calendar,
  Edit2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Users,
  Star,
  PlusCircle
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'react-hot-toast';

const SAdminRoleManager = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showRoleModal, setShowRoleModal] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(null);
  const limit = 20;

  const { data, isLoading, error, refetch } = useGetUsersQuery({
    page,
    limit,
    search,
    role: roleFilter
  });
  const [assignRole, { isLoading: isAssigning }] = useAssignRoleMutation();

  const users = data?.data?.users || [];
  const total = data?.data?.total || 0;
  const totalPages = data?.data?.totalPages || 0;

  const handleAssignRole = async (userId) => {
    if (!selectedRole) {
      toast.error('Please select a role');
      return;
    }
    
    try {
      await assignRole({ userId, role: selectedRole }).unwrap();
      toast.success(`Role changed to ${selectedRole.replace('_', ' ')} successfully`);
      setShowRoleModal(null);
      setSelectedRole('');
      refetch();
    } catch (err) {
      toast.error(err.data?.message || 'Failed to assign role');
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'super_admin':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
            <Crown className="w-3 h-3 mr-1" />
            Super Admin
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
            <Shield className="w-3 h-3 mr-1" />
            Admin
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            <User className="w-3 h-3 mr-1" />
            User
          </span>
        );
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'super_admin':
        return <Crown className="w-4 h-4 text-amber-500" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-purple-500" />;
      default:
        return <User className="w-4 h-4 text-gray-400" />;
    }
  };

  const getInitials = (name, email) => {
    if (name) return name.slice(0, 2).toUpperCase();
    return email?.slice(0, 2).toUpperCase() || 'U';
  };

  const getAvatarColor = (email) => {
    const colors = [
      'bg-rose-500', 'bg-orange-500', 'bg-amber-500', 'bg-green-500',
      'bg-teal-500', 'bg-cyan-500', 'bg-blue-500', 'bg-indigo-500',
      'bg-purple-500', 'bg-pink-500',
    ];
    let hash = 0;
    for (let i = 0; i < (email?.length || 0); i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleRoleFilter = (e) => {
    setRoleFilter(e.target.value);
    setPage(1);
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Refreshed');
  };

  // Get role counts
  const roleCounts = users.reduce((acc, user) => {
    const role = user.role || 'user';
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {});

  if (isLoading && page === 1) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-purple-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center px-6">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-gray-700 font-medium mb-1">Failed to load users</p>
          <p className="text-gray-400 text-sm mb-4">{error.data?.message || 'Something went wrong'}</p>
          <button onClick={handleRefresh} className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg">
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-amber-50 rounded-lg">
                <Crown className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-800">Role Manager</h1>
                <p className="text-xs text-gray-400 hidden lg:block">Manage user roles and permissions</p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              className="p-2 text-gray-400 hover:text-purple-600 transition rounded-lg"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 lg:px-8 space-y-6">
        {/* Role Summary Cards */}
        <div className="grid grid-cols-3 gap-3 lg:gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-3 lg:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Total Users</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-800">{total}</p>
              </div>
              <div className="p-2 lg:p-3 bg-gray-100 rounded-lg">
                <Users className="w-4 h-4 lg:w-5 lg:h-5 text-gray-500" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-3 lg:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Admins</p>
                <p className="text-xl lg:text-2xl font-bold text-purple-600">{roleCounts.admin || 0}</p>
              </div>
              <div className="p-2 lg:p-3 bg-purple-50 rounded-lg">
                <Shield className="w-4 h-4 lg:w-5 lg:h-5 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-3 lg:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Super Admins</p>
                <p className="text-xl lg:text-2xl font-bold text-amber-600">{roleCounts.super_admin || 0}</p>
              </div>
              <div className="p-2 lg:p-3 bg-amber-50 rounded-lg">
                <Crown className="w-4 h-4 lg:w-5 lg:h-5 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={handleSearch}
              className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
            />
          </div>
          <div className="relative w-full lg:w-48">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={roleFilter}
              onChange={handleRoleFilter}
              className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none appearance-none"
            >
              <option value="">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
        </div>

        {/* Role Description */}
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-xs text-blue-700">
            <strong>Role Permissions:</strong> Users have basic access. Admins can manage users, view analytics, and upload app versions. 
            Super Admins have full system access including role management and admin privileges.
          </p>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Current Role</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Member Since</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50/50 transition">
                  <td className="px-6 py-3">
                    <div className="flex items-center space-x-3">
                      {user.profilePicture?.url ? (
                        <img
                          src={user.profilePicture.url}
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium ${getAvatarColor(user.email)}`}>
                          {getInitials(user.name, user.email)}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-800">{user.name || 'No name'}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs text-gray-600">
                        {format(new Date(user.createdAt), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => setShowRoleModal(user)}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition text-sm"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Change Role</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-3">
          {users.map((user) => (
            <div key={user._id} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  {user.profilePicture?.url ? (
                    <img
                      src={user.profilePicture.url}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium ${getAvatarColor(user.email)}`}>
                      {getInitials(user.name, user.email)}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{user.name || 'No name'}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMobileMenu(showMobileMenu === user._id ? null : user._id)}
                  className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile Actions Dropdown */}
              {showMobileMenu === user._id && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setShowRoleModal(user);
                      setShowMobileMenu(null);
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg text-sm"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Change Role</span>
                  </button>
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getRoleIcon(user.role)}
                  <span className="text-xs text-gray-500">Current Role:</span>
                </div>
                {getRoleBadge(user.role)}
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-500">Joined:</span>
                </div>
                <span className="text-xs text-gray-600">
                  {format(new Date(user.createdAt), 'MMM d, yyyy')}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {users.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No users found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filter</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
            </div>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 rounded-lg transition"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Change Role Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-purple-50 rounded-lg">
                    <Crown className="w-4 h-4 text-purple-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800">Change User Role</h2>
                </div>
                <button
                  onClick={() => {
                    setShowRoleModal(null);
                    setSelectedRole('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  {showRoleModal.profilePicture?.url ? (
                    <img
                      src={showRoleModal.profilePicture.url}
                      alt={showRoleModal.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium ${getAvatarColor(showRoleModal.email)}`}>
                      {getInitials(showRoleModal.name, showRoleModal.email)}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{showRoleModal.name || 'No name'}</p>
                    <p className="text-xs text-gray-400">{showRoleModal.email}</p>
                    <div className="mt-1">
                      {getRoleBadge(showRoleModal.role)}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select New Role
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none text-sm"
                  >
                    <option value="">Select a role</option>
                    <option value="user">👤 User - Basic access</option>
                    <option value="admin">🛡️ Admin - Manage users, analytics, app versions</option>
                    <option value="super_admin">👑 Super Admin - Full system access</option>
                  </select>
                </div>

                <div className="p-3 bg-amber-50 rounded-lg">
                  <p className="text-xs text-amber-700 font-medium mb-1">⚠️ Permission Changes:</p>
                  <ul className="text-xs text-amber-600 space-y-0.5">
                    <li>• <strong>User:</strong> Regular email access only</li>
                    <li>• <strong>Admin:</strong> User management, analytics, app uploads</li>
                    <li>• <strong>Super Admin:</strong> Full system control including role management</li>
                  </ul>
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <button
                    onClick={() => {
                      setShowRoleModal(null);
                      setSelectedRole('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleAssignRole(showRoleModal._id)}
                    disabled={isAssigning || !selectedRole}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
                  >
                    {isAssigning ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Change Role'}
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

export default SAdminRoleManager;