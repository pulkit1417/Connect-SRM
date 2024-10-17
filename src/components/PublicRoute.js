import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (user) {
    // Redirect to the page they were trying to access before logging in
    return <Navigate to={location.state?.from || '/'} replace />;
  }

  return children;
};

export default PublicRoute;