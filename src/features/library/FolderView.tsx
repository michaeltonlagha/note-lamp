import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import EmptyState from '@/components/EmptyState';
import { NoteCard, PdfCard } from '@/components/Cards';
import { Plus, FolderIcon } from 'lucide-react';
import type { Screen } from '@/App';

interface FolderViewProps {
  navigate: (s: Screen) => void;
  folderId: string;
}

export default function FolderView({ navigate, folderId }: FolderViewProps) {
  const { folders, notes, pdfs } = useApp();
  const [search, setSearch] = useState('');
  const folder = folders.find(f => f.id === folderId);

  if (!folder) {
    return (
      <div className="min-h-screen pb-24">
        <Header title="Folder" showBack onBack={() => navigate({ name: 'myNotes' })} />
        <EmptyState icon={<FolderIcon size={28} />} title="Folder not found" />
      </div>
    );
  }

  const folderNotes = notes.filter(n => n.folderId === folderId && (!search || n.title.toLowerCase().includes(search.toLowerCase())));
  const folderPdfs = pdfs.filter(p => p.folderId === folderId && (!search || p.title.toLowerCase().includes(search.toLowerCase())));

  return (
    <div className="min-h-screen pb-24">
      <Header title={folder.name} subtitle={`${folderNotes.length + folderPdfs.length} items`} showBack onBack={() => navigate({ name: 'myNotes' })} />
      <div className="mx-auto max-w-md px-4 pt-4 space-y-4">
        <SearchBar value={search} onChange={setSearch} placeholder={`Search in ${folder.name}`} />

        {folderNotes.length === 0 && folderPdfs.length === 0 ? (
          <EmptyState
            icon={<FolderIcon size={28} />}
            title={search ? 'No matches' : 'This folder is empty'}
            description={search ? 'Try a different search.' : 'Create a note or add a PDF to this folder.'}
            action={<button onClick={() => navigate({ name: 'editor', noteId: null })} className="btn-primary flex items-center gap-2"><Plus size={18} /> New Note</button>}
          />
        ) : (
          <div className="space-y-3">
            {folderNotes.map(n => (
              <NoteCard key={n.id} note={n} onClick={() => navigate({ name: 'noteDetail', noteId: n.id })} />
            ))}
            {folderPdfs.map(p => (
              <PdfCard key={p.id} title={p.title} author={p.author} date={p.date} pageCount={p.pageCount} onClick={() => navigate({ name: 'pdfReader', pdfId: p.id })} />
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => navigate({ name: 'editor', noteId: null })}
        className="fixed bottom-24 right-4 z-30 flex items-center justify-center w-14 h-14 rounded-full bg-coral-500 text-white shadow-coral hover:scale-105 transition active:scale-95"
        aria-label="New Note"
      >
        <Plus size={26} />
      </button>
    </div>
  );
}
