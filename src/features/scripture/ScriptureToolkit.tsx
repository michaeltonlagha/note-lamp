import { useApp } from '@/context/AppContext';
import { getVerseText, parseReference, translations } from '@/data/bibleData';
import BottomSheet from '@/components/BottomSheet';
import { BookOpen, Plus, Copy, Bookmark, BookmarkCheck, ChevronDown, X } from 'lucide-react';
import { useState } from 'react';

export default function ScriptureToolkit() {
  const { scriptureToolkit, closeScripture, openScripture, translation, setTranslation, bookmarks, toggleBookmark, showToast, setTab } = useApp();
  const [showTranslations, setShowTranslations] = useState(false);

  const ref = scriptureToolkit.reference;
  const parsed = parseReference(ref);
  const text = getVerseText(ref);
  const isBookmarked = bookmarks.includes(ref);

  const handleCopy = () => {
    if (text) {
      navigator.clipboard.writeText(`${ref} — ${text} (${translation})`).catch(() => {});
      showToast('Verse copied to clipboard');
    }
  };

  const handleInsert = () => {
    closeScripture();
    showToast('Verse inserted into note');
  };

  const handleOpenInBible = () => {
    if (parsed) {
      closeScripture();
      setTab('bible');
      setTimeout(() => {
        const event = new CustomEvent('notelamp:bible-nav', { detail: { book: parsed.book, chapter: parsed.chapter } });
        window.dispatchEvent(event);
      }, 100);
    }
  };

  const handleSaveVerse = () => {
    toggleBookmark(ref);
    showToast(isBookmarked ? 'Bookmark removed' : 'Verse saved to bookmarks');
  };

  return (
    <BottomSheet open={scriptureToolkit.open} onClose={closeScripture}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-coral-500">Scripture</span>
          <h2 className="text-xl font-bold text-indigo-royal dark:text-indigo-300 leading-tight">{ref}</h2>
        </div>
        <button onClick={closeScripture} className="flex items-center justify-center w-8 h-8 rounded-lg bg-cloud-50 dark:bg-midnight-300 text-slate-400 hover:text-slate-600">
          <X size={18} />
        </button>
      </div>

      {/* Translation selector */}
      <div className="relative mb-4">
        <button
          onClick={() => setShowTranslations(s => !s)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-cloud-50 dark:bg-midnight-300 text-sm font-medium text-slate2-900 dark:text-white border border-cloud-200 dark:border-midnight-100"
        >
          {translation}
          <ChevronDown size={16} className={showTranslations ? 'rotate-180 transition' : 'transition'} />
        </button>
        {showTranslations && (
          <div className="absolute top-full mt-1 left-0 z-10 bg-white dark:bg-midnight-200 rounded-xl shadow-float border border-cloud-200 dark:border-midnight-100 py-1 min-w-[120px]">
            {translations.map(t => (
              <button
                key={t}
                onClick={() => { setTranslation(t as typeof translation); setShowTranslations(false); }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-cloud-50 dark:hover:bg-midnight-300 ${t === translation ? 'text-indigo-royal dark:text-indigo-300 font-semibold' : 'text-slate2-900 dark:text-white'}`}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Verse text */}
      <div className="rounded-2xl bg-cloud-50 dark:bg-midnight-300 border border-cloud-200 dark:border-midnight-100 p-4 mb-5">
        <p className="reading-prose text-base text-slate2-900 dark:text-white leading-relaxed">
          {text ? (
            <>
              <sup className="text-indigo-royal dark:text-indigo-300 font-semibold text-xs mr-1">{parsed?.verse}</sup>
              {text}
            </>
          ) : (
            <span className="text-slate-400 italic">Verse not available in this preview. It will appear here when the offline Bible pack is installed.</span>
          )}
        </p>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={handleOpenInBible} className="flex flex-col items-center gap-1.5 py-4 rounded-2xl bg-indigo-royal text-white font-semibold shadow-indigo active:scale-[0.98] transition">
          <BookOpen size={22} />
          <span className="text-xs">Open in Bible</span>
        </button>
        <button onClick={handleInsert} className="flex flex-col items-center gap-1.5 py-4 rounded-2xl bg-electric-500 text-white font-semibold active:scale-[0.98] transition">
          <Plus size={22} />
          <span className="text-xs">Insert into Notes</span>
        </button>
        <button onClick={handleCopy} className="flex flex-col items-center gap-1.5 py-4 rounded-2xl bg-cloud-100 dark:bg-midnight-300 text-slate2-900 dark:text-white font-medium active:scale-[0.98] transition">
          <Copy size={20} />
          <span className="text-xs">Copy</span>
        </button>
        <button onClick={handleSaveVerse} className="flex flex-col items-center gap-1.5 py-4 rounded-2xl bg-cloud-100 dark:bg-midnight-300 text-slate2-900 dark:text-white font-medium active:scale-[0.98] transition">
          {isBookmarked ? <BookmarkCheck size={20} className="text-teal-500" /> : <Bookmark size={20} />}
          <span className="text-xs">{isBookmarked ? 'Saved' : 'Save Verse'}</span>
        </button>
      </div>

      <button
        onClick={() => { setShowTranslations(true); }}
        className="w-full mt-3 text-center text-sm text-indigo-royal dark:text-indigo-300 font-medium py-2"
      >
        Change Version
      </button>
    </BottomSheet>
  );
}
