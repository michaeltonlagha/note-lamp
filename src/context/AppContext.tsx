import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { sampleNotes, samplePdfs, folders as initialFolders, type NoteItem, type PdfItem, type Folder } from '@/data/sampleData';

export type Tab = 'home' | 'notes' | 'bible' | 'library' | 'settings';
export type Theme = 'light' | 'dark';
export type Translation = 'KJV' | 'NKJV' | 'ESV' | 'NIV' | 'NLT';

export interface ScriptureToolkitState {
  open: boolean;
  reference: string;
}

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface AppContextValue {
  // Theme
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
  fontSize: number;
  setFontSize: (n: number) => void;
  translation: Translation;
  setTranslation: (t: Translation) => void;

  // Auth
  isAuthed: boolean;
  signIn: (email: string) => void;
  signOut: () => void;
  userEmail: string;

  // Navigation
  tab: Tab;
  setTab: (t: Tab) => void;

  // Notes
  notes: NoteItem[];
  addNote: (n: Omit<NoteItem, 'id'>) => string;
  updateNote: (id: string, patch: Partial<NoteItem>) => void;
  deleteNote: (id: string) => void;
  getNote: (id: string) => NoteItem | undefined;

  // Folders
  folders: Folder[];
  addFolder: (name: string) => void;
  renameFolder: (id: string, name: string) => void;
  deleteFolder: (id: string) => void;

  // PDFs
  pdfs: PdfItem[];
  getPdf: (id: string) => PdfItem | undefined;

  // Bookmarks
  bookmarks: string[];
  toggleBookmark: (ref: string) => void;

  // Scripture toolkit
  scriptureToolkit: ScriptureToolkitState;
  openScripture: (reference: string) => void;
  closeScripture: () => void;

  // Toasts
  toasts: Toast[];
  showToast: (message: string, type?: Toast['type']) => void;
  dismissToast: (id: number) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_KEY = 'notelamp-state-v1';

interface PersistedState {
  theme: Theme;
  fontSize: number;
  translation: Translation;
  isAuthed: boolean;
  userEmail: string;
  notes: NoteItem[];
  folders: Folder[];
  pdfs: PdfItem[];
  bookmarks: string[];
}

function loadState(): Partial<PersistedState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as PersistedState;
  } catch {
    return {};
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const persisted = loadState();

  const [theme, setThemeState] = useState<Theme>(persisted.theme ?? 'light');
  const [fontSize, setFontSize] = useState<number>(persisted.fontSize ?? 16);
  const [translation, setTranslation] = useState<Translation>(persisted.translation ?? 'KJV');
  const [isAuthed, setIsAuthed] = useState<boolean>(persisted.isAuthed ?? false);
  const [userEmail, setUserEmail] = useState<string>(persisted.userEmail ?? '');
  const [tab, setTab] = useState<Tab>('home');
  const [notes, setNotes] = useState<NoteItem[]>(persisted.notes ?? sampleNotes);
  const [folders, setFolders] = useState<Folder[]>(persisted.folders ?? initialFolders);
  const [pdfs, setPdfs] = useState<PdfItem[]>(persisted.pdfs ?? samplePdfs);
  const [bookmarks, setBookmarks] = useState<string[]>(persisted.bookmarks ?? []);
  const [scriptureToolkit, setScriptureToolkit] = useState<ScriptureToolkitState>({ open: false, reference: '' });
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [theme]);

  useEffect(() => {
    const state: PersistedState = { theme, fontSize, translation, isAuthed, userEmail, notes, folders, pdfs, bookmarks };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [theme, fontSize, translation, isAuthed, userEmail, notes, folders, pdfs, bookmarks]);

  const toggleTheme = useCallback(() => setThemeState(t => (t === 'light' ? 'dark' : 'light')), []);
  const setTheme = useCallback((t: Theme) => setThemeState(t), []);

  const signIn = useCallback((email: string) => {
    setUserEmail(email);
    setIsAuthed(true);
  }, []);
  const signOut = useCallback(() => {
    setIsAuthed(false);
    setTab('home');
  }, []);

  const addNote = useCallback((n: Omit<NoteItem, 'id'>) => {
    const id = 'n' + Date.now();
    setNotes(prev => [{ ...n, id }, ...prev]);
    return id;
  }, []);
  const updateNote = useCallback((id: string, patch: Partial<NoteItem>) => {
    setNotes(prev => prev.map(n => (n.id === id ? { ...n, ...patch } : n)));
  }, []);
  const deleteNote = useCallback((id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  }, []);
  const getNote = useCallback((id: string) => notes.find(n => n.id === id), [notes]);

  const addFolder = useCallback((name: string) => {
    const colors = ['#2929D8', '#13A89E', '#FF5B55', '#8257E5', '#4169FF'];
    setFolders(prev => [...prev, { id: 'f' + Date.now(), name, color: colors[prev.length % colors.length] }]);
  }, []);
  const renameFolder = useCallback((id: string, name: string) => {
    setFolders(prev => prev.map(f => (f.id === id ? { ...f, name } : f)));
  }, []);
  const deleteFolder = useCallback((id: string) => {
    setFolders(prev => prev.filter(f => f.id !== id));
    setNotes(prev => prev.map(n => (n.folderId === id ? { ...n, folderId: 'f1' } : n)));
  }, []);

  const getPdf = useCallback((id: string) => pdfs.find(p => p.id === id), [pdfs]);

  const toggleBookmark = useCallback((ref: string) => {
    setBookmarks(prev => (prev.includes(ref) ? prev.filter(r => r !== ref) : [...prev, ref]));
  }, []);

  const openScripture = useCallback((reference: string) => {
    setScriptureToolkit({ open: true, reference });
  }, []);
  const closeScripture = useCallback(() => {
    setScriptureToolkit(s => ({ ...s, open: false }));
  }, []);

  const showToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2800);
  }, []);
  const dismissToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const value: AppContextValue = {
    theme, toggleTheme, setTheme, fontSize, setFontSize, translation, setTranslation,
    isAuthed, signIn, signOut, userEmail,
    tab, setTab,
    notes, addNote, updateNote, deleteNote, getNote,
    folders, addFolder, renameFolder, deleteFolder,
    pdfs, getPdf,
    bookmarks, toggleBookmark,
    scriptureToolkit, openScripture, closeScripture,
    toasts, showToast, dismissToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
