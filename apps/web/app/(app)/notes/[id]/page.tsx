'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, CheckCircle2, Circle, Play, Pause, Sparkles,
  ChevronDown, ChevronUp, RotateCcw, Volume2, BrainCircuit,
  Trophy, Clock, BookOpen, X, Youtube, ExternalLink, Loader2,
} from 'lucide-react';
import { notes as notesApi, videos as videosApi } from '@/lib/api';
import { getUser } from '@/lib/auth';
import { subjectIcon, gradeFromPercentage } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Button } from '@/components/ui/button';
import type { Note, NoteSection, QuizQuestion, VideoResult } from '@/types';

const GRADE_BANNERS: Record<string, { bg: string; emoji: string; msg: string }> = {
  'A*': { bg: 'from-emerald-500 to-teal-500', emoji: '🏆', msg: 'Exceptional! Perfect score!' },
  'A':  { bg: 'from-green-500 to-emerald-500', emoji: '🎉', msg: 'Excellent work! Keep it up!' },
  'B':  { bg: 'from-blue-500 to-indigo-500', emoji: '⭐', msg: 'Great job! Nearly there!' },
  'C':  { bg: 'from-amber-500 to-yellow-500', emoji: '👍', msg: 'Good effort. Review and retry!' },
  'D':  { bg: 'from-orange-500 to-amber-500', emoji: '💪', msg: 'Keep practicing. You\'ll improve!' },
  'F':  { bg: 'from-rose-500 to-red-500', emoji: '📚', msg: 'Review the note and try again!' },
};

export default function NoteViewerPage() {
  const { id } = useParams<{ id: string }>();
  const [note, setNote] = useState<Note | null>(null);
  const [readSections, setReadSections] = useState<Set<number>>(new Set());
  const [expanded, setExpanded] = useState<number | null>(0);
  const [speaking, setSpeaking] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizState, setQuizState] = useState({ current: 0, answers: [] as (number | null)[], submitted: false, score: 0 });
  const [loading, setLoading] = useState(true);
  const [readingTime, setReadingTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'videos'>('content');
  const [noteVideos, setNoteVideos] = useState<VideoResult[] | null>(null);
  const [videosLoading, setVideosLoading] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<VideoResult | null>(null);

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
    };
  }, [id]);

  // Track reading time
  useEffect(() => {
    timerRef.current = setInterval(() => setReadingTime(t => t + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  // Keyboard nav for quiz
  useEffect(() => {
    if (!showQuiz || quizState.submitted) return;
    function handler(e: KeyboardEvent) {
      if (e.key >= '1' && e.key <= '4') {
        const idx = parseInt(e.key) - 1;
        selectAnswer(idx);
      }
      if (e.key === 'Enter') {
        const ans = quizState.answers[quizState.current];
        if (ans !== null && ans !== undefined) nextQuestion();
      }
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
      // Auto-expand next unread section
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
      const score = (answers as (number | null)[]).reduce((acc: number, ans, i) => {
        return (ans !== null && ans === (questions as QuizQuestion[])[i].correct) ? acc + 1 : acc;
      }, 0);
      setQuizState(s => ({ ...s, submitted: true, score }));
      getUser().then(u => { if (u) notesApi.saveQuiz(id, score, questions.length); });
    }
  }

  function resetQuiz() {
    setQuizState({ current: 0, answers: new Array(note?.quiz?.length || 0).fill(null), submitted: false, score: 0 });
  }

  async function switchToVideos() {
    setActiveTab('videos');
    if (noteVideos !== null) return;
    setVideosLoading(true);
    try {
      const q = `${note!.title} ${note!.subject} study`;
      const res = await videosApi.search(q, 6) as VideoResult[];
      setNoteVideos(res);
    } catch {
      setNoteVideos([]);
    } finally {
      setVideosLoading(false);
    }
  }

  function startQuiz() {
    setShowQuiz(true);
    setQuizState({ current: 0, answers: new Array(note?.quiz?.length || 0).fill(null), submitted: false, score: 0 });
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
  const grade = quizState.submitted ? gradeFromPercentage(Math.round(quizState.score / quiz.length * 100)) : null;
  const gradeBanner = grade ? (GRADE_BANNERS[grade.grade] || GRADE_BANNERS['C']) : null;
  const readingMins = Math.floor(readingTime / 60);
  const readingSecs = readingTime % 60;

  return (
    <div className="animate-enter max-w-4xl mx-auto space-y-5">
      {/* Breadcrumb + timer */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
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
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted rounded-lg px-2.5 py-1">
          <Clock size={12} /> {readingMins}:{readingSecs.toString().padStart(2, '0')} reading
        </span>
      </div>

      {/* Reading progress bar */}
      <div className="bg-card rounded-2xl border border-border/50 p-4">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <p className="text-sm font-semibold text-secondary">
            Reading Progress — {readCount}/{sections.length} sections
            {allRead && <span className="ml-2 text-emerald-600">✓ Complete!</span>}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => readAloud(sections.map((s, i) => `Section ${i + 1}. ${s.heading}. ${s.content}`).join(' '), -1)} className="gap-1.5">
              {speaking && speakingIdx === -1 ? <><Pause size={12} /> Stop</> : <><Volume2 size={12} /> Listen All</>}
            </Button>
            {!showQuiz && (
              <Button size="sm" onClick={startQuiz} className="gap-1.5">
                <BrainCircuit size={12} /> Take Quiz
              </Button>
            )}
          </div>
        </div>
        <ProgressBar value={readCount} max={sections.length} showPercent />
      </div>

      {/* Metadata */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="subject" subject={note.subject}>{subjectIcon(note.subject)} {note.subject}</Badge>
        <Badge variant="muted">{note.level}</Badge>
        {note.tags.map(t => <Badge key={t} variant="muted">{t}</Badge>)}
        <span className="ml-auto text-xs text-muted-foreground">{sections.length} sections · {note.readTime}</span>
      </div>

      {/* AI Tip */}
      <div className="bg-gradient-to-r from-primary/5 to-indigo-50 border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
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
        {(['content', 'videos'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => tab === 'videos' ? switchToVideos() : setActiveTab('content')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all -mb-px ${
              activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'content' ? <><BookOpen size={14} /> Notes</> : <><Youtube size={14} /> Videos</>}
          </button>
        ))}
      </div>

      {/* ── CONTENT TAB ── */}
      {activeTab === 'content' && <div className="space-y-3">
        {sections.map((section, idx) => {
          const isRead = readSections.has(idx);
          const isExpanded = expanded === idx;
          const isAudioActive = speakingIdx === idx && speaking;

          return (
            <motion.div
              key={idx}
              layout
              className={`bg-card rounded-2xl border transition-all duration-200 ${isRead ? 'border-emerald-200' : isExpanded ? 'border-primary/30 shadow-sm shadow-primary/5' : 'border-border/50'}`}
            >
              <button
                onClick={() => setExpanded(isExpanded ? null : idx)}
                className="w-full flex items-center gap-3 p-4 text-left"
              >
                <button
                  onClick={e => { e.stopPropagation(); toggleRead(idx); }}
                  className="shrink-0 transition-all hover:scale-110"
                >
                  {isRead
                    ? <CheckCircle2 size={22} className="text-emerald-500" />
                    : <Circle size={22} className="text-muted-foreground hover:text-primary" />}
                </button>
                <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${isRead ? 'bg-emerald-100 text-emerald-600' : 'bg-muted text-muted-foreground'}`}>
                  {idx + 1}
                </span>
                <span className="flex-1 font-semibold text-secondary text-sm">{section.heading}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={e => {
                    e.stopPropagation();
                    readAloud(`${section.heading}. ${section.content} ${section.keyPoints?.join('. ')}`, idx);
                  }}
                  className={`gap-1.5 shrink-0 hidden sm:flex ${isAudioActive ? 'bg-primary text-white border-primary' : ''}`}
                >
                  {isAudioActive ? <><Pause size={11} /> Stop</> : <><Play size={11} /> Listen</>}
                </Button>
                {isExpanded ? <ChevronUp size={16} className="text-muted-foreground shrink-0" /> : <ChevronDown size={16} className="text-muted-foreground shrink-0" />}
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
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
                                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                                {kp}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <Button
                        size="sm"
                        onClick={() => toggleRead(idx)}
                        variant={isRead ? 'ghost' : 'default'}
                        className={isRead ? 'text-emerald-600 hover:text-emerald-700' : ''}
                      >
                        {isRead ? <><CheckCircle2 size={14} /> Marked as read</> : <><Circle size={14} /> Mark as read</>}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>}

      {/* Completion banner */}
      {activeTab === 'content' && allRead && !showQuiz && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary via-primary/90 to-indigo-600 rounded-2xl p-6 text-center text-white shadow-xl shadow-primary/20"
        >
          <p className="text-3xl mb-2">🎉</p>
          <h3 className="font-heading font-bold text-xl mb-2">All sections read!</h3>
          <p className="text-white/80 text-sm mb-4">Ready to test your knowledge with {quiz.length} questions?</p>
          <Button onClick={startQuiz} className="bg-white text-primary hover:bg-white/90 gap-2 shadow-md">
            <BrainCircuit size={16} /> Take Quiz
          </Button>
        </motion.div>
      )}

      {/* ── VIDEOS TAB ── */}
      {activeTab === 'videos' && (
        <div className="space-y-4">
          {videosLoading && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-2xl border border-border/50 overflow-hidden animate-pulse">
                  <div className="aspect-video bg-muted" />
                  <div className="p-3 space-y-2">
                    <div className="h-3.5 bg-muted rounded w-5/6" />
                    <div className="h-3 bg-muted rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!videosLoading && noteVideos && noteVideos.length === 0 && (
            <div className="text-center py-12">
              <Youtube size={28} className="text-muted-foreground/40 mx-auto mb-3" />
              <p className="font-semibold text-secondary mb-1">No videos found</p>
              <p className="text-sm text-muted-foreground">
                Add your YouTube API key to <code className="bg-muted px-1 rounded text-xs">apps/api/.env</code> to enable this feature.
              </p>
            </div>
          )}

          {/* Inline player */}
          <AnimatePresence>
            {playingVideo && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                className="bg-card rounded-2xl border border-primary/30 overflow-hidden shadow-lg shadow-primary/10"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/30">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                    <p className="text-sm font-semibold text-secondary truncate">{playingVideo.title}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <a
                      href={`https://www.youtube.com/watch?v=${playingVideo.videoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    >
                      <ExternalLink size={14} />
                    </a>
                    <button
                      onClick={() => setPlayingVideo(null)}
                      className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
                <div className="aspect-video w-full">
                  <iframe
                    src={`https://www.youtube.com/embed/${playingVideo.videoId}?autoplay=1&rel=0&modestbranding=1`}
                    title={playingVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Video grid */}
          {!videosLoading && noteVideos && noteVideos.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {noteVideos.map(v => (
                <motion.div
                  key={v.videoId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`group bg-card rounded-2xl border overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5 ${
                    playingVideo?.videoId === v.videoId ? 'border-primary ring-2 ring-primary/20' : 'border-border/50'
                  }`}
                  onClick={() => setPlayingVideo(v)}
                >
                  <div className="relative aspect-video bg-muted overflow-hidden">
                    {v.thumbnail ? (
                      <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Youtube size={28} className="text-muted-foreground/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center">
                        <Play size={14} className="text-primary ml-0.5" fill="currentColor" />
                      </div>
                    </div>
                    {playingVideo?.videoId === v.videoId && (
                      <div className="absolute top-2 left-2 bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        Playing
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold text-secondary leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                      {v.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{v.channel}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── QUIZ ── */}
      {activeTab === 'content' && showQuiz && quiz.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border/50 overflow-hidden"
        >
          {/* Quiz header */}
          <div className="bg-gradient-to-r from-indigo-500 to-violet-600 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <BrainCircuit size={18} />
              <span className="font-heading font-bold">Quiz Time</span>
              {!quizState.submitted && (
                <span className="text-white/70 text-sm ml-2">
                  Question {quizState.current + 1} / {quiz.length}
                </span>
              )}
            </div>
            {!quizState.submitted && (
              <button onClick={() => setShowQuiz(false)} className="text-white/70 hover:text-white transition-colors">
                <X size={18} />
              </button>
            )}
          </div>

          <div className="p-6">
            {!quizState.submitted ? (
              <>
                {/* Progress dots */}
                <div className="flex gap-1.5 mb-6">
                  {quiz.map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full flex-1 transition-all ${
                      i < quizState.current ? 'bg-primary' :
                      i === quizState.current ? 'bg-primary/50' : 'bg-muted'
                    }`} />
                  ))}
                </div>

                <h3 className="font-heading font-semibold text-secondary text-lg mb-5 leading-snug">
                  {quiz[quizState.current].question}
                </h3>

                <div className="space-y-3 mb-6">
                  {quiz[quizState.current].options.map((opt, i) => {
                    const selected = quizState.answers[quizState.current] === i;
                    return (
                      <motion.button
                        key={i}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => selectAnswer(i)}
                        className={`w-full text-left px-4 py-3.5 rounded-xl border text-sm transition-all flex items-center gap-3 ${
                          selected
                            ? 'border-primary bg-primary/5 text-primary font-semibold shadow-sm shadow-primary/10'
                            : 'border-border/50 hover:border-primary/40 hover:bg-muted/50 text-foreground'
                        }`}
                      >
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          selected ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                        }`}>
                          {['A', 'B', 'C', 'D'][i]}
                        </span>
                        {opt}
                      </motion.button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Press 1–4 to select · Enter to continue</p>
                  <Button
                    onClick={nextQuestion}
                    disabled={quizState.answers[quizState.current] === null || quizState.answers[quizState.current] === undefined}
                    className="gap-2"
                  >
                    {quizState.current === quiz.length - 1 ? 'Submit Quiz' : 'Next →'}
                  </Button>
                </div>
              </>
            ) : (
              /* Quiz Results */
              <>
                {gradeBanner && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`bg-gradient-to-r ${gradeBanner.bg} rounded-2xl p-6 text-center text-white mb-6`}
                  >
                    <p className="text-4xl mb-2">{gradeBanner.emoji}</p>
                    <p className="font-heading font-bold text-2xl">{Math.round(quizState.score / quiz.length * 100)}%</p>
                    <p className="text-white/80 text-sm mt-1">{gradeBanner.msg}</p>
                    <p className="font-bold text-xl mt-1">Grade {grade?.grade}</p>
                  </motion.div>
                )}

                <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                  {quiz.map((q, i) => {
                    const userAns = quizState.answers[i];
                    const correct = userAns === q.correct;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`rounded-xl border p-4 ${correct ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}
                      >
                        <p className="text-sm font-semibold text-foreground mb-2">{i + 1}. {q.question}</p>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          <span className={`badge text-xs font-semibold ${correct ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {correct ? '✓ Correct' : `✗ You: ${q.options[userAns!]}`}
                          </span>
                          {!correct && (
                            <span className="badge text-xs bg-emerald-100 text-emerald-700">
                              ✓ Answer: {q.options[q.correct]}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground italic leading-relaxed">{q.explanation}</p>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={resetQuiz} className="flex-1 gap-2">
                    <RotateCcw size={14} /> Retry Quiz
                  </Button>
                  <Button onClick={() => setShowQuiz(false)} className="flex-1">Back to Note</Button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
