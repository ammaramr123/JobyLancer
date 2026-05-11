import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, token } = useAuth();
  const location = useLocation();

  // If not authenticated, redirect to login
  if (!isAuthenticated || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role is not allowed, redirect to home or dashboard based on their actual role
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    if (user?.role === 'Admin') return <Navigate to="/admin/dashboard" replace />;
    if (user?.role === 'Provider') return <Navigate to="/provider/profile" replace />;
    if (user?.role === 'Client') return <Navigate to="/client/profile" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
