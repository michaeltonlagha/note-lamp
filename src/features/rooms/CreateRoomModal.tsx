import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/services/supabase';
import { X, Loader2, BookOpen } from 'lucide-react';

interface CreateRoomModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export default function CreateRoomModal({ open, onClose, onCreated }: CreateRoomModalProps) {
  const { showToast } = useApp();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [totalPages, setTotalPages] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      showToast('Please enter a room name', 'error');
      return;
    }
    setLoading(true);

    const pages = parseInt(totalPages) || 0;
    const inviteCode = generateInviteCode();

    const { data: room, error: roomErr } = await supabase
      .from('reading_rooms')
      .insert({
        name: name.trim(),
        description: description.trim(),
        book_title: bookTitle.trim(),
        book_author: bookAuthor.trim(),
        total_pages: pages,
        invite_code: inviteCode,
      })
      .select()
      .single();

    if (roomErr || !room) {
      showToast('Failed to create room', 'error');
      setLoading(false);
      return;
    }

    const roomId = (room as Record<string, unknown>).id as string;

    // Add creator as member
    await supabase.from('reading_room_members').insert({ room_id: roomId });

    // Initialize progress at page 0
    await supabase.from('reading_room_progress').insert({ room_id: roomId, current_page: 0 });

    setLoading(false);
    showToast('Room created!');
    setName(''); setDescription(''); setBookTitle(''); setBookAuthor(''); setTotalPages('');
    onCreated();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-midnight-400/50 animate-fadeIn" />
      <div className="relative w-full max-w-sm bg-white dark:bg-midnight-200 rounded-3xl shadow-float p-6 animate-slideUp max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-teal-500 text-white">
              <BookOpen size={18} />
            </span>
            <h2 className="font-bold text-slate2-900 dark:text-white">New Reading Room</h2>
          </div>
          <button onClick={onClose} className="flex items-center justify-center w-8 h-8 rounded-lg bg-cloud-50 dark:bg-midnight-300 text-slate-400 hover:text-slate-600 transition">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">Room Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Mere Christianity Study"
              className="input-base"
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">Description (optional)</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What's this group reading about?"
              className="input-base resize-none"
              rows={2}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">Book Title</label>
            <input
              type="text"
              value={bookTitle}
              onChange={e => setBookTitle(e.target.value)}
              placeholder="e.g. Mere Christianity"
              className="input-base"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">Author (optional)</label>
            <input
              type="text"
              value={bookAuthor}
              onChange={e => setBookAuthor(e.target.value)}
              placeholder="e.g. C.S. Lewis"
              className="input-base"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">Total Pages (optional)</label>
            <input
              type="number"
              value={totalPages}
              onChange={e => setTotalPages(e.target.value)}
              placeholder="e.g. 256"
              className="input-base"
              min={0}
            />
          </div>
        </div>

        <button
          onClick={handleCreate}
          disabled={loading || !name.trim()}
          className="btn-primary w-full flex items-center justify-center gap-2 mt-5 disabled:opacity-50"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <BookOpen size={18} />}
          {loading ? 'Creating...' : 'Create Room'}
        </button>
      </div>
    </div>
  );
}
