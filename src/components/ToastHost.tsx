import { useApp } from '@/context/AppContext';
import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react';

export default function ToastHost() {
  const { toasts, dismissToast } = useApp();
  if (toasts.length === 0) return null;
  return (
    <div className="fixed top-3 left-0 right-0 z-[100] flex flex-col items-center gap-2 px-4 pointer-events-none">
      {toasts.map(t => {
        const Icon = t.type === 'success' ? CheckCircle2 : t.type === 'error' ? AlertCircle : Info;
        const color = t.type === 'success' ? 'text-teal-500' : t.type === 'error' ? 'text-coral-500' : 'text-indigo-royal dark:text-indigo-300';
        return (
          <div
            key={t.id}
            className="animate-toastIn pointer-events-auto flex items-center gap-3 bg-white dark:bg-midnight-200 shadow-float rounded-xl px-4 py-3 max-w-sm w-full border border-cloud-200 dark:border-midnight-100"
          >
            <Icon size={20} className={color} />
            <span className="flex-1 text-sm text-slate2-900 dark:text-white">{t.message}</span>
            <button onClick={() => dismissToast(t.id)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
