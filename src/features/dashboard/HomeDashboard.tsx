import { useApp } from '@/context/AppContext';
import { Plus, BookOpen, FileUp, Bell, ChevronRight, PenLine } from 'lucide-react';
import { NoteCard, SermonCard, PdfCard } from '@/components/Cards';
import { useState } from 'react';
import type { Screen } from '@/App';

interface HomeProps {
  navigate: (s: Screen) => void;
}

export default function HomeDashboard({ navigate }: HomeProps) {
  const { notes, pdfs, userEmail, folders } = useApp();
  const [search, setSearch] = useState('');

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
              onClick={() => navigate({ name: 'pdfReader', pdfId: pdfs[0]?.id ?? '' })}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white dark:bg-midnight-200 shadow-soft border border-cloud-200/60 dark:border-midnight-100/60 hover:shadow-card active:scale-[0.97] transition"
            >
              <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-coral-500 text-white shadow-coral">
                <FileUp size={22} />
              </span>
              <span className="text-xs font-semibold text-slate2-900 dark:text-white">Import PDF</span>
            </button>
          </div>

          {/* Recent Notes */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-slate2-900 dark:text-white">Recent Notes</h2>
              <button onClick={() => navigate({ name: 'myNotes' })} className="text-sm text-indigo-royal dark:text-indigo-300 font-medium flex items-center gap-0.5">
                See All <ChevronRight size={16} />
              </button>
            </div>
            <div className="space-y-3">
              {recentNotes.map(n => (
                <NoteCard key={n.id} note={n} onClick={() => navigate({ name: 'noteDetail', noteId: n.id })} />
              ))}
            </div>
          </section>

          {/* Recent Sermons & PDFs */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-slate2-900 dark:text-white">Recent Sermons & PDFs</h2>
              <button onClick={() => navigate({ name: 'library' })} className="text-sm text-indigo-royal dark:text-indigo-300 font-medium flex items-center gap-0.5">
                See All <ChevronRight size={16} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {recentSermons.map(n => (
                <SermonCard key={n.id} note={n} onClick={() => navigate({ name: 'noteDetail', noteId: n.id })} />
              ))}
              {recentPdfs.map(p => (
                <PdfCard key={p.id} title={p.title} author={p.author} date={p.date} pageCount={p.pageCount} onClick={() => navigate({ name: 'pdfReader', pdfId: p.id })} />
              ))}
            </div>
          </section>

          {/* Folders quick glance */}
          <section>
            <h2 className="font-bold text-slate2-900 dark:text-white mb-3">Folders</h2>
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
          </section>
        </div>
      )}
    </div>
  );
}
