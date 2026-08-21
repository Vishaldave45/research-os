import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { BookOpen, ExternalLink } from 'lucide-react';
import { PaperEntity } from '../../../types/research';
import { useResearchStore } from '../../../store/useResearchStore';

interface NodeProps {
  data: {
    entity: PaperEntity;
  };
  selected?: boolean;
}

export const PaperNode: React.FC<NodeProps> = ({ data, selected }) => {
  const { entity } = data;
  const highlighted = useResearchStore((s) => s.highlightedLineage);
  const isLineageActive =
    highlighted.activeNodeId === entity.id ||
    highlighted.upstreamNodeIds.includes(entity.id) ||
    highlighted.downstreamNodeIds.includes(entity.id);

  return (
    <div
      id={`node-${entity.id}`}
      className={`group relative w-80 rounded-xl border-2 bg-white/95 p-4 shadow-sm backdrop-blur transition-all duration-150 ${
        selected
          ? 'border-blue-600 ring-4 ring-blue-100 shadow-md scale-[1.02]'
          : isLineageActive
          ? 'border-blue-400 ring-2 ring-blue-50 shadow-sm'
          : 'border-blue-200 hover:border-blue-400 hover:shadow'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-blue-500 !border-white !w-3 !h-3"
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-blue-50 pb-2.5">
        <div className="flex items-center gap-1.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-100 text-blue-700">
            <BookOpen className="h-3.5 w-3.5" />
          </div>
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-blue-900">
            {entity.code}
          </span>
          <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-600 uppercase">
            Paper
          </span>
        </div>
        {entity.year && (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
            {entity.year}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="mt-2.5">
        <h4 className="line-clamp-2 text-xs font-medium leading-snug text-slate-900">
          {entity.title}
        </h4>
        <p className="mt-1.5 line-clamp-1 text-[11px] text-slate-500">
          {entity.authors?.slice(0, 2).join(', ')}
          {entity.authors?.length > 2 ? ' et al.' : ''}
        </p>
        {entity.venue && (
          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
            <span className="truncate max-w-[200px] italic">{entity.venue}</span>
            {entity.citationCount !== undefined && (
              <span className="font-mono text-slate-600">
                {entity.citationCount} cites
              </span>
            )}
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-blue-500 !border-white !w-3 !h-3"
      />
    </div>
  );
};
