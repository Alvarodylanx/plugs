'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Circle, Play, Pause, Square, Sparkles, ChevronDown, ChevronUp, RotateCcw, Volume2, BrainCircuit } from 'lucide-react';
import { notes as notesApi } from '@/lib/api';
import { getUser } from '@/lib/auth';
import { subjectColor, subjectIcon, gradeFromPercentage } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Button } from '@/components/ui/button';
import type { Note, NoteSection, QuizQuestion } from '@/types';

export default function NoteViewerPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [readSections, setReadSections] = useState<Set<number>>(new Set());
  const [expanded, setExpanded] = useState<number | null>(0);
  const [speaking, setSpeaking] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizState, setQuizState] = useState({ current: 0, answers: [] as (number | null)[], submitted: false, score: 0 });
  const [loading, setLoading] = useState(true);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    Promise.all([notesApi.get(id), notesApi.getProgress(id)]).then(([n, prog]) => {
      const noteData = n as Note;
      setNote(noteData);
      const readSet = new Set<number>((prog as any[]).map(p => p.sectionIdx));
      setReadSections(readSet);
      setLoading(false);
    });
    return () => { window.speechSynthesis?.cancel(); };
  }, [id]);

  function toggleRead(idx: number) {
    const next = new Set(readSections);
    if (next.has(idx)) next.delete(idx); else { next.add(idx); notesApi.markRead(id, idx); }
    setReadSections(next);
    if (!next.has(idx)) return;
    const sections = note?.sections || [];
    const nextUnread = sections.findIndex((_, i) => i > idx && !next.has(i));
    if (nextUnread !== -1) setExpanded(nextUnread);
  }

  function readAloud(text: string, idx: number) {
    window.speechSynthesis.cancel();
    if (speaking && speakingIdx === idx) { setSpeaking(false); setSpeakingIdx(null); return; }
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.95; utt.pitch = 1;
    const voices = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('en'));
    if (voices.length) utt.voice = voices[0];
    utt.onend = () => { setSpeaking(false); setSpeakingIdx(null); };
    window.speechSynthesis.speak(utt);
    setSpeaking(true); setSpeakingIdx(idx);
  }

  function readAll() {
    if (!note) return;
    const allText = note.sections.map((s, i) => `Section ${i + 1}. ${s.heading}. ${s.content} Key points: ${s.keyPoints?.join('. ')}`).join(' ');
    readAloud(allText, -1);
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
      const score = answers.reduce((acc, ans, i) => (ans !== null && ans === questions[i].correct ? (acc as number) + 1 : acc) as number, 0) as number;
      setQuizState(s => ({ ...s, submitted: true, score }));
      getUser().then(u => { if (u) notesApi.saveQuiz(id, score, questions.length); });
    }
  }

  function resetQuiz() {
    setQuizState({ current: 0, answers: new Array(note?.quiz?.length || 0).fill(null), submitted: false, score: 0 });
  }

  if (loading) return <div className="space-y-4 animate-pulse"><div className="h-10 bg-muted rounded-xl w-3/4" /><div className="h-4 bg-muted rounded w-1/4" /><div className="h-40 bg-muted rounded-2xl" /></div>;
  if (!note) return <div className="text-center py-20"><p className="text-muted-foreground">Note not found.</p></div>;

  const sections = note.sections as NoteSection[];
  const quiz = note.quiz as QuizQuestion[];
  const readCount = readSections.size;
  const allRead = readCount === sections.length;
  const grade = quizState.submitted ? gradeFromPercentage(Math.round(quizState.score / quiz.length * 100)) : null;

  return (
    <div className="animate-enter max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link href="/notes" className="p-2 rounded-xl hover:bg-muted transition-colors">
          <ArrowLeft size={18} className="text-muted-foreground" />
        </Link>
        <div className="flex items-center gap-2 text-sm">
          <Link href="/notes" className="text-xs uppercase tracking-wide font-semibold text-muted-foreground hover:text-primary">My Notes</Link>
          <span className="text-muted-foreground">/</span>
          <span className="font-semibold text-secondary truncate">{note.title}</span>
        </div>
      </div>

      {/* Reading progress */}
      <div className="bg-card rounded-2xl border border-border/50 p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-secondary">Reading Progress — {readCount}/{sections.length} sections</p>
          <Button variant="default" size="sm" onClick={readAll} className="gap-2">
            <Volume2 size={14} />
            {speaking && speakingIdx === -1 ? 'Stop' : 'Listen All'}
          </Button>
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
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles size={14} className="text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-primary mb-0.5">AI Study Tip</p>
          <p className="text-sm text-muted-foreground leading-relaxed">{note.aiTip}</p>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-3">
        {sections.map((section, idx) => {
          const isRead = readSections.has(idx);
          const isExpanded = expanded === idx;
          const isActiveAudio = speakingIdx === idx && speaking;

          return (
            <div key={idx} className={`bg-card rounded-2xl border transition-all duration-200 ${isExpanded ? 'border-primary/30 shadow-sm' : 'border-border/50'}`}>
              {/* Section header */}
              <button
                onClick={() => setExpanded(isExpanded ? null : idx)}
                className="w-full flex items-center gap-3 p-4 text-left"
              >
                <button
                  onClick={e => { e.stopPropagation(); toggleRead(idx); }}
                  className="shrink-0 transition-all"
                >
                  {isRead
                    ? <CheckCircle2 size={22} className="text-primary" />
                    : <Circle size={22} className="text-muted-foreground hover:text-primary" />
                  }
                </button>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="w-6 h-6 rounded-full bg-muted text-xs font-bold text-muted-foreground flex items-center justify-center">{idx + 1}</span>
                </div>
                <span className="flex-1 font-semibold text-secondary text-sm">{section.heading}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={e => { e.stopPropagation(); readAloud(`${section.heading}. ${section.content} ${section.keyPoints?.join('. ')}`, idx); }}
                  className={`gap-1.5 shrink-0 ${isActiveAudio ? 'bg-primary text-white' : ''}`}
                >
                  {isActiveAudio ? <Pause size={12} /> : <Play size={12} />}
                  {isActiveAudio ? 'Stop' : 'Listen'}
                </Button>
                {isExpanded ? <ChevronUp size={16} className="text-muted-foreground shrink-0" /> : <ChevronDown size={16} className="text-muted-foreground shrink-0" />}
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 space-y-4 border-t border-border/30 pt-4">
                      <p className="text-sm text-muted-foreground leading-relaxed">{section.content}</p>
                      {section.keyPoints && section.keyPoints.length > 0 && (
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Key Points</p>
                          <ul className="space-y-1.5">
                            {section.keyPoints.map((kp, ki) => (
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
                        className={isRead ? 'bg-muted text-muted-foreground border border-border hover:bg-muted' : ''}
                        variant={isRead ? 'ghost' : 'default'}
                      >
                        {isRead ? <><CheckCircle2 size={14} className="text-primary" /> Marked as read</> : <><Circle size={14} /> Mark as read</>}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Completion banner */}
      {allRead && !showQuiz && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary to-indigo-600 rounded-2xl p-6 text-center text-white shadow-xl shadow-primary/20"
        >
          <p className="text-2xl mb-2">🎉</p>
          <h3 className="font-heading font-bold text-xl mb-2">All sections read!</h3>
          <p className="text-white/80 text-sm mb-4">Ready to test your knowledge with {quiz.length} questions?</p>
          <Button onClick={() => { setShowQuiz(true); setQuizState({ current: 0, answers: new Array(quiz.length).fill(null), submitted: false, score: 0 }); }}
            className="bg-white text-primary hover:bg-white/90 gap-2 shadow-md"
          >
            <BrainCircuit size={16} /> Take Quiz
          </Button>
        </motion.div>
      )}

      {/* Quiz */}
      {showQuiz && quiz.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border/50 p-6"
        >
          {!quizState.submitted ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm font-semibold text-muted-foreground">Question {quizState.current + 1} of {quiz.length}</p>
                <div className="flex gap-1.5">
                  {quiz.map((_, i) => (
                    <div key={i} className={`w-2.5 h-2.5 rounded-full transition-colors ${i < quizState.current ? 'bg-primary' : i === quizState.current ? 'bg-primary/50 ring-2 ring-primary/30' : 'bg-muted'}`} />
                  ))}
                </div>
              </div>
              <h3 className="font-heading font-semibold text-secondary text-lg mb-5 leading-snug">{quiz[quizState.current].question}</h3>
              <div className="space-y-3 mb-6">
                {quiz[quizState.current].options.map((opt, i) => {
                  const selected = quizState.answers[quizState.current] === i;
                  return (
                    <button key={i} onClick={() => selectAnswer(i)}
                      className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${selected ? 'border-primary bg-primary/5 text-primary font-semibold' : 'border-border/50 hover:border-primary/50 hover:bg-muted/50 text-foreground'}`}
                    >
                      <span className="font-bold mr-3">{['A', 'B', 'C', 'D'][i]}.</span>{opt}
                    </button>
                  );
                })}
              </div>
              <Button
                onClick={nextQuestion}
                disabled={quizState.answers[quizState.current] === null || quizState.answers[quizState.current] === undefined}
                className="w-full"
              >
                {quizState.current === quiz.length - 1 ? 'Submit Quiz' : 'Next Question'}
              </Button>
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="w-24 h-24 rounded-full bg-primary/10 border-4 border-primary/30 flex items-center justify-center mx-auto mb-4">
                  <span className="font-heading font-bold text-3xl text-primary">{quizState.score}/{quiz.length}</span>
                </div>
                <h3 className="font-heading font-bold text-2xl text-secondary">Quiz Complete!</h3>
                <p className={`text-lg font-bold mt-2 ${grade?.color}`}>{Math.round(quizState.score / quiz.length * 100)}% — Grade {grade?.grade}</p>
              </div>
              <div className="space-y-3 mb-6">
                {quiz.map((q, i) => {
                  const userAns = quizState.answers[i];
                  const correct = userAns === q.correct;
                  return (
                    <div key={i} className={`rounded-xl border p-4 ${correct ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
                      <p className="text-sm font-semibold text-foreground mb-2">{i + 1}. {q.question}</p>
                      <p className="text-xs text-muted-foreground">
                        <span className={correct ? 'text-emerald-600 font-semibold' : 'text-red-600 font-semibold'}>
                          {correct ? '✓ Correct' : `✗ You chose: ${q.options[userAns!]}`}
                        </span>
                        {!correct && <span className="text-emerald-600 font-semibold ml-2"> · Correct: {q.options[q.correct]}</span>}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1.5 italic">{q.explanation}</p>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={resetQuiz} className="flex-1 gap-2"><RotateCcw size={14} /> Retry Quiz</Button>
                <Button onClick={() => setShowQuiz(false)} className="flex-1">Back to Note</Button>
              </div>
            </>
          )}
        </motion.div>
      )}

      {/* Take quiz button if not all read yet */}
      {!allRead && !showQuiz && (
        <div className="text-center">
          <Button variant="ghost" onClick={() => { setShowQuiz(true); setQuizState({ current: 0, answers: new Array(quiz.length).fill(null), submitted: false, score: 0 }); }} className="gap-2">
            <BrainCircuit size={16} /> Skip to Quiz
          </Button>
        </div>
      )}
    </div>
  );
}
