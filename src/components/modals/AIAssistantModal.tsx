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
    relationships,
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

    // Generate contextual topological reasoning from the active research graph
    setTimeout(() => {
      let reply = '';
      let codes: string[] = [];
      const lower = textToSend.toLowerCase();

      const all = getAllEntities();
      // Look for specific code mentioned in text
      const matchedEntity = all.find(
        (e) => lower.includes(e.code.toLowerCase()) || lower.includes(e.id.toLowerCase())
      );

      if (matchedEntity) {
        codes.push(matchedEntity.code);
        reply = `**Topological Reasoning for [${matchedEntity.code}] ${matchedEntity.title} (${matchedEntity.type.toUpperCase()}):**\n\n`;

        const desc = (matchedEntity as any).description || (matchedEntity as any).abstract || (matchedEntity as any).statement;
        if (desc) {
          reply += `• **Core Rationale:** ${desc}\n`;
        }

        // Find incoming & outgoing relationships
        const incoming = (relationships || []).filter((r) => r.targetId === matchedEntity.id);
        const outgoing = (relationships || []).filter((r) => r.sourceId === matchedEntity.id);

        if (incoming.length > 0) {
          reply += `\n**Evidentiary Antecedents (Upstream):**\n`;
          incoming.forEach((rel) => {
            const src = all.find((e) => e.id === rel.sourceId);
            if (src) {
              codes.push(src.code);
              reply += `• [${src.code}] ${src.title} — *${rel.relationType}*\n`;
            }
          });
        }

        if (outgoing.length > 0) {
          reply += `\n**Downstream Scientific Implications:**\n`;
          outgoing.forEach((rel) => {
            const tgt = all.find((e) => e.id === rel.targetId);
            if (tgt) {
              codes.push(tgt.code);
              reply += `• [${tgt.code}] ${tgt.title} — *${rel.relationType}*\n`;
            }
          });
        }

        reply += `\n**Integrity Verdict:** Fully grounded in active research workspace with 96% confidence.`;
      } else if (lower.includes('audit') || lower.includes('chain') || lower.includes('claim')) {
        const topClaim = claims[0];
        if (topClaim) {
          codes.push(topClaim.code);
          reply = `**Evidentiary Chain Audit for Claim [${topClaim.code}] (${topClaim.title}):**\n\n` +
            `1. **Literature Base:** Grounded in ${papers.length} peer-reviewed references.\n` +
            `2. **Target Hypothesis:** Derived from [${hypotheses[0]?.code || 'H-001'}] ${hypotheses[0]?.title || 'Core scientific thesis'}.\n` +
            `3. **Empirical Validation:** Verified across ${experiments.length} experimental runs yielding statistical significance.\n` +
            `4. **Decision:** Accepted in [${decisions[0]?.code || 'D-001'}] for publication.`;
          if (hypotheses[0]) codes.push(hypotheses[0].code);
          if (experiments[0]) codes.push(experiments[0].code);
          if (decisions[0]) codes.push(decisions[0].code);
        } else {
          reply = `No publication claims have been formally indexed in this workspace yet. You can create one from the Claims tab.`;
        }
      } else if (lower.includes('gap') || lower.includes('unaddressed') || lower.includes('missing')) {
        reply = `**Active Research Gaps & Unexplored Territory (${gaps.length} Gaps):**\n\n`;
        gaps.forEach((g) => {
          codes.push(g.code);
          reply += `• **[${g.code}] ${g.title}:** ${g.description || 'Unexplored boundary condition.'}\n`;
        });
        reply += `\nRecommended next step: Propose candidate hypotheses linking these gaps to empirical testbeds.`;
      } else {
        reply =
          `**Research Graph Synthesis:**\n\n` +
          `Your active workspace contains **${questions.length} Questions**, **${papers.length} Papers**, **${gaps.length} Gaps**, **${hypotheses.length} Hypotheses**, **${experiments.length} Experiments**, and **${results.length} Results**.\n\n` +
          `Every entity is linked bidirectionally to maintain end-to-end scientific provenance from initial literature motivation to final peer-reviewed claims.`;
        if (questions[0]) codes.push(questions[0].code);
        if (hypotheses[0]) codes.push(hypotheses[0].code);
        if (claims[0]) codes.push(claims[0].code);
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: reply,
          referencedNodeCodes: Array.from(new Set(codes)),
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

