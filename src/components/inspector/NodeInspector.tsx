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
  Sliders,
  TrendingUp,
  MessageSquare,
  CheckCheck,
  History,
  Send,
} from 'lucide-react';
import { useResearchStore } from '../../store/useResearchStore';
import { EntityType, ResearchEntity } from '../../types/research';
import { entitiesApi } from '../../services/api/entities.api';

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
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'reviews' | 'audit'>('details');

  const [comments, setComments] = useState<any[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [reviews, setReviews] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingCollab, setLoadingCollab] = useState(false);

  const entity = selectedEntityId ? getEntityById(selectedEntityId) : null;
  const upstream = selectedEntityId ? getUpstreamEntities(selectedEntityId) : [];
  const downstream = selectedEntityId ? getDownstreamEntities(selectedEntityId) : [];

  React.useEffect(() => {
    if (entity) {
      if (activeTab === 'comments') {
        setLoadingCollab(true);
        entitiesApi.listComments(entity.type, entity.id)
          .then(setComments)
          .catch(() => setComments([]))
          .finally(() => setLoadingCollab(false));
      } else if (activeTab === 'reviews') {
        setLoadingCollab(true);
        entitiesApi.listReviews(entity.type, entity.id)
          .then(setReviews)
          .catch(() => setReviews([]))
          .finally(() => setLoadingCollab(false));
      } else if (activeTab === 'audit') {
        setLoadingCollab(true);
        entitiesApi.listAuditLogs(entity.type)
          .then(setAuditLogs)
          .catch(() => setAuditLogs([]))
          .finally(() => setLoadingCollab(false));
      }
    }
  }, [entity?.id, entity?.type, activeTab]);

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
      className="absolute top-0 right-0 z-30 flex h-full w-96 lg:w-[420px] flex-col border-l border-slate-200/90 bg-white/95 shadow-2xl backdrop-blur-xl transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200/90 px-5 py-4 bg-slate-50/60">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-slate-200/80 shadow-2xs">
            {getTypeIcon(entity.type)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold tracking-wider text-slate-900">
                {entity.code}
              </span>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getTypeBadgeColor(
                  entity.type
                )}`}
              >
                {entity.type}
              </span>
            </div>
            <span className="text-[11px] font-medium text-slate-400">
              Created {new Date(entity.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <button
          onClick={closeInspector}
          className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200/90 bg-slate-50/40 px-3">
        <button
          onClick={() => setActiveTab('details')}
          className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'details'
              ? 'border-indigo-600 text-indigo-600 bg-white shadow-2xs'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <span>Details</span>
        </button>

        <button
          onClick={() => setActiveTab('comments')}
          className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'comments'
              ? 'border-indigo-600 text-indigo-600 bg-white shadow-2xs'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span>Comments</span>
          {comments.length > 0 && (
            <span className="rounded-full bg-slate-200 px-1.5 py-0.2 text-[10px] text-slate-700 font-bold">
              {comments.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'reviews'
              ? 'border-indigo-600 text-indigo-600 bg-white shadow-2xs'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <CheckCheck className="h-3.5 w-3.5" />
          <span>Reviews</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'audit'
              ? 'border-indigo-600 text-indigo-600 bg-white shadow-2xs'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <History className="h-3.5 w-3.5" />
          <span>Audit</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'comments' && (
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Threaded Discussions</h4>
            <span className="text-[11px] text-slate-400">PostgreSQL Persisted</span>
          </div>

          <div className="space-y-3">
            {loadingCollab ? (
              <p className="text-xs text-slate-400">Loading comments...</p>
            ) : comments.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                <p className="text-xs text-slate-500">No comments yet on this node.</p>
                <p className="text-[11px] text-slate-400 mt-1">Start a peer discussion below.</p>
              </div>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-800">{c.author_name || 'Researcher'}</span>
                    <span className="text-slate-400">{new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-slate-700">{c.content}</p>
                </div>
              ))
            )}
          </div>

          {/* Comment Input */}
          <div className="pt-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Write a comment or @mention..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                onKeyDown={async (e) => {
                  if (e.key === 'Enter' && newCommentText.trim()) {
                    try {
                      const created = await entitiesApi.createComment({
                        entity_type: entity.type,
                        entity_id: entity.id,
                        content: newCommentText.trim(),
                      });
                      setComments([...comments, created]);
                      setNewCommentText('');
                    } catch {}
                  }
                }}
                className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-hidden"
              />
              <button
                onClick={async () => {
                  if (newCommentText.trim()) {
                    try {
                      const created = await entitiesApi.createComment({
                        entity_type: entity.type,
                        entity_id: entity.id,
                        content: newCommentText.trim(),
                      });
                      setComments([...comments, created]);
                      setNewCommentText('');
                    } catch {}
                  }
                }}
                className="rounded-xl bg-indigo-600 px-3 py-2 text-white hover:bg-indigo-700 cursor-pointer shadow-2xs"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Peer Reviews & Verdicts</h4>
          </div>

          {reviews.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
              <p className="text-xs text-slate-500">No formal peer reviews filed.</p>
              <p className="text-[11px] text-slate-400 mt-1">Submit a review below to verify scientific validity.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map((r) => (
                <div key={r.id} className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      r.verdict === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {r.verdict}
                    </span>
                    <span className="text-[11px] text-slate-400">{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                  {r.comments && <p className="text-xs text-slate-700">{r.comments}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Quick Review Submission */}
          <div className="border-t border-slate-200 pt-3 space-y-2">
            <label className="block text-xs font-bold text-slate-700">Submit Verification Verdict</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={async () => {
                  try {
                    const rev = await entitiesApi.createReview({
                      entity_type: entity.type,
                      entity_id: entity.id,
                      verdict: 'approved',
                      comments: 'Verified methodology and findings against empirical baseline.',
                      confidence_rating: 5,
                    });
                    setReviews([...reviews, rev]);
                  } catch {}
                }}
                className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 cursor-pointer text-center"
              >
                Approve Artifact
              </button>
              <button
                onClick={async () => {
                  try {
                    const rev = await entitiesApi.createReview({
                      entity_type: entity.type,
                      entity_id: entity.id,
                      verdict: 'changes_requested',
                      comments: 'Request additional replication trials across distinct hardware platforms.',
                      confidence_rating: 3,
                    });
                    setReviews([...reviews, rev]);
                  } catch {}
                }}
                className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100 cursor-pointer text-center"
              >
                Request Revisions
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Immutable Audit Trail</h4>
            <span className="text-[11px] text-slate-400">PostgreSQL</span>
          </div>

          {auditLogs.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
              <p className="text-xs text-slate-500">No audit events recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div key={log.id} className="rounded-xl border border-slate-200 bg-white p-2.5 text-xs shadow-2xs space-y-1">
                  <div className="flex items-center justify-between font-mono text-[10px] text-slate-500">
                    <span className="font-bold text-indigo-600 uppercase">{log.action}</span>
                    <span>{new Date(log.created_at).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-slate-700 font-medium truncate">{log.entity_type} {log.entity_id}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Scrollable Content */}
      {activeTab === 'details' && (
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Title and Core Statement */}
        <div>
          {isEditing ? (
            <div className="space-y-3.5 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-indigo-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Description / Statement</label>
                <textarea
                  rows={4}
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-indigo-500 focus:outline-hidden"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => setIsEditing(false)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 shadow-sm cursor-pointer"
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
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Specific Body Text */}
              {entity.type === 'hypothesis' && (
                <div className="mt-3 rounded-2xl border border-teal-100 bg-teal-50/50 p-4 shadow-2xs">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-teal-800">
                    Hypothesis Statement
                  </span>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-800">
                    {entity.statement}
                  </p>
                  {entity.rationale && (
                    <p className="mt-2.5 text-[11px] text-slate-600 border-t border-teal-100/80 pt-2 leading-relaxed">
                      <strong className="text-slate-800">Rationale:</strong> {entity.rationale}
                    </p>
                  )}
                </div>
              )}

              {entity.type === 'claim' && (
                <div className="mt-3 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                      Scientific Claim
                    </span>
                    <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                      {Math.round(entity.confidenceScore * 100)}% Confidence
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-800">
                    {entity.statement}
                  </p>
                  <button
                    onClick={() => {
                      setViewMode('claims');
                    }}
                    className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm transition cursor-pointer"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>View Evidentiary Audit</span>
                  </button>
                </div>
              )}

              {entity.type === 'gap' && (
                <div className="mt-3 rounded-2xl border border-amber-100 bg-amber-50/50 p-4 shadow-2xs">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-amber-800">
                    Gap Detail
                  </span>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-800">
                    {entity.description}
                  </p>
                </div>
              )}

              {entity.type === 'result' && (
                <div className="mt-3 space-y-3">
                  <div className="rounded-2xl border border-cyan-100 bg-cyan-50/50 p-4 shadow-2xs">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-cyan-800">
                      Result Summary
                    </span>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-800">
                      {entity.summary}
                    </p>
                  </div>

                  {/* Metrics Breakdown */}
                  {entity.metrics && Object.keys(entity.metrics).length > 0 && (
                    <div>
                      <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Empirical Metrics
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(entity.metrics).map(([key, val]) => (
                          <div
                            key={key}
                            className="rounded-xl border border-slate-200/90 bg-white p-3 shadow-2xs"
                          >
                            <span className="block text-[10px] font-bold uppercase text-slate-400 truncate">
                              {key.replace(/([A-Z])/g, ' $1')}
                            </span>
                            <span className="font-mono text-sm font-bold text-slate-900 mt-0.5 block">
                              {typeof val === 'boolean' ? (val ? 'Yes' : 'No') : String(val)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setViewMode('benchmarks');
                    }}
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition shadow-xs cursor-pointer"
                  >
                    <Sliders className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Explore in Benchmark Studio & Pareto Frontier</span>
                  </button>
                </div>
              )}

              {entity.type === 'decision' && (
                <div className="mt-3 space-y-3">
                  <div className="rounded-2xl border border-purple-100 bg-purple-50/50 p-4 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-purple-800">
                        Outcome: {entity.outcome}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-800">
                      {entity.rationale}
                    </p>
                    {entity.implications && (
                      <p className="mt-2 text-[11px] text-slate-600 border-t border-purple-100/80 pt-2 leading-relaxed">
                        <strong className="text-slate-800">Implications:</strong> {entity.implications}
                      </p>
                    )}
                    <button
                      id="inspect-trace-evidence-btn"
                      onClick={() => {
                        const { openTraceModal } = useResearchStore.getState();
                        openTraceModal(entity.id);
                      }}
                      className="mt-3.5 flex w-full items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition shadow-sm cursor-pointer"
                    >
                      <GitPullRequest className="h-3.5 w-3.5" />
                      <span>Trace Supporting Evidence Chain</span>
                    </button>
                  </div>
                </div>
              )}

              {entity.type === 'paper' && (
                <div className="mt-3 space-y-3">
                  <div className="text-xs text-slate-600 space-y-1.5 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80">
                    <p>
                      <strong className="text-slate-800">Authors:</strong> {entity.authors?.join(', ')}
                    </p>
                    {entity.venue && (
                      <p>
                        <strong className="text-slate-800">Venue:</strong> {entity.venue} ({entity.year})
                      </p>
                    )}
                    {entity.doi && (
                      <p className="flex items-center gap-1 text-blue-600 font-mono">
                        <strong className="text-slate-800 font-sans">DOI:</strong> {entity.doi}
                        <ExternalLink className="h-3 w-3" />
                      </p>
                    )}
                  </div>
                  {entity.abstract && (
                    <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 text-xs leading-relaxed text-slate-700 shadow-2xs">
                      <span className="font-bold block mb-1 text-slate-900">Abstract:</span>
                      {entity.abstract}
                    </div>
                  )}
                  {entity.notes && (
                    <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-3.5 text-xs text-blue-950 shadow-2xs">
                      <span className="font-bold block mb-1">Key Insight / Notes:</span>
                      {entity.notes}
                    </div>
                  )}
                </div>
              )}

              {entity.type === 'experiment' && (
                <div className="mt-3 space-y-3">
                  {entity.description && (
                    <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80">
                      {entity.description}
                    </p>
                  )}
                  {entity.executionMetadata && (
                    <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 text-xs space-y-1.5 shadow-2xs">
                      <span className="font-bold block text-slate-900 mb-1.5">
                        Execution Environment:
                      </span>
                      {Object.entries(entity.executionMetadata).map(([k, v]) => (
                        <div key={k} className="flex justify-between text-[11px]">
                          <span className="text-slate-500 capitalize">{k.replace(/([A-Z])/g, ' $1')}:</span>
                          <span className="font-mono font-bold text-slate-800">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {entity.config && (
                    <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 text-xs space-y-1.5 shadow-2xs">
                      <span className="font-bold block text-slate-900 mb-1.5">
                        Configuration:
                      </span>
                      {Object.entries(entity.config).map(([k, v]) => (
                        <div key={k} className="flex justify-between text-[11px]">
                          <span className="text-slate-500 capitalize">{k.replace(/([A-Z])/g, ' $1')}:</span>
                          <span className="font-mono font-bold text-slate-800">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setViewMode('benchmarks');
                    }}
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition shadow-xs cursor-pointer"
                  >
                    <Sliders className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Open in Benchmark Studio & Compare Runs</span>
                  </button>
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
            <div className="space-y-2">
              {upstream.map((parent) => (
                <button
                  key={parent.id}
                  onClick={() => selectEntity(parent.id, parent.type)}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-200/80 bg-white p-2.5 text-left shadow-2xs hover:border-indigo-400 hover:bg-indigo-50/20 transition cursor-pointer"
                >
                  <div className="flex items-center gap-2 truncate">
                    {getTypeIcon(parent.type)}
                    <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
                      {parent.code}
                    </span>
                    <span className="truncate text-xs text-slate-700 font-medium max-w-[180px]">
                      {parent.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold">Jump →</span>
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
            <div className="space-y-2">
              {downstream.map((child) => (
                <button
                  key={child.id}
                  onClick={() => selectEntity(child.id, child.type)}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-200/80 bg-white p-2.5 text-left shadow-2xs hover:border-indigo-400 hover:bg-indigo-50/20 transition cursor-pointer"
                >
                  <div className="flex items-center gap-2 truncate">
                    {getTypeIcon(child.type)}
                    <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
                      {child.code}
                    </span>
                    <span className="truncate text-xs text-slate-700 font-medium max-w-[180px]">
                      {child.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold">Jump →</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      )}

      {/* Footer Actions */}
      <div className="border-t border-slate-200/90 bg-slate-50/80 p-4 flex items-center justify-between gap-2.5">
        <button
          onClick={() => openLinkModal(entity.id)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-300/80 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition cursor-pointer"
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
          className="rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-rose-700 hover:bg-rose-100 transition cursor-pointer"
          title="Delete entity"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
};
