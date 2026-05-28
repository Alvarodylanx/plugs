'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Check, AlertTriangle, ChevronDown, ChevronUp, Clipboard, X } from 'lucide-react';

interface LTMatch {
  message: string;
  offset: number;
  length: number;
  replacements: { value: string }[];
  rule: { id: string; category: { id: string; name: string } };
  context: { text: string; offset: number; length: number };
}

interface Segment {
  text: string;
  match?: LTMatch;
}

const CAT_COLOR: Record<string, string> = {
  GRAMMAR:   'bg-rose-500/10 border-rose-500/25 text-rose-600 dark:text-rose-400',
  SPELLING:  'bg-amber-500/10 border-amber-500/25 text-amber-600 dark:text-amber-400',
  STYLE:     'bg-blue-500/10 border-blue-500/25 text-blue-600 dark:text-blue-400',
  PUNCTUATION: 'bg-violet-500/10 border-violet-500/25 text-violet-600 dark:text-violet-400',
};
const CAT_UNDERLINE: Record<string, string> = {
  GRAMMAR: 'decoration-rose-500',
  SPELLING: 'decoration-amber-500',
  STYLE: 'decoration-blue-500',
  PUNCTUATION: 'decoration-violet-500',
};
const DEFAULT_COLOR = 'bg-muted border-border text-muted-foreground';

function buildSegments(text: string, matches: LTMatch[]): Segment[] {
  const sorted = [...matches].sort((a, b) => a.offset - b.offset);
  const segs: Segment[] = [];
  let pos = 0;
  for (const m of sorted) {
    if (m.offset > pos) segs.push({ text: text.slice(pos, m.offset) });
    segs.push({ text: text.slice(m.offset, m.offset + m.length), match: m });
    pos = m.offset + m.length;
  }
  if (pos < text.length) segs.push({ text: text.slice(pos) });
  return segs;
}

export function GrammarChecker() {
  const [text, setText] = useState('');
  const [matches, setMatches] = useState<LTMatch[]>([]);
  const [checking, setChecking] = useState(false);
  const [checked, setChecked] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [lang, setLang] = useState('en-US');

  const LANGS = [
    { code: 'en-US', label: 'English (US)' },
    { code: 'en-GB', label: 'English (UK)' },
    { code: 'fr',    label: 'French' },
    { code: 'de',    label: 'German' },
    { code: 'es',    label: 'Spanish' },
  ];

  async function check() {
    if (!text.trim()) return;
    setChecking(true);
    setChecked(false);
    setMatches([]);
    try {
      const body = new URLSearchParams({ text, language: lang });
      const res = await fetch('https://api.languagetool.org/v2/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
      const data = await res.json();
      setMatches(data.matches || []);
      setChecked(true);
    } catch {
      setChecked(true);
    } finally {
      setChecking(false);
    }
  }

  function applyFix(m: LTMatch, replacement: string) {
    const before = text.slice(0, m.offset);
    const after = text.slice(m.offset + m.length);
    const newText = before + replacement + after;
    setText(newText);
    setMatches(prev => prev.filter(x => x !== m));
  }

  function dismissMatch(m: LTMatch) {
    setMatches(prev => prev.filter(x => x !== m));
  }

  async function paste() {
    const t = await navigator.clipboard.readText().catch(() => '');
    if (t) setText(t);
  }

  const segments = checked && matches.length > 0 ? buildSegments(text, matches) : null;

  const byCategory = matches.reduce<Record<string, LTMatch[]>>((acc, m) => {
    const cat = m.rule.category.id;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(m);
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <select value={lang} onChange={e => setLang(e.target.value)} className="input-field max-w-[180px] text-sm">
          {LANGS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
        </select>
        <button onClick={paste} className="btn-ghost text-sm gap-1.5"><Clipboard size={14}/> Paste</button>
        <button onClick={() => { setText(''); setMatches([]); setChecked(false); }} className="btn-ghost text-sm gap-1.5 text-muted-foreground">Clear</button>
        <button onClick={check} disabled={!text.trim() || checking} className="btn-primary gap-2 text-sm ml-auto">
          {checking ? <><Loader2 size={14} className="animate-spin"/> Checking…</> : 'Check Grammar'}
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Editor */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your text</p>
          <textarea
            value={text}
            onChange={e => { setText(e.target.value); setChecked(false); setMatches([]); }}
            placeholder="Paste or type your essay, paragraph, or any text here…"
            className="input-field resize-none min-h-[280px] text-sm leading-relaxed font-mono"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{text.trim().split(/\s+/).filter(Boolean).length} words</span>
            {checked && (
              <span className={matches.length === 0 ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-rose-600 dark:text-rose-400 font-semibold'}>
                {matches.length === 0 ? '✓ No issues found!' : `${matches.length} issue${matches.length !== 1 ? 's' : ''} found`}
              </span>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="space-y-3">
          {/* Highlighted preview */}
          {segments && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Annotated preview</p>
              <div className="bg-card border border-border/60 rounded-2xl p-4 text-sm leading-relaxed min-h-[120px]">
                {segments.map((seg, i) =>
                  seg.match ? (
                    <span
                      key={i}
                      className={`underline decoration-wavy decoration-2 cursor-pointer hover:opacity-80 ${CAT_UNDERLINE[seg.match.rule.category.id] || 'decoration-rose-500'}`}
                      onClick={() => setExpandedId(seg.match!.rule.id + seg.match!.offset)}
                      title={seg.match.message}
                    >{seg.text}</span>
                  ) : (
                    <span key={i} className="whitespace-pre-wrap">{seg.text}</span>
                  )
                )}
              </div>
            </div>
          )}

          {/* Issues list */}
          {checked && matches.length === 0 && (
            <div className="text-center py-10 border-2 border-dashed border-emerald-500/30 rounded-2xl">
              <Check size={32} className="text-emerald-500 mx-auto mb-2"/>
              <p className="font-semibold text-emerald-600 dark:text-emerald-400">All clear!</p>
              <p className="text-xs text-muted-foreground mt-1">No grammar or spelling issues detected.</p>
            </div>
          )}

          {Object.entries(byCategory).map(([cat, ms]) => (
            <div key={cat} className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{ms[0].rule.category.name} ({ms.length})</p>
              {ms.map((m, i) => {
                const key = m.rule.id + m.offset;
                const isOpen = expandedId === key;
                const color = CAT_COLOR[cat] || DEFAULT_COLOR;
                return (
                  <div key={i} className={`rounded-xl border p-3 ${color}`}>
                    <div className="flex items-start justify-between gap-2">
                      <button className="flex-1 text-left text-xs font-semibold leading-snug" onClick={() => setExpandedId(isOpen ? null : key)}>
                        {m.message}
                      </button>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => setExpandedId(isOpen ? null : key)} className="p-1 rounded hover:bg-black/5 transition-colors">
                          {isOpen ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
                        </button>
                        <button onClick={() => dismissMatch(m)} className="p-1 rounded hover:bg-black/5 transition-colors">
                          <X size={12}/>
                        </button>
                      </div>
                    </div>
                    <p className="text-[10px] mt-1 opacity-70 font-mono">…{m.context.text.trim()}…</p>
                    <AnimatePresence>
                      {isOpen && m.replacements.length > 0 && (
                        <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }} className="overflow-hidden">
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            <span className="text-[10px] opacity-60 self-center">Replace with:</span>
                            {m.replacements.slice(0, 5).map((r, j) => (
                              <button key={j} onClick={() => applyFix(m, r.value)}
                                className="px-2 py-0.5 rounded-lg bg-card border border-current/30 text-xs font-semibold hover:bg-current/10 transition-colors">
                                {r.value}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
