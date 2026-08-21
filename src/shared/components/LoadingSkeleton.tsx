import React from 'react';

export interface LoadingSkeletonProps {
  count?: number;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  count = 3,
  className = '',
}) => {
  return (
    <div className={`space-y-4 animate-pulse ${className}`}>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 w-1/3 rounded-md bg-slate-200" />
            <div className="h-4 w-16 rounded-full bg-slate-200" />
          </div>
          <div className="space-y-2">
            <div className="h-3.5 w-full rounded-md bg-slate-100" />
            <div className="h-3.5 w-4/5 rounded-md bg-slate-100" />
          </div>
          <div className="mt-4 flex items-center gap-4">
            <div className="h-3 w-20 rounded-md bg-slate-200" />
            <div className="h-3 w-24 rounded-md bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
};
