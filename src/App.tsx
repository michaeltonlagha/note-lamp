import { useState, useEffect, useCallback } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import BottomNav from '@/navigation/BottomNav';
import ToastHost from '@/components/ToastHost';
import ScriptureToolkit from '@/features/scripture/ScriptureToolkit';
import { SplashScreen } from '@/features/auth/SplashScreen';
import HomeDashboard from '@/features/dashboard/HomeDashboard';
import NotesEditor from '@/features/notes/NotesEditor';
import NoteDetail from '@/features/notes/NoteDetail';
import BibleReader from '@/features/bible/BibleReader';
import BibleSearch from '@/features/bible/BibleSearch';
import PdfReader from '@/features/pdf/PdfReader';
import PreacherMode from '@/features/preacher/PreacherMode';
import MyNotes from '@/features/library/MyNotes';
import FolderView from '@/features/library/FolderView';
import Settings from '@/features/settings/Settings';
import { BookOpen, Library, FolderOpen } from 'lucide-react';

export type Screen =
  | { name: 'home' }
  | { name: 'myNotes' }
  | { name: 'folderView'; folderId: string }
  | { name: 'bible' }
  | { name: 'search' }
  | { name: 'library' }
  | { name: 'settings' }
  | { name: 'editor'; noteId: string | null }
  | { name: 'noteDetail'; noteId: string }
  | { name: 'pdfReader'; pdfId: string }
  | { name: 'preacher'; noteId: string };

function AppContent() {
  const { isAuthed, tab, setTab } = useApp();
  const [screen, setScreen] = useState<Screen>({ name: 'home' });

  const navigate = useCallback((s: Screen) => {
    setScreen(s);
    window.scrollTo({ top: 0 });
  }, []);

  // Sync tab with primary screens
  useEffect(() => {
    if (screen.name === 'home') setTab('home');
    else if (screen.name === 'myNotes' || screen.name === 'folderView') setTab('notes');
    else if (screen.name === 'bible' || screen.name === 'search') setTab('bible');
    else if (screen.name === 'library') setTab('library');
    else if (screen.name === 'settings') setTab('settings');
  }, [screen, setTab]);

  // Handle bottom nav taps
  useEffect(() => {
    if (tab === 'home' && screen.name !== 'home' && screen.name !== 'editor' && screen.name !== 'noteDetail' && screen.name !== 'pdfReader' && screen.name !== 'preacher' && screen.name !== 'search') {
      setScreen({ name: 'home' });
    } else if (tab === 'notes' && screen.name !== 'myNotes' && screen.name !== 'folderView' && screen.name !== 'editor' && screen.name !== 'noteDetail' && screen.name !== 'preacher') {
      setScreen({ name: 'myNotes' });
    } else if (tab === 'bible' && screen.name !== 'bible' && screen.name !== 'search') {
      setScreen({ name: 'bible' });
    } else if (tab === 'library' && screen.name !== 'library' && screen.name !== 'pdfReader') {
      setScreen({ name: 'library' });
    } else if (tab === 'settings' && screen.name !== 'settings') {
      setScreen({ name: 'settings' });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  if (!isAuthed) {
    return (
      <>
        <SplashScreen />
        <ToastHost />
      </>
    );
  }

  // Preacher mode is full-screen overlay, keep the screen beneath
  const renderScreen = () => {
    switch (screen.name) {
      case 'home': return <HomeDashboard navigate={navigate} />;
      case 'myNotes': return <MyNotes navigate={navigate} />;
      case 'folderView': return <FolderView navigate={navigate} folderId={screen.folderId} />;
      case 'bible': return <BibleReader navigate={navigate} />;
      case 'search': return <BibleSearch navigate={navigate} />;
      case 'library': return <LibraryScreen navigate={navigate} />;
      case 'settings': return <Settings navigate={navigate} />;
      case 'editor': return <NotesEditor navigate={navigate} noteId={screen.noteId} />;
      case 'noteDetail': return <NoteDetail navigate={navigate} noteId={screen.noteId} />;
      case 'pdfReader': return <PdfReader navigate={navigate} pdfId={screen.pdfId} />;
      default: return <HomeDashboard navigate={navigate} />;
    }
  };

  const isFullScreen = screen.name === 'preacher';

  return (
    <div className="min-h-screen bg-cloud-50 dark:bg-midnight-400">
      <div className="mx-auto max-w-md min-h-screen bg-cloud-50 dark:bg-midnight-400 relative">
        {renderScreen()}
        {/* Preacher mode as overlay */}
        {screen.name === 'preacher' && (
          <PreacherMode navigate={navigate} noteId={screen.noteId} />
        )}
        {/* Bottom nav hidden for preacher & pdf full-screen */}
        {screen.name !== 'preacher' && screen.name !== 'pdfReader' && <BottomNav />}
        {/* Scripture toolkit is globally available */}
        <ScriptureToolkit />
        <ToastHost />
      </div>
    </div>
  );
}

// Library screen — combines sermons and PDFs
function LibraryScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const { notes, pdfs, folders } = useApp();
  const sermons = notes.filter(n => n.isSermon);
  const bookNotes = notes.filter(n => n.category === 'Book Notes');

  return (
    <div className="min-h-screen pb-24">
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-midnight-400/95 backdrop-blur-lg border-b border-cloud-200 dark:border-midnight-100">
        <div className="mx-auto max-w-md px-4 py-4">
          <h1 className="text-xl font-bold text-slate2-900 dark:text-white">Library</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Sermons, PDFs and collections</p>
        </div>
      </div>

      <div className="mx-auto max-w-md px-4 pt-4 space-y-6">
        {/* Sermons section */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <BookOpen size={18} className="text-indigo-royal dark:text-indigo-300" />
            <h2 className="font-bold text-slate2-900 dark:text-white">Sermons</h2>
            <span className="text-xs text-slate-400">({sermons.length})</span>
          </div>
          <div className="space-y-3">
            {sermons.map(n => (
              <button
                key={n.id}
                onClick={() => navigate({ name: 'noteDetail', noteId: n.id })}
                className="card p-4 w-full text-left hover:shadow-card transition active:scale-[0.98]"
              >
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-royal text-white shrink-0">
                    <BookOpen size={18} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-slate2-900 dark:text-white truncate">{n.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{new Date(n.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                    {n.scriptures.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {n.scriptures.slice(0, 3).map(s => (
                          <span key={s} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-cloud-100 dark:bg-midnight-300 text-indigo-royal dark:text-indigo-300">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* PDFs section */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <FolderOpen size={18} className="text-coral-500" />
            <h2 className="font-bold text-slate2-900 dark:text-white">PDF Sermons</h2>
            <span className="text-xs text-slate-400">({pdfs.length})</span>
          </div>
          <div className="space-y-3">
            {pdfs.map(p => (
              <button
                key={p.id}
                onClick={() => navigate({ name: 'pdfReader', pdfId: p.id })}
                className="card p-4 w-full text-left hover:shadow-card transition active:scale-[0.98]"
              >
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-coral-50 dark:bg-coral-600/20 text-coral-600 shrink-0">
                    <Library size={18} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-slate2-900 dark:text-white truncate">{p.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{p.author} · {p.pageCount} pages</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Folders overview */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <FolderOpen size={18} className="text-teal-500" />
            <h2 className="font-bold text-slate2-900 dark:text-white">Folders</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {folders.map(f => (
              <button
                key={f.id}
                onClick={() => navigate({ name: 'folderView', folderId: f.id })}
                className="card p-4 text-left hover:shadow-card transition active:scale-[0.98]"
              >
                <span className="flex items-center justify-center w-9 h-9 rounded-xl mb-2" style={{ backgroundColor: f.color + '20', color: f.color }}>
                  <FolderOpen size={16} />
                </span>
                <h3 className="font-semibold text-sm text-slate2-900 dark:text-white truncate">{f.name}</h3>
                <p className="text-xs text-slate-400">{notes.filter(n => n.folderId === f.id).length + pdfs.filter(p => p.folderId === f.id).length} items</p>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
