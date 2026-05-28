'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import {
  LayoutDashboard, BookOpen, Headphones, BrainCircuit,
  Youtube, Calendar, TrendingUp, Users, GraduationCap,
  FlaskConical, Globe, Settings, ArrowRight, CheckCircle2,
  Sparkles, Trophy, Star, Zap, Map, Timer, Bell, Wrench,
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
    description: "Your personalised home base shows daily study goals, streak status, recent notes, upcoming sessions, weekly challenges, and quick-access shortcuts. Hit the bell icon in the header to see replies on your community questions.",
    tips: ['Check your streak daily — 14 days unlocks a badge', 'Weekly challenges track study hours, quiz days, and community replies', 'Your XP level and points update here in real time'],
    xp: 50,
  },
  {
    id: 'notes',
    icon: BookOpen,
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-500/10',
    title: 'My Notes',
    subtitle: 'AI-structured study notes with chat & export',
    href: '/notes',
    mood: 'thinking',
    speech: "Upload your docs and I'll make them beautiful — then you can ask me anything!",
    description: "Upload PDFs, Word docs, or paste raw text — Gemini AI breaks it into structured sections with headings, key points, and 20+ quiz questions. Inside any note: read sections, listen aloud, take the quiz, watch related YouTube videos, or open the AI Tutor Chat to ask questions directly about the note content. Export any note as a PDF with one click.",
    tips: [
      'Open the "Ask AI" tab inside a note to have a conversation with Gemini about that topic',
      'Export as PDF from the breadcrumb row — great for printing revision sheets',
      'Read all sections to unlock the quiz — your score is saved to your progress',
      'The Videos tab fetches relevant YouTube lessons for the note automatically',
    ],
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
    description: "Convert any note into a spoken audio lesson using the browser's text-to-speech engine. Choose a voice and speed. Perfect for commuting, cooking, or when your eyes need a break.",
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
    description: "Take full note quizzes with detailed answer breakdowns and a grade at the end. Or turn on Quikz — a spaced-repetition micro-quiz system that pops one question at custom intervals throughout your day. Questions you get wrong come back more often.",
    tips: [
      'Enable Quikz and set it to every 30 min for passive daily revision',
      'Set quiet hours (e.g. 22:00–07:00) so questions stop at night',
      'Quikz works as in-app popups and push notifications when the app is closed',
      'Keyboard shortcuts in quizzes: 1-4 to answer, Enter to continue, Esc to exit',
    ],
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
    speech: "Sometimes seeing it is what makes it click!",
    description: "Search YouTube by subject and keyword and watch curated educational videos right inside the app — no ads, no distractions. Note pages also surface relevant videos automatically in their Videos tab.",
    tips: ['Use videos to reinforce tricky concepts after reading', 'Pair videos with the note on the same topic for multi-modal learning', 'Great for visual and auditory learners'],
    xp: 40,
  },
  {
    id: 'timetable',
    icon: Calendar,
    iconColor: 'text-teal-500',
    iconBg: 'bg-teal-500/10',
    title: 'Timetable',
    subtitle: 'Plan your sessions + live countdown',
    href: '/timetable',
    mood: 'idle',
    speech: "A good plan today means less stress tomorrow.",
    description: "Schedule focused study blocks for each subject with start and end times. A live countdown to your next session shows in real time. Enable browser notifications to get an alert 5, 10, or 15 minutes before a session starts with a custom sound.",
    tips: [
      'Block 1.5–2 hour sessions per subject for deep focus',
      'Mark sessions complete to keep your streak alive',
      'Use the Pomodoro Timer (bottom-right on every page) alongside scheduled sessions',
      'Test the notification sound in Settings before relying on it',
    ],
    xp: 50,
  },
  {
    id: 'focus',
    icon: Timer,
    iconColor: 'text-rose-500',
    iconBg: 'bg-rose-500/10',
    title: 'Focus Tools',
    subtitle: 'Pomodoro timer + global search',
    href: '/dashboard',
    mood: 'encouraging',
    speech: "25 minutes of focus beats 3 hours of distraction every time.",
    description: "Two productivity tools available on every page: the Pomodoro Timer (bottom-right floating button) runs 25-minute focus sessions followed by 5-minute breaks, plays a chime when each phase ends, and tracks how many tomatoes 🍅 you've completed. The Global Search (header bar or Ctrl+K) lets you instantly find any note, quiz, or community thread without navigating away.",
    tips: [
      'Press Ctrl+K (or Cmd+K on Mac) from anywhere to open the global search',
      'Start the Pomodoro before a study session — it keeps you honest about time',
      'After 4 Pomodoros take a longer 15–20 minute break',
      'The timer stays visible in the collapsed button even while you browse other pages',
    ],
    xp: 60,
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
    description: "Beautiful charts showing your quiz scores, study hours, cumulative XP, subject radar, streak heatmap, and badge collection. Weekly challenges track concrete targets. Export your full progress report as a PDF.",
    tips: [
      'Review weekly to spot weak subjects before exams',
      'Badges unlock at milestones — hover locked ones to see the condition',
      'The subject radar shows your strongest and weakest areas at a glance',
      'Export Report (top-right) produces a printable PDF of all your stats',
    ],
    xp: 40,
  },
  {
    id: 'social',
    icon: Users,
    iconColor: 'text-pink-500',
    iconBg: 'bg-pink-500/10',
    title: 'Community',
    subtitle: 'Ask, answer, earn — and get notified',
    href: '/social',
    mood: 'excited',
    speech: "Two heads are better than one — always!",
    description: "A live forum for GCE students. Post questions, write helpful replies, like answers, and mark the Best Answer to close a thread. Earn XP for every action. Edit or delete your own replies at any time. The bell icon in the header notifies you whenever someone replies to one of your questions.",
    tips: [
      'You earn +15 pts for asking, +10 pts for replying, +2 pts per like received',
      'Click the ✏️ icon on your own reply to edit it inline — no page reload',
      'The bell in the header shows replies to your questions with a blue dot for unread',
      'Mark your thread as Solved once you get a good answer — it helps future students',
      'Switch between Comfortable / Compact / Card grid layouts using the view toggle',
    ],
    xp: 70,
  },
  {
    id: 'teachers',
    icon: GraduationCap,
    iconColor: 'text-orange-500',
    iconBg: 'bg-orange-500/10',
    title: 'Teachers',
    subtitle: 'One-on-one guidance + video sessions',
    href: '/teachers',
    mood: 'encouraging',
    speech: "The right teacher changes everything.",
    description: "Browse verified tutors by subject, town, and availability. Follow teachers, rate them, and start a free encrypted video call directly in the browser using Jitsi Meet — no account or download required. Contact via WhatsApp for in-person or scheduled sessions.",
    tips: [
      'Click "Video Call" on any teacher profile to start an instant free session',
      'The video call uses Jitsi Meet — both parties share the same link, fully encrypted',
      'Filter by subject and town to find the closest tutor',
      'Become a teacher yourself via the "Become a Teacher" page in the menu',
    ],
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
    description: "A full Monaco Editor (the same engine as VS Code) right in the browser. Run Python, JavaScript, and more. Choose from starter templates covering CS curriculum topics — sorting algorithms, data structures, networking concepts, and more.",
    tips: [
      'Great for practising past CS exam programming questions',
      'Templates include bubble sort, linked lists, binary search, and more',
      'Copy your working code into a note as a saved code snippet',
      'Run code output appears instantly in the terminal panel below the editor',
    ],
    xp: 90,
  },
  {
    id: 'toolkit',
    icon: Wrench,
    iconColor: 'text-violet-500',
    iconBg: 'bg-violet-500/10',
    title: 'Study Toolkit',
    subtitle: '7 tools in one page',
    href: '/tools',
    mood: 'excited',
    speech: "Essay? Citation? Calculator? Flashcards? I've got you covered!",
    description: "A full suite of student tools — all free, all in-browser: ✍️ Essay Writer with formatting + PDF export, 🃏 Flashcard Maker (create decks or auto-generate from your notes), 📚 Citation Generator (APA 7, MLA 9, Harvard), 🔢 Scientific Calculator, ⚖️ Unit Converter (10 categories), 📊 Word Analyser with Flesch readability score, and 🖼️ Image → PDF converter.",
    tips: [
      'Auto-generate flashcards from any saved note — sections become cards, quiz questions become cards',
      'The Essay Writer exports a print-ready PDF directly from the browser — no Word needed',
      'Citation Generator supports Books, Journals, Websites, and YouTube in APA 7, MLA 9 & Harvard',
      'Unit Converter covers Length, Mass, Temperature, Volume, Speed, Area, Energy, Pressure, Time, and Data',
    ],
    xp: 90,
  },
  {
    id: 'research',
    icon: Globe,
    iconColor: 'text-indigo-500',
    iconBg: 'bg-indigo-500/10',
    title: 'Research Hub',
    subtitle: 'AI-powered study notes from Wikipedia',
    href: '/research',
    mood: 'thinking',
    speech: "The answer to everything is out there — I'll find it!",
    description: "Search any topic and get an AI-structured study summary: sections with key points, a difficulty level, read time, and 20 auto-generated quiz questions — all sourced from real Wikipedia content via Gemini AI. Save any research result directly to your Knowledge Base as a full note.",
    tips: [
      'Great for exploring topics not yet in your notes',
      'Click "Save as Note" to store the structured summary with its quiz to your Knowledge Base',
      'The Study Sites tab curates trusted learning resources by subject',
      'Generated quizzes are based on the actual Wikipedia content — reliable and exam-ready',
    ],
    xp: 80,
  },
  {
    id: 'notifications',
    icon: Bell,
    iconColor: 'text-amber-500',
    iconBg: 'bg-amber-500/10',
    title: 'Notifications',
    subtitle: 'Never miss a reply',
    href: '/social',
    mood: 'happy',
    speech: "Someone replied! Go check — it might be the answer you needed.",
    description: "The bell icon in the top header is a live notification centre. It shows whenever another student replies to a question you posted in the community. Unread notifications show a blue dot. Click 'Mark all read' once you've caught up. Notification state is saved in your browser.",
    tips: [
      'Click the bell any time to fetch the latest replies on your threads',
      'A pulsing red dot on the bell means you have new unread replies',
      'Blue dots on individual notifications mark them as unread',
      '"View all community threads" link takes you straight to the Community page',
    ],
    xp: 20,
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
    description: "Update your display name, upload a custom avatar, view your stats (points, streak, level), and see your full badge collection. The dark mode toggle lives in the top header — your preference is saved and persists across sessions.",
    tips: [
      'Upload a custom avatar — it appears in the header, sidebar, and community posts',
      'Your badge collection here and on the Progress page stay in sync',
      'Dark mode is toggled via the sun/moon icon in the header — no extra setting needed',
      'Study level (O-Level, A-Level…) is set during onboarding but can be updated here',
    ],
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
              Explore all {STOPS.length} features, earn XP at each stop, and become a Plug power user. Click a card to expand it, then hit <strong>"Explore"</strong> to visit the feature and mark it complete.
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
