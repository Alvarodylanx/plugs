'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BrainCircuit, Clock, Star, Search, Trophy, Filter, X,
  Zap, ToggleLeft, ToggleRight, Bell, BellOff, ChevronRight,
  Settings, CheckCircle2,
} from 'lucide-react';
import { notes as notesApi, quikz as quikzApi } from '@/lib/api';
import { subjectIcon } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { NoteCard } from '@/types';

const DIFFICULTIES: Record<string, { label: string; color: string; bg: string; border: string }> = {
  easy:   { label: 'Easy',   color: 'text-emerald-700', bg: 'bg-emerald-50',  border: 'border-emerald-200' },
  medium: { label: 'Medium', color: 'text-amber-700',   bg: 'bg-amber-50',    border: 'border-amber-200'   },
  hard:   { label: 'Hard',   color: 'text-rose-700',    bg: 'bg-rose-50',     border: 'border-rose-200'    },
};
const SUBJECT_GRADIENTS: Record<string, string> = {
  'Computer Science / ICT': 'from-blue-500 to-cyan-400',
  Biology:                  'from-emerald-500 to-teal-400',
  History:                  'from-amber-500 to-orange-400',
  Mathematics:              'from-indigo-500 to-violet-400',
  Physics:                  'from-purple-500 to-pink-400',
  Chemistry:                'from-rose-500 to-red-400',
  English:                  'from-sky-500 to-blue-400',
  Geography:                'from-green-500 to-emerald-400',
  Economics:                'from-yellow-500 to-amber-400',
};
const FREQUENCY_OPTIONS = [
  { value: 15,  label: 'Every 15 min' },
  { value: 30,  label: 'Every 30 min' },
  { value: 60,  label: 'Every 1 hour' },
  { value: 120, label: 'Every 2 hours' },
  { value: 240, label: 'Every 4 hours' },
];

function getDifficulty(subject: string) {
  if (['History', 'Physics', 'Chemistry'].includes(subject)) return 'hard';
  if (['English', 'Geography'].includes(subject)) return 'easy';
  return 'medium';
}
const SORT_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'az',      label: 'A → Z' },
  { value: 'easy',    label: 'Easiest first' },
  { value: 'hard',    label: 'Hardest first' },
];

export default function QuizzesPage() {
  const [tab, setTab] = useState<'library' | 'quikz'>('library');
  const [notes, setNotes] = useState<NoteCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeSubject, setActiveSubject] = useState('All');
  const [sort, setSort] = useState('default');

  // Quikz settings state
  const [qEnabled, setQEnabled] = useState(false);
  const [qFreq, setQFreq] = useState(30);
  const [qFreqInput, setQFreqInput] = useState('30');
  const [qNoteIds, setQNoteIds] = useState<string[]>([]);
  const [qQuietStart, setQQuietStart] = useState('22:00');
  const [qQuietEnd, setQQuietEnd] = useState('07:00');
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [notifStatus, setNotifStatus] = useState<'unknown' | 'granted' | 'denied' | 'unsupported'>('unknown');
  const [noteSearch, setNoteSearch] = useState('');

  useEffect(() => {
    notesApi.list().then(n => { setNotes(n as NoteCard[]); setLoading(false); });
    quikzApi.getSettings().then((s: any) => {
      setQEnabled(s.enabled ?? false);
      const freq = s.frequencyMin ?? 30;
      setQFreq(freq);
      setQFreqInput(String(freq));
      setQNoteIds(s.noteIds ?? []);
      setQQuietStart(s.quietStart ?? '22:00');
      setQQuietEnd(s.quietEnd ?? '07:00');
    }).catch(() => {});

    if (!('Notification' in window)) setNotifStatus('unsupported');
    else if (Notification.permission === 'granted') setNotifStatus('granted');
    else if (Notification.permission === 'denied') setNotifStatus('denied');
    else setNotifStatus('unknown');
  }, []);

  async function saveSettings() {
    setSavingSettings(true);
    try {
      await quikzApi.saveSettings({
        enabled: qEnabled,
        frequencyMin: qFreq,
        subjects: [],
        noteIds: qNoteIds,
        quietStart: qQuietStart,
        quietEnd: qQuietEnd,
      });
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2500);

      // Request push permission if enabling
      if (qEnabled && notifStatus === 'unknown' && 'Notification' in window) {
        const perm = await Notification.requestPermission();
        setNotifStatus(perm as any);
      }
    } catch {}
    finally { setSavingSettings(false); }
  }

  function toggleNote(id: string) {
    setQNoteIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function setFreq(val: number) {
    const clamped = Math.max(1, Math.min(1440, val));
    setQFreq(clamped);
    setQFreqInput(String(clamped));
  }

  const subjects = ['All', ...Array.from(new Set(notes.map(n => n.subject)))];
  let filtered = notes;
  if (activeSubject !== 'All') filtered = filtered.filter(n => n.subject === activeSubject);
  if (search) filtered = filtered.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.subject.toLowerCase().includes(search.toLowerCase())
  );
  if (sort === 'az')   filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
  if (sort === 'easy') filtered = [...filtered].sort((a, b) => getDifficulty(a.subject).localeCompare(getDifficulty(b.subject)));
  if (sort === 'hard') filtered = [...filtered].sort((a, b) => getDifficulty(b.subject).localeCompare(getDifficulty(a.subject)));
  const totalQuestions = notes.reduce((acc, n) => acc + (n.questionCount ?? 12), 0);

  return (
    <div className="animate-enter space-y-6">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200/40 overflow-hidden"
      >
        <div className="absolute -top-6 -right-6 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-20 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading font-bold text-2xl flex items-center gap-2">
              <BrainCircuit size={24} /> Quizzes
            </h1>
            <p className="text-white/70 text-sm mt-1">Test your knowledge — or let Quikz test you automatically</p>
          </div>
          <div className="flex gap-3">
            <div className="bg-white/15 rounded-xl px-4 py-2 text-center">
              <p className="font-heading font-bold text-xl">{notes.length}</p>
              <p className="text-xs text-white/70">Quizzes</p>
            </div>
            <div className="bg-white/15 rounded-xl px-4 py-2 text-center">
              <p className="font-heading font-bold text-xl">{totalQuestions}</p>
              <p className="text-xs text-white/70">Questions</p>
            </div>
            <div
              onClick={() => setTab('quikz')}
              className={`bg-white/15 rounded-xl px-4 py-2 text-center cursor-pointer hover:bg-white/25 transition-colors border ${qEnabled ? 'border-amber-300/50' : 'border-transparent'}`}
            >
              <p className="font-heading font-bold text-xl flex items-center justify-center gap-1">
                <Zap size={16} className={qEnabled ? 'text-amber-300' : ''} />
              </p>
              <p className="text-xs text-white/70">Quikz {qEnabled ? 'ON' : 'OFF'}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/50 rounded-2xl p-1.5 border border-border/50">
        {([
          { key: 'library', label: 'Quiz Library', icon: BrainCircuit },
          { key: 'quikz',   label: 'Quikz Settings', icon: Zap },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
              tab === key
                ? 'bg-card text-primary shadow-sm border border-border/50'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon size={14} /> {label}
            {key === 'quikz' && qEnabled && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>
        ))}
      </div>

      {/* ── QUIZ LIBRARY TAB ── */}
      {tab === 'library' && (
        <div className="space-y-5">
          <div className="flex gap-3 flex-wrap">
            <div className="bg-card rounded-xl border border-border/50 px-3 py-2.5 flex items-center gap-2 flex-1 min-w-full sm:min-w-52">
              <Search size={15} className="text-muted-foreground shrink-0" />
              <input
                type="text"
                placeholder="Search quizzes..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex items-center gap-2 bg-card rounded-xl border border-border/50 px-3 py-2.5">
              <Filter size={14} className="text-muted-foreground" />
              <select value={sort} onChange={e => setSort(e.target.value)} className="bg-transparent text-sm outline-none text-foreground cursor-pointer">
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

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
                {s === 'All' ? '🧠 All' : `${subjectIcon(s)} ${s.split(' / ')[0]}`}
              </button>
            ))}
          </div>

          <p className="text-sm text-muted-foreground">
            <span className="font-bold text-foreground">{filtered.length}</span> quiz{filtered.length !== 1 ? 'zes' : ''} found
          </p>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="bg-muted rounded-2xl h-56 animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <BrainCircuit size={40} className="text-muted-foreground mx-auto mb-4" />
              <p className="font-semibold text-secondary">No quizzes found</p>
              <p className="text-sm text-muted-foreground mt-1">Try a different search or subject</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((note, i) => {
                const diff = getDifficulty(note.subject);
                const diffMeta = DIFFICULTIES[diff];
                const gradient = SUBJECT_GRADIENTS[note.subject] || 'from-primary to-indigo-500';
                return (
                  <motion.div key={note.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Link href={`/notes/${note.id}`} className="bg-card rounded-2xl border border-border/50 overflow-hidden flex flex-col card-hover group block hover:shadow-lg transition-all">
                      <div className={`h-2 bg-gradient-to-r ${gradient}`} />
                      <div className="p-5 flex flex-col gap-3 flex-1">
                        <div className="flex items-start justify-between">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform`}>
                            {subjectIcon(note.subject)}
                          </div>
                          <span className={`badge text-xs font-semibold ${diffMeta.bg} ${diffMeta.color} ${diffMeta.border} border`}>
                            {diff === 'hard' ? '🔥' : diff === 'easy' ? '⭐' : '⚡'} {diffMeta.label}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-heading font-semibold text-secondary group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                            {note.title}
                          </h3>
                          <Badge variant="subject" subject={note.subject} className="mt-1.5 text-xs">{note.subject}</Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><BrainCircuit size={11} /> {note.questionCount ?? 12} questions</span>
                          <span className="flex items-center gap-1"><Clock size={11} /> ~{Math.ceil((note.questionCount ?? 12) * 0.75)} min</span>
                          <span className="flex items-center gap-1"><Star size={11} /> {note.level}</span>
                        </div>
                        <div className="flex items-center justify-between border-t border-border/50 pt-3">
                          <span className="text-xs text-muted-foreground">{note.subject.split(' / ')[0]}</span>
                          <span className="flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:gap-2.5 transition-all">
                            Start Quiz <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}

          {!loading && notes.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3">
              <Trophy size={18} className="text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-700">Pro Tip</p>
                <p className="text-xs text-amber-600 mt-0.5">Complete a quiz after reading each note to earn +10 points. Enable <strong>Quikz</strong> to get micro-questions throughout the day — proven to boost memory retention by up to 80%!</p>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* ── QUIKZ SETTINGS TAB ── */}
      {tab === 'quikz' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

          {/* What is Quikz */}
          <div className="bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0">
                <Zap size={18} className="text-white" />
              </div>
              <div>
                <p className="font-heading font-bold text-secondary">What is Quikz?</p>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  Quikz sends you one question at a time, at your chosen frequency — as a popup while you study, and as a push notification even when the app is closed. Questions come from your own notes and are chosen using <strong>spaced repetition</strong> — topics you get wrong come back more often.
                </p>
              </div>
            </div>
          </div>

          {/* Master toggle */}
          <div className="bg-card border border-border/50 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground">Enable Quikz</p>
              <p className="text-xs text-muted-foreground mt-0.5">Start receiving micro-questions throughout the day</p>
            </div>
            <button
              onClick={() => setQEnabled(e => !e)}
              className={`transition-colors ${qEnabled ? 'text-primary' : 'text-muted-foreground'}`}
            >
              {qEnabled
                ? <ToggleRight size={40} className="text-primary" />
                : <ToggleLeft size={40} />}
            </button>
          </div>

          <AnimatePresence>
            {qEnabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 overflow-hidden"
              >
                {/* Frequency */}
                <div className="bg-card border border-border/50 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-primary" />
                    <p className="font-semibold text-foreground">Question Frequency</p>
                  </div>
                  {/* Presets */}
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {FREQUENCY_OPTIONS.map(f => (
                      <button
                        key={f.value}
                        onClick={() => setFreq(f.value)}
                        className={`py-2 px-2 rounded-xl border text-xs font-semibold transition-all ${
                          qFreq === f.value
                            ? 'bg-primary text-white border-primary shadow-sm'
                            : 'border-border text-muted-foreground hover:border-primary/50 hover:text-primary'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                  {/* Custom input */}
                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex-1 flex items-center gap-2 bg-muted/50 border border-border rounded-xl px-3 py-2 focus-within:border-primary/50 transition-colors">
                      <input
                        type="number"
                        min={1}
                        max={1440}
                        value={qFreqInput}
                        onChange={e => {
                          setQFreqInput(e.target.value);
                          const n = parseInt(e.target.value);
                          if (!isNaN(n) && n >= 1) setQFreq(Math.min(1440, n));
                        }}
                        onBlur={() => {
                          const n = parseInt(qFreqInput);
                          if (isNaN(n) || n < 1) { setQFreqInput('30'); setQFreq(30); }
                          else setQFreqInput(String(Math.min(1440, n)));
                        }}
                        className="w-16 bg-transparent outline-none text-sm font-semibold text-foreground"
                        placeholder="30"
                      />
                      <span className="text-xs text-muted-foreground">minutes</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {qFreq < 60
                        ? `Every ${qFreq} min`
                        : qFreq % 60 === 0
                          ? `Every ${qFreq / 60}h`
                          : `Every ${Math.floor(qFreq / 60)}h ${qFreq % 60}m`}
                    </p>
                  </div>
                </div>

                {/* Notes topic picker */}
                <div className="bg-card border border-border/50 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BrainCircuit size={16} className="text-primary" />
                      <p className="font-semibold text-foreground">Notes to Include</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {qNoteIds.length > 0 && (
                        <button onClick={() => setQNoteIds([])} className="text-xs text-muted-foreground hover:text-destructive transition-colors">
                          Clear all
                        </button>
                      )}
                      <p className="text-xs font-medium text-primary">
                        {qNoteIds.length === 0 ? 'All notes' : `${qNoteIds.length} selected`}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Select specific notes — leave all unchecked to use every note.</p>

                  {/* Search within notes */}
                  <div className="flex items-center gap-2 bg-muted/50 border border-border/50 rounded-xl px-3 py-2 focus-within:border-primary/50 transition-colors">
                    <Search size={13} className="text-muted-foreground shrink-0" />
                    <input
                      value={noteSearch}
                      onChange={e => setNoteSearch(e.target.value)}
                      placeholder="Search notes..."
                      className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                    />
                    {noteSearch && (
                      <button onClick={() => setNoteSearch('')} className="text-muted-foreground hover:text-foreground">
                        <X size={12} />
                      </button>
                    )}
                  </div>

                  {/* Note list */}
                  <div className="space-y-1.5 max-h-64 overflow-y-auto scrollbar-hide">
                    {notes
                      .filter(n => n.questionCount > 0 &&
                        (noteSearch === '' ||
                          n.title.toLowerCase().includes(noteSearch.toLowerCase()) ||
                          n.subject.toLowerCase().includes(noteSearch.toLowerCase())))
                      .map(n => {
                        const selected = qNoteIds.includes(n.id);
                        const gradient = SUBJECT_GRADIENTS[n.subject] || 'from-primary to-indigo-500';
                        return (
                          <button
                            key={n.id}
                            onClick={() => toggleNote(n.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all ${
                              selected
                                ? 'border-primary/40 bg-primary/5'
                                : 'border-border/50 hover:border-primary/30 hover:bg-muted/40'
                            }`}
                          >
                            {/* Checkbox */}
                            <div className={`w-4 h-4 rounded shrink-0 border-2 flex items-center justify-center transition-all ${
                              selected ? 'bg-primary border-primary' : 'border-muted-foreground'
                            }`}>
                              {selected && <CheckCircle2 size={10} className="text-white" />}
                            </div>
                            {/* Subject icon */}
                            <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-sm shrink-0`}>
                              {subjectIcon(n.subject)}
                            </div>
                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{n.title}</p>
                              <p className="text-xs text-muted-foreground">{n.subject.split(' / ')[0]} · {n.questionCount} questions</p>
                            </div>
                          </button>
                        );
                      })}
                    {notes.filter(n => n.questionCount > 0).length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-4">No notes with quiz questions found.</p>
                    )}
                  </div>
                </div>

                {/* Quiet hours */}
                <div className="bg-card border border-border/50 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <BellOff size={16} className="text-primary" />
                    <p className="font-semibold text-foreground">Quiet Hours</p>
                  </div>
                  <p className="text-xs text-muted-foreground">No questions will be sent during this time.</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground mb-1 block">From</label>
                      <input
                        type="time"
                        value={qQuietStart}
                        onChange={e => setQQuietStart(e.target.value)}
                        className="input-field text-sm"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground mb-1 block">To</label>
                      <input
                        type="time"
                        value={qQuietEnd}
                        onChange={e => setQQuietEnd(e.target.value)}
                        className="input-field text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Push notifications status */}
                <div className={`rounded-2xl p-4 flex items-start gap-3 border ${
                  notifStatus === 'granted'
                    ? 'bg-emerald-50 border-emerald-200'
                    : notifStatus === 'denied'
                      ? 'bg-rose-50 border-rose-200'
                      : 'bg-amber-50 border-amber-200'
                }`}>
                  {notifStatus === 'granted'
                    ? <Bell size={15} className="text-emerald-600 mt-0.5 shrink-0" />
                    : notifStatus === 'denied'
                      ? <BellOff size={15} className="text-rose-600 mt-0.5 shrink-0" />
                      : <Bell size={15} className="text-amber-600 mt-0.5 shrink-0" />}
                  <div>
                    <p className={`text-sm font-semibold ${
                      notifStatus === 'granted' ? 'text-emerald-700' : notifStatus === 'denied' ? 'text-rose-700' : 'text-amber-700'
                    }`}>
                      {notifStatus === 'granted'
                        ? 'Push notifications enabled'
                        : notifStatus === 'denied'
                          ? 'Push notifications blocked'
                          : notifStatus === 'unsupported'
                            ? 'Push not supported on this browser'
                            : 'Push notifications not yet enabled'}
                    </p>
                    <p className={`text-xs mt-0.5 ${
                      notifStatus === 'granted' ? 'text-emerald-600' : notifStatus === 'denied' ? 'text-rose-600' : 'text-amber-600'
                    }`}>
                      {notifStatus === 'granted'
                        ? 'You will receive Quikz even when the app is closed.'
                        : notifStatus === 'denied'
                          ? 'Enable notifications in your browser settings to receive Quikz outside the app.'
                          : notifStatus === 'unsupported'
                            ? 'In-app popups will still work when you have the app open.'
                            : 'Save settings to be prompted for notification permission.'}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Save button */}
          <Button
            onClick={saveSettings}
            loading={savingSettings}
            className="w-full gap-2 py-3 text-base"
          >
            {settingsSaved ? <><CheckCircle2 size={16} /> Saved!</> : <><Settings size={16} /> Save Quikz Settings</>}
          </Button>
        </motion.div>
      )}
    </div>
  );
}
