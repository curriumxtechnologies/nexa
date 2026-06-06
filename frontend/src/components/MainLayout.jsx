import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import SideBar from './SideBar';
import BottomBar from './BottomBar';

const MainLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  // Hide bottom bar on email detail and compose pages
  const hideBottomBar = location.pathname.startsWith('/email/') || location.pathname === '/compose';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <SideBar isCollapsed={sidebarCollapsed} onToggle={setSidebarCollapsed} />

      {/* Main Content */}
      <div className={`transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
      }`}>
        <main className={hideBottomBar ? '' : 'pb-20 lg:pb-0'}>
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Bar — hidden on email detail and compose */}
      {!hideBottomBar && <BottomBar />}
    </div>
  );
};

export default MainLayout;