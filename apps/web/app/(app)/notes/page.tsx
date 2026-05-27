'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Search, BookOpen, Headphones, MoreVertical } from 'lucide-react';
import { notes as notesApi } from '@/lib/api';
import { subjectColor, subjectIcon } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { NoteCard } from '@/types';
import { SUBJECTS } from '@/types';

export default function NotesPage() {
  const [allNotes, setAllNotes] = useState<NoteCard[]>([]);
  const [filtered, setFiltered] = useState<NoteCard[]>([]);
  const [search, setSearch] = useState('');
  const [activeSubject, setActiveSubject] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notesApi.list().then(n => {
      setAllNotes(n as NoteCard[]);
      setFiltered(n as NoteCard[]);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    let result = allNotes;
    if (activeSubject !== 'All') result = result.filter(n => n.subject === activeSubject);
    if (search) result = result.filter(n => n.title.toLowerCase().includes(search.toLowerCase()) || n.subject.toLowerCase().includes(search.toLowerCase()));
    setFiltered(result);
  }, [search, activeSubject, allNotes]);

  const subjects = ['All', ...Array.from(new Set(allNotes.map(n => n.subject)))];

  return (
    <div className="animate-enter space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-secondary">My Knowledge Base</h1>
          <p className="text-muted-foreground text-sm mt-1">Structured notes with audio and quizzes</p>
        </div>
        <Link href="/notes/upload" className="btn-primary shadow-md shadow-primary/30">
          <Plus size={16} /> Upload Note
        </Link>
      </div>

      {/* Search */}
      <div className="bg-card rounded-2xl border border-border/50 shadow-sm px-4 py-3 flex items-center gap-3">
        <Search size={16} className="text-muted-foreground shrink-0" />
        <input
          type="text"
          placeholder="Search notes by title or subject..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
        />
      </div>

      {/* Subject tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {subjects.map(s => (
          <button
            key={s}
            onClick={() => setActiveSubject(s)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
              activeSubject === s
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-card border-border/50 text-muted-foreground hover:border-primary/50 hover:text-primary'
            }`}
          >
            {s === 'All' ? '📚 All' : `${subjectIcon(s)} ${s}`}
          </button>
        ))}
      </div>

      {/* Stats */}
      <p className="text-sm text-muted-foreground">
        <span className="font-bold text-foreground">{filtered.length}</span> notes ·{' '}
        <span className="font-bold text-foreground">{new Set(filtered.map(n => n.subject)).size}</span> subjects
      </p>

      {/* Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card rounded-2xl border border-border/50 p-5 animate-pulse h-52" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen size={40} className="text-muted-foreground mx-auto mb-4" />
          <p className="font-heading font-semibold text-secondary">No notes found</p>
          <p className="text-sm text-muted-foreground mt-2">Try a different search or upload your first note</p>
          <Link href="/notes/upload" className="btn-primary mt-4 inline-flex"><Plus size={16} /> Upload Note</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((note, i) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Link href={`/notes/${note.id}`} className="bg-card rounded-2xl border border-border/50 p-5 flex flex-col gap-3 card-hover group block">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${subjectColor(note.subject).replace('text-', 'bg-').split(' ')[0]}`}>
                    {subjectIcon(note.subject)}
                  </div>
                  <button className="p-1 rounded-lg hover:bg-muted opacity-0 group-hover:opacity-100 transition-all" onClick={e => e.preventDefault()}>
                    <MoreVertical size={14} className="text-muted-foreground" />
                  </button>
                </div>

                {/* Title */}
                <div>
                  <h3 className="font-heading font-semibold text-secondary group-hover:text-primary transition-colors line-clamp-2 leading-snug">{note.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{note.subject}</p>
                </div>

                {/* Summary */}
                <p className="text-sm text-muted-foreground line-clamp-2 flex-1 leading-relaxed">{note.summary}</p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><BookOpen size={12} /> {Array.isArray((note as any).sections) ? (note as any).sections.length : 4} sections</span>
                    <span className="flex items-center gap-1"><Headphones size={12} /> {note.readTime}</span>
                  </div>
                  <Badge variant="subject" subject={note.subject}>{note.level}</Badge>
                </div>

                {/* Tags */}
                {note.tags.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap">
                    {note.tags.slice(0, 3).map(t => (
                      <span key={t} className="badge bg-muted text-muted-foreground text-xs">{t}</span>
                    ))}
                  </div>
                )}
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
