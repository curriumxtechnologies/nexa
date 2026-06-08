import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = () => {
  const { userInfo } = useSelector((state) => state.auth);
  
  // If user is logged in, render the child routes (Outlet)
  // Otherwise, redirect to login page
  return userInfo ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;