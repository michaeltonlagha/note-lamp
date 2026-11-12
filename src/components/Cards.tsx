import { FileText, BookOpen, PenLine, BookMarked } from 'lucide-react';
import type { NoteItem } from '@/data/sampleData';

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function NoteCard({ note, onClick }: { note: NoteItem; onClick: () => void }) {
  const Icon = note.isSermon ? BookOpen : PenLine;
  const iconColor = note.isSermon ? 'bg-indigo-50 text-indigo-royal dark:bg-indigo-900/40 dark:text-indigo-300' : 'bg-teal-50 text-teal-600 dark:bg-teal-600/20 dark:text-teal-400';
  return (
    <button
      onClick={onClick}
      className="card p-4 text-left w-full hover:shadow-card transition-all active:scale-[0.98] group"
    >
      <div className="flex items-start gap-3">
        <span className={`flex items-center justify-center w-10 h-10 rounded-xl shrink-0 ${iconColor}`}>
          <Icon size={18} />
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-slate2-900 dark:text-white truncate">{note.title}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{formatDate(note.date)} · {note.category}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{note.body.replace(/[#*]/g, '').slice(0, 80)}</p>
        </div>
      </div>
    </button>
  );
}

export function SermonCard({ note, onClick }: { note: NoteItem; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="card p-4 text-left hover:shadow-card transition-all active:scale-[0.98]"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-royal text-white shrink-0">
          <BookMarked size={15} />
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-royal dark:text-indigo-300">Sermon</span>
      </div>
      <h3 className="font-semibold text-sm text-slate2-900 dark:text-white leading-snug">{note.title}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{formatDate(note.date)}</p>
      {note.scriptures.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {note.scriptures.slice(0, 3).map(s => (
            <span key={s} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-cloud-100 dark:bg-midnight-300 text-indigo-royal dark:text-indigo-300">
              {s}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}

export function PdfCard({ title, author, date, pageCount, onClick }: { title: string; author: string; date: string; pageCount: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="card p-4 text-left hover:shadow-card transition-all active:scale-[0.98]"
    >
      <div className="flex items-start gap-3">
        <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-coral-50 dark:bg-coral-600/20 text-coral-600 dark:text-coral-400 shrink-0">
          <FileText size={18} />
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-slate2-900 dark:text-white truncate">{title}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{author} · {pageCount} pages</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{formatDate(date)}</p>
        </div>
      </div>
    </button>
  );
}
