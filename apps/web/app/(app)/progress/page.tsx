'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import { Clock, TrendingUp, Target, Award, Download, Zap, Lock, Star, Trophy } from 'lucide-react';
import { progress as progressApi } from '@/lib/api';
import { subjectIcon, gradeFromPercentage } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mascot, type MascotMood } from '@/components/mascot';
import type { ProgressData } from '@/types';

const SUBJECT_COLORS: Record<string, string> = {
  'Computer Science / ICT': '#3b82f6',
  'Biology': '#10b981',
  'History': '#f59e0b',
  'Mathematics': '#6366f1',
  'Physics': '#8b5cf6',
  'Chemistry': '#ef4444',
  'English': '#0ea5e9',
  'Geography': '#22c55e',
  'Economics': '#eab308',
};

const LOCKED_BADGES = [
  { emoji: '🏆', name: '14-Day Streak', desc: 'Maintain a 14-day study streak', condition: 'streak ≥ 14' },
  { emoji: '💎', name: 'Perfection', desc: 'Score 100% on any quiz', condition: 'score = 100%' },
  { emoji: '🌟', name: 'Top Student', desc: 'Reach the top 10 leaderboard', condition: 'top 10' },
  { emoji: '📚', name: 'Bookworm', desc: 'Read 20 notes completely', condition: '20 notes read' },
  { emoji: '⚡', name: 'Speed Learner', desc: 'Complete a quiz in under 3 min', condition: 'quiz < 3 min' },
  { emoji: '🎓', name: 'Graduate', desc: 'Complete all subject quizzes', condition: 'all subjects' },
];

function getLevelTitle(level: number): string {
  if (level <= 3) return 'Newbie';
  if (level <= 6) return 'Explorer';
  if (level <= 10) return 'Scholar';
  if (level <= 15) return 'Expert';
  if (level <= 20) return 'Master';
  return 'Legend';
}

function getLevelColor(level: number): string {
  if (level <= 3) return 'from-slate-400 to-slate-500';
  if (level <= 6) return 'from-emerald-400 to-teal-500';
  if (level <= 10) return 'from-blue-400 to-indigo-500';
  if (level <= 15) return 'from-violet-400 to-purple-500';
  if (level <= 20) return 'from-amber-400 to-orange-500';
  return 'from-rose-400 to-pink-500';
}

function getMascotMood(avgScore: number): MascotMood {
  if (avgScore >= 80) return 'celebrating';
  if (avgScore >= 60) return 'happy';
  if (avgScore >= 40) return 'encouraging';
  return 'thinking';
}

function getMascotMessage(avgScore: number, level: number): string {
  if (avgScore >= 80) return `Level ${level} legend! 🔥`;
  if (avgScore >= 60) return `You're doing great!`;
  if (avgScore >= 40) return `Keep pushing! 💪`;
  return `Let's study more!`;
}

export default function ProgressPage() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    progressApi.get().then(d => { setData(d as ProgressData); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-36 bg-muted rounded-2xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 bg-muted rounded-2xl" />)}</div>
        <div className="grid grid-cols-2 gap-4">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-64 bg-muted rounded-2xl" />)}</div>
      </div>
    );
  }

  if (!data) return null;

  const { stats, weeklyHours, weeklyScores, subjectStats, badges } = data;

  // XP & level calculations
  const xp = Math.round(stats.totalHours * 50 + stats.quizCount * 30 + stats.badgeCount * 100);
  const level = Math.max(1, Math.floor(xp / 500) + 1);
  const levelXpStart = (level - 1) * 500;
  const xpProgress = Math.min(((xp - levelXpStart) / 500) * 100, 100);
  const xpToNext = Math.max(0, level * 500 - xp);
  const levelTitle = getLevelTitle(level);
  const levelColor = getLevelColor(level);
  const mascotMood = getMascotMood(stats.avgScore);
  const mascotMsg = getMascotMessage(stats.avgScore, level);

  // Weekly challenge data
  const thisWeekHours = weeklyHours.reduce((s, d) => s + (d.hours || 0), 0);
  const thisWeekHighScores = weeklyScores.filter(d => (d.score || 0) >= 80).length;

  const challenges = [
    {
      label: 'Study Marathon',
      desc: 'Study 5 hours this week',
      emoji: '⏱️',
      progress: Math.min(thisWeekHours / 5, 1),
      value: `${thisWeekHours.toFixed(1)} / 5h`,
      done: thisWeekHours >= 5,
    },
    {
      label: 'Quiz Ace',
      desc: 'Score 80%+ on 3 quizzes',
      emoji: '🎯',
      progress: Math.min(thisWeekHighScores / 3, 1),
      value: `${thisWeekHighScores} / 3`,
      done: thisWeekHighScores >= 3,
    },
    {
      label: 'Badge Hunter',
      desc: 'Earn 5 badges total',
      emoji: '🏅',
      progress: Math.min(stats.badgeCount / 5, 1),
      value: `${stats.badgeCount} / 5`,
      done: stats.badgeCount >= 5,
    },
  ];

  const radarData = subjectStats.slice(0, 6).map(s => ({
    subject: s.subject.split(' / ')[0].split(' ')[0],
    score: s.avgScore,
    fullMark: 100,
  }));

  const cumulativeData = weeklyHours.map((d, i) => ({
    ...d,
    cumulative: weeklyHours.slice(0, i + 1).reduce((acc, w) => acc + (w.hours || 0), 0),
  }));

  return (
    <>
      <style jsx global>{`
        @media print { .no-print { display: none !important; } body { background: white; } }
      `}</style>

      <div className="animate-enter space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-heading font-bold text-2xl text-secondary">Your Progress</h1>
            <p className="text-muted-foreground text-sm mt-1">Track your journey to mastery 🚀</p>
          </div>
          <Button variant="outline" className="gap-2 no-print" onClick={() => window.print()}>
            <Download size={16} /> Export Report
          </Button>
        </div>

        {/* Level / XP banner */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className={`bg-gradient-to-br ${levelColor} rounded-3xl p-6 text-white relative overflow-hidden`}
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <Mascot mood={mascotMood} size={80} message={mascotMsg} className="shrink-0" />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <span className="bg-white/25 text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                  {levelTitle}
                </span>
                <span className="text-white/70 text-sm">Level {level}</span>
              </div>
              <h2 className="font-heading font-bold text-3xl text-white mb-3">{xp.toLocaleString()} XP</h2>

              {/* XP progress bar */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-3 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-white rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${xpProgress}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                  />
                </div>
                <span className="text-white/80 text-xs font-medium shrink-0">{xpToNext} XP to Level {level + 1}</span>
              </div>

              <div className="flex items-center gap-4 mt-3 text-white/80 text-xs">
                <span><Clock size={11} className="inline mr-1" />{stats.totalHours}h studied</span>
                <span><Target size={11} className="inline mr-1" />{stats.quizCount} quizzes</span>
                <span><Award size={11} className="inline mr-1" />{stats.badgeCount} badges</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Clock,      label: 'Total Hours',     value: `${stats.totalHours}h`, bg: 'bg-blue-500/10',    iconColor: 'text-blue-500',    border: 'border-border/50', sub: 'Study time logged' },
            { icon: TrendingUp, label: 'Avg Quiz Score',  value: `${stats.avgScore}%`,  bg: 'bg-emerald-500/10', iconColor: 'text-emerald-500', border: 'border-border/50', sub: gradeFromPercentage(stats.avgScore).grade + ' grade' },
            { icon: Target,     label: 'Quizzes Taken',   value: stats.quizCount,        bg: 'bg-indigo-500/10',  iconColor: 'text-indigo-500',  border: 'border-border/50', sub: 'Total attempts' },
            { icon: Award,      label: 'Badges Earned',   value: stats.badgeCount,       bg: 'bg-amber-500/10',   iconColor: 'text-amber-500',   border: 'border-border/50', sub: 'Achievements' },
          ].map(({ icon: Icon, label, value, bg, iconColor, border, sub }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className={`bg-card rounded-2xl border ${border} p-5 hover:shadow-md transition-shadow`}
            >
              <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                <Icon size={20} className={iconColor} />
              </div>
              <p className="font-heading font-bold text-2xl text-foreground">{value}</p>
              <p className="text-sm text-secondary font-medium mt-0.5">{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Weekly challenges */}
        <div className="bg-card rounded-2xl border border-border/50 p-5">
          <h3 className="font-heading font-semibold text-secondary mb-4 flex items-center gap-2">
            <Trophy size={18} className="text-amber-500" /> Weekly Challenges
            <span className="ml-auto text-xs text-muted-foreground font-normal">{challenges.filter(c => c.done).length}/{challenges.length} complete</span>
          </h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {challenges.map((c, i) => (
              <motion.div key={c.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className={`rounded-xl border p-4 transition-all ${c.done ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-muted/30 border-border/50'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{c.emoji}</span>
                  {c.done && <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">Done! 🎉</span>}
                </div>
                <p className="font-semibold text-sm text-secondary">{c.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5 mb-3">{c.desc}</p>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${c.done ? 'bg-emerald-500' : 'bg-primary'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${c.progress * 100}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 + 0.4 }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 text-right font-medium">{c.value}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Charts row 1 */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-2xl border border-border/50 p-5">
            <h3 className="font-heading font-semibold text-secondary mb-1">Study Hours This Week</h3>
            <p className="text-xs text-muted-foreground mb-4">Daily breakdown</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyHours} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: any) => [`${v}h`, 'Hours']} contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', fontSize: '12px' }} />
                <Bar dataKey="hours" fill="hsl(173,85%,38%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card rounded-2xl border border-border/50 p-5">
            <h3 className="font-heading font-semibold text-secondary mb-1">Quiz Scores This Week</h3>
            <p className="text-xs text-muted-foreground mb-4">Score trend</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weeklyScores} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: any) => [`${v}%`, 'Score']} contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', fontSize: '12px' }} />
                <Line type="monotone" dataKey="score" stroke="hsl(173,85%,38%)" strokeWidth={2.5} dot={{ fill: 'hsl(173,85%,38%)', r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts row 2 */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-2xl border border-border/50 p-5">
            <h3 className="font-heading font-semibold text-secondary mb-1">Cumulative Study Time</h3>
            <p className="text-xs text-muted-foreground mb-4">Total hours accumulated</p>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={cumulativeData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="auraGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(173,85%,38%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(173,85%,38%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: any) => [`${v}h`, 'Total hours']} contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', fontSize: '12px' }} />
                <Area type="monotone" dataKey="cumulative" stroke="hsl(173,85%,38%)" strokeWidth={2.5} fill="url(#auraGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {radarData.length >= 3 && (
            <div className="bg-card rounded-2xl border border-border/50 p-5">
              <h3 className="font-heading font-semibold text-secondary mb-1">Subject Balance</h3>
              <p className="text-xs text-muted-foreground mb-4">Performance across subjects</p>
              <ResponsiveContainer width="100%" height={180}>
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar name="Score" dataKey="score" stroke="hsl(173,85%,38%)" fill="hsl(173,85%,38%)" fillOpacity={0.25} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Subject performance */}
        {subjectStats.length > 0 && (
          <div className="bg-card rounded-2xl border border-border/50 p-5">
            <h3 className="font-heading font-semibold text-secondary mb-5">Subject Performance</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjectStats.map((s, i) => {
                const g = gradeFromPercentage(s.avgScore);
                const color = SUBJECT_COLORS[s.subject] || 'hsl(173,85%,38%)';
                const trend = s.avgScore >= 80 ? '↑ Excellent' : s.avgScore >= 60 ? '→ On track' : '↓ Needs work';
                return (
                  <motion.div key={s.subject} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    className="p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">{subjectIcon(s.subject)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-secondary truncate">{s.subject}</p>
                        <p className="text-xs text-muted-foreground">{s.quizCount} quizzes · {s.hours}h</p>
                      </div>
                      <span className={`text-base font-bold ${g.color}`}>{g.grade}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div className="h-full rounded-full" style={{ backgroundColor: color }}
                        initial={{ width: 0 }} animate={{ width: `${s.avgScore}%` }} transition={{ delay: i * 0.06 + 0.4, duration: 0.7 }} />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className={`text-xs ${s.avgScore >= 80 ? 'text-emerald-500' : s.avgScore >= 60 ? 'text-amber-500' : 'text-rose-500'}`}>{trend}</p>
                      <p className="text-xs font-bold text-foreground">{s.avgScore}%</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Badges */}
        <div className="bg-card rounded-2xl border border-border/50 p-5">
          <h3 className="font-heading font-semibold text-secondary mb-5 flex items-center gap-2">
            <Award size={18} className="text-amber-500" /> Achievements
            <span className="ml-auto text-xs text-muted-foreground font-normal">{badges.length} earned · {LOCKED_BADGES.length} locked</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {badges.map((b, i) => (
              <motion.div key={b.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }}
                className="bg-amber-500/8 border border-amber-500/20 rounded-2xl p-4 text-center hover:shadow-md hover:-translate-y-0.5 transition-all cursor-default"
              >
                <span className="text-3xl block mb-2">{b.emoji}</span>
                <p className="font-semibold text-sm text-secondary">{b.name}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-tight">{b.description}</p>
                <p className="text-xs text-amber-600 font-medium mt-2">
                  {new Date(b.earnedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </p>
              </motion.div>
            ))}

            {LOCKED_BADGES.map(b => (
              <div key={b.name} className="bg-muted/30 border border-border/40 rounded-2xl p-4 text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-muted/40" />
                <div className="relative z-10">
                  <span className="text-3xl block mb-2 opacity-30 grayscale">{b.emoji}</span>
                  <p className="font-semibold text-sm text-muted-foreground">{b.name}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-tight">{b.desc}</p>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <Lock size={10} className="text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">{b.condition}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
