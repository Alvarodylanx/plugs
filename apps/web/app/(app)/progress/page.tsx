'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, TrendingUp, Target, Award, Download } from 'lucide-react';
import { progress as progressApi } from '@/lib/api';
import { subjectColor, subjectIcon, gradeFromPercentage } from '@/lib/utils';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ProgressData } from '@/types';

export default function ProgressPage() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    progressApi.get().then(d => { setData(d as ProgressData); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-muted rounded w-48" />
      <div className="grid grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 bg-muted rounded-2xl" />)}</div>
      <div className="grid grid-cols-2 gap-4">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-64 bg-muted rounded-2xl" />)}</div>
    </div>
  );

  if (!data) return null;

  const { stats, weeklyHours, weeklyScores, subjectStats, badges } = data;

  return (
    <div className="animate-enter space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading font-bold text-2xl text-secondary">Your Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">Track your progress and identify areas for improvement</p>
        </div>
        <Button variant="outline" className="gap-2"><Download size={16} /> Export Report</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Clock, label: 'Total Hours', value: `${stats.totalHours}h`, bg: 'bg-blue-50', iconColor: 'text-blue-500', sub: 'Study time logged' },
          { icon: TrendingUp, label: 'Avg Quiz Score', value: `${stats.avgScore}%`, bg: 'bg-emerald-50', iconColor: 'text-emerald-500', sub: gradeFromPercentage(stats.avgScore).grade + ' grade' },
          { icon: Target, label: 'Quizzes Taken', value: stats.quizCount, bg: 'bg-indigo-50', iconColor: 'text-indigo-500', sub: 'Total attempts' },
          { icon: Award, label: 'Badges Earned', value: stats.badgeCount, bg: 'bg-amber-50', iconColor: 'text-amber-500', sub: 'Achievements' },
        ].map(({ icon: Icon, label, value, bg, iconColor, sub }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="bg-card rounded-2xl border border-border/50 p-5 card-hover"
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

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl border border-border/50 p-5">
          <h3 className="font-heading font-semibold text-secondary mb-4">Study Hours This Week</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyHours} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid vertical={false} stroke="hsl(214,32%,91%)" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(215,16%,47%)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'hsl(215,16%,47%)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(214,32%,91%)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
              <Bar dataKey="hours" fill="hsl(173,85%,38%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-2xl border border-border/50 p-5">
          <h3 className="font-heading font-semibold text-secondary mb-4">Quiz Scores This Week</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weeklyScores} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid vertical={false} stroke="hsl(214,32%,91%)" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(215,16%,47%)' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: 'hsl(215,16%,47%)' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: any) => [`${v}%`, 'Score']} contentStyle={{ borderRadius: '12px', border: '1px solid hsl(214,32%,91%)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
              <Line type="monotone" dataKey="score" stroke="hsl(173,85%,38%)" strokeWidth={2.5} dot={{ fill: 'hsl(173,85%,38%)', r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Subject Performance */}
      {subjectStats.length > 0 && (
        <div className="bg-card rounded-2xl border border-border/50 p-5">
          <h3 className="font-heading font-semibold text-secondary mb-5">Subject Performance</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {subjectStats.map((s, i) => {
              const g = gradeFromPercentage(s.avgScore);
              return (
                <motion.div key={s.subject} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  className="p-4 rounded-xl border border-border/50 hover:border-primary/30 transition-all"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{subjectIcon(s.subject)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-secondary truncate">{s.subject}</p>
                      <p className="text-xs text-muted-foreground">{s.quizCount} quizzes · {s.hours}h</p>
                    </div>
                    <span className={`text-sm font-bold ${g.color}`}>{g.grade}</span>
                  </div>
                  <ProgressBar value={s.avgScore} label={`${s.avgScore}%`} showPercent />
                  <p className="text-xs text-muted-foreground mt-2">
                    {s.avgScore >= 80 ? '↑ Excellent progress' : s.avgScore >= 60 ? '→ On track' : '↓ Needs more practice'}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Badges */}
      {badges.length > 0 && (
        <div className="bg-card rounded-2xl border border-border/50 p-5">
          <h3 className="font-heading font-semibold text-secondary mb-5">Achievements</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {badges.map((b, i) => (
              <motion.div key={b.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }}
                className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-4 text-center card-hover"
              >
                <span className="text-3xl block mb-2">{b.emoji}</span>
                <p className="font-semibold text-sm text-secondary">{b.name}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-tight">{b.description}</p>
                <p className="text-xs text-amber-600 font-medium mt-2">{new Date(b.earnedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
              </motion.div>
            ))}
            {/* Locked badges */}
            {[{ emoji: '🏆', name: '14-Day Streak', desc: 'Maintain a 14-day study streak' }, { emoji: '💎', name: 'Perfection', desc: 'Score 100% on any quiz' }, { emoji: '🌟', name: 'Top Student', desc: 'Reach the top 10 leaderboard' }].map(b => (
              <div key={b.name} className="bg-muted/50 border border-border/50 rounded-2xl p-4 text-center opacity-50">
                <span className="text-3xl block mb-2 grayscale">{b.emoji}</span>
                <p className="font-semibold text-sm text-muted-foreground">{b.name}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-tight">{b.desc}</p>
                <p className="text-xs text-muted-foreground mt-2">🔒 Locked</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
