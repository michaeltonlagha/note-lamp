import { useState, useRef, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import Header from '@/components/Header';
import { Bold, Italic, Underline, Heading, List, ListOrdered, Undo, Redo, Save, Eye, ChevronDown } from 'lucide-react';
import { parseReference, getVerseText } from '@/data/bibleData';
import type { Screen } from '@/App';

interface EditorProps {
  navigate: (s: Screen) => void;
  noteId: string | null;
}

const categories = ['Sermon', 'Bible Study', 'Personal Reflection', 'Book Notes'] as const;

export default function NotesEditor({ navigate, noteId }: EditorProps) {
  const { notes, addNote, updateNote, folders, showToast, openScripture } = useApp();
  const existing = noteId ? notes.find(n => n.id === noteId) : undefined;

  const [title, setTitle] = useState(existing?.title ?? '');
  const [body, setBody] = useState(existing?.body ?? '');
  const [category, setCategory] = useState<typeof categories[number]>(existing?.category ?? 'Sermon');
  const [folderId, setFolderId] = useState(existing?.folderId ?? folders[0]?.id ?? 'f1');
  const [showCat, setShowCat] = useState(false);
  const [showFolder, setShowFolder] = useState(false);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [preview, setPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const today = new Date().toISOString().slice(0, 10);

  // Detect Bible references in the body
  const detectedRefs = useMemo(() => {
    const lines = body.split('\n');
    const refs: { ref: string; text: string; line: number }[] = [];
    const refRegex = /\b((?:[1-3]\s)?(?:Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|Samuel|Kings|Chronicles|Ezra|Nehemiah|Esther|Job|Psalm|Psalms|Proverbs|Ecclesiastes|Song of Solomon|Isaiah|Jeremiah|Lamentations|Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Matthew|Mark|Luke|John|Acts|Romans|Corinthians|Galatians|Ephesians|Philippians|Colossians|Thessalonians|Timothy|Titus|Philemon|Hebrews|James|Peter|Jude|Revelation)\s+\d+:\d+(?:-\d+)?)/g;
    lines.forEach((line, i) => {
      let match;
      refRegex.lastIndex = 0;
      while ((match = refRegex.exec(line)) !== null) {
        const ref = match[1].replace(/\s+/g, ' ');
        const parsed = parseReference(ref);
        const text = parsed ? getVerseText(`${parsed.book} ${parsed.chapter}:${parsed.verse}`) : undefined;
        if (parsed) refs.push({ ref: `${parsed.book} ${parsed.chapter}:${parsed.verse}`, text: text ?? '', line: i });
      }
    });
    // dedupe
    const seen = new Set<string>();
    return refs.filter(r => { if (seen.has(r.ref)) return false; seen.add(r.ref); return true; });
  }, [body]);

  const pushUndo = (val: string) => {
    setUndoStack(prev => [...prev.slice(-30), val]);
    setRedoStack([]);
  };

  const insertAtCursor = (before: string, after: string = '') => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = body.slice(start, end);
    const newText = body.slice(0, start) + before + selected + after + body.slice(end);
    pushUndo(body);
    setBody(newText);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const insertLinePrefix = (prefix: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const lineStart = body.lastIndexOf('\n', start - 1) + 1;
    const newText = body.slice(0, lineStart) + prefix + body.slice(lineStart);
    pushUndo(body);
    setBody(newText);
    setTimeout(() => { ta.focus(); ta.setSelectionRange(start + prefix.length, start + prefix.length); }, 0);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    setRedoStack(prev => [...prev, body]);
    setBody(undoStack[undoStack.length - 1]);
    setUndoStack(prev => prev.slice(0, -1));
  };
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    setUndoStack(prev => [...prev, body]);
    setBody(redoStack[redoStack.length - 1]);
    setRedoStack(prev => prev.slice(0, -1));
  };

  const handleSave = () => {
    if (!title.trim()) {
      showToast('Please add a title before saving', 'error');
      return;
    }
    const scriptureList = detectedRefs.map(r => r.ref);
    const isSermon = category === 'Sermon';
    if (existing) {
      updateNote(existing.id, { title, body, category, scriptures: scriptureList, folderId, isSermon, type: isSermon ? 'sermon' : 'note' });
      showToast('Note updated');
    } else {
      const id = addNote({ title, body, date: today, category, scriptures: scriptureList, folderId, isSermon, type: isSermon ? 'sermon' : 'note' });
      showToast('Note saved');
      navigate({ name: 'noteDetail', noteId: id });
      return;
    }
    navigate({ name: 'noteDetail', noteId: existing.id });
  };

  const renderPreview = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('# ')) return <h1 key={i} className="text-xl font-bold text-slate2-900 dark:text-white mt-4 mb-2">{line.slice(2)}</h1>;
      if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-bold text-indigo-royal dark:text-indigo-300 mt-3 mb-1.5">{line.slice(3)}</h2>;
      if (line.startsWith('### ')) return <h3 key={i} className="text-base font-semibold text-slate2-900 dark:text-white mt-2 mb-1">{line.slice(4)}</h3>;
      if (line.startsWith('- ')) return <div key={i} className="flex gap-2 ml-3"><span className="text-indigo-royal">•</span><span className="text-slate2-900 dark:text-white">{renderInlineRef(line.slice(2))}</span></div>;
      if (/^\d+\.\s/.test(line)) return <div key={i} className="flex gap-2 ml-3"><span className="text-indigo-royal font-semibold">{line.match(/^(\d+\.)\s/)![1]}</span><span className="text-slate2-900 dark:text-white">{renderInlineRef(line.replace(/^\d+\.\s/, ''))}</span></div>;
      if (line.trim() === '') return <div key={i} className="h-3" />;
      if (line.startsWith('*') && line.endsWith('*')) return <p key={i} className="italic text-slate-500 dark:text-slate-400 text-sm mt-2">{renderInlineRef(line.slice(1, -1))}</p>;
      return <p key={i} className="text-slate2-900 dark:text-white">{renderInlineRef(line)}</p>;
    });
  };

  const renderInlineRef = (text: string) => {
    const parts = text.split(/(\b(?:[1-3]\s)?(?:Genesis|Exodus|Psalms?|Proverbs|Isaiah|Matthew|Mark|Luke|John|Acts|Romans|Corinthians|Galatians|Ephesians|Philippians|Colossians|Thessalonians|Timothy|Hebrews|James|Peter|Revelation|Chronicles|Lamentations|Ezekiel|Daniel|Hosea|Joel|Amos|Jonah|Micah|Habakkuk|Zechariah|Malachi|Numbers|Deuteronomy|Joshua|Judges|Ruth|Samuel|Kings|Ezra|Nehemiah|Esther|Job|Ecclesiastes|Song of Solomon|Obadiah|Nahum|Zephaniah|Haggai|Titus|Philemon|Jude)\s+\d+:\d+(?:-\d+)?)/g);
    return parts.map((part, i) => {
      const parsed = parseReference(part);
      if (parsed) {
        return (
          <button key={i} onClick={() => openScriptureRef(part)} className="sref hover:underline">
            {part}
          </button>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  const openScriptureRef = (ref: string) => {
    const parsed = parseReference(ref);
    if (parsed) openScripture(`${parsed.book} ${parsed.chapter}:${parsed.verse}`);
  };

  const insertVerseIntoBody = (ref: string, text: string) => {
    pushUndo(body);
    setBody(prev => prev + `\n\n*${ref} — "${text}"*\n`);
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="min-h-screen pb-24">
      <Header
        title={existing ? 'Edit Note' : 'New Note'}
        subtitle={formatDate(today)}
        showBack
        onBack={() => navigate({ name: 'home' })}
        right={
          <button onClick={() => setPreview(p => !p)} className={`flex items-center justify-center w-9 h-9 rounded-xl transition ${preview ? 'bg-indigo-royal text-white' : 'bg-cloud-50 dark:bg-midnight-300 text-slate2-900 dark:text-white'}`}>
            <Eye size={18} />
          </button>
        }
      />

      <div className="mx-auto max-w-md px-4 pt-4 space-y-4">
        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Sermon title"
          className="w-full text-2xl font-bold bg-transparent text-slate2-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none"
        />

        {/* Category + Folder selectors */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <button
              onClick={() => { setShowCat(s => !s); setShowFolder(false); }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-cloud-50 dark:bg-midnight-300 text-sm font-medium text-slate2-900 dark:text-white border border-cloud-200 dark:border-midnight-100"
            >
              {category}
              <ChevronDown size={16} className={showCat ? 'rotate-180 transition' : 'transition'} />
            </button>
            {showCat && (
              <div className="absolute top-full mt-1 left-0 right-0 z-20 bg-white dark:bg-midnight-200 rounded-xl shadow-float border border-cloud-200 dark:border-midnight-100 py-1">
                {categories.map(c => (
                  <button key={c} onClick={() => { setCategory(c); setShowCat(false); }} className={`w-full text-left px-3 py-2 text-sm hover:bg-cloud-50 dark:hover:bg-midnight-300 ${c === category ? 'text-indigo-royal dark:text-indigo-300 font-semibold' : 'text-slate2-900 dark:text-white'}`}>{c}</button>
                ))}
              </div>
            )}
          </div>
          <div className="relative flex-1">
            <button
              onClick={() => { setShowFolder(s => !s); setShowCat(false); }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-cloud-50 dark:bg-midnight-300 text-sm font-medium text-slate2-900 dark:text-white border border-cloud-200 dark:border-midnight-100"
            >
              {folders.find(f => f.id === folderId)?.name ?? 'Folder'}
              <ChevronDown size={16} className={showFolder ? 'rotate-180 transition' : 'transition'} />
            </button>
            {showFolder && (
              <div className="absolute top-full mt-1 left-0 right-0 z-20 bg-white dark:bg-midnight-200 rounded-xl shadow-float border border-cloud-200 dark:border-midnight-100 py-1">
                {folders.map(f => (
                  <button key={f.id} onClick={() => { setFolderId(f.id); setShowFolder(false); }} className={`w-full text-left px-3 py-2 text-sm hover:bg-cloud-50 dark:hover:bg-midnight-300 flex items-center gap-2 ${f.id === folderId ? 'text-indigo-royal dark:text-indigo-300 font-semibold' : 'text-slate2-900 dark:text-white'}`}>
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: f.color }} />
                    {f.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Formatting toolbar */}
        {!preview && (
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar bg-white dark:bg-midnight-200 rounded-xl p-1.5 border border-cloud-200 dark:border-midnight-100 sticky top-[68px] z-20">
            {[
              { icon: Bold, action: () => insertAtCursor('**', '**') },
              { icon: Italic, action: () => insertAtCursor('*', '*') },
              { icon: Underline, action: () => insertAtCursor('<u>', '</u>') },
              { icon: Heading, action: () => insertLinePrefix('## ') },
              { icon: List, action: () => insertLinePrefix('- ') },
              { icon: ListOrdered, action: () => insertLinePrefix('1. ') },
            ].map(({ icon: Icon, action }, i) => (
              <button key={i} onClick={action} className="flex items-center justify-center w-8 h-8 rounded-lg text-slate2-900 dark:text-white hover:bg-cloud-100 dark:hover:bg-midnight-300 transition shrink-0">
                <Icon size={16} />
              </button>
            ))}
            <div className="w-px h-5 bg-cloud-200 dark:bg-midnight-100 mx-1 shrink-0" />
            <button onClick={handleUndo} disabled={undoStack.length === 0} className="flex items-center justify-center w-8 h-8 rounded-lg text-slate2-900 dark:text-white hover:bg-cloud-100 dark:hover:bg-midnight-300 transition disabled:opacity-30 shrink-0">
              <Undo size={16} />
            </button>
            <button onClick={handleRedo} disabled={redoStack.length === 0} className="flex items-center justify-center w-8 h-8 rounded-lg text-slate2-900 dark:text-white hover:bg-cloud-100 dark:hover:bg-midnight-300 transition disabled:opacity-30 shrink-0">
              <Redo size={16} />
            </button>
          </div>
        )}

        {/* Body / Preview */}
        {preview ? (
          <div className="reading-prose bg-white dark:bg-midnight-200 rounded-2xl border border-cloud-200 dark:border-midnight-100 p-5 min-h-[300px]">
            {body.trim() ? renderPreview(body) : <p className="text-slate-400 italic">Nothing to preview yet.</p>}
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={body}
            onChange={e => { pushUndo(body); setBody(e.target.value); }}
            placeholder="Start writing your sermon... Type a Bible reference like John 3:16 to see an instant Scripture preview."
            className="w-full bg-white dark:bg-midnight-200 rounded-2xl border border-cloud-200 dark:border-midnight-100 p-5 min-h-[300px] text-slate2-900 dark:text-white text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-royal/30 resize-none font-sans"
          />
        )}

        {/* Scripture preview cards */}
        {detectedRefs.length > 0 && !preview && (
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-royal dark:text-indigo-300">Detected Scripture</p>
            {detectedRefs.map((r, i) => (
              <div key={i} className="rounded-2xl border border-indigo-200 dark:border-indigo-800/50 bg-indigo-50/60 dark:bg-indigo-900/20 p-4 animate-fadeIn">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-indigo-royal dark:text-indigo-300">{r.ref}</span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-royal/10 text-indigo-royal dark:text-indigo-300">KJV</span>
                </div>
                <p className="reading-prose text-sm text-slate2-900 dark:text-white leading-relaxed">
                  {r.text || <span className="text-slate-400 italic">Verse text will appear here when the full offline Bible is installed.</span>}
                </p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => openScriptureRef(r.ref)} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-royal text-white">Open</button>
                  <button onClick={() => insertVerseIntoBody(r.ref, r.text)} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-cloud-100 dark:bg-midnight-300 text-slate2-900 dark:text-white">Insert</button>
                  <button onClick={() => { if (r.text) { navigator.clipboard.writeText(`${r.ref} — ${r.text}`).catch(()=>{}); showToast('Copied'); } }} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-cloud-100 dark:bg-midnight-300 text-slate2-900 dark:text-white">Copy</button>
                  <button onClick={() => openScriptureRef(r.ref)} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-cloud-100 dark:bg-midnight-300 text-slate2-900 dark:text-white">More</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Save button */}
        <button onClick={handleSave} className="btn-primary w-full flex items-center justify-center gap-2 sticky bottom-20">
          <Save size={18} /> Save Note
        </button>
      </div>
    </div>
  );
}
