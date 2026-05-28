'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, BookOpen, BrainCircuit, Users, ArrowRight,
  LayoutDashboard, Headphones, Youtube, Calendar, TrendingUp,
  GraduationCap, FlaskConical, Globe, Map, Settings, Loader2,
} from 'lucide-react';
import { notes as notesApi, threads as threadsApi } from '@/lib/api';
import { subjectIcon } from '@/lib/utils';
import type { NoteCard, Thread } from '@/types';

const QUICK_NAV = [
  { label: 'Dashboard',    href: '/dashboard',   icon: LayoutDashboard },
  { label: 'My Notes',     href: '/notes',        icon: BookOpen },
  { label: 'Audio Notes',  href: '/audio-notes',  icon: Headphones },
  { label: 'Quizzes',      href: '/quizzes',      icon: BrainCircuit },
  { label: 'Videos',       href: '/videos',        icon: Youtube },
  { label: 'Timetable',    href: '/timetable',    icon: Calendar },
  { label: 'Progress',     href: '/progress',     icon: TrendingUp },
  { label: 'Community',    href: '/social',        icon: Users },
  { label: 'Teachers',     href: '/teachers',     icon: GraduationCap },
  { label: 'Coding Lab',   href: '/lab',           icon: FlaskConical },
  { label: 'Research Hub', href: '/research',     icon: Globe },
  { label: 'Guide',        href: '/guide',         icon: Map },
  { label: 'Profile',      href: '/settings',     icon: Settings },
];

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [notes, setNotes] = useState<NoteCard[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  // Fetch data when palette opens
  useEffect(() => {
    if (!open) { setQuery(''); setActiveIdx(0); return; }
    setTimeout(() => inputRef.current?.focus(), 50);
    if (notes.length || threads.length) return;
    setLoading(true);
    Promise.all([notesApi.list(), threadsApi.list()])
      .then(([n, t]) => { setNotes(n as NoteCard[]); setThreads(t as Thread[]); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open]);

  const q = query.toLowerCase().trim();

  const filteredNav = QUICK_NAV.filter(n =>
    !q || n.label.toLowerCase().includes(q)
  );

  const filteredNotes = q
    ? notes.filter(n =>
        n.title.toLowerCase().includes(q) ||
        n.subject.toLowerCase().includes(q) ||
        n.tags?.some(t => t.toLowerCase().includes(q))
      ).slice(0, 5)
    : notes.slice(0, 4);

  const filteredThreads = q
    ? threads.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q)
      ).slice(0, 4)
    : [];

  // Flat list for keyboard navigation
  const allItems = [
    ...filteredNav.map(n => ({ type: 'nav' as const, data: n })),
    ...filteredNotes.map(n => ({ type: 'note' as const, data: n })),
    ...filteredThreads.map(t => ({ type: 'thread' as const, data: t })),
  ];

  function navigate(href: string) {
    router.push(href);
    onClose();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, allItems.length - 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, 0));
    }
    if (e.key === 'Enter' && allItems[activeIdx]) {
      const item = allItems[activeIdx];
      if (item.type === 'nav') navigate(item.data.href);
      if (item.type === 'note') navigate(`/notes/${(item.data as NoteCard).id}`);
      if (item.type === 'thread') navigate(`/social`);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -10 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/60">
              <Search size={16} className="text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => { setQuery(e.target.value); setActiveIdx(0); }}
                onKeyDown={handleKeyDown}
                placeholder="Search notes, quizzes, community..."
                className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
              />
              {loading && <Loader2 size={14} className="animate-spin text-muted-foreground shrink-0" />}
              <div className="flex items-center gap-1.5 shrink-0">
                <kbd className="text-[10px] text-muted-foreground bg-muted border border-border/60 px-1.5 py-0.5 rounded font-mono">Esc</kbd>
                <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted transition-colors">
                  <X size={14} className="text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto py-2">
              {/* Navigation */}
              {filteredNav.length > 0 && (
                <div>
                  {q && <p className="px-4 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Navigation</p>}
                  {filteredNav.map((item, i) => {
                    const Icon = item.icon;
                    const idx = i;
                    return (
                      <button
                        key={item.href}
                        onClick={() => navigate(item.href)}
                        onMouseEnter={() => setActiveIdx(idx)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${activeIdx === idx ? 'bg-primary/8 text-primary' : 'hover:bg-muted text-foreground'}`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${activeIdx === idx ? 'bg-primary/15' : 'bg-muted'}`}>
                          <Icon size={14} className={activeIdx === idx ? 'text-primary' : 'text-muted-foreground'} />
                        </div>
                        <span className="text-sm font-medium flex-1">{item.label}</span>
                        {activeIdx === idx && <ArrowRight size={13} className="text-primary shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Notes */}
              {filteredNotes.length > 0 && (
                <div>
                  <p className="px-4 py-1.5 mt-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {q ? 'Notes' : 'Recent Notes'}
                  </p>
                  {filteredNotes.map((note, i) => {
                    const idx = filteredNav.length + i;
                    return (
                      <button
                        key={note.id}
                        onClick={() => navigate(`/notes/${note.id}`)}
                        onMouseEnter={() => setActiveIdx(idx)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${activeIdx === idx ? 'bg-primary/8' : 'hover:bg-muted'}`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0 ${activeIdx === idx ? 'bg-primary/15' : 'bg-muted'}`}>
                          {subjectIcon(note.subject)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${activeIdx === idx ? 'text-primary' : 'text-foreground'}`}>{note.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{note.subject} · {note.readTime}</p>
                        </div>
                        <BookOpen size={12} className="text-muted-foreground shrink-0" />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Threads */}
              {filteredThreads.length > 0 && (
                <div>
                  <p className="px-4 py-1.5 mt-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Community</p>
                  {filteredThreads.map((thread, i) => {
                    const idx = filteredNav.length + filteredNotes.length + i;
                    return (
                      <button
                        key={thread.id}
                        onClick={() => navigate('/social')}
                        onMouseEnter={() => setActiveIdx(idx)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${activeIdx === idx ? 'bg-primary/8' : 'hover:bg-muted'}`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0 ${activeIdx === idx ? 'bg-primary/15' : 'bg-muted'}`}>
                          {subjectIcon(thread.subject)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${activeIdx === idx ? 'text-primary' : 'text-foreground'}`}>{thread.title}</p>
                          <p className="text-xs text-muted-foreground">{thread.subject.split(' / ')[0]} · {thread.replyCount} replies</p>
                        </div>
                        <Users size={12} className="text-muted-foreground shrink-0" />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Empty state */}
              {q && filteredNav.length === 0 && filteredNotes.length === 0 && filteredThreads.length === 0 && !loading && (
                <div className="px-4 py-10 text-center">
                  <Search size={28} className="text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-secondary">No results for "{query}"</p>
                  <p className="text-xs text-muted-foreground mt-1">Try a different keyword</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-border/60 flex items-center gap-4 text-[11px] text-muted-foreground">
              <span><kbd className="bg-muted border border-border/60 px-1 rounded font-mono">↑↓</kbd> navigate</span>
              <span><kbd className="bg-muted border border-border/60 px-1 rounded font-mono">↵</kbd> open</span>
              <span><kbd className="bg-muted border border-border/60 px-1 rounded font-mono">Esc</kbd> close</span>
              <span className="ml-auto">
                <kbd className="bg-muted border border-border/60 px-1 rounded font-mono">Ctrl</kbd>
                {' + '}
                <kbd className="bg-muted border border-border/60 px-1 rounded font-mono">K</kbd>
                {' to open'}
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
