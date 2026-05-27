'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Square, ChevronDown, ChevronUp, Headphones, Mic2, ListMusic, Clock,
} from 'lucide-react';
import { notes as notesApi } from '@/lib/api';
import { subjectIcon } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { Note } from '@/types';

const SUBJECT_GRADIENTS: Record<string, string> = {
  'Computer Science / ICT': 'from-blue-500 to-cyan-400',
  'Biology':                'from-emerald-500 to-teal-400',
  'History':                'from-amber-500 to-orange-400',
  'Mathematics':            'from-indigo-500 to-violet-400',
  'Physics':                'from-purple-500 to-pink-400',
  'Chemistry':              'from-rose-500 to-red-400',
  'English':                'from-sky-500 to-blue-400',
  'Geography':              'from-green-500 to-emerald-400',
  'Economics':              'from-yellow-500 to-amber-400',
};

// Score voices by naturalness — higher is better
function voiceScore(v: SpeechSynthesisVoice): number {
  const n = v.name.toLowerCase();
  let s = 0;
  if (n.includes('neural') || n.includes('natural')) s += 20;
  if (!v.localService) s += 8;              // Online = higher quality
  if (n.includes('online')) s += 6;
  if (n.includes('premium') || n.includes('enhanced')) s += 5;
  if (n.includes('google')) s += 4;
  if (n.includes('aria') || n.includes('jenny') || n.includes('guy')) s += 3;
  if (v.lang === 'en-US') s += 2;
  if (v.lang === 'en-GB') s += 1;
  return s;
}

function cleanVoiceName(v: SpeechSynthesisVoice): string {
  let name = v.name
    .replace('Microsoft ', '')
    .replace(/ - .+$/, '')     // Remove " - English (United States)"
    .replace(/\s*\([^)]*\)/g, '') // Remove parentheses
    .trim();
  const n = name.toLowerCase();
  const isHQ = n.includes('neural') || n.includes('natural') || !v.localService;
  return isHQ ? `✦ ${name}` : name;
}

function WaveformBars({ playing, bars = 24 }: { playing: boolean; bars?: number }) {
  return (
    <div className="flex items-end gap-0.5 h-8">
      {Array.from({ length: bars }, (_, i) => (
        <motion.div
          key={i}
          className="w-1 bg-white/70 rounded-full"
          animate={playing ? { height: [4, 8 + Math.sin(i) * 10 + (i % 3) * 6, 4] } : { height: 4 }}
          transition={playing ? { duration: 0.6 + (i % 4) * 0.1, repeat: Infinity, ease: 'easeInOut', delay: i * 0.04 } : {}}
        />
      ))}
    </div>
  );
}

function EqualizerBars({ active }: { active: boolean }) {
  return (
    <span className="flex gap-0.5 items-end h-4 ml-1">
      {[1, 2, 3, 4].map(b => (
        <motion.span key={b} className="w-0.5 bg-primary rounded-full"
          animate={active ? { height: [3, 6 + b * 3, 3] } : { height: 3 }}
          transition={active ? { duration: 0.5 + b * 0.08, repeat: Infinity, ease: 'easeInOut', delay: b * 0.1 } : {}}
        />
      ))}
    </span>
  );
}

export default function AudioNotesPage() {
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [activeSection, setActiveSection] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState(0);
  const [rate, setRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [expandedNote, setExpandedNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQueue, setShowQueue] = useState(false);

  // Refs — all settings accessed via refs inside speakSection to avoid stale closures
  const uttRef = useRef<SpeechSynthesisUtterance | null>(null);
  const noteRef = useRef<Note | null>(null);
  const sectionRef = useRef(0);
  const playingRef = useRef(false);
  const rateRef = useRef(1);
  const volumeRef = useRef(1);
  const mutedRef = useRef(false);
  const voiceIdxRef = useRef(0);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  // Keep refs in sync
  useEffect(() => { noteRef.current = activeNote; }, [activeNote]);
  useEffect(() => { sectionRef.current = activeSection; }, [activeSection]);
  useEffect(() => { playingRef.current = playing; }, [playing]);
  useEffect(() => { rateRef.current = rate; }, [rate]);
  useEffect(() => { volumeRef.current = volume; }, [volume]);
  useEffect(() => { mutedRef.current = muted; }, [muted]);
  useEffect(() => { voiceIdxRef.current = selectedVoice; }, [selectedVoice]);
  useEffect(() => { voicesRef.current = voices; }, [voices]);

  // Load notes
  useEffect(() => {
    notesApi.list().then(async ns => {
      const detailed = await Promise.all((ns as any[]).map((n: any) => notesApi.get(n.id)));
      const notes = detailed as Note[];
      setAllNotes(notes);
      if (notes.length) { setActiveNote(notes[0]); setExpandedNote(notes[0].id); noteRef.current = notes[0]; }
      setLoading(false);
    });
    return () => { window.speechSynthesis.cancel(); };
  }, []);

  // Load voices — filter to English only, sort by quality
  useEffect(() => {
    const load = () => {
      const raw = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('en'));
      const sorted = [...raw].sort((a, b) => voiceScore(b) - voiceScore(a));
      setVoices(sorted);
      voicesRef.current = sorted;
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
  }, []);

  // Core speak function — uses ONLY refs, so it never goes stale
  const speakSection = useCallback((note: Note, sectionIdx: number) => {
    window.speechSynthesis.cancel();
    const section = (note.sections as any[])[sectionIdx];
    if (!section) return;

    const text = [
      section.heading + '.',
      section.content,
      section.keyPoints?.length ? 'Key points: ' + section.keyPoints.join('. ') : '',
    ].filter(Boolean).join(' ');

    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = rateRef.current;
    utt.volume = mutedRef.current ? 0 : volumeRef.current;
    utt.pitch = 1;
    const voice = voicesRef.current[voiceIdxRef.current];
    if (voice) utt.voice = voice;

    utt.onend = () => {
      if (!playingRef.current) return;
      const cur = noteRef.current;
      if (!cur) return;
      const next = sectionRef.current + 1;
      if (next < (cur.sections as any[]).length) {
        sectionRef.current = next;
        setActiveSection(next);
        speakSection(cur, next);
      } else {
        setAllNotes(prev => {
          const idx = prev.findIndex(n => n.id === cur.id);
          if (idx < prev.length - 1) {
            const nxt = prev[idx + 1];
            noteRef.current = nxt;
            setActiveNote(nxt);
            sectionRef.current = 0;
            setActiveSection(0);
            speakSection(nxt, 0);
          } else {
            setPlaying(false);
            playingRef.current = false;
          }
          return prev;
        });
      }
    };

    utt.onerror = (e) => {
      if ((e as any).error !== 'interrupted' && (e as any).error !== 'canceled') {
        setPlaying(false);
        playingRef.current = false;
      }
    };

    uttRef.current = utt;
    window.speechSynthesis.speak(utt);
  }, []); // Empty deps — all values from refs

  // Restart speech immediately when rate or voice changes mid-playback
  const prevRateRef = useRef(rate);
  const prevVoiceRef = useRef(selectedVoice);
  useEffect(() => {
    const rateChanged = prevRateRef.current !== rate;
    const voiceChanged = prevVoiceRef.current !== selectedVoice;
    prevRateRef.current = rate;
    prevVoiceRef.current = selectedVoice;
    if ((rateChanged || voiceChanged) && playingRef.current && noteRef.current) {
      speakSection(noteRef.current, sectionRef.current);
    }
  }, [rate, selectedVoice, speakSection]);

  function play(note: Note, sectionIdx = 0) {
    setActiveNote(note);
    noteRef.current = note;
    setActiveSection(sectionIdx);
    sectionRef.current = sectionIdx;
    setPlaying(true);
    playingRef.current = true;
    speakSection(note, sectionIdx);
  }

  function pauseResume() {
    if (!activeNote) return;
    if (playing) {
      window.speechSynthesis.pause();
      setPlaying(false);
      playingRef.current = false;
    } else {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setPlaying(true);
        playingRef.current = true;
      } else {
        play(activeNote, activeSection);
      }
    }
  }

  function stop() {
    window.speechSynthesis.cancel();
    setPlaying(false);
    playingRef.current = false;
  }

  function skipBack() {
    if (!activeNote) return;
    const prev = activeSection - 1;
    if (prev >= 0) play(activeNote, prev);
  }

  function skipForward() {
    if (!activeNote) return;
    const next = activeSection + 1;
    if (next < (activeNote.sections as any[]).length) play(activeNote, next);
    else {
      const idx = allNotes.findIndex(n => n.id === activeNote.id);
      if (idx < allNotes.length - 1) play(allNotes[idx + 1], 0);
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
      if (e.code === 'Space') { e.preventDefault(); pauseResume(); }
      if (e.code === 'ArrowRight') skipForward();
      if (e.code === 'ArrowLeft') skipBack();
      if (e.code === 'KeyM') setMuted(m => !m);
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [playing, activeNote, activeSection]);

  const currentSections = activeNote ? (activeNote.sections as any[]) : [];
  const currentSection = currentSections[activeSection];
  const gradient = activeNote ? (SUBJECT_GRADIENTS[activeNote.subject] || 'from-primary to-indigo-500') : 'from-primary to-indigo-500';

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-64 bg-muted rounded-3xl" />
        {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-muted rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="animate-enter space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading font-bold text-2xl text-secondary flex items-center gap-2">
            <Headphones size={24} className="text-primary" /> Audio Notes
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {allNotes.length} notes · Listen hands-free
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted rounded-xl px-3 py-1.5">
          <kbd className="font-semibold">Space</kbd> Play/Pause ·
          <kbd className="font-semibold">← →</kbd> Skip ·
          <kbd className="font-semibold">M</kbd> Mute
        </div>
      </div>

      {/* Now Playing */}
      {activeNote && (
        <motion.div key={activeNote.id} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className={`relative bg-gradient-to-br ${gradient} rounded-3xl p-6 text-white shadow-2xl overflow-hidden`}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

          <div className="relative z-10">
            {/* Track info */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-white/60 text-xs font-medium uppercase tracking-wider mb-1">Now Playing</p>
                <h2 className="font-heading font-bold text-xl leading-tight max-w-xs line-clamp-2">{activeNote.title}</h2>
                <p className="text-white/70 text-sm mt-1">{subjectIcon(activeNote.subject)} {activeNote.subject}</p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl shrink-0 shadow-lg">
                {subjectIcon(activeNote.subject)}
              </div>
            </div>

            {/* Current section */}
            <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-3 mb-4">
              <p className="text-white/60 text-xs mb-0.5">Section {activeSection + 1} of {currentSections.length}</p>
              <p className="font-semibold text-sm">{currentSection?.heading || 'Ready to play'}</p>
              <WaveformBars playing={playing} bars={28} />
            </div>

            {/* Section progress dots */}
            <div className="flex gap-1.5 mb-5 flex-wrap">
              {currentSections.map((_, i) => (
                <button key={i} onClick={() => play(activeNote, i)}
                  className={`h-1.5 rounded-full transition-all ${i === activeSection ? 'bg-white w-6' : i < activeSection ? 'bg-white/60 w-3' : 'bg-white/25 w-3'}`}
                  title={`Section ${i + 1}`}
                />
              ))}
            </div>

            {/* Transport controls */}
            <div className="flex items-center justify-center gap-4 mb-5">
              <button onClick={skipBack} disabled={activeSection === 0}
                className="p-2 rounded-full hover:bg-white/20 transition-colors disabled:opacity-30">
                <SkipBack size={20} fill="white" className="text-white" />
              </button>
              <motion.button whileTap={{ scale: 0.92 }} onClick={pauseResume}
                className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-xl">
                {playing
                  ? <Pause size={22} fill="currentColor" className="text-gray-900" />
                  : <Play size={22} fill="currentColor" className="text-gray-900 ml-0.5" />
                }
              </motion.button>
              <button onClick={skipForward} className="p-2 rounded-full hover:bg-white/20 transition-colors">
                <SkipForward size={20} fill="white" className="text-white" />
              </button>
            </div>

            {/* Settings row */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Volume */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <button onClick={() => setMuted(m => !m)} className="text-white/80 hover:text-white transition-colors shrink-0">
                  {muted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
                <input type="range" min={0} max={1} step={0.05} value={muted ? 0 : volume}
                  onChange={e => { setVolume(+e.target.value); if (+e.target.value > 0) setMuted(false); }}
                  className="flex-1 accent-white/80 cursor-pointer min-w-0"
                />
              </div>

              {/* Speed */}
              <div className="flex items-center gap-1.5 bg-white/15 hover:bg-white/20 rounded-lg px-2.5 py-1.5 transition-colors">
                <Clock size={12} className="text-white/70" />
                <select value={rate} onChange={e => setRate(+e.target.value)}
                  className="bg-transparent text-white text-xs font-semibold outline-none cursor-pointer">
                  {[0.5, 0.75, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2].map(r =>
                    <option key={r} value={r} className="text-gray-900 bg-white">{r === 1 ? 'Normal' : `${r}×`}</option>
                  )}
                </select>
              </div>

              {/* Voice */}
              <div className="flex items-center gap-1.5 bg-white/15 hover:bg-white/20 rounded-lg px-2.5 py-1.5 transition-colors flex-1 min-w-0">
                <Mic2 size={12} className="text-white/70 shrink-0" />
                <select value={selectedVoice} onChange={e => setSelectedVoice(+e.target.value)}
                  className="bg-transparent text-white text-xs font-semibold outline-none cursor-pointer flex-1 min-w-0 truncate">
                  {voices.length
                    ? voices.map((v, i) => <option key={i} value={i} className="text-gray-900 bg-white">{cleanVoiceName(v)}</option>)
                    : <option className="text-gray-900">Default Voice</option>
                  }
                </select>
              </div>

              {playing && (
                <button onClick={stop} className="flex items-center gap-1 bg-white/15 hover:bg-white/25 rounded-lg px-2.5 py-1.5 text-xs text-white transition-colors shrink-0">
                  <Square size={10} fill="currentColor" /> Stop
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Library */}
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-semibold text-secondary flex items-center gap-2">
          <ListMusic size={18} className="text-primary" /> Your Library
        </h2>
        <button onClick={() => setShowQueue(q => !q)} className="text-xs text-muted-foreground flex items-center gap-1 hover:text-primary transition-colors">
          {showQueue ? 'Collapse all' : 'Expand all'}
          {showQueue ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      <div className="space-y-3">
        {allNotes.map((note, ni) => {
          const isActive = activeNote?.id === note.id;
          const sections = note.sections as any[];
          const isExpanded = showQueue || expandedNote === note.id;
          const noteGradient = SUBJECT_GRADIENTS[note.subject] || 'from-primary to-indigo-500';

          return (
            <motion.div key={note.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ni * 0.04 }}
              className={`bg-card rounded-2xl border overflow-hidden transition-all ${isActive ? 'border-primary/40 shadow-lg shadow-primary/8' : 'border-border/50'}`}
            >
              <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setExpandedNote(isExpanded ? null : note.id)}>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${noteGradient} flex items-center justify-center text-2xl shrink-0 shadow-md`}>
                  {subjectIcon(note.subject)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-semibold text-sm text-secondary truncate">{note.title}</h3>
                    {isActive && playing && <EqualizerBars active />}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <Badge variant="subject" subject={note.subject} className="text-xs">{note.subject}</Badge>
                    <span className="text-xs text-muted-foreground">{sections.length} sections · ~{note.readTime}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <motion.button whileTap={{ scale: 0.9 }}
                    onClick={e => { e.stopPropagation(); if (isActive && playing) pauseResume(); else play(note, isActive ? activeSection : 0); }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm ${
                      isActive && playing ? 'bg-primary/20 text-primary border border-primary/40' : 'bg-primary text-white hover:bg-primary/90'
                    }`}
                  >
                    {isActive && playing ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                  </motion.button>
                  {isExpanded ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.22 }} style={{ overflow: 'hidden' }}>
                    <div className="px-4 pb-4 space-y-1.5 border-t border-border/30 pt-3">
                      {sections.map((section, si) => {
                        const isPlaying = isActive && activeSection === si && playing;
                        const isCompleted = isActive && si < activeSection;
                        return (
                          <motion.button key={si} whileTap={{ scale: 0.98 }} onClick={() => play(note, si)}
                            className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                              isPlaying ? 'bg-primary/10 border border-primary/30'
                                : isCompleted ? 'bg-muted/50 border border-transparent'
                                : 'hover:bg-muted border border-transparent'
                            }`}
                          >
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                              isPlaying ? 'bg-primary text-white' : isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-muted text-muted-foreground'
                            }`}>
                              {isPlaying ? <Pause size={10} /> : isCompleted ? '✓' : si + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className={`text-sm truncate block ${isPlaying ? 'text-primary font-semibold' : isCompleted ? 'text-muted-foreground' : 'text-foreground'}`}>
                                {section.heading}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                ~{Math.max(1, Math.ceil((section.content?.split(' ')?.length || 0) / 130))} min
                              </span>
                            </div>
                            {isPlaying && (
                              <div className="flex gap-0.5 items-end h-4 shrink-0">
                                {[1, 2, 3].map(b => (
                                  <motion.span key={b} className="w-1 bg-primary rounded-full"
                                    animate={{ height: [3, b * 4 + 3, 3] }}
                                    transition={{ duration: 0.5, repeat: Infinity, delay: b * 0.12 }}
                                  />
                                ))}
                              </div>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {!allNotes.length && (
        <div className="text-center py-20">
          <Headphones size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="font-heading font-semibold text-secondary">No notes to play yet</p>
          <p className="text-sm text-muted-foreground mt-2">Upload some notes to start listening</p>
        </div>
      )}
    </div>
  );
}
