import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Activity, Gauge, Zap, Thermometer } from 'lucide-react';
import { ResultEntity } from '../../../types/research';
import { useResearchStore } from '../../../store/useResearchStore';

interface NodeProps {
  data: {
    entity: ResultEntity;
  };
  selected?: boolean;
}

export const ResultNode: React.FC<NodeProps> = ({ data, selected }) => {
  const { entity } = data;
  const highlighted = useResearchStore((s) => s.highlightedLineage);
  const isLineageActive =
    highlighted.activeNodeId === entity.id ||
    highlighted.upstreamNodeIds.includes(entity.id) ||
    highlighted.downstreamNodeIds.includes(entity.id);

  const { metrics } = entity;

  return (
    <div
      id={`node-${entity.id}`}
      className={`group relative w-88 rounded-xl border-2 bg-white/95 p-4 shadow-sm backdrop-blur transition-all duration-150 ${
        selected
          ? 'border-cyan-600 ring-4 ring-cyan-100 shadow-md scale-[1.02]'
          : isLineageActive
          ? 'border-cyan-400 ring-2 ring-cyan-50 shadow-sm'
          : 'border-cyan-200 hover:border-cyan-400 hover:shadow'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-cyan-500 !border-white !w-3 !h-3"
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-cyan-50 pb-2.5">
        <div className="flex items-center gap-1.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-cyan-100 text-cyan-800">
            <Activity className="h-3.5 w-3.5" />
          </div>
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-cyan-950">
            {entity.code}
          </span>
          <span className="rounded bg-cyan-50 px-1.5 py-0.5 text-[10px] font-medium text-cyan-700 uppercase">
            Result
          </span>
        </div>
        <span className="rounded-full bg-cyan-50 border border-cyan-200 px-2 py-0.5 text-[10px] font-medium text-cyan-800 capitalize">
          {entity.status}
        </span>
      </div>

      {/* Metrics Strip */}
      {metrics && Object.keys(metrics).length > 0 && (
        <div className="mt-2.5 grid grid-cols-3 gap-1.5 rounded-lg bg-slate-50 p-2 text-center">
          {metrics.throughputFps !== undefined && (
            <div className="rounded bg-white p-1 shadow-xs">
              <div className="flex items-center justify-center gap-0.5 text-[9px] text-slate-500">
                <Gauge className="h-2.5 w-2.5 text-cyan-600" />
                <span>FPS</span>
              </div>
              <div className="font-mono text-xs font-bold text-slate-900">
                {metrics.throughputFps}
              </div>
            </div>
          )}
          {metrics.powerWatts !== undefined && (
            <div className="rounded bg-white p-1 shadow-xs">
              <div className="flex items-center justify-center gap-0.5 text-[9px] text-slate-500">
                <Zap className="h-2.5 w-2.5 text-amber-500" />
                <span>Power</span>
              </div>
              <div className="font-mono text-xs font-bold text-slate-900">
                {metrics.powerWatts}W
              </div>
            </div>
          )}
          {metrics.auc !== undefined && (
            <div className="rounded bg-white p-1 shadow-xs">
              <div className="text-[9px] text-slate-500">AUC</div>
              <div className="font-mono text-xs font-bold text-emerald-600">
                {metrics.auc}
              </div>
            </div>
          )}
          {metrics.maxTemperatureC !== undefined && (
            <div className="col-span-3 rounded bg-white p-1 shadow-xs flex items-center justify-between px-2">
              <div className="flex items-center gap-1 text-[10px] text-slate-600">
                <Thermometer className="h-3 w-3 text-rose-500" />
                <span>Peak Temp:</span>
              </div>
              <span className="font-mono text-xs font-bold text-slate-900">
                {metrics.maxTemperatureC}°C
              </span>
            </div>
          )}
        </div>
      )}

      {/* Body */}
      <div className="mt-2">
        <h4 className="line-clamp-2 text-xs font-medium leading-snug text-slate-900">
          {entity.title}
        </h4>
        <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-slate-600">
          {entity.summary}
        </p>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-cyan-500 !border-white !w-3 !h-3"
      />
    </div>
  );
};
