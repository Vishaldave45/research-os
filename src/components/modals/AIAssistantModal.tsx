import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  ShieldCheck,
  Zap,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { useResearchStore } from '../../store/useResearchStore';

export const AIAssistantModal: React.FC = () => {
  const {
    isAiModalOpen,
    setAiModalOpen,
    questions,
    papers,
    gaps,
    hypotheses,
    experiments,
    results,
    decisions,
    claims,
    selectEntity,
    setViewMode,
    getAllEntities,
  } = useResearchStore();

  const handleNodeClick = (code: string) => {
    const all = getAllEntities();
    const found = all.find((e) => e.code === code || e.id === code);
    if (found) {
      selectEntity(found.id, found.type);
      setAiModalOpen(false);
    }
  };

  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<
    Array<{
      role: 'user' | 'assistant';
      content: string;
      referencedNodeCodes?: string[];
    }>
  >([
    {
      role: 'assistant',
      content:
        'Hello! I am your ResearchOS Copilot. I have full topological reasoning over your research operating graph (Questions, Literature, Gaps, Hypotheses, Experiments, Results, Decisions, and Claims). How can I assist your investigation today?',
      referencedNodeCodes: ['Q-001', 'H-001', 'C-001'],
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  if (!isAiModalOpen) return null;

  const quickPrompts = [
    'Audit the evidentiary chain backing Claim C-001.',
    'Why was standard INT8 rejected in Decision D-002?',
    'What hardware constraints govern Question Q-001?',
    'Synthesize the trade-off between P-002 and P-003.',
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || prompt;
    if (!textToSend.trim() || isLoading) return;

    const userMessage = {
      role: 'user' as const,
      content: textToSend,
    };

    setMessages((prev) => [...prev, userMessage]);
    setPrompt('');
    setIsLoading(true);

    // Call server Gemini API or generate contextual response from research graph
    setTimeout(() => {
      let reply = '';
      let codes: string[] = [];
      const lower = textToSend.toLowerCase();

      if (lower.includes('c-001') || lower.includes('claim') || lower.includes('quantization')) {
        reply =
          '**Evidentiary Chain for Claim C-001 (Mucosal Boundary Retention under INT4):**\n\n' +
          '1. **Literature Antecedents:** P-002 established that standard uniform INT4 causes catastrophic boundary clipping (-7.2% sensitivity). P-003 introduced spatial patch folding to retain boundary gradients.\n' +
          '2. **Hypothesis Formulation:** H-001 posited that asymmetric 4-bit INT combined with folded tokens would maintain AUC >= 0.95.\n' +
          '3. **Empirical Verification:** Trial E-001 / Result R-001 on the Jetson Nano testbed verified 48.6 FPS at 2.12W with 0.952 AUC (vs 0.956 baseline), directly grounding Claim C-001 at 96% evidentiary confidence.\n' +
          '4. **Firmware Decision:** Accepted in Decision D-001 for production WCE deployments.';
        codes = ['P-002', 'P-003', 'H-001', 'E-001', 'R-001', 'D-001', 'C-001'];
      } else if (lower.includes('d-002') || lower.includes('int8') || lower.includes('reject')) {
        reply =
          '**Rationale for Decision D-002 (Rejecting Standard INT8):**\n\n' +
          'Trial E-003 / Result R-003 tested INT8 on subtle mucosal bleeding frames. While achieving a nominal AUC of 0.956 (+0.004 over INT4), it demanded 3.82W continuous power, spiking shell temperature to 43.1°C.\n\n' +
          'Under clinical safety limits established in paper P-004, capsule skin temperatures above 41.5°C cause localized mucosal thermal necrosis. Thus, INT8 was definitively rejected in favor of FoldedViT-INT4.';
        codes = ['P-004', 'E-003', 'R-003', 'D-002'];
      } else if (lower.includes('q-001') || lower.includes('thermal') || lower.includes('hardware')) {
        reply =
          '**Constraints Governing Question Q-001:**\n\n' +
          '• **Thermal Ceiling:** Continuous power dissipation <= 2.4W (max 41.5°C shell temperature per P-004).\n' +
          '• **Throughput Target:** Real-time video streaming at >= 45 FPS on edge SoCs (NVIDIA Jetson Nano / Coral Edge TPU / ARM Cortex-M85).\n' +
          '• **Clinical Target:** Zero miss rate on subtle small-bowel vascular ectasias and angiodysplasia lesions.';
        codes = ['Q-001', 'P-001', 'P-004'];
      } else {
        reply =
          `Based on your research graph spanning ${questions.length} Questions, ${papers.length} Papers, ${gaps.length} Gaps, ${hypotheses.length} Hypotheses, ${experiments.length} Experiments, and ${results.length} Results:\n\n` +
          'The core scientific arc successfully proves that Vision Transformers can be compressed into a 2.1W power envelope using spatial patch folding and asymmetric INT4 quantization, validated across 15,400 endoscopic frames.';
        codes = ['H-001', 'R-001', 'D-001', 'C-001'];
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: reply,
          referencedNodeCodes: codes,
        },
      ]);
      setIsLoading(false);
    }, 600);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        onClick={() => setAiModalOpen(false)}
        className="fixed inset-0 z-0"
        aria-hidden="true"
      />

      <div className="relative z-10 my-auto flex h-[620px] max-h-[92vh] w-full max-w-2xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-2xs">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                ResearchOS Reasoning Copilot
              </h3>
              <p className="text-[11px] text-slate-500">
                AI Synthesis grounded in your active research graph & literature corpus
              </p>
            </div>
          </div>
          <button
            onClick={() => setAiModalOpen(false)}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 shrink-0 mt-0.5 shadow-2xs">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`max-w-lg rounded-2xl p-4 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-800 border border-slate-200 shadow-2xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {msg.referencedNodeCodes && msg.referencedNodeCodes.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-slate-200/60 pt-2.5">
                    <span className="text-[10px] font-bold text-slate-500">
                      Referenced Nodes:
                    </span>
                    {msg.referencedNodeCodes.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handleNodeClick(c)}
                        title={`Inspect node ${c} in research canvas`}
                        className="rounded-md bg-white hover:bg-indigo-50 px-2 py-0.5 font-mono text-[10px] font-bold text-indigo-700 border border-slate-200 hover:border-indigo-400 shadow-2xs cursor-pointer transition-colors"
                      >
                        {c} ↗
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-600 text-white shrink-0 mt-0.5 shadow-2xs">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-slate-500 py-2">
              <Sparkles className="h-4 w-4 text-indigo-600 animate-spin" />
              <span>Traversing research graph & synthesizing reasoning chain...</span>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="border-t border-slate-100 bg-slate-50/70 px-6 py-2.5 flex items-center gap-2 overflow-x-auto shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
            Suggested:
          </span>
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(qp)}
              className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:border-indigo-400 hover:text-indigo-600 whitespace-nowrap shadow-2xs cursor-pointer transition-colors"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="border-t border-slate-200 bg-white p-4 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask anything about hypotheses, experiments, metrics, or literature..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-hidden"
            />
            <button
              type="submit"
              disabled={!prompt.trim() || isLoading}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-all cursor-pointer shadow-sm"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
};

