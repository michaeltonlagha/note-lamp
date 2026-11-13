import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import Header from '@/components/Header';
import EmptyState from '@/components/EmptyState';
import { getVerseText } from '@/data/bibleData';
import { Bookmark, Copy, BookOpen, Trash2, PenLine } from 'lucide-react';
import type { Screen } from '@/App';

interface BookmarksProps {
  navigate: (s: Screen) => void;
}

export default function BookmarksScreen({ navigate }: BookmarksProps) {
  const { bookmarks, toggleBookmark, openScripture, showToast, translation } = useApp();
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  const handleCopy = (ref: string) => {
    const text = getVerseText(ref);
    navigator.clipboard.writeText(`${ref} — ${text ?? ''} (${translation})`).catch(() => {});
    setCopiedRef(ref);
    showToast('Verse copied');
    setTimeout(() => setCopiedRef(null), 1500);
  };

  const handleOpenInBible = (ref: string) => {
    openScripture(ref);
  };

  const handleAddToNotes = (ref: string) => {
    const text = getVerseText(ref);
    showToast('Verse added to new note');
    navigate({ name: 'editor', noteId: null });
    // Store the verse text so the editor can pick it up
    if (text) {
      sessionStorage.setItem('notelamp:insert-verse', `${ref} — ${text}`);
    }
  };

  const handleRemove = (ref: string) => {
    toggleBookmark(ref);
    showToast('Bookmark removed');
  };

  return (
    <div className="min-h-screen pb-24">
      <Header
        title="Saved Verses"
        subtitle={`${bookmarks.length} bookmark${bookmarks.length !== 1 ? 's' : ''}`}
        showBack
        onBack={() => navigate({ name: 'bible' })}
      />

      <div className="mx-auto max-w-md px-4 pt-4 space-y-3">
        {bookmarks.length === 0 ? (
          <EmptyState
            icon={<Bookmark size={28} />}
            title="No saved verses yet"
            description="While reading the Bible, tap a verse then the bookmark icon to save it here for quick access."
          />
        ) : (
          <>
            {bookmarks.map(ref => {
              const text = getVerseText(ref);
              return (
                <div
                  key={ref}
                  className="card p-4 animate-slideUp"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-600/20 text-teal-600 shrink-0">
                      <Bookmark size={16} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-indigo-royal dark:text-indigo-300 mb-1">{ref}</p>
                      {text ? (
                        <p className="reading-prose text-sm text-slate2-900 dark:text-white leading-relaxed">
                          {text}
                        </p>
                      ) : (
                        <p className="text-sm text-slate-400 italic">Verse text not available in preview Bible.</p>
                      )}

                      <div className="flex items-center gap-1 mt-3">
                        <button
                          onClick={() => handleOpenInBible(ref)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-indigo-royal dark:text-indigo-300 bg-cloud-50 dark:bg-midnight-300 hover:bg-cloud-100 dark:hover:bg-midnight-200 transition"
                        >
                          <BookOpen size={13} /> Read
                        </button>
                        <button
                          onClick={() => handleCopy(ref)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate2-900 dark:text-white bg-cloud-50 dark:bg-midnight-300 hover:bg-cloud-100 dark:hover:bg-midnight-200 transition"
                        >
                          <Copy size={13} /> {copiedRef === ref ? 'Copied!' : 'Copy'}
                        </button>
                        <button
                          onClick={() => handleAddToNotes(ref)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate2-900 dark:text-white bg-cloud-50 dark:bg-midnight-300 hover:bg-cloud-100 dark:hover:bg-midnight-200 transition"
                        >
                          <PenLine size={13} /> Note
                        </button>
                        <button
                          onClick={() => handleRemove(ref)}
                          className="flex items-center justify-center w-8 h-8 rounded-lg text-coral-500 hover:bg-coral-50 dark:hover:bg-coral-600/20 transition ml-auto"
                          aria-label="Remove bookmark"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
