'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import { Clock, TrendingUp, Target, Award, Download, Flame, BookOpen, Star, Lock } from 'lucide-react';
import { progress as progressApi } from '@/lib/api';
import { subjectColor, subjectIcon, gradeFromPercentage } from '@/lib/utils';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  { emoji: '🌟', name: 'Top Student', desc: 'Reach the top 10 leaderboard', condition: 'leaderboard top 10' },
  { emoji: '📚', name: 'Bookworm', desc: 'Read 20 notes completely', condition: '20 notes read' },
  { emoji: '⚡', name: 'Speed Learner', desc: 'Complete a quiz in under 3 min', condition: 'quiz < 3 min' },
  { emoji: '🎓', name: 'Graduate', desc: 'Complete all subject quizzes', condition: 'all subjects' },
];

export default function ProgressPage() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    progressApi.get().then(d => { setData(d as ProgressData); setLoading(false); });
  }, []);

  function downloadReport() {
    window.print();
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-48" />
        <div className="grid grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 bg-muted rounded-2xl" />)}</div>
        <div className="grid grid-cols-2 gap-4">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-64 bg-muted rounded-2xl" />)}</div>
      </div>
    );
  }

  if (!data) return null;

  const { stats, weeklyHours, weeklyScores, subjectStats, badges } = data;

  // Build radar chart data from subject stats
  const radarData = subjectStats.slice(0, 6).map(s => ({
    subject: s.subject.split(' / ')[0].split(' ').slice(0, 1).join(''),
    score: s.avgScore,
    fullMark: 100,
  }));

  // Build cumulative area data
  const cumulativeData = weeklyHours.map((d, i) => ({
    ...d,
    cumulative: weeklyHours.slice(0, i + 1).reduce((acc, w) => acc + (w.hours || 0), 0),
  }));

  return (
    <>
      {/* Print-only styles */}
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          .print-full { break-inside: avoid; }
        }
      `}</style>

      <div className="animate-enter space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-heading font-bold text-2xl text-secondary">Your Analytics</h1>
            <p className="text-muted-foreground text-sm mt-1">Track your progress and identify areas for improvement</p>
          </div>
          <Button variant="outline" className="gap-2 no-print" onClick={downloadReport}>
            <Download size={16} /> Export Report
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 print-full">
          {[
            { icon: Clock, label: 'Total Hours', value: `${stats.totalHours}h`, bg: 'bg-blue-50', iconColor: 'text-blue-500', border: 'border-blue-100', sub: 'Study time logged' },
            { icon: TrendingUp, label: 'Avg Quiz Score', value: `${stats.avgScore}%`, bg: 'bg-emerald-50', iconColor: 'text-emerald-500', border: 'border-emerald-100', sub: gradeFromPercentage(stats.avgScore).grade + ' grade' },
            { icon: Target, label: 'Quizzes Taken', value: stats.quizCount, bg: 'bg-indigo-50', iconColor: 'text-indigo-500', border: 'border-indigo-100', sub: 'Total attempts' },
            { icon: Award, label: 'Badges Earned', value: stats.badgeCount, bg: 'bg-amber-50', iconColor: 'text-amber-500', border: 'border-amber-100', sub: 'Achievements' },
          ].map(({ icon: Icon, label, value, bg, iconColor, border, sub }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className={`bg-card rounded-2xl border ${border} p-5 card-hover hover:shadow-md transition-shadow`}
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

        {/* Charts row 1 */}
        <div className="grid lg:grid-cols-2 gap-6 print-full">
          {/* Study hours bar */}
          <div className="bg-card rounded-2xl border border-border/50 p-5">
            <h3 className="font-heading font-semibold text-secondary mb-1">Study Hours This Week</h3>
            <p className="text-xs text-muted-foreground mb-4">Daily breakdown</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyHours} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid vertical={false} stroke="hsl(214,32%,91%)" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(215,16%,47%)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'hsl(215,16%,47%)' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v: any) => [`${v}h`, 'Hours']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid hsl(214,32%,91%)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: '12px' }}
                />
                <Bar dataKey="hours" fill="hsl(173,85%,38%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quiz scores line */}
          <div className="bg-card rounded-2xl border border-border/50 p-5">
            <h3 className="font-heading font-semibold text-secondary mb-1">Quiz Scores This Week</h3>
            <p className="text-xs text-muted-foreground mb-4">Score trend over time</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weeklyScores} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid vertical={false} stroke="hsl(214,32%,91%)" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(215,16%,47%)' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: 'hsl(215,16%,47%)' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v: any) => [`${v}%`, 'Score']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid hsl(214,32%,91%)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="score" stroke="hsl(173,85%,38%)" strokeWidth={2.5}
                  dot={{ fill: 'hsl(173,85%,38%)', r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts row 2 */}
        <div className="grid lg:grid-cols-2 gap-6 print-full">
          {/* Cumulative hours area */}
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
                <CartesianGrid vertical={false} stroke="hsl(214,32%,91%)" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(215,16%,47%)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'hsl(215,16%,47%)' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v: any) => [`${v}h`, 'Total hours']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid hsl(214,32%,91%)', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="cumulative" stroke="hsl(173,85%,38%)" strokeWidth={2.5} fill="url(#auraGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Radar chart */}
          {radarData.length >= 3 && (
            <div className="bg-card rounded-2xl border border-border/50 p-5">
              <h3 className="font-heading font-semibold text-secondary mb-1">Subject Balance</h3>
              <p className="text-xs text-muted-foreground mb-4">Performance across subjects</p>
              <ResponsiveContainer width="100%" height={180}>
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid stroke="hsl(214,32%,91%)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'hsl(215,16%,47%)' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar name="Score" dataKey="score" stroke="hsl(173,85%,38%)" fill="hsl(173,85%,38%)" fillOpacity={0.25} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Subject Performance grid */}
        {subjectStats.length > 0 && (
          <div className="bg-card rounded-2xl border border-border/50 p-5 print-full">
            <h3 className="font-heading font-semibold text-secondary mb-5">Subject Performance</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjectStats.map((s, i) => {
                const g = gradeFromPercentage(s.avgScore);
                const color = SUBJECT_COLORS[s.subject] || 'hsl(173,85%,38%)';
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
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${s.avgScore}%` }}
                        transition={{ delay: i * 0.06 + 0.4, duration: 0.7 }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-muted-foreground">
                        {s.avgScore >= 80 ? '↑ Excellent' : s.avgScore >= 60 ? '→ On track' : '↓ Needs work'}
                      </p>
                      <p className="text-xs font-bold text-foreground">{s.avgScore}%</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Badges */}
        <div className="bg-card rounded-2xl border border-border/50 p-5 print-full">
          <h3 className="font-heading font-semibold text-secondary mb-5 flex items-center gap-2">
            <Award size={18} className="text-amber-500" /> Achievements
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {badges.map((b, i) => (
              <motion.div key={b.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }}
                className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 text-center card-hover"
              >
                <span className="text-3xl block mb-2">{b.emoji}</span>
                <p className="font-semibold text-sm text-secondary">{b.name}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-tight">{b.description}</p>
                <p className="text-xs text-amber-600 font-medium mt-2">{new Date(b.earnedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
              </motion.div>
            ))}

            {/* Locked badges */}
            {LOCKED_BADGES.map(b => (
              <div key={b.name} className="bg-muted/30 border border-border/40 rounded-2xl p-4 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-muted/40" />
                <div className="relative z-10">
                  <span className="text-3xl block mb-2 opacity-40">{b.emoji}</span>
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
