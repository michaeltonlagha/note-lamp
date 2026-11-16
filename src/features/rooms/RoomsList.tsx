import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/services/supabase';
import Header from '@/components/Header';
import EmptyState from '@/components/EmptyState';
import { Plus, BookOpen, Users, Loader2, ChevronRight, Trash2 } from 'lucide-react';
import CreateRoomModal from './CreateRoomModal';
import JoinRoomModal from './JoinRoomModal';
import type { Screen } from '@/App';
import type { ReadingRoom, RoomProgress } from './roomTypes';

interface RoomsListProps {
  navigate: (s: Screen) => void;
}

export default function RoomsList({ navigate }: RoomsListProps) {
  const { showToast, userEmail } = useApp();
  const [rooms, setRooms] = useState<ReadingRoom[]>([]);
  const [progress, setProgress] = useState<Record<string, RoomProgress[]>>({});
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    const { data: roomData } = await supabase
      .from('reading_rooms')
      .select('*')
      .order('created_at', { ascending: false });

    const roomsList = (roomData ?? []) as unknown as ReadingRoom[];
    setRooms(roomsList);

    if (roomsList.length > 0) {
      const progressPromises = roomsList.map(r =>
        supabase.from('reading_room_progress').select('*').eq('room_id', r.id)
      );
      const results = await Promise.all(progressPromises);
      const progressMap: Record<string, RoomProgress[]> = {};
      roomsList.forEach((r, i) => {
        progressMap[r.id] = (results[i].data ?? []) as unknown as RoomProgress[];
      });
      setProgress(progressMap);
    }

    setLoading(false);
  }, []);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  const handleDeleteRoom = async (roomId: string) => {
    await supabase.from('reading_rooms').delete().eq('id', roomId);
    showToast('Room deleted');
    fetchRooms();
  };

  const getMyProgress = (roomId: string): number => {
    const entries = progress[roomId] ?? [];
    const mine = entries.find(p => p.current_page !== undefined);
    return mine?.current_page ?? 0;
  };

  const getAvgProgress = (roomId: string, total: number): number => {
    const entries = progress[roomId] ?? [];
    if (entries.length === 0 || total === 0) return 0;
    const sum = entries.reduce((acc, p) => acc + (p.current_page ?? 0), 0);
    return Math.round((sum / entries.length / total) * 100);
  };

  return (
    <div className="min-h-screen pb-24">
      <Header title="Reading Rooms" showBack onBack={() => navigate({ name: 'home' })} right={
        <div className="flex items-center gap-2">
          <button onClick={() => setShowJoin(true)} className="flex items-center justify-center w-9 h-9 rounded-xl bg-cloud-50 dark:bg-midnight-300 text-indigo-royal dark:text-indigo-300 hover:bg-cloud-100 transition" aria-label="Join room">
            <Users size={18} />
          </button>
          <button onClick={() => setShowCreate(true)} className="flex items-center justify-center w-9 h-9 rounded-xl bg-cloud-50 dark:bg-midnight-300 text-slate2-900 dark:text-white hover:bg-cloud-100 transition" aria-label="Create room">
            <Plus size={18} />
          </button>
        </div>
      } />

      <div className="mx-auto max-w-md px-4 pt-4 space-y-4">
        <div className="rounded-2xl bg-gradient-to-br from-teal-500 to-electric-500 p-5 text-white shadow-soft">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen size={20} />
            <h2 className="font-bold text-lg">Read Together</h2>
          </div>
          <p className="text-sm text-white/90 leading-relaxed">
            Create or join a reading room to read a book with your group. Track progress, share lessons, and discuss together.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-12 gap-3">
            <Loader2 size={24} className="text-indigo-royal animate-spin" />
            <p className="text-sm text-slate-400">Loading rooms...</p>
          </div>
        ) : rooms.length === 0 ? (
          <EmptyState
            icon={<BookOpen size={28} />}
            title="No reading rooms yet"
            description="Create a room to start reading a book with your group, or join an existing room with a code."
            action={
              <div className="flex gap-3">
                <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2"><Plus size={18} /> Create</button>
                <button onClick={() => setShowJoin(true)} className="btn-ghost flex items-center gap-2"><Users size={18} /> Join</button>
              </div>
            }
          />
        ) : (
          <div className="space-y-3">
            {rooms.map(room => {
              const avg = getAvgProgress(room.id, room.total_pages);
              const myPage = getMyProgress(room.id);
              const isCreator = userEmail && room.created_by !== '';
              return (
                <div key={room.id} className="card p-4 hover:shadow-card transition active:scale-[0.98]">
                  <button onClick={() => navigate({ name: 'roomDetail', roomId: room.id })} className="w-full text-left">
                    <div className="flex items-start gap-3">
                      <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-teal-400 to-electric-500 text-white shrink-0">
                        <BookOpen size={20} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm text-slate2-900 dark:text-white truncate">{room.name}</h3>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">
                          {room.book_title}{room.book_author ? ` by ${room.book_author}` : ''}
                        </p>
                        {room.total_pages > 0 && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                              <span>Group progress</span>
                              <span className="font-semibold text-teal-600 dark:text-teal-400">{avg}%</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-cloud-100 dark:bg-midnight-100 overflow-hidden">
                              <div className="h-full rounded-full bg-gradient-to-r from-teal-400 to-electric-500 transition-all" style={{ width: `${avg}%` }} />
                            </div>
                          </div>
                        )}
                        {myPage > 0 && (
                          <p className="text-[10px] text-indigo-royal dark:text-indigo-300 font-medium mt-1.5">You're on page {myPage}</p>
                        )}
                      </div>
                      <ChevronRight size={18} className="text-slate-300 dark:text-slate-600 shrink-0 mt-1" />
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <CreateRoomModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={() => { setShowCreate(false); fetchRooms(); }}
      />
      <JoinRoomModal
        open={showJoin}
        onClose={() => setShowJoin(false)}
        onJoined={() => { setShowJoin(false); fetchRooms(); }}
      />
    </div>
  );
}
