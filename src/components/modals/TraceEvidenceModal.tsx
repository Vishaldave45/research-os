import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Network,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Layers,
  FileText,
  HelpCircle,
  Search,
  FlaskConical,
  BarChart2,
  CheckSquare,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { decisionsApi, BackwardTraceResponse, TraceNode } from '../../services/api/decisions.api';

interface TraceEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  decisionId: string | null;
}

const TYPE_ICONS: Record<string, any> = {
  question: HelpCircle,
  paper: FileText,
  evidence: ShieldCheck,
  dataset: Layers,
  model: Sparkles,
  gap: Search,
  hypothesis: Sparkles,
  experiment: FlaskConical,
  result: BarChart2,
  decision: CheckSquare,
  claim: ShieldCheck,
};

const TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  paper: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  evidence: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  dataset: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  model: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/30' },
  question: { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/30' },
  gap: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  hypothesis: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30' },
  experiment: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  result: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  decision: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  claim: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
};

export const TraceEvidenceModal: React.FC<TraceEvidenceModalProps> = ({
  isOpen,
  onClose,
  decisionId,
}) => {
  const [traceData, setTraceData] = useState<BackwardTraceResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && decisionId) {
      setIsLoading(true);
      setError(null);
      decisionsApi
        .getBackwardTrace(decisionId)
        .then((data) => {
          setTraceData(data);
          setIsLoading(false);
        })
        .catch((err) => {
          setError(err.message || 'Failed to compute backward evidence trace.');
          setIsLoading(false);
        });
    }
  }, [isOpen, decisionId]);

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      <div
        id="trace-evidence-modal-backdrop"
        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto"
      >
        <div
          onClick={onClose}
          className="fixed inset-0 z-0"
          aria-hidden="true"
        />

        <motion.div
          id="trace-evidence-modal-card"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 my-auto bg-slate-900 border border-slate-700/70 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400">
                <Network className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                  Deterministic Backward Evidence Trace
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                    DAG Proof
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Topological causality from empirical Decision down to Literature grounding
                </p>
              </div>
            </div>
            <button
              id="close-trace-modal-btn"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                <p className="text-sm">Traversing provenance tree in database...</p>
              </div>
            ) : error ? (
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm">Trace Traversal Error</h4>
                  <p className="text-xs text-rose-200 mt-1">{error}</p>
                </div>
              </div>
            ) : traceData ? (
              <>
                {/* Decision Banner */}
                <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {traceData.decision.code}
                      </span>
                      <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                        Target Decision
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-slate-100">
                      {traceData.decision.title}
                    </h3>
                    <p className="text-xs text-slate-300">
                      {traceData.decision.rationale}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {traceData.summary.isFullyGrounded ? 'Fully Grounded' : 'Partial Evidence'}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1 font-mono">
                      Confidence: {(traceData.summary.verificationScore * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>

                {/* Evidence Chain Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl">
                    <p className="text-[11px] text-slate-400 uppercase font-medium">Chain Depth</p>
                    <p className="text-lg font-bold text-slate-100 font-mono">
                      {traceData.nodes.length} Entities
                    </p>
                  </div>
                  <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl">
                    <p className="text-[11px] text-slate-400 uppercase font-medium">Supporting Results</p>
                    <p className="text-lg font-bold text-cyan-400 font-mono">
                      {traceData.summary.resultsCount} Verified
                    </p>
                  </div>
                  <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl">
                    <p className="text-[11px] text-slate-400 uppercase font-medium">Hypotheses Tested</p>
                    <p className="text-lg font-bold text-indigo-400 font-mono">
                      {traceData.summary.hypothesesCount} Active
                    </p>
                  </div>
                  <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl">
                    <p className="text-[11px] text-slate-400 uppercase font-medium">Literature Grounding</p>
                    <p className="text-lg font-bold text-emerald-400 font-mono">
                      {traceData.summary.papersCount} Papers
                    </p>
                  </div>
                </div>

                {/* Topological Causal Lineage Steps */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    Topological Evidence Path (Root Literature to Decision)
                  </h4>

                  <div className="relative border-l-2 border-slate-700/80 ml-4 pl-6 space-y-4 py-2">
                    {traceData.nodes.map((node, index) => {
                      const Icon = TYPE_ICONS[node.type] || FileText;
                      const colors = TYPE_COLORS[node.type] || {
                        bg: 'bg-slate-800',
                        text: 'text-slate-300',
                        border: 'border-slate-700',
                      };

                      return (
                        <div key={node.id} className="relative group">
                          {/* Dot marker */}
                          <div
                            className={`absolute -left-[31px] top-3.5 w-3.5 h-3.5 rounded-full border-2 bg-slate-900 ${colors.border} flex items-center justify-center`}
                          >
                            <div className={`w-1.5 h-1.5 rounded-full ${colors.text.replace('text-', 'bg-')}`} />
                          </div>

                          {/* Node Card */}
                          <div
                            className={`p-3.5 rounded-xl border ${colors.border} ${colors.bg} transition-all hover:bg-slate-800/80`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <div className="flex items-center gap-2">
                                <Icon className={`w-4 h-4 ${colors.text}`} />
                                <span className="text-xs font-mono font-bold text-slate-200">
                                  {node.code}
                                </span>
                                <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${colors.bg} ${colors.text}`}>
                                  {node.type}
                                </span>
                              </div>
                              {node.status && (
                                <span className="text-[11px] text-slate-400 capitalize bg-slate-900/60 px-2 py-0.5 rounded border border-slate-700/50">
                                  {node.status}
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-medium text-slate-200">{node.title}</p>
                            {node.metrics && (
                              <div className="mt-2 flex flex-wrap gap-2 pt-2 border-t border-slate-700/40">
                                {Object.entries(node.metrics).map(([k, v]) => (
                                  <span
                                    key={k}
                                    className="text-[10px] px-2 py-0.5 rounded bg-slate-900/80 text-cyan-300 font-mono border border-slate-700/50"
                                  >
                                    {k}: {String(v)}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : null}
          </div>

          {/* Footer */}
          <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-900/90 flex justify-end shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-colors cursor-pointer"
            >
              Close Trace
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
};

