import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  LayoutGrid
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../slices/authSlice';

const SideBar = ({ isCollapsed = false, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [collapsed, setCollapsed] = useState(isCollapsed);

  const handleToggle = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    if (onToggle) onToggle(newState);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const mainNavItems = [
    { id: 'inbox', label: 'Inbox', icon: Inbox, path: '/inbox', badge: null },
    { id: 'starred', label: 'Starred', icon: Star, path: '/starred', badge: null },
    { id: 'sent', label: 'Sent', icon: Send, path: '/sent', badge: null },
    { id: 'archive', label: 'Archive', icon: Archive, path: '/archive', badge: null },
    { id: 'trash', label: 'Trash', icon: Trash2, path: '/trash', badge: null },
  ];

  const emailManagementNavItems = [
    { id: 'custom-emails', label: 'Custom Emails', icon: AtSign, path: '/custom-emails' },
    { id: 'domains', label: 'Domains', icon: Globe, path: '/domains' },
    { id: 'team', label: 'Team Access', icon: Users, path: '/team' },
  ];

  const bottomNavItems = [
    { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
    { id: 'stats', label: 'Stats', icon: BarChart3, path: '/stats' },
  ];

  const isActive = (path) => {
    if (path === '/inbox' && location.pathname === '/') return true;
    return location.pathname === path;
  };

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
        {mainNavItems.map((item) => {
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
              {!collapsed && item.badge && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Divider */}
        {!collapsed && (
          <div className="my-4 border-t border-gray-200" />
        )}
        {collapsed && (
          <div className="my-2 border-t border-gray-200" />
        )}

        {/* Section Header */}
        {!collapsed && (
          <div className="px-3 py-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Management</p>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center my-2">
            <div className="w-8 h-px bg-gray-200"></div>
          </div>
        )}

        {/* Email Management Section */}
        {emailManagementNavItems.map((item) => {
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