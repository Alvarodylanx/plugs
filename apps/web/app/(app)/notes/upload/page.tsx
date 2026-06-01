'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileText, X, CheckCircle2, Loader2, ArrowRight,
  BookOpen, ClipboardList, Sparkles, Tag,
} from 'lucide-react';
import { notes as notesApi } from '@/lib/api';
import { SUBJECTS, LEVELS } from '@/types';
import { Button } from '@/components/ui/button';
import { Mascot } from '@/components/mascot';

type Mode = 'notes' | 'past-questions';

const MODE_CONFIG = {
  notes: {
    label: 'From My Notes',
    icon: BookOpen,
    color: 'text-primary',
    activeBg: 'bg-primary text-white',
    placeholder: 'Paste your study notes here… The AI will read every word and structure them into proper sections with headings, key points, and 20 quiz questions.',
    processSteps: [
      'Reading your content…',
      'Identifying key topics…',
      'Structuring into sections…',
      'Generating 20 quiz questions…',
      'Finalising your note…',
    ],
    processingTitle: 'AI is structuring your notes…',
    doneTitle: 'Your note is ready!',
    doneDesc: 'AI has structured your content into sections, key points, and 20 quiz questions.',
    mascotMood: 'thinking' as const,
    mascotMsg: 'Structuring your notes! ✨',
  },
  'past-questions': {
    label: 'From Past Questions',
    icon: ClipboardList,
    color: 'text-violet-500',
    activeBg: 'bg-violet-600 text-white',
    placeholder: 'Paste your past exam questions here… The AI will identify every topic being tested, create in-depth study notes for each topic, and generate 15 brand-new practice questions.',
    processSteps: [
      'Reading your past questions…',
      'Identifying topics being tested…',
      'Building study notes for each topic…',
      'Generating 15 new practice questions…',
      'Finalising your exam-prep note…',
    ],
    processingTitle: 'AI is analysing your past questions…',
    doneTitle: 'Exam prep note ready!',
    doneDesc: 'AI identified the topics tested, built study notes for each, and generated 15 new practice questions.',
    mascotMood: 'excited' as const,
    mascotMsg: 'Found your exam topics! 🎯',
  },
};

const STEPS = ['Input', 'Details', 'Processing', 'Done'];

export default function UploadPage() {
  const [mode, setMode] = useState<Mode>('notes');
  const [step, setStep] = useState(0);
  const [tab, setTab] = useState<'file' | 'text'>('text');
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [subject, setSubject] = useState('');
  const [level, setLevel] = useState('O-Level');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [processStep, setProcessStep] = useState(0);
  const [createdId, setCreatedId] = useState('');
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const [topicsFound, setTopicsFound] = useState<string[]>([]);
  const router = useRouter();

  const cfg = MODE_CONFIG[mode];

  async function processNote() {
    setStep(2);
    setError('');
    setTopicsFound([]);

    const animInterval = setInterval(() => {
      setProcessStep(p => (p < cfg.processSteps.length - 1 ? p + 1 : p));
    }, 1800);

    try {
      const structured = (mode === 'past-questions'
        ? await notesApi.fromPastQuestions(text.trim(), subject, level, tags)
        : await notesApi.summarize(text.trim(), subject, level, tags)) as any;

      if (structured.topicsIdentified?.length) {
        setTopicsFound(structured.topicsIdentified);
      }

      const created = await notesApi.create(structured) as any;

      clearInterval(animInterval);
      setProcessStep(cfg.processSteps.length);
      setCreatedId(created.id);
      await new Promise(r => setTimeout(r, 500));
      setStep(3);
    } catch (e: any) {
      clearInterval(animInterval);
      setError(e?.message || 'Something went wrong. Please try again.');
      setStep(1);
    }
  }

  function addTag(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && tagInput.trim()) {
      setTags(p => [...new Set([...p, tagInput.trim()])]);
      setTagInput('');
    }
  }

  function handleFile(f: File) {
    setFile(f);
    const reader = new FileReader();
    reader.onload = ev => setText(ev.target?.result as string || '');
    reader.readAsText(f);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  function reset() {
    setStep(0); setText(''); setFile(null);
    setTags([]); setSubject(''); setProcessStep(0);
    setError(''); setTopicsFound([]);
  }

  return (
    <div className="animate-enter max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="font-heading font-bold text-2xl text-secondary">Create Note</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Upload your own notes or past exam questions — AI structures everything automatically
        </p>
      </div>

      {/* Mode selector */}
      {step === 0 && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          {(['notes', 'past-questions'] as Mode[]).map(m => {
            const c = MODE_CONFIG[m];
            const Icon = c.icon;
            const active = mode === m;
            return (
              <motion.button
                key={m}
                whileTap={{ scale: 0.97 }}
                onClick={() => setMode(m)}
                className={`relative flex flex-col items-start gap-2 p-4 rounded-2xl border-2 transition-all text-left ${
                  active
                    ? m === 'past-questions'
                      ? 'border-violet-500 bg-violet-500/5'
                      : 'border-primary bg-primary/5'
                    : 'border-border hover:border-border/80 bg-card'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${active ? (m === 'past-questions' ? 'bg-violet-600' : 'bg-primary') : 'bg-muted'}`}>
                  <Icon size={18} className={active ? 'text-white' : 'text-muted-foreground'} />
                </div>
                <div>
                  <p className={`font-semibold text-sm ${active ? (m === 'past-questions' ? 'text-violet-600' : 'text-primary') : 'text-foreground'}`}>
                    {c.label}
                  </p>
                  <p className="text-xs text-muted-foreground leading-snug mt-0.5">
                    {m === 'notes'
                      ? 'Structure your existing notes into sections + 20 quiz questions'
                      : 'AI identifies topics from exam questions + builds notes + 15 new questions'}
                  </p>
                </div>
                {active && (
                  <motion.div
                    layoutId="mode-dot"
                    className={`absolute top-3 right-3 w-2.5 h-2.5 rounded-full ${m === 'past-questions' ? 'bg-violet-500' : 'bg-primary'}`}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Steps indicator */}
      <div className="flex items-center justify-between mb-6">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              i < step ? 'bg-primary text-white' : i === step ? 'bg-primary/20 text-primary ring-2 ring-primary/30' : 'bg-muted text-muted-foreground'
            }`}>
              {i < step ? <CheckCircle2 size={14} /> : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${i === step ? 'text-primary' : 'text-muted-foreground'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 rounded transition-all ${i < step ? 'bg-primary' : 'bg-muted'}`} />}
          </div>
        ))}
      </div>

      <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-sm">

        {/* Step 0 — Input */}
        {step === 0 && (
          <div className="space-y-5">
            <div className="flex border border-border rounded-xl overflow-hidden">
              {(['file', 'text'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`flex-1 py-2.5 text-sm font-semibold transition-all ${tab === t ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'}`}>
                  {t === 'file'
                    ? <><Upload size={14} className="inline mr-1.5" />Upload File</>
                    : <><FileText size={14} className="inline mr-1.5" />Paste Text</>}
                </button>
              ))}
            </div>

            {tab === 'file' ? (
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${dragging ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-primary/50'}`}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <input id="file-input" type="file" className="hidden" accept=".txt,.pdf,.doc,.docx"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                <Upload size={40} className="text-primary mx-auto mb-4" />
                {file ? (
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <CheckCircle2 size={16} className="text-primary" />
                    <span className="font-semibold text-foreground">{file.name}</span>
                    <button onClick={e => { e.stopPropagation(); setFile(null); setText(''); }} className="text-muted-foreground hover:text-destructive"><X size={14} /></button>
                  </div>
                ) : (
                  <>
                    <p className="font-semibold text-secondary mb-1">Drag &amp; Drop your file</p>
                    <p className="text-sm text-muted-foreground">
                      {mode === 'past-questions' ? 'Past exam paper — PDF, Word, TXT' : 'Study notes — PDF, Word, TXT'}
                    </p>
                    <button className="mt-4 btn-outline text-sm px-6 py-2">+ Browse Files</button>
                  </>
                )}
              </div>
            ) : (
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder={cfg.placeholder}
                className="input-field min-h-[240px] resize-none text-sm"
              />
            )}

            {mode === 'past-questions' && text.trim().length > 50 && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 bg-violet-500/8 border border-violet-500/20 rounded-xl p-3"
              >
                <Sparkles size={16} className="text-violet-500 shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-violet-600">AI will:</span> extract every topic your questions test, write in-depth notes for each, and generate 15 brand-new practice questions.
                </p>
              </motion.div>
            )}

            <Button onClick={() => setStep(1)} disabled={!text.trim()} className="w-full gap-2">
              Continue <ArrowRight size={16} />
            </Button>
          </div>
        )}

        {/* Step 1 — Details */}
        {step === 1 && (
          <div className="space-y-5">
            {error && (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <div>
              <label className="text-sm font-medium block mb-2">Subject</label>
              <select value={subject} onChange={e => setSubject(e.target.value)} className="input-field">
                <option value="">Select subject…</option>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">Level</label>
              <div className="grid grid-cols-2 gap-2">
                {LEVELS.map(l => (
                  <button key={l} type="button" onClick={() => setLevel(l)}
                    className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${level === l ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground hover:border-primary/50'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">Tags <span className="text-muted-foreground font-normal">(optional)</span></label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map(t => (
                  <span key={t} className="badge bg-muted text-muted-foreground flex items-center gap-1">
                    <Tag size={10} /> {t}
                    <button onClick={() => setTags(p => p.filter(x => x !== t))}><X size={10} /></button>
                  </span>
                ))}
              </div>
              <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={addTag}
                placeholder="Type a tag and press Enter…" className="input-field" />
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setStep(0)} className="flex-1">Back</Button>
              <Button onClick={processNote} disabled={!subject} className={`flex-1 gap-2 ${mode === 'past-questions' ? 'bg-violet-600 hover:bg-violet-700' : ''}`}>
                <Sparkles size={14} />
                {mode === 'past-questions' ? 'Analyse Questions' : 'Process with AI'}
              </Button>
            </div>
          </div>
        )}

        {/* Step 2 — Processing */}
        {step === 2 && (
          <div className="py-8">
            <div className="flex flex-col items-center gap-3 mb-8">
              <Mascot mood={cfg.mascotMood} size={80} message={cfg.mascotMsg} />
              <p className="font-heading font-semibold text-secondary">{cfg.processingTitle}</p>
              <p className="text-xs text-muted-foreground">This takes about 20–40 seconds</p>
            </div>
            <div className="space-y-3">
              {cfg.processSteps.map((s, i) => (
                <motion.div key={s} initial={{ opacity: 0, x: -10 }} animate={{ opacity: i < processStep ? 1 : 0.3, x: 0 }}
                  className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${i < processStep ? 'bg-primary' : 'bg-muted'}`}>
                    {i < processStep
                      ? <CheckCircle2 size={12} className="text-white" />
                      : <span className="text-xs text-muted-foreground">{i + 1}</span>}
                  </div>
                  <span className={`text-sm ${i < processStep ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{s}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3 — Done */}
        {step === 3 && (
          <div className="text-center py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.4 }}
              className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/30"
            >
              <CheckCircle2 size={36} className="text-white" />
            </motion.div>

            <h3 className="font-heading font-bold text-2xl text-secondary mb-2">{cfg.doneTitle}</h3>
            <p className="text-muted-foreground text-sm mb-6">{cfg.doneDesc}</p>

            {/* Topics identified — only shown for past-questions mode */}
            {topicsFound.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-violet-500/8 border border-violet-500/20 rounded-2xl p-4 mb-6 text-left"
              >
                <p className="text-xs font-bold uppercase tracking-wider text-violet-600 mb-3 flex items-center gap-1.5">
                  <Sparkles size={12} /> Topics Identified from Your Questions
                </p>
                <div className="flex flex-wrap gap-2">
                  {topicsFound.map(t => (
                    <span key={t} className="text-xs bg-violet-500/10 text-violet-700 dark:text-violet-300 font-medium px-2.5 py-1 rounded-full border border-violet-500/15">
                      {t}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            <div className="flex flex-col gap-3">
              <Button onClick={() => router.push(`/notes/${createdId}`)} className="gap-2 w-full">
                View Note <ArrowRight size={16} />
              </Button>
              <Button variant="outline" onClick={reset} className="w-full">
                Create Another
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
