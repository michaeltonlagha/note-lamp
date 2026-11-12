import type { ReactNode } from 'react';
import { useEffect } from 'react';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

export default function BottomSheet({ open, onClose, children, title }: BottomSheetProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-midnight-400/50 animate-fadeIn" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-midnight-200 rounded-t-3xl shadow-float animate-slideUp max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-5 pt-4 pb-3 shrink-0">
          <div className="w-10 h-1.5 bg-cloud-200 dark:bg-midnight-100 rounded-full absolute left-1/2 -translate-x-1/2 top-2" />
          {title && <h3 className="font-bold text-slate2-900 dark:text-white mt-2">{title}</h3>}
        </div>
        <div className="overflow-y-auto px-5 pb-6 pt-1">{children}</div>
      </div>
    </div>
  );
}
