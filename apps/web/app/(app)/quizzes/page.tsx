'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BrainCircuit, Clock, Target, ChevronRight, Star } from 'lucide-react';
import { notes as notesApi } from '@/lib/api';
import { subjectColor, subjectIcon } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { NoteCard } from '@/types';

const DIFFICULTIES: Record<string, { label: string; color: string }> = {
  easy: { label: 'Easy', color: 'bg-emerald-100 text-emerald-700' },
  medium: { label: 'Medium', color: 'bg-amber-100 text-amber-700' },
  hard: { label: 'Hard', color: 'bg-red-100 text-red-700' },
};

function getDifficulty(subject: string) {
  const hard = ['History', 'Physics', 'Chemistry'];
  const easy = ['English', 'Geography'];
  if (hard.includes(subject)) return 'hard';
  if (easy.includes(subject)) return 'easy';
  return 'medium';
}

export default function QuizzesPage() {
  const [notes, setNotes] = useState<NoteCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notesApi.list().then(n => { setNotes(n as NoteCard[]); setLoading(false); });
  }, []);

  return (
    <div className="animate-enter space-y-6">
      <div>
        <h1 className="font-heading font-bold text-2xl text-secondary">Quizzes Library</h1>
        <p className="text-muted-foreground text-sm mt-1">Test your knowledge with AI-generated quizzes</p>
      </div>

      {/* Stats banner */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: BrainCircuit, label: 'Available Quizzes', value: notes.length, color: 'bg-indigo-50 text-indigo-500' },
          { icon: Target, label: 'Questions Total', value: notes.length * 12, color: 'bg-teal-50 text-teal-500' },
          { icon: Clock, label: 'Avg Time', value: '~10 min', color: 'bg-amber-50 text-amber-500' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-card rounded-2xl border border-border/50 p-4 text-center">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mx-auto mb-2`}>
              <Icon size={18} />
            </div>
            <p className="font-heading font-bold text-xl text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="bg-muted rounded-2xl h-52 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {notes.map((note, i) => {
            const diff = getDifficulty(note.subject);
            const diffMeta = DIFFICULTIES[diff];
            return (
              <motion.div key={note.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Link href={`/notes/${note.id}`} className="bg-card rounded-2xl border border-border/50 p-5 flex flex-col gap-4 card-hover block group">
                  <div className="flex items-start justify-between">
                    <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center text-xl">
                      {subjectIcon(note.subject)}
                    </div>
                    <span className={`badge text-xs ${diffMeta.color}`}>{diffMeta.label}</span>
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-secondary group-hover:text-primary transition-colors line-clamp-2">{note.title}</h3>
                    <Badge variant="subject" subject={note.subject} className="mt-1.5 text-xs">{note.subject}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><BrainCircuit size={12} /> 12 questions</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> ~10 min</span>
                    <span className="flex items-center gap-1"><Star size={12} /> {note.level}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-primary border-t border-border/50 pt-3 group-hover:gap-3 transition-all">
                    <span>Start Quiz</span> <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
