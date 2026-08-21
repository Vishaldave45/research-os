import React from 'react';
import { RegisterForm } from '../components/RegisterForm';
import { Network, ShieldCheck, ArrowLeft, BrainCircuit, Sparkles } from 'lucide-react';

interface RegisterPageProps {
  onNavigateToLogin: () => void;
  onSuccess?: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onNavigateToLogin,
  onSuccess,
}) => {
  return (
    <div className="flex min-h-screen w-full bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Left Banner */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 border-r border-slate-800">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/30">
              <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <BrainCircuit className="h-5 w-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                ResearchOS
              </span>
              <span className="ml-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-300">
                v0.1 Alpha
              </span>
            </div>
          </div>
        </div>

        {/* Value Prop */}
        <div className="relative z-10 space-y-6 max-w-lg">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl leading-tight">
            Accelerate your research pipeline with end-to-end provenance
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Create your account to establish isolated workspaces, collaborate with peers, and maintain complete causal auditability for every scientific conclusion.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-900/60 p-3 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-indigo-400 shrink-0" />
              <span className="text-xs text-slate-300 font-medium">Automatic workspace initialization & canonical research seeding</span>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-900/60 p-3 backdrop-blur-sm">
              <Network className="h-4 w-4 text-cyan-400 shrink-0" />
              <span className="text-xs text-slate-300 font-medium">Interactive Canvas & Literature Synthesis Matrix</span>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-900/60 p-3 backdrop-blur-sm">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <span className="text-xs text-slate-300 font-medium">Enterprise grade multi-tenant isolation & JWT security</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-xs text-slate-500">
          ResearchOS Operating System &copy; 2026. Built for rigorous scientific inquiry.
        </div>
      </div>

      {/* Right Register Container */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center sm:text-left">
            {/* Mobile Brand */}
            <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 p-0.5">
                <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <BrainCircuit className="h-4 w-4 text-cyan-400" />
                </div>
              </div>
              <span className="text-lg font-black text-white">ResearchOS</span>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-white">
              Create your account
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Join ResearchOS to manage scientific evidence, gaps, and decision lineage.
            </p>
          </div>

          {/* Form Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
            <RegisterForm
              onSuccess={onSuccess}
              onSwitchToLogin={onNavigateToLogin}
            />
          </div>

          <div className="text-center">
            <button
              onClick={onNavigateToLogin}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition group"
            >
              <ArrowLeft className="h-3 w-3 text-indigo-400 group-hover:-translate-x-0.5 transition" />
              <span>Already registered?</span>
              <span className="text-indigo-400 font-semibold group-hover:underline">Sign in instead</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
