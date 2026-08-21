import React from 'react';
import { LoginForm } from '../components/LoginForm';
import { Sparkles, Network, ShieldCheck, ArrowRight, BrainCircuit } from 'lucide-react';

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
    <div className="flex min-h-screen w-full bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Left Feature Showcase Banner */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 border-r border-slate-800">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

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

        {/* Core Value Proposition */}
        <div className="relative z-10 space-y-6 max-w-lg">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl leading-tight">
            Scientific Reasoning & Traceability Engine
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            From research questions to evidence-grounded decisions. Connect papers, gaps, hypotheses, experiments, and results in a verifiable knowledge graph.
          </p>

          {/* Feature Badges */}
          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3 rounded-xl border border-slate-800/80 bg-slate-900/60 p-3.5 backdrop-blur-sm">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Network className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Strict DAG Graph Topology</h4>
                <p className="text-xs text-slate-400 mt-0.5">Cycle-prevented reasoning trees ensuring sound causal lineage.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-slate-800/80 bg-slate-900/60 p-3.5 backdrop-blur-sm">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Cryptographic Token Rotation</h4>
                <p className="text-xs text-slate-400 mt-0.5">Zero plaintext password storage with rotatable refresh tokens.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-slate-800/80 bg-slate-900/60 p-3.5 backdrop-blur-sm">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Evidence Narrative Synthesis</h4>
                <p className="text-xs text-slate-400 mt-0.5">Automated literature matrix cross-referencing and claim validation.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-xs text-slate-500">
          ResearchOS Operating System &copy; 2026. Built for rigorous scientific inquiry.
        </div>
      </div>

      {/* Right Login Container */}
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
              Welcome back
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Sign in with your researcher credentials to access your workspaces.
            </p>
          </div>

          {/* Form Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
            <LoginForm
              onSuccess={onSuccess}
              onSwitchToRegister={onNavigateToRegister}
              onNavigateToForgotPassword={onNavigateToForgotPassword}
            />
          </div>

          <div className="text-center">
            <button
              onClick={onNavigateToRegister}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition group"
            >
              <span>Need a new research environment?</span>
              <span className="text-indigo-400 font-semibold group-hover:underline">Register now</span>
              <ArrowRight className="h-3 w-3 text-indigo-400 group-hover:translate-x-0.5 transition" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
