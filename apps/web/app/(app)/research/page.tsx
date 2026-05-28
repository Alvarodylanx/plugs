'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, BookOpen, Globe, ExternalLink, Save, Loader2,
  Sparkles, X, CheckCircle2, ChevronRight, BrainCircuit,
  Clock, Tag, Lightbulb, CheckCircle, ChevronDown,
} from 'lucide-react';
import { research as researchApi, notes as notesApi } from '@/lib/api';
import { subjectIcon } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { SUBJECTS } from '@/types';

type WikiResult = { title: string; snippet: string; wordcount: number; pageid: number };
type QuizQuestion = { question: string; options: string[]; correct: number; explanation: string };
type WikiArticle = {
  title: string; summary: string; thumbnail: string | null; url: string;
  sections: { heading: string; content: string; keyPoints: string[] }[];
  readTime: string; level: string; tags: string[]; aiTip: string; quiz: QuizQuestion[];
};

const SITES = [
  {
    category: 'All Subjects', emoji: '🌐',
    sites: [
      { name: 'Khan Academy', url: 'https://www.khanacademy.org', desc: 'Free lessons in maths, science, computing & more', emoji: '🎓' },
      { name: 'BBC Bitesize', url: 'https://www.bbc.co.uk/bitesize', desc: 'Revision guides & practice questions for all levels', emoji: '📺' },
      { name: 'Wikipedia', url: 'https://en.wikipedia.org', desc: 'The world\'s largest free encyclopedia', emoji: '📖' },
      { name: 'Britannica', url: 'https://www.britannica.com', desc: 'Authoritative encyclopaedia articles', emoji: '🏛️' },
      { name: 'OpenStax', url: 'https://openstax.org', desc: 'Free, peer-reviewed open textbooks', emoji: '📚' },
    ],
  },
  {
    category: 'Mathematics', emoji: '📐',
    sites: [
      { name: 'Maths is Fun', url: 'https://www.mathsisfun.com', desc: 'Clear explanations with worked examples', emoji: '🔢' },
      { name: 'Desmos', url: 'https://www.desmos.com', desc: 'Interactive graphing calculator & activities', emoji: '📈' },
      { name: 'Wolfram Alpha', url: 'https://www.wolframalpha.com', desc: 'Step-by-step maths computations', emoji: '🧮' },
      { name: 'Math Stack Exchange', url: 'https://math.stackexchange.com', desc: 'Community Q&A for maths problems', emoji: '❓' },
    ],
  },
  {
    category: 'Sciences', emoji: '🔬',
    sites: [
      { name: 'Physics Classroom', url: 'https://www.physicsclassroom.com', desc: 'Physics concepts, simulations & practice', emoji: '⚡' },
      { name: 'Chem LibreTexts', url: 'https://chem.libretexts.org', desc: 'Open-access chemistry textbooks', emoji: '🧪' },
      { name: 'Biology Online', url: 'https://www.biology-online.org', desc: 'Biology glossary, tutorials & quizzes', emoji: '🧬' },
      { name: 'Revision Science', url: 'https://revisionscience.com', desc: 'GCSE & A-Level science revision', emoji: '🔭' },
    ],
  },
  {
    category: 'Humanities', emoji: '📜',
    sites: [
      { name: 'Sparknotes', url: 'https://www.sparknotes.com', desc: 'Literature, history & essay guides', emoji: '✍️' },
      { name: 'History.com', url: 'https://www.history.com', desc: 'Detailed articles on historical events', emoji: '🏛️' },
      { name: 'S-Cool', url: 'https://www.s-cool.co.uk', desc: 'A-Level revision for all humanities subjects', emoji: '🎯' },
      { name: 'Econlib', url: 'https://www.econlib.org', desc: 'Encyclopaedia of economics & liberty', emoji: '💹' },
    ],
  },
  {
    category: 'Computer Science', emoji: '💻',
    sites: [
      { name: 'CS50', url: 'https://cs50.harvard.edu', desc: 'Harvard\'s free intro to computer science', emoji: '🖥️' },
      { name: 'W3Schools', url: 'https://www.w3schools.com', desc: 'Web technology reference & tutorials', emoji: '🌐' },
      { name: 'GeeksforGeeks', url: 'https://www.geeksforgeeks.org', desc: 'Data structures, algorithms & CS concepts', emoji: '⚙️' },
      { name: 'CrashCourse', url: 'https://www.youtube.com/@crashcourse', desc: 'YouTube series on CS, science & humanities', emoji: '🚀' },
    ],
  },
];

const SECTION_COLORS = [
  'from-indigo-50 to-blue-50 border-indigo-100',
  'from-violet-50 to-purple-50 border-violet-100',
  'from-emerald-50 to-teal-50 border-emerald-100',
  'from-amber-50 to-yellow-50 border-amber-100',
  'from-rose-50 to-pink-50 border-rose-100',
  'from-sky-50 to-cyan-50 border-sky-100',
  'from-orange-50 to-red-50 border-orange-100',
];
const SECTION_ACCENT = ['text-indigo-600', 'text-violet-600', 'text-emerald-600', 'text-amber-600', 'text-rose-600', 'text-sky-600', 'text-orange-600'];
const SECTION_BADGE = ['bg-indigo-100 text-indigo-700', 'bg-violet-100 text-violet-700', 'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700', 'bg-rose-100 text-rose-700', 'bg-sky-100 text-sky-700', 'bg-orange-100 text-orange-700'];

export default function ResearchPage() {
  const [tab, setTab] = useState<'search' | 'sites'>('search');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<WikiResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [article, setArticle] = useState<WikiArticle | null>(null);
  const [loadingArticle, setLoadingArticle] = useState('');
  const [saveModal, setSaveModal] = useState(false);
  const [saveSubject, setSaveSubject] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [searchDone, setSearchDone] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));
  const [quizMode, setQuizMode] = useState(false);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([]);
  const [quizDone, setQuizDone] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setArticle(null);
    setSearchDone(false);
    try {
      const res = await researchApi.search(query) as WikiResult[];
      setResults(res);
    } catch { setResults([]); }
    finally { setSearching(false); setSearchDone(true); }
  }

  async function openArticle(title: string) {
    setLoadingArticle(title);
    setArticle(null);
    setExpandedSections(new Set([0]));
    setQuizMode(false);
    setQuizIdx(0);
    setQuizAnswers([]);
    setQuizDone(false);
    setSaved(false);
    try {
      const art = await researchApi.article(title) as WikiArticle;
      setArticle(art);
      if (art.quiz?.length) setQuizAnswers(new Array(art.quiz.length).fill(null));
    } catch { }
    finally { setLoadingArticle(''); }
  }

  function toggleSection(i: number) {
    setExpandedSections(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  function answerQuiz(optIdx: number) {
    if (quizAnswers[quizIdx] !== null) return;
    const next = [...quizAnswers];
    next[quizIdx] = optIdx;
    setQuizAnswers(next);
  }

  function nextQuestion() {
    if (!article) return;
    if (quizIdx + 1 >= article.quiz.length) { setQuizDone(true); return; }
    setQuizIdx(quizIdx + 1);
  }

  function resetQuiz() {
    if (!article) return;
    setQuizIdx(0);
    setQuizAnswers(new Array(article.quiz.length).fill(null));
    setQuizDone(false);
  }

  async function saveAsNote() {
    if (!article || !saveSubject) return;
    setSaving(true);
    try {
      await notesApi.create({
        title: article.title,
        subject: saveSubject,
        summary: article.summary,
        sections: article.sections,
        quiz: article.quiz,
        tags: article.tags,
        readTime: article.readTime,
        level: article.level,
        aiTip: article.aiTip,
      });
      setSaved(true);
      setSaveModal(false);
    } catch { }
    finally { setSaving(false); }
  }

  const quizScore = article ? quizAnswers.filter((a, i) => a === article.quiz[i]?.correct).length : 0;

  return (
    <div className="animate-enter space-y-6">

      {/* Hero */}
      <div className="relative bg-gradient-to-r from-indigo-600 via-violet-600 to-primary rounded-3xl p-6 text-white overflow-hidden shadow-xl">
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-32 h-16 bg-white/5 rounded-full blur-xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center"><Globe size={16} /></div>
            <span className="text-white/70 text-sm font-medium">Research Hub</span>
          </div>
          <h1 className="font-heading font-bold text-2xl md:text-3xl mb-1">Find Notes From Anywhere</h1>
          <p className="text-white/70 text-sm">Search Wikipedia, get AI-structured study notes, and explore trusted study sites — without leaving the app.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/50 rounded-2xl p-1.5 border border-border/50">
        {([
          { key: 'search', label: 'Wikipedia Search', icon: Search },
          { key: 'sites', label: 'Study Sites', icon: Globe },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
              tab === key ? 'bg-card text-primary shadow-sm border border-border/50' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* ── SEARCH TAB ── */}
      {tab === 'search' && (
        <div className="space-y-5">
          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 bg-card border border-border/50 rounded-2xl px-4 py-3 flex items-center gap-3 focus-within:border-primary/50 transition-colors">
              <Search size={16} className="text-muted-foreground shrink-0" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search any topic — e.g. 'Photosynthesis', 'World War II', 'Quadratic equations'..."
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
              />
              {query && <button type="button" onClick={() => { setQuery(''); setResults([]); setSearchDone(false); setArticle(null); }}><X size={14} className="text-muted-foreground hover:text-foreground" /></button>}
            </div>
            <Button type="submit" loading={searching} className="gap-2 shrink-0">
              <Search size={14} /> Search
            </Button>
          </form>

          {/* Suggestions */}
          {!searchDone && !searching && !article && (
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-3">Popular topics</p>
              <div className="flex flex-wrap gap-2">
                {['Photosynthesis', 'World War II', 'Quadratic equations', 'Osmosis', "Newton's laws", 'DNA replication', 'Supply and demand', 'Computer networks', 'Cell division', 'The Cold War'].map(t => (
                  <button
                    key={t}
                    onClick={() => { setQuery(t); handleSearch({ preventDefault: () => {} } as any); }}
                    className="px-3 py-1.5 rounded-full bg-muted hover:bg-primary/10 hover:text-primary text-sm text-muted-foreground border border-border/50 transition-all"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── ARTICLE VIEWER ── */}
          <AnimatePresence>
            {loadingArticle && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="bg-card rounded-3xl border border-border/50 p-12 flex flex-col items-center gap-4">
                <Loader2 size={32} className="animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">AI is building your study notes for <span className="font-semibold text-foreground">"{loadingArticle}"</span>…</p>
                <p className="text-xs text-muted-foreground">Structuring sections, key points & 20 quiz questions</p>
              </motion.div>
            )}

            {article && !quizMode && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                className="bg-card rounded-3xl border border-primary/20 shadow-lg shadow-primary/5 overflow-hidden"
              >
                {/* Article header */}
                <div className="bg-gradient-to-r from-primary/10 to-indigo-50 px-6 py-5 border-b border-border/50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {article.thumbnail && (
                        <img src={article.thumbnail} alt={article.title} className="w-20 h-20 rounded-2xl object-cover shrink-0 shadow-md" />
                      )}
                      <div className="flex-1">
                        <h2 className="font-heading font-bold text-2xl text-secondary">{article.title}</h2>
                        <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed max-w-2xl">{article.summary}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-3">
                          <span className="flex items-center gap-1.5 text-xs font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                            <Clock size={11} /> {article.readTime} read
                          </span>
                          <span className="flex items-center gap-1.5 text-xs font-medium bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">
                            {article.level}
                          </span>
                          {article.tags.slice(0, 3).map(t => (
                            <span key={t} className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                              <Tag size={9} /> {t}
                            </span>
                          ))}
                          <a href={article.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline font-medium">
                            <ExternalLink size={11} /> Source
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 flex-col sm:flex-row">
                      {saved ? (
                        <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-semibold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                          <CheckCircle2 size={13} /> Saved!
                        </div>
                      ) : (
                        <Button size="sm" onClick={() => setSaveModal(true)} className="gap-1.5">
                          <Save size={13} /> Save as Note
                        </Button>
                      )}
                      {article.quiz.length > 0 && (
                        <Button size="sm" variant="outline" onClick={() => { setQuizMode(true); resetQuiz(); }} className="gap-1.5 border-violet-200 text-violet-700 hover:bg-violet-50">
                          <BrainCircuit size={13} /> Quiz ({article.quiz.length})
                        </Button>
                      )}
                      <button onClick={() => { setArticle(null); setSaved(false); }} className="p-2 rounded-xl hover:bg-muted transition-colors">
                        <X size={16} className="text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* AI Tip */}
                <div className="mx-6 mt-5 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-3.5">
                  <Lightbulb size={15} className="text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-amber-800 font-medium leading-snug">{article.aiTip}</p>
                </div>

                {/* Sections */}
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-heading font-bold text-secondary text-lg">{article.sections.length} Study Sections</h3>
                    <button
                      onClick={() => setExpandedSections(expandedSections.size === article.sections.length ? new Set() : new Set(article.sections.map((_, i) => i)))}
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      {expandedSections.size === article.sections.length ? 'Collapse all' : 'Expand all'}
                    </button>
                  </div>

                  {article.sections.map((s, i) => {
                    const expanded = expandedSections.has(i);
                    const color = SECTION_COLORS[i % SECTION_COLORS.length];
                    const accent = SECTION_ACCENT[i % SECTION_ACCENT.length];
                    const badge = SECTION_BADGE[i % SECTION_BADGE.length];
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`border rounded-2xl overflow-hidden bg-gradient-to-br ${color}`}
                      >
                        {/* Section header — always visible */}
                        <button
                          onClick={() => toggleSection(i)}
                          className="w-full flex items-center gap-3 px-5 py-4 text-left hover:opacity-90 transition-opacity"
                        >
                          <span className={`w-7 h-7 rounded-xl font-bold text-sm flex items-center justify-center shrink-0 ${badge}`}>{i + 1}</span>
                          <span className={`flex-1 font-heading font-bold text-base ${accent}`}>{s.heading}</span>
                          <span className="text-xs text-muted-foreground mr-1">{s.keyPoints.length} key points</span>
                          <ChevronDown size={16} className={`text-muted-foreground transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Section body */}
                        <AnimatePresence initial={false}>
                          {expanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="px-5 pb-5 pt-1 space-y-4">
                                {/* Content paragraph */}
                                <p className="text-sm text-foreground leading-[1.8] border-l-4 border-current/20 pl-4 italic">
                                  {s.content}
                                </p>

                                {/* Key points */}
                                {s.keyPoints.length > 0 && (
                                  <div>
                                    <p className={`text-xs font-bold uppercase tracking-wider mb-2.5 ${accent}`}>Key Points</p>
                                    <ul className="space-y-2">
                                      {s.keyPoints.map((kp, ki) => (
                                        <li key={ki} className="flex items-start gap-2.5">
                                          <CheckCircle size={14} className={`mt-0.5 shrink-0 ${accent}`} />
                                          <span className="text-sm text-foreground leading-snug">{kp}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}

                  {/* Start quiz CTA */}
                  {article.quiz.length > 0 && (
                    <div className="mt-4 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-5 text-white text-center">
                      <BrainCircuit size={24} className="mx-auto mb-2 opacity-80" />
                      <p className="font-heading font-bold text-lg mb-1">Test Your Knowledge</p>
                      <p className="text-white/70 text-sm mb-4">{article.quiz.length} questions to check how well you understood these notes</p>
                      <Button
                        onClick={() => { setQuizMode(true); resetQuiz(); }}
                        className="bg-white text-violet-700 hover:bg-white/90 font-bold gap-2"
                      >
                        <BrainCircuit size={15} /> Start Quiz
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ── QUIZ MODE ── */}
            {article && quizMode && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="bg-card rounded-3xl border border-violet-200 shadow-lg overflow-hidden"
              >
                {/* Quiz header */}
                <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-4 text-white flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-xs font-medium mb-0.5">{article.title} — Quiz</p>
                    <p className="font-heading font-bold text-lg">
                      {quizDone ? 'Results' : `Question ${quizIdx + 1} of ${article.quiz.length}`}
                    </p>
                  </div>
                  <button onClick={() => setQuizMode(false)} className="p-2 rounded-xl hover:bg-white/20 transition-colors">
                    <X size={18} />
                  </button>
                </div>

                {/* Progress bar */}
                {!quizDone && (
                  <div className="h-1.5 bg-violet-100">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-300"
                      style={{ width: `${((quizIdx + 1) / article.quiz.length) * 100}%` }}
                    />
                  </div>
                )}

                <div className="p-6">
                  {quizDone ? (
                    /* Results */
                    <div className="text-center space-y-4">
                      <div className="text-6xl mb-2">
                        {quizScore / article.quiz.length >= 0.8 ? '🎉' : quizScore / article.quiz.length >= 0.6 ? '👍' : '📖'}
                      </div>
                      <div>
                        <p className="font-heading font-bold text-3xl text-secondary">{quizScore}/{article.quiz.length}</p>
                        <p className="text-muted-foreground text-sm mt-1">
                          {quizScore / article.quiz.length >= 0.8 ? 'Excellent work!' : quizScore / article.quiz.length >= 0.6 ? 'Good job! Review the sections you missed.' : 'Keep studying — re-read the notes and try again!'}
                        </p>
                      </div>
                      <div className="flex gap-3 justify-center pt-2">
                        <Button variant="outline" onClick={resetQuiz} className="gap-2"><BrainCircuit size={14} /> Retry</Button>
                        <Button onClick={() => setQuizMode(false)} className="gap-2"><BookOpen size={14} /> Back to Notes</Button>
                        {!saved && (
                          <Button variant="outline" onClick={() => setSaveModal(true)} className="gap-2"><Save size={14} /> Save Note</Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Question */
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={quizIdx}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-5"
                      >
                        <p className="font-semibold text-secondary text-base leading-relaxed">
                          {article.quiz[quizIdx].question}
                        </p>
                        <div className="space-y-2.5">
                          {article.quiz[quizIdx].options.map((opt, oi) => {
                            const answered = quizAnswers[quizIdx] !== null;
                            const chosen = quizAnswers[quizIdx] === oi;
                            const correct = article.quiz[quizIdx].correct === oi;
                            return (
                              <button
                                key={oi}
                                onClick={() => answerQuiz(oi)}
                                disabled={answered}
                                className={`w-full text-left px-4 py-3.5 rounded-xl border text-sm font-medium transition-all ${
                                  !answered
                                    ? 'border-border hover:border-primary/40 hover:bg-primary/5'
                                    : correct
                                      ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                                      : chosen
                                        ? 'border-rose-400 bg-rose-50 text-rose-700'
                                        : 'border-border text-muted-foreground opacity-60'
                                }`}
                              >
                                <span className="flex items-center gap-3">
                                  <span className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-xs font-bold shrink-0">
                                    {String.fromCharCode(65 + oi)}
                                  </span>
                                  {opt}
                                  {answered && correct && <CheckCircle size={16} className="ml-auto text-emerald-500 shrink-0" />}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Explanation */}
                        {quizAnswers[quizIdx] !== null && (
                          <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-start gap-3 p-3.5 bg-blue-50 border border-blue-200 rounded-xl"
                          >
                            <Sparkles size={14} className="text-blue-600 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-xs font-bold text-blue-800 mb-0.5">Explanation</p>
                              <p className="text-sm text-blue-700 leading-snug">{article.quiz[quizIdx].explanation}</p>
                            </div>
                          </motion.div>
                        )}

                        {quizAnswers[quizIdx] !== null && (
                          <Button onClick={nextQuestion} className="w-full gap-2">
                            {quizIdx + 1 >= article.quiz.length ? 'See Results' : 'Next Question'}
                            <ChevronRight size={15} />
                          </Button>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search results */}
          {!article && !loadingArticle && (searchDone || searching) && (
            <div className="space-y-3">
              {searching ? (
                <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
                  <Loader2 size={20} className="animate-spin text-primary" />
                  <span className="text-sm">Searching Wikipedia…</span>
                </div>
              ) : results.length === 0 ? (
                <div className="text-center py-16">
                  <Search size={32} className="text-muted-foreground/30 mx-auto mb-3" />
                  <p className="font-semibold text-secondary">No results found</p>
                  <p className="text-sm text-muted-foreground mt-1">Try a different search term</p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground"><span className="font-bold text-foreground">{results.length}</span> results for "<span className="font-semibold">{query}</span>"</p>
                  {results.map((r, i) => (
                    <motion.div
                      key={r.pageid}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="bg-card rounded-2xl border border-border/50 p-4 hover:border-primary/30 hover:shadow-sm transition-all group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-secondary group-hover:text-primary transition-colors text-sm mb-1">{r.title}</h3>
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{r.snippet}</p>
                          <p className="text-xs text-muted-foreground mt-1.5">{r.wordcount?.toLocaleString()} words</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openArticle(r.title)}
                          loading={loadingArticle === r.title}
                          className="gap-1.5 shrink-0"
                        >
                          {loadingArticle === r.title ? '' : <><Sparkles size={12} /> Summarise</>}
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── SITES TAB ── */}
      {tab === 'sites' && (
        <div className="space-y-8">
          {SITES.map((cat, ci) => (
            <motion.div
              key={cat.category}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: ci * 0.06 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">{cat.emoji}</span>
                <h2 className="font-heading font-bold text-secondary">{cat.category}</h2>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{cat.sites.length} sites</span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {cat.sites.map((site, si) => (
                  <motion.a
                    key={site.name}
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: ci * 0.06 + si * 0.04 }}
                    whileHover={{ y: -2 }}
                    className="bg-card border border-border/50 rounded-2xl p-4 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all group flex flex-col gap-2"
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-2xl">{site.emoji}</span>
                      <ExternalLink size={13} className="text-muted-foreground/50 group-hover:text-primary transition-colors mt-0.5" />
                    </div>
                    <div>
                      <p className="font-semibold text-secondary text-sm group-hover:text-primary transition-colors">{site.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{site.desc}</p>
                    </div>
                    <div className="mt-auto pt-2 border-t border-border/30 flex items-center gap-1 text-xs text-primary font-medium">
                      Visit site <ChevronRight size={11} />
                    </div>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Save as Note modal */}
      <Modal open={saveModal} onClose={() => setSaveModal(false)} title="Save as Note" size="sm">
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-xl p-3 border border-border/50">
            <p className="text-sm font-semibold text-secondary truncate">{article?.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{article?.sections.length} sections · {article?.quiz.length} quiz questions · {article?.readTime} read</p>
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Select Subject <span className="text-destructive">*</span></label>
            <select value={saveSubject} onChange={e => setSaveSubject(e.target.value)} className="input-field">
              <option value="">Choose a subject…</option>
              {SUBJECTS.map(s => <option key={s} value={s}>{subjectIcon(s)} {s}</option>)}
            </select>
          </div>
          <div className="flex items-start gap-2 p-3 bg-primary/5 border border-primary/20 rounded-xl">
            <Sparkles size={13} className="text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-primary leading-relaxed">This will save the AI-structured note with all sections, key points, and {article?.quiz.length} quiz questions to your Knowledge Base.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setSaveModal(false)} className="flex-1">Cancel</Button>
            <Button onClick={saveAsNote} loading={saving} disabled={!saveSubject} className="flex-1 gap-2">
              <Save size={13} /> Save Note
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
