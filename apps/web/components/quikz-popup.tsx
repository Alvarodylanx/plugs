'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, CheckCircle, XCircle, ChevronRight, BrainCircuit } from 'lucide-react';
import { quikz as quikzApi } from '@/lib/api';
import { playSound } from '@/lib/sounds';

interface Question {
  noteId: string;
  noteTitle: string;
  questionIdx: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  subject: string;
}

type Phase = 'question' | 'result' | 'hidden';

const ANSWER_TIME = 30; // seconds to answer

export function QuikzPopup() {
  const [phase, setPhase] = useState<Phase>('hidden');
  const [question, setQuestion] = useState<Question | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(ANSWER_TIME);
  const [enabled, setEnabled] = useState(false);
  const [frequencyMin, setFrequencyMin] = useState(30);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastFiredRef = useRef<number>(0);

  // Load settings on mount
  useEffect(() => {
    quikzApi.getSettings().then((s: any) => {
      setEnabled(s.enabled);
      setFrequencyMin(s.frequencyMin || 30);
    }).catch(() => {});
  }, []);

  // Listen for push messages from service worker
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.data?.type === 'QUIKZ_PUSH' && e.data.question) {
        showQuestion(e.data.question);
      }
    }
    navigator.serviceWorker?.addEventListener('message', onMessage);
    return () => navigator.serviceWorker?.removeEventListener('message', onMessage);
  }, []);

  // Poll settings changes so popup reacts to toggle without page reload
  useEffect(() => {
    const id = setInterval(() => {
      quikzApi.getSettings().then((s: any) => {
        setEnabled(s.enabled);
        setFrequencyMin(s.frequencyMin || 30);
      }).catch(() => {});
    }, 30000);
    return () => clearInterval(id);
  }, []);

  const showQuestion = useCallback((q: Question) => {
    setQuestion(q);
    setSelected(null);
    setTimeLeft(ANSWER_TIME);
    setPhase('question');
    lastFiredRef.current = Date.now();
    playSound('adventure');
  }, []);

  const fetchAndShow = useCallback(async () => {
    try {
      const q = await quikzApi.getQuestion() as Question | null;
      if (q) showQuestion(q);
    } catch {}
  }, [showQuestion]);

  // In-app interval scheduler
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!enabled) return;

    intervalRef.current = setInterval(() => {
      if (phase !== 'hidden') return;
      fetchAndShow();
    }, frequencyMin * 60 * 1000);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [enabled, frequencyMin, phase, fetchAndShow]);

  // Countdown timer while question is showing
  useEffect(() => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (phase !== 'question') return;

    countdownRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          // Time up — auto skip
          clearInterval(countdownRef.current!);
          setPhase('hidden');
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, [phase]);

  function answer(idx: number) {
    if (selected !== null || !question) return;
    if (countdownRef.current) clearInterval(countdownRef.current);
    setSelected(idx);
    quikzApi.recordAnswer(question.noteId, question.questionIdx, idx === question.correct).catch(() => {});
    setPhase('result');
  }

  function dismiss() {
    setPhase('hidden');
    setQuestion(null);
    setSelected(null);
  }

  if (!enabled) return null;

  return (
    <AnimatePresence>
      {phase !== 'hidden' && question && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-sm"
            onClick={phase === 'result' ? dismiss : undefined}
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 40 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="fixed bottom-6 right-6 z-[101] w-full max-w-sm bg-card border border-primary/30 rounded-3xl shadow-2xl shadow-primary/20 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center">
                  <Zap size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-heading font-bold text-sm leading-none">Quikz!</p>
                  <p className="text-white/60 text-xs mt-0.5">{question.subject}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {phase === 'question' && (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                    timeLeft <= 10 ? 'border-red-400 text-red-300' : 'border-white/40 text-white'
                  }`}>
                    {timeLeft}
                  </div>
                )}
                <button onClick={dismiss} className="p-1.5 rounded-xl hover:bg-white/20 transition-colors">
                  <X size={15} className="text-white" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Question */}
              <p className="text-sm font-semibold text-foreground leading-relaxed">{question.question}</p>

              {/* Options */}
              {phase === 'question' && (
                <div className="space-y-2">
                  {question.options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => answer(i)}
                      className="w-full text-left px-4 py-3 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 text-sm font-medium transition-all flex items-center gap-3"
                    >
                      <span className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center text-xs font-bold shrink-0 text-muted-foreground">
                        {String.fromCharCode(65 + i)}
                      </span>
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {/* Result */}
              {phase === 'result' && selected !== null && (
                <div className="space-y-3">
                  {/* Answer feedback */}
                  <div className={`flex items-center gap-3 p-3 rounded-xl ${
                    selected === question.correct
                      ? 'bg-emerald-50 border border-emerald-200'
                      : 'bg-rose-50 border border-rose-200'
                  }`}>
                    {selected === question.correct
                      ? <CheckCircle size={18} className="text-emerald-500 shrink-0" />
                      : <XCircle size={18} className="text-rose-500 shrink-0" />}
                    <div>
                      <p className={`text-sm font-bold ${selected === question.correct ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {selected === question.correct ? 'Correct!' : 'Not quite!'}
                      </p>
                      {selected !== question.correct && (
                        <p className="text-xs text-rose-600 mt-0.5">
                          Answer: <span className="font-semibold">{question.options[question.correct]}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Explanation */}
                  {question.explanation && (
                    <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                      <BrainCircuit size={14} className="text-blue-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-blue-700 leading-relaxed">{question.explanation}</p>
                    </div>
                  )}

                  <button
                    onClick={dismiss}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Got it <ChevronRight size={14} />
                  </button>
                </div>
              )}

              {/* Source note */}
              <p className="text-xs text-muted-foreground text-center">
                From: <span className="font-medium text-foreground">{question.noteTitle}</span>
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
