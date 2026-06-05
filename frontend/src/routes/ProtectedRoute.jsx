import React, { useContext, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function ProtectedRoute({ adminOnly }) {
  const { user, isAuthenticated, isAdmin, refreshProfile } = useContext(AuthContext);
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated && refreshProfile) {
      refreshProfile();
    }
  }, [location.pathname, isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
