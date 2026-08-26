import React from 'react';
import { RegisterForm } from '../components/RegisterForm';
import { BrainCircuit } from 'lucide-react';

interface RegisterPageProps {
  onNavigateToLogin: () => void;
  onSuccess?: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onNavigateToLogin,
  onSuccess,
}) => {
  return (
    <div className="flex min-h-screen w-full flex-col justify-center items-center bg-slate-50 p-4 sm:p-8 selection:bg-indigo-500 selection:text-white">
      {/* Background ambient accents */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f015_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f015_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="relative w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20 mb-1">
            <BrainCircuit className="h-6 w-6" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            ResearchOS
          </h1>

          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Create your research workspace.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xl shadow-slate-200/60 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">
              Create your account
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Get started with an isolated research workspace.
            </p>
          </div>

          <RegisterForm
            onSuccess={onSuccess}
            onSwitchToLogin={onNavigateToLogin}
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
