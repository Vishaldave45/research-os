/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { Header } from './components/layout/Header';
import { ResearchCanvas } from './components/canvas/ResearchCanvas';
import { NodeInspector } from './components/inspector/NodeInspector';
import { LiteratureMatrixView } from './components/synthesis/LiteratureMatrixView';
import { GapDiscoveryView } from './components/synthesis/GapDiscoveryView';
import { ClaimValidationView } from './components/synthesis/ClaimValidationView';
import { EvidenceChainView } from './components/synthesis/EvidenceChainView';
import { EntityTableView } from './components/table/EntityTableView';
import { CreateNodeModal } from './components/modals/CreateNodeModal';
import { CreateRelationshipModal } from './components/modals/CreateRelationshipModal';
import { CommandPalette } from './components/modals/CommandPalette';
import { AIAssistantModal } from './components/modals/AIAssistantModal';
import { TraceEvidenceModal } from './components/modals/TraceEvidenceModal';
import { AuthModal } from './components/modals/AuthModal';
import { useResearchStore } from './store/useResearchStore';

export default function App() {
  const {
    viewMode,
    isTraceModalOpen,
    traceDecisionId,
    closeTraceModal,
    isAuthModalOpen,
    setAuthModalOpen,
    syncFromBackend,
    error,
    setError,
    isSyncing,
  } = useResearchStore();

  useEffect(() => {
    // Synchronize research state with persistent backend database on mount
    syncFromBackend();
  }, [syncFromBackend]);

  return (
    <div id="researchos-root" className="flex h-screen w-screen flex-col bg-slate-900 font-sans text-slate-900 antialiased overflow-hidden">
      {/* Top Application Header */}
      <Header />

      {/* Global Sync Warning / Error Banner */}
      {error && (
        <div className="bg-amber-500/90 backdrop-blur text-slate-950 px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-sm z-50">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
            <span>{error}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => syncFromBackend()}
              disabled={isSyncing}
              className="bg-slate-900 text-white px-2.5 py-1 rounded text-xs hover:bg-slate-800 transition disabled:opacity-50"
            >
              {isSyncing ? 'Syncing...' : 'Retry Sync'}
            </button>
            <button
              onClick={() => setError(null)}
              className="text-slate-900 hover:text-slate-700 font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main View Area */}
      <main className="relative flex-1 overflow-hidden bg-slate-50">
        {viewMode === 'canvas' && (
          <div className="relative h-full w-full">
            <ResearchCanvas />
            <NodeInspector />
          </div>
        )}

        {viewMode === 'matrix' && <LiteratureMatrixView />}
        {viewMode === 'gaps' && <GapDiscoveryView />}
        {viewMode === 'claims' && <ClaimValidationView />}
        {viewMode === 'evidence_narrative' && <EvidenceChainView />}
        {viewMode === 'table' && <EntityTableView />}
      </main>

      {/* Global Modals and Overlay Tools */}
      <CreateNodeModal />
      <CreateRelationshipModal />
      <CommandPalette />
      <AIAssistantModal />
      <TraceEvidenceModal
        isOpen={isTraceModalOpen}
        onClose={closeTraceModal}
        decisionId={traceDecisionId}
      />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
}
