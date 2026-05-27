'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FlaskConical, Code2, Zap, Trophy, ChevronRight, Search, Star } from 'lucide-react';
import { LAB_EXERCISES, LANGUAGE_META, type Language } from '@/lib/lab-exercises';

const DIFFICULTY_META = {
  Beginner:     { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  Intermediate: { color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-200'   },
  Advanced:     { color: 'text-rose-700',     bg: 'bg-rose-50',    border: 'border-rose-200'    },
};

const LANG_OPTIONS: { value: Language | 'all'; label: string }[] = [
  { value: 'all',        label: '🌍 All Languages' },
  { value: 'python',     label: '🐍 Python'        },
  { value: 'javascript', label: '⚡ JavaScript'    },
  { value: 'java',       label: '☕ Java'           },
  { value: 'cpp',        label: '⚙️ C++'            },
];

const DIFF_OPTIONS = ['All', 'Beginner', 'Intermediate', 'Advanced'] as const;

export default function LabPage() {
  const [search, setSearch]   = useState('');
  const [lang, setLang]       = useState<Language | 'all'>('all');
  const [diff, setDiff]       = useState<typeof DIFF_OPTIONS[number]>('All');

  const filtered = LAB_EXERCISES.filter(ex => {
    const matchLang = lang === 'all' || ex.language === lang;
    const matchDiff = diff === 'All' || ex.difficulty === diff;
    const matchSearch = !search ||
      ex.title.toLowerCase().includes(search.toLowerCase()) ||
      ex.category.toLowerCase().includes(search.toLowerCase()) ||
      ex.subject.toLowerCase().includes(search.toLowerCase());
    return matchLang && matchDiff && matchSearch;
  });

  const totalPoints = LAB_EXERCISES.reduce((s, e) => s + e.points, 0);

  return (
    <div className="animate-enter space-y-6">
      {/* Hero */}
      <div className="relative bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-3xl p-6 md:p-8 text-white overflow-hidden shadow-xl">
        <div className="absolute -top-8 -right-8 w-52 h-52 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <FlaskConical size={18} />
              </div>
              <span className="text-white/70 text-sm font-medium">Coding Lab</span>
            </div>
            <h1 className="font-heading font-bold text-2xl md:text-3xl">Practice by Coding</h1>
            <p className="text-white/70 text-sm mt-1 max-w-md">
              Write and run real code in Python, JavaScript, Java & C++. Learn by doing — no setup required.
            </p>
          </div>
          <div className="flex gap-3 flex-wrap shrink-0">
            <div className="bg-white/15 backdrop-blur rounded-2xl px-4 py-2 text-center border border-white/20">
              <p className="font-heading font-bold text-xl">{LAB_EXERCISES.length}</p>
              <p className="text-white/70 text-xs">Exercises</p>
            </div>
            <div className="bg-white/15 backdrop-blur rounded-2xl px-4 py-2 text-center border border-white/20">
              <p className="font-heading font-bold text-xl">4</p>
              <p className="text-white/70 text-xs">Languages</p>
            </div>
            <div className="bg-white/15 backdrop-blur rounded-2xl px-4 py-2 text-center border border-white/20">
              <p className="font-heading font-bold text-xl">{totalPoints}</p>
              <p className="text-white/70 text-xs">Points</p>
            </div>
          </div>
        </div>
      </div>

      {/* Language tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {LANG_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setLang(opt.value as Language | 'all')}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
              lang === opt.value
                ? 'bg-primary text-white border-primary shadow-sm shadow-primary/30'
                : 'bg-card border-border/50 text-muted-foreground hover:border-primary/50 hover:text-primary'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Search + difficulty */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-52">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search exercises..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-10 py-2.5 text-sm w-full"
          />
        </div>
        <div className="flex gap-1.5">
          {DIFF_OPTIONS.map(d => (
            <button
              key={d}
              onClick={() => setDiff(d)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                diff === d
                  ? 'bg-primary text-white border-primary'
                  : 'bg-card border-border/50 text-muted-foreground hover:border-primary/40'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        <span className="font-bold text-foreground">{filtered.length}</span> exercise{filtered.length !== 1 ? 's' : ''} found
      </p>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((ex, i) => {
          const langMeta = LANGUAGE_META[ex.language];
          const diffMeta = DIFFICULTY_META[ex.difficulty];
          return (
            <motion.div
              key={ex.slug}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -2 }}
            >
              <Link
                href={`/lab/${ex.slug}`}
                className="bg-card rounded-2xl border border-border/50 p-5 flex flex-col gap-3 hover:shadow-lg hover:shadow-primary/8 hover:border-primary/20 transition-all duration-200 group block"
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-2">
                  <div className={`px-2.5 py-1 rounded-lg text-xs font-bold ${langMeta.bg} ${langMeta.color} ${langMeta.border} border`}>
                    {langMeta.label}
                  </div>
                  <div className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${diffMeta.bg} ${diffMeta.color} ${diffMeta.border} border`}>
                    {ex.difficulty}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <h3 className="font-heading font-semibold text-secondary group-hover:text-primary transition-colors leading-snug">
                    {ex.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{ex.category} · {ex.subject}</p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-border/40 mt-auto">
                  <div className="flex items-center gap-1 text-xs font-semibold text-amber-500">
                    <Star size={11} className="fill-amber-400" />
                    +{ex.points} pts
                  </div>
                  <span className="flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                    Start <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Code2 size={40} className="text-muted-foreground mx-auto mb-4" />
          <p className="font-semibold text-secondary">No exercises found</p>
          <p className="text-sm text-muted-foreground mt-1">Try a different filter or search term</p>
        </div>
      )}

      {/* Info banner */}
      <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100 rounded-2xl p-4 flex items-start gap-3">
        <Zap size={18} className="text-violet-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-violet-700">Live Code Execution</p>
          <p className="text-xs text-violet-600 mt-0.5">
            Your code runs securely in the cloud via Piston — a free, open-source engine. No installs needed.
            Supports Python 3.10, Node.js 18, Java 15, and C++ 10.
          </p>
        </div>
      </div>
    </div>
  );
}
