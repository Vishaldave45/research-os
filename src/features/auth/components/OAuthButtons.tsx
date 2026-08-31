import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Loader2, Sparkles } from 'lucide-react';

interface OAuthButtonsProps {
  onSuccess?: () => void;
}

export const OAuthButtons: React.FC<OAuthButtonsProps> = ({ onSuccess }) => {
  const { loginWithOAuth, isLoading } = useAuthStore();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleGoogleLogin = async () => {
    setIsAuthenticating(true);
    try {
      await loginWithOAuth('google');
      onSuccess?.();
    } catch {
      // Handled in store
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="space-y-3 w-full">
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 font-medium text-slate-500 uppercase tracking-wider">
            or continue with
          </span>
        </div>
      </div>

      <div>
        {/* Google OAuth Button */}
        <button
          type="button"
          id="btn-oauth-google"
          disabled={isLoading || isAuthenticating}
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 text-xs font-semibold shadow-2xs transition hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isAuthenticating ? (
            <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
          ) : (
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>Continue with Google</span>
        </button>
      </div>

      <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-slate-500">
        <Sparkles className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
        <span>Instant workspace provisioning with your Google Account</span>
      </div>
    </div>
  );
};
