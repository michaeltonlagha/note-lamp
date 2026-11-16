import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/services/supabase';
import { X, Download, Loader2, FileText, AlertCircle } from 'lucide-react';

interface ImportNoteModalProps {
  open: boolean;
  onClose: () => void;
  initialCode?: string;
}

export default function ImportNoteModal({ open, onClose, initialCode }: ImportNoteModalProps) {
  const { addNote, showToast } = useApp();
  const [code, setCode] = useState(initialCode ?? '');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<{ title: string; body: string; category: string; scriptures: string[]; is_sermon: boolean } | null>(null);
  const [error, setError] = useState('');

  const handleFetch = async () => {
    if (code.trim().length < 6) {
      setError('Enter a valid share code');
      return;
    }
    setLoading(true);
    setError('');
    setPreview(null);

    const { data, error: queryError } = await supabase
      .from('shared_notes')
      .select('title, body, category, scriptures, is_sermon, expires_at')
      .eq('code', code.trim().toUpperCase())
      .maybeSingle();

    setLoading(false);

    if (queryError || !data) {
      setError('Note not found. Check the code and try again.');
      return;
    }

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      setError('This share link has expired.');
      return;
    }

    setPreview({
      title: data.title,
      body: data.body,
      category: data.category,
      scriptures: data.scriptures ?? [],
      is_sermon: data.is_sermon,
    });
  };

  const handleImport = async () => {
    if (!preview) return;
    setLoading(true);
    const today = new Date().toISOString().slice(0, 10);
    const id = await addNote({
      title: preview.title,
      body: preview.body,
      date: today,
      category: preview.category as 'Sermon' | 'Bible Study' | 'Personal Reflection' | 'Book Notes',
      isSermon: preview.is_sermon,
      type: preview.is_sermon ? 'sermon' : 'note',
      scriptures: preview.scriptures,
      folderId: 'f1',
    });
    setLoading(false);
    showToast('Note imported successfully');
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-midnight-400/50 animate-fadeIn" />
      <div className="relative w-full max-w-sm bg-white dark:bg-midnight-200 rounded-3xl shadow-float p-6 animate-slideUp max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-electric-500 text-white">
              <Download size={18} />
            </span>
            <h2 className="font-bold text-slate2-900 dark:text-white">Import Note</h2>
          </div>
          <button onClick={onClose} className="flex items-center justify-center w-8 h-8 rounded-lg bg-cloud-50 dark:bg-midnight-300 text-slate-400 hover:text-slate-600 transition">
            <X size={18} />
          </button>
        </div>

        {!preview && (
          <div className="space-y-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Enter the 8-character share code from another NoteLamp user to import their note into your library.
            </p>
            <input
              type="text"
              value={code}
              onChange={e => { setCode(e.target.value.toUpperCase()); setError(''); }}
              onKeyDown={e => { if (e.key === 'Enter') handleFetch(); }}
              placeholder="e.g. AB3XK9QM"
              maxLength={8}
              className="w-full text-center text-2xl font-bold tracking-widest font-mono bg-cloud-50 dark:bg-midnight-300 border border-cloud-200 dark:border-midnight-100 rounded-xl px-4 py-3 text-slate2-900 dark:text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-royal/30 uppercase"
              autoFocus
            />
            {error && (
              <div className="flex items-center gap-2 text-sm text-coral-600 dark:text-coral-400">
                <AlertCircle size={16} /> {error}
              </div>
            )}
            <button
              onClick={handleFetch}
              disabled={loading || code.trim().length < 6}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
              {loading ? 'Searching...' : 'Find Note'}
            </button>
          </div>
        )}

        {preview && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-teal-600">
              <FileText size={18} />
              <span className="text-sm font-semibold">Note found! Preview below:</span>
            </div>
            <div className="rounded-2xl bg-cloud-50 dark:bg-midnight-300 border border-cloud-200 dark:border-midnight-100 p-4 space-y-2">
              <h3 className="font-bold text-slate2-900 dark:text-white">{preview.title || 'Untitled'}</h3>
              <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-royal/10 text-indigo-royal dark:text-indigo-300">{preview.category}</span>
              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-4 leading-relaxed">
                {preview.body.slice(0, 200)}
                {preview.body.length > 200 ? '...' : ''}
              </p>
              {preview.scriptures.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {preview.scriptures.slice(0, 4).map(s => (
                    <span key={s} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-cloud-100 dark:bg-midnight-200 text-indigo-royal dark:text-indigo-300">{s}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setPreview(null); setCode(''); }} className="btn-ghost flex-1">Cancel</button>
              <button onClick={handleImport} disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                Import
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
