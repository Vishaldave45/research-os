import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClass =
    maxWidth === 'sm'
      ? 'max-w-md'
      : maxWidth === 'md'
      ? 'max-w-lg'
      : maxWidth === 'lg'
      ? 'max-w-2xl'
      : 'max-w-4xl';

  const modalContent = (
    <div
      id="shared-modal-overlay"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      {/* Backdrop click interceptor */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-0"
        aria-hidden="true"
      />

      {/* Modal Dialog Box */}
      <div
        role="dialog"
        aria-modal="true"
        className={`relative z-10 my-auto w-full ${maxWidthClass} max-h-[92vh] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all overflow-hidden animate-in zoom-in-95 duration-150`}
      >
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4.5 bg-slate-50/50 shrink-0">
          <div>
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            {description && (
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
};

