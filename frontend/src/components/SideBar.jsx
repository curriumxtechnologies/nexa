import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Inbox, 
  Send, 
  Star, 
  Archive, 
  Trash2, 
  Users, 
  Settings, 
  PlusCircle,
  LogOut,
  Mail,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  User,
  Shield,
  Globe,
  AtSign,
  LayoutGrid,
  Crown,
  Code,
  Activity
} from 'lucide-react';
import { logout } from '../slices/authSlice';
import { useGetProfileQuery } from '../slices/userApiSlice';

const SideBar = ({ isCollapsed = false, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth); // ← ADD THIS LINE
  const [collapsed, setCollapsed] = useState(isCollapsed);
  const [hoveredMenu, setHoveredMenu] = useState(null);

  // Fetch user profile to get the role
  const { data: profileData, isLoading: profileLoading } = useGetProfileQuery();
  
  // Get role from profile data or userInfo
  const userRole = profileData?.data?.role || userInfo?.role || 'user';
  const isAdmin = userRole === 'admin' || userRole === 'super_admin';
  const isSuperAdmin = userRole === 'super_admin';

  // Debug log to see what role we're getting
  useEffect(() => {
    console.log('📊 User Role Debug:', {
      profileRole: profileData?.data?.role,
      userInfoRole: userInfo?.role,
      finalRole: userRole,
      isAdmin,
      isSuperAdmin
    });
  }, [profileData, userInfo, userRole, isAdmin, isSuperAdmin]);

  const handleToggle = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    if (onToggle) onToggle(newState);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/inbox' && location.pathname === '/') return true;
    return location.pathname === path;
  };

  const mainNavItems = [
    { id: 'inbox', label: 'Inbox', icon: Inbox, path: '/inbox', badge: null },
    { id: 'starred', label: 'Starred', icon: Star, path: '/starred', badge: null },
    { id: 'sent', label: 'Sent', icon: Send, path: '/sent', badge: null },
    { id: 'archive', label: 'Archive', icon: Archive, path: '/archive', badge: null },
    { id: 'trash', label: 'Trash', icon: Trash2, path: '/trash', badge: null },
  ];

  const emailManagementItems = [
    { id: 'custom-emails', label: 'Custom Emails', icon: AtSign, path: '/custom-emails' },
    { id: 'domains', label: 'Domains', icon: Globe, path: '/domains' },
    { id: 'team', label: 'Team Access', icon: Users, path: '/team' },
  ];

  const adminItems = [
    { id: 'admin-users', label: 'Users', icon: Users, path: '/admin/users' },
    { id: 'admin-stats', label: 'Analytics', icon: Activity, path: '/admin/stats' },
    { id: 'admin-apps', label: 'App Manager', icon: Code, path: '/admin/apps' },
  ];

  const superAdminItems = [
    { id: 'admin-roles', label: 'Role Manager', icon: Crown, path: '/admin/roles' },
    { id: 'admin-admins', label: 'Admins', icon: Shield, path: '/admin/admins' },
  ];

  const bottomNavItems = [
    { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
    { id: 'stats', label: 'Stats', icon: BarChart3, path: '/stats' },
  ];

  const NavItem = ({ item, collapsed: isCollapsed }) => {
    const Icon = item.icon;
    const active = isActive(item.path);
    
    return (
      <button
        onClick={() => navigate(item.path)}
        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition ${
          active
            ? 'bg-purple-50 text-purple-600'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        } ${isCollapsed ? 'justify-center' : ''}`}
        title={isCollapsed ? item.label : ''}
      >
        <Icon className={`w-5 h-5 ${active ? 'text-purple-600' : 'text-gray-500'}`} />
        {!isCollapsed && (
          <span className={`flex-1 text-left ${active ? 'font-medium' : ''}`}>
            {item.label}
          </span>
        )}
        {!isCollapsed && item.badge && (
          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  const NavSection = ({ title, items, collapsed: isCollapsed, icon: SectionIcon }) => {
    const [isHovered, setIsHovered] = useState(false);
    
    if (!isCollapsed) {
      // When sidebar is expanded, show as normal section
      return (
        <div className="mt-4">
          <div className="px-3 py-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {title}
            </p>
          </div>
          <div className="space-y-1">
            {items.map((item) => {
              const ItemIcon = item.icon;
              const active = isActive(item.path);
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition ${
                    active
                      ? 'bg-purple-50 text-purple-600'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <ItemIcon className={`w-5 h-5 ${active ? 'text-purple-600' : 'text-gray-500'}`} />
                  <span className={`flex-1 text-left text-sm ${active ? 'font-medium' : ''}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    // When sidebar is collapsed, show as icon with floating dropdown on hover
    return (
      <div 
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex justify-center px-3 py-2">
          <div className="p-1.5 rounded-lg text-gray-400">
            <SectionIcon className="w-5 h-5" />
          </div>
        </div>

        {/* Floating dropdown that appears to the right */}
        {isHovered && (
          <div className="fixed left-20 top-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl border border-gray-100 min-w-[200px] z-50 overflow-hidden">
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-purple-600 border-b border-gray-100">
                {title}
              </div>
              <div className="py-1">
                {items.map((item) => {
                  const ItemIcon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        navigate(item.path);
                        setIsHovered(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition ${
                        active
                          ? 'bg-purple-50 text-purple-600'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <ItemIcon className={`w-4 h-4 ${active ? 'text-purple-600' : 'text-gray-500'}`} />
                      <span className="text-sm">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (profileLoading) {
    return (
      <div className={`hidden lg:flex lg:flex-col bg-white border-r border-gray-200 transition-all duration-300 fixed left-0 top-0 bottom-0 z-40 ${collapsed ? 'w-20' : 'w-64'}`}>
        <div className="flex items-center justify-center p-4">
          <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`hidden lg:flex lg:flex-col bg-white border-r border-gray-200 transition-all duration-300 fixed left-0 top-0 bottom-0 z-40 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo Section */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <Mail className="w-8 h-8 text-purple-600" />
            <span className="text-xl font-bold text-gray-800">Nexa</span>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center w-full">
            <Mail className="w-8 h-8 text-purple-600" />
          </div>
        )}
        <button
          onClick={handleToggle}
          className="p-1 rounded-lg hover:bg-gray-100 transition"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          )}
        </button>
      </div>

      {/* Compose Button */}
      <div className="p-4">
        <button
          onClick={() => navigate('/compose')}
          className={`w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center space-x-2 ${
            collapsed ? 'px-2' : ''
          }`}
        >
          <PlusCircle className="w-5 h-5" />
          {!collapsed && <span>Compose</span>}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-2 space-y-1 overflow-y-auto">
        {mainNavItems.map((item) => (
          <NavItem key={item.id} item={item} collapsed={collapsed} />
        ))}

        {/* Email Management Section */}
        <NavSection 
          title="Email Management" 
          items={emailManagementItems} 
          collapsed={collapsed}
          icon={LayoutGrid}
        />

        {/* Admin Section - Only visible for admin/super_admin */}
        {isAdmin && (
          <NavSection 
            title="Admin" 
            items={adminItems} 
            collapsed={collapsed}
            icon={Shield}
          />
        )}

        {/* Super Admin Section - Only visible for super_admin */}
        {isSuperAdmin && (
          <NavSection 
            title="Super Admin" 
            items={superAdminItems} 
            collapsed={collapsed}
            icon={Crown}
          />
        )}
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t border-gray-200 p-2 space-y-1">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition ${
                active
                  ? 'bg-purple-50 text-purple-600'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              } ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? item.label : ''}
            >
              <Icon className={`w-5 h-5 ${active ? 'text-purple-600' : 'text-gray-500'}`} />
              {!collapsed && (
                <span className={`flex-1 text-left ${active ? 'font-medium' : ''}`}>
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
        
        {/* Role indicator */}
        {!collapsed && isAdmin && (
          <div className="px-3 py-1 mt-2">
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              isSuperAdmin 
                ? 'bg-amber-100 text-amber-700' 
                : 'bg-purple-100 text-purple-700'
            }`}>
              {isSuperAdmin ? 'Super Admin' : 'Admin'}
            </span>
          </div>
        )}
        
        {collapsed && isAdmin && (
          <div className="flex justify-center mt-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              isSuperAdmin 
                ? 'bg-amber-100 text-amber-700' 
                : 'bg-purple-100 text-purple-700'
            }`}>
              {isSuperAdmin ? 'SA' : 'A'}
            </div>
          </div>
        )}
        
        {/* Divider before logout */}
        <div className="my-2 border-t border-gray-200" />
        
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition text-red-600 hover:bg-red-50 ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? 'Logout' : ''}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default SideBar;