import { ArrowLeft, Bell, Search } from 'lucide-react';
import type { ReactNode } from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  right?: ReactNode;
  showSearch?: boolean;
  onSearch?: () => void;
  showBell?: boolean;
  onBell?: () => void;
}

export default function Header({ title, subtitle, showBack, onBack, right, showSearch, onSearch, showBell, onBell }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-midnight-400/95 backdrop-blur-lg border-b border-cloud-200 dark:border-midnight-100">
      <div className="mx-auto max-w-md px-4 py-3.5 flex items-center gap-3">
        {showBack && (
          <button
            onClick={onBack}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-cloud-50 dark:bg-midnight-300 text-slate2-900 dark:text-white hover:bg-cloud-100 dark:hover:bg-midnight-200 transition"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-slate2-900 dark:text-white truncate">{title}</h1>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {showSearch && (
            <button
              onClick={onSearch}
              className="flex items-center justify-center w-9 h-9 rounded-xl bg-cloud-50 dark:bg-midnight-300 text-slate2-900 dark:text-white hover:bg-cloud-100 transition"
              aria-label="Search"
            >
              <Search size={18} />
            </button>
          )}
          {showBell && (
            <button
              onClick={onBell}
              className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-cloud-50 dark:bg-midnight-300 text-slate2-900 dark:text-white hover:bg-cloud-100 transition"
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-coral-500 rounded-full ring-2 ring-white dark:ring-midnight-300" />
            </button>
          )}
          {right}
        </div>
      </div>
    </header>
  );
}
