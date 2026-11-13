import { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import Header from '@/components/Header';
import { bibleData, getChapter, getChapterVerses, translations, type BibleBook } from '@/data/bibleData';
import { ChevronLeft, ChevronRight, ChevronDown, Search, Bookmark, BookmarkCheck, Copy, Share2, PenLine, Check } from 'lucide-react';
import type { Screen } from '@/App';

interface BibleReaderProps {
  navigate: (s: Screen) => void;
}

export default function BibleReader({ navigate }: BibleReaderProps) {
  const { translation, setTranslation, fontSize, bookmarks, toggleBookmark, openScripture, showToast } = useApp();
  const [book, setBook] = useState<BibleBook>(bibleData.find(b => b.name === 'John') ?? bibleData[0]);
  const [chapter, setChapter] = useState(3);
  const [showBooks, setShowBooks] = useState(false);
  const [showChapters, setShowChapters] = useState(false);
  const [showTrans, setShowTrans] = useState(false);
  const [selectedVerses, setSelectedVerses] = useState<Set<number>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  const ch = getChapter(book.name, chapter);
  const verses = getChapterVerses(book.name, chapter);

  // Listen for navigation events from Scripture Toolkit
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { book: string; chapter: number };
      const b = bibleData.find(b => b.name === detail.book);
      if (b) { setBook(b); setChapter(detail.chapter); }
    };
    window.addEventListener('notelamp:bible-nav', handler);
    return () => window.removeEventListener('notelamp:bible-nav', handler);
  }, []);

  useEffect(() => {
    setSelectedVerses(new Set());
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [book, chapter]);

  const toggleVerse = (v: number) => {
    setSelectedVerses(prev => {
      const next = new Set(prev);
      if (next.has(v)) next.delete(v); else next.add(v);
      return next;
    });
  };

  const ntBooks = bibleData.filter(b => b.testament === 'NT');
  const otBooks = bibleData.filter(b => b.testament === 'OT');

  const goPrev = () => {
    const idx = book.chapters.findIndex(c => c.chapter === chapter);
    if (idx > 0) setChapter(book.chapters[idx - 1].chapter);
    else {
      const bookIdx = bibleData.findIndex(b => b.name === book.name);
      if (bookIdx > 0) {
        const prevBook = bibleData[bookIdx - 1];
        setBook(prevBook);
        setChapter(prevBook.chapters[prevBook.chapters.length - 1].chapter);
      }
    }
  };
  const goNext = () => {
    const idx = book.chapters.findIndex(c => c.chapter === chapter);
    if (idx < book.chapters.length - 1) setChapter(book.chapters[idx + 1].chapter);
    else {
      const bookIdx = bibleData.findIndex(b => b.name === book.name);
      if (bookIdx < bibleData.length - 1) {
        const nextBook = bibleData[bookIdx + 1];
        setBook(nextBook);
        setChapter(nextBook.chapters[0].chapter);
      }
    }
  };

  const selectedRef = () => {
    const verses = [...selectedVerses].sort((a, b) => a - b);
    if (verses.length === 0) return '';
    if (verses.length === 1) return `${book.name} ${chapter}:${verses[0]}`;
    return `${book.name} ${chapter}:${verses[0]}-${verses[verses.length - 1]}`;
  };

  const selectedText = () => {
    return [...selectedVerses].sort((a, b) => a - b).map(v => {
      const verse = ch?.verses.find(x => x.verse === v);
      return verse ? `${v}. ${verse.text}` : '';
    }).join(' ');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${selectedRef()} — ${selectedText()} (${translation})`).catch(() => {});
    showToast('Verses copied');
  };

  const handleAddToNotes = () => {
    showToast('Verses added to new note');
    navigate({ name: 'editor', noteId: null });
  };

  return (
    <div className="min-h-screen pb-24">
      <Header
        title="Bible"
        subtitle={`${translation}`}
        showBack
        onBack={() => navigate({ name: 'home' })}
        showSearch
        onSearch={() => navigate({ name: 'search' })}
        right={
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate({ name: 'bookmarks' })}
              className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-cloud-50 dark:bg-midnight-300 text-slate2-900 dark:text-white hover:bg-cloud-100 transition"
              aria-label="Saved verses"
            >
              <Bookmark size={18} />
              {bookmarks.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-teal-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {bookmarks.length}
                </span>
              )}
            </button>
            <button onClick={() => setShowTrans(s => !s)} className="flex items-center justify-center gap-1 px-3 h-9 rounded-xl bg-cloud-50 dark:bg-midnight-300 text-sm font-medium text-slate2-900 dark:text-white">
              {translation} <ChevronDown size={14} className={showTrans ? 'rotate-180 transition' : 'transition'} />
            </button>
          </div>
        }
      />

      {/* Translation dropdown */}
      {showTrans && (
        <div className="fixed top-[60px] right-4 z-30 bg-white dark:bg-midnight-200 rounded-xl shadow-float border border-cloud-200 dark:border-midnight-100 py-1 min-w-[100px]">
          {translations.map(t => (
            <button key={t} onClick={() => { setTranslation(t as typeof translation); setShowTrans(false); }} className={`w-full text-left px-3 py-2 text-sm hover:bg-cloud-50 dark:hover:bg-midnight-300 ${t === translation ? 'text-indigo-royal dark:text-indigo-300 font-semibold' : 'text-slate2-900 dark:text-white'}`}>
              {t}
            </button>
          ))}
        </div>
      )}

      {/* Book/Chapter selector bar */}
      <div className="sticky top-[68px] z-20 bg-white/95 dark:bg-midnight-400/95 backdrop-blur border-b border-cloud-200 dark:border-midnight-100">
        <div className="mx-auto max-w-md px-4 py-2.5 flex items-center gap-2">
          <button
            onClick={() => { setShowBooks(s => !s); setShowChapters(false); }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cloud-50 dark:bg-midnight-300 text-sm font-semibold text-slate2-900 dark:text-white"
          >
            {book.name} <ChevronDown size={14} className={showBooks ? 'rotate-180 transition' : 'transition'} />
          </button>
          <button
            onClick={() => { setShowChapters(s => !s); setShowBooks(false); }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cloud-50 dark:bg-midnight-300 text-sm font-semibold text-slate2-900 dark:text-white"
          >
            Chapter {chapter} <ChevronDown size={14} className={showChapters ? 'rotate-180 transition' : 'transition'} />
          </button>
        </div>
      </div>

      {/* Book selector panel */}
      {showBooks && (
        <div className="fixed inset-0 z-40 flex items-end justify-center" onClick={() => setShowBooks(false)}>
          <div className="absolute inset-0 bg-midnight-400/40 animate-fadeIn" />
          <div className="relative w-full max-w-md bg-white dark:bg-midnight-200 rounded-t-3xl shadow-float animate-slideUp max-h-[70vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="px-5 pt-4 pb-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Old Testament</p>
            </div>
            <div className="px-3 pb-3 grid grid-cols-3 gap-2">
              {otBooks.map(b => (
                <button key={b.name} onClick={() => { setBook(b); setChapter(b.chapters[0].chapter); setShowBooks(false); }} className={`px-2 py-2.5 rounded-xl text-sm font-medium ${b.name === book.name ? 'bg-indigo-royal text-white' : 'bg-cloud-50 dark:bg-midnight-300 text-slate2-900 dark:text-white'}`}>
                  {b.name}
                </button>
              ))}
            </div>
            <div className="px-5 pt-2 pb-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">New Testament</p>
            </div>
            <div className="px-3 pb-6 grid grid-cols-3 gap-2">
              {ntBooks.map(b => (
                <button key={b.name} onClick={() => { setBook(b); setChapter(b.chapters[0].chapter); setShowBooks(false); }} className={`px-2 py-2.5 rounded-xl text-sm font-medium ${b.name === book.name ? 'bg-indigo-royal text-white' : 'bg-cloud-50 dark:bg-midnight-300 text-slate2-900 dark:text-white'}`}>
                  {b.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chapter selector panel */}
      {showChapters && (
        <div className="fixed inset-0 z-40 flex items-end justify-center" onClick={() => setShowChapters(false)}>
          <div className="absolute inset-0 bg-midnight-400/40 animate-fadeIn" />
          <div className="relative w-full max-w-md bg-white dark:bg-midnight-200 rounded-t-3xl shadow-float animate-slideUp max-h-[60vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="px-5 pt-4 pb-3">
              <p className="font-bold text-slate2-900 dark:text-white">{book.name} — Select Chapter</p>
            </div>
            <div className="px-3 pb-6 grid grid-cols-5 gap-2">
              {book.chapters.map(c => (
                <button key={c.chapter} onClick={() => { setChapter(c.chapter); setShowChapters(false); }} className={`aspect-square rounded-xl text-sm font-semibold ${c.chapter === chapter ? 'bg-indigo-royal text-white' : 'bg-cloud-50 dark:bg-midnight-300 text-slate2-900 dark:text-white'}`}>
                  {c.chapter}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reading area */}
      <div ref={scrollRef} className="mx-auto max-w-md px-5 pt-5">
        <div className="text-center mb-5">
          <h2 className="font-serif text-2xl font-bold text-slate2-900 dark:text-white">{book.name}</h2>
          <p className="text-sm text-slate-400">Chapter {chapter}</p>
        </div>

        <div className="bg-white dark:bg-midnight-200 rounded-2xl border border-cloud-200 dark:border-midnight-100 p-5">
          <div className="reading-prose space-y-1" style={{ fontSize: `${fontSize}px` }}>
            {verses.map(v => {
              const selected = selectedVerses.has(v.verse);
              const isBm = bookmarks.includes(`${book.name} ${chapter}:${v.verse}`);
              return (
                <p
                  key={v.verse}
                  onClick={() => toggleVerse(v.verse)}
                  className={`cursor-pointer rounded-md px-1 -mx-1 transition-colors ${selected ? 'verse-selected' : 'hover:bg-cloud-50 dark:hover:bg-midnight-300/50'}`}
                >
                  <sup className={`text-xs font-bold mr-0.5 ${selected ? 'text-indigo-royal dark:text-indigo-300' : 'text-slate-400'}`}>{v.verse}</sup>
                  <span className="text-slate2-900 dark:text-white">{v.text}</span>
                  {isBm && <BookmarkCheck size={13} className="inline ml-1 text-teal-500" />}
                </p>
              );
            })}
            {verses.length === 0 && (
              <p className="text-slate-400 italic text-center py-8">Chapter {chapter} of {book.name} could not be loaded.</p>
            )}
          </div>
        </div>

        {/* Chapter navigation */}
        <div className="flex items-center justify-between mt-5 mb-4">
          <button onClick={goPrev} className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-cloud-50 dark:bg-midnight-300 text-slate2-900 dark:text-white font-medium text-sm hover:bg-cloud-100 transition">
            <ChevronLeft size={18} /> Prev
          </button>
          <span className="text-sm text-slate-400">{chapter} / {book.chapters.length}</span>
          <button onClick={goNext} className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-cloud-50 dark:bg-midnight-300 text-slate2-900 dark:text-white font-medium text-sm hover:bg-cloud-100 transition">
            Next <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Floating verse action toolbar */}
      {selectedVerses.size > 0 && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 animate-slideUp">
          <div className="flex items-center gap-1 bg-indigo-royal text-white rounded-2xl shadow-float px-2 py-2">
            <span className="text-xs font-semibold px-2 max-w-[100px] truncate">{selectedRef()}</span>
            <div className="w-px h-5 bg-white/20" />
            <button onClick={() => openScripture(selectedRef())} className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/15 transition" title="Open Scripture"><Check size={16} /></button>
            <button onClick={handleCopy} className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/15 transition" title="Copy"><Copy size={16} /></button>
            <button onClick={() => showToast('Share link copied')} className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/15 transition" title="Share"><Share2 size={16} /></button>
            <button onClick={handleAddToNotes} className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/15 transition" title="Add to Notes"><PenLine size={16} /></button>
            <button onClick={() => { toggleBookmark(selectedRef()); showToast('Bookmark toggled'); }} className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/15 transition" title="Bookmark"><Bookmark size={16} /></button>
            <button onClick={() => setSelectedVerses(new Set())} className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/15 transition text-white/70" title="Clear">✕</button>
          </div>
        </div>
      )}
    </div>
  );
}
