'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, BookOpen, Headphones, MoreVertical,
  Trash2, ExternalLink, LayoutGrid, List, SortAsc, Clock, BrainCircuit,
} from 'lucide-react';
import { notes as notesApi } from '@/lib/api';
import { subjectIcon } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { NoteCard } from '@/types';
import { SUBJECTS } from '@/types';

const SUBJECT_GRADIENTS: Record<string, string> = {
  'Computer Science / ICT': 'from-blue-400 to-cyan-300',
  'Biology':                'from-emerald-400 to-teal-300',
  'History':                'from-amber-400 to-orange-300',
  'Mathematics':            'from-indigo-400 to-violet-300',
  'Physics':                'from-purple-400 to-pink-300',
  'Chemistry':              'from-rose-400 to-red-300',
  'English':                'from-sky-400 to-blue-300',
  'Geography':              'from-green-400 to-emerald-300',
  'Economics':              'from-yellow-400 to-amber-300',
};

function NoteMenu({ note, onDelete }: { note: NoteCard; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setConfirming(false);
      }
    }
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => { setOpen(o => !o); setConfirming(false); }}
        className="p-1.5 rounded-lg hover:bg-black/10 opacity-0 group-hover:opacity-100 transition-all"
      >
        <MoreVertical size={14} className="text-white drop-shadow" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-8 w-48 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden"
          >
            {!confirming ? (
              <>
                <Link
                  href={`/notes/${note.id}`}
                  className="flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-muted transition-colors"
                  onClick={() => setOpen(false)}
                >
                  <ExternalLink size={14} className="text-muted-foreground" /> Open Note
                </Link>
                <Link
                  href="/audio-notes"
                  className="flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-muted transition-colors"
                  onClick={() => setOpen(false)}
                >
                  <Headphones size={14} className="text-muted-foreground" /> Listen
                </Link>
                <Link
                  href={`/notes/${note.id}`}
                  className="flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-muted transition-colors"
                  onClick={() => setOpen(false)}
                >
                  <BrainCircuit size={14} className="text-muted-foreground" /> Take Quiz
                </Link>
                {!note.isBuiltIn && (
                  <>
                    <div className="border-t border-border/50 my-0.5" />
                    <button
                      onClick={e => { e.stopPropagation(); setConfirming(true); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-destructive hover:bg-destructive/5 transition-colors"
                    >
                      <Trash2 size={14} /> Delete Note
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="p-3 space-y-2.5">
                <p className="text-xs font-semibold text-foreground">Delete this note?</p>
                <p className="text-xs text-muted-foreground">This cannot be undone.</p>
                <div className="flex gap-2">
                  <button
                    onClick={e => { e.stopPropagation(); setConfirming(false); setOpen(false); }}
                    className="flex-1 py-1.5 text-xs rounded-lg border border-border hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); setOpen(false); setConfirming(false); onDelete(); }}
                    className="flex-1 py-1.5 text-xs rounded-lg bg-destructive text-white hover:bg-destructive/90 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function NotesPage() {
  const [allNotes, setAllNotes] = useState<NoteCard[]>([]);
  const [search, setSearch] = useState('');
  const [activeSubject, setActiveSubject] = useState('All');
  const [sort, setSort] = useState<'default' | 'az' | 'time'>('default');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    notesApi.list().then(n => {
      setAllNotes(n as NoteCard[]);
      setLoading(false);
    });
  }, []);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await notesApi.delete(id);
      setAllNotes(p => p.filter(n => n.id !== id));
    } catch {
      // silently fail — note stays in list if delete fails
    } finally {
      setDeletingId(null);
    }
  }

  const subjects = ['All', ...Array.from(new Set(allNotes.map(n => n.subject)))];

  let filtered = allNotes;
  if (activeSubject !== 'All') filtered = filtered.filter(n => n.subject === activeSubject);
  if (search) filtered = filtered.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.subject.toLowerCase().includes(search.toLowerCase()) ||
    n.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );
  if (sort === 'az')   filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
  if (sort === 'time') filtered = [...filtered].sort((a, b) => (a.readTime || '').localeCompare(b.readTime || ''));

  const PAGE = 12;
  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <div className="animate-enter space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading font-bold text-2xl text-secondary">My Knowledge Base</h1>
          <p className="text-muted-foreground text-sm mt-1">Structured notes with audio and quizzes</p>
        </div>
        <Link href="/notes/upload" className="btn-primary shadow-md shadow-primary/20 flex items-center gap-2">
          <Plus size={16} /> Upload Note
        </Link>
      </div>

      {/* Search + Sort + View toggle */}
      <div className="flex gap-3 flex-wrap">
        <div className="bg-card rounded-xl border border-border/50 px-3 py-2.5 flex items-center gap-2 flex-1 min-w-full sm:min-w-52">
          <Search size={15} className="text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search notes, subjects, tags..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex items-center gap-1.5 bg-card rounded-xl border border-border/50 px-3 py-2.5">
          <SortAsc size={14} className="text-muted-foreground" />
          <select value={sort} onChange={e => setSort(e.target.value as any)} className="bg-transparent text-sm outline-none cursor-pointer text-foreground">
            <option value="default">Latest</option>
            <option value="az">A → Z</option>
            <option value="time">Read Time</option>
          </select>
        </div>
        <div className="flex border border-border/50 rounded-xl overflow-hidden">
          <button onClick={() => setViewMode('grid')} className={`px-3 py-2 transition-all ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'}`}>
            <LayoutGrid size={15} />
          </button>
          <button onClick={() => setViewMode('list')} className={`px-3 py-2 transition-all ${viewMode === 'list' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'}`}>
            <List size={15} />
          </button>
        </div>
      </div>

      {/* Subject filter tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {subjects.map(s => (
          <button
            key={s}
            onClick={() => setActiveSubject(s)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
              activeSubject === s
                ? 'bg-primary text-white border-primary shadow-sm shadow-primary/30'
                : 'bg-card border-border/50 text-muted-foreground hover:border-primary/50 hover:text-primary'
            }`}
          >
            {s === 'All' ? '📚 All' : `${subjectIcon(s)} ${s.split(' / ')[0]}`}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-sm text-muted-foreground">
        <span className="font-bold text-foreground">{filtered.length}</span> note{filtered.length !== 1 ? 's' : ''} ·{' '}
        <span className="font-bold text-foreground">{new Set(filtered.map(n => n.subject)).size}</span> subject{new Set(filtered.map(n => n.subject)).size !== 1 ? 's' : ''}
        {hasMore && <span className="ml-2 text-muted-foreground/60">· showing {visible.length}</span>}
      </p>

      {/* Notes grid/list */}
      {loading ? (
        <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-5' : 'space-y-3'}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`bg-muted rounded-2xl animate-pulse ${viewMode === 'grid' ? 'h-56' : 'h-20'}`} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <BookOpen size={40} className="text-muted-foreground mx-auto mb-4" />
          <p className="font-heading font-semibold text-secondary">No notes found</p>
          <p className="text-sm text-muted-foreground mt-2">Try a different search or upload your first note</p>
          <Link href="/notes/upload" className="btn-primary mt-4 inline-flex items-center gap-2"><Plus size={16} /> Upload Note</Link>
        </motion.div>
      ) : viewMode === 'grid' ? (
        /* ── GRID VIEW ── */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {visible.map((note, i) => {
              const gradient = SUBJECT_GRADIENTS[note.subject] || 'from-primary to-indigo-400';
              const isDeleting = deletingId === note.id;
              return (
                <motion.div
                  key={note.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: isDeleting ? 0.4 : 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.04 }}
                  className="relative group"
                >
                  <Link href={`/notes/${note.id}`} className="bg-card rounded-2xl border border-border/50 overflow-hidden flex flex-col card-hover block hover:shadow-lg transition-all">
                    {/* Gradient header */}
                    <div className={`bg-gradient-to-br ${gradient} h-16 flex items-end px-4 pb-3 relative`}>
                      <div className="absolute inset-0 bg-black/5" />
                      <span className="text-3xl relative z-10 drop-shadow">{subjectIcon(note.subject)}</span>
                    </div>

                    <div className="p-4 flex flex-col gap-2.5 flex-1">
                      <div>
                        <h3 className="font-heading font-semibold text-secondary group-hover:text-primary transition-colors line-clamp-2 leading-snug text-sm">
                          {note.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{note.subject}</p>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed flex-1">{note.summary}</p>

                      <div className="flex items-center justify-between pt-2 border-t border-border/50">
                        <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><BrainCircuit size={11} /> {note.questionCount ?? 0} Qs</span>
                          <span className="flex items-center gap-1"><Clock size={11} /> {note.readTime}</span>
                        </div>
                        <Badge variant="subject" subject={note.subject}>{note.level}</Badge>
                      </div>

                      {note.tags?.length > 0 && (
                        <div className="flex gap-1.5 flex-wrap">
                          {note.tags.slice(0, 3).map(t => (
                            <span key={t} className="badge bg-muted text-muted-foreground text-xs">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Menu is OUTSIDE the Link so it never triggers navigation */}
                  <div className="absolute top-2 right-2 z-10">
                    <NoteMenu note={note} onDelete={() => handleDelete(note.id)} />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        /* ── LIST VIEW ── */
        <div className="space-y-2">
          <AnimatePresence>
            {visible.map((note, i) => {
              const gradient = SUBJECT_GRADIENTS[note.subject] || 'from-primary to-indigo-400';
              const isDeleting = deletingId === note.id;
              return (
                <motion.div
                  key={note.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: isDeleting ? 0.4 : 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ delay: i * 0.03 }}
                  className="relative group"
                >
                  <Link href={`/notes/${note.id}`} className="bg-card rounded-xl border border-border/50 p-3 pr-12 flex items-center gap-3 hover:border-primary/30 hover:bg-muted/30 transition-all block">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-lg shrink-0`}>
                      {subjectIcon(note.subject)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">{note.title}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        {note.subject} · {note.readTime} · {note.level}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {note.tags?.slice(0, 2).map(t => (
                        <span key={t} className="badge bg-muted text-muted-foreground text-xs hidden sm:inline-flex">{t}</span>
                      ))}
                    </div>
                  </Link>

                  {/* Menu is OUTSIDE the Link so it never triggers navigation */}
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10">
                    <NoteMenu note={note} onDelete={() => handleDelete(note.id)} />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Load more */}
      {!loading && hasMore && (
        <div className="flex items-center justify-center pt-2">
          <button
            onClick={() => setVisibleCount(c => c + PAGE)}
            className="btn-outline gap-2 text-sm"
          >
            Load {Math.min(PAGE, filtered.length - visibleCount)} more
            <span className="text-muted-foreground">({filtered.length - visibleCount} remaining)</span>
          </button>
        </div>
      )}
    </div>
  );
}
