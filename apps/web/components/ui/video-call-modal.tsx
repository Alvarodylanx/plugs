'use client';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Video, Wifi } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  teacherName: string;
  roomId: string;
}

export function VideoCallModal({ open, onClose, teacherName, roomId }: Props) {
  const roomName = `PlugSession-${roomId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const jitsiUrl = `https://meet.jit.si/${roomName}`;

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-4xl bg-card rounded-3xl overflow-hidden shadow-2xl border border-border/50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-primary to-indigo-600 text-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <Video size={16} />
                </div>
                <div>
                  <p className="font-semibold text-sm leading-none">Video Session</p>
                  <p className="text-white/70 text-xs mt-0.5">with {teacherName}</p>
                </div>
                <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-2.5 py-1 text-xs font-medium ml-2">
                  <Wifi size={10} className="animate-pulse" /> Live
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={jitsiUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-white/15 hover:bg-white/25 transition-colors"
                  title="Open in new tab"
                >
                  <ExternalLink size={14} />
                </a>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl bg-white/15 hover:bg-white/25 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Jitsi iframe */}
            <div className="relative" style={{ paddingBottom: '56.25%', height: 0 }}>
              <iframe
                src={`${jitsiUrl}#config.prejoinPageEnabled=false&config.startWithAudioMuted=false&config.startWithVideoMuted=false&interfaceConfig.TOOLBAR_BUTTONS=["microphone","camera","hangup","chat","tileview","fullscreen"]`}
                title={`Video call with ${teacherName}`}
                allow="camera; microphone; fullscreen; display-capture"
                className="absolute inset-0 w-full h-full"
                style={{ border: 'none' }}
              />
            </div>

            {/* Footer hint */}
            <div className="px-5 py-3 bg-muted/30 border-t border-border/50 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Powered by <span className="font-semibold text-primary">Jitsi Meet</span> — free, encrypted, no account needed.
              </p>
              <button onClick={onClose} className="text-xs text-muted-foreground hover:text-destructive transition-colors font-medium">
                End call
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
