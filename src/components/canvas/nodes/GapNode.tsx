import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { AlertCircle, Flame } from 'lucide-react';
import { GapEntity } from '../../../types/research';
import { useResearchStore } from '../../../store/useResearchStore';

interface NodeProps {
  data: {
    entity: GapEntity;
  };
  selected?: boolean;
}

export const GapNode: React.FC<NodeProps> = ({ data, selected }) => {
  const { entity } = data;
  const highlighted = useResearchStore((s) => s.highlightedLineage);
  const isLineageActive =
    highlighted.activeNodeId === entity.id ||
    highlighted.upstreamNodeIds.includes(entity.id) ||
    highlighted.downstreamNodeIds.includes(entity.id);

  const impactStyles = {
    critical: 'bg-rose-50 text-rose-700 border-rose-200',
    high: 'bg-amber-50 text-amber-700 border-amber-200',
    medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    low: 'bg-slate-50 text-slate-600 border-slate-200',
  };

  return (
    <div
      id={`node-${entity.id}`}
      className={`group relative w-80 rounded-xl border-2 bg-white/95 p-4 shadow-sm backdrop-blur transition-all duration-150 ${
        selected
          ? 'border-amber-600 ring-4 ring-amber-100 shadow-md scale-[1.02]'
          : isLineageActive
          ? 'border-amber-400 ring-2 ring-amber-50 shadow-sm'
          : 'border-amber-200 hover:border-amber-400 hover:shadow'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-amber-500 !border-white !w-3 !h-3"
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-amber-50 pb-2.5">
        <div className="flex items-center gap-1.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-100 text-amber-800">
            <AlertCircle className="h-3.5 w-3.5" />
          </div>
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-amber-950">
            {entity.code}
          </span>
          <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 uppercase">
            Gap
          </span>
        </div>
        <div className="flex items-center gap-1">
          {entity.impactLevel === 'critical' && (
            <Flame className="h-3.5 w-3.5 text-rose-500" />
          )}
          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize ${
              impactStyles[entity.impactLevel] || impactStyles.medium
            }`}
          >
            {entity.impactLevel}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="mt-2.5">
        <h4 className="line-clamp-2 text-xs font-medium leading-snug text-slate-900">
          {entity.title}
        </h4>
        <p className="mt-1.5 line-clamp-3 text-[11px] leading-relaxed text-slate-600">
          {entity.description}
        </p>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-amber-500 !border-white !w-3 !h-3"
      />
    </div>
  );
};
