'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, CheckCircle2, Circle, Play, Pause, Sparkles,
  ChevronDown, ChevronUp, RotateCcw, Volume2, BrainCircuit,
  Trophy, Clock, BookOpen, X, Youtube, ExternalLink, Loader2,
  Lock, Timer, MessageCircle, Send, Bot, User as UserIcon, Download,
} from 'lucide-react';
import { notes as notesApi, videos as videosApi, research as researchApi } from '@/lib/api';
import { getUser } from '@/lib/auth';
import { subjectIcon, gradeFromPercentage } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Button } from '@/components/ui/button';
import { Mascot, type MascotMood } from '@/components/mascot';
import type { Note, NoteSection, QuizQuestion, VideoResult } from '@/types';

export default function NoteViewerPage() {
  const { id } = useParams<{ id: string }>();
  const [note, setNote] = useState<Note | null>(null);
  const [readSections, setReadSections] = useState<Set<number>>(new Set());
  const [expanded, setExpanded] = useState<number | null>(0);
  const [speaking, setSpeaking] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizState, setQuizState] = useState({ current: 0, answers: [] as (number | null)[], submitted: false, score: 0 });
  const [quizTimer, setQuizTimer] = useState(0);
  const [loading, setLoading] = useState(true);
  const [readingTime, setReadingTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const quizTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'videos' | 'chat'>('content');
  const [noteVideos, setNoteVideos] = useState<VideoResult[] | null>(null);
  const [videosLoading, setVideosLoading] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<VideoResult | null>(null);
  // AI Chat
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([notesApi.get(id), notesApi.getProgress(id)]).then(([n, prog]) => {
      const noteData = n as Note;
      setNote(noteData);
      setReadSections(new Set<number>((prog as any[]).map((p: any) => p.sectionIdx)));
      setLoading(false);
    });
    return () => {
      window.speechSynthesis?.cancel();
      if (timerRef.current) clearInterval(timerRef.current);
      if (quizTimerRef.current) clearInterval(quizTimerRef.current);
    };
  }, [id]);

  // Reading timer
  useEffect(() => {
    timerRef.current = setInterval(() => setReadingTime(t => t + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  // Quiz timer (counts up while quiz is open and not submitted)
  useEffect(() => {
    if (showQuiz && !quizState.submitted) {
      quizTimerRef.current = setInterval(() => setQuizTimer(t => t + 1), 1000);
    } else {
      if (quizTimerRef.current) clearInterval(quizTimerRef.current);
    }
    return () => { if (quizTimerRef.current) clearInterval(quizTimerRef.current); };
  }, [showQuiz, quizState.submitted]);

  // Keyboard nav for quiz
  useEffect(() => {
    if (!showQuiz || quizState.submitted) return;
    function handler(e: KeyboardEvent) {
      if (e.key >= '1' && e.key <= '4') selectAnswer(parseInt(e.key) - 1);
      if (e.key === 'Enter') {
        const ans = quizState.answers[quizState.current];
        if (ans !== null && ans !== undefined) nextQuestion();
      }
      if (e.key === 'Escape') setShowQuiz(false);
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showQuiz, quizState]);

  function toggleRead(idx: number) {
    const next = new Set(readSections);
    if (next.has(idx)) { next.delete(idx); }
    else {
      next.add(idx);
      notesApi.markRead(id, idx);
      const sections = note?.sections || [];
      const nextUnread = (sections as any[]).findIndex((_, i) => i > idx && !next.has(i));
      if (nextUnread !== -1) setExpanded(nextUnread);
    }
    setReadSections(next);
  }

  function readAloud(text: string, idx: number) {
    window.speechSynthesis.cancel();
    if (speaking && speakingIdx === idx) { setSpeaking(false); setSpeakingIdx(null); return; }
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.95;
    const voices = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('en'));
    if (voices.length) utt.voice = voices[0];
    utt.onend = () => { setSpeaking(false); setSpeakingIdx(null); };
    window.speechSynthesis.speak(utt);
    setSpeaking(true);
    setSpeakingIdx(idx);
  }

  function selectAnswer(ans: number) {
    if (quizState.submitted) return;
    const answers = [...quizState.answers];
    answers[quizState.current] = ans;
    setQuizState(s => ({ ...s, answers }));
  }

  function nextQuestion() {
    const { current, answers } = quizState;
    const questions = note?.quiz || [];
    if (current < questions.length - 1) {
      setQuizState(s => ({ ...s, current: s.current + 1 }));
    } else {
      const score = (answers as (number | null)[]).reduce((acc: number, ans, i) =>
        (ans !== null && ans === (questions as QuizQuestion[])[i].correct) ? acc + 1 : acc, 0);
      setQuizState(s => ({ ...s, submitted: true, score }));
      getUser().then(u => { if (u) notesApi.saveQuiz(id, score, questions.length); });
    }
  }

  function resetQuiz() {
    setQuizTimer(0);
    setQuizState({ current: 0, answers: new Array(note?.quiz?.length || 0).fill(null), submitted: false, score: 0 });
  }

  function startQuiz() {
    setShowQuiz(true);
    setQuizTimer(0);
    setQuizState({ current: 0, answers: new Array(note?.quiz?.length || 0).fill(null), submitted: false, score: 0 });
  }

  async function sendChat(e?: React.FormEvent) {
    e?.preventDefault();
    const q = chatInput.trim();
    if (!q || chatLoading || !note) return;
    setChatInput('');
    setChatLoading(true);
    const userMsg = { role: 'user' as const, text: q };
    setChatHistory(h => [...h, userMsg]);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    try {
      const noteContent = note.sections
        .map((s, i) => `Section ${i + 1}: ${s.heading}\n${s.content}${s.keyPoints?.length ? `\nKey points: ${s.keyPoints.join('; ')}` : ''}`)
        .join('\n\n');
      const apiHistory = chatHistory.map(m => ({ role: m.role === 'user' ? 'user' : 'model', text: m.text }));
      const { answer } = await researchApi.chat({ noteTitle: note.title, noteContent, history: apiHistory, question: q });
      setChatHistory(h => [...h, { role: 'ai', text: answer }]);
    } catch {
      setChatHistory(h => [...h, { role: 'ai', text: 'Sorry, I could not get a response. Please try again.' }]);
    } finally {
      setChatLoading(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  }

  async function switchToVideos() {
    setActiveTab('videos');
    if (noteVideos !== null) return;
    setVideosLoading(true);
    try {
      const res = await videosApi.search(`${note!.title} ${note!.subject} study`, 6) as VideoResult[];
      setNoteVideos(res);
    } catch { setNoteVideos([]); }
    finally { setVideosLoading(false); }
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse max-w-4xl mx-auto">
        <div className="h-10 bg-muted rounded-xl w-3/4" />
        <div className="h-4 bg-muted rounded w-1/4" />
        <div className="h-40 bg-muted rounded-2xl" />
      </div>
    );
  }
  if (!note) return <div className="text-center py-20"><p className="text-muted-foreground">Note not found.</p></div>;

  const sections = note.sections as NoteSection[];
  const quiz = note.quiz as QuizQuestion[];
  const readCount = readSections.size;
  const allRead = readCount === sections.length;
  const readingMins = Math.floor(readingTime / 60);
  const readingSecs = readingTime % 60;
  const quizMins = String(Math.floor(quizTimer / 60)).padStart(2, '0');
  const quizSecs = String(quizTimer % 60).padStart(2, '0');

  const scorePercent = quizState.submitted ? Math.round(quizState.score / quiz.length * 100) : 0;
  const grade = quizState.submitted ? gradeFromPercentage(scorePercent) : null;
  const quizMascotMood: MascotMood = scorePercent >= 90 ? 'celebrating' : scorePercent >= 70 ? 'happy' : scorePercent >= 50 ? 'encouraging' : 'sad';
  const quizMascotMsg = scorePercent >= 90 ? 'Outstanding! 🔥' : scorePercent >= 70 ? 'Great work! 🎉' : scorePercent >= 50 ? 'Keep going! 💪' : "Let's review this 📚";

  const GRADE_COLOR: Record<string, string> = {
    'A*': 'from-emerald-500 to-teal-500',
    'A':  'from-green-500 to-emerald-500',
    'B':  'from-blue-500 to-indigo-500',
    'C':  'from-amber-500 to-yellow-500',
    'D':  'from-orange-500 to-amber-500',
    'F':  'from-rose-500 to-red-500',
  };
  const GRADE_MSG: Record<string, string> = {
    'A*': 'Exceptional! Perfect score!', 'A': 'Excellent work!',
    'B': 'Great job! Nearly there!', 'C': 'Good effort. Review and retry!',
    'D': "Keep practicing!", 'F': 'Review the note and try again!',
  };
  const gradeBg = grade ? (GRADE_COLOR[grade.grade] || GRADE_COLOR['C']) : '';
  const gradeMsg = grade ? (GRADE_MSG[grade.grade] || '') : '';

  return (
    <>
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .bg-card, .bg-background { background: white !important; }
          .text-muted-foreground { color: #555 !important; }
          .text-secondary { color: #1a1a2e !important; }
          .border { border-color: #e5e7eb !important; }
          .shadow-lg, .shadow-sm { box-shadow: none !important; }
        }
      `}</style>
    <div className="animate-enter max-w-4xl mx-auto space-y-5">
      {/* Breadcrumb + timer */}
      <div className="flex items-center justify-between gap-3 flex-wrap no-print">
        <div className="flex items-center gap-2">
          <Link href="/notes" className="p-2 rounded-xl hover:bg-muted transition-colors">
            <ArrowLeft size={18} className="text-muted-foreground" />
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <Link href="/notes" className="text-xs uppercase tracking-wide font-semibold text-muted-foreground hover:text-primary">Notes</Link>
            <span className="text-muted-foreground">/</span>
            <span className="font-semibold text-secondary truncate max-w-xs">{note.title}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted rounded-lg px-2.5 py-1">
            <Clock size={12} /> {readingMins}:{readingSecs.toString().padStart(2, '0')} reading
          </span>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted hover:bg-primary/10 hover:text-primary rounded-lg px-2.5 py-1 transition-all border border-border/50"
            title="Export as PDF"
          >
            <Download size={12} /> Export PDF
          </button>
        </div>
      </div>

      {/* Reading progress bar */}
      <div className="bg-card rounded-2xl border border-border/50 p-4">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <p className="text-sm font-semibold text-secondary">
            Reading Progress — {readCount}/{sections.length} sections
            {allRead && <span className="ml-2 text-emerald-600">✓ Complete!</span>}
          </p>
          <div className="flex gap-2 items-center">
            <Button variant="outline" size="sm" onClick={() => readAloud(sections.map((s, i) => `Section ${i + 1}. ${s.heading}. ${s.content}`).join(' '), -1)} className="gap-1.5">
              {speaking && speakingIdx === -1 ? <><Pause size={12} /> Stop</> : <><Volume2 size={12} /> Listen All</>}
            </Button>
            {allRead ? (
              <Button size="sm" onClick={startQuiz} className="gap-1.5 shadow-sm shadow-primary/20">
                <BrainCircuit size={12} /> Take Quiz
              </Button>
            ) : (
              <Button size="sm" variant="outline" disabled className="gap-1.5 opacity-70 cursor-not-allowed">
                <Lock size={12} /> {readCount}/{sections.length} to unlock
              </Button>
            )}
          </div>
        </div>
        <ProgressBar value={readCount} max={sections.length} showPercent />
        {!allRead && (
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <Lock size={10} /> Read all {sections.length} sections to unlock the quiz
          </p>
        )}
      </div>

      {/* Metadata */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="subject" subject={note.subject}>{subjectIcon(note.subject)} {note.subject}</Badge>
        <Badge variant="muted">{note.level}</Badge>
        {note.tags.map(t => <Badge key={t} variant="muted">{t}</Badge>)}
        <span className="ml-auto text-xs text-muted-foreground">{sections.length} sections · {note.readTime}</span>
      </div>

      {/* AI Tip */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
          <Sparkles size={14} className="text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-primary mb-0.5">AI Study Tip</p>
          <p className="text-sm text-muted-foreground leading-relaxed">{note.aiTip}</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-border/50 -mb-2">
        <button
          onClick={() => setActiveTab('content')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all -mb-px ${activeTab === 'content' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          <BookOpen size={14} /> Notes
        </button>
        <button
          onClick={switchToVideos}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all -mb-px ${activeTab === 'videos' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          <Youtube size={14} /> Videos
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all -mb-px ${activeTab === 'chat' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          <MessageCircle size={14} /> Ask AI
          {chatHistory.length > 0 && (
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          )}
        </button>
      </div>

      {/* ── CONTENT TAB ── */}
      {activeTab === 'content' && (
        <div className="space-y-3">
          {sections.map((section, idx) => {
            const isRead = readSections.has(idx);
            const isExpanded = expanded === idx;
            const isAudioActive = speakingIdx === idx && speaking;

            return (
              <motion.div key={idx} layout
                className={`bg-card rounded-2xl border transition-all duration-200 ${isRead ? 'border-emerald-200' : isExpanded ? 'border-primary/30 shadow-sm shadow-primary/5' : 'border-border/50'}`}
              >
                <button onClick={() => setExpanded(isExpanded ? null : idx)} className="w-full flex items-center gap-3 p-4 text-left">
                  <button onClick={e => { e.stopPropagation(); toggleRead(idx); }} className="shrink-0 transition-all hover:scale-110">
                    {isRead
                      ? <CheckCircle2 size={22} className="text-emerald-500" />
                      : <Circle size={22} className="text-muted-foreground hover:text-primary" />}
                  </button>
                  <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${isRead ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-muted text-muted-foreground'}`}>
                    {idx + 1}
                  </span>
                  <span className="flex-1 font-semibold text-secondary text-sm">{section.heading}</span>
                  <Button variant="outline" size="sm"
                    onClick={e => { e.stopPropagation(); readAloud(`${section.heading}. ${section.content} ${section.keyPoints?.join('. ')}`, idx); }}
                    className={`gap-1.5 shrink-0 hidden sm:flex ${isAudioActive ? 'bg-primary text-white border-primary' : ''}`}
                  >
                    {isAudioActive ? <><Pause size={11} /> Stop</> : <><Play size={11} /> Listen</>}
                  </Button>
                  {isExpanded ? <ChevronUp size={16} className="text-muted-foreground shrink-0" /> : <ChevronDown size={16} className="text-muted-foreground shrink-0" />}
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                      <div className="px-5 pb-5 space-y-4 border-t border-border/30 pt-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">{section.content}</p>
                        {(section.keyPoints?.length ?? 0) > 0 && (
                          <div className="bg-primary/3 rounded-xl p-4">
                            <p className="text-xs font-bold uppercase tracking-wider text-primary mb-3 flex items-center gap-1.5">
                              <BookOpen size={11} /> Key Points
                            </p>
                            <ul className="space-y-2">
                              {section.keyPoints!.map((kp, ki) => (
                                <li key={ki} className="flex items-start gap-2 text-sm text-foreground">
                                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />{kp}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <Button size="sm" onClick={() => toggleRead(idx)} variant={isRead ? 'ghost' : 'default'} className={isRead ? 'text-emerald-600 hover:text-emerald-700' : ''}>
                          {isRead ? <><CheckCircle2 size={14} /> Marked as read</> : <><Circle size={14} /> Mark as read</>}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}

          {/* Completion banner */}
          {allRead && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-primary via-primary/90 to-indigo-600 rounded-2xl p-6 text-center text-white shadow-xl shadow-primary/20"
            >
              <p className="text-3xl mb-2">🎉</p>
              <h3 className="font-heading font-bold text-xl mb-2">All sections read!</h3>
              <p className="text-white/80 text-sm mb-4">Ready to test your knowledge with {quiz.length} questions?</p>
              <Button onClick={startQuiz} className="bg-white text-primary hover:bg-white/90 gap-2 shadow-md">
                <BrainCircuit size={16} /> Start Quiz
              </Button>
            </motion.div>
          )}
        </div>
      )}

      {/* ── VIDEOS TAB ── */}
      {activeTab === 'videos' && (
        <div className="space-y-4">
          {videosLoading && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-2xl border border-border/50 overflow-hidden animate-pulse">
                  <div className="aspect-video bg-muted" />
                  <div className="p-3 space-y-2"><div className="h-3.5 bg-muted rounded w-5/6" /><div className="h-3 bg-muted rounded w-1/3" /></div>
                </div>
              ))}
            </div>
          )}
          {!videosLoading && noteVideos && noteVideos.length === 0 && (
            <div className="text-center py-12">
              <Youtube size={28} className="text-muted-foreground/40 mx-auto mb-3" />
              <p className="font-semibold text-secondary mb-1">No videos found</p>
              <p className="text-sm text-muted-foreground">Add your YouTube API key to enable this feature.</p>
            </div>
          )}
          <AnimatePresence>
            {playingVideo && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
                className="bg-card rounded-2xl border border-primary/30 overflow-hidden shadow-lg shadow-primary/10"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/30">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                    <p className="text-sm font-semibold text-secondary truncate">{playingVideo.title}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <a href={`https://www.youtube.com/watch?v=${playingVideo.videoId}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"><ExternalLink size={14} /></a>
                    <button onClick={() => setPlayingVideo(null)} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"><X size={14} /></button>
                  </div>
                </div>
                <div className="aspect-video w-full">
                  <iframe src={`https://www.youtube.com/embed/${playingVideo.videoId}?autoplay=1&rel=0&modestbranding=1`} title={playingVideo.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {!videosLoading && noteVideos && noteVideos.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {noteVideos.map(v => (
                <motion.div key={v.videoId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`group bg-card rounded-2xl border overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5 ${playingVideo?.videoId === v.videoId ? 'border-primary ring-2 ring-primary/20' : 'border-border/50'}`}
                  onClick={() => setPlayingVideo(v)}
                >
                  <div className="relative aspect-video bg-muted overflow-hidden">
                    {v.thumbnail ? <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> : <div className="w-full h-full flex items-center justify-center"><Youtube size={28} className="text-muted-foreground/40" /></div>}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center"><Play size={14} className="text-primary ml-0.5" fill="currentColor" /></div>
                    </div>
                    {playingVideo?.videoId === v.videoId && <div className="absolute top-2 left-2 bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">Playing</div>}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold text-secondary leading-snug line-clamp-2 group-hover:text-primary transition-colors">{v.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{v.channel}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── AI CHAT TAB ── */}
      {activeTab === 'chat' && (
        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden flex flex-col" style={{ height: '520px' }}>
          {/* Chat header */}
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border/50 bg-gradient-to-r from-primary/5 to-indigo-500/5 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bot size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-secondary">AI Tutor</p>
              <p className="text-xs text-muted-foreground">Ask anything about <span className="font-medium">{note.title}</span></p>
            </div>
            {chatHistory.length > 0 && (
              <button
                onClick={() => setChatHistory([])}
                className="ml-auto text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                Clear chat
              </button>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {chatHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Sparkles size={24} className="text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-secondary">Ask about this note</p>
                  <p className="text-sm text-muted-foreground mt-1">I'll answer based on the content of these study notes.</p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {[
                    'Summarise this in simple terms',
                    'What are the most important points?',
                    'Give me a memory trick for this topic',
                    'What exam questions could come up?',
                  ].map(q => (
                    <button
                      key={q}
                      onClick={() => { setChatInput(q); }}
                      className="px-3 py-1.5 rounded-full bg-muted hover:bg-primary/10 hover:text-primary text-xs text-muted-foreground border border-border/50 transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              chatHistory.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-muted'}`}>
                    {msg.role === 'user' ? <UserIcon size={13} /> : <Bot size={13} className="text-primary" />}
                  </div>
                  <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-white rounded-tr-sm'
                      : 'bg-muted text-foreground rounded-tl-sm'
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))
            )}
            {chatLoading && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Bot size={13} className="text-primary" />
                </div>
                <div className="bg-muted px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendChat} className="px-4 py-3 border-t border-border/50 flex items-end gap-2 shrink-0">
            <textarea
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
              placeholder="Ask about this note... (Enter to send)"
              rows={1}
              className="flex-1 input-field resize-none text-sm py-2.5 min-h-[42px] max-h-[120px]"
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || chatLoading}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-white hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm shadow-primary/20 shrink-0"
            >
              {chatLoading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            </button>
          </form>
        </div>
      )}

      {/* ── FULLSCREEN QUIZ OVERLAY ── */}
      <AnimatePresence>
        {showQuiz && quiz.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-background flex flex-col"
          >
            {/* Quiz header */}
            <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-border bg-card shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0">
                  <BrainCircuit size={16} className="text-white" />
                </div>
                <div className="min-w-0">
                  <p className="font-heading font-bold text-secondary text-sm truncate max-w-[180px] md:max-w-xs">{note.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {quizState.submitted ? `${quizState.score}/${quiz.length} correct` : `Question ${quizState.current + 1} of ${quiz.length}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {!quizState.submitted && (
                  <div className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-xl text-sm font-mono">
                    <Timer size={12} className="text-primary" />
                    <span className="font-semibold tabular-nums">{quizMins}:{quizSecs}</span>
                  </div>
                )}
                {!quizState.submitted && (
                  <button onClick={() => setShowQuiz(false)} className="p-2 rounded-xl hover:bg-muted transition-colors" title="Exit quiz (Esc)">
                    <X size={18} className="text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>

            {/* Progress bar */}
            {!quizState.submitted && (
              <div className="h-1.5 bg-muted shrink-0">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${(quizState.current / quiz.length) * 100}%` }}
                />
              </div>
            )}

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto flex justify-center p-5 md:p-10">
              <div className="w-full max-w-2xl">
                {!quizState.submitted ? (
                  /* ── Question view ── */
                  <div>
                    {/* Dot progress */}
                    <div className="flex gap-1.5 mb-8 flex-wrap">
                      {quiz.map((_, i) => (
                        <div key={i} className={`h-2 rounded-full transition-all flex-1 min-w-[10px] max-w-[28px] ${
                          i < quizState.current ? 'bg-primary' : i === quizState.current ? 'bg-primary/50' : 'bg-muted'
                        }`} />
                      ))}
                    </div>

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={quizState.current}
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -24 }}
                        transition={{ duration: 0.18 }}
                      >
                        <h2 className="font-heading font-bold text-xl md:text-2xl text-secondary mb-8 leading-snug">
                          {quiz[quizState.current].question}
                        </h2>

                        <div className="space-y-3 mb-8">
                          {quiz[quizState.current].options.map((opt, i) => {
                            const selected = quizState.answers[quizState.current] === i;
                            return (
                              <motion.button
                                key={i}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => selectAnswer(i)}
                                className={`w-full text-left px-5 py-4 rounded-2xl border-2 text-sm md:text-base transition-all flex items-center gap-4 ${
                                  selected
                                    ? 'border-primary bg-primary/5 text-primary font-semibold shadow-md shadow-primary/10'
                                    : 'border-border/50 hover:border-primary/40 hover:bg-muted/50 text-foreground'
                                }`}
                              >
                                <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${selected ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                                  {['A', 'B', 'C', 'D'][i]}
                                </span>
                                {opt}
                              </motion.button>
                            );
                          })}
                        </div>
                      </motion.div>
                    </AnimatePresence>

                    <div className="flex items-center justify-between pt-2">
                      <p className="text-xs text-muted-foreground hidden sm:block">Press 1–4 to select · Enter to continue · Esc to exit</p>
                      <Button
                        onClick={nextQuestion}
                        disabled={quizState.answers[quizState.current] === null || quizState.answers[quizState.current] === undefined}
                        size="lg"
                        className="gap-2 ml-auto shadow-md shadow-primary/20"
                      >
                        {quizState.current === quiz.length - 1 ? '✓ Submit Quiz' : 'Next →'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* ── Results view ── */
                  <div className="space-y-6">
                    {/* Mascot + grade banner */}
                    <div className="text-center">
                      <div className="flex justify-center mb-2">
                        <Mascot mood={quizMascotMood} size={110} message={quizMascotMsg} />
                      </div>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.85, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: 0.35, type: 'spring', stiffness: 200 }}
                        className={`bg-gradient-to-r ${gradeBg} rounded-3xl p-6 text-white mt-5`}
                      >
                        <p className="font-heading font-bold text-5xl mb-1">{scorePercent}%</p>
                        <p className="text-white/80 text-sm">{quizState.score} / {quiz.length} correct · Grade <span className="font-bold">{grade?.grade}</span></p>
                        <p className="font-semibold mt-1 text-white/90">{gradeMsg}</p>
                        <p className="text-white/60 text-xs mt-2">
                          <Timer size={10} className="inline mr-1" />Time taken: {quizMins}:{quizSecs}
                        </p>
                      </motion.div>
                    </div>

                    {/* Answer breakdown */}
                    <div>
                      <h3 className="font-heading font-semibold text-secondary mb-4 flex items-center gap-2">
                        <Trophy size={16} className="text-amber-500" /> Answer Review
                      </h3>
                      <div className="space-y-3">
                        {quiz.map((q, i) => {
                          const userAns = quizState.answers[i];
                          const correct = userAns === q.correct;
                          return (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.04 }}
                              className={`rounded-xl border p-4 ${correct ? 'border-emerald-500/25 bg-emerald-500/8' : 'border-red-500/25 bg-red-500/8'}`}
                            >
                              <p className="text-sm font-semibold text-foreground mb-2">{i + 1}. {q.question}</p>
                              <div className="flex flex-wrap gap-1.5 mb-1.5">
                                <span className={`badge text-xs font-semibold ${correct ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/15 text-red-600 dark:text-red-400'}`}>
                                  {correct ? '✓ Correct' : `✗ You: ${q.options[userAns!]}`}
                                </span>
                                {!correct && (
                                  <span className="badge text-xs bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">✓ Answer: {q.options[q.correct]}</span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground italic leading-relaxed">{q.explanation}</p>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pb-8">
                      <Button variant="outline" onClick={resetQuiz} className="flex-1 gap-2">
                        <RotateCcw size={14} /> Retry Quiz
                      </Button>
                      <Button onClick={() => setShowQuiz(false)} className="flex-1 gap-2">
                        <BookOpen size={14} /> Back to Note
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </>
  );
}
