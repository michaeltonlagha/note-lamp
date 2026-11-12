import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import EmptyState from '@/components/EmptyState';
import { BookOpen, Search as SearchIcon } from 'lucide-react';
import { bibleData, getVerse } from '@/data/bibleData';
import type { Screen } from '@/App';

interface SearchProps {
  navigate: (s: Screen) => void;
}

type Filter = 'all' | 'exact' | 'book' | 'topic';

const filters: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'exact', label: 'Exact Phrase' },
  { key: 'book', label: 'Book' },
  { key: 'topic', label: 'Topic' },
];

interface SearchResult {
  reference: string;
  text: string;
  book: string;
}

export default function BibleSearch({ navigate }: SearchProps) {
  const { translation, openScripture } = useApp();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const results: SearchResult[] = [];
    for (const book of bibleData) {
      for (const ch of book.chapters) {
        for (const v of ch.verses) {
          const text = v.text;
          const lower = text.toLowerCase();
          let match = false;
          if (filter === 'exact') match = lower.includes(q);
          else if (filter === 'book') match = book.name.toLowerCase().includes(q);
          else if (filter === 'topic') {
            const topics: Record<string, string[]> = {
              peace: ['peace', 'rest', 'still', 'calm'],
              faith: ['faith', 'believe', 'trust'],
              love: ['love', 'charity', 'beloved'],
              grace: ['grace', 'mercy'],
              hope: ['hope', 'expected'],
            };
            const topicWords = topics[q] ?? [q];
            match = topicWords.some(w => lower.includes(w));
          } else match = lower.includes(q) || book.name.toLowerCase().includes(q);

          if (match) {
            results.push({ reference: `${book.name} ${ch.chapter}:${v.verse}`, text, book: book.name });
          }
        }
      }
    }
    return results.slice(0, 50);
  }, [query, filter]);

  const highlightMatch = (text: string) => {
    if (!query.trim()) return text;
    const q = query.trim();
    const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.split(regex).map((part, i) =>
      regex.test(part) ? <mark key={i} className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-royal dark:text-indigo-300 rounded px-0.5 font-semibold">{part}</mark> : <span key={i}>{part}</span>
    );
  };

  return (
    <div className="min-h-screen pb-24">
      <Header title="Bible Search" showBack onBack={() => navigate({ name: 'bible' })} />
      <div className="mx-auto max-w-md px-4 pt-4 space-y-4">
        <SearchBar value={query} onChange={setQuery} placeholder="Search by word or phrase..." />

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`chip ${filter === f.key ? 'bg-indigo-royal text-white' : 'bg-cloud-50 dark:bg-midnight-300 text-slate2-900 dark:text-white'}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Results */}
        {query.trim() === '' ? (
          <EmptyState icon={<SearchIcon size={28} />} title="Search the Bible" description="Type a word or phrase like 'Peace' or 'faith' to find matching verses." />
        ) : results.length === 0 ? (
          <EmptyState icon={<SearchIcon size={28} />} title="No results found" description={`No verses match "${query}" with the ${filter} filter.`} />
        ) : (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{results.length} match{results.length !== 1 ? 'es' : ''}</p>
            {results.map(r => (
              <button
                key={r.reference}
                onClick={() => openScripture(r.reference)}
                className="card p-4 text-left w-full hover:shadow-card transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <BookOpen size={14} className="text-indigo-royal dark:text-indigo-300" />
                  <span className="text-sm font-bold text-indigo-royal dark:text-indigo-300">{r.reference}</span>
                  <span className="ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full bg-cloud-100 dark:bg-midnight-300 text-slate-500 dark:text-slate-400">{translation}</span>
                </div>
                <p className="reading-prose text-sm text-slate2-900 dark:text-white leading-relaxed">
                  {highlightMatch(r.text)}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
