import { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { ChevronLeft, ChevronRight, Play, Pause, Type, X, Minus, Plus } from 'lucide-react';
import { parseReference } from '@/data/bibleData';
import type { Screen } from '@/App';

interface PreacherModeProps {
  navigate: (s: Screen) => void;
  noteId: string;
}

export default function PreacherMode({ navigate, noteId }: PreacherModeProps) {
  const { getNote, openScripture } = useApp();
  const note = getNote(noteId);
  const [section, setSection] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [fontSz, setFontSz] = useState(20);
  const [showControls, setShowControls] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Split sermon into sections by headings
  const sections = (() => {
    if (!note) return [];
    const lines = note.body.split('\n');
    const secs: { heading: string; content: string[] }[] = [];
    let current = { heading: 'Introduction', content: [] as string[] };
    for (const line of lines) {
      if (line.startsWith('# ') || line.startsWith('## ') || line.startsWith('### ')) {
        if (current.content.length > 0 || current.heading !== 'Introduction') secs.push(current);
        current = { heading: line.replace(/^#+\s/, ''), content: [] };
      } else if (line.trim()) {
        current.content.push(line);
      }
    }
    secs.push(current);
    return secs;
  })();

  useEffect(() => {
    if (playing) {
      scrollInterval.current = setInterval(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop += 1.5;
        }
      }, 50);
    } else if (scrollInterval.current) {
      clearInterval(scrollInterval.current);
    }
    return () => { if (scrollInterval.current) clearInterval(scrollInterval.current); };
  }, [playing]);

  if (!note) {
    return <div className="min-h-screen flex items-center justify-center bg-midnight-400 text-white"><p>Sermon not found.</p></div>;
  }

  const currentSection = sections[section] ?? sections[0];

  const renderLine = (line: string) => {
    const refRegex = /\b((?:[1-3]\s)?(?:Genesis|Exodus|Psalms?|Proverbs|Isaiah|Matthew|Mark|Luke|John|Acts|Romans|Corinthians|Galatians|Ephesians|Philippians|Colossians|Thessalonians|Timothy|Hebrews|James|Peter|Revelation|Chronicles|Daniel|Ezekiel|Jeremiah|Jonah|Micah|Habakkuk|Zechariah|Malachi|Numbers|Deuteronomy|Joshua|Judges|Samuel|Kings|Nehemiah|Job|Ecclesiastes|Hosea|Joel|Amos|Titus|Philemon|Jude)\s+\d+:\d+(?:-\d+)?)\b/g;
    const parts = line.split(refRegex);
    return parts.map((part, i) => {
      if (refRegex.test(part) || /\b(?:[1-3]\s)?(?:Genesis|Exodus|Psalms?|Proverbs|Isaiah|Matthew|Mark|Luke|John|Acts|Romans|Corinthians|Galatians|Ephesians|Philippians|Colossians|Thessalonians|Timothy|Hebrews|James|Peter|Revelation|Chronicles|Daniel|Ezekiel|Jeremiah|Jonah|Micah|Habakkuk|Zechariah|Malachi|Numbers|Deuteronomy|Joshua|Judges|Samuel|Kings|Nehemiah|Job|Ecclesiastes|Hosea|Joel|Amos|Titus|Philemon|Jude)\s+\d+:\d+/.test(part)) {
        return (
          <button key={i} onClick={() => { const p = parseReference(part); if (p) openScripture(`${p.book} ${p.chapter}:${p.verse}`); }} className="text-electric-500 dark:text-indigo-300 font-semibold underline decoration-dotted underline-offset-4 hover:text-indigo-royal transition">
            {part}
          </button>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-midnight-400 flex flex-col" onClick={() => setShowControls(s => !s)}>
      {/* Top controls */}
      <div className={`absolute top-0 left-0 right-0 z-10 transition-all ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <div className="flex items-center justify-between px-5 pt-12 pb-4 bg-gradient-to-b from-midnight-500/90 to-transparent">
          <button onClick={(e) => { e.stopPropagation(); navigate({ name: 'noteDetail', noteId }); }} className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 text-white hover:bg-white/20 transition">
            <X size={20} />
          </button>
          <div className="text-center">
            <p className="text-white font-bold text-sm">{note.title}</p>
            <p className="text-white/50 text-xs">Preacher Mode</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={(e) => { e.stopPropagation(); setFontSz(s => Math.max(16, s - 2)); }} className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 text-white hover:bg-white/20 transition">
              <Minus size={16} />
            </button>
            <span className="text-white/70 text-xs w-6 text-center"><Type size={14} className="inline" /></span>
            <button onClick={(e) => { e.stopPropagation(); setFontSz(s => Math.min(32, s + 2)); }} className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 text-white hover:bg-white/20 transition">
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Reading area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 pt-24 pb-32" onClick={(e) => e.stopPropagation()}>
        <div className="max-w-lg mx-auto" style={{ fontSize: `${fontSz}px` }}>
          <h1 className="font-bold text-white text-center mb-8 leading-tight" style={{ fontSize: `${fontSz + 6}px` }}>{currentSection.heading}</h1>
          <div className="space-y-5 leading-relaxed text-white/90 font-serif">
            {currentSection.content.map((line, i) => {
              if (line.startsWith('- ')) return <div key={i} className="flex gap-3 ml-4"><span className="text-electric-500">•</span><span>{renderLine(line.slice(2))}</span></div>;
              if (/^\d+\.\s/.test(line)) return <div key={i} className="flex gap-3 ml-4"><span className="text-electric-500 font-bold">{line.match(/^(\d+)\./)?.[1]}.</span><span>{renderLine(line.replace(/^\d+\.\s/, ''))}</span></div>;
              if (line.startsWith('*') && line.endsWith('*')) return <p key={i} className="italic text-electric-500/80 text-center">{renderLine(line.slice(1, -1))}</p>;
              return <p key={i} className="reading-prose">{renderLine(line)}</p>;
            })}
          </div>
        </div>
      </div>

      {/* Bottom controls */}
      <div className={`absolute bottom-0 left-0 right-0 z-10 transition-all ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <div className="flex items-center justify-between px-6 pb-10 pt-4 bg-gradient-to-t from-midnight-500/95 to-transparent">
          <button
            onClick={(e) => { e.stopPropagation(); setSection(s => Math.max(0, s - 1)); scrollRef.current?.scrollTo({ top: 0 }); }}
            disabled={section === 0}
            className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-white/10 text-white font-medium text-sm disabled:opacity-30 hover:bg-white/20 transition"
          >
            <ChevronLeft size={18} /> Prev
          </button>

          <div className="flex flex-col items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); setPlaying(p => !p); }}
              className="flex items-center justify-center w-14 h-14 rounded-full bg-indigo-royal text-white shadow-indigo hover:scale-105 transition"
            >
              {playing ? <Pause size={24} /> : <Play size={24} />}
            </button>
            <span className="text-white/50 text-xs">{section + 1} / {sections.length}</span>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); setSection(s => Math.min(sections.length - 1, s + 1)); scrollRef.current?.scrollTo({ top: 0 }); }}
            disabled={section >= sections.length - 1}
            className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-white/10 text-white font-medium text-sm disabled:opacity-30 hover:bg-white/20 transition"
          >
            Next <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
