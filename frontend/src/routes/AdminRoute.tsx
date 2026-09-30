import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { LoadingState } from '../components/ui/LoadingState';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAuthenticated, user, isInitialized } = useAuthStore();
  const location = useLocation();

  if (!isInitialized) {
    return <LoadingState message="Verifying admin credentials..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const isAdmin = user?.role === 'ADMIN';

  if (!isAdmin) {
    return <Navigate to="/forbidden" replace />;
  }

  return <>{children}</>;
};
