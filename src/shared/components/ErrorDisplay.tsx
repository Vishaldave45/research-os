import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  message,
  onRetry,
  isRetrying = false,
}) => {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-6 text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-3">
        <AlertCircle className="h-5 w-5" />
      </div>
      <h4 className="text-sm font-semibold text-rose-900">Unable to load data</h4>
      <p className="mt-1 text-xs text-rose-700 max-w-md mx-auto">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          disabled={isRetrying}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-rose-700 transition disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
          <span>{isRetrying ? 'Retrying...' : 'Try again'}</span>
        </button>
      )}
    </div>
  );
};
