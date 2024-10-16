// src/components/PublicRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PublicRoute = ({ children }) => {
  const { user } = useAuth();

  return !user ? children : <Navigate to="/" />; // Redirect to home if logged in
};

export default PublicRoute;
