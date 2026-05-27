'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import {
  ArrowLeft, Play, RotateCcw, Lightbulb, ChevronDown, ChevronUp,
  CheckCircle2, XCircle, Loader2, Star, FlaskConical, Terminal,
} from 'lucide-react';
import { LAB_EXERCISES, LANGUAGE_META } from '@/lib/lab-exercises';
import type { LabExercise } from '@/lib/lab-exercises';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <div className="flex-1 bg-zinc-900 rounded-xl animate-pulse min-h-64" />,
});

const DIFFICULTY_COLOR = {
  Beginner:     'text-emerald-400',
  Intermediate: 'text-amber-400',
  Advanced:     'text-rose-400',
};

async function runCode(pistonLang: string, pistonVersion: string, code: string) {
  const res = await fetch('https://emkc.org/api/v2/piston/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      language: pistonLang,
      version: pistonVersion,
      files: [{ content: code }],
    }),
  });
  if (!res.ok) throw new Error(`Piston API error: ${res.status}`);
  const data = await res.json();
  return {
    stdout: (data.run?.stdout ?? '').trim(),
    stderr: (data.run?.stderr ?? data.compile?.stderr ?? '').trim(),
    exitCode: data.run?.code ?? 0,
  };
}

export default function LabExercisePage() {
  const { slug } = useParams<{ slug: string }>();
  const exercise = LAB_EXERCISES.find(e => e.slug === slug) as LabExercise | undefined;

  const [code, setCode]           = useState('');
  const [output, setOutput]       = useState<string | null>(null);
  const [outputType, setOutputType] = useState<'success' | 'error' | 'idle'>('idle');
  const [running, setRunning]     = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [completed, setCompleted] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (exercise) setCode(exercise.starterCode);
  }, [exercise]);

  async function handleRun() {
    if (!exercise || running) return;
    setRunning(true);
    setOutput(null);
    try {
      const result = await runCode(exercise.pistonLang, exercise.pistonVersion, code);
      if (result.exitCode !== 0 || result.stderr) {
        setOutput(result.stderr || result.stdout || 'Runtime error');
        setOutputType('error');
      } else {
        setOutput(result.stdout || '(no output)');
        setOutputType('success');
        if (exercise.expectedOutput && result.stdout === exercise.expectedOutput) {
          setCompleted(true);
        }
      }
    } catch (err: any) {
      setOutput('Could not connect to execution engine. Check your internet connection.');
      setOutputType('error');
    } finally {
      setRunning(false);
      setTimeout(() => outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
    }
  }

  function handleReset() {
    if (exercise) { setCode(exercise.starterCode); setOutput(null); setOutputType('idle'); }
  }

  if (!exercise) {
    return (
      <div className="text-center py-20">
        <FlaskConical size={40} className="text-muted-foreground mx-auto mb-4" />
        <p className="font-semibold text-secondary">Exercise not found</p>
        <Link href="/lab" className="text-primary text-sm mt-2 inline-block hover:underline">← Back to Lab</Link>
      </div>
    );
  }

  const langMeta = LANGUAGE_META[exercise.language];

  return (
    <div className="animate-enter h-[calc(100vh-5rem)] flex flex-col gap-0 -mx-4 md:-mx-6 px-4 md:px-6">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-4 py-3 border-b border-border/50 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/lab" className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
            <ArrowLeft size={18} />
          </Link>
          <div className="min-w-0">
            <h1 className="font-heading font-bold text-secondary truncate">{exercise.title}</h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className={`font-semibold ${langMeta.color}`}>{langMeta.label}</span>
              <span>·</span>
              <span className={DIFFICULTY_COLOR[exercise.difficulty]}>{exercise.difficulty}</span>
              <span>·</span>
              <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
                <Star size={10} className="fill-amber-400" /> +{exercise.points} pts
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleReset}
            className="p-2 rounded-xl border border-border/50 text-muted-foreground hover:text-foreground hover:border-border transition-all"
            title="Reset to starter code"
          >
            <RotateCcw size={15} />
          </button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleRun}
            disabled={running}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm transition-colors shadow-md shadow-emerald-500/20 disabled:opacity-60"
          >
            {running ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
            {running ? 'Running…' : 'Run Code'}
          </motion.button>
        </div>
      </div>

      {/* Main split */}
      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0 overflow-hidden">
        {/* LEFT: Problem panel */}
        <div className="lg:w-80 xl:w-96 shrink-0 flex flex-col gap-3 overflow-y-auto scrollbar-hide">
          {/* Completed banner */}
          {completed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3"
            >
              <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
              <div>
                <p className="text-sm font-bold text-emerald-700">Exercise Complete!</p>
                <p className="text-xs text-emerald-600">+{exercise.points} points earned</p>
              </div>
            </motion.div>
          )}

          {/* Description */}
          <div className="bg-card rounded-2xl border border-border/50 p-4">
            <div
              className="prose prose-sm max-w-none text-foreground prose-code:bg-muted prose-code:px-1 prose-code:rounded prose-code:text-sm prose-pre:bg-muted prose-pre:text-sm prose-headings:font-heading prose-headings:text-secondary"
              dangerouslySetInnerHTML={{ __html: markdownToHtml(exercise.description) }}
            />
          </div>

          {/* Hints */}
          <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
            <button
              onClick={() => setShowHints(v => !v)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-secondary hover:bg-muted/30 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Lightbulb size={14} className="text-amber-500" />
                Hints ({exercise.hints.length})
              </span>
              {showHints ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {showHints && (
              <div className="px-4 pb-4 space-y-2">
                {exercise.hints.slice(0, hintsRevealed).map((hint, i) => (
                  <div key={i} className="flex gap-2 text-sm text-foreground">
                    <span className="text-amber-500 font-bold shrink-0">{i + 1}.</span>
                    <span>{hint}</span>
                  </div>
                ))}
                {hintsRevealed < exercise.hints.length && (
                  <button
                    onClick={() => setHintsRevealed(v => v + 1)}
                    className="text-xs text-primary font-semibold hover:underline"
                  >
                    Reveal next hint
                  </button>
                )}
                {hintsRevealed === 0 && (
                  <button
                    onClick={() => setHintsRevealed(1)}
                    className="text-xs text-primary font-semibold hover:underline"
                  >
                    Show first hint
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Editor + output */}
        <div className="flex-1 flex flex-col gap-3 min-h-0">
          {/* Editor */}
          <div className="flex-1 rounded-2xl overflow-hidden border border-border/50 min-h-64 bg-zinc-900">
            <MonacoEditor
              height="100%"
              language={langMeta.monacoLang}
              value={code}
              onChange={v => setCode(v ?? '')}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", Consolas, monospace',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                lineNumbers: 'on',
                renderLineHighlight: 'line',
                padding: { top: 16, bottom: 16 },
                smoothScrolling: true,
                cursorBlinking: 'smooth',
              }}
            />
          </div>

          {/* Output terminal */}
          <div ref={outputRef} className="bg-zinc-900 rounded-2xl border border-border/50 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-white/10">
              <Terminal size={13} className="text-zinc-400" />
              <span className="text-xs font-mono text-zinc-400">Output</span>
              {outputType !== 'idle' && (
                <span className={`ml-auto text-xs font-semibold ${outputType === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {outputType === 'success' ? '● OK' : '● Error'}
                </span>
              )}
            </div>
            <div className="px-4 py-3 min-h-16 max-h-40 overflow-y-auto font-mono text-sm">
              {running && (
                <span className="text-zinc-400 flex items-center gap-2">
                  <Loader2 size={13} className="animate-spin" /> Executing…
                </span>
              )}
              {!running && output === null && (
                <span className="text-zinc-500">Press "Run Code" to execute your program</span>
              )}
              {!running && output !== null && (
                <pre className={`whitespace-pre-wrap break-words ${outputType === 'error' ? 'text-rose-400' : 'text-emerald-300'}`}>
                  {output}
                </pre>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── minimal markdown → html ───────────────────────────────────────────── */
function markdownToHtml(md: string): string {
  return md
    .replace(/^## (.+)$/gm, '<h2 class="text-base font-bold mt-0 mb-2">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="text-sm font-bold mt-2 mb-1">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/```[\w]*\n([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/\n\n/g, '<br/><br/>');
}
