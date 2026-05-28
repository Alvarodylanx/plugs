'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Coffee, Brain, ChevronDown, Timer } from 'lucide-react';
import { playSound } from '@/lib/sounds';

const WORK_SEC = 25 * 60;
const BREAK_SEC = 5 * 60;
const RADIUS = 26;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type Phase = 'work' | 'break';

function pad(n: number) { return String(n).padStart(2, '0'); }

export function PomodoroTimer() {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>('work');
  const [seconds, setSeconds] = useState(WORK_SEC);
  const [running, setRunning] = useState(false);
  const [cycles, setCycles] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = phase === 'work' ? WORK_SEC : BREAK_SEC;
  const progress = (total - seconds) / total;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            // Phase complete
            playSound('chime', 0.7);
            const nextPhase: Phase = phase === 'work' ? 'break' : 'work';
            setPhase(nextPhase);
            if (phase === 'work') setCycles(c => c + 1);
            setRunning(false);
            return nextPhase === 'work' ? WORK_SEC : BREAK_SEC;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, phase]);

  function reset() {
    setRunning(false);
    setSeconds(phase === 'work' ? WORK_SEC : BREAK_SEC);
  }

  function switchPhase(p: Phase) {
    setRunning(false);
    setPhase(p);
    setSeconds(p === 'work' ? WORK_SEC : BREAK_SEC);
  }

  const isWork = phase === 'work';
  const ringColor = isWork ? 'hsl(173,85%,38%)' : 'hsl(252,39%,60%)';
  const bgAccent = isWork ? 'from-primary/10 to-teal-500/5' : 'from-secondary/10 to-indigo-500/5';

  return (
    <div className="fixed bottom-20 right-6 z-40 flex flex-col items-end gap-2">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.2 }}
            className={`bg-card border border-border rounded-2xl shadow-xl w-56 overflow-hidden`}
          >
            {/* Header */}
            <div className={`bg-gradient-to-br ${bgAccent} px-4 pt-4 pb-3 border-b border-border/60`}>
              <div className="flex items-center justify-between mb-3">
                {/* Phase tabs */}
                <div className="flex gap-1 bg-muted rounded-xl p-1">
                  <button
                    onClick={() => switchPhase('work')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${isWork ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <Brain size={11} /> Work
                  </button>
                  <button
                    onClick={() => switchPhase('break')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${!isWork ? 'bg-secondary text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <Coffee size={11} /> Break
                  </button>
                </div>
                {cycles > 0 && (
                  <span className="text-xs text-muted-foreground font-medium">{cycles} 🍅</span>
                )}
              </div>

              {/* SVG ring + time */}
              <div className="flex items-center justify-center py-2">
                <div className="relative">
                  <svg width="72" height="72" viewBox="0 0 72 72" className="-rotate-90">
                    <circle cx="36" cy="36" r={RADIUS} fill="none" stroke="hsl(var(--muted))" strokeWidth="5" />
                    <circle
                      cx="36" cy="36" r={RADIUS}
                      fill="none"
                      stroke={ringColor}
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeDasharray={CIRCUMFERENCE}
                      strokeDashoffset={strokeDashoffset}
                      style={{ transition: 'stroke-dashoffset 0.5s linear' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-heading font-bold text-base text-foreground tabular-nums leading-none">
                      {pad(mins)}:{pad(secs)}
                    </span>
                    <span className="text-[9px] text-muted-foreground mt-0.5">{isWork ? 'FOCUS' : 'BREAK'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3 px-4 py-3">
              <button
                onClick={reset}
                className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                title="Reset"
              >
                <RotateCcw size={15} />
              </button>
              <button
                onClick={() => setRunning(r => !r)}
                className={`flex items-center justify-center w-10 h-10 rounded-xl font-semibold shadow-md transition-all ${isWork ? 'bg-primary hover:bg-primary/90 shadow-primary/25' : 'bg-secondary hover:bg-secondary/90 shadow-secondary/25'} text-white`}
              >
                {running ? <Pause size={17} /> : <Play size={17} className="ml-0.5" />}
              </button>
              <div className="p-2 text-xs text-muted-foreground text-center w-9">
                {running ? (
                  <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
                ) : (
                  <span className="text-[10px]">paused</span>
                )}
              </div>
            </div>

            {/* Session tip */}
            <div className="px-4 pb-3 text-center">
              <p className="text-[10px] text-muted-foreground leading-snug">
                {isWork ? '🎯 Stay focused — quiz yourself after!' : '☕ Stretch, breathe, then come back strong!'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl shadow-lg transition-all font-semibold text-sm ${
          running
            ? 'bg-primary text-white shadow-primary/30 hover:bg-primary/90'
            : 'bg-card border border-border text-foreground hover:border-primary/40 hover:text-primary'
        }`}
        title="Pomodoro Timer"
      >
        <Timer size={16} />
        {running ? (
          <span className="tabular-nums">{pad(mins)}:{pad(secs)}</span>
        ) : (
          <span>Focus</span>
        )}
        <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
    </div>
  );
}
