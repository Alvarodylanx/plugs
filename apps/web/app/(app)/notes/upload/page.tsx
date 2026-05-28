'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Upload, FileText, X, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { notes as notesApi } from '@/lib/api';
import { SUBJECTS, LEVELS } from '@/types';
import { Button } from '@/components/ui/button';

const STEPS = ['Input', 'Details', 'Processing', 'Done'];
const PROCESS_STEPS = [
  'Reading your content…',
  'Identifying key topics…',
  'Structuring into sections…',
  'Generating 20 quiz questions…',
  'Finalising your note…',
];

export default function UploadPage() {
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
  const router = useRouter();

  async function processNote() {
    setStep(2);
    setError('');

    // Animate the processing steps while the API call runs
    const animInterval = setInterval(() => {
      setProcessStep(p => (p < PROCESS_STEPS.length - 1 ? p + 1 : p));
    }, 1800);

    try {
      // Step 1: AI summarizes the raw text
      const structured = await notesApi.summarize(text.trim(), subject, level, tags) as any;

      // Step 2: Save the AI-structured note
      const created = await notesApi.create(structured) as any;

      clearInterval(animInterval);
      setProcessStep(PROCESS_STEPS.length);
      setCreatedId(created.id);

      // Brief pause so the last step lights up visually
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

  return (
    <div className="animate-enter max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-2xl text-secondary">Upload Note</h1>
        <p className="text-muted-foreground text-sm mt-1">AI reads your content and structures it into sections, key points &amp; 20 quiz questions</p>
      </div>

      {/* Steps */}
      <div className="flex items-center justify-between mb-8">
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

        {/* Step 0: Input */}
        {step === 0 && (
          <div className="space-y-5">
            <div className="flex border border-border rounded-xl overflow-hidden">
              {(['file', 'text'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2.5 text-sm font-semibold transition-all ${tab === t ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'}`}>
                  {t === 'file' ? <><Upload size={14} className="inline mr-1.5" />Upload File</> : <><FileText size={14} className="inline mr-1.5" />Paste Text</>}
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
                <input
                  id="file-input"
                  type="file"
                  className="hidden"
                  accept=".txt,.pdf,.doc,.docx"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                />
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
                    <p className="text-sm text-muted-foreground">PDF, Word, TXT · Max 50MB</p>
                    <button className="mt-4 btn-outline text-sm px-6 py-2">+ Browse Files</button>
                  </>
                )}
              </div>
            ) : (
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Paste your study notes here… The AI will read every word and structure them into proper sections with headings, key points, and quiz questions."
                className="input-field min-h-[240px] resize-none font-mono text-sm"
              />
            )}

            <Button onClick={() => setStep(1)} disabled={!text.trim()} className="w-full gap-2">
              Continue <ArrowRight size={16} />
            </Button>
          </div>
        )}

        {/* Step 1: Details */}
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
                    className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${level === l ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground hover:border-primary/50'}`}
                  >{l}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">Tags <span className="text-muted-foreground font-normal">(optional)</span></label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map(t => (
                  <span key={t} className="badge bg-muted text-muted-foreground flex items-center gap-1">
                    {t} <button onClick={() => setTags(p => p.filter(x => x !== t))}><X size={10} /></button>
                  </span>
                ))}
              </div>
              <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={addTag}
                placeholder="Type a tag and press Enter…" className="input-field" />
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setStep(0)} className="flex-1">Back</Button>
              <Button onClick={processNote} disabled={!subject} className="flex-1 gap-2">
                <Loader2 size={14} /> Process with AI
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Processing */}
        {step === 2 && (
          <div className="py-8">
            <div className="flex flex-col items-center gap-3 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Loader2 size={28} className="text-primary animate-spin" />
              </div>
              <p className="font-heading font-semibold text-secondary">AI is processing your content…</p>
              <p className="text-xs text-muted-foreground">This takes about 15–30 seconds</p>
            </div>
            <div className="space-y-3">
              {PROCESS_STEPS.map((s, i) => (
                <motion.div
                  key={s}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: i < processStep ? 1 : 0.3, x: 0 }}
                  className="flex items-center gap-3"
                >
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

        {/* Step 3: Done */}
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
            <h3 className="font-heading font-bold text-2xl text-secondary mb-2">Your note is ready!</h3>
            <p className="text-muted-foreground text-sm mb-8">AI has structured your content into sections with key points and 20 quiz questions.</p>
            <div className="flex flex-col gap-3">
              <Button onClick={() => router.push(`/notes/${createdId}`)} className="gap-2 w-full">
                View Note <ArrowRight size={16} />
              </Button>
              <Button variant="outline" onClick={() => {
                setStep(0); setText(''); setFile(null);
                setTags([]); setSubject(''); setProcessStep(0); setError('');
              }} className="w-full">
                Upload Another
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
