import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { ShieldCheck, CheckCheck, AlertTriangle } from 'lucide-react';
import { ClaimEntity } from '../../../types/research';
import { useResearchStore } from '../../../store/useResearchStore';

interface NodeProps {
  data: {
    entity: ClaimEntity;
  };
  selected?: boolean;
}

export const ClaimNode: React.FC<NodeProps> = ({ data, selected }) => {
  const { entity } = data;
  const highlighted = useResearchStore((s) => s.highlightedLineage);
  const isLineageActive =
    highlighted.activeNodeId === entity.id ||
    highlighted.upstreamNodeIds.includes(entity.id) ||
    highlighted.downstreamNodeIds.includes(entity.id);

  const statusStyles = {
    verified: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    proposed: 'bg-blue-50 text-blue-800 border-blue-200',
    disputed: 'bg-rose-50 text-rose-800 border-rose-200',
    retracted: 'bg-slate-50 text-slate-500 border-slate-200',
  };

  return (
    <div
      id={`node-${entity.id}`}
      className={`group relative w-88 rounded-xl border-2 bg-white/95 p-4 shadow-sm backdrop-blur transition-all duration-150 ${
        selected
          ? 'border-emerald-600 ring-4 ring-emerald-100 shadow-md scale-[1.02]'
          : isLineageActive
          ? 'border-emerald-400 ring-2 ring-emerald-50 shadow-sm'
          : 'border-emerald-200 hover:border-emerald-400 hover:shadow'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-emerald-500 !border-white !w-3 !h-3"
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-emerald-50 pb-2.5">
        <div className="flex items-center gap-1.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-100 text-emerald-800">
            <ShieldCheck className="h-3.5 w-3.5" />
          </div>
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-emerald-950">
            {entity.code}
          </span>
          <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 uppercase">
            Claim
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[11px] font-bold text-emerald-700">
            {Math.round(entity.confidenceScore * 100)}% EV
          </span>
          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize ${
              statusStyles[entity.status] || statusStyles.verified
            }`}
          >
            {entity.status}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="mt-2.5">
        <h4 className="line-clamp-2 text-xs font-semibold leading-snug text-slate-900">
          {entity.title || entity.statement.slice(0, 50)}
        </h4>
        <p className="mt-1.5 line-clamp-3 text-[11px] leading-relaxed text-slate-600">
          {entity.statement}
        </p>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-emerald-500 !border-white !w-3 !h-3"
      />
    </div>
  );
};
