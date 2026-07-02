import React, { useState, useRef, useEffect } from 'react';
import { useGetAdminsQuery, useAssignRoleMutation, useDeleteUserMutation } from '../slices/adminApiSlice';
import { 
  Shield, 
  Crown, 
  User, 
  Search, 
  RefreshCw, 
  Loader2, 
  AlertCircle,
  Mail,
  Calendar,
  Edit2,
  Trash2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Users,
  PlusCircle,
  UserCheck,
  UserX,
  ChevronDown,
  CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

const AdminAdmins = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showRoleModal, setShowRoleModal] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const limit = 20;

  const { data, isLoading, error, refetch } = useGetAdminsQuery();
  const [assignRole, { isLoading: isAssigning }] = useAssignRoleMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const admins = data?.data || [];
  
  // Filter admins based on search
  const filteredAdmins = admins.filter(admin => 
    admin.name?.toLowerCase().includes(search.toLowerCase()) ||
    admin.email?.toLowerCase().includes(search.toLowerCase())
  );

  // Role options with icons
  const roleOptions = [
    { 
      value: 'admin', 
      label: 'Admin', 
      icon: Shield, 
      description: 'Standard admin privileges',
      color: 'text-purple-600'
    },
    { 
      value: 'super_admin', 
      label: 'Super Admin', 
      icon: Crown, 
      description: 'Full system access incl. role management',
      color: 'text-amber-600'
    },
  ];

  const getSelectedOption = () => roleOptions.find(opt => opt.value === selectedRole) || null;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      setIsDropdownOpen(false);
      refetch();
    } catch (err) {
      toast.error(err.data?.message || 'Failed to assign role');
    }
  };

  const handleDeleteAdmin = async (userId) => {
    try {
      await deleteUser(userId).unwrap();
      toast.success('Admin removed successfully');
      setShowDeleteConfirm(null);
      refetch();
    } catch (err) {
      toast.error(err.data?.message || 'Failed to remove admin');
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
    return email?.slice(0, 2).toUpperCase() || 'A';
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
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Refreshed');
  };

  // Get role counts
  const roleCounts = admins.reduce((acc, admin) => {
    const role = admin.role || 'admin';
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-purple-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">Loading administrators...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center px-6">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-gray-700 font-medium mb-1">Failed to load administrators</p>
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
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-800">Administrators</h1>
                <p className="text-xs text-gray-400 hidden lg:block">Manage system administrators and their roles</p>
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
        {/* Admin Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-3 lg:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Total Admins</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-800">{admins.length}</p>
              </div>
              <div className="p-2 lg:p-3 bg-purple-50 rounded-lg">
                <Shield className="w-4 h-4 lg:w-5 lg:h-5 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-3 lg:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Regular Admins</p>
                <p className="text-xl lg:text-2xl font-bold text-purple-600">{roleCounts.admin || 0}</p>
              </div>
              <div className="p-2 lg:p-3 bg-purple-50 rounded-lg">
                <UserCheck className="w-4 h-4 lg:w-5 lg:h-5 text-purple-600" />
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

        {/* Search */}
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={handleSearch}
            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
          />
        </div>

        {/* Info Banner */}
        <div className="bg-amber-50 rounded-lg p-3">
          <p className="text-xs text-amber-700">
            <strong>⚠️ Super Admin Access Only:</strong> You can manage all administrators here. 
            Regular Admins cannot access this page. Be careful when changing roles or removing admins.
          </p>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Administrator</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Added</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredAdmins.map((admin) => (
                <tr key={admin._id} className="hover:bg-gray-50/50 transition">
                  <td className="px-6 py-3">
                    <div className="flex items-center space-x-3">
                      {admin.profilePicture?.url ? (
                        <img
                          src={admin.profilePicture.url}
                          alt={admin.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium ${getAvatarColor(admin.email)}`}>
                          {getInitials(admin.name, admin.email)}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-800">{admin.name || 'No name'}</p>
                        <p className="text-xs text-gray-400">{admin.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    {getRoleBadge(admin.role)}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs text-gray-600">
                        {format(new Date(admin.createdAt), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => setShowRoleModal(admin)}
                        className="p-1.5 text-gray-400 hover:text-purple-600 transition rounded-lg"
                        title="Change Role"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(admin)}
                        className="p-1.5 text-gray-400 hover:text-red-600 transition rounded-lg"
                        title="Remove Admin"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-3">
          {filteredAdmins.map((admin) => (
            <div key={admin._id} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  {admin.profilePicture?.url ? (
                    <img
                      src={admin.profilePicture.url}
                      alt={admin.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium ${getAvatarColor(admin.email)}`}>
                      {getInitials(admin.name, admin.email)}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{admin.name || 'No name'}</p>
                    <p className="text-xs text-gray-400">{admin.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMobileMenu(showMobileMenu === admin._id ? null : admin._id)}
                  className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile Actions Dropdown */}
              {showMobileMenu === admin._id && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-end space-x-2">
                  <button
                    onClick={() => {
                      setShowRoleModal(admin);
                      setShowMobileMenu(null);
                    }}
                    className="flex items-center space-x-1 px-3 py-1.5 text-purple-600 bg-purple-50 rounded-lg text-xs"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Change Role</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(admin);
                      setShowMobileMenu(null);
                    }}
                    className="flex items-center space-x-1 px-3 py-1.5 text-red-600 bg-red-50 rounded-lg text-xs"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove</span>
                  </button>
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getRoleIcon(admin.role)}
                    <span className="text-xs text-gray-500">Role:</span>
                  </div>
                  {getRoleBadge(admin.role)}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs text-gray-500">Added:</span>
                  </div>
                  <span className="text-xs text-gray-600">
                    {format(new Date(admin.createdAt), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredAdmins.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No administrators found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your search</p>
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
                  <h2 className="text-lg font-semibold text-gray-800">Change Administrator Role</h2>
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

                {/* Custom Role Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select New Role
                  </label>
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm flex items-center justify-between bg-white hover:border-purple-400 focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition"
                    >
                      <div className="flex items-center space-x-2">
                        {selectedRole ? (
                          <>
                            {React.createElement(getSelectedOption()?.icon || User, { className: "w-4 h-4 text-gray-500" })}
                            <span>{getSelectedOption()?.label || 'Select a role'}</span>
                          </>
                        ) : (
                          <span className="text-gray-400">Select a role</span>
                        )}
                      </div>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                        {roleOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setSelectedRole(option.value);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-2 text-sm flex items-center space-x-3 hover:bg-purple-50 transition ${
                              selectedRole === option.value ? 'bg-purple-50' : ''
                            }`}
                          >
                            {React.createElement(option.icon, { 
                              className: `w-4 h-4 ${selectedRole === option.value ? 'text-purple-600' : 'text-gray-500'}` 
                            })}
                            <div className="flex-1 text-left">
                              <p className={`font-medium ${selectedRole === option.value ? 'text-purple-700' : 'text-gray-700'}`}>
                                {option.label}
                              </p>
                              <p className="text-xs text-gray-400">{option.description}</p>
                            </div>
                            {selectedRole === option.value && (
                              <CheckCircle className="w-4 h-4 text-purple-600" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-lg">
                  <p className="text-xs text-amber-700 font-medium mb-1">⚠️ Role Change Impact:</p>
                  <ul className="text-xs text-amber-600 space-y-0.5">
                    <li>• <strong>Admin:</strong> Can manage users, view analytics, upload app versions</li>
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
                  <h2 className="text-lg font-semibold text-gray-800">Remove Administrator</h2>
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-700">
                    Are you sure you want to remove <strong>{showDeleteConfirm.name || showDeleteConfirm.email}</strong> as an administrator?
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">
                    This will demote them to a regular user. They will lose all admin privileges.
                  </p>
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
                    <div className="mt-1">
                      {getRoleBadge(showDeleteConfirm.role)}
                    </div>
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
                    onClick={() => handleDeleteAdmin(showDeleteConfirm._id)}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                  >
                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Remove Admin'}
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

export default AdminAdmins;