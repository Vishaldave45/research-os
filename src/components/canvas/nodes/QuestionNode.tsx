import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { HelpCircle, Sparkles } from 'lucide-react';
import { ResearchQuestionEntity } from '../../../types/research';
import { useResearchStore } from '../../../store/useResearchStore';

interface NodeProps {
  data: {
    entity: ResearchQuestionEntity;
  };
  selected?: boolean;
}

export const QuestionNode: React.FC<NodeProps> = ({ data, selected }) => {
  const { entity } = data;
  const highlighted = useResearchStore((s) => s.highlightedLineage);
  const isLineageActive =
    highlighted.activeNodeId === entity.id ||
    highlighted.upstreamNodeIds.includes(entity.id) ||
    highlighted.downstreamNodeIds.includes(entity.id);

  const statusColors = {
    open: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    active: 'bg-purple-50 text-purple-700 border-purple-200',
    resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    archived: 'bg-slate-50 text-slate-600 border-slate-200',
  };

  return (
    <div
      id={`node-${entity.id}`}
      className={`group relative w-80 rounded-xl border-2 bg-white/95 p-4 shadow-sm backdrop-blur transition-all duration-150 ${
        selected
          ? 'border-indigo-600 ring-4 ring-indigo-100 shadow-md scale-[1.02]'
          : isLineageActive
          ? 'border-indigo-400 ring-2 ring-indigo-50 shadow-sm'
          : 'border-indigo-200 hover:border-indigo-400 hover:shadow'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-indigo-500 !border-white !w-3 !h-3"
      />
      
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-indigo-50 pb-2.5">
        <div className="flex items-center gap-1.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-100 text-indigo-700">
            <HelpCircle className="h-3.5 w-3.5" />
          </div>
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-indigo-900">
            {entity.code}
          </span>
          <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-600 uppercase">
            Question
          </span>
        </div>
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize ${
            statusColors[entity.status] || statusColors.open
          }`}
        >
          {entity.status}
        </span>
      </div>

      {/* Body */}
      <div className="mt-2.5">
        <h4 className="line-clamp-3 text-xs font-medium leading-relaxed text-slate-900">
          {entity.title}
        </h4>
        {entity.metadata?.clinicalTarget && (
          <div className="mt-2 flex items-center gap-1 rounded bg-slate-50 px-2 py-1 text-[10px] text-slate-600">
            <Sparkles className="h-3 w-3 text-indigo-500 shrink-0" />
            <span className="truncate">{entity.metadata.clinicalTarget}</span>
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-indigo-500 !border-white !w-3 !h-3"
      />
    </div>
  );
};
