import React from 'react';
import { LoginForm } from '../components/LoginForm';
import { Compass, Sparkles, Network, ShieldCheck, ArrowRight } from 'lucide-react';

interface LoginPageProps {
  onNavigateToRegister: () => void;
  onNavigateToForgotPassword?: () => void;
  onSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigateToRegister,
  onNavigateToForgotPassword,
  onSuccess,
}) => {
  return (
    <div className="flex min-h-screen w-full flex-col justify-center items-center bg-slate-50 p-4 sm:p-8 selection:bg-indigo-500 selection:text-white">
      {/* Background ambient accents */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f015_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f015_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="relative w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white shadow-md shadow-indigo-500/20 mb-1">
            <Compass className="h-6 w-6" />
          </div>

          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              ResearchOS
            </h1>
            <span className="rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-bold font-mono text-indigo-700 uppercase border border-indigo-200/60">
              Core v2
            </span>
          </div>

          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Research intelligence workspace & empirical provenance graph
          </p>
        </div>

        {/* Pipeline Archetype Chips Preview */}
        <div className="flex items-center justify-center gap-1.5 overflow-x-auto py-1">
          <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 border border-indigo-200/70">
            Q-Questions
          </span>
          <span className="text-slate-300 text-xs">→</span>
          <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-700 border border-teal-200/70">
            H-Hypotheses
          </span>
          <span className="text-slate-300 text-xs">→</span>
          <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700 border border-rose-200/70">
            E-Trials
          </span>
          <span className="text-slate-300 text-xs">→</span>
          <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-700 border border-purple-200/70">
            D-Decisions
          </span>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xl shadow-slate-200/60 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">
              Welcome back
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Sign in with your researcher credentials to access your workspace.
            </p>
          </div>

          <LoginForm
            onSuccess={onSuccess}
            onSwitchToRegister={onNavigateToRegister}
            onNavigateToForgotPassword={onNavigateToForgotPassword}
          />
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-400">
          ResearchOS &copy; 2026. Built for rigorous scientific inquiry.
        </div>
      </div>
    </div>
  );
};
