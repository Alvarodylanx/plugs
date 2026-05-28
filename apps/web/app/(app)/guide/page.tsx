'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import {
  LayoutDashboard, BookOpen, Headphones, BrainCircuit,
  Youtube, Calendar, TrendingUp, Users, GraduationCap,
  FlaskConical, Globe, Settings, ArrowRight, CheckCircle2,
  Sparkles, Trophy, Star, Zap, Map,
} from 'lucide-react';
import { Mascot, type MascotMood } from '@/components/mascot';

interface Stop {
  id: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
  href: string;
  mood: MascotMood;
  speech: string;
  description: string;
  tips: string[];
  xp: number;
}

const STOPS: Stop[] = [
  {
    id: 'dashboard',
    icon: LayoutDashboard,
    iconColor: 'text-primary',
    iconBg: 'bg-primary/10',
    title: 'Dashboard',
    subtitle: 'Your command centre',
    href: '/dashboard',
    mood: 'excited',
    speech: "Welcome home! Everything starts here.",
    description: "Your personalised home base shows daily study goals, streak status, recent notes, upcoming sessions, and quick-access shortcuts. Everything you need at a glance.",
    tips: ['Check your streak daily to stay motivated', 'Use quick-access cards to jump to recent work', 'Your level and XP update here in real time'],
    xp: 50,
  },
  {
    id: 'notes',
    icon: BookOpen,
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-500/10',
    title: 'My Notes',
    subtitle: 'AI-structured study notes',
    href: '/notes',
    mood: 'thinking',
    speech: "Upload your docs and I'll make them beautiful!",
    description: "Upload PDFs, Word docs, or paste raw text — Claude AI breaks it into structured sections with headings, key points, and 20+ quiz questions automatically generated.",
    tips: ['Add subject tags for organised filtering', 'Built-in notes cover O-Level & A-Level topics', 'Sections are collapsible for focused reading'],
    xp: 80,
  },
  {
    id: 'audio',
    icon: Headphones,
    iconColor: 'text-purple-500',
    iconBg: 'bg-purple-500/10',
    title: 'Audio Notes',
    subtitle: 'Study while on the go',
    href: '/audio-notes',
    mood: 'happy',
    speech: "Pop in your earbuds — let's go for a walk!",
    description: "Convert any note into a spoken audio lesson. Choose from multiple AI voices and speeds. Perfect for commuting, cooking, or when your eyes need a break.",
    tips: ['Try 1.25× speed to get through content faster', 'Listen while doing low-intensity activities', 'Combine with reading for better retention'],
    xp: 60,
  },
  {
    id: 'quizzes',
    icon: BrainCircuit,
    iconColor: 'text-violet-500',
    iconBg: 'bg-violet-500/10',
    title: 'Quizzes & Quikz',
    subtitle: 'Test yourself relentlessly',
    href: '/quizzes',
    mood: 'celebrating',
    speech: "Quiz time! Let's see what you really know.",
    description: "Take full note quizzes, browse the quiz library, or turn on Quikz — a spaced-repetition micro-quiz system that pops questions at custom intervals throughout your day.",
    tips: ['Enable Quikz for passive daily revision', 'Set quiet hours so it won\'t disturb you at night', 'Harder-for-you questions appear more often (spaced repetition)'],
    xp: 100,
  },
  {
    id: 'videos',
    icon: Youtube,
    iconColor: 'text-red-500',
    iconBg: 'bg-red-500/10',
    title: 'Videos',
    subtitle: 'Visual learning library',
    href: '/videos',
    mood: 'happy',
    speech: "Sometimes seeing it click it!",
    description: "Curated YouTube videos for every GCE subject and topic. Search by subject or keyword and watch right inside the app without distractions.",
    tips: ['Use videos to reinforce tricky concepts', 'Pair with your notes on the same topic', 'Great for visual and auditory learners'],
    xp: 40,
  },
  {
    id: 'timetable',
    icon: Calendar,
    iconColor: 'text-teal-500',
    iconBg: 'bg-teal-500/10',
    title: 'Timetable',
    subtitle: 'Plan your study sessions',
    href: '/timetable',
    mood: 'idle',
    speech: "A good plan today means less stress tomorrow.",
    description: "Schedule focused study blocks for each subject. Mark sessions complete to earn XP and maintain your streak. See your week at a glance.",
    tips: ['Block 2-3 hour study sessions for deep work', 'Add buffer time between subjects', 'Completing sessions keeps your streak alive'],
    xp: 50,
  },
  {
    id: 'progress',
    icon: TrendingUp,
    iconColor: 'text-emerald-500',
    iconBg: 'bg-emerald-500/10',
    title: 'Progress',
    subtitle: 'Track your growth',
    href: '/progress',
    mood: 'celebrating',
    speech: "Look how far you've come! I'm so proud!",
    description: "Beautiful charts showing your quiz scores, study hours, XP growth, streak history, and badge collection. See which subjects need more attention.",
    tips: ['Review weekly to spot weak subjects early', 'Badges unlock at study milestones', 'XP leaderboard shows your rank among friends'],
    xp: 40,
  },
  {
    id: 'social',
    icon: Users,
    iconColor: 'text-pink-500',
    iconBg: 'bg-pink-500/10',
    title: 'Community',
    subtitle: 'Learn together',
    href: '/social',
    mood: 'excited',
    speech: "Two heads are better than one — always!",
    description: "Ask questions, post discussions, vote on answers, and mark Best Answers. Earn XP by helping others. A live forum for GCE students.",
    tips: ['Mark threads as solved to help future searchers', 'Like quality answers to surface them', 'Ask specific questions for faster, better answers'],
    xp: 70,
  },
  {
    id: 'teachers',
    icon: GraduationCap,
    iconColor: 'text-orange-500',
    iconBg: 'bg-orange-500/10',
    title: 'Teachers',
    subtitle: 'Expert one-on-one guidance',
    href: '/teachers',
    mood: 'encouraging',
    speech: "The right teacher changes everything.",
    description: "Browse verified tutors by subject, town, and availability. Follow teachers for updates, see their bio and rating, and reach out for private lessons.",
    tips: ['Filter by town to find tutors near you', 'Follow teachers whose content you enjoy', 'Check ratings and subject specialisations'],
    xp: 30,
  },
  {
    id: 'lab',
    icon: FlaskConical,
    iconColor: 'text-cyan-500',
    iconBg: 'bg-cyan-500/10',
    title: 'Coding Lab',
    subtitle: 'Write & run code in the browser',
    href: '/lab',
    mood: 'excited',
    speech: "Let's build something cool right now!",
    description: "A full Monaco Editor (VS Code's engine) right in the browser. Run Python, JavaScript, and more. Choose from starter templates covering CS curriculum topics.",
    tips: ['Great for practising CS exam questions', 'Templates cover sorting, data structures, and more', 'Save snippets to your notes for later review'],
    xp: 90,
  },
  {
    id: 'research',
    icon: Globe,
    iconColor: 'text-indigo-500',
    iconBg: 'bg-indigo-500/10',
    title: 'Research Hub',
    subtitle: 'AI-powered Wikipedia summaries',
    href: '/research',
    mood: 'thinking',
    speech: "The answer to everything is out there — I'll find it!",
    description: "Search any topic and get a structured AI summary with sections, key points, and quiz questions auto-generated from real Wikipedia content.",
    tips: ['Great for exploring topics not in your notes yet', 'Generated quizzes help you test new material', 'Use for essay research and background reading'],
    xp: 80,
  },
  {
    id: 'settings',
    icon: Settings,
    iconColor: 'text-gray-500',
    iconBg: 'bg-gray-500/10',
    title: 'Profile & Settings',
    subtitle: 'Make Plug yours',
    href: '/settings',
    mood: 'happy',
    speech: "Looking good is feeling good — customise away!",
    description: "Update your name, email, password, study level, custom avatar, and study profile. Your profile data personalises dashboard recommendations.",
    tips: ['Upload a custom avatar for a personal touch', 'Set your study level to filter relevant content', 'Keep your email updated for account recovery'],
    xp: 30,
  },
];

const TOTAL_XP = STOPS.reduce((s, st) => s + st.xp, 0);

function ConfettiPiece({ delay, x }: { delay: number; x: number }) {
  const colors = ['#0fb8a0', '#6366f1', '#f97316', '#ec4899', '#eab308', '#10b981'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  return (
    <motion.div
      className="absolute top-0 w-2 h-2 rounded-sm"
      style={{ left: `${x}%`, background: color }}
      initial={{ y: -20, opacity: 1, rotate: 0 }}
      animate={{ y: 400, opacity: 0, rotate: 720 }}
      transition={{ duration: 2.5 + Math.random(), delay, ease: 'easeIn' }}
    />
  );
}

function Confetti() {
  const pieces = Array.from({ length: 40 }, (_, i) => ({ id: i, delay: i * 0.05, x: Math.random() * 100 }));
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {pieces.map(p => <ConfettiPiece key={p.id} delay={p.delay} x={p.x} />)}
    </div>
  );
}

export default function GuidePage() {
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [activeStop, setActiveStop] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const hasShownAll = useRef(false);

  useEffect(() => {
    const stored = localStorage.getItem('plug_guide_visited');
    if (stored) {
      try { setVisited(new Set(JSON.parse(stored))); } catch { /* ignore */ }
    }
  }, []);

  function markVisited(id: string) {
    setVisited(prev => {
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem('plug_guide_visited', JSON.stringify([...next]));
      if (next.size === STOPS.length && !hasShownAll.current) {
        hasShownAll.current = true;
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3500);
      }
      return next;
    });
  }

  const earnedXP = STOPS.filter(s => visited.has(s.id)).reduce((sum, s) => sum + s.xp, 0);
  const progressPct = Math.round((visited.size / STOPS.length) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {showConfetti && <Confetti />}

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-violet-500/10 to-card border border-border p-8 text-center"
      >
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_30%_50%,#0fb8a0,transparent_60%),radial-gradient(circle_at_70%_50%,#6366f1,transparent_60%)]" />
        <div className="relative flex flex-col items-center gap-4">
          <Mascot mood="excited" size={100} message="Welcome to your journey!" />
          <div>
            <h1 className="font-heading font-bold text-3xl text-foreground flex items-center justify-center gap-2">
              <Map size={28} className="text-primary" />
              Plug Feature Guide
            </h1>
            <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
              Explore every feature, earn XP at each stop, and become a Plug power user. Click <strong>"Explore"</strong> to visit a feature and mark it complete.
            </p>
          </div>

          {/* XP progress */}
          <div className="w-full max-w-sm space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-muted-foreground">{visited.size} / {STOPS.length} stops explored</span>
              <span className="text-primary font-bold">{earnedXP} / {TOTAL_XP} XP</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-violet-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
            {visited.size === STOPS.length && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center gap-2 text-sm font-bold text-primary"
              >
                <Trophy size={16} />
                You've explored everything! Legend status unlocked.
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stops */}
      <div className="space-y-6">
        {STOPS.map((stop, idx) => {
          const isVisited = visited.has(stop.id);
          const isActive = activeStop === stop.id;
          const isEven = idx % 2 === 0;
          const Icon = stop.icon;

          return (
            <motion.div
              key={stop.id}
              initial={{ opacity: 0, x: isEven ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={`relative flex gap-6 items-start ${isEven ? 'flex-row' : 'flex-row-reverse'}`}
            >
              {/* Step number + connector line */}
              <div className="flex flex-col items-center shrink-0 pt-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-heading font-bold text-sm border-2 transition-all duration-300 ${
                  isVisited
                    ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30'
                    : 'bg-card border-border text-muted-foreground'
                }`}>
                  {isVisited ? <CheckCircle2 size={18} /> : idx + 1}
                </div>
                {idx < STOPS.length - 1 && (
                  <div className={`w-0.5 h-full min-h-[40px] mt-2 rounded-full transition-colors duration-500 ${
                    isVisited ? 'bg-primary/40' : 'bg-border'
                  }`} />
                )}
              </div>

              {/* Card */}
              <div
                className={`flex-1 rounded-3xl border transition-all duration-300 overflow-hidden cursor-pointer ${
                  isActive
                    ? 'border-primary/50 shadow-xl shadow-primary/10 bg-card'
                    : isVisited
                    ? 'border-primary/20 bg-card/80 shadow-md'
                    : 'border-border bg-card hover:border-primary/30 hover:shadow-lg'
                }`}
                onClick={() => setActiveStop(isActive ? null : stop.id)}
              >
                {/* Card header */}
                <div className="p-5 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl ${stop.iconBg} flex items-center justify-center shrink-0`}>
                    <Icon size={22} className={stop.iconColor} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading font-bold text-lg text-foreground">{stop.title}</h3>
                      {isVisited && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          <Star size={10} fill="currentColor" /> {stop.xp} XP
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{stop.subtitle}</p>
                  </div>

                  <div className={`hidden sm:block transition-all duration-300 ${isEven ? '' : 'order-first'}`}>
                    <Mascot mood={stop.mood} size={60} />
                  </div>

                  <motion.div
                    animate={{ rotate: isActive ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="shrink-0"
                  >
                    <ArrowRight size={18} className="text-muted-foreground" />
                  </motion.div>
                </div>

                {/* Expanded content */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 space-y-4 border-t border-border/50 pt-4">
                        {/* Speech bubble + mascot for mobile */}
                        <div className="flex items-start gap-3 sm:hidden">
                          <Mascot mood={stop.mood} size={56} />
                          <div className="flex-1 bg-primary/5 border border-primary/20 rounded-2xl px-4 py-2.5 text-sm text-foreground font-medium italic">
                            "{stop.speech}"
                          </div>
                        </div>
                        {/* Speech bubble for desktop (full width) */}
                        <div className="hidden sm:block bg-primary/5 border border-primary/20 rounded-2xl px-4 py-2.5 text-sm text-foreground font-medium italic">
                          "{stop.speech}"
                        </div>

                        <p className="text-sm text-muted-foreground leading-relaxed">{stop.description}</p>

                        {/* Tips */}
                        <div className="space-y-2">
                          <p className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                            <Zap size={12} className="text-primary" /> Pro Tips
                          </p>
                          <ul className="space-y-1.5">
                            {stop.tips.map((tip, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <span className="text-primary mt-0.5 shrink-0">•</span>
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 pt-1">
                          <Link
                            href={stop.href}
                            onClick={() => markVisited(stop.id)}
                            className="btn-primary gap-2 text-sm"
                          >
                            <ArrowRight size={15} />
                            Explore {stop.title}
                          </Link>
                          {!isVisited && (
                            <button
                              onClick={(e) => { e.stopPropagation(); markVisited(stop.id); setActiveStop(null); }}
                              className="btn-ghost text-sm gap-1.5"
                            >
                              <CheckCircle2 size={15} />
                              Mark explored (+{stop.xp} XP)
                            </button>
                          )}
                          {isVisited && (
                            <span className="flex items-center gap-1.5 text-sm text-primary font-semibold">
                              <Sparkles size={14} /> Explored!
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer completion card */}
      {visited.size === STOPS.length && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="rounded-3xl bg-gradient-to-br from-primary/20 to-violet-500/20 border border-primary/30 p-8 text-center space-y-4"
        >
          <Mascot mood="celebrating" size={100} />
          <div>
            <h2 className="font-heading font-bold text-2xl text-foreground">You're a Plug Master!</h2>
            <p className="text-muted-foreground mt-1">You've explored every feature. Now go and crush those exams!</p>
          </div>
          <div className="flex items-center justify-center gap-2 text-primary font-bold text-xl">
            <Trophy size={20} />
            {TOTAL_XP} XP Earned — Legend Status
          </div>
          <Link href="/dashboard" className="btn-primary inline-flex">
            Back to Dashboard
          </Link>
        </motion.div>
      )}
    </div>
  );
}
