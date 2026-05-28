'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Brain, Target, Trophy, ChevronRight, Clock, BookOpen, BrainCircuit,
  Calendar, Flame, Zap, TrendingUp, Sparkles, ArrowRight, Users, Headphones,
} from 'lucide-react';
import { progress as progressApi, notes as notesApi, threads as threadsApi } from '@/lib/api';
import { getUser } from '@/lib/auth';
import { subjectColor, subjectIcon } from '@/lib/utils';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Badge } from '@/components/ui/badge';
import type { User, NoteCard, ProgressData } from '@/types';

const MOTIVATIONAL = [
  "Small daily improvements add up to stunning results. 🚀",
  "Consistency beats intensity every time. Keep showing up!",
  "Every expert was once a beginner. You're on the right track! ⭐",
  "The best time to study is now. The second best was yesterday.",
  "Your future self will thank you for studying today. 💪",
  "Progress, not perfection. You've got this!",
  "One section at a time. One quiz at a time. That's how it's done.",
];

function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (target === 0) return;
    const start = performance.now();
    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) frameRef.current = requestAnimationFrame(tick);
    }
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return count;
}

function AnimatedStat({ value, suffix = '' }: { value: number; suffix?: string }) {
  const count = useCountUp(value);
  return <>{count}{suffix}</>;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' } }),
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<ProgressData | null>(null);
  const [recentNotes, setRecentNotes] = useState<NoteCard[]>([]);
  const [threadCount, setThreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const quote = MOTIVATIONAL[new Date().getDay() % MOTIVATIONAL.length];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    Promise.all([
      getUser(),
      progressApi.get(),
      notesApi.list(),
      threadsApi.list(),
    ]).then(([u, pd, ns, threads]) => {
      setUser(u as User);
      setData(pd as ProgressData);
      setRecentNotes((ns as NoteCard[]).slice(0, 4));
      setThreadCount((threads as any[]).length);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-44 bg-gradient-to-r from-muted to-muted/60 rounded-3xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-muted rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const firstName = user?.name?.split(' ')[0] || 'Student';
  const stats = data?.stats;
  const streak = user?.streak ?? 0;
  const sp = user?.studyProfile;

  const weeklyHoursTarget = sp?.dailyHours ? Math.round(sp.dailyHours * 7) : 10;
  const weeklyGoal = {
    studyHours: { current: Math.min(stats?.totalHours || 0, weeklyHoursTarget), target: weeklyHoursTarget },
    quizzes: { current: Math.min(stats?.quizCount || 0, 5), target: 5 },
    notes: { current: Math.min(recentNotes.length, 7), target: 7 },
  };

  const GOAL_QUOTES: Record<string, string> = {
    pass:    'Focus on the key topics — you\'re building a solid foundation. 📝',
    improve: 'Every revision session moves you up a grade. Keep it up! 📈',
    master:  'Deep understanding beats surface memorisation every time. 🧠',
    top:     'Consistency + deliberate practice = the top spot. 🏆',
  };
  const personalQuote = sp?.mainGoal ? GOAL_QUOTES[sp.mainGoal] : null;
  const displayQuote  = personalQuote || quote;

  const PEAK_TIME_LABELS: Record<string, string> = {
    morning: 'morning', afternoon: 'afternoon', evening: 'evening', latenight: 'late night',
  };
  const peakTime = sp?.studyTimes?.[0] ? PEAK_TIME_LABELS[sp.studyTimes[0]] : null;

  return (
    <div className="animate-enter space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-r from-primary via-primary/90 to-indigo-600 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-primary/25 overflow-hidden"
      >
        <div className="absolute -top-8 -right-8 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-24 w-32 h-32 bg-indigo-400/20 rounded-full blur-2xl" />
        <div className="absolute top-4 left-1/2 w-24 h-24 bg-white/5 rounded-full blur-xl" />

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-1">{greeting}!</p>
              <h1 className="font-heading font-bold text-2xl md:text-3xl">
                Hey {firstName}!{' '}
                {streak >= 7 ? '🔥 You\'re on fire!' : streak >= 3 ? '⚡ Keep the momentum!' : '👋 Let\'s study!'}
              </h1>
              <p className="text-white/70 text-sm mt-2 max-w-md leading-relaxed">{displayQuote}</p>
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <span className="flex items-center gap-1.5 bg-white/15 rounded-lg px-3 py-1 text-sm font-semibold">
                  <Flame size={14} className="text-orange-300" /> {streak}-day streak
                </span>
                <span className="flex items-center gap-1.5 bg-white/15 rounded-lg px-3 py-1 text-sm font-semibold">
                  <Zap size={14} className="text-yellow-300" /> {(user?.points || 0).toLocaleString()} pts
                </span>
                {peakTime && (
                  <span className="flex items-center gap-1.5 bg-white/15 rounded-lg px-3 py-1 text-sm font-semibold">
                    <Clock size={14} className="text-blue-200" /> Peak: {peakTime}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              <Link href="/quizzes" className="bg-white text-primary px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-white/90 active:scale-95 transition-all shadow-md flex items-center gap-2">
                <BrainCircuit size={16} /> Quick Quiz
              </Link>
              <Link href="/notes/upload" className="bg-white/20 backdrop-blur text-white border border-white/30 px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-white/30 active:scale-95 transition-all flex items-center gap-2">
                <BookOpen size={16} /> Upload Note
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Clock, label: 'Study Hours', value: stats?.totalHours ?? 0, suffix: 'h', color: 'bg-blue-500/10', iconColor: 'text-blue-500', border: 'border-border/50', ring: 'ring-blue-200' },
          { icon: TrendingUp, label: 'Avg Score', value: stats?.avgScore ?? 0, suffix: '%', color: 'bg-emerald-500/10', iconColor: 'text-emerald-500', border: 'border-border/50', ring: 'ring-emerald-200' },
          { icon: Target, label: 'Quizzes Done', value: stats?.quizCount ?? 0, suffix: '', color: 'bg-indigo-500/10', iconColor: 'text-indigo-500', border: 'border-border/50', ring: 'ring-indigo-200' },
          { icon: Trophy, label: 'Badges', value: stats?.badgeCount ?? 0, suffix: '', color: 'bg-amber-500/10', iconColor: 'text-amber-500', border: 'border-border/50', ring: 'ring-amber-200' },
        ].map(({ icon: Icon, label, value, suffix, color, iconColor, border }, i) => (
          <motion.div key={label} custom={i} variants={cardVariants} initial="hidden" animate="visible"
            className={`bg-card rounded-2xl border ${border} p-4 card-hover hover:shadow-md transition-shadow`}
          >
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
              <Icon size={18} className={iconColor} />
            </div>
            <p className="font-heading font-bold text-2xl text-foreground">
              <AnimatedStat value={value} suffix={suffix} />
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Quick Actions + Recent Notes */}
        <div className="lg:col-span-2 space-y-5">
          {/* Quick Actions */}
          <div>
            <h2 className="font-heading font-semibold text-secondary mb-3 flex items-center gap-2">
              <Sparkles size={16} className="text-primary" /> Quick Actions
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                {
                  href: '/notes',
                  icon: BookOpen,
                  label: 'Continue Learning',
                  desc: `${recentNotes.length} notes available`,
                  badge: 'Study',
                  badgeStyle: 'bg-orange-500/10 text-orange-500',
                  iconBg: 'bg-gradient-to-br from-orange-400 to-rose-500',
                  glow: 'hover:shadow-orange-100',
                },
                {
                  href: '/quizzes',
                  icon: Target,
                  label: 'Daily Challenge',
                  desc: 'Test your knowledge',
                  badge: 'New!',
                  badgeStyle: 'bg-indigo-500/10 text-indigo-500',
                  iconBg: 'bg-gradient-to-br from-indigo-500 to-purple-600',
                  glow: 'hover:shadow-indigo-100',
                },
                {
                  href: '/timetable',
                  icon: Calendar,
                  label: 'Study Timetable',
                  desc: 'Plan your week ahead',
                  badge: 'Planner',
                  badgeStyle: 'bg-teal-500/10 text-teal-600',
                  iconBg: 'bg-gradient-to-br from-teal-500 to-cyan-500',
                  glow: 'hover:shadow-teal-100',
                },
                {
                  href: '/social',
                  icon: Users,
                  label: 'Community',
                  desc: `${threadCount} threads active`,
                  badge: 'Live',
                  badgeStyle: 'bg-purple-500/10 text-purple-500',
                  iconBg: 'bg-gradient-to-br from-purple-500 to-pink-500',
                  glow: 'hover:shadow-purple-100',
                },
              ].map(({ href, icon: Icon, label, desc, badge, badgeStyle, iconBg, glow }, i) => (
                <motion.div key={href} custom={i + 4} variants={cardVariants} initial="hidden" animate="visible">
                  <Link href={href} className={`bg-card rounded-2xl border border-border/50 p-5 flex flex-col gap-4 card-hover group block hover:shadow-lg ${glow} transition-all`}>
                    <div className="flex items-start justify-between">
                      <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                        <Icon size={20} className="text-white" />
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${badgeStyle}`}>{badge}</span>
                    </div>
                    <div>
                      <p className="font-heading font-semibold text-secondary group-hover:text-primary transition-colors">{label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      Go <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recent Notes */}
          <div className="bg-card rounded-2xl border border-border/50 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-semibold text-secondary flex items-center gap-2">
                <BookOpen size={16} className="text-muted-foreground" /> Recent Notes
              </h3>
              <Link href="/notes" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                View all <ChevronRight size={12} />
              </Link>
            </div>
            <div className="space-y-2">
              {recentNotes.slice(0, 4).map((note, i) => (
                <motion.div key={note.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 + 0.5 }}>
                  <Link href={`/notes/${note.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center text-base shrink-0 group-hover:scale-105 transition-transform">
                      {subjectIcon(note.subject)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">{note.title}</p>
                      <p className="text-xs text-muted-foreground">{note.subject} · {note.readTime}</p>
                    </div>
                    <Badge variant="subject" subject={note.subject} className="shrink-0 hidden sm:inline-flex">{note.level}</Badge>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Audio notes promo */}
          <motion.div custom={12} variants={cardVariants} initial="hidden" animate="visible">
            <Link href="/audio-notes" className="flex items-center gap-4 bg-violet-500/5 border border-violet-500/15 rounded-2xl p-4 hover:shadow-md hover:shadow-violet-500/10 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <Headphones size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="font-heading font-semibold text-secondary group-hover:text-violet-700 transition-colors">Audio Mode</p>
                <p className="text-xs text-muted-foreground">Listen to your notes hands-free</p>
              </div>
              <ChevronRight size={16} className="text-muted-foreground group-hover:text-violet-600 group-hover:translate-x-1 transition-all" />
            </Link>
          </motion.div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Weekly Goal */}
          <h2 className="font-heading font-semibold text-secondary">Weekly Goal</h2>
          <motion.div custom={8} variants={cardVariants} initial="hidden" animate="visible"
            className="bg-gradient-to-b from-card to-muted/20 rounded-2xl border border-border/50 p-5"
          >
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Trophy size={16} className="text-amber-500" />
              </div>
              <span className="font-heading font-semibold text-secondary text-sm">This Week</span>
            </div>
            <div className="space-y-4">
              <ProgressBar value={weeklyGoal.studyHours.current} max={weeklyGoal.studyHours.target} label={`Study Time ${weeklyGoal.studyHours.current}/${weeklyGoal.studyHours.target} hrs`} showPercent />
              <ProgressBar value={weeklyGoal.quizzes.current} max={weeklyGoal.quizzes.target} label={`Quizzes ${weeklyGoal.quizzes.current}/${weeklyGoal.quizzes.target}`} showPercent />
              <ProgressBar value={weeklyGoal.notes.current} max={weeklyGoal.notes.target} label={`Notes Explored ${weeklyGoal.notes.current}/${weeklyGoal.notes.target}`} showPercent />
            </div>
          </motion.div>

          {/* Weekly Challenges */}
          {(() => {
            const weeklyStudyHours = (data?.weeklyHours || []).reduce((s, d) => s + d.hours, 0);
            const weeklyReplies   = stats?.weeklyReplies ?? 0;
            const quizDays        = (data?.weeklyScores || []).filter(d => d.score > 0).length;
            const challenges = [
              {
                emoji: '📚', label: 'Study Hours',
                desc: `${Math.round(weeklyStudyHours * 10) / 10} / ${weeklyHoursTarget} hrs this week`,
                current: Math.round(weeklyStudyHours * 10) / 10,
                target: weeklyHoursTarget,
                color: 'from-blue-400 to-indigo-500',
                bg: 'bg-blue-500/8', border: 'border-blue-500/15',
              },
              {
                emoji: '🤝', label: 'Help Classmates',
                desc: `${weeklyReplies} / 3 community answers`,
                current: weeklyReplies, target: 3,
                color: 'from-emerald-400 to-teal-500',
                bg: 'bg-emerald-500/8', border: 'border-emerald-500/15',
              },
              {
                emoji: '🎯', label: 'Quiz Days',
                desc: `${quizDays} / 5 days with quizzes`,
                current: quizDays, target: 5,
                color: 'from-violet-400 to-purple-500',
                bg: 'bg-violet-500/8', border: 'border-violet-500/15',
              },
            ];
            return (
              <motion.div custom={9} variants={cardVariants} initial="hidden" animate="visible"
                className="bg-card rounded-2xl border border-border/50 p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading font-semibold text-secondary text-sm flex items-center gap-2">
                    <span className="text-base">⚡</span> Weekly Challenges
                  </h3>
                  <span className="text-xs text-muted-foreground">{challenges.filter(c => c.current >= c.target).length}/{challenges.length} done</span>
                </div>
                <div className="space-y-3">
                  {challenges.map(c => {
                    const pct = Math.min(100, Math.round(c.current / c.target * 100));
                    const done = c.current >= c.target;
                    return (
                      <div key={c.label} className={`rounded-xl p-3 border ${done ? 'bg-emerald-500/10 border-emerald-500/20' : `${c.bg} ${c.border}`}`}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-semibold text-secondary flex items-center gap-2">
                            <span>{c.emoji}</span> {c.label}
                          </span>
                          {done && <span className="text-xs text-emerald-500 font-bold">✓ Done!</span>}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{c.desc}</p>
                        <div className="h-1.5 rounded-full bg-muted/60 overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full bg-gradient-to-r ${done ? 'from-emerald-400 to-emerald-500' : c.color}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })()}

          {/* Streak Heatmap */}
          <motion.div custom={11} variants={cardVariants} initial="hidden" animate="visible"
            className="bg-card rounded-2xl border border-border/50 p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <Flame size={18} className="text-orange-500" />
                </div>
                <div>
                  <p className="font-heading font-bold text-secondary text-sm">{streak} Day Streak</p>
                  <p className="text-xs text-muted-foreground">
                    {streak >= 14 ? 'Legendary! 🏆' : streak >= 7 ? 'On fire! 🔥' : 'Keep it up!'}
                  </p>
                </div>
              </div>
              <div className="text-2xl">{streak >= 14 ? '🏆' : streak >= 7 ? '🔥' : streak >= 3 ? '⚡' : '💪'}</div>
            </div>

            {/* 21-day calendar grid */}
            <div className="mb-2">
              <p className="text-xs text-muted-foreground mb-2 font-medium">Last 21 days</p>
              <div className="grid grid-cols-7 gap-1.5">
                {Array.from({ length: 21 }, (_, i) => {
                  const dayIdx = 20 - i;
                  const isStudied = dayIdx < streak;
                  const intensity = isStudied ? Math.min(1, (streak - dayIdx) / 7) : 0;
                  return (
                    <div
                      key={i}
                      title={`Day ${i + 1}`}
                      className={`w-full aspect-square rounded-md transition-all ${
                        isStudied
                          ? intensity > 0.7 ? 'bg-orange-500' : intensity > 0.4 ? 'bg-orange-400' : 'bg-orange-300'
                          : 'bg-orange-100'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {streak < 14 ? `${14 - streak} more days to unlock the 14-day badge! 🎯` : 'Streak badge unlocked! ✅'}
            </p>
          </motion.div>

          {/* Spaced Repetition Review */}
          {(() => {
            if (!data?.recentQuizzes?.length) return null;

            // Group by note: keep only the most recent quiz per note
            const latestByNote = new Map<string, typeof data.recentQuizzes[0]>();
            data.recentQuizzes.forEach(q => {
              if (!latestByNote.has(q.noteId) || new Date(q.createdAt) > new Date(latestByNote.get(q.noteId)!.createdAt)) {
                latestByNote.set(q.noteId, q);
              }
            });

            const now = Date.now();
            const reviewDue = Array.from(latestByNote.values())
              .map(q => {
                const daysSince = (now - new Date(q.createdAt).getTime()) / 86400000;
                const interval = q.percentage >= 90 ? 14 : q.percentage >= 70 ? 7 : q.percentage >= 50 ? 3 : 1;
                return { ...q, daysOverdue: daysSince - interval };
              })
              .filter(q => q.daysOverdue >= 0)
              .sort((a, b) => b.daysOverdue - a.daysOverdue)
              .slice(0, 5);

            if (!reviewDue.length) return null;

            return (
              <motion.div custom={9.5} variants={cardVariants} initial="hidden" animate="visible"
                className="bg-card rounded-2xl border border-amber-500/25 p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-heading font-semibold text-secondary text-sm flex items-center gap-2">
                    <span className="text-base">🔁</span> Due for Review
                  </h3>
                  <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full">
                    {reviewDue.length} note{reviewDue.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="space-y-2">
                  {reviewDue.map(q => (
                    <Link
                      key={q.id}
                      href={`/notes/${q.noteId}`}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted transition-colors group"
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                        q.percentage >= 70 ? 'bg-emerald-500' : q.percentage >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}>
                        {q.percentage}%
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                          {q.note?.title || 'Note'}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {q.note?.subject} · overdue {Math.round(q.daysOverdue)}d
                        </p>
                      </div>
                      <ChevronRight size={13} className="text-muted-foreground group-hover:text-primary transition-colors shrink-0"/>
                    </Link>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-3 text-center">Based on your quiz scores · Higher scores = longer intervals</p>
              </motion.div>
            );
          })()}

          {/* Subject Performance */}
          {data?.subjectStats && data.subjectStats.length > 0 && (
            <motion.div custom={10} variants={cardVariants} initial="hidden" animate="visible"
              className="bg-card rounded-2xl border border-border/50 p-5"
            >
              <h3 className="font-heading font-semibold text-secondary text-sm mb-4">Subject Performance</h3>
              <div className="space-y-3">
                {data.subjectStats.slice(0, 5).map((s, i) => (
                  <motion.div key={s.subject} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 + 0.6 }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground truncate flex items-center gap-1">
                        {subjectIcon(s.subject)} <span className="truncate max-w-[100px]">{s.subject.split(' / ')[0]}</span>
                      </span>
                      <span className="text-xs font-bold text-foreground ml-2">{s.avgScore}%</span>
                    </div>
                    <div className="progress-bar">
                      <motion.div
                        className="progress-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${s.avgScore}%` }}
                        transition={{ delay: i * 0.08 + 0.7, duration: 0.6 }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
              <Link href="/progress" className="mt-4 text-xs text-primary font-semibold flex items-center gap-1 hover:underline">
                Full analytics <ChevronRight size={12} />
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
