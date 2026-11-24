import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { useApp } from '@/context/AppContext';
import { X, Copy, Check, Download, UserPlus } from 'lucide-react';

interface RoomInviteModalProps {
  open: boolean;
  onClose: () => void;
  roomName: string;
  inviteCode: string | null;
}

export default function RoomInviteModal({ open, onClose, roomName, inviteCode }: RoomInviteModalProps) {
  const { showToast } = useApp();
  const [copied, setCopied] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!open || !inviteCode) return;
    setCopied(false);
    const joinUrl = `${window.location.origin}?join=${inviteCode}`;
    QRCode.toCanvas(canvasRef.current, joinUrl, {
      width: 220,
      margin: 2,
      color: { dark: '#2929D8', light: '#ffffff' },
    }, () => {});
    QRCode.toDataURL(joinUrl, { width: 400, margin: 2 }).then(url => setQrUrl(url));
  }, [open, inviteCode]);

  const handleCopyCode = () => {
    if (!inviteCode) return;
    navigator.clipboard.writeText(inviteCode).catch(() => {});
    setCopied(true);
    showToast('Invite code copied');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    if (!qrUrl) return;
    const a = document.createElement('a');
    a.href = qrUrl;
    a.download = `notelamp-room-${inviteCode}.png`;
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
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-teal-500 text-white">
              <UserPlus size={18} />
            </span>
            <h2 className="font-bold text-slate2-900 dark:text-white">Invite to Room</h2>
          </div>
          <button onClick={onClose} className="flex items-center justify-center w-8 h-8 rounded-lg bg-cloud-50 dark:bg-midnight-300 text-slate-400 hover:text-slate-600 transition">
            <X size={18} />
          </button>
        </div>

        {!inviteCode ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 py-6 text-center">
            This room doesn't have an invite code yet. Codes are generated when a room is created.
          </p>
        ) : (
          <div className="space-y-5">
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
              Share this code or QR with friends. They can join "{roomName}" from the Join screen.
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

            {/* Invite code */}
            <div className="rounded-2xl bg-cloud-50 dark:bg-midnight-300 border border-cloud-200 dark:border-midnight-100 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Invite Code</p>
              <div className="flex items-center justify-between gap-2">
                <span className="text-2xl font-bold tracking-wider text-slate2-900 dark:text-white font-mono">{inviteCode}</span>
                <button onClick={handleCopyCode} className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-royal text-white hover:bg-indigo-700 transition shrink-0">
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-xl bg-teal-50 dark:bg-teal-600/10 p-3">
              <UserPlus size={16} className="text-teal-600 shrink-0 mt-0.5" />
              <p className="text-xs text-teal-700 dark:text-teal-400 leading-relaxed">
                The recipient opens NoteLamp, taps "Join a Room", switches to the code tab, and enters this code to join instantly.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
