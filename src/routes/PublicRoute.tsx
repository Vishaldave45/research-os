import React, { ReactNode } from 'react';
import { useAuthStore } from '../features/auth/store/authStore';

interface PublicRouteProps {
  children: ReactNode;
  fallback: ReactNode;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({
  children,
  fallback,
}) => {
  const { isAuthenticated, isInitialized } = useAuthStore();

  if (isInitialized && isAuthenticated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
