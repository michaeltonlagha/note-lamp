import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import EmptyState from '@/components/EmptyState';
import Dialog from '@/components/Dialog';
import { NoteCard, PdfCard } from '@/components/Cards';
import { FolderPlus, ChevronRight, MoreVertical, Plus, FolderPlus as FolderIcon, FileText, PenLine, BookOpen } from 'lucide-react';
import type { Screen } from '@/App';

interface MyNotesProps {
  navigate: (s: Screen) => void;
}

type TabType = 'notes' | 'sermons' | 'pdfs';

export default function MyNotes({ navigate }: MyNotesProps) {
  const { notes, pdfs, folders, addFolder, renameFolder, deleteFolder, showToast } = useApp();
  const [tab, setTab] = useState<TabType>('notes');
  const [search, setSearch] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [menuFolder, setMenuFolder] = useState<string | null>(null);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameText, setRenameText] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: 'notes', label: 'Notes', count: notes.filter(n => !n.isSermon).length },
    { key: 'sermons', label: 'Sermons', count: notes.filter(n => n.isSermon).length },
    { key: 'pdfs', label: 'PDFs', count: pdfs.length },
  ];

  const filteredFolders = folders;
  const filteredNotes = notes.filter(n => {
    const matchTab = tab === 'sermons' ? n.isSermon : tab === 'notes' ? !n.isSermon : false;
    const matchSearch = !search || n.title.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });
  const filteredPdfs = pdfs.filter(p => !search || p.title.toLowerCase().includes(search.toLowerCase()));

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      addFolder(newFolderName.trim());
      showToast('Folder created');
      setNewFolderName('');
      setShowNewFolder(false);
    }
  };

  const handleRename = () => {
    if (renameId && renameText.trim()) {
      renameFolder(renameId, renameText.trim());
      showToast('Folder renamed');
      setRenameId(null);
      setRenameText('');
    }
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteFolder(deleteId);
      showToast('Folder deleted');
      setDeleteId(null);
    }
  };

  const folderItemCount = (folderId: string) => {
    return notes.filter(n => n.folderId === folderId).length + pdfs.filter(p => p.folderId === folderId).length;
  };

  return (
    <div className="min-h-screen pb-24">
      <Header title="My Notes" showSearch onSearch={() => {}} right={
        <button onClick={() => setShowNewFolder(true)} className="flex items-center justify-center w-9 h-9 rounded-xl bg-cloud-50 dark:bg-midnight-300 text-slate2-900 dark:text-white hover:bg-cloud-100 transition">
          <FolderPlus size={18} />
        </button>
      } />

      <div className="mx-auto max-w-md px-4 pt-4 space-y-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search notes and sermons" />

        {/* Tabs */}
        <div className="flex gap-2">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`chip flex items-center gap-1.5 ${tab === t.key ? 'bg-indigo-royal text-white' : 'bg-cloud-50 dark:bg-midnight-300 text-slate2-900 dark:text-white'}`}
            >
              {t.label}
              <span className={`text-[10px] px-1.5 rounded-full ${tab === t.key ? 'bg-white/20' : 'bg-cloud-200 dark:bg-midnight-100'}`}>{t.count}</span>
            </button>
          ))}
        </div>

        {/* Folders (only show in notes/sermons tab) */}
        {tab !== 'pdfs' && !search && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">Folders</h2>
            <div className="space-y-2">
              {filteredFolders.map(f => (
                <div key={f.id} className="relative">
                  <button
                    onClick={() => navigate({ name: 'folderView', folderId: f.id })}
                    className="card p-4 w-full flex items-center gap-3 text-left hover:shadow-card transition active:scale-[0.98]"
                  >
                    <span className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0" style={{ backgroundColor: f.color + '20', color: f.color }}>
                      <FolderIcon size={18} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-slate2-900 dark:text-white">{f.name}</h3>
                      <p className="text-xs text-slate-400">{folderItemCount(f.id)} items</p>
                    </div>
                    <ChevronRight size={18} className="text-slate-300 dark:text-slate-600" />
                  </button>
                  <button
                    onClick={() => setMenuFolder(menuFolder === f.id ? null : f.id)}
                    className="absolute right-12 top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    <MoreVertical size={16} />
                  </button>
                  {menuFolder === f.id && (
                    <div className="absolute right-10 top-12 z-20 bg-white dark:bg-midnight-200 rounded-xl shadow-float border border-cloud-200 dark:border-midnight-100 py-1 min-w-[120px]">
                      <button onClick={() => { setRenameId(f.id); setRenameText(f.name); setMenuFolder(null); }} className="w-full text-left px-3 py-2 text-sm text-slate2-900 dark:text-white hover:bg-cloud-50 dark:hover:bg-midnight-300">Rename</button>
                      <button onClick={() => { setDeleteId(f.id); setMenuFolder(null); }} className="w-full text-left px-3 py-2 text-sm text-coral-600 hover:bg-coral-50 dark:hover:bg-coral-600/20">Delete</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Items */}
        {tab === 'pdfs' ? (
          filteredPdfs.length > 0 ? (
            <div className="space-y-3">
              {filteredPdfs.map(p => (
                <PdfCard key={p.id} title={p.title} author={p.author} date={p.date} pageCount={p.pageCount} onClick={() => navigate({ name: 'pdfReader', pdfId: p.id })} />
              ))}
            </div>
          ) : (
            <EmptyState icon={<FileText size={28} />} title="No PDFs yet" description="Import a sermon PDF to start reading and referencing Scripture." />
          )
        ) : filteredNotes.length > 0 ? (
          <div className="space-y-3">
            {filteredNotes.map(n => (
              <NoteCard key={n.id} note={n} onClick={() => navigate({ name: 'noteDetail', noteId: n.id })} />
            ))}
          </div>
        ) : (
          <EmptyState icon={tab === 'sermons' ? <BookOpen size={28} /> : <PenLine size={28} />} title={search ? 'No matching notes' : 'No notes yet'} description={search ? 'Try a different search term.' : 'Create your first note to get started.'} action={
            <button onClick={() => navigate({ name: 'editor', noteId: null })} className="btn-primary flex items-center gap-2"><Plus size={18} /> New Note</button>
          } />
        )}
      </div>

      {/* Floating New Note button */}
      {tab !== 'pdfs' && (
        <button
          onClick={() => navigate({ name: 'editor', noteId: null })}
          className="fixed bottom-24 right-4 z-30 flex items-center justify-center w-14 h-14 rounded-full bg-coral-500 text-white shadow-coral hover:scale-105 transition active:scale-95"
          aria-label="New Note"
        >
          <Plus size={26} />
        </button>
      )}

      {/* New folder dialog */}
      <Dialog
        open={showNewFolder}
        onClose={() => setShowNewFolder(false)}
        title="New Folder"
        actions={
          <>
            <button onClick={() => setShowNewFolder(false)} className="btn-ghost flex-1">Cancel</button>
            <button onClick={handleCreateFolder} className="btn-primary flex-1">Create</button>
          </>
        }
      >
        <input
          type="text"
          value={newFolderName}
          onChange={e => setNewFolderName(e.target.value)}
          placeholder="Folder name"
          className="input-base"
          autoFocus
        />
      </Dialog>

      {/* Rename dialog */}
      <Dialog
        open={renameId !== null}
        onClose={() => setRenameId(null)}
        title="Rename Folder"
        actions={
          <>
            <button onClick={() => setRenameId(null)} className="btn-ghost flex-1">Cancel</button>
            <button onClick={handleRename} className="btn-primary flex-1">Rename</button>
          </>
        }
      >
        <input
          type="text"
          value={renameText}
          onChange={e => setRenameText(e.target.value)}
          placeholder="Folder name"
          className="input-base"
          autoFocus
        />
      </Dialog>

      {/* Delete confirmation */}
      <Dialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title="Delete Folder?"
        actions={
          <>
            <button onClick={() => setDeleteId(null)} className="btn-ghost flex-1">Cancel</button>
            <button onClick={handleDelete} className="btn-coral flex-1">Delete</button>
          </>
        }
      >
        <p className="text-sm text-slate-500 dark:text-slate-400">Notes in this folder will be moved to Sermons. This cannot be undone.</p>
      </Dialog>
    </div>
  );
}
