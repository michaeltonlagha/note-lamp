import type { ReactNode } from 'react';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children?: ReactNode;
  actions?: ReactNode;
}

export default function Dialog({ open, onClose, title, children, actions }: DialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-midnight-400/50 animate-fadeIn" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white dark:bg-midnight-200 rounded-3xl shadow-float animate-pop p-5">
        <h3 className="font-bold text-lg text-slate2-900 dark:text-white mb-3">{title}</h3>
        {children && <div className="mb-4">{children}</div>}
        {actions && <div className="flex gap-3">{actions}</div>}
      </div>
    </div>
  );
}
