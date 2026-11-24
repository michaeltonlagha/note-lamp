import { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/services/supabase';
import Header from '@/components/Header';
import EmptyState from '@/components/EmptyState';
import { BookOpen, Users, Send, Loader2, Trash2, MessageSquare, Minus, Plus, Image as ImageIcon, Mic, Square, Play, Pause, X, UserPlus } from 'lucide-react';
import RoomInviteModal from './RoomInviteModal';
import type { Screen } from '@/App';
import type { ReadingRoom, RoomMember, RoomProgress, RoomPost } from './roomTypes';

interface RoomDetailProps {
  navigate: (s: Screen) => void;
  roomId: string;
}

export default function RoomDetail({ navigate, roomId }: RoomDetailProps) {
  const { showToast, userId, displayName } = useApp();
  const [room, setRoom] = useState<ReadingRoom | null>(null);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [progressList, setProgressList] = useState<RoomProgress[]>([]);
  const [posts, setPosts] = useState<RoomPost[]>([]);
  const [memberNames, setMemberNames] = useState<Record<string, string>>({});
  const [myPage, setMyPage] = useState(0);
  const [newPost, setNewPost] = useState('');
  const [postPageRef, setPostPageRef] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'progress' | 'discussion'>('progress');
  const [showInvite, setShowInvite] = useState(false);

  // Media attachment state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Audio playback state
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const fetchData = useCallback(async () => {
    const [roomRes, membersRes, progressRes, postsRes] = await Promise.all([
      supabase.from('reading_rooms').select('*').eq('id', roomId).maybeSingle(),
      supabase.from('reading_room_members').select('*').eq('room_id', roomId).order('joined_at'),
      supabase.from('reading_room_progress').select('*').eq('room_id', roomId),
      supabase.from('reading_room_posts').select('*').eq('room_id', roomId).order('created_at', { ascending: false }),
    ]);

    const r = roomRes.data as unknown as ReadingRoom | null;
    setRoom(r);
    const memberRows = (membersRes.data ?? []) as unknown as RoomMember[];
    setMembers(memberRows);
    const prog = (progressRes.data ?? []) as unknown as RoomProgress[];
    setProgressList(prog);
    setPosts((postsRes.data ?? []) as unknown as RoomPost[]);
    const mine = prog.find(p => p.user_id === userId);
    setMyPage(mine?.current_page ?? 0);
    setLoading(false);

    // Load display names for all members + post authors
    const authorIds = new Set<string>(memberRows.map(m => m.user_id));
    (postsRes.data ?? []).forEach(p => authorIds.add((p as RoomPost).user_id));
    const ids = Array.from(authorIds).filter(Boolean);
    if (ids.length > 0) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', ids);
      const names: Record<string, string> = {};
      (profileData ?? []).forEach((p) => {
        names[(p as { id: string; display_name: string }).id] = (p as { id: string; display_name: string }).display_name;
      });
      setMemberNames(names);
    }
  }, [userId]);

  useEffect(() => { fetchData(); }, [fetchData]);

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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be under 5MB', 'error');
      return;
    }
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setSelectedImage(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop());
          streamRef.current = null;
        }
      };

      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    } catch {
      showToast('Microphone access denied', 'error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  };

  const cancelRecording = () => {
    stopRecording();
    setAudioBlob(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setRecordingSeconds(0);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handlePost = async () => {
    if (!newPost.trim() && !selectedImage && !audioBlob) return;
    setSubmitting(true);

    let uploadedImageUrl: string | null = null;
    let uploadedAudioUrl: string | null = null;

    try {
      if (selectedImage) {
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData.user?.id ?? 'unknown';
        const ext = selectedImage.name.split('.').pop() || 'jpg';
        const fileName = `${userId}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from('room-images')
          .upload(fileName, selectedImage);
        if (upErr) throw new Error('Image upload failed');
        uploadedImageUrl = supabase.storage.from('room-images').getPublicUrl(fileName).data.publicUrl;
      }

      if (audioBlob) {
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData.user?.id ?? 'unknown';
        const fileName = `${userId}/${Date.now()}.webm`;
        const { error: upErr } = await supabase.storage
          .from('room-audio')
          .upload(fileName, audioBlob, { contentType: 'audio/webm' });
        if (upErr) throw new Error('Audio upload failed');
        uploadedAudioUrl = supabase.storage.from('room-audio').getPublicUrl(fileName).data.publicUrl;
      }

      const pageRef = postPageRef.trim() ? parseInt(postPageRef) : null;
      await supabase.from('reading_room_posts').insert({
        room_id: roomId,
        content: newPost.trim() || null,
        page_reference: pageRef,
        image_url: uploadedImageUrl,
        audio_url: uploadedAudioUrl,
      });

      setNewPost('');
      setPostPageRef('');
      clearImage();
      cancelRecording();
      showToast('Posted!');
      fetchData();
    } catch {
      showToast('Failed to post. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async (postId: string, imageUrl?: string | null, audioUrl?: string | null) => {
    // Delete associated media from storage
    if (imageUrl) {
      const path = imageUrl.split('/room-images/')[1];
      if (path) await supabase.storage.from('room-images').remove([path]);
    }
    if (audioUrl) {
      const path = audioUrl.split('/room-audio/')[1];
      if (path) await supabase.storage.from('room-audio').remove([path]);
    }
    await supabase.from('reading_room_posts').delete().eq('id', postId);
    setPosts(prev => prev.filter(p => p.id !== postId));
    showToast('Post deleted');
  };

  const handlePlayAudio = (url: string, postId: string) => {
    if (playingAudioId === postId) {
      if (audioRef.current) {
        audioRef.current.pause();
        setPlayingAudioId(null);
      }
      return;
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(url);
    audio.onended = () => setPlayingAudioId(null);
    audio.play();
    audioRef.current = audio;
    setPlayingAudioId(postId);
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLeaveRoom = async () => {
    const existing = members.find(m => m.user_id === userId);
    if (existing) {
      await supabase.from('reading_room_members').delete().eq('id', existing.id);
    }
    showToast('Left the room');
    navigate({ name: 'roomList' });
  };

  const nameFor = (uid: string | undefined): string => {
    if (!uid) return 'Member';
    if (uid === userId) return 'You';
    const name = memberNames[uid];
    if (name) return name;
    return 'Member';
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

  const canPost = newPost.trim() || selectedImage || audioBlob;

  return (
    <div className="min-h-screen pb-24">
      <Header
        title={room.name}
        showBack
        onBack={() => navigate({ name: 'roomList' })}
        right={
          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-cloud-50 dark:bg-midnight-300 text-indigo-royal dark:text-indigo-300 hover:bg-cloud-100 transition"
            aria-label="Invite friends"
          >
            <UserPlus size={18} />
          </button>
        }
      />

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
            {progressList.map((p) => {
              const pct = room.total_pages > 0 ? Math.round((p.current_page / room.total_pages) * 100) : 0;
              const isMe = p.user_id === userId;
              const name = nameFor(p.user_id);
              const initials = name === 'You' ? 'You' : name.slice(0, 2).toUpperCase();
              return (
                <div key={p.id} className="card p-3 flex items-center gap-3">
                  <span className="flex items-center justify-center w-9 h-9 rounded-full bg-indigo-royal/15 text-indigo-royal dark:text-indigo-300 font-bold text-xs shrink-0 uppercase">
                    {initials}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate2-900 dark:text-white truncate">{name}</p>
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
            {/* New post composer */}
            <div className="card p-4 space-y-3">
              <textarea
                value={newPost}
                onChange={e => setNewPost(e.target.value)}
                placeholder="Share a lesson, insight, or question..."
                className="input-base resize-none"
                rows={3}
              />

              {/* Image preview */}
              {imagePreview && (
                <div className="relative rounded-xl overflow-hidden">
                  <img src={imagePreview} alt="Selected" className="w-full max-h-48 object-cover rounded-xl" />
                  <button
                    onClick={clearImage}
                    className="absolute top-2 right-2 flex items-center justify-center w-7 h-7 rounded-lg bg-midnight-400/70 text-white hover:bg-midnight-400 transition"
                  >
                    <X size={15} />
                  </button>
                </div>
              )}

              {/* Audio recording indicator / playback */}
              {isRecording && (
                <div className="flex items-center gap-3 rounded-xl bg-coral-50 dark:bg-coral-600/15 p-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-coral-500 text-white animate-pulse">
                    <Mic size={16} />
                  </span>
                  <span className="text-sm font-mono font-bold text-coral-600 dark:text-coral-400">{formatTime(recordingSeconds)}</span>
                  <span className="text-xs text-coral-600 dark:text-coral-400">Recording...</span>
                  <button onClick={stopRecording} className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-coral-500 text-white text-xs font-semibold">
                    <Square size={12} /> Stop
                  </button>
                </div>
              )}

              {audioUrl && !isRecording && (
                <div className="flex items-center gap-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 p-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-royal text-white">
                    <Mic size={16} />
                  </span>
                  <span className="text-sm font-medium text-indigo-royal dark:text-indigo-300">Audio attached ({formatTime(recordingSeconds)})</span>
                  <button onClick={cancelRecording} className="ml-auto text-slate-400 hover:text-coral-500 transition">
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* Media buttons + page ref + post */}
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!!imagePreview || isRecording}
                  className="flex items-center justify-center w-9 h-9 rounded-lg bg-cloud-50 dark:bg-midnight-300 text-slate2-900 dark:text-white hover:bg-cloud-100 transition disabled:opacity-40 shrink-0"
                  aria-label="Add image"
                >
                  <ImageIcon size={16} />
                </button>
                {!isRecording && !audioUrl ? (
                  <button
                    onClick={startRecording}
                    disabled={!!audioBlob}
                    className="flex items-center justify-center w-9 h-9 rounded-lg bg-cloud-50 dark:bg-midnight-300 text-slate2-900 dark:text-white hover:bg-cloud-100 transition disabled:opacity-40 shrink-0"
                    aria-label="Record audio"
                  >
                    <Mic size={16} />
                  </button>
                ) : null}
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
                  disabled={submitting || !canPost}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  Post
                </button>
              </div>
            </div>

            {/* Posts */}
            {posts.length === 0 ? (
              <EmptyState icon={<MessageSquare size={28} />} title="No posts yet" description="Share a thought, screenshot, or voice memo to start the conversation." />
            ) : (
              posts.map(post => {
                const isMyPost = post.user_id === userId;
                const authorName = nameFor(post.user_id);
                const initials = authorName === 'You' ? 'You' : authorName.slice(0, 2).toUpperCase();
                return (
                  <div key={post.id} className="card p-4 animate-slideUp">
                    <div className="flex items-start gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-teal-50 dark:bg-teal-600/20 text-teal-600 text-xs font-bold shrink-0 uppercase">
                        {initials}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs font-semibold text-slate2-900 dark:text-white truncate">{authorName}</span>
                            <span className="text-xs text-slate-400 shrink-0">{formatDate(post.created_at)}</span>
                          </div>
                          {isMyPost && (
                            <button
                              onClick={() => handleDeletePost(post.id, post.image_url, post.audio_url)}
                              className="text-slate-300 hover:text-coral-500 transition shrink-0"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                        {post.page_reference && (
                          <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-royal/10 text-indigo-royal dark:text-indigo-300 mb-1.5">
                            Page {post.page_reference}
                          </span>
                        )}
                        {post.content && (
                          <p className="text-sm text-slate2-900 dark:text-white leading-relaxed whitespace-pre-wrap mb-2">{post.content}</p>
                        )}
                        {/* Post image */}
                        {post.image_url && (
                          <div className="rounded-xl overflow-hidden mb-2 mt-1">
                            <img src={post.image_url} alt="Shared" className="w-full max-h-64 object-cover rounded-xl" />
                          </div>
                        )}
                        {/* Post audio */}
                        {post.audio_url && (
                          <div className="flex items-center gap-3 rounded-xl bg-cloud-50 dark:bg-midnight-300 p-3 mt-1">
                            <button
                              onClick={() => handlePlayAudio(post.audio_url!, post.id)}
                              className="flex items-center justify-center w-9 h-9 rounded-full bg-indigo-royal text-white hover:bg-indigo-700 transition shrink-0"
                            >
                              {playingAudioId === post.id ? <Pause size={16} /> : <Play size={16} />}
                            </button>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-slate2-900 dark:text-white">Voice memo</p>
                              <div className="flex items-center gap-1 mt-1">
                                {[...Array(20)].map((_, i) => (
                                  <span
                                    key={i}
                                    className={`w-0.5 rounded-full ${playingAudioId === post.id ? 'bg-indigo-royal animate-pulse' : 'bg-slate-300 dark:bg-slate-600'}`}
                                    style={{ height: `${4 + (i % 4) * 4}px` }}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
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

      <RoomInviteModal
        open={showInvite}
        onClose={() => setShowInvite(false)}
        roomName={room.name}
        inviteCode={room.invite_code}
      />
    </div>
  );
}
