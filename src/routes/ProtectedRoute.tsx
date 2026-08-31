import React, { ReactNode } from 'react';
import { useAuthStore } from '../features/auth/store/authStore';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback,
}) => {
  const { isAuthenticated, status, isInitialized } = useAuthStore();

  if (!isInitialized || status === 'idle') {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-900 text-slate-100">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mb-3" />
        <p className="text-sm text-slate-400 font-medium tracking-wide">
          Initializing ResearchOS Environment...
        </p>
      </div>
    );
  }

  if (!isAuthenticated || status === 'unauthenticated') {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

