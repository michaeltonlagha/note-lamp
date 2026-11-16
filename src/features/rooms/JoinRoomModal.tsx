import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/services/supabase';
import { X, Loader2, Users, AlertCircle, BookOpen } from 'lucide-react';
import type { ReadingRoom } from './roomTypes';

interface JoinRoomModalProps {
  open: boolean;
  onClose: () => void;
  onJoined: () => void;
}

export default function JoinRoomModal({ open, onClose, onJoined }: JoinRoomModalProps) {
  const { showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [rooms, setRooms] = useState<ReadingRoom[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const handleSearch = async () => {
    if (searchTerm.trim().length < 2) return;
    setLoading(true);
    setSearched(true);
    const { data } = await supabase
      .from('reading_rooms')
      .select('*')
      .ilike('name', `%${searchTerm.trim()}%`)
      .order('created_at', { ascending: false })
      .limit(10);
    setRooms((data ?? []) as unknown as ReadingRoom[]);
    setLoading(false);
  };

  const handleJoin = async (roomId: string) => {
    setJoiningId(roomId);
    // Check if already a member
    const { data: existing } = await supabase
      .from('reading_room_members')
      .select('id')
      .eq('room_id', roomId)
      .maybeSingle();

    if (existing) {
      showToast('You are already a member of this room', 'info');
      setJoiningId(null);
      onJoined();
      return;
    }

    await supabase.from('reading_room_members').insert({ room_id: roomId });
    await supabase.from('reading_room_progress').insert({ room_id: roomId, current_page: 0 });
    setJoiningId(null);
    showToast('Joined room!');
    setSearchTerm(''); setRooms([]); setSearched(false);
    onJoined();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-midnight-400/50 animate-fadeIn" />
      <div className="relative w-full max-w-sm bg-white dark:bg-midnight-200 rounded-3xl shadow-float p-6 animate-slideUp max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-royal text-white">
              <Users size={18} />
            </span>
            <h2 className="font-bold text-slate2-900 dark:text-white">Join a Room</h2>
          </div>
          <button onClick={onClose} className="flex items-center justify-center w-8 h-8 rounded-lg bg-cloud-50 dark:bg-midnight-300 text-slate-400 hover:text-slate-600 transition">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Search for a reading room by name to join.</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setSearched(false); }}
              onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
              placeholder="Room name..."
              className="input-base flex-1"
              autoFocus
            />
            <button onClick={handleSearch} disabled={loading || searchTerm.trim().length < 2} className="btn-primary px-4 disabled:opacity-50">
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Find'}
            </button>
          </div>

          {searched && rooms.length === 0 && !loading && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <AlertCircle size={16} /> No rooms found matching "{searchTerm}"
            </div>
          )}

          {rooms.length > 0 && (
            <div className="space-y-2">
              {rooms.map(room => (
                <div key={room.id} className="card p-3 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-electric-500 text-white shrink-0">
                    <BookOpen size={18} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-slate2-900 dark:text-white truncate">{room.name}</h3>
                    <p className="text-xs text-slate-400 truncate">{room.book_title}{room.book_author ? ` — ${room.book_author}` : ''}</p>
                    {room.description && <p className="text-xs text-slate-400 truncate mt-0.5">{room.description}</p>}
                  </div>
                  <button
                    onClick={() => handleJoin(room.id)}
                    disabled={joiningId === room.id}
                    className="btn-primary px-3 py-2 text-xs shrink-0 disabled:opacity-50"
                  >
                    {joiningId === room.id ? <Loader2 size={14} className="animate-spin" /> : 'Join'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
