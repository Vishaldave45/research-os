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
  } = useResearchStore();

  useEffect(() => {
    // Synchronize research state with persistent backend database on mount
    syncFromBackend();
  }, [syncFromBackend]);

  return (
    <div id="researchos-root" className="flex h-screen w-screen flex-col bg-slate-900 font-sans text-slate-900 antialiased overflow-hidden">
      {/* Top Application Header */}
      <Header />

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
