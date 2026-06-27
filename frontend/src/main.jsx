import React, { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import store from "./store";

import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { Provider, useDispatch, useSelector } from "react-redux";

import Homepage from "./screens/Homepage.jsx";

import Login from "./screens/Login.jsx";
import Register from "./screens/Register.jsx";
import VerifyEmail from "./screens/VerifyEmail.jsx";
import MainLayout from "./components/MainLayout.jsx";
import Inbox from "./screens/Inbox.jsx";
import Compose from "./screens/Compose.jsx";
import Starred from "./screens/Starred.jsx";
import Sent from "./screens/Sent.jsx";
import ArchivePage from "./screens/ArchivePage.jsx";
import Trash from "./screens/Trash.jsx";
import Domains from "./screens/Domains.jsx";
import TeamAccess from "./screens/TeamAccess.jsx";
import Profile from "./screens/Profile.jsx";
import Settings from "./screens/Settings.jsx";
import Stats from "./screens/Stats.jsx";
import CustomEmails from "./screens/CustomEmails.jsx";
import EmailDetails from "./screens/EmailDetails.jsx";
import AcceptInvite from "./screens/AcceptInvite.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";

// Admin Routes
import AdminUsers from "./screens/AdminUsers.jsx";
import AdminAnalytics from "./screens/AdminAnalytics.jsx";
import AdminAppManager from "./screens/AdminAppManager.jsx";
import SAdminRoleManager from "./screens/SAdminRoleManager.jsx";
import AdminAdmins from "./screens/AdminAdmins.jsx";

import { useMobilePushNotifications } from './hooks/useMobilePushNotifications';
import AppUpdateChecker from './components/AppUpdateChecker.jsx';

// Component to handle push notification initialization
const PushNotificationInitializer = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const mobilePush = useMobilePushNotifications();

  useEffect(() => {
    // Only initialize if user is logged in and on mobile device
    if (userInfo && window.Capacitor?.isNativePlatform()) {
      console.log('📱 Initializing mobile push notifications');
      
      // Auto-subscribe if not already subscribed
      if (!mobilePush.isSubscribed && mobilePush.permission !== 'denied') {
        setTimeout(() => {
          mobilePush.subscribe();
        }, 2000);
      }
    }
  }, [userInfo, mobilePush.isSubscribed]);

  return null;
};

// Component to handle redirect based on auth status and platform
const RootRedirect = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const isMobileApp = window.Capacitor?.isNativePlatform();
  
  // On mobile app
  if (isMobileApp) {
    // If logged in, go to inbox
    if (userInfo) {
      return <Navigate to="/inbox" replace />;
    }
    // If not logged in, go to login
    return <Navigate to="/login" replace />;
  }
  
  // On web browser
  if (userInfo) {
    return <Navigate to="/inbox" replace />;
  }
  
  // On web without login, show homepage (marketing site)
  return <Homepage />;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <RootRedirect /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "verify-email", element: <VerifyEmail /> },
      { path: "accept-invitation/:token", element: <AcceptInvite /> },
      // Protected routes wrapped with PrivateRoute
      {
        element: <PrivateRoute />,
        children: [
          {
            element: <MainLayout />,
            children: [
              { path: "inbox", element: <Inbox /> },
              { path: "compose", element: <Compose /> },
              { path: "starred", element: <Starred /> },
              { path: "sent", element: <Sent /> },
              { path: "archive", element: <ArchivePage /> },
              { path: "trash", element: <Trash /> },
              { path: "domains", element: <Domains /> },
              { path: "team", element: <TeamAccess /> },
              { path: "profile", element: <Profile /> },
              { path: "settings", element: <Settings /> },
              { path: "stats", element: <Stats /> },
              { path: "custom-emails", element: <CustomEmails /> },
              { path: "email/:emailId", element: <EmailDetails /> },

              // Admin routes
              { path: "admin/users", element: <AdminUsers /> },
              { path: "admin/stats", element: <AdminAnalytics /> },
              { path: "admin/apps", element: <AdminAppManager /> },
              { path: "admin/roles", element: <SAdminRoleManager /> },
              { path: "admin/admins", element: <AdminAdmins /> },
            ]
          }
        ]
      }
    ]
  },
]);

// Register service worker for web push notifications (browsers only)
if ('serviceWorker' in navigator && !window.Capacitor?.isNativePlatform()) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('✅ Web SW registered:', registration.scope);
      })
      .catch((error) => {
        console.error('❌ Web SW registration failed:', error);
      });
  });
}

// For Capacitor/Cordova, we don't need service worker - native handles it
if (window.Capacitor?.isNativePlatform()) {
  console.log('📱 Running on Capacitor - using native push notifications');
}

// Root component with push notification initializer and app update checker
const Root = () => {
  return (
    <Provider store={store}>
      <StrictMode>
        <PushNotificationInitializer />
        <RouterProvider router={router} />
        <AppUpdateChecker />
      </StrictMode>
    </Provider>
  );
};

createRoot(document.getElementById('root')).render(<Root />);