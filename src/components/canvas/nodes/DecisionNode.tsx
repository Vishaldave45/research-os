import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { GitCommit, CheckCheck, XCircle, Clock } from 'lucide-react';
import { DecisionEntity } from '../../../types/research';
import { useResearchStore } from '../../../store/useResearchStore';

interface NodeProps {
  data: {
    entity: DecisionEntity;
  };
  selected?: boolean;
}

export const DecisionNode: React.FC<NodeProps> = ({ data, selected }) => {
  const { entity } = data;
  const highlighted = useResearchStore((s) => s.highlightedLineage);
  const isLineageActive =
    highlighted.activeNodeId === entity.id ||
    highlighted.upstreamNodeIds.includes(entity.id) ||
    highlighted.downstreamNodeIds.includes(entity.id);

  const outcomeIcons = {
    accepted: <CheckCheck className="h-3.5 w-3.5 text-emerald-600" />,
    rejected: <XCircle className="h-3.5 w-3.5 text-rose-600" />,
    deferred: <Clock className="h-3.5 w-3.5 text-amber-600" />,
    superseded: <GitCommit className="h-3.5 w-3.5 text-slate-400" />,
  };

  const outcomeStyles = {
    accepted: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    rejected: 'bg-rose-50 text-rose-800 border-rose-200',
    deferred: 'bg-amber-50 text-amber-800 border-amber-200',
    superseded: 'bg-slate-50 text-slate-600 border-slate-200',
  };

  return (
    <div
      id={`node-${entity.id}`}
      className={`group relative w-88 rounded-xl border-2 bg-white/95 p-4 shadow-sm backdrop-blur transition-all duration-150 ${
        selected
          ? 'border-purple-600 ring-4 ring-purple-100 shadow-md scale-[1.02]'
          : isLineageActive
          ? 'border-purple-400 ring-2 ring-purple-50 shadow-sm'
          : 'border-purple-200 hover:border-purple-400 hover:shadow'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-purple-500 !border-white !w-3 !h-3"
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-purple-50 pb-2.5">
        <div className="flex items-center gap-1.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-100 text-purple-800">
            <GitCommit className="h-3.5 w-3.5" />
          </div>
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-purple-950">
            {entity.code}
          </span>
          <span className="rounded bg-purple-50 px-1.5 py-0.5 text-[10px] font-medium text-purple-700 uppercase">
            Decision
          </span>
        </div>
        <span
          className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize ${
            outcomeStyles[entity.outcome] || outcomeStyles.accepted
          }`}
        >
          {outcomeIcons[entity.outcome]}
          {entity.outcome}
        </span>
      </div>

      {/* Body */}
      <div className="mt-2.5">
        <h4 className="line-clamp-2 text-xs font-semibold leading-snug text-slate-900">
          {entity.title}
        </h4>
        <p className="mt-1.5 line-clamp-3 text-[11px] leading-relaxed text-slate-600">
          {entity.rationale}
        </p>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-purple-500 !border-white !w-3 !h-3"
      />
    </div>
  );
};
