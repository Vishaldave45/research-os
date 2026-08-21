import React from 'react';

export interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'sm',
  className = '',
}) => {
  const normalized = status.toLowerCase();

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';

  if (['active', 'open', 'supported', 'accepted', 'verified'].includes(normalized)) {
    colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
    dotColor = 'bg-emerald-500';
  } else if (['planned', 'draft'].includes(normalized)) {
    colorClasses = 'bg-slate-50 text-slate-600 border-slate-200';
    dotColor = 'bg-slate-400';
  } else if (['running', 'testing'].includes(normalized)) {
    colorClasses = 'bg-blue-50 text-blue-700 border-blue-200/80';
    dotColor = 'bg-blue-500 animate-pulse';
  } else if (['completed', 'resolved'].includes(normalized)) {
    colorClasses = 'bg-indigo-50 text-indigo-700 border-indigo-200/80';
    dotColor = 'bg-indigo-500';
  } else if (['failed', 'refuted', 'rejected', 'retracted', 'critical'].includes(normalized)) {
    colorClasses = 'bg-rose-50 text-rose-700 border-rose-200/80';
    dotColor = 'bg-rose-500';
  } else if (['high', 'contested', 'pivoted'].includes(normalized)) {
    colorClasses = 'bg-amber-50 text-amber-700 border-amber-200/80';
    dotColor = 'bg-amber-500';
  } else if (['archived', 'deprecated', 'abandoned'].includes(normalized)) {
    colorClasses = 'bg-slate-100 text-slate-500 border-slate-200';
    dotColor = 'bg-slate-400';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium capitalize select-none ${colorClasses} ${sizeClasses} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
      <span>{status}</span>
    </span>
  );
};
