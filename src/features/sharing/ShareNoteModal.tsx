import { useState, useEffect, useRef, useCallback } from 'react';
import QRCode from 'qrcode';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/services/supabase';
import { X, Share2, Copy, Loader2, Check, Download, QrCode } from 'lucide-react';

interface ShareNoteModalProps {
  open: boolean;
  onClose: () => void;
  noteId: string;
  noteTitle: string;
  noteBody: string;
  noteCategory: string;
  noteScriptures: string[];
  noteIsSermon: boolean;
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export default function ShareNoteModal({ open, onClose, noteId, noteTitle, noteBody, noteCategory, noteScriptures, noteIsSermon }: ShareNoteModalProps) {
  const { showToast } = useApp();
  const [code, setCode] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const createShare = useCallback(async () => {
    setLoading(true);
    let shareCode = generateCode();
    let attempts = 0;
    while (attempts < 5) {
      const { data: existing } = await supabase.from('shared_notes').select('code').eq('code', shareCode).maybeSingle();
      if (!existing) break;
      shareCode = generateCode();
      attempts++;
    }

    const { error } = await supabase.from('shared_notes').insert({
      code: shareCode,
      note_id: noteId,
      title: noteTitle,
      body: noteBody,
      category: noteCategory,
      scriptures: noteScriptures,
      is_sermon: noteIsSermon,
    });

    if (error) {
      showToast('Failed to create share link', 'error');
      setLoading(false);
      return;
    }

    setCode(shareCode);
    setLoading(false);
  }, [noteId, noteTitle, noteBody, noteCategory, noteScriptures, noteIsSermon, showToast]);

  useEffect(() => {
    if (open) {
      setCode('');
      setQrUrl('');
      setCopied(false);
      createShare();
    }
  }, [open, createShare]);

  // Generate QR code once we have a code
  useEffect(() => {
    if (!code || !canvasRef.current) return;
    const shareUrl = `${window.location.origin}?share=${code}`;
    QRCode.toCanvas(canvasRef.current, shareUrl, {
      width: 220,
      margin: 2,
      color: { dark: '#2929D8', light: '#ffffff' },
    }, (err) => {
      if (err) {
        QRCode.toDataURL(shareUrl, { width: 220, margin: 2 }).then(url => setQrUrl(url));
      }
    });
    QRCode.toDataURL(shareUrl, { width: 400, margin: 2 }).then(url => setQrUrl(url));
  }, [code]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(true);
    showToast('Share code copied');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    if (!qrUrl) return;
    const a = document.createElement('a');
    a.href = qrUrl;
    a.download = `notelamp-share-${code}.png`;
    a.click();
    showToast('QR code downloaded');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-midnight-400/50 animate-fadeIn" />
      <div className="relative w-full max-w-sm bg-white dark:bg-midnight-200 rounded-3xl shadow-float p-6 animate-slideUp" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-royal text-white">
              <Share2 size={18} />
            </span>
            <h2 className="font-bold text-slate2-900 dark:text-white">Share Note</h2>
          </div>
          <button onClick={onClose} className="flex items-center justify-center w-8 h-8 rounded-lg bg-cloud-50 dark:bg-midnight-300 text-slate-400 hover:text-slate-600 transition">
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-12 gap-3">
            <Loader2 size={28} className="text-indigo-royal animate-spin" />
            <p className="text-sm text-slate-400">Creating share link...</p>
          </div>
        ) : (
          <div className="space-y-5">
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
              Share this code or QR with another NoteLamp user. They can import it into their app.
            </p>

            {/* QR Code */}
            <div className="flex flex-col items-center gap-2">
              <div className="rounded-2xl border-2 border-cloud-200 dark:border-midnight-100 p-3 bg-white">
                <canvas ref={canvasRef} className="rounded-lg" />
              </div>
              <button onClick={handleDownloadQR} className="flex items-center gap-1.5 text-xs font-medium text-indigo-royal dark:text-indigo-300 hover:underline">
                <Download size={13} /> Download QR
              </button>
            </div>

            {/* Share code */}
            <div className="rounded-2xl bg-cloud-50 dark:bg-midnight-300 border border-cloud-200 dark:border-midnight-100 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Share Code</p>
              <div className="flex items-center justify-between gap-2">
                <span className="text-2xl font-bold tracking-wider text-slate2-900 dark:text-white font-mono">{code}</span>
                <button onClick={handleCopyCode} className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-royal text-white hover:bg-indigo-700 transition shrink-0">
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-xl bg-teal-50 dark:bg-teal-600/10 p-3">
              <QrCode size={16} className="text-teal-600 shrink-0 mt-0.5" />
              <p className="text-xs text-teal-700 dark:text-teal-400 leading-relaxed">
                The recipient opens NoteLamp, taps "Import Note", and enters this code or scans the QR code to add the note to their library.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
