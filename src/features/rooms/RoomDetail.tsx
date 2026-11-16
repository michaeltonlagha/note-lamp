import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/services/supabase';
import Header from '@/components/Header';
import EmptyState from '@/components/EmptyState';
import { BookOpen, Users, Send, Loader2, Trash2, MessageSquare, Minus, Plus } from 'lucide-react';
import type { Screen } from '@/App';
import type { ReadingRoom, RoomMember, RoomProgress, RoomPost } from './roomTypes';

interface RoomDetailProps {
  navigate: (s: Screen) => void;
  roomId: string;
}

export default function RoomDetail({ navigate, roomId }: RoomDetailProps) {
  const { showToast } = useApp();
  const [room, setRoom] = useState<ReadingRoom | null>(null);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [progressList, setProgressList] = useState<RoomProgress[]>([]);
  const [posts, setPosts] = useState<RoomPost[]>([]);
  const [myPage, setMyPage] = useState(0);
  const [newPost, setNewPost] = useState('');
  const [postPageRef, setPostPageRef] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'progress' | 'discussion'>('progress');

  const fetchData = useCallback(async () => {
    const [roomRes, membersRes, progressRes, postsRes] = await Promise.all([
      supabase.from('reading_rooms').select('*').eq('id', roomId).maybeSingle(),
      supabase.from('reading_room_members').select('*').eq('room_id', roomId).order('joined_at'),
      supabase.from('reading_room_progress').select('*').eq('room_id', roomId),
      supabase.from('reading_room_posts').select('*').eq('room_id', roomId).order('created_at', { ascending: false }),
    ]);

    const r = roomRes.data as unknown as ReadingRoom | null;
    setRoom(r);
    setMembers((membersRes.data ?? []) as unknown as RoomMember[]);
    const prog = (progressRes.data ?? []) as unknown as RoomProgress[];
    setProgressList(prog);
    setPosts((postsRes.data ?? []) as unknown as RoomPost[]);
    const mine = prog.find(p => p.current_page !== undefined);
    setMyPage(mine?.current_page ?? 0);
    setLoading(false);
  }, [roomId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Refresh posts every 15 seconds for live discussion
  useEffect(() => {
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from('reading_room_posts')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: false });
      if (data) setPosts(data as unknown as RoomPost[]);
    }, 15000);
    return () => clearInterval(interval);
  }, [roomId]);

  const updateProgress = async (delta: number) => {
    const newPage = Math.max(0, myPage + delta);
    setMyPage(newPage);
    const existing = progressList.find(p => p.current_page !== undefined);
    if (existing) {
      await supabase.from('reading_room_progress').update({ current_page: newPage, updated_at: new Date().toISOString() }).eq('id', existing.id);
    } else {
      await supabase.from('reading_room_progress').insert({ room_id: roomId, current_page: newPage });
      fetchData();
    }
  };

  const handleSetPage = async () => {
    const page = parseInt(postPageRef) || 0;
    setMyPage(page);
    const existing = progressList.find(p => p.current_page !== undefined);
    if (existing) {
      await supabase.from('reading_room_progress').update({ current_page: page, updated_at: new Date().toISOString() }).eq('id', existing.id);
    }
    showToast('Progress updated');
  };

  const handlePost = async () => {
    if (!newPost.trim()) return;
    setSubmitting(true);
    const pageRef = postPageRef.trim() ? parseInt(postPageRef) : null;
    await supabase.from('reading_room_posts').insert({
      room_id: roomId,
      content: newPost.trim(),
      page_reference: pageRef,
    });
    setNewPost('');
    setPostPageRef('');
    setSubmitting(false);
    showToast('Posted!');
    fetchData();
  };

  const handleDeletePost = async (postId: string) => {
    await supabase.from('reading_room_posts').delete().eq('id', postId);
    setPosts(prev => prev.filter(p => p.id !== postId));
    showToast('Post deleted');
  };

  const handleLeaveRoom = async () => {
    const existing = members.find(m => m.user_id !== undefined);
    if (existing) {
      await supabase.from('reading_room_members').delete().eq('id', existing.id);
    }
    showToast('Left the room');
    navigate({ name: 'roomList' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <Loader2 size={28} className="text-indigo-royal animate-spin" />
        <p className="text-sm text-slate-400">Loading room...</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen pb-24">
        <Header title="Room" showBack onBack={() => navigate({ name: 'roomList' })} />
        <EmptyState icon={<BookOpen size={28} />} title="Room not found" />
      </div>
    );
  }

  const avgProgress = room.total_pages > 0 && progressList.length > 0
    ? Math.round(progressList.reduce((acc, p) => acc + (p.current_page ?? 0), 0) / progressList.length / room.total_pages * 100)
    : 0;
  const myProgressPct = room.total_pages > 0 ? Math.round((myPage / room.total_pages) * 100) : 0;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffH = Math.floor((now.getTime() - d.getTime()) / 3600000);
    if (diffH < 1) return 'just now';
    if (diffH < 24) return `${diffH}h ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen pb-24">
      <Header title={room.name} showBack onBack={() => navigate({ name: 'roomList' })} />

      <div className="mx-auto max-w-md px-4 pt-4 space-y-4">
        {/* Room info card */}
        <div className="rounded-2xl bg-gradient-to-br from-teal-500 to-electric-500 p-5 text-white shadow-soft">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen size={20} />
            <h2 className="font-bold text-lg leading-tight">{room.name}</h2>
          </div>
          {room.description && <p className="text-sm text-white/90 mb-3 leading-relaxed">{room.description}</p>}
          <div className="flex items-center gap-4 text-xs text-white/80">
            <span className="flex items-center gap-1"><BookOpen size={14} /> {room.book_title || 'No book set'}{room.book_author ? ` — ${room.book_author}` : ''}</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-white/80 mt-1">
            <span className="flex items-center gap-1"><Users size={14} /> {members.length} member{members.length !== 1 ? 's' : ''}</span>
            {room.total_pages > 0 && <span>{room.total_pages} pages</span>}
          </div>
        </div>

        {/* Group progress bar */}
        {room.total_pages > 0 && (
          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Group Progress</span>
              <span className="text-sm font-bold text-teal-600 dark:text-teal-400">{avgProgress}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-cloud-100 dark:bg-midnight-100 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-teal-400 to-electric-500 transition-all" style={{ width: `${avgProgress}%` }} />
            </div>
          </div>
        )}

        {/* My progress */}
        {room.total_pages > 0 && (
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Your Progress</span>
              <span className="text-sm font-bold text-indigo-royal dark:text-indigo-300">{myProgressPct}%</span>
            </div>
            <div className="h-2 rounded-full bg-cloud-100 dark:bg-midnight-100 overflow-hidden mb-3">
              <div className="h-full rounded-full bg-indigo-royal transition-all" style={{ width: `${myProgressPct}%` }} />
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => updateProgress(-1)} className="flex items-center justify-center w-9 h-9 rounded-lg bg-cloud-50 dark:bg-midnight-300 text-slate2-900 dark:text-white hover:bg-cloud-100 transition">
                <Minus size={16} />
              </button>
              <div className="flex-1 text-center">
                <span className="text-lg font-bold text-slate2-900 dark:text-white">{myPage}</span>
                <span className="text-sm text-slate-400"> / {room.total_pages}</span>
              </div>
              <button onClick={() => updateProgress(1)} className="flex items-center justify-center w-9 h-9 rounded-lg bg-cloud-50 dark:bg-midnight-300 text-slate2-900 dark:text-white hover:bg-cloud-100 transition">
                <Plus size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('progress')}
            className={`chip flex-1 flex items-center justify-center gap-1.5 ${activeTab === 'progress' ? 'bg-indigo-royal text-white' : 'bg-cloud-50 dark:bg-midnight-300 text-slate2-900 dark:text-white'}`}
          >
            <Users size={14} /> Members
          </button>
          <button
            onClick={() => setActiveTab('discussion')}
            className={`chip flex-1 flex items-center justify-center gap-1.5 ${activeTab === 'discussion' ? 'bg-indigo-royal text-white' : 'bg-cloud-50 dark:bg-midnight-300 text-slate2-900 dark:text-white'}`}
          >
            <MessageSquare size={14} /> Discussion
          </button>
        </div>

        {/* Members tab */}
        {activeTab === 'progress' && (
          <div className="space-y-2">
            {progressList.map((p, i) => {
              const pct = room.total_pages > 0 ? Math.round((p.current_page / room.total_pages) * 100) : 0;
              const member = members.find(m => m.user_id === p.user_id);
              const isMe = member?.user_id !== undefined;
              return (
                <div key={p.id || i} className="card p-3 flex items-center gap-3">
                  <span className="flex items-center justify-center w-9 h-9 rounded-full bg-indigo-royal/15 text-indigo-royal dark:text-indigo-300 font-bold text-sm shrink-0">
                    {isMe ? 'You' : `M${i + 1}`}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate2-900 dark:text-white">{isMe ? 'You' : `Member ${i + 1}`}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 rounded-full bg-cloud-100 dark:bg-midnight-100 overflow-hidden">
                        <div className="h-full rounded-full bg-teal-500" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400">{p.current_page}/{room.total_pages || '?'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {progressList.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-6">No progress tracked yet.</p>
            )}
          </div>
        )}

        {/* Discussion tab */}
        {activeTab === 'discussion' && (
          <div className="space-y-3">
            {/* New post */}
            <div className="card p-4 space-y-3">
              <textarea
                value={newPost}
                onChange={e => setNewPost(e.target.value)}
                placeholder="Share a lesson, insight, or question..."
                className="input-base resize-none"
                rows={3}
              />
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={postPageRef}
                  onChange={e => setPostPageRef(e.target.value)}
                  placeholder="Page #"
                  className="input-base w-20 text-center"
                  min={0}
                />
                <button
                  onClick={handlePost}
                  disabled={submitting || !newPost.trim()}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  Post
                </button>
              </div>
            </div>

            {/* Posts */}
            {posts.length === 0 ? (
              <EmptyState icon={<MessageSquare size={28} />} title="No posts yet" description="Start the conversation by sharing your first thought." />
            ) : (
              posts.map(post => {
                const isMyPost = post.user_id !== undefined;
                return (
                  <div key={post.id} className="card p-4 animate-slideUp">
                    <div className="flex items-start gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-teal-50 dark:bg-teal-600/20 text-teal-600 text-xs font-bold shrink-0">
                        {isMyPost ? 'You' : 'M'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{formatDate(post.created_at)}</span>
                          {isMyPost && (
                            <button onClick={() => handleDeletePost(post.id)} className="text-slate-300 hover:text-coral-500 transition">
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                        {post.page_reference && (
                          <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-royal/10 text-indigo-royal dark:text-indigo-300 mb-1.5">
                            Page {post.page_reference}
                          </span>
                        )}
                        <p className="text-sm text-slate2-900 dark:text-white leading-relaxed whitespace-pre-wrap">{post.content}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Leave room */}
        <button onClick={handleLeaveRoom} className="w-full text-center text-sm text-coral-500 font-medium py-2 mt-2">
          Leave Room
        </button>
      </div>
    </div>
  );
}
