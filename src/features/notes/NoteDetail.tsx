import { useApp } from '@/context/AppContext';
import Header from '@/components/Header';
import { parseReference } from '@/data/bibleData';
import { Mic, Pencil, Trash2, BookOpen, Calendar, Tag, ChevronRight, Plus } from 'lucide-react';
import { useState } from 'react';
import Dialog from '@/components/Dialog';
import EmptyState from '@/components/EmptyState';
import type { Screen } from '@/App';

interface NoteDetailProps {
  navigate: (s: Screen) => void;
  noteId: string;
}

export default function NoteDetail({ navigate, noteId }: NoteDetailProps) {
  const { getNote, openScripture, deleteNote, showToast, folders, updateNote } = useApp();
  const note = getNote(noteId);
  const [showDelete, setShowDelete] = useState(false);
  const [showMove, setShowMove] = useState(false);

  if (!note) {
    return (
      <div className="min-h-screen pb-24">
        <Header title="Note" showBack onBack={() => navigate({ name: 'myNotes' })} />
        <EmptyState icon={<BookOpen size={28} />} title="Note not found" />
      </div>
    );
  }

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const folder = folders.find(f => f.id === note.folderId);

  const renderContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      if (line.startsWith('# ')) return <h1 key={i} className="text-xl font-bold text-slate2-900 dark:text-white mt-5 mb-2">{line.slice(2)}</h1>;
      if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-bold text-indigo-royal dark:text-indigo-300 mt-4 mb-1.5">{line.slice(3)}</h2>;
      if (line.startsWith('### ')) return <h3 key={i} className="text-base font-semibold text-slate2-900 dark:text-white mt-3 mb-1">{line.slice(4)}</h3>;
      if (line.startsWith('- ')) return <div key={i} className="flex gap-2 ml-3 my-1"><span className="text-indigo-royal dark:text-indigo-300">•</span><span className="text-slate2-900 dark:text-white">{renderRefs(line.slice(2))}</span></div>;
      if (/^\d+\.\s/.test(line)) return <div key={i} className="flex gap-2 ml-3 my-1"><span className="text-indigo-royal dark:text-indigo-300 font-semibold">{line.match(/^(\d+\.)\s/)![1]}</span><span className="text-slate2-900 dark:text-white">{renderRefs(line.replace(/^\d+\.\s/, ''))}</span></div>;
      if (line.trim() === '') return <div key={i} className="h-3" />;
      if (line.startsWith('*') && line.endsWith('*')) return <p key={i} className="italic text-slate-500 dark:text-slate-400 text-sm mt-2 border-l-2 border-indigo-royal/30 pl-3">{renderRefs(line.slice(1, -1))}</p>;
      return <p key={i} className="text-slate2-900 dark:text-white leading-relaxed">{renderRefs(line)}</p>;
    });
  };

  const renderRefs = (text: string) => {
    const refRegex = /\b((?:[1-3]\s)?(?:Genesis|Exodus|Psalms?|Proverbs|Isaiah|Matthew|Mark|Luke|John|Acts|Romans|Corinthians|Galatians|Ephesians|Philippians|Colossians|Thessalonians|Timothy|Hebrews|James|Peter|Revelation|Chronicles|Daniel|Ezekiel|Jeremiah|Jonah|Micah|Habakkuk|Zechariah|Malachi|Numbers|Deuteronomy|Joshua|Judges|Samuel|Kings|Nehemiah|Job|Ecclesiastes|Hosea|Joel|Amos|Titus|Philemon|Jude)\s+\d+:\d+(?:-\d+)?)/g;
    const parts = text.split(refRegex);
    return parts.map((part, i) => {
      const parsed = parseReference(part);
      if (parsed) {
        return (
          <button key={i} onClick={() => openScripture(`${parsed.book} ${parsed.chapter}:${parsed.verse}`)} className="sref hover:underline">
            {part}
          </button>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  const handleDelete = () => {
    deleteNote(noteId);
    showToast('Note deleted');
    navigate({ name: 'myNotes' });
  };

  return (
    <div className="min-h-screen pb-24">
      <Header
        title={note.title}
        showBack
        onBack={() => navigate({ name: 'myNotes' })}
        right={
          <div className="flex items-center gap-2">
            <button onClick={() => navigate({ name: 'editor', noteId })} className="flex items-center justify-center w-9 h-9 rounded-xl bg-cloud-50 dark:bg-midnight-300 text-slate2-900 dark:text-white hover:bg-cloud-100 transition" aria-label="Edit">
              <Pencil size={16} />
            </button>
            <button onClick={() => setShowDelete(true)} className="flex items-center justify-center w-9 h-9 rounded-xl bg-cloud-50 dark:bg-midnight-300 text-coral-600 hover:bg-coral-50 dark:hover:bg-coral-600/20 transition" aria-label="Delete">
              <Trash2 size={16} />
            </button>
          </div>
        }
      />

      <div className="mx-auto max-w-md px-4 pt-4 space-y-5">
        {/* Title and meta */}
        <div>
          <h1 className="text-2xl font-bold text-slate2-900 dark:text-white leading-tight">{note.title}</h1>
          <div className="flex items-center flex-wrap gap-3 mt-2">
            <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Calendar size={13} /> {formatDate(note.date)}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Tag size={13} /> {note.category}
            </span>
            {folder && (
              <button onClick={() => setShowMove(true)} className="flex items-center gap-1.5 text-xs text-indigo-royal dark:text-indigo-300 font-medium">
                <BookOpen size={13} /> {folder.name} <ChevronRight size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Key Scriptures */}
        {note.scriptures.length > 0 && (
          <div className="rounded-2xl bg-indigo-50/60 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/40 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-royal dark:text-indigo-300 mb-3">Key Scriptures</h3>
            <div className="flex flex-wrap gap-2">
              {note.scriptures.map(s => {
                const parsed = parseReference(s);
                return (
                  <button
                    key={s}
                    onClick={() => parsed && openScripture(`${parsed.book} ${parsed.chapter}:${parsed.verse}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-midnight-300 text-sm font-semibold text-indigo-royal dark:text-indigo-300 shadow-soft hover:shadow-card transition active:scale-[0.97]"
                  >
                    <BookOpen size={13} />
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Sermon body */}
        <div className="bg-white dark:bg-midnight-200 rounded-2xl border border-cloud-200 dark:border-midnight-100 p-5">
          <div className="reading-prose">
            {renderContent(note.body)}
          </div>
        </div>

        {/* Preacher Mode button */}
        {note.isSermon && (
          <button
            onClick={() => navigate({ name: 'preacher', noteId })}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-midnight-400 text-white font-semibold shadow-float hover:bg-midnight-300 active:scale-[0.98] transition"
          >
            <Mic size={20} /> Start Preacher Mode
          </button>
        )}
      </div>

      {/* Delete confirmation */}
      <Dialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        title="Delete Note?"
        actions={
          <>
            <button onClick={() => setShowDelete(false)} className="btn-ghost flex-1">Cancel</button>
            <button onClick={handleDelete} className="btn-coral flex-1">Delete</button>
          </>
        }
      >
        <p className="text-sm text-slate-500 dark:text-slate-400">This note will be permanently deleted. This cannot be undone.</p>
      </Dialog>

      {/* Move to folder */}
      <Dialog
        open={showMove}
        onClose={() => setShowMove(false)}
        title="Move to Folder"
      >
        <div className="space-y-1.5">
          {folders.map(f => (
            <button
              key={f.id}
              onClick={() => { updateNote(noteId, { folderId: f.id }); setShowMove(false); showToast('Note moved to ' + f.name); }}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition ${f.id === note.folderId ? 'bg-indigo-50 dark:bg-indigo-900/30 ring-1 ring-indigo-royal/30' : 'hover:bg-cloud-50 dark:hover:bg-midnight-300'}`}
            >
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: f.color }} />
              <span className="text-sm font-medium text-slate2-900 dark:text-white">{f.name}</span>
              {f.id === note.folderId && <span className="ml-auto text-xs text-indigo-royal dark:text-indigo-300 font-semibold">Current</span>}
            </button>
          ))}
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={() => setShowMove(false)} className="btn-ghost flex-1">Close</button>
        </div>
      </Dialog>
    </div>
  );
}
