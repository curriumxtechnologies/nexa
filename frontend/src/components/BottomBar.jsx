import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  ChevronRight
} from 'lucide-react';

const BottomBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  const mainNavItems = [
    { id: 'inbox', label: 'Inbox', icon: Inbox, path: '/inbox' },
    { id: 'starred', label: 'Starred', icon: Star, path: '/starred' },
    { id: 'compose', label: 'Compose', icon: PlusCircle, path: '/compose', isPrimary: true },
    { id: 'sent', label: 'Sent', icon: Send, path: '/sent' },
    { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
  ];

  const moreNavItems = [
    { id: 'archive', label: 'Archive', icon: Archive, path: '/archive' },
    { id: 'trash', label: 'Trash', icon: Trash2, path: '/trash' },
    { id: 'domains', label: 'Domains', icon: Globe, path: '/domains' },
    { id: 'team', label: 'Team Access', icon: Users, path: '/team' },
    { id: 'stats', label: 'Statistics', icon: BarChart3, path: '/stats' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
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
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden ${
          showMenu ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Menu Header */}
          <div className="p-4 border-b border-gray-200 bg-purple-600">
            <div className="flex items-center space-x-2">
              <Mail className="w-6 h-6 text-white" />
              <span className="text-lg font-bold text-white">Nexa</span>
            </div>
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto py-4">
            <div className="px-2 space-y-1">
              <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                More Options
              </p>
              {moreNavItems.map((item) => {
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

          {/* Menu Footer */}
          <div className="p-4 border-t border-gray-200">
            <p className="text-xs text-gray-400 text-center">Nexa v1.0.0</p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg lg:hidden z-50">
        <div className="flex justify-around items-center px-1 py-1">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
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
                className={`flex flex-col items-center py-1 px-2 sm:px-3 rounded-lg transition ${
                  active 
                    ? 'text-purple-600 bg-purple-50' 
                    : 'text-gray-500 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-purple-600' : 'text-gray-500'}`} />
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