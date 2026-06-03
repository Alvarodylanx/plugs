'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, SkipForward } from 'lucide-react';
import { auth as authApi } from '@/lib/api';
import { setCachedUser } from '@/lib/auth';
import type { User } from '@/types';

// ── Question definitions ──────────────────────────────────────────────────────

const QUESTIONS = [
  {
    id: 'learningStyles',
    multi: true,
    title: 'How do you learn best?',
    subtitle: 'Pick all that apply — we\'ll tailor your experience.',
    options: [
      { value: 'reading', emoji: '📖', label: 'Reading & Notes', desc: 'I love structured text' },
      { value: 'audio',   emoji: '🎧', label: 'Audio & Podcasts', desc: 'I learn by listening' },
      { value: 'video',   emoji: '🎥', label: 'Videos',           desc: 'Visual explanations work best' },
      { value: 'practice',emoji: '✍️', label: 'Practice & Quizzes',desc: 'Testing myself sticks it' },
    ],
  },
  {
    id: 'dailyHours',
    multi: false,
    title: 'How many hours can you study per day?',
    subtitle: 'Be honest — we\'ll build a realistic plan for you.',
    options: [
      { value: '0.5', emoji: '⚡', label: 'Less than 1 hour',  desc: 'Short & focused bursts' },
      { value: '1.5', emoji: '📚', label: '1 – 2 hours',       desc: 'Steady daily routine' },
      { value: '3.5', emoji: '🔥', label: '3 – 4 hours',       desc: 'Serious study sessions' },
      { value: '5',   emoji: '🚀', label: '5 + hours',         desc: 'Full study-mode' },
    ],
  },
  {
    id: 'mainGoal',
    multi: false,
    title: 'What\'s your main goal?',
    subtitle: 'This shapes the tips and challenges we give you.',
    options: [
      { value: 'pass',    emoji: '🎯', label: 'Pass my exams',     desc: 'Get the grades I need' },
      { value: 'improve', emoji: '📈', label: 'Improve my grades',  desc: 'Move from good to great' },
      { value: 'master',  emoji: '🧠', label: 'Master my subjects', desc: 'Deep understanding' },
      { value: 'top',     emoji: '🎓', label: 'Top of my class',    desc: 'Be the best' },
    ],
  },
  {
    id: 'studyTimes',
    multi: true,
    title: 'When do you usually study?',
    subtitle: 'We\'ll schedule reminders at the right time for you.',
    options: [
      { value: 'morning',   emoji: '🌅', label: 'Morning',     desc: 'Before school / early' },
      { value: 'afternoon', emoji: '☀️', label: 'Afternoon',   desc: 'After school / lunch' },
      { value: 'evening',   emoji: '🌙', label: 'Evening',     desc: '6 pm – 10 pm' },
      { value: 'latenight', emoji: '🌃', label: 'Late night',  desc: 'After 10 pm' },
    ],
  },
  {
    id: 'challenges',
    multi: true,
    title: 'What\'s your biggest challenge?',
    subtitle: 'We\'ll focus features to help you overcome it.',
    options: [
      { value: 'focus',       emoji: '😴', label: 'Staying focused',      desc: 'Distractions pull me away' },
      { value: 'understanding',emoji: '🤔', label: 'Understanding topics', desc: 'Concepts don\'t click' },
      { value: 'memory',      emoji: '🧠', label: 'Memorising content',   desc: 'I forget what I study' },
      { value: 'time',        emoji: '⏰', label: 'Managing time',        desc: 'Never enough hours' },
    ],
  },
] as const;

type QuestionId = (typeof QUESTIONS)[number]['id'];

// ── Helpers ───────────────────────────────────────────────────────────────────

function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-2 rounded-full transition-all duration-300 ${
            i < current ? 'bg-primary w-6' : i === current ? 'bg-primary w-4' : 'bg-muted w-2'
          }`}
        />
      ))}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep]     = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [saving, setSaving]  = useState(false);
  const [direction, setDirection] = useState(1);

  const q = QUESTIONS[step];
  const selected = answers[q.id];

  function isSelected(val: string) {
    if (q.multi) return Array.isArray(selected) && selected.includes(val);
    return selected === val;
  }

  function toggle(val: string) {
    if (q.multi) {
      setAnswers(prev => {
        const cur = (prev[q.id] as string[]) || [];
        return {
          ...prev,
          [q.id]: cur.includes(val) ? cur.filter(v => v !== val) : [...cur, val],
        };
      });
    } else {
      setAnswers(prev => ({ ...prev, [q.id]: val }));
    }
  }

  function canAdvance() {
    if (q.multi) return Array.isArray(selected) && selected.length > 0;
    return !!selected;
  }

  function goNext() {
    setDirection(1);
    if (step < QUESTIONS.length - 1) {
      setStep(s => s + 1);
    } else {
      finish();
    }
  }

  function goBack() {
    setDirection(-1);
    setStep(s => Math.max(0, s - 1));
  }

  function skip() {
    setDirection(1);
    if (step < QUESTIONS.length - 1) {
      setStep(s => s + 1);
    } else {
      finish();
    }
  }

  async function finish() {
    setSaving(true);
    try {
      const profile = {
        learningStyles: (answers.learningStyles as string[]) || [],
        dailyHours: answers.dailyHours ? parseFloat(answers.dailyHours as string) : 1.5,
        mainGoal: (answers.mainGoal as string) || 'improve',
        studyTimes: (answers.studyTimes as string[]) || [],
        challenges: (answers.challenges as string[]) || [],
      };
      const updated = await authApi.saveOnboarding(profile) as User;
      setCachedUser(updated);
    } catch {
      // proceed regardless
    } finally {
      router.replace('/dashboard');
    }
  }

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-violet-50 dark:to-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Blobs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-400/8 rounded-full blur-3xl pointer-events-none" />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2.5 mb-8"
      >
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shadow-lg shadow-primary/30">
          <span className="text-white font-bold text-lg">P</span>
        </div>
        <span className="font-bold text-xl text-secondary">Plug</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg"
      >
        <div className="bg-card/90 backdrop-blur rounded-3xl shadow-2xl border border-border/50 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <ProgressDots total={QUESTIONS.length} current={step} />
            <span className="text-xs text-muted-foreground font-medium">
              {step + 1} / {QUESTIONS.length}
            </span>
          </div>

          {/* Question slide */}
          <div className="overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.28, ease: 'easeInOut' }}
              >
                <h2 className="font-bold text-xl text-secondary mb-1">{q.title}</h2>
                <p className="text-sm text-muted-foreground mb-6">{q.subtitle}</p>

                <div className="grid grid-cols-2 gap-3">
                  {q.options.map(opt => {
                    const active = isSelected(opt.value);
                    return (
                      <button
                        key={opt.value}
                        onClick={() => toggle(opt.value)}
                        className={`relative text-left p-4 rounded-2xl border-2 transition-all duration-200 group hover:scale-[1.02] active:scale-[0.98] ${
                          active
                            ? 'border-primary bg-primary/8 shadow-md shadow-primary/15'
                            : 'border-border hover:border-primary/40 hover:bg-muted/50'
                        }`}
                      >
                        {active && (
                          <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <Check size={11} className="text-white" />
                          </div>
                        )}
                        <span className="text-2xl block mb-2">{opt.emoji}</span>
                        <p className={`text-sm font-semibold leading-tight ${active ? 'text-primary' : 'text-secondary'}`}>
                          {opt.label}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{opt.desc}</p>
                      </button>
                    );
                  })}
                </div>

                {q.multi && (
                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    You can select multiple options
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mt-8">
            <div className="flex items-center gap-2">
              {step > 0 && (
                <button
                  onClick={goBack}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-xl hover:bg-muted"
                >
                  <ChevronLeft size={16} /> Back
                </button>
              )}
              <button
                onClick={skip}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-xl hover:bg-muted"
              >
                <SkipForward size={14} /> Skip
              </button>
            </div>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={goNext}
              disabled={saving}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-semibold text-sm transition-all shadow-md ${
                canAdvance()
                  ? 'bg-primary text-white shadow-primary/25 hover:bg-primary/90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </>
              ) : step < QUESTIONS.length - 1 ? (
                <>Next <ChevronRight size={16} /></>
              ) : (
                <>Let's go! <ChevronRight size={16} /></>
              )}
            </motion.button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-4">
          You can always update these preferences in your profile settings.
        </p>
      </motion.div>
    </div>
  );
}
