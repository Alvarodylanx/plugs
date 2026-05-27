'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Brain, Target, Trophy, ChevronRight, Clock, BookOpen, BrainCircuit, Calendar, Flame, Zap, TrendingUp } from 'lucide-react';
import { progress as progressApi, notes as notesApi } from '@/lib/api';
import { getUser } from '@/lib/auth';
import { subjectColor, subjectIcon, formatRelativeTime } from '@/lib/utils';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Badge } from '@/components/ui/badge';
import type { User, NoteCard, ProgressData } from '@/types';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' } }),
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<ProgressData | null>(null);
  const [recentNotes, setRecentNotes] = useState<NoteCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getUser(), progressApi.get(), notesApi.list()]).then(([u, pd, ns]) => {
      setUser(u as User);
      setData(pd as ProgressData);
      setRecentNotes((ns as NoteCard[]).slice(0, 4));
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-36 bg-muted rounded-3xl" /><div className="grid grid-cols-2 gap-4"><div className="h-32 bg-muted rounded-2xl" /><div className="h-32 bg-muted rounded-2xl" /></div></div>;

  const firstName = user?.name?.split(' ')[0] || 'Student';
  const stats = data?.stats;
  const weeklyGoal = { studyHours: { current: stats?.totalHours || 0, target: 10 }, quizzes: { current: stats?.quizCount || 0, target: 5 }, notes: { current: recentNotes.length, target: 7 } };

  return (
    <div className="animate-enter space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-r from-primary via-primary/90 to-indigo-600 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-primary/20 overflow-hidden"
      >
        <div className="absolute -top-6 -right-6 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-20 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-white/70 text-sm font-medium mb-1">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}!</p>
              <h1 className="font-heading font-bold text-2xl md:text-3xl">Hey {firstName}! You&apos;re on fire. 🔥</h1>
              <p className="text-white/80 text-sm mt-2">
                {user?.streak ?? 0}-day streak · {(user?.points || 0).toLocaleString()} points · Keep going!
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link href="/quizzes" className="bg-white text-primary px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-white/90 active:scale-95 transition-all shadow-md flex items-center gap-2">
                <BrainCircuit size={16} /> Quick Quiz
              </Link>
              <Link href="/notes/upload" className="bg-white/20 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-white/30 active:scale-95 transition-all flex items-center gap-2">
                <BookOpen size={16} /> Upload Note
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Clock, label: 'Study Hours', value: `${stats?.totalHours ?? 0}h`, color: 'bg-blue-50', iconColor: 'text-blue-500' },
          { icon: TrendingUp, label: 'Avg Score', value: `${stats?.avgScore ?? 0}%`, color: 'bg-emerald-50', iconColor: 'text-emerald-500' },
          { icon: Target, label: 'Quizzes Done', value: stats?.quizCount ?? 0, color: 'bg-indigo-50', iconColor: 'text-indigo-500' },
          { icon: Trophy, label: 'Badges', value: stats?.badgeCount ?? 0, color: 'bg-amber-50', iconColor: 'text-amber-500' },
        ].map(({ icon: Icon, label, value, color, iconColor }, i) => (
          <motion.div key={label} custom={i} variants={cardVariants} initial="hidden" animate="visible"
            className="bg-card rounded-2xl border border-border/50 p-4 card-hover"
          >
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
              <Icon size={18} className={iconColor} />
            </div>
            <p className="font-heading font-bold text-2xl text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-heading font-semibold text-secondary">Quick Actions</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { href: '/notes', icon: BookOpen, label: 'Continue Learning', desc: 'Resume your last note', badge: `${recentNotes.length} notes`, badgeColor: 'bg-orange-50 text-orange-600', iconBg: 'bg-orange-100', iconColor: 'text-orange-500' },
              { href: '/quizzes', icon: Target, label: 'Daily Challenge', desc: 'Test your knowledge', badge: 'New!', badgeColor: 'bg-indigo-50 text-indigo-600', iconBg: 'bg-indigo-100', iconColor: 'text-indigo-500' },
              { href: '/timetable', icon: Calendar, label: 'Study Timetable', desc: 'Plan your week', badge: 'Week view', badgeColor: 'bg-teal-50 text-teal-600', iconBg: 'bg-teal-100', iconColor: 'text-teal-500' },
              { href: '/social', icon: Zap, label: 'Community', desc: 'Help other students', badge: '5 threads', badgeColor: 'bg-purple-50 text-purple-600', iconBg: 'bg-purple-100', iconColor: 'text-purple-500' },
            ].map(({ href, icon: Icon, label, desc, badge, badgeColor, iconBg, iconColor }, i) => (
              <motion.div key={href} custom={i + 4} variants={cardVariants} initial="hidden" animate="visible">
                <Link href={href} className="bg-card rounded-2xl border border-border/50 p-5 flex flex-col gap-4 card-hover group block">
                  <div className="flex items-start justify-between">
                    <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center`}>
                      <Icon size={20} className={iconColor} />
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${badgeColor}`}>{badge}</span>
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-secondary">{label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                    Start <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Recent Notes */}
          <div className="bg-card rounded-2xl border border-border/50 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-semibold text-secondary">Recent Notes</h3>
              <Link href="/notes" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                View all <ChevronRight size={12} />
              </Link>
            </div>
            <div className="space-y-3">
              {recentNotes.slice(0, 3).map(note => (
                <Link key={note.id} href={`/notes/${note.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors group"
                >
                  <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-base shrink-0">
                    {subjectIcon(note.subject)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">{note.title}</p>
                    <p className="text-xs text-muted-foreground">{note.subject} · {note.readTime}</p>
                  </div>
                  <span className={`badge ${subjectColor(note.subject)} shrink-0 hidden sm:inline-flex`}>{note.level}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Weekly Goal Sidebar */}
        <div className="space-y-4">
          <h2 className="font-heading font-semibold text-secondary">Weekly Goal</h2>
          <motion.div custom={8} variants={cardVariants} initial="hidden" animate="visible"
            className="bg-gradient-to-b from-card to-muted/30 rounded-2xl border border-border/50 p-5"
          >
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
                <Trophy size={16} className="text-amber-500" />
              </div>
              <span className="font-heading font-semibold text-secondary text-sm">Weekly Goal</span>
            </div>
            <div className="space-y-4">
              <ProgressBar value={weeklyGoal.studyHours.current} max={weeklyGoal.studyHours.target} label={`Study Time ${weeklyGoal.studyHours.current}/${weeklyGoal.studyHours.target} hrs`} showPercent />
              <ProgressBar value={weeklyGoal.quizzes.current} max={weeklyGoal.quizzes.target} label={`Quizzes Taken ${weeklyGoal.quizzes.current}/${weeklyGoal.quizzes.target}`} showPercent />
              <ProgressBar value={weeklyGoal.notes.current} max={weeklyGoal.notes.target} label={`Notes Explored ${weeklyGoal.notes.current}/${weeklyGoal.notes.target}`} showPercent />
            </div>
          </motion.div>

          {/* Streak Card */}
          <motion.div custom={9} variants={cardVariants} initial="hidden" animate="visible"
            className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-100 p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <Flame size={20} className="text-orange-500" />
              </div>
              <div>
                <p className="font-heading font-bold text-secondary">{user?.streak ?? 0} Day Streak!</p>
                <p className="text-xs text-muted-foreground">Personal best</p>
              </div>
            </div>
            <div className="flex gap-1 flex-wrap">
              {Array.from({ length: 14 }, (_, i) => (
                <div key={i} className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${i < (user?.streak ?? 0) ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-300'}`}>
                  {i < (user?.streak ?? 0) ? '🔥' : '○'}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">2 more days to unlock the 14-day badge! 🏆</p>
          </motion.div>

          {/* Subject Breakdown */}
          {data?.subjectStats && data.subjectStats.length > 0 && (
            <motion.div custom={10} variants={cardVariants} initial="hidden" animate="visible"
              className="bg-card rounded-2xl border border-border/50 p-5"
            >
              <h3 className="font-heading font-semibold text-secondary text-sm mb-4">Subject Performance</h3>
              <div className="space-y-3">
                {data.subjectStats.slice(0, 4).map(s => (
                  <div key={s.subject}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground truncate">{s.subject}</span>
                      <span className="text-xs font-bold text-foreground">{s.avgScore}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${s.avgScore}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/progress" className="mt-4 text-xs text-primary font-semibold flex items-center gap-1 hover:underline">
                View full analytics <ChevronRight size={12} />
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
