import { useApp } from '@/context/AppContext';
import Header from '@/components/Header';
import {
  Moon, Sun, Type, BookOpen, RefreshCw, HelpCircle, MessageSquare,
  Info, ChevronRight, LogOut, Check, Pencil, Loader2,
} from 'lucide-react';
import { translations } from '@/data/bibleData';
import { useState } from 'react';
import BottomSheet from '@/components/BottomSheet';
import Dialog from '@/components/Dialog';
import type { Screen } from '@/App';

interface SettingsProps {
  navigate: (s: Screen) => void;
}

export default function Settings({ navigate }: SettingsProps) {
  const {
    theme, toggleTheme, fontSize, setFontSize, translation, setTranslation,
    userEmail, signOut, showToast, bookmarks, displayName, updateDisplayName,
  } = useApp();
  const [showVersions, setShowVersions] = useState(false);
  const [showFont, setShowFont] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showSync, setShowSync] = useState(false);
  const [showEditName, setShowEditName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [savingName, setSavingName] = useState(false);

  const display = displayName
    ? displayName.charAt(0).toUpperCase() + displayName.slice(1)
    : 'Friend';

  const openNameEditor = () => {
    setNameDraft(displayName);
    setShowEditName(true);
  };

  const handleSaveName = async () => {
    if (!nameDraft.trim()) return;
    setSavingName(true);
    const ok = await updateDisplayName(nameDraft);
    setSavingName(false);
    if (ok) {
      setShowEditName(false);
      showToast('Name updated');
    } else {
      showToast('Could not update name', 'error');
    }
  };

  return (
    <div className="min-h-screen pb-24">
      <Header title="Settings" showBack onBack={() => navigate({ name: 'home' })} />

      <div className="mx-auto max-w-md px-4 pt-4 space-y-6">
        {/* Profile */}
        <div className="card p-5 flex items-center gap-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-indigo-royal to-electric-500 text-white font-bold text-xl shadow-indigo">
            {display.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-slate2-900 dark:text-white">{display}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{userEmail}</p>
          </div>
          <button onClick={openNameEditor} className="flex items-center justify-center w-9 h-9 rounded-xl bg-cloud-50 dark:bg-midnight-300 text-slate2-900 dark:text-white hover:bg-cloud-100 transition" aria-label="Edit name">
            <Pencil size={16} />
          </button>
          <button onClick={() => signOut()} className="flex items-center justify-center w-9 h-9 rounded-xl bg-cloud-50 dark:bg-midnight-300 text-slate2-900 dark:text-white hover:bg-cloud-100 transition" aria-label="Sign out">
            <LogOut size={16} />
          </button>
        </div>

        {/* Appearance */}
        <section>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">Appearance</h3>
          <div className="card divide-y divide-cloud-100 dark:divide-midnight-100">
            <div className="list-row">
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-royal dark:text-indigo-300">
                {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate2-900 dark:text-white">Dark Mode</p>
                <p className="text-xs text-slate-400">{theme === 'dark' ? 'On — Deep Midnight theme' : 'Off — Light theme'}</p>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative w-12 h-7 rounded-full transition ${theme === 'dark' ? 'bg-indigo-royal' : 'bg-cloud-200 dark:bg-midnight-100'}`}
                aria-label="Toggle dark mode"
              >
                <span className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${theme === 'dark' ? 'translate-x-5' : ''}`} />
              </button>
            </div>
            <button className="list-row w-full text-left" onClick={() => setShowFont(true)}>
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-600/20 text-teal-600 dark:text-teal-400">
                <Type size={18} />
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate2-900 dark:text-white">Font Size</p>
                <p className="text-xs text-slate-400">{fontSize}px — {fontSize >= 20 ? 'Large' : fontSize >= 17 ? 'Medium' : 'Small'}</p>
              </div>
              <ChevronRight size={18} className="text-slate-300 dark:text-slate-600" />
            </button>
          </div>
        </section>

        {/* Bible */}
        <section>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">Bible</h3>
          <div className="card divide-y divide-cloud-100 dark:divide-midnight-100">
            <button className="list-row w-full text-left" onClick={() => setShowVersions(true)}>
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-electric-500/15 text-electric-600">
                <BookOpen size={18} />
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate2-900 dark:text-white">Bible Version</p>
                <p className="text-xs text-slate-400">{translation}</p>
              </div>
              <ChevronRight size={18} className="text-slate-300 dark:text-slate-600" />
            </button>
            <div className="list-row">
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-600/20 text-teal-600">
                <Check size={18} />
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate2-900 dark:text-white">Offline Bible</p>
                <p className="text-xs text-slate-400">KJV installed — all 66 books available</p>
              </div>
            </div>
          </div>
        </section>

        {/* Account */}
        <section>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">Account</h3>
          <div className="card divide-y divide-cloud-100 dark:divide-midnight-100">
            <button className="list-row w-full text-left" onClick={() => setShowSync(true)}>
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-600/20 text-teal-600">
                <RefreshCw size={18} />
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate2-900 dark:text-white">Sync and Backup</p>
                <p className="text-xs text-slate-400">{bookmarks.length} bookmarks · auto-sync on</p>
              </div>
              <ChevronRight size={18} className="text-slate-300 dark:text-slate-600" />
            </button>
          </div>
        </section>

        {/* Support */}
        <section>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">Support</h3>
          <div className="card divide-y divide-cloud-100 dark:divide-midnight-100">
            <button className="list-row w-full text-left" onClick={() => showToast('Opening help center...', 'info')}>
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-royal dark:text-indigo-300">
                <HelpCircle size={18} />
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate2-900 dark:text-white">Help and Support</p>
              </div>
              <ChevronRight size={18} className="text-slate-300 dark:text-slate-600" />
            </button>
            <button className="list-row w-full text-left" onClick={() => showToast('Feedback form coming soon', 'info')}>
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-coral-50 dark:bg-coral-600/20 text-coral-600">
                <MessageSquare size={18} />
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate2-900 dark:text-white">Give Feedback</p>
              </div>
              <ChevronRight size={18} className="text-slate-300 dark:text-slate-600" />
            </button>
            <button className="list-row w-full text-left" onClick={() => setShowAbout(true)}>
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-violet-500/15 text-violet-500">
                <Info size={18} />
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate2-900 dark:text-white">About NoteLamp</p>
              </div>
              <ChevronRight size={18} className="text-slate-300 dark:text-slate-600" />
            </button>
          </div>
        </section>

        <p className="text-center text-xs text-slate-400 pb-2">NoteLamp v1.0.0 — Study deeper. Preach clearer.</p>
      </div>

      {/* Edit display name dialog */}
      <Dialog
        open={showEditName}
        onClose={() => setShowEditName(false)}
        title="Your Name"
        actions={
          <div className="flex gap-3">
            <button onClick={() => setShowEditName(false)} className="btn-ghost flex-1">Cancel</button>
            <button
              onClick={handleSaveName}
              disabled={savingName || !nameDraft.trim()}
              className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {savingName ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              Save
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            This is the name other members see in your reading rooms.
          </p>
          <input
            type="text"
            value={nameDraft}
            onChange={e => setNameDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); }}
            placeholder="Your name"
            className="input-base"
            maxLength={30}
            autoFocus
          />
        </div>
      </Dialog>

      {/* Bible version bottom sheet */}
      <BottomSheet open={showVersions} onClose={() => setShowVersions(false)} title="Bible Version">
        <div className="space-y-1">
          {translations.map(t => (
            <button
              key={t}
              onClick={() => { setTranslation(t as typeof translation); setShowVersions(false); showToast('Bible version set to ' + t); }}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition ${t === translation ? 'bg-indigo-50 dark:bg-indigo-900/30' : 'hover:bg-cloud-50 dark:hover:bg-midnight-300'}`}
            >
              <span className={`text-sm font-medium ${t === translation ? 'text-indigo-royal dark:text-indigo-300' : 'text-slate2-900 dark:text-white'}`}>{t}</span>
              {t === translation && <Check size={18} className="text-indigo-royal dark:text-indigo-300" />}
            </button>
          ))}
        </div>
      </BottomSheet>

      {/* Font size bottom sheet */}
      <BottomSheet open={showFont} onClose={() => setShowFont(false)} title="Font Size">
        <div className="space-y-4">
          <div className="rounded-2xl bg-cloud-50 dark:bg-midnight-300 p-4">
            <p className="reading-prose text-slate2-900 dark:text-white" style={{ fontSize: `${fontSize}px` }}>
              <sup className="text-indigo-royal dark:text-indigo-300 font-bold text-xs">16</sup>
              For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Type size={16} className="text-slate-400" />
            <input
              type="range"
              min={13}
              max={24}
              value={fontSize}
              onChange={e => setFontSize(parseInt(e.target.value))}
              className="flex-1"
            />
            <Type size={24} className="text-slate-400" />
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>Small</span>
            <span className="font-semibold text-indigo-royal dark:text-indigo-300">{fontSize}px</span>
            <span>Large</span>
          </div>
        </div>
      </BottomSheet>

      {/* About dialog */}
      <Dialog
        open={showAbout}
        onClose={() => setShowAbout(false)}
        title="About NoteLamp"
        actions={<button onClick={() => setShowAbout(false)} className="btn-primary w-full">Close</button>}
      >
        <div className="space-y-3">
          <p className="text-sm text-slate2-900 dark:text-white font-medium">NoteLamp v1.0.0</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            A modern Bible-aware notepad, Bible reader and sermon preparation app built for pastors, preachers and Bible teachers.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Study deeper. Preach clearer. Stay in the Word.
          </p>
        </div>
      </Dialog>

      {/* Sync dialog */}
      <Dialog
        open={showSync}
        onClose={() => setShowSync(false)}
        title="Sync and Backup"
        actions={<button onClick={() => { setShowSync(false); showToast('Backup completed'); }} className="btn-primary w-full">Backup Now</button>}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">Auto-sync</span>
            <span className="text-sm font-medium text-teal-500 flex items-center gap-1"><Check size={14} /> Enabled</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">Last backup</span>
            <span className="text-sm text-slate2-900 dark:text-white">Just now</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400">Notes stored</span>
            <span className="text-sm text-slate2-900 dark:text-white">Cloud (auto-synced)</span>
          </div>
          <p className="text-xs text-slate-400">Your notes, bookmarks and preferences are synced to your account across devices.</p>
        </div>
      </Dialog>
    </div>
  );
}
