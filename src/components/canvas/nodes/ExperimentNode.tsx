import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { FlaskConical, Cpu, CheckCircle } from 'lucide-react';
import { ExperimentEntity } from '../../../types/research';
import { useResearchStore } from '../../../store/useResearchStore';

interface NodeProps {
  data: {
    entity: ExperimentEntity;
  };
  selected?: boolean;
}

export const ExperimentNode: React.FC<NodeProps> = ({ data, selected }) => {
  const { entity } = data;
  const highlighted = useResearchStore((s) => s.highlightedLineage);
  const isLineageActive =
    highlighted.activeNodeId === entity.id ||
    highlighted.upstreamNodeIds.includes(entity.id) ||
    highlighted.downstreamNodeIds.includes(entity.id);

  const statusStyles = {
    completed: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    running: 'bg-rose-50 text-rose-800 border-rose-200 animate-pulse',
    planned: 'bg-slate-50 text-slate-700 border-slate-200',
    failed: 'bg-red-50 text-red-700 border-red-200',
    aborted: 'bg-slate-50 text-slate-500 border-slate-200',
  };

  return (
    <div
      id={`node-${entity.id}`}
      className={`group relative w-84 rounded-xl border-2 bg-white/95 p-4 shadow-sm backdrop-blur transition-all duration-150 ${
        selected
          ? 'border-rose-600 ring-4 ring-rose-100 shadow-md scale-[1.02]'
          : isLineageActive
          ? 'border-rose-400 ring-2 ring-rose-50 shadow-sm'
          : 'border-rose-200 hover:border-rose-400 hover:shadow'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-rose-500 !border-white !w-3 !h-3"
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-rose-50 pb-2.5">
        <div className="flex items-center gap-1.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-rose-100 text-rose-800">
            <FlaskConical className="h-3.5 w-3.5" />
          </div>
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-rose-950">
            {entity.code}
          </span>
          <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-medium text-rose-700 uppercase">
            Experiment
          </span>
        </div>
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize ${
            statusStyles[entity.status] || statusStyles.planned
          }`}
        >
          {entity.status}
        </span>
      </div>

      {/* Body */}
      <div className="mt-2.5">
        <h4 className="line-clamp-2 text-xs font-medium leading-snug text-slate-900">
          {entity.title}
        </h4>
        {entity.executionMetadata?.device && (
          <div className="mt-2 flex items-center gap-1.5 rounded bg-slate-50 px-2 py-1 text-[10px] text-slate-600">
            <Cpu className="h-3 w-3 text-rose-500 shrink-0" />
            <span className="truncate">{entity.executionMetadata.device}</span>
          </div>
        )}
        {entity.config?.architecture && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[9px] font-mono text-rose-800">
              {entity.config.architecture}
            </span>
            {entity.config.quantization && (
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-mono text-slate-700">
                {entity.config.quantization}
              </span>
            )}
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-rose-500 !border-white !w-3 !h-3"
      />
    </div>
  );
};
