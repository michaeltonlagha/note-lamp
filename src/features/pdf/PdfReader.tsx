import { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { ChevronLeft, ChevronRight, BookOpen, Copy, Save, Eye, X } from 'lucide-react';
import { parseReference } from '@/data/bibleData';
import type { Screen } from '@/App';

interface PdfReaderProps {
  navigate: (s: Screen) => void;
  pdfId: string;
}

export default function PdfReader({ navigate, pdfId }: PdfReaderProps) {
  const { getPdf, openScripture, showToast, bookmarks, toggleBookmark } = useApp();
  const pdf = getPdf(pdfId);
  const [page, setPage] = useState(1);
  const [selection, setSelection] = useState<string | null>(null);
  const [toolbarPos, setToolbarPos] = useState<{ x: number; y: number } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const savedScroll = useRef(0);

  // Split excerpt into "pages"
  const pages = pdf?.excerpt.split('\n\n') ?? [];
  const totalPages = Math.max(pages.length, pdf?.pageCount ?? 1);

  useEffect(() => {
    if (selection) savedScroll.current = scrollRef.current?.scrollTop ?? 0;
  }, [selection]);

  useEffect(() => {
    if (!selection) scrollRef.current?.scrollTo({ top: savedScroll.current });
  }, [selection]);

  if (!pdf) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400">PDF not found.</p>
      </div>
    );
  }

  const currentPageText = pages[Math.min(page - 1, pages.length - 1)] ?? pages[0] ?? '';

  // Render text with scripture refs highlighted
  const renderText = (text: string) => {
    const refRegex = /\b((?:[1-3]\s)?(?:Genesis|Exodus|Psalms?|Proverbs|Isaiah|Matthew|Mark|Luke|John|Acts|Romans|Corinthians|Galatians|Ephesians|Philippians|Colossians|Thessalonians|Timothy|Hebrews|James|Peter|Revelation|Chronicles|Daniel|Ezekiel|Jeremiah|Jonah|Micah|Habakkuk|Zechariah|Malachi|Numbers|Deuteronomy|Joshua|Judges|Samuel|Kings|Nehemiah|Job|Ecclesiastes|Hosea|Joel|Amos|Titus|Philemon|Jude)\s+\d+:\d+(?:-\d+)?)\b/g;
    const parts = text.split(refRegex);
    return parts.map((part, i) => {
      const parsed = parseReference(part);
      if (parsed) {
        return (
          <button
            key={i}
            onMouseUp={(e) => {
              e.stopPropagation();
              const rect = (e.target as HTMLElement).getBoundingClientRect();
              setToolbarPos({ x: rect.left + rect.width / 2, y: rect.top });
              setSelection(`${parsed.book} ${parsed.chapter}:${parsed.verse}`);
            }}
            className="text-indigo-royal dark:text-indigo-300 font-semibold underline decoration-dotted underline-offset-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded px-0.5 transition cursor-pointer"
          >
            {part}
          </button>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  const closeToolbar = () => {
    setSelection(null);
    setToolbarPos(null);
  };

  const isBookmarked = selection ? bookmarks.includes(selection) : false;

  return (
    <div className="min-h-screen bg-cloud-50 dark:bg-midnight-400">
      {/* PDF Header */}
      <header className="sticky top-0 z-30 bg-white dark:bg-midnight-300 border-b border-cloud-200 dark:border-midnight-100">
        <div className="mx-auto max-w-md px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate({ name: 'home' })} className="flex items-center justify-center w-9 h-9 rounded-xl bg-cloud-50 dark:bg-midnight-400 text-slate2-900 dark:text-white hover:bg-cloud-100 transition">
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold text-slate2-900 dark:text-white truncate">{pdf.title}</h1>
            <p className="text-xs text-slate-400">Page {page} of {totalPages}</p>
          </div>
        </div>
      </header>

      {/* Document area */}
      <div ref={scrollRef} className="mx-auto max-w-md px-4 pt-5 pb-32 h-[calc(100vh-60px)] overflow-y-auto">
        <div className="bg-white dark:bg-midnight-200 rounded-2xl shadow-card border border-cloud-200 dark:border-midnight-100 p-6 min-h-[500px]">
          <div className="reading-prose text-slate2-900 dark:text-white leading-relaxed text-[15px]">
            {renderText(currentPageText)}
          </div>
        </div>

        {/* Page navigation */}
        <div className="flex items-center justify-between mt-5">
          <button
            onClick={() => { setPage(p => Math.max(1, p - 1)); closeToolbar(); }}
            disabled={page === 1}
            className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-white dark:bg-midnight-200 text-slate2-900 dark:text-white font-medium text-sm shadow-soft disabled:opacity-30"
          >
            <ChevronLeft size={18} /> Prev
          </button>
          <span className="text-sm text-slate-400">{page} / {totalPages}</span>
          <button
            onClick={() => { setPage(p => Math.min(totalPages, p + 1)); closeToolbar(); }}
            disabled={page >= totalPages}
            className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-white dark:bg-midnight-200 text-slate2-900 dark:text-white font-medium text-sm shadow-soft disabled:opacity-30"
          >
            Next <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Floating scripture toolbar */}
      {selection && toolbarPos && (
        <>
          <div className="fixed inset-0 z-40" onClick={closeToolbar} />
          <div
            className="fixed z-50 -translate-x-1/2 animate-pop"
            style={{ left: `${Math.max(120, Math.min(toolbarPos.x, window.innerWidth - 120))}px`, top: `${Math.max(70, toolbarPos.y - 10)}px` }}
          >
            <div className="flex items-center gap-1 bg-midnight-400 text-white rounded-xl shadow-float px-1.5 py-1.5">
              <span className="text-xs font-semibold px-2 max-w-[90px] truncate text-indigo-300">{selection}</span>
              <div className="w-px h-4 bg-white/20" />
              <button onClick={() => { openScripture(selection); }} className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/15 transition" title="Open Scripture">
                <BookOpen size={15} />
              </button>
              <button onClick={() => { openScripture(selection); closeToolbar(); }} className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/15 transition" title="Preview">
                <Eye size={15} />
              </button>
              <button onClick={() => { toggleBookmark(selection); showToast(isBookmarked ? 'Removed' : 'Verse saved'); closeToolbar(); }} className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/15 transition" title="Save">
                <Save size={15} />
              </button>
              <button onClick={() => { navigator.clipboard.writeText(selection).catch(()=>{}); showToast('Reference copied'); closeToolbar(); }} className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/15 transition" title="Copy">
                <Copy size={15} />
              </button>
              <button onClick={closeToolbar} className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/15 transition text-white/60" title="Close">
                <X size={15} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
