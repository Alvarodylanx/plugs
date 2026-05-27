'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, BookOpen, Headphones, BrainCircuit, ChevronRight, Star, Users, TrendingUp, Zap, ArrowRight } from 'lucide-react';

const FEATURES = [
  { icon: BookOpen, title: 'AI-Structured Notes', desc: 'Upload any content and our AI breaks it into clear sections with key points and study tips.', color: 'from-teal-400 to-cyan-500' },
  { icon: Headphones, title: 'Audio Learning', desc: 'Listen to your notes read aloud section by section with adjustable speed and voice.', color: 'from-indigo-400 to-purple-500' },
  { icon: BrainCircuit, title: 'Adaptive Quizzes', desc: '12 AI-generated questions per note. Track your score, see explanations, improve with each attempt.', color: 'from-orange-400 to-pink-500' },
  { icon: Users, title: 'Community Forum', desc: 'Ask questions, share insights, and earn points by helping fellow students.', color: 'from-emerald-400 to-teal-500' },
  { icon: TrendingUp, title: 'Progress Analytics', desc: 'Visual charts tracking study hours, quiz scores, and subject performance over time.', color: 'from-blue-400 to-indigo-500' },
  { icon: Star, title: 'Streak & Badges', desc: 'Stay motivated with daily streaks, achievement badges, and a community leaderboard.', color: 'from-amber-400 to-orange-500' },
];

const STATS = [
  { value: '50,000+', label: 'Active Students' },
  { value: '12,000+', label: 'Notes Created' },
  { value: '98%', label: 'Pass Rate' },
  { value: '4.9★', label: 'Student Rating' },
];

const STEPS = [
  { step: '01', title: 'Upload Your Notes', desc: 'Paste text or upload PDF, Word, or image files.' },
  { step: '02', title: 'AI Processes', desc: 'Our system structures them into sections with key points and generates 12 quiz questions.' },
  { step: '03', title: 'Study Your Way', desc: 'Read, listen, quiz yourself, and track your progress to exam day.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navbar */}
      <nav className="glass fixed top-0 inset-x-0 z-50 h-16 flex items-center justify-between px-6 md:px-10 border-b border-border/30">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-md">
            <span className="text-white font-heading font-bold text-sm">P</span>
          </div>
          <span className="font-heading font-bold text-lg text-secondary">Plug</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login" className="btn-ghost text-sm px-4 py-2">Sign In</Link>
          <Link href="/register" className="btn-primary text-sm shadow-md shadow-primary/30">Get Started Free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 flex flex-col items-center text-center overflow-hidden">
        {/* Background blobs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute -top-16 right-0 w-80 h-80 rounded-full bg-secondary/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-40 bg-accent/10 blur-3xl pointer-events-none" />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-semibold mb-6">
            <Sparkles size={14} />
            AI-Powered Exam Prep for GCE O &amp; A Level
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-heading font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-secondary max-w-4xl leading-tight"
        >
          Study Smarter,<br />
          <span className="text-primary">Score Higher</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-muted-foreground text-lg max-w-2xl leading-relaxed"
        >
          Plug transforms your notes into structured study material, audio lessons, and adaptive quizzes — built specifically for GCE O &amp; A Level students.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-10 flex flex-col sm:flex-row gap-4"
        >
          <Link href="/register" className="btn-primary text-base px-8 py-3 shadow-lg shadow-primary/30">
            Get Started Free <ArrowRight size={16} />
          </Link>
          <Link href="/login" className="btn-outline text-base px-8 py-3">
            Sign In to Dashboard
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12"
        >
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="font-heading font-bold text-2xl md:text-3xl text-secondary">{value}</p>
              <p className="text-sm text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </motion.div>

        {/* Mock Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-20 w-full max-w-5xl mx-auto"
        >
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border/30">
            <div className="bg-secondary h-8 flex items-center gap-2 px-4">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <div className="mx-auto text-white/50 text-xs">plug.app/dashboard</div>
            </div>
            <div className="bg-card p-6 grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-4">
                <div className="h-28 rounded-2xl bg-gradient-to-r from-primary to-indigo-600 flex items-center p-6">
                  <div>
                    <p className="text-white font-heading font-bold text-lg">Hey Alex! You're on fire. 🔥</p>
                    <p className="text-white/70 text-sm mt-1">12-day streak · 1,450 points</p>
                    <div className="flex gap-2 mt-3">
                      <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-lg">Quick Quiz</span>
                      <span className="bg-white/10 text-white text-xs px-3 py-1 rounded-lg">Upload Note</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {['Computer Science / ICT', 'Biology', 'History', 'Mathematics'].map(s => (
                    <div key={s} className="bg-muted rounded-xl p-3">
                      <p className="text-xs font-semibold text-foreground">{s}</p>
                      <div className="mt-2 h-1.5 bg-border rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${Math.random() * 40 + 50}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <div className="bg-muted rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-primary">88%</p>
                  <p className="text-xs text-muted-foreground">Avg Quiz Score</p>
                </div>
                <div className="bg-muted rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-secondary">42h</p>
                  <p className="text-xs text-muted-foreground">Study Hours</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-3 border border-orange-100">
                  <p className="text-xs font-bold text-orange-700">🔥 12 Day Streak!</p>
                  <p className="text-xs text-muted-foreground mt-1">14-day badge at risk</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-secondary">Everything you need to ace your exams</h2>
            <p className="text-muted-foreground mt-4 text-lg max-w-2xl mx-auto">Six powerful tools designed around how students actually learn, all in one platform.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc, color }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-card rounded-2xl border border-border/50 p-6 card-hover"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-md`}>
                  <Icon size={22} className="text-white" />
                </div>
                <h3 className="font-heading font-semibold text-lg text-secondary mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-secondary">How it works</h2>
            <p className="text-muted-foreground mt-4">From raw notes to exam-ready in three steps.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map(({ step, title, desc }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center mx-auto mb-4">
                  <span className="font-heading font-bold text-primary text-xl">{step}</span>
                </div>
                <h3 className="font-heading font-semibold text-lg text-secondary mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-r from-primary to-indigo-600 rounded-3xl p-12 shadow-xl shadow-primary/20 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <Zap size={32} className="text-white/80 mx-auto mb-4" />
            <h2 className="font-heading font-bold text-3xl text-white mb-4">Start your exam prep journey today</h2>
            <p className="text-white/80 text-lg mb-8">Join 50,000+ students already using Plug. Free forever.</p>
            <Link href="/register" className="inline-flex items-center gap-2 bg-white text-primary px-8 py-3 rounded-xl font-semibold text-base hover:bg-white/90 active:scale-95 transition-all shadow-lg">
              Create Free Account <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-white/70 py-10 px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-heading font-bold text-xs">P</span>
          </div>
          <span className="font-heading font-semibold text-white">Plug</span>
        </div>
        <p className="text-sm">© {new Date().getFullYear()} Plug. Built for GCE O &amp; A Level students.</p>
      </footer>
    </div>
  );
}
