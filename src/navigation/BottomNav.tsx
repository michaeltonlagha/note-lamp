import { Home, FolderOpen, BookOpen, Library, Settings } from 'lucide-react';
import { useApp, type Tab } from '@/context/AppContext';

const items: { tab: Tab; label: string; icon: typeof Home }[] = [
  { tab: 'home', label: 'Home', icon: Home },
  { tab: 'notes', label: 'Notes', icon: FolderOpen },
  { tab: 'bible', label: 'Bible', icon: BookOpen },
  { tab: 'library', label: 'Library', icon: Library },
  { tab: 'settings', label: 'Settings', icon: Settings },
];

export default function BottomNav() {
  const { tab, setTab } = useApp();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-midnight-300/95 backdrop-blur-lg border-t border-cloud-200 dark:border-midnight-100 safe-bottom">
      <div className="mx-auto max-w-md flex items-stretch justify-between px-2 py-1.5">
        {items.map(({ tab: t, label, icon: Icon }) => {
          const active = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 rounded-xl transition-all"
              aria-label={label}
            >
              <span
                className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all ${
                  active
                    ? 'bg-indigo-royal text-white shadow-indigo scale-105'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.4 : 2} />
              </span>
              <span
                className={`text-[10px] font-medium tracking-wide ${
                  active ? 'text-indigo-royal dark:text-indigo-300' : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
