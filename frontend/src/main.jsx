import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import store from "./store";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";

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

const router = createBrowserRouter([
  {path: "/", element: <App />, children:[
    {index: true, element: <a href="/login">Login page</a>},
    {path: "login", element: <Login />},
    {path: "register", element: <Register />},
    {path: "verify-email", element: <VerifyEmail />},
    {path: "/", element: <MainLayout />, children: [
      {path: "inbox", element: <Inbox />},
      {path: "compose", element: <Compose />},
      {path: "starred", element: <Starred />},
      {path: "sent", element: <Sent />},
      {path: "archive", element: <ArchivePage />},
      {path: "trash", element: <Trash />},
      {path: "domains", element: <Domains />},
      {path: "team", element: <TeamAccess />},
      {path: "profile", element: <Profile />},
      {path: "settings", element: <Settings />},
      {path: "stats", element: <Stats />},
      {path: "custom-emails", element: <CustomEmails />},
      {path: "email/:emailId", element: <EmailDetails />},
    ]},
  ]},
])

// Register service worker for push notifications
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('SW registered:', registration.scope);
      })
      .catch((error) => {
        console.error('SW registration failed:', error);
      });
  });
}

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  </Provider>
)