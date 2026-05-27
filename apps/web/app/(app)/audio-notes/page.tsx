'use client';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Square, Volume2, ChevronDown } from 'lucide-react';
import { notes as notesApi } from '@/lib/api';
import { subjectColor, subjectIcon } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Note } from '@/types';

export default function AudioNotesPage() {
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [activeSection, setActiveSection] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState(0);
  const [rate, setRate] = useState(0.95);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notesApi.list().then(async ns => {
      const detailed = await Promise.all((ns as any[]).map(n => notesApi.get(n.id)));
      setAllNotes(detailed as Note[]);
      setLoading(false);
    });

    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('en'));
      setVoices(v);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => { window.speechSynthesis.cancel(); };
  }, []);

  function speak(note: Note, sectionIdx: number) {
    window.speechSynthesis.cancel();
    if (playing && activeNote?.id === note.id && activeSection === sectionIdx) {
      setPlaying(false);
      return;
    }
    const section = (note.sections as any[])[sectionIdx];
    if (!section) return;
    const text = `${section.heading}. ${section.content} ${section.keyPoints?.join('. ') || ''}`;
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = rate;
    if (voices[selectedVoice]) utt.voice = voices[selectedVoice];
    utt.onend = () => {
      const nextIdx = sectionIdx + 1;
      if (nextIdx < (note.sections as any[]).length) {
        setActiveSection(nextIdx);
        speak(note, nextIdx);
      } else {
        setPlaying(false);
      }
    };
    window.speechSynthesis.speak(utt);
    setActiveNote(note);
    setActiveSection(sectionIdx);
    setPlaying(true);
  }

  function stop() {
    window.speechSynthesis.cancel();
    setPlaying(false);
    setActiveNote(null);
  }

  if (loading) return <div className="space-y-4 animate-pulse">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-32 bg-muted rounded-2xl" />)}</div>;

  return (
    <div className="animate-enter space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-secondary">Audio Notes</h1>
          <p className="text-muted-foreground text-sm mt-1">Listen to your notes read aloud — section by section</p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-card rounded-2xl border border-border/50 p-5 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3">
          <Volume2 size={16} className="text-muted-foreground" />
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Voice</label>
            <select value={selectedVoice} onChange={e => setSelectedVoice(+e.target.value)} className="input-field py-1.5 text-xs w-40">
              {voices.length ? voices.map((v, i) => <option key={i} value={i}>{v.name}</option>) : <option>Default</option>}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Speed: {rate}×</label>
            <input type="range" min={0.5} max={2} step={0.25} value={rate} onChange={e => setRate(+e.target.value)} className="w-32 accent-primary" />
          </div>
        </div>
        {playing && (
          <Button variant="outline" onClick={stop} size="sm" className="ml-auto gap-2 border-destructive text-destructive hover:bg-destructive/5">
            <Square size={12} /> Stop
          </Button>
        )}
      </div>

      {/* Notes list */}
      <div className="space-y-4">
        {allNotes.map((note, ni) => {
          const isActive = activeNote?.id === note.id;
          const sections = note.sections as any[];
          return (
            <motion.div key={note.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ni * 0.05 }}
              className={`bg-card rounded-2xl border p-5 transition-all ${isActive ? 'border-primary/40 shadow-md shadow-primary/10' : 'border-border/50'}`}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-lg shrink-0">
                    {subjectIcon(note.subject)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-heading font-semibold text-secondary text-sm leading-snug truncate">{note.title}</h3>
                    <Badge variant="subject" subject={note.subject} className="mt-1 text-xs">{note.subject}</Badge>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => speak(note, isActive ? activeSection : 0)}
                  className={`gap-2 shrink-0 ${isActive && playing ? 'bg-primary/20 text-primary border border-primary/30' : ''}`}
                  variant={isActive && playing ? 'outline' : 'default'}
                >
                  {isActive && playing ? <><Pause size={12} /> Pause</> : <><Play size={12} /> Listen All</>}
                </Button>
              </div>

              {/* Sections */}
              <div className="space-y-2">
                {sections.map((section, si) => {
                  const isThisActive = isActive && activeSection === si && playing;
                  return (
                    <button
                      key={si}
                      onClick={() => speak(note, si)}
                      className={`w-full text-left flex items-center gap-3 p-3 rounded-xl transition-all ${isThisActive ? 'bg-primary/10 border border-primary/30' : 'hover:bg-muted border border-transparent'}`}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isThisActive ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                        {isThisActive ? <Pause size={10} /> : si + 1}
                      </div>
                      <span className={`text-sm flex-1 truncate ${isThisActive ? 'text-primary font-semibold' : 'text-foreground'}`}>{section.heading}</span>
                      {isThisActive && (
                        <span className="flex gap-0.5 items-end h-4">
                          {[1, 2, 3, 4].map(b => <span key={b} className="w-1 bg-primary rounded-full animate-pulse" style={{ height: `${b * 4}px`, animationDelay: `${b * 0.1}s` }} />)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
