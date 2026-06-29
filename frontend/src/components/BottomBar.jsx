import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Mail, 
  Inbox, 
  Send, 
  Star, 
  Archive, 
  Users, 
  Settings, 
  PlusCircle,
  User,
  Menu,
  X,
  Trash2,
  BarChart3,
  Globe,
  ChevronRight,
  AtSign,
  Shield,
  Crown,
  Code,
  Activity
} from 'lucide-react';
import { useGetProfileQuery } from '../slices/userApiSlice';
import { useGetInboxQuery } from '../slices/emailApiSlice';

const BottomBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo } = useSelector((state) => state.auth);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Fetch user profile to get the role
  const { data: profileData, isLoading: profileLoading } = useGetProfileQuery();

  // ── Fetch inbox with polling for unread count ──
  const { data: inboxData } = useGetInboxQuery(
    { page: 1, limit: 50, folder: 'inbox' },
    { pollingInterval: 15000 }
  );

  // ── Compute unread count ──
  const unreadCount = useMemo(() => {
    const emails = inboxData?.data?.emails || [];
    return emails.filter((email) => !email.isRead).length;
  }, [inboxData]);

  const userRole = profileData?.data?.role || userInfo?.role || 'user';
  const isAdmin = userRole === 'admin' || userRole === 'super_admin';
  const isSuperAdmin = userRole === 'super_admin';

  // Debug log
  useEffect(() => {
    console.log('📊 BottomBar User Role Debug:', {
      profileRole: profileData?.data?.role,
      userInfoRole: userInfo?.role,
      finalRole: userRole,
      isAdmin,
      isSuperAdmin
    });
  }, [profileData, userInfo, userRole, isAdmin, isSuperAdmin]);

  const mainNavItems = [
    { 
      id: 'inbox', 
      label: 'Inbox', 
      icon: Inbox, 
      path: '/inbox',
      badge: unreadCount > 0 ? unreadCount : null 
    },
    { id: 'starred', label: 'Starred', icon: Star, path: '/starred', badge: null },
    { id: 'compose', label: 'Compose', icon: PlusCircle, path: '/compose', isPrimary: true },
    { id: 'sent', label: 'Sent', icon: Send, path: '/sent', badge: null },
    { id: 'profile', label: 'Profile', icon: User, path: '/profile', badge: null },
  ];

  const moreNavItems = [
    { id: 'archive', label: 'Archive', icon: Archive, path: '/archive' },
    { id: 'trash', label: 'Trash', icon: Trash2, path: '/trash' },
    { id: 'custom-emails', label: 'Custom Emails', icon: AtSign, path: '/custom-emails' },
    { id: 'domains', label: 'Domains', icon: Globe, path: '/domains' },
    { id: 'team', label: 'Team Access', icon: Users, path: '/team' },
    { id: 'stats', label: 'Statistics', icon: BarChart3, path: '/stats' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  ];

  const adminNavItems = [
    { id: 'admin-users', label: 'Users', icon: Users, path: '/admin/users' },
    { id: 'admin-stats', label: 'Analytics', icon: Activity, path: '/admin/stats' },
    { id: 'admin-apps', label: 'App Manager', icon: Code, path: '/admin/apps' },
  ];

  const superAdminNavItems = [
    { id: 'admin-roles', label: 'Role Manager', icon: Crown, path: '/admin/roles' },
    { id: 'admin-admins', label: 'Admins', icon: Shield, path: '/admin/admins' },
  ];

  const isActive = (path) => {
    if (path === '/inbox' && location.pathname === '/') return true;
    return location.pathname === path;
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  // Close menu when navigating
  const handleNavigate = (path) => {
    navigate(path);
    setShowMenu(false);
  };

  if (profileLoading) {
    return null;
  }

  return (
    <>
      {/* Floating Hamburger Button */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="fixed bottom-20 right-4 z-50 lg:hidden bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition active:scale-95"
      >
        {showMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Slide-out Menu */}
      <div
        ref={menuRef}
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden ${
          showMenu ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Menu Header */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-purple-700">
            <div className="flex items-center space-x-2">
              <Mail className="w-6 h-6 text-white" />
              <span className="text-lg font-bold text-white">Nexa</span>
            </div>
            {isAdmin && (
              <div className="mt-2">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  isSuperAdmin 
                    ? 'bg-amber-500 text-white' 
                    : 'bg-purple-500 text-white'
                }`}>
                  {isSuperAdmin ? <Crown className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                  {isSuperAdmin ? 'Super Admin' : 'Admin'}
                </span>
              </div>
            )}
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto py-4">
            {/* Email Management Section */}
            <div className="px-2 space-y-1">
              <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Email Management
              </p>
              {moreNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                const isInbox = item.id === 'inbox';
                const badge = isInbox && unreadCount > 0 ? unreadCount : null;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.path)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition ${
                      active
                        ? 'bg-purple-50 text-purple-600'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <div className="relative">
                      <Icon className={`w-5 h-5 ${active ? 'text-purple-600' : 'text-gray-400'}`} />
                      {badge && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[8px] text-white font-bold">
                          {badge > 9 ? '9+' : badge}
                        </span>
                      )}
                    </div>
                    <span className={`flex-1 text-left text-sm ${active ? 'font-medium' : ''}`}>
                      {item.label}
                    </span>
                    {badge && (
                      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full min-w-[20px] text-center">
                        {badge > 99 ? '99+' : badge}
                      </span>
                    )}
                    <ChevronRight className={`w-4 h-4 ${active ? 'text-purple-600' : 'text-gray-300'}`} />
                  </button>
                );
              })}
            </div>

            {/* Admin Section */}
            {isAdmin && (
              <div className="px-2 mt-4 space-y-1">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-3 bg-white text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Admin
                    </span>
                  </div>
                </div>
                <div className="mt-2 space-y-1">
                  {adminNavItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavigate(item.path)}
                        className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition ${
                          active
                            ? 'bg-purple-50 text-purple-600'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${active ? 'text-purple-600' : 'text-gray-400'}`} />
                        <span className={`flex-1 text-left text-sm ${active ? 'font-medium' : ''}`}>
                          {item.label}
                        </span>
                        <ChevronRight className={`w-4 h-4 ${active ? 'text-purple-600' : 'text-gray-300'}`} />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Super Admin Section */}
            {isSuperAdmin && (
              <div className="px-2 mt-4 space-y-1">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-3 bg-white text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Super Admin
                    </span>
                  </div>
                </div>
                <div className="mt-2 space-y-1">
                  {superAdminNavItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavigate(item.path)}
                        className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition ${
                          active
                            ? 'bg-purple-50 text-purple-600'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${active ? 'text-purple-600' : 'text-gray-400'}`} />
                        <span className={`flex-1 text-left text-sm ${active ? 'font-medium' : ''}`}>
                          {item.label}
                        </span>
                        <ChevronRight className={`w-4 h-4 ${active ? 'text-purple-600' : 'text-gray-300'}`} />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Menu Footer */}
          <div className="p-4 border-t border-gray-200">
            <p className="text-xs text-gray-400 text-center">Nexa v1.0.0</p>
            {isAdmin && (
              <p className="text-xs text-gray-400 text-center mt-1">
                {isSuperAdmin ? 'Super Admin Access' : 'Admin Access'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg lg:hidden z-50">
        <div className="flex justify-around items-center px-1 py-1">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            const hasBadge = item.badge && item.badge > 0;
            
            if (item.isPrimary) {
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className="relative -mt-5"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-600 rounded-full flex items-center justify-center shadow-lg hover:bg-purple-700 transition transform hover:scale-105 active:scale-95">
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                </button>
              );
            }
            
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center py-1 px-2 sm:px-3 rounded-lg transition relative ${
                  active 
                    ? 'text-purple-600 bg-purple-50' 
                    : 'text-gray-500 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${active ? 'text-purple-600' : 'text-gray-500'}`} />
                  {hasBadge && item.id === 'inbox' && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[8px] text-white font-bold">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] sm:text-xs mt-1 ${active ? 'text-purple-600 font-medium' : 'text-gray-500'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Overlay */}
      {showMenu && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setShowMenu(false)}
        />
      )}
    </>
  );
};

export default BottomBar;