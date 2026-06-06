import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SideBar from './SideBar';
import BottomBar from './BottomBar';

const MainLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <SideBar isCollapsed={sidebarCollapsed} onToggle={setSidebarCollapsed} />
      
      {/* Main Content */}
      <div className={`transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
      }`}>
        <main className="pb-20 lg:pb-0">
          <Outlet />
        </main>
      </div>
      
      {/* Mobile Bottom Bar */}
      <BottomBar />
    </div>
  );
};

export default MainLayout;