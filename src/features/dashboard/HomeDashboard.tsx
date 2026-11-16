import { useApp } from '@/context/AppContext';
import { Plus, BookOpen, FileUp, Bell, ChevronRight, PenLine, Quote, RefreshCw, Users } from 'lucide-react';
import { NoteCard, SermonCard, PdfCard } from '@/components/Cards';
import { useState, useMemo, useCallback } from 'react';
import { bibleData, type BibleBook } from '@/data/bibleData';
import type { Screen } from '@/App';

interface HomeProps {
  navigate: (s: Screen) => void;
}

function pickVerseOfTheDay(): { reference: string; text: string } {
  const today = new Date();
  const seed = today.getFullYear() * 1000 + today.getMonth() * 50 + today.getDate();
  const bookIdx = seed % bibleData.length;
  const book = bibleData[bookIdx];
  const chIdx = (seed * 7) % book.chapters.length;
  const ch = book.chapters[chIdx];
  const vIdx = (seed * 13) % ch.verses.length;
  const v = ch.verses[vIdx];
  return { reference: `${book.name} ${ch.chapter}:${v.verse}`, text: v.text };
}

export default function HomeDashboard({ navigate }: HomeProps) {
  const { notes, pdfs, userEmail, folders, openScripture } = useApp();
  const [search, setSearch] = useState('');
  const [votd, setVotd] = useState(() => pickVerseOfTheDay());

  const refreshVerse = useCallback(() => {
    const book = bibleData[Math.floor(Math.random() * bibleData.length)] as BibleBook;
    const ch = book.chapters[Math.floor(Math.random() * book.chapters.length)];
    const v = ch.verses[Math.floor(Math.random() * ch.verses.length)];
    setVotd({ reference: `${book.name} ${ch.chapter}:${v.verse}`, text: v.text });
  }, []);

  const recentNotes = notes.slice(0, 3);
  const recentSermons = notes.filter(n => n.isSermon).slice(0, 2);
  const recentPdfs = pdfs.slice(0, 2);

  const filteredNotes = search
    ? notes.filter(n => n.title.toLowerCase().includes(search.toLowerCase()) || n.body.toLowerCase().includes(search.toLowerCase()))
    : [];

  const userName = userEmail ? userEmail.split('@')[0].replace(/[^a-zA-Z]/g, '') : 'Friend';
  const display = userName.charAt(0).toUpperCase() + userName.slice(1);

  return (
    <div className="pb-24">
      {/* Greeting header */}
      <div className="bg-gradient-to-br from-indigo-royal via-indigo-700 to-electric-600 px-5 pt-12 pb-6 rounded-b-3xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-full bg-white/15 text-white font-bold text-lg ring-2 ring-white/20">
              {display.charAt(0)}
            </div>
            <div>
              <p className="text-white/70 text-xs">Welcome back,</p>
              <h1 className="text-white font-bold text-lg leading-tight">{display}</h1>
            </div>
          </div>
          <button className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-white/15 text-white hover:bg-white/25 transition">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-coral-500 rounded-full ring-2 ring-indigo-royal" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search notes, verses, sermons"
            className="w-full bg-white/95 rounded-xl pl-4 pr-4 py-3 text-sm text-slate2-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white/60 transition"
          />
        </div>
      </div>

      {/* Search results */}
      {search && (
        <div className="px-4 mt-4 space-y-3">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            {filteredNotes.length} result{filteredNotes.length !== 1 ? 's' : ''}
          </p>
          {filteredNotes.map(n => (
            <NoteCard key={n.id} note={n} onClick={() => navigate({ name: 'noteDetail', noteId: n.id })} />
          ))}
          {filteredNotes.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-8">No matches found. Try a different term.</p>
          )}
        </div>
      )}

      {!search && (
        <div className="px-4 mt-5 space-y-6">
          {/* Verse of the Day */}
          <div className="rounded-2xl bg-white dark:bg-midnight-200 shadow-soft border border-cloud-200/60 dark:border-midnight-100/60 overflow-hidden">
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-600/20 text-teal-600">
                  <Quote size={15} />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Verse of the Day</span>
              </div>
              <button onClick={refreshVerse} className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-indigo-royal dark:hover:text-indigo-300 hover:bg-cloud-50 dark:hover:bg-midnight-300 transition" aria-label="New verse">
                <RefreshCw size={14} />
              </button>
            </div>
            <button onClick={() => openScripture(votd.reference)} className="block w-full text-left px-4 pb-4 pt-1 hover:bg-cloud-50/50 dark:hover:bg-midnight-300/30 transition">
              <p className="reading-prose text-sm text-slate2-900 dark:text-white leading-relaxed mb-2">
                "{votd.text}"
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-indigo-royal dark:text-indigo-300">{votd.reference}</span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-cloud-100 dark:bg-midnight-300 text-slate-500 dark:text-slate-400">KJV</span>
              </div>
            </button>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => navigate({ name: 'editor', noteId: null })}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white dark:bg-midnight-200 shadow-soft border border-cloud-200/60 dark:border-midnight-100/60 hover:shadow-card active:scale-[0.97] transition"
            >
              <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-royal text-white shadow-indigo">
                <Plus size={22} />
              </span>
              <span className="text-xs font-semibold text-slate2-900 dark:text-white">New Note</span>
            </button>
            <button
              onClick={() => navigate({ name: 'bible' })}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white dark:bg-midnight-200 shadow-soft border border-cloud-200/60 dark:border-midnight-100/60 hover:shadow-card active:scale-[0.97] transition"
            >
              <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-electric-500 text-white">
                <BookOpen size={22} />
              </span>
              <span className="text-xs font-semibold text-slate2-900 dark:text-white">Open Bible</span>
            </button>
            <button
              onClick={() => navigate({ name: 'library' })}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white dark:bg-midnight-200 shadow-soft border border-cloud-200/60 dark:border-midnight-100/60 hover:shadow-card active:scale-[0.97] transition"
            >
              <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-coral-500 text-white shadow-coral">
                <FileUp size={22} />
              </span>
              <span className="text-xs font-semibold text-slate2-900 dark:text-white">Library</span>
            </button>
          </div>

          {/* Reading Rooms */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-slate2-900 dark:text-white">Reading Rooms</h2>
              <button onClick={() => navigate({ name: 'roomList' })} className="text-sm text-indigo-royal dark:text-indigo-300 font-medium flex items-center gap-0.5">
                See All <ChevronRight size={16} />
              </button>
            </div>
            <button onClick={() => navigate({ name: 'roomList' })} className="w-full rounded-2xl bg-gradient-to-br from-teal-500 to-electric-500 p-5 text-white shadow-soft hover:shadow-card active:scale-[0.98] transition text-left">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/15 text-white">
                  <Users size={24} />
                </span>
                <div>
                  <p className="font-bold text-base">Read Together</p>
                  <p className="text-xs text-white/90 mt-0.5">Create or join a group reading room</p>
                </div>
              </div>
            </button>
          </section>

          {/* Recent Notes */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-slate2-900 dark:text-white">Recent Notes</h2>
              <button onClick={() => navigate({ name: 'myNotes' })} className="text-sm text-indigo-royal dark:text-indigo-300 font-medium flex items-center gap-0.5">
                See All <ChevronRight size={16} />
              </button>
            </div>
            {recentNotes.length > 0 ? (
              <div className="space-y-3">
                {recentNotes.map(n => (
                  <NoteCard key={n.id} note={n} onClick={() => navigate({ name: 'noteDetail', noteId: n.id })} />
                ))}
              </div>
            ) : (
              <button onClick={() => navigate({ name: 'editor', noteId: null })} className="w-full rounded-2xl border-2 border-dashed border-cloud-200 dark:border-midnight-100 py-6 px-4 hover:border-indigo-royal dark:hover:border-indigo-300 transition group">
                <div className="flex flex-col items-center gap-2">
                  <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-cloud-50 dark:bg-midnight-300 text-slate-400 group-hover:text-indigo-royal dark:group-hover:text-indigo-300 transition">
                    <PenLine size={18} />
                  </span>
                  <span className="text-sm text-slate-400 group-hover:text-indigo-royal dark:group-hover:text-indigo-300 transition">Write your first note</span>
                </div>
              </button>
            )}
          </section>

          {/* Recent Sermons & PDFs */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-slate2-900 dark:text-white">Recent Sermons & PDFs</h2>
              <button onClick={() => navigate({ name: 'library' })} className="text-sm text-indigo-royal dark:text-indigo-300 font-medium flex items-center gap-0.5">
                See All <ChevronRight size={16} />
              </button>
            </div>
            {(recentSermons.length > 0 || recentPdfs.length > 0) ? (
              <div className="grid grid-cols-2 gap-3">
                {recentSermons.map(n => (
                  <SermonCard key={n.id} note={n} onClick={() => navigate({ name: 'noteDetail', noteId: n.id })} />
                ))}
                {recentPdfs.map(p => (
                  <PdfCard key={p.id} title={p.title} author={p.author} date={p.date} pageCount={p.pageCount} onClick={() => navigate({ name: 'pdfReader', pdfId: p.id })} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-cloud-200 dark:border-midnight-100 py-6 px-4 text-center">
                <p className="text-sm text-slate-400">Your sermons and PDFs will appear here.</p>
              </div>
            )}
          </section>

          {/* Folders quick glance */}
          <section>
            <h2 className="font-bold text-slate2-900 dark:text-white mb-3">Folders</h2>
            {folders.length > 0 ? (
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                {folders.map(f => (
                  <button
                    key={f.id}
                    onClick={() => navigate({ name: 'folderView', folderId: f.id })}
                    className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white dark:bg-midnight-200 shadow-soft border border-cloud-200/60 dark:border-midnight-100/60 whitespace-nowrap hover:shadow-card active:scale-[0.97] transition"
                  >
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: f.color }} />
                    <span className="text-sm font-medium text-slate2-900 dark:text-white">{f.name}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-cloud-200 dark:border-midnight-100 py-6 px-4 text-center">
                <p className="text-sm text-slate-400">Create folders from the Notes tab to organize your work.</p>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
