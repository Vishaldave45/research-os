import React, { useState } from 'react';
import {
  X,
  Link2,
  Trash2,
  Edit3,
  ExternalLink,
  GitPullRequest,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Zap,
  Gauge,
  Thermometer,
  Cpu,
  BookOpen,
  FlaskConical,
  Activity,
  GitCommit,
  HelpCircle,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';
import { useResearchStore } from '../../store/useResearchStore';
import { EntityType, ResearchEntity } from '../../types/research';

export const NodeInspector: React.FC = () => {
  const {
    selectedEntityId,
    selectedEntityType,
    isInspectorOpen,
    closeInspector,
    getEntityById,
    getUpstreamEntities,
    getDownstreamEntities,
    selectEntity,
    deleteEntity,
    updateEntity,
    openLinkModal,
    validateClaimAudit,
    setViewMode,
  } = useResearchStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editStatus, setEditStatus] = useState('');

  const entity = selectedEntityId ? getEntityById(selectedEntityId) : null;
  const upstream = selectedEntityId ? getUpstreamEntities(selectedEntityId) : [];
  const downstream = selectedEntityId ? getDownstreamEntities(selectedEntityId) : [];

  if (!isInspectorOpen || !entity) {
    return null;
  }

  const handleStartEdit = () => {
    setEditTitle(entity.title || '');
    if (entity.type === 'hypothesis' || entity.type === 'claim') {
      setEditBody(entity.statement || '');
    } else if (entity.type === 'gap') {
      setEditBody(entity.description || '');
    } else if (entity.type === 'result') {
      setEditBody(entity.summary || '');
    } else if (entity.type === 'decision') {
      setEditBody(entity.rationale || '');
    }
    setEditStatus((entity as any).status || (entity as any).outcome || '');
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    const updated = { ...entity, title: editTitle } as any;
    if (entity.type === 'hypothesis' || entity.type === 'claim') {
      updated.statement = editBody;
    } else if (entity.type === 'gap') {
      updated.description = editBody;
    } else if (entity.type === 'result') {
      updated.summary = editBody;
    } else if (entity.type === 'decision') {
      updated.rationale = editBody;
    }

    if (entity.type === 'decision') {
      updated.outcome = editStatus;
    } else if (editStatus) {
      updated.status = editStatus;
    }

    updateEntity(updated);
    setIsEditing(false);
  };

  const getTypeIcon = (type: EntityType) => {
    switch (type) {
      case 'question':
        return <HelpCircle className="h-4 w-4 text-indigo-600" />;
      case 'paper':
        return <BookOpen className="h-4 w-4 text-blue-600" />;
      case 'gap':
        return <AlertCircle className="h-4 w-4 text-amber-600" />;
      case 'hypothesis':
        return <Lightbulb className="h-4 w-4 text-teal-600" />;
      case 'experiment':
        return <FlaskConical className="h-4 w-4 text-rose-600" />;
      case 'result':
        return <Activity className="h-4 w-4 text-cyan-600" />;
      case 'decision':
        return <GitCommit className="h-4 w-4 text-purple-600" />;
      case 'claim':
        return <ShieldCheck className="h-4 w-4 text-emerald-600" />;
    }
  };

  const getTypeBadgeColor = (type: EntityType) => {
    switch (type) {
      case 'question':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'paper':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'gap':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'hypothesis':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'experiment':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'result':
        return 'bg-cyan-50 text-cyan-800 border-cyan-200';
      case 'decision':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'claim':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
  };

  return (
    <aside
      id="node-precision-inspector"
      className="absolute top-0 right-0 z-20 flex h-full w-96 flex-col border-l border-slate-200 bg-white/98 shadow-xl backdrop-blur-md transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
            {getTypeIcon(entity.type)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold tracking-wider text-slate-900">
                {entity.code}
              </span>
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${getTypeBadgeColor(
                  entity.type
                )}`}
              >
                {entity.type}
              </span>
            </div>
            <span className="text-[11px] text-slate-500">
              Created {new Date(entity.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <button
          onClick={closeInspector}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Title and Core Statement */}
        <div>
          {isEditing ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-indigo-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Description / Statement</label>
                <textarea
                  rows={4}
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-indigo-500 focus:outline-hidden"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-bold leading-snug text-slate-900">
                  {entity.title}
                </h3>
                <button
                  onClick={handleStartEdit}
                  title="Edit details"
                  className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Specific Body Text */}
              {entity.type === 'hypothesis' && (
                <div className="mt-3 rounded-lg border border-teal-100 bg-teal-50/60 p-3">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-teal-800">
                    Hypothesis Statement
                  </span>
                  <p className="mt-1 text-xs leading-relaxed text-slate-800">
                    {entity.statement}
                  </p>
                  {entity.rationale && (
                    <p className="mt-2 text-[11px] text-slate-600 border-t border-teal-100/80 pt-2">
                      <strong className="text-slate-700">Rationale:</strong> {entity.rationale}
                    </p>
                  )}
                </div>
              )}

              {entity.type === 'claim' && (
                <div className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50/60 p-3">
                  <div className="flex items-center justify-between">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                      Scientific Claim
                    </span>
                    <span className="font-mono text-xs font-bold text-emerald-700">
                      {Math.round(entity.confidenceScore * 100)}% Confidence
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-800">
                    {entity.statement}
                  </p>
                  <button
                    onClick={() => {
                      setViewMode('claims');
                    }}
                    className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>View Evidentiary Audit</span>
                  </button>
                </div>
              )}

              {entity.type === 'gap' && (
                <div className="mt-3 rounded-lg border border-amber-100 bg-amber-50/60 p-3">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-amber-800">
                    Gap Detail
                  </span>
                  <p className="mt-1 text-xs leading-relaxed text-slate-800">
                    {entity.description}
                  </p>
                </div>
              )}

              {entity.type === 'result' && (
                <div className="mt-3 space-y-3">
                  <div className="rounded-lg border border-cyan-100 bg-cyan-50/60 p-3">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-cyan-800">
                      Result Summary
                    </span>
                    <p className="mt-1 text-xs leading-relaxed text-slate-800">
                      {entity.summary}
                    </p>
                  </div>

                  {/* Metrics Breakdown */}
                  {entity.metrics && Object.keys(entity.metrics).length > 0 && (
                    <div>
                      <span className="block text-xs font-semibold text-slate-800 mb-2">
                        Empirical Metrics
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(entity.metrics).map(([key, val]) => (
                          <div
                            key={key}
                            className="rounded-lg border border-slate-200 bg-slate-50 p-2.5"
                          >
                            <span className="block text-[10px] font-medium uppercase text-slate-500 truncate">
                              {key.replace(/([A-Z])/g, ' $1')}
                            </span>
                            <span className="font-mono text-sm font-bold text-slate-900">
                              {typeof val === 'boolean' ? (val ? 'Yes' : 'No') : String(val)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {entity.type === 'decision' && (
                <div className="mt-3 space-y-3">
                  <div className="rounded-lg border border-purple-100 bg-purple-50/60 p-3">
                    <div className="flex items-center justify-between">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-purple-800">
                        Outcome: {entity.outcome}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-slate-800">
                      {entity.rationale}
                    </p>
                    {entity.implications && (
                      <p className="mt-2 text-[11px] text-slate-600 border-t border-purple-100 pt-2">
                        <strong className="text-slate-700">Implications:</strong> {entity.implications}
                      </p>
                    )}
                    <button
                      id="inspect-trace-evidence-btn"
                      onClick={() => {
                        const { openTraceModal } = useResearchStore.getState();
                        openTraceModal(entity.id);
                      }}
                      className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors shadow-xs"
                    >
                      <GitPullRequest className="h-3.5 w-3.5" />
                      <span>Trace Supporting Evidence Chain</span>
                    </button>
                  </div>
                </div>
              )}

              {entity.type === 'paper' && (
                <div className="mt-3 space-y-3">
                  <div className="text-xs text-slate-600 space-y-1">
                    <p>
                      <strong className="text-slate-800">Authors:</strong> {entity.authors?.join(', ')}
                    </p>
                    {entity.venue && (
                      <p>
                        <strong className="text-slate-800">Venue:</strong> {entity.venue} ({entity.year})
                      </p>
                    )}
                    {entity.doi && (
                      <p className="flex items-center gap-1 text-blue-600">
                        <strong className="text-slate-800">DOI:</strong> {entity.doi}
                        <ExternalLink className="h-3 w-3" />
                      </p>
                    )}
                  </div>
                  {entity.abstract && (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-700">
                      <span className="font-semibold block mb-1 text-slate-900">Abstract:</span>
                      {entity.abstract}
                    </div>
                  )}
                  {entity.notes && (
                    <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-3 text-xs text-blue-900">
                      <span className="font-semibold block mb-1">Key Insight / Notes:</span>
                      {entity.notes}
                    </div>
                  )}
                </div>
              )}

              {entity.type === 'experiment' && (
                <div className="mt-3 space-y-3">
                  {entity.description && (
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {entity.description}
                    </p>
                  )}
                  {entity.executionMetadata && (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs space-y-1">
                      <span className="font-semibold block text-slate-900 mb-1">
                        Execution Environment:
                      </span>
                      {Object.entries(entity.executionMetadata).map(([k, v]) => (
                        <div key={k} className="flex justify-between text-[11px]">
                          <span className="text-slate-500 capitalize">{k.replace(/([A-Z])/g, ' $1')}:</span>
                          <span className="font-mono text-slate-800">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {entity.config && (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs space-y-1">
                      <span className="font-semibold block text-slate-900 mb-1">
                        Configuration:
                      </span>
                      {Object.entries(entity.config).map(([k, v]) => (
                        <div key={k} className="flex justify-between text-[11px]">
                          <span className="text-slate-500 capitalize">{k.replace(/([A-Z])/g, ' $1')}:</span>
                          <span className="font-mono text-slate-800">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Upstream Ancestors */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Upstream Antecedents ({upstream.length})</span>
          </div>
          {upstream.length === 0 ? (
            <p className="text-xs italic text-slate-400">No upstream parent nodes linked.</p>
          ) : (
            <div className="space-y-1.5">
              {upstream.map((parent) => (
                <button
                  key={parent.id}
                  onClick={() => selectEntity(parent.id, parent.type)}
                  className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white p-2 text-left shadow-2xs hover:border-indigo-400 hover:bg-indigo-50/30 transition-all"
                >
                  <div className="flex items-center gap-2 truncate">
                    {getTypeIcon(parent.type)}
                    <span className="font-mono text-xs font-bold text-slate-800">
                      {parent.code}
                    </span>
                    <span className="truncate text-xs text-slate-600 max-w-[180px]">
                      {parent.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">Jump →</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Downstream Consequences */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
            <ArrowRight className="h-3.5 w-3.5" />
            <span>Downstream Consequences ({downstream.length})</span>
          </div>
          {downstream.length === 0 ? (
            <p className="text-xs italic text-slate-400">No downstream child nodes linked.</p>
          ) : (
            <div className="space-y-1.5">
              {downstream.map((child) => (
                <button
                  key={child.id}
                  onClick={() => selectEntity(child.id, child.type)}
                  className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white p-2 text-left shadow-2xs hover:border-indigo-400 hover:bg-indigo-50/30 transition-all"
                >
                  <div className="flex items-center gap-2 truncate">
                    {getTypeIcon(child.type)}
                    <span className="font-mono text-xs font-bold text-slate-800">
                      {child.code}
                    </span>
                    <span className="truncate text-xs text-slate-600 max-w-[180px]">
                      {child.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">Jump →</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="border-t border-slate-200 bg-slate-50 p-4 flex items-center justify-between gap-2">
        <button
          onClick={() => openLinkModal(entity.id)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs"
        >
          <Link2 className="h-3.5 w-3.5 text-indigo-600" />
          <span>Link Node</span>
        </button>

        <button
          onClick={() => {
            if (confirm(`Delete ${entity.code}: ${entity.title}?`)) {
              deleteEntity(entity.id, entity.type);
            }
          }}
          className="rounded-lg border border-rose-200 bg-rose-50 p-2 text-rose-700 hover:bg-rose-100"
          title="Delete entity"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
};
