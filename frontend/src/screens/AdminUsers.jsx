import React, { useState } from 'react';
import { useGetUsersQuery, useDeleteUserMutation } from '../slices/adminApiSlice';
import { 
  Users, 
  Search, 
  Filter, 
  RefreshCw, 
  Loader2, 
  AlertCircle,
  Crown,
  Shield,
  User,
  Mail,
  Calendar,
  Trash2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';

const AdminUsers = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const limit = 20;

  const { data, isLoading, error, refetch } = useGetUsersQuery({
    page,
    limit,
    search,
    role: roleFilter
  });
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const users = data?.data?.users || [];
  const total = data?.data?.total || 0;
  const totalPages = data?.data?.totalPages || 0;

  const handleDeleteUser = async (userId) => {
    try {
      await deleteUser(userId).unwrap();
      toast.success('User deleted successfully');
      setShowDeleteConfirm(null);
      refetch();
    } catch (err) {
      toast.error(err.data?.message || 'Failed to delete user');
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
              <div className="p-1.5 bg-purple-50 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-800">User Management</h1>
                <p className="text-xs text-gray-400 hidden lg:block">View all users</p>
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
      <div className="px-4 py-4 lg:px-8">
        {/* Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-4">
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
          <div className="text-sm text-gray-500 ml-auto">
            {total} {total === 1 ? 'user' : 'users'} total
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
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
                      onClick={() => setShowDeleteConfirm(user)}
                      className="p-1.5 text-gray-400 hover:text-red-600 transition rounded-lg"
                      title="Delete User"
                    >
                      <Trash2 className="w-4 h-4" />
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
              <div className="flex items-center justify-between">
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
                  onClick={() => setShowDeleteConfirm(user)}
                  className="p-1.5 text-gray-400 hover:text-red-600 transition rounded-lg"
                  title="Delete User"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Role</span>
                  {getRoleBadge(user.role)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Joined</span>
                  <span className="text-xs text-gray-600">
                    {format(new Date(user.createdAt), 'MMM d, yyyy')}
                  </span>
                </div>
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800">Delete User</h2>
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-700">
                    <strong>Warning:</strong> This action cannot be undone. This will permanently delete:
                  </p>
                  <ul className="text-sm text-red-600 mt-2 space-y-1 list-disc list-inside">
                    <li>User account and profile</li>
                    <li>All emails sent and received</li>
                    <li>All custom email addresses</li>
                    <li>Team access permissions</li>
                  </ul>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  {showDeleteConfirm.profilePicture?.url ? (
                    <img
                      src={showDeleteConfirm.profilePicture.url}
                      alt={showDeleteConfirm.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium ${getAvatarColor(showDeleteConfirm.email)}`}>
                      {getInitials(showDeleteConfirm.name, showDeleteConfirm.email)}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{showDeleteConfirm.name || 'No name'}</p>
                    <p className="text-xs text-gray-400">{showDeleteConfirm.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteUser(showDeleteConfirm._id)}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                  >
                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Delete User'}
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

export default AdminUsers;