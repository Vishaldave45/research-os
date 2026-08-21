import React from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
} from '@xyflow/react';
import { Trash2 } from 'lucide-react';
import { useResearchStore } from '../../store/useResearchStore';
import { RelationType } from '../../types/research';

export const CustomEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  selected,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetPosition,
    targetX,
    targetY,
  });

  const deleteRelationship = useResearchStore((s) => s.deleteRelationship);
  const highlighted = useResearchStore((s) => s.highlightedLineage);

  const relationType = (data?.relationType as RelationType) || 'informs';
  const sourceId = data?.sourceId as string;
  const targetId = data?.targetId as string;

  const isLineageEdge =
    (highlighted.upstreamNodeIds.includes(sourceId) &&
      (highlighted.upstreamNodeIds.includes(targetId) || highlighted.activeNodeId === targetId)) ||
    (highlighted.downstreamNodeIds.includes(targetId) &&
      (highlighted.downstreamNodeIds.includes(sourceId) || highlighted.activeNodeId === sourceId));

  const isRefutes = relationType === 'refutes' || relationType === 'supersedes';
  const isSupports = relationType === 'supports' || relationType === 'validates';

  const badgeStyles: Record<string, string> = {
    cites: 'bg-blue-50 text-blue-700 border-blue-200',
    informs: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    motivates: 'bg-amber-50 text-amber-800 border-amber-200',
    addresses: 'bg-purple-50 text-purple-700 border-purple-200',
    tests: 'bg-rose-50 text-rose-700 border-rose-200',
    supports: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold',
    refutes: 'bg-red-50 text-red-800 border-red-300 font-semibold',
    derived_from: 'bg-teal-50 text-teal-800 border-teal-200',
    validates: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold',
    supersedes: 'bg-slate-50 text-slate-700 border-slate-300',
  };

  const edgeStroke = isRefutes
    ? '#e11d48'
    : isSupports
    ? '#059669'
    : selected
    ? '#4f46e5'
    : isLineageEdge
    ? '#6366f1'
    : '#94a3b8';

  const strokeWidth = selected || isLineageEdge ? 2.5 : 1.75;

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: edgeStroke,
          strokeWidth,
          strokeDasharray: isRefutes ? '4 4' : undefined,
          transition: 'stroke 0.2s, stroke-width 0.2s',
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan group flex items-center gap-1 rounded-full border bg-white/90 px-2 py-0.5 shadow-xs backdrop-blur transition-transform hover:scale-105"
        >
          <span
            className={`rounded-full border px-1.5 py-0.2 text-[9px] font-mono capitalize ${
              badgeStyles[relationType] || 'bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            {relationType.replace('_', ' ')}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteRelationship(id);
            }}
            title="Delete relationship edge"
            className="hidden h-3.5 w-3.5 items-center justify-center rounded-full text-slate-400 hover:bg-rose-100 hover:text-rose-600 group-hover:flex"
          >
            <Trash2 className="h-2.5 w-2.5" />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};
