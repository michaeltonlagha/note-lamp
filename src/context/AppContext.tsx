import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react';
import { supabase, type Session } from '@/services/supabase';
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

interface AuthResult {
  error: string | null;
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
  authLoading: boolean;
  userEmail: string;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => void;

  // Navigation
  tab: Tab;
  setTab: (t: Tab) => void;

  // Notes
  notes: NoteItem[];
  addNote: (n: Omit<NoteItem, 'id'>) => Promise<string>;
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

const PREFS_KEY = 'notelamp-prefs-v1';

interface LocalPrefs {
  theme: Theme;
  fontSize: number;
  translation: Translation;
}

function loadPrefs(): Partial<LocalPrefs> {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as LocalPrefs;
  } catch {
    return {};
  }
}

function mapNoteRow(row: Record<string, unknown>): NoteItem {
  return {
    id: row.id as string,
    title: row.title as string,
    body: row.body as string,
    date: row.date as string,
    category: row.category as NoteItem['category'],
    isSermon: row.is_sermon as boolean,
    type: row.type as 'note' | 'sermon',
    scriptures: (row.scriptures as string[]) ?? [],
    folderId: (row.folder_id as string) ?? 'f1',
  };
}

function mapFolderRow(row: Record<string, unknown>): Folder {
  return {
    id: row.id as string,
    name: row.name as string,
    color: row.color as string,
  };
}

function mapPdfRow(row: Record<string, unknown>): PdfItem {
  return {
    id: row.id as string,
    title: row.title as string,
    author: row.author as string,
    date: row.date as string,
    pageCount: row.page_count as number,
    excerpt: row.excerpt as string,
    scriptureRefs: (row.scripture_refs as string[]) ?? [],
    folderId: (row.folder_id as string) ?? 'f1',
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const prefs = loadPrefs();

  const [theme, setThemeState] = useState<Theme>(prefs.theme ?? 'light');
  const [fontSize, setFontSize] = useState<number>(prefs.fontSize ?? 16);
  const [translation, setTranslation] = useState<Translation>(prefs.translation ?? 'KJV');
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('home');
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [pdfs, setPdfs] = useState<PdfItem[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [scriptureToolkit, setScriptureToolkit] = useState<ScriptureToolkitState>({ open: false, reference: '' });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const seededRef = useRef(false);

  const isAuthed = !!session;
  const userEmail = session?.user?.email ?? '';

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [theme]);

  // Save preferences locally
  useEffect(() => {
    const local: LocalPrefs = { theme, fontSize, translation };
    try { localStorage.setItem(PREFS_KEY, JSON.stringify(local)); } catch { /* ignore */ }
  }, [theme, fontSize, translation]);

  // Sync preferences to Supabase when authed
  useEffect(() => {
    if (!session) return;
    (async () => {
      await supabase.from('user_preferences').upsert({
        user_id: session.user.id,
        theme,
        font_size: fontSize,
        translation,
      }, { onConflict: 'user_id' });
    })();
  }, [theme, fontSize, translation, session]);

  // Auth state listener + initial session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setAuthLoading(false);
    });

    return () => { listener.subscription.unsubscribe(); };
  }, []);

  // Load user data when session changes
  useEffect(() => {
    if (!session) {
      setNotes([]); setFolders([]); setPdfs([]); setBookmarks([]);
      seededRef.current = false;
      return;
    }

    (async () => {
      const userId = session.user.id;

      const [fRes, nRes, pRes, bRes, prefRes] = await Promise.all([
        supabase.from('folders').select('*').eq('user_id', userId).order('created_at'),
        supabase.from('notes').select('*').eq('user_id', userId).order('date', { ascending: false }),
        supabase.from('pdfs').select('*').eq('user_id', userId).order('created_at'),
        supabase.from('bookmarks').select('reference').eq('user_id', userId),
        supabase.from('user_preferences').select('*').eq('user_id', userId).maybeSingle(),
      ]);

      let userFolders = (fRes.data ?? []).map(mapFolderRow);
      const userNotes = (nRes.data ?? []).map(mapNoteRow);
      const userPdfs = (pRes.data ?? []).map(mapPdfRow);
      const userBookmarks = (bRes.data ?? []).map((r: Record<string, unknown>) => r.reference as string);

      // Load remote prefs if available
      if (prefRes.data) {
        const p = prefRes.data as Record<string, unknown>;
        if (p.theme) setThemeState(p.theme as Theme);
        if (p.font_size) setFontSize(p.font_size as number);
        if (p.translation) setTranslation(p.translation as Translation);
      }

      // Seed sample data for first-time users
      if (userFolders.length === 0 && userNotes.length === 0 && !seededRef.current) {
        seededRef.current = true;
        const folderInserts = initialFolders.map(f => ({ user_id: userId, name: f.name, color: f.color }));
        const { data: insertedFolders } = await supabase.from('folders').insert(folderInserts).select();
        userFolders = (insertedFolders ?? []).map(mapFolderRow);

        const folderIdMap = new Map<string, string>();
        userFolders.forEach((f, i) => {
          if (initialFolders[i]) folderIdMap.set(initialFolders[i].id, f.id);
        });

        const noteInserts = sampleNotes.map(n => ({
          user_id: userId,
          title: n.title,
          body: n.body,
          date: n.date,
          category: n.category,
          is_sermon: n.isSermon,
          type: n.type,
          scriptures: n.scriptures,
          folder_id: folderIdMap.get(n.folderId) ?? userFolders[0]?.id ?? null,
        }));
        await supabase.from('notes').insert(noteInserts);

        const pdfInserts = samplePdfs.map(p => ({
          user_id: userId,
          title: p.title,
          author: p.author,
          date: p.date,
          page_count: p.pageCount,
          excerpt: p.excerpt,
          scripture_refs: p.scriptureRefs,
          folder_id: folderIdMap.get(p.folderId) ?? null,
        }));
        await supabase.from('pdfs').insert(pdfInserts);

        // Re-fetch
        const [nRes2, pRes2] = await Promise.all([
          supabase.from('notes').select('*').eq('user_id', userId).order('date', { ascending: false }),
          supabase.from('pdfs').select('*').eq('user_id', userId).order('created_at'),
        ]);
        setNotes((nRes2.data ?? []).map(mapNoteRow));
        setPdfs((pRes2.data ?? []).map(mapPdfRow));
      } else {
        setNotes(userNotes);
        setPdfs(userPdfs);
      }

      setFolders(userFolders);
      setBookmarks(userBookmarks);
    })();
  }, [session]);

  const toggleTheme = useCallback(() => setThemeState(t => (t === 'light' ? 'dark' : 'light')), []);
  const setTheme = useCallback((t: Theme) => setThemeState(t), []);

  const signUp = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  }, []);

  const signOut = useCallback(() => {
    supabase.auth.signOut();
    setSession(null);
    setTab('home');
  }, []);

  const addNote = useCallback(async (n: Omit<NoteItem, 'id'>): Promise<string> => {
    if (!session) {
      const tempId = 'n' + Date.now();
      setNotes(prev => [{ ...n, id: tempId }, ...prev]);
      return tempId;
    }
    const { data, error } = await supabase.from('notes').insert({
      title: n.title,
      body: n.body,
      date: n.date,
      category: n.category,
      is_sermon: n.isSermon,
      type: n.type,
      scriptures: n.scriptures,
      folder_id: n.folderId,
    }).select().single();

    if (error || !data) {
      const tempId = 'n' + Date.now();
      setNotes(prev => [{ ...n, id: tempId }, ...prev]);
      return tempId;
    }
    const mapped = mapNoteRow(data as Record<string, unknown>);
    setNotes(prev => [mapped, ...prev]);
    return mapped.id;
  }, [session]);

  const updateNote = useCallback((id: string, patch: Partial<NoteItem>) => {
    setNotes(prev => prev.map(n => (n.id === id ? { ...n, ...patch } : n)));
    if (session) {
      const dbPatch: Record<string, unknown> = {};
      if (patch.title !== undefined) dbPatch.title = patch.title;
      if (patch.body !== undefined) dbPatch.body = patch.body;
      if (patch.category !== undefined) dbPatch.category = patch.category;
      if (patch.isSermon !== undefined) dbPatch.is_sermon = patch.isSermon;
      if (patch.type !== undefined) dbPatch.type = patch.type;
      if (patch.scriptures !== undefined) dbPatch.scriptures = patch.scriptures;
      if (patch.folderId !== undefined) dbPatch.folder_id = patch.folderId;
      supabase.from('notes').update(dbPatch).eq('id', id).then(() => {});
    }
  }, [session]);

  const deleteNote = useCallback((id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (session) supabase.from('notes').delete().eq('id', id).then(() => {});
  }, [session]);

  const getNote = useCallback((id: string) => notes.find(n => n.id === id), [notes]);

  const addFolder = useCallback((name: string) => {
    const colors = ['#2929D8', '#13A89E', '#FF5B55', '#8257E5', '#4169FF'];
    const color = colors[folders.length % colors.length];
    const tempId = 'f' + Date.now();
    setFolders(prev => [...prev, { id: tempId, name, color }]);
    if (session) {
      supabase.from('folders').insert({ name, color }).select().single().then(({ data }) => {
        if (data) {
          const realId = (data as Record<string, unknown>).id as string;
          setFolders(prev => prev.map(f => f.id === tempId ? { ...f, id: realId } : f));
        }
      });
    }
  }, [session, folders.length]);

  const renameFolder = useCallback((id: string, name: string) => {
    setFolders(prev => prev.map(f => (f.id === id ? { ...f, name } : f)));
    if (session) supabase.from('folders').update({ name }).eq('id', id).then(() => {});
  }, [session]);

  const deleteFolder = useCallback((id: string) => {
    setFolders(prev => prev.filter(f => f.id !== id));
    setNotes(prev => prev.map(n => (n.folderId === id ? { ...n, folderId: folders[0]?.id ?? '' } : n)));
    if (session) supabase.from('folders').delete().eq('id', id).then(() => {});
  }, [session, folders]);

  const getPdf = useCallback((id: string) => pdfs.find(p => p.id === id), [pdfs]);

  const toggleBookmark = useCallback((ref: string) => {
    setBookmarks(prev => {
      if (prev.includes(ref)) {
        if (session) supabase.from('bookmarks').delete().eq('reference', ref).then(() => {});
        return prev.filter(r => r !== ref);
      }
      if (session) supabase.from('bookmarks').insert({ reference: ref }).then(() => {});
      return [...prev, ref];
    });
  }, [session]);

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
    isAuthed, authLoading, userEmail, signUp, signIn, signOut,
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
