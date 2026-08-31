import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Mail, Lock, LogIn, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { OAuthButtons } from './OAuthButtons';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
  onNavigateToForgotPassword?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onSwitchToRegister,
  onNavigateToForgotPassword,
}) => {
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setValidationError('Email is required.');
      return;
    }
    if (!password) {
      setValidationError('Password is required.');
      return;
    }

    try {
      await login({ email: trimmedEmail, password });
      onSuccess?.();
    } catch {
      // Error handled in store
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      {(error || validationError) && (
        <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 animate-in fade-in duration-150">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
          <p className="flex-1 leading-relaxed font-medium">{error || validationError}</p>
        </div>
      )}

      {/* Email Input */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Email address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
            <Mail className="h-4 w-4" />
          </div>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (validationError) setValidationError(null);
            }}
            placeholder="scientist@institute.org"
            className="w-full rounded-xl border border-slate-200/90 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 shadow-2xs outline-none transition focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
          />
        </div>
      </div>

      {/* Password Input */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Password
          </label>
          {onNavigateToForgotPassword && (
            <button
              type="button"
              onClick={onNavigateToForgotPassword}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium hover:underline transition cursor-pointer"
            >
              Forgot password?
            </button>
          )}
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
            <Lock className="h-4 w-4" />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (validationError) setValidationError(null);
            }}
            placeholder="••••••••••••"
            className="w-full rounded-xl border border-slate-200/90 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder-slate-400 shadow-2xs outline-none transition focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Signing in...</span>
          </>
        ) : (
          <>
            <LogIn className="h-4 w-4" />
            <span>Sign In</span>
          </>
        )}
      </button>

      {/* OAuth Providers (Google & GitHub) */}
      <OAuthButtons onSuccess={onSuccess} />

      {/* Switch to Register */}
      {onSwitchToRegister && (
        <div className="text-center pt-2">
          <p className="text-xs text-slate-500">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline transition cursor-pointer"
            >
              Create account
            </button>
          </p>
        </div>
      )}
    </form>
  );
};
