'use client';
import { useState, useRef, useEffect, type DragEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Printer, Copy, Check, Plus, Trash2,
  RotateCcw, ChevronRight, ChevronLeft, Star, Sparkles,
  BookOpen, RefreshCw, Download, Image as ImageIcon, X,
  Calculator, ArrowLeftRight, FileText, Globe, Youtube,
  Loader2, Wrench, Brain, PenLine, Quote, BookMarked,
  BarChart2, Scale, Clock, Zap, Layers, Hash, SquareStack,
} from 'lucide-react';
import { notes as notesApi } from '@/lib/api';
import type { NoteCard } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

type ToolTab = 'writer' | 'flashcards' | 'citations' | 'calculator' | 'converter' | 'analyser' | 'imagepdf';

interface Flashcard { id: string; front: string; back: string; starred: boolean; }
interface Deck { id: string; name: string; subject: string; cards: Flashcard[]; createdAt: string; }

type CitationType = 'book' | 'journal' | 'website' | 'youtube';
type CitationStyle = 'apa' | 'mla' | 'harvard';

interface CitationData {
  type: CitationType;
  authors: string;
  title: string;
  year: string;
  publisher?: string;
  place?: string;
  edition?: string;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  url?: string;
  siteName?: string;
  accessDate?: string;
  channel?: string;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const UNIT_CATEGORIES: Record<string, Record<string, number> | 'temp'> = {
  Length:      { m: 1, km: 1000, cm: 0.01, mm: 0.001, mi: 1609.344, ft: 0.3048, in: 0.0254, yd: 0.9144 },
  Mass:        { kg: 1, g: 0.001, mg: 1e-6, t: 1000, lb: 0.453592, oz: 0.0283495 },
  Temperature: 'temp',
  Volume:      { L: 1, mL: 0.001, 'm³': 1000, 'cm³': 0.001, gal: 3.78541, 'fl oz': 0.0295735, cup: 0.236588 },
  Speed:       { 'm/s': 1, 'km/h': 1/3.6, mph: 0.44704, knot: 0.514444, 'ft/s': 0.3048 },
  Area:        { 'm²': 1, 'km²': 1e6, 'cm²': 0.0001, ha: 10000, acre: 4046.86, 'ft²': 0.092903 },
  Energy:      { J: 1, kJ: 1000, cal: 4.184, kcal: 4184, Wh: 3600, kWh: 3.6e6 },
  Pressure:    { Pa: 1, kPa: 1000, MPa: 1e6, bar: 100000, psi: 6894.76, atm: 101325 },
  Time:        { s: 1, ms: 0.001, min: 60, h: 3600, d: 86400, week: 604800, year: 31536000 },
  Data:        { B: 1, KB: 1000, MB: 1e6, GB: 1e9, TB: 1e12, KiB: 1024, MiB: 1048576, GiB: 1073741824 },
};

const TEMP_UNITS = ['°C', '°F', 'K'];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function uid() { return Math.random().toString(36).slice(2); }

function convertTemp(value: number, from: string, to: string): number {
  let c = from === '°F' ? (value - 32) * 5/9 : from === 'K' ? value - 273.15 : value;
  return to === '°F' ? c * 9/5 + 32 : to === 'K' ? c + 273.15 : c;
}

function convertUnit(value: number, from: string, to: string, category: string): number {
  if (category === 'Temperature') return convertTemp(value, from, to);
  const units = UNIT_CATEGORIES[category] as Record<string, number>;
  return (value * units[from]) / units[to];
}

function safeCalc(expr: string, deg: boolean): string {
  try {
    const D = deg ? Math.PI / 180 : 1;
    const R = deg ? 180 / Math.PI : 1;
    const fns = {
      sin:   (x: number) => Math.sin(x * D),
      cos:   (x: number) => Math.cos(x * D),
      tan:   (x: number) => Math.tan(x * D),
      asin:  (x: number) => Math.asin(x) * R,
      acos:  (x: number) => Math.acos(x) * R,
      atan:  (x: number) => Math.atan(x) * R,
      sqrt:  Math.sqrt,
      abs:   Math.abs,
      log:   Math.log10,
      ln:    Math.log,
      floor: Math.floor,
      ceil:  Math.ceil,
      round: Math.round,
      pow:   Math.pow,
      PI:    Math.PI,
      E:     Math.E,
    };
    const e = expr
      .replace(/π/g, 'PI')
      .replace(/\^/g, '**')
      .replace(/÷/g, '/')
      .replace(/×/g, '*')
      .replace(/√/g, 'sqrt');
    const result = new Function(...Object.keys(fns), `"use strict"; return (${e})`)(...Object.values(fns));
    if (typeof result !== 'number' || !isFinite(result)) return isNaN(result as any) ? 'Error' : '∞';
    const r = parseFloat(result.toPrecision(12));
    return r.toString();
  } catch {
    return 'Error';
  }
}

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!word) return 0;
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  const m = word.match(/[aeiouy]+/g);
  return Math.max(1, m ? m.length : 1);
}

function analyseText(text: string) {
  const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean) : [];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length || 1;
  const paragraphs = text.split(/\n{2,}/).filter(p => p.trim()).length || (words.length ? 1 : 0);
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, '').length;
  const syllables = words.reduce((s, w) => s + countSyllables(w), 0);
  const flesh = words.length
    ? Math.round(Math.max(0, Math.min(100, 206.835 - 1.015 * (words.length / sentences) - 84.6 * (syllables / words.length))))
    : 0;
  const grade = flesh >= 90 ? '5th grade' : flesh >= 80 ? '6th grade' : flesh >= 70 ? '7th grade'
    : flesh >= 60 ? '8th–9th grade' : flesh >= 50 ? '10th–12th grade' : flesh >= 30 ? 'College' : 'Graduate';
  const readMin = Math.ceil(words.length / 200);
  const freq: Record<string, number> = {};
  words.forEach(w => { const k = w.toLowerCase().replace(/[^a-z]/g, ''); if (k.length > 2) freq[k] = (freq[k] || 0) + 1; });
  const topWords = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 8);
  return { words: words.length, sentences, paragraphs, chars, charsNoSpaces, syllables, flesh, grade, readMin, topWords };
}

// ─── Citation Formatters ────────────────────────────────────────────────────────

function fmtAuthors(raw: string, style: CitationStyle) {
  const names = raw.split(';').map(s => s.trim()).filter(Boolean);
  if (!names.length) return 'Author(s)';
  function toInitials(name: string) {
    const parts = name.split(' ');
    const last = parts[parts.length - 1];
    const initials = parts.slice(0, -1).map(p => p[0] + '.').join(' ');
    return { last, initials, full: name };
  }
  const parsed = names.map(toInitials);
  if (style === 'apa') {
    if (parsed.length === 1) return `${parsed[0].last}, ${parsed[0].initials}`;
    if (parsed.length <= 7) return parsed.slice(0, -1).map(p => `${p.last}, ${p.initials}`).join(', ') + ', & ' + `${parsed.at(-1)!.last}, ${parsed.at(-1)!.initials}`;
    return parsed.slice(0, 6).map(p => `${p.last}, ${p.initials}`).join(', ') + ', … ' + `${parsed.at(-1)!.last}, ${parsed.at(-1)!.initials}`;
  }
  if (style === 'mla') {
    if (parsed.length === 1) return `${parsed[0].last}, ${parsed.slice(0, -1).map(p => p.initials || p.full.split(' ')[0]).join('')}`.replace(/\.$/, '') + '.';
    return `${parsed[0].last}, ${parsed[0].full.split(' ')[0]}, et al.`;
  }
  // harvard
  if (parsed.length === 1) return `${parsed[0].last}, ${parsed[0].initials}`;
  if (parsed.length <= 3) return parsed.map(p => `${p.last}, ${p.initials}`).join(' and ');
  return `${parsed[0].last}, ${parsed[0].initials} et al.`;
}

function buildCitation(data: CitationData, style: CitationStyle): string {
  const a = fmtAuthors(data.authors || 'Author', style);
  const y = data.year || 'n.d.';
  const T = data.title || 'Untitled';
  const url = data.url ? ` ${data.url}` : '';
  const doi = data.doi ? ` https://doi.org/${data.doi}` : '';
  const acc = data.accessDate ? ` [Accessed: ${data.accessDate}]` : '';

  if (data.type === 'book') {
    const pub = data.publisher || 'Publisher';
    const pl = data.place ? `${data.place}: ` : '';
    const ed = data.edition ? ` (${data.edition} ed.)` : '';
    if (style === 'apa')     return `${a} (${y}). *${T}*${ed}. ${pub}.`;
    if (style === 'mla')     return `${a} *${T}*${ed}. ${pub}, ${y}.`;
    if (style === 'harvard') return `${a} (${y}) *${T}*${ed}. ${pl}${pub}.`;
  }
  if (data.type === 'journal') {
    const j  = data.journal || 'Journal';
    const vo = data.volume ? `, *${data.volume}*` : '';
    const is = data.issue  ? `(${data.issue})` : '';
    const pg = data.pages  ? `, ${data.pages}` : '';
    if (style === 'apa')     return `${a} (${y}). ${T}. *${j}*${vo}${is}${pg}.${doi}`;
    if (style === 'mla')     return `${a} "${T}." *${j}*, vol. ${data.volume || '–'}, no. ${data.issue || '–'}, ${y}, pp. ${data.pages || '–'}.${doi}`;
    if (style === 'harvard') return `${a} (${y}) '${T}', *${j}*${vo}${is}${pg}.${doi}`;
  }
  if (data.type === 'website') {
    const site = data.siteName ? ` *${data.siteName}*.` : '.';
    if (style === 'apa')     return `${a} (${y}). *${T}*.${site}${url}`;
    if (style === 'mla')     return `${a} "${T}."${site} ${y},${url}`;
    if (style === 'harvard') return `${a} (${y}) *${T}*.${site} Available at:${url}${acc}`;
  }
  if (data.type === 'youtube') {
    const ch = data.channel ? ` [${data.channel}]` : '';
    if (style === 'apa')     return `${data.channel || a} (${y}). *${T}* [Video]. YouTube.${url}`;
    if (style === 'mla')     return `${data.channel || a} "${T}." *YouTube*,${ch} ${y},${url}`;
    if (style === 'harvard') return `${data.channel || a} (${y}) *${T}* [Online video]. Available at:${url}${acc}`;
  }
  return '';
}

// ─── Essay Writer ─────────────────────────────────────────────────────────────

function EssayWriter() {
  const editorRef = useRef<HTMLDivElement>(null);
  const [wordCount, setWordCount] = useState(0);
  const [copied, setCopied] = useState(false);

  function exec(cmd: string, val?: string) {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
  }

  function onInput() {
    const text = editorRef.current?.innerText || '';
    setWordCount(text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0);
  }

  function copyText() {
    const text = editorRef.current?.innerText || '';
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function exportPDF() {
    const html = editorRef.current?.innerHTML || '';
    const w = window.open('', '_blank')!;
    w.document.write(`<html><head><style>
      body{font-family:'Georgia',serif;font-size:12pt;line-height:1.8;margin:2.5cm;color:#111;}
      h1{font-size:20pt;}h2{font-size:16pt;}h3{font-size:13pt;}
      @page{margin:2.5cm;}
    </style></head><body>${html}</body></html>`);
    w.document.close();
    w.onload = () => { w.print(); };
  }

  const toolbarBtn = (label: string, onClick: () => void, active = false) => (
    <button
      key={label}
      onMouseDown={e => { e.preventDefault(); onClick(); }}
      title={label}
      className={`p-2 rounded-lg text-sm transition-colors ${active ? 'bg-primary text-white' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-card border border-border/60 rounded-2xl p-3 flex flex-wrap items-center gap-1">
        <button onMouseDown={e=>{e.preventDefault();exec('bold');}} className="p-2 rounded-lg hover:bg-muted transition-colors" title="Bold (Ctrl+B)"><Bold size={15}/></button>
        <button onMouseDown={e=>{e.preventDefault();exec('italic');}} className="p-2 rounded-lg hover:bg-muted transition-colors" title="Italic (Ctrl+I)"><Italic size={15}/></button>
        <button onMouseDown={e=>{e.preventDefault();exec('underline');}} className="p-2 rounded-lg hover:bg-muted transition-colors" title="Underline (Ctrl+U)"><Underline size={15}/></button>
        <div className="w-px h-5 bg-border mx-1" />
        <button onMouseDown={e=>{e.preventDefault();exec('formatBlock','h1');}} className="p-2 rounded-lg hover:bg-muted transition-colors text-xs font-bold text-muted-foreground" title="Heading 1">H1</button>
        <button onMouseDown={e=>{e.preventDefault();exec('formatBlock','h2');}} className="p-2 rounded-lg hover:bg-muted transition-colors text-xs font-bold text-muted-foreground" title="Heading 2">H2</button>
        <button onMouseDown={e=>{e.preventDefault();exec('formatBlock','h3');}} className="p-2 rounded-lg hover:bg-muted transition-colors text-xs font-bold text-muted-foreground" title="Heading 3">H3</button>
        <button onMouseDown={e=>{e.preventDefault();exec('formatBlock','p');}} className="p-2 rounded-lg hover:bg-muted transition-colors text-xs font-bold text-muted-foreground" title="Paragraph">P</button>
        <div className="w-px h-5 bg-border mx-1" />
        <button onMouseDown={e=>{e.preventDefault();exec('justifyLeft');}} className="p-2 rounded-lg hover:bg-muted transition-colors" title="Align left"><AlignLeft size={15}/></button>
        <button onMouseDown={e=>{e.preventDefault();exec('justifyCenter');}} className="p-2 rounded-lg hover:bg-muted transition-colors" title="Align centre"><AlignCenter size={15}/></button>
        <button onMouseDown={e=>{e.preventDefault();exec('justifyRight');}} className="p-2 rounded-lg hover:bg-muted transition-colors" title="Align right"><AlignRight size={15}/></button>
        <div className="w-px h-5 bg-border mx-1" />
        <button onMouseDown={e=>{e.preventDefault();exec('insertUnorderedList');}} className="p-2 rounded-lg hover:bg-muted transition-colors" title="Bullet list"><List size={15}/></button>
        <button onMouseDown={e=>{e.preventDefault();exec('insertOrderedList');}} className="p-2 rounded-lg hover:bg-muted transition-colors" title="Numbered list"><ListOrdered size={15}/></button>
        <div className="w-px h-5 bg-border mx-1" />
        <span className="text-xs text-muted-foreground ml-1 mr-auto">{wordCount} words</span>
        <button onClick={copyText} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted hover:bg-muted/80 text-xs font-semibold transition-colors">
          {copied ? <><Check size={12} className="text-emerald-500"/> Copied</> : <><Copy size={12}/> Copy text</>}
        </button>
        <button onClick={exportPDF} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors">
          <Printer size={12}/> Export PDF
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={onInput}
        className="min-h-[480px] bg-card border border-border/60 rounded-2xl p-6 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all text-sm leading-relaxed"
        style={{ fontFamily: 'Georgia, serif', lineHeight: 1.9 }}
        data-placeholder="Start writing your essay here…"
      />
      <style jsx global>{`
        [contenteditable]:empty:before { content: attr(data-placeholder); color: hsl(var(--muted-foreground)); pointer-events: none; }
        [contenteditable] h1 { font-size: 1.6rem; font-weight: 700; margin: 1rem 0 0.5rem; }
        [contenteditable] h2 { font-size: 1.3rem; font-weight: 700; margin: 0.8rem 0 0.4rem; }
        [contenteditable] h3 { font-size: 1.1rem; font-weight: 600; margin: 0.6rem 0 0.3rem; }
        [contenteditable] ul, [contenteditable] ol { padding-left: 1.5rem; margin: 0.5rem 0; }
        [contenteditable] li { margin: 0.2rem 0; }
      `}</style>
    </div>
  );
}

// ─── Flashcard Maker ─────────────────────────────────────────────────────────

function FlashcardMaker() {
  const STORAGE_KEY = 'plug_flashcard_decks';
  const [decks, setDecks] = useState<Deck[]>(() => {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
  });
  const [view, setView] = useState<'list' | 'create' | 'study' | 'studydone' | 'fromnotes'>('list');
  const [activeDeck, setActiveDeck] = useState<Deck | null>(null);
  const [newDeckName, setNewDeckName] = useState('');
  const [newCards, setNewCards] = useState<{ front: string; back: string }[]>([{ front: '', back: '' }]);
  const [studyIdx, setStudyIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<number>>(new Set());
  const [notesList, setNotesList] = useState<NoteCard[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState('');

  function save(updated: Deck[]) {
    setDecks(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  function createDeck() {
    if (!newDeckName.trim()) return;
    const cards: Flashcard[] = newCards.filter(c => c.front || c.back).map(c => ({ id: uid(), front: c.front, back: c.back, starred: false }));
    const deck: Deck = { id: uid(), name: newDeckName.trim(), subject: '', cards, createdAt: new Date().toISOString() };
    save([...decks, deck]);
    setNewDeckName('');
    setNewCards([{ front: '', back: '' }]);
    setView('list');
  }

  function deleteDeck(id: string) { save(decks.filter(d => d.id !== id)); }

  function startStudy(deck: Deck) { setActiveDeck(deck); setStudyIdx(0); setFlipped(false); setKnown(new Set()); setView('study'); }

  function nextCard(wasKnown: boolean) {
    if (!activeDeck) return;
    const next = new Set(known);
    if (wasKnown) next.add(studyIdx);
    setKnown(next);
    if (studyIdx + 1 >= activeDeck.cards.length) { setKnown(next); setView('studydone'); return; }
    setStudyIdx(i => i + 1);
    setFlipped(false);
  }

  async function loadFromNotes() {
    setView('fromnotes');
    if (notesList.length) return;
    setNotesLoading(true);
    const n = await notesApi.list().catch(() => []) as NoteCard[];
    setNotesList(n);
    setNotesLoading(false);
  }

  async function generateFromNote() {
    if (!selectedNoteId) return;
    const note = await notesApi.get(selectedNoteId) as any;
    const cards: Flashcard[] = [];
    (note.sections || []).forEach((s: any) => {
      cards.push({ id: uid(), front: s.heading, back: (s.keyPoints || []).join('\n• ') || s.content.slice(0, 200), starred: false });
    });
    (note.quiz || []).slice(0, 10).forEach((q: any) => {
      cards.push({ id: uid(), front: q.question, back: `${q.options[q.correct]}\n\n${q.explanation}`, starred: false });
    });
    const deck: Deck = { id: uid(), name: note.title, subject: note.subject, cards, createdAt: new Date().toISOString() };
    save([...decks, deck]);
    setView('list');
    setSelectedNoteId('');
  }

  const card = activeDeck?.cards[studyIdx];

  if (view === 'study' && activeDeck) return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={() => setView('list')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ChevronLeft size={15}/> Decks</button>
        <p className="text-sm font-semibold text-secondary">{activeDeck.name} — {studyIdx + 1}/{activeDeck.cards.length}</p>
        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">{known.size} known</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(studyIdx / activeDeck.cards.length) * 100}%` }} />
      </div>
      {card && (
        <motion.div
          key={studyIdx + '-' + String(flipped)}
          initial={{ rotateY: flipped ? -90 : 90, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          transition={{ duration: 0.25 }}
          onClick={() => setFlipped(f => !f)}
          className={`cursor-pointer rounded-3xl border-2 p-10 text-center min-h-[260px] flex flex-col items-center justify-center gap-4 transition-colors ${flipped ? 'border-primary/40 bg-primary/5' : 'border-border bg-card'}`}
        >
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{flipped ? 'ANSWER' : 'QUESTION'}</span>
          <p className="font-heading font-bold text-lg text-foreground leading-snug whitespace-pre-wrap">{flipped ? card.back : card.front}</p>
          {!flipped && <p className="text-xs text-muted-foreground mt-2">Click to reveal answer</p>}
        </motion.div>
      )}
      <AnimatePresence>
        {flipped && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
            <button onClick={() => nextCard(false)} className="flex-1 py-3 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 font-semibold hover:bg-rose-500/20 transition-colors">
              ✗ Still learning
            </button>
            <button onClick={() => nextCard(true)} className="flex-1 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 font-semibold hover:bg-emerald-500/20 transition-colors">
              ✓ Got it!
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  if (view === 'studydone') return (
    <div className="max-w-xl mx-auto text-center space-y-4 py-12">
      <p className="text-5xl">🎉</p>
      <p className="font-heading font-bold text-2xl text-secondary">Deck complete!</p>
      <p className="text-muted-foreground">You knew <span className="font-bold text-emerald-600 dark:text-emerald-400">{known.size}</span> of <span className="font-bold">{activeDeck?.cards.length}</span> cards</p>
      <div className="flex gap-3 justify-center pt-2">
        <button onClick={() => activeDeck && startStudy(activeDeck)} className="btn-outline gap-2"><RotateCcw size={14}/> Retry</button>
        <button onClick={() => setView('list')} className="btn-primary gap-2"><ChevronLeft size={14}/> Back to Decks</button>
      </div>
    </div>
  );

  if (view === 'fromnotes') return (
    <div className="space-y-4 max-w-xl mx-auto">
      <button onClick={() => setView('list')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ChevronLeft size={15}/> Back</button>
      <h3 className="font-heading font-bold text-secondary">Generate Flashcards from a Note</h3>
      <p className="text-sm text-muted-foreground">Pick a note and we'll create cards from its sections and quiz questions automatically.</p>
      {notesLoading ? <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center"><Loader2 size={18} className="animate-spin"/> Loading notes…</div> : (
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {notesList.map(n => (
            <button key={n.id} onClick={() => setSelectedNoteId(n.id)}
              className={`w-full text-left p-3 rounded-xl border transition-all ${selectedNoteId === n.id ? 'border-primary/40 bg-primary/5' : 'border-border/50 hover:border-primary/30'}`}>
              <p className="font-semibold text-sm text-secondary">{n.title}</p>
              <p className="text-xs text-muted-foreground">{n.subject}</p>
            </button>
          ))}
        </div>
      )}
      <button onClick={generateFromNote} disabled={!selectedNoteId} className="btn-primary w-full gap-2">
        <Sparkles size={15}/> Generate Flashcards
      </button>
    </div>
  );

  if (view === 'create') return (
    <div className="space-y-4 max-w-xl mx-auto">
      <button onClick={() => setView('list')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ChevronLeft size={15}/> Back</button>
      <div>
        <label className="text-sm font-semibold text-secondary block mb-1.5">Deck name</label>
        <input value={newDeckName} onChange={e => setNewDeckName(e.target.value)} placeholder="e.g. Biology Chapter 3" className="input-field" />
      </div>
      <div className="space-y-3">
        <p className="text-sm font-semibold text-secondary">Cards</p>
        {newCards.map((c, i) => (
          <div key={i} className="grid grid-cols-2 gap-2 items-start">
            <input placeholder="Front (question)" value={c.front} onChange={e => { const n=[...newCards]; n[i].front=e.target.value; setNewCards(n); }} className="input-field text-sm"/>
            <div className="flex gap-2">
              <input placeholder="Back (answer)" value={c.back} onChange={e => { const n=[...newCards]; n[i].back=e.target.value; setNewCards(n); }} className="input-field text-sm flex-1"/>
              {i > 0 && <button onClick={() => setNewCards(newCards.filter((_,j)=>j!==i))} className="p-2 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground"><Trash2 size={14}/></button>}
            </div>
          </div>
        ))}
        <button onClick={() => setNewCards([...newCards, { front:'', back:'' }])} className="btn-ghost gap-2 text-sm"><Plus size={14}/> Add card</button>
      </div>
      <button onClick={createDeck} disabled={!newDeckName.trim()} className="btn-primary w-full gap-2"><Check size={15}/> Create Deck</button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-muted-foreground"><span className="font-bold text-foreground">{decks.length}</span> deck{decks.length !== 1 ? 's' : ''}</p>
        <div className="flex gap-2">
          <button onClick={loadFromNotes} className="btn-outline gap-2 text-sm"><Sparkles size={14}/> From Notes</button>
          <button onClick={() => setView('create')} className="btn-primary gap-2 text-sm"><Plus size={14}/> New Deck</button>
        </div>
      </div>
      {decks.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-3xl">
          <SquareStack size={36} className="text-muted-foreground/30 mx-auto mb-3"/>
          <p className="font-semibold text-secondary">No flashcard decks yet</p>
          <p className="text-sm text-muted-foreground mt-1">Create a deck or generate one from your notes</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {decks.map(d => (
            <motion.div key={d.id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className="bg-card border border-border/50 rounded-2xl p-5 flex flex-col gap-3 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-heading font-bold text-secondary">{d.name}</p>
                  {d.subject && <p className="text-xs text-muted-foreground">{d.subject}</p>}
                </div>
                <button onClick={() => deleteDeck(d.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors"><Trash2 size={13}/></button>
              </div>
              <p className="text-sm text-muted-foreground">{d.cards.length} card{d.cards.length !== 1 ? 's' : ''}</p>
              <button onClick={() => startStudy(d)} className="btn-primary gap-2 text-sm mt-auto"><Brain size={14}/> Study</button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Citation Generator ──────────────────────────────────────────────────────

function CitationGenerator() {
  const blank: CitationData = { type: 'book', authors:'', title:'', year: new Date().getFullYear().toString(), publisher:'', place:'', edition:'', journal:'', volume:'', issue:'', pages:'', doi:'', url:'', siteName:'', accessDate: new Date().toLocaleDateString('en-GB'), channel:'' };
  const [data, setData] = useState<CitationData>(blank);
  const [style, setStyle] = useState<CitationStyle>('apa');
  const [copied, setCopied] = useState<CitationStyle | null>(null);
  const [history, setHistory] = useState<{ text: string; style: string }[]>([]);

  const U = (k: keyof CitationData, v: string) => setData(d => ({ ...d, [k]: v }));
  const result = buildCitation(data, style);

  function copy(s: CitationStyle) {
    navigator.clipboard.writeText(buildCitation(data, s));
    setCopied(s); setTimeout(() => setCopied(null), 1500);
    const text = buildCitation(data, s);
    setHistory(h => [{ text, style: s.toUpperCase() }, ...h].slice(0, 10));
  }

  const field = (label: string, key: keyof CitationData, placeholder = '') => (
    <div key={key}>
      <label className="text-xs font-semibold text-muted-foreground block mb-1">{label}</label>
      <input value={(data[key] as string) || ''} onChange={e => U(key, e.target.value)} placeholder={placeholder} className="input-field text-sm"/>
    </div>
  );

  const STYLES: CitationStyle[] = ['apa', 'mla', 'harvard'];
  const TYPES: { value: CitationType; label: string; icon: any }[] = [
    { value:'book', label:'Book', icon: BookMarked },
    { value:'journal', label:'Journal', icon: FileText },
    { value:'website', label:'Website', icon: Globe },
    { value:'youtube', label:'YouTube', icon: Youtube },
  ];

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        {/* Type */}
        <div className="grid grid-cols-4 gap-2">
          {TYPES.map(t => {
            const Icon = t.icon;
            return <button key={t.value} onClick={() => setData(d=>({...blank, type:t.value}))}
              className={`flex flex-col items-center gap-1 py-3 rounded-xl border text-xs font-semibold transition-all ${data.type===t.value?'border-primary bg-primary/8 text-primary':'border-border text-muted-foreground hover:border-primary/30'}`}>
              <Icon size={16}/>{t.label}
            </button>;
          })}
        </div>

        {/* Fields */}
        <div className="space-y-3">
          {field('Author(s)', 'authors', 'Smith, John; Doe, Jane  (semicolon-separated)')}
          {field('Title', 'title', 'Full title of the work')}
          {field('Year', 'year', '2024')}
          {data.type === 'book' && <>{field('Publisher','publisher')}{field('Place of publication','place')}{field('Edition (optional)','edition','3rd')}</>}
          {data.type === 'journal' && <>{field('Journal name','journal')}{field('Volume','volume')}{field('Issue','issue')}{field('Pages','pages','1–20')}{field('DOI (optional)','doi')}</>}
          {data.type === 'website' && <>{field('Website name','siteName')}{field('URL','url')}{field('Date accessed','accessDate')}</>}
          {data.type === 'youtube' && <>{field('Channel name','channel')}{field('Video URL','url')}{field('Date accessed','accessDate')}</>}
        </div>

        {/* Style picker */}
        <div className="flex gap-2">
          {STYLES.map(s => (
            <button key={s} onClick={() => setStyle(s)}
              className={`flex-1 py-2 rounded-xl border text-sm font-bold uppercase tracking-wide transition-all ${style===s?'border-primary bg-primary text-white':'border-border text-muted-foreground hover:border-primary/40'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {/* Outputs */}
        {STYLES.map(s => (
          <div key={s} className="bg-card border border-border/50 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">{s === 'apa' ? 'APA 7' : s === 'mla' ? 'MLA 9' : 'Harvard'}</span>
              <button onClick={() => copy(s)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors font-medium">
                {copied===s ? <><Check size={11} className="text-emerald-500"/> Copied!</> : <><Copy size={11}/> Copy</>}
              </button>
            </div>
            <p className="text-sm text-foreground leading-relaxed italic">{buildCitation(data, s) || <span className="text-muted-foreground not-italic">Fill in the fields to generate…</span>}</p>
          </div>
        ))}

        {/* History */}
        {history.length > 0 && (
          <div className="bg-muted/30 border border-border/50 rounded-2xl p-4">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Recent citations</p>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {history.map((h, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded shrink-0">{h.style}</span>
                  <p className="text-xs text-muted-foreground leading-snug line-clamp-2">{h.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Scientific Calculator ─────────────────────────────────────────────────────

function ScientificCalculator() {
  const [expr, setExpr] = useState('');
  const [result, setResult] = useState('');
  const [deg, setDeg] = useState(true);
  const [hist, setHist] = useState<string[]>([]);

  function press(val: string) {
    if (val === 'C') { setExpr(''); setResult(''); return; }
    if (val === '←') { setExpr(e => e.slice(0,-1)); return; }
    if (val === '=') {
      const r = safeCalc(expr, deg);
      setResult(r);
      if (r !== 'Error') setHist(h => [`${expr} = ${r}`, ...h].slice(0, 10));
      return;
    }
    setExpr(e => e + val);
    setResult('');
  }

  useEffect(() => {
    if (expr) {
      const r = safeCalc(expr, deg);
      if (r !== 'Error') setResult(r);
    }
  }, [expr, deg]);

  const BTNS = [
    ['sin(','cos(','tan(','log(','ln('],
    ['asin(','acos(','atan(','√','π'],
    ['(',')','^','E','!'],
    ['7','8','9','÷','←'],
    ['4','5','6','×','C'],
    ['1','2','3','-','='],
    ['0','.','00','+','='],
  ];

  const btnColor = (b: string) => {
    if (b === '=') return 'bg-primary text-white hover:bg-primary/90 font-bold';
    if (b === 'C') return 'bg-destructive/10 text-destructive hover:bg-destructive/20';
    if (b === '←') return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20';
    if (['÷','×','-','+','^'].includes(b)) return 'bg-primary/10 text-primary hover:bg-primary/20';
    if (['sin(','cos(','tan(','log(','ln(','asin(','acos(','atan(','√','π','E'].includes(b)) return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20';
    return 'bg-card hover:bg-muted text-foreground border border-border/50';
  };

  return (
    <div className="max-w-sm mx-auto space-y-4">
      {/* Display */}
      <div className="bg-card border border-border/60 rounded-2xl p-5 text-right space-y-1 min-h-[90px]">
        <p className="text-sm text-muted-foreground font-mono min-h-[20px] truncate">{expr || '0'}</p>
        <p className="font-heading font-bold text-3xl text-foreground font-mono truncate">{result || (expr ? '' : '0')}</p>
      </div>

      {/* Deg/Rad */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-muted p-1 rounded-xl">
          <button onClick={() => setDeg(true)} className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${deg ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground'}`}>DEG</button>
          <button onClick={() => setDeg(false)} className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${!deg ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground'}`}>RAD</button>
        </div>
        {hist.length > 0 && <button onClick={() => setExpr(hist[0].split(' = ')[1] || '')} className="text-xs text-muted-foreground hover:text-primary font-medium">Use last result</button>}
      </div>

      {/* Buttons */}
      <div className="space-y-1.5">
        {BTNS.map((row, ri) => (
          <div key={ri} className="grid grid-cols-5 gap-1.5">
            {row.map((b, bi) => (
              <button key={bi} onClick={() => press(b)}
                className={`py-3 rounded-xl text-xs font-semibold transition-all active:scale-95 ${btnColor(b)}`}>
                {b}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* History */}
      {hist.length > 0 && (
        <div className="bg-muted/30 rounded-xl p-3 space-y-1 max-h-36 overflow-y-auto">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">History</p>
          {hist.map((h, i) => (
            <button key={i} onClick={() => { const [e,r] = h.split(' = '); setExpr(e); setResult(r); }}
              className="w-full text-right text-xs text-muted-foreground hover:text-foreground transition-colors font-mono block">
              {h}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Unit Converter ───────────────────────────────────────────────────────────

function UnitConverter() {
  const cats = Object.keys(UNIT_CATEGORIES);
  const [cat, setCat] = useState('Length');
  const [from, setFrom] = useState('m');
  const [to, setTo] = useState('km');
  const [val, setVal] = useState('1');

  const units = cat === 'Temperature' ? TEMP_UNITS : Object.keys(UNIT_CATEGORIES[cat] as Record<string,number>);
  const result = val && !isNaN(Number(val)) ? convertUnit(Number(val), from, to, cat) : null;

  function changeCat(c: string) {
    setCat(c);
    const u = c === 'Temperature' ? TEMP_UNITS : Object.keys(UNIT_CATEGORIES[c] as Record<string,number>);
    setFrom(u[0]); setTo(u[1] || u[0]);
  }

  function swap() { setFrom(to); setTo(from); }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Category picker */}
      <div className="flex flex-wrap gap-2">
        {cats.map(c => (
          <button key={c} onClick={() => changeCat(c)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${cat===c?'bg-primary text-white border-primary':'border-border text-muted-foreground hover:border-primary/40 hover:text-primary'}`}>
            {c}
          </button>
        ))}
      </div>

      {/* Converter */}
      <div className="bg-card border border-border/60 rounded-3xl p-6 space-y-5">
        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">From</label>
            <select value={from} onChange={e => setFrom(e.target.value)} className="input-field text-sm">
              {units.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            <input type="number" value={val} onChange={e => setVal(e.target.value)}
              className="input-field font-heading font-bold text-2xl text-center" placeholder="0"/>
          </div>

          <button onClick={swap} className="mb-3 p-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors">
            <ArrowLeftRight size={18} className="text-primary"/>
          </button>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">To</label>
            <select value={to} onChange={e => setTo(e.target.value)} className="input-field text-sm">
              {units.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            <div className="input-field font-heading font-bold text-2xl text-center bg-muted/50 cursor-default select-all">
              {result !== null ? parseFloat(result.toPrecision(8)).toString() : '—'}
            </div>
          </div>
        </div>

        {result !== null && (
          <p className="text-center text-sm text-muted-foreground">
            <span className="font-bold text-foreground">{val} {from}</span> = <span className="font-bold text-primary">{parseFloat(result.toPrecision(8))} {to}</span>
          </p>
        )}
      </div>

      {/* Quick reference for this category */}
      {cat !== 'Temperature' && (
        <div className="bg-muted/30 rounded-2xl p-4">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Quick reference — all in {units[0]}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {units.slice(0,6).map(u => {
              const r = convertUnit(1, units[0], u, cat);
              return <div key={u} className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">1 {units[0]}</span> = {parseFloat(r.toPrecision(6))} {u}</div>;
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Word Analyser ───────────────────────────────────────────────────────────

function WordAnalyser() {
  const [text, setText] = useState('');
  const stats = analyseText(text);
  const fleshColor = stats.flesh >= 70 ? 'text-emerald-600 dark:text-emerald-400' : stats.flesh >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400';

  async function paste() {
    const t = await navigator.clipboard.readText().catch(() => '');
    if (t) setText(t);
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-secondary">Paste or type your text</label>
          <button onClick={paste} className="text-xs text-primary hover:underline font-medium">Paste from clipboard</button>
        </div>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Paste your essay, paragraph, or any text here to analyse it…"
          className="input-field resize-none min-h-[380px] text-sm leading-relaxed"
        />
        {text && <button onClick={() => setText('')} className="text-xs text-muted-foreground hover:text-destructive transition-colors">Clear text</button>}
      </div>

      <div className="space-y-4">
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Words', value: stats.words, icon: '📝' },
            { label: 'Sentences', value: stats.sentences, icon: '💬' },
            { label: 'Paragraphs', value: stats.paragraphs, icon: '¶' },
            { label: 'Characters', value: stats.chars, icon: '🔤' },
            { label: 'Chars (no spaces)', value: stats.charsNoSpaces, icon: '🔡' },
            { label: 'Read time', value: `~${stats.readMin} min`, icon: '⏱️' },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border/50 rounded-xl p-3 text-center">
              <span className="text-lg block mb-0.5">{s.icon}</span>
              <p className="font-heading font-bold text-secondary text-lg">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Readability */}
        <div className="bg-card border border-border/50 rounded-2xl p-4">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Readability (Flesch)</p>
          <div className="flex items-end gap-3 mb-2">
            <p className={`font-heading font-bold text-4xl ${fleshColor}`}>{stats.flesh}</p>
            <p className="text-sm text-muted-foreground pb-1">/ 100 — {stats.grade}</p>
          </div>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${stats.flesh>=70?'bg-emerald-500':stats.flesh>=50?'bg-amber-500':'bg-rose-500'}`} style={{ width:`${stats.flesh}%` }}/>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Higher = easier to read. Target 60–70 for exam essays.</p>
        </div>

        {/* Top words */}
        {stats.topWords.length > 0 && (
          <div className="bg-card border border-border/50 rounded-2xl p-4">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Most frequent words</p>
            <div className="flex flex-wrap gap-2">
              {stats.topWords.map(([w, c]) => (
                <span key={w} className="px-2.5 py-1 rounded-full bg-primary/8 text-xs font-semibold text-primary">
                  {w} <span className="opacity-60">×{c}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Image → PDF ─────────────────────────────────────────────────────────────

function ImageToPDF() {
  const [images, setImages] = useState<{ id: string; src: string; name: string }[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function addFiles(files: FileList | null) {
    if (!files) return;
    Array.from(files).filter(f => f.type.startsWith('image/')).forEach(f => {
      const reader = new FileReader();
      reader.onload = e => {
        const src = e.target?.result as string;
        setImages(prev => [...prev, { id: uid(), src, name: f.name }]);
      };
      reader.readAsDataURL(f);
    });
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault(); setDragging(false);
    addFiles(e.dataTransfer.files);
  }

  function remove(id: string) { setImages(imgs => imgs.filter(i => i.id !== id)); }

  function move(id: string, dir: -1 | 1) {
    setImages(imgs => {
      const idx = imgs.findIndex(i => i.id === id);
      if (idx < 0) return imgs;
      const next = [...imgs];
      const swap = idx + dir;
      if (swap < 0 || swap >= next.length) return imgs;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next;
    });
  }

  function exportPDF() {
    if (!images.length) return;
    const el = document.createElement('div');
    el.id = 'plug-img-pdf';
    el.innerHTML = images.map((img, i) =>
      `<div style="page-break-after:${i<images.length-1?'always':'avoid'};height:100vh;display:flex;align-items:center;justify-content:center;background:#fff;margin:0;padding:0">
        <img src="${img.src}" style="max-width:100%;max-height:100vh;object-fit:contain"/>
      </div>`
    ).join('');
    document.body.appendChild(el);
    const style = document.createElement('style');
    style.innerHTML = `@media print{body>*:not(#plug-img-pdf){display:none!important}#plug-img-pdf{display:block!important}@page{margin:0}}`;
    document.head.appendChild(style);
    window.print();
    setTimeout(() => { document.body.removeChild(el); document.head.removeChild(style); }, 800);
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all ${dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40 hover:bg-muted/30'}`}
      >
        <ImageIcon size={32} className="text-muted-foreground/40 mx-auto mb-3"/>
        <p className="font-semibold text-secondary">Drag & drop images here</p>
        <p className="text-sm text-muted-foreground mt-1">or click to select — JPG, PNG, WEBP, GIF supported</p>
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => addFiles(e.target.files)}/>
      </div>

      {images.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground"><span className="font-bold text-foreground">{images.length}</span> image{images.length !== 1 ? 's' : ''} — {images.length} page{images.length !== 1 ? 's' : ''}</p>
            <div className="flex gap-2">
              <button onClick={() => setImages([])} className="btn-ghost text-sm gap-1.5 text-destructive hover:bg-destructive/8"><Trash2 size={14}/> Clear all</button>
              <button onClick={exportPDF} className="btn-primary gap-2 text-sm"><Download size={14}/> Export as PDF</button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((img, i) => (
              <motion.div key={img.id} layout initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
                className="bg-card border border-border/50 rounded-2xl overflow-hidden group">
                <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                  <img src={img.src} alt={img.name} className="w-full h-full object-contain"/>
                  <div className="absolute top-2 left-2 bg-black/60 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    Page {i + 1}
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button onClick={() => move(img.id, -1)} disabled={i===0} className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-md disabled:opacity-30"><ChevronLeft size={14}/></button>
                    <button onClick={() => move(img.id, 1)} disabled={i===images.length-1} className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-md disabled:opacity-30"><ChevronRight size={14}/></button>
                    <button onClick={() => remove(img.id)} className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-md text-destructive"><X size={14}/></button>
                  </div>
                </div>
                <p className="px-3 py-2 text-xs text-muted-foreground truncate">{img.name}</p>
              </motion.div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center">Use ‹ › arrows to reorder pages · Your browser's Print dialog will offer "Save as PDF"</p>
        </>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

const TABS: { id: ToolTab; label: string; icon: any; desc: string }[] = [
  { id:'writer',     label:'Essay Writer',    icon: PenLine,       desc:'Rich text editor with PDF export' },
  { id:'flashcards', label:'Flashcards',      icon: SquareStack,   desc:'Create decks or generate from notes' },
  { id:'citations',  label:'Citations',       icon: Quote,         desc:'APA 7, MLA 9, Harvard formats' },
  { id:'calculator', label:'Calculator',      icon: Calculator,    desc:'Scientific with history' },
  { id:'converter',  label:'Unit Converter',  icon: Scale,         desc:'10 categories, live conversion' },
  { id:'analyser',   label:'Word Analyser',   icon: BarChart2,     desc:'Readability, stats, top words' },
  { id:'imagepdf',   label:'Image → PDF',     icon: Layers,        desc:'Drag, reorder, export as PDF' },
];

export default function ToolsPage() {
  const [tab, setTab] = useState<ToolTab>('writer');
  const active = TABS.find(t => t.id === tab)!;

  return (
    <div className="animate-enter space-y-6">
      {/* Hero */}
      <div className="relative bg-gradient-to-r from-indigo-600 via-violet-600 to-primary rounded-3xl p-6 text-white overflow-hidden shadow-xl">
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"/>
        <div className="absolute bottom-0 left-1/4 w-32 h-16 bg-white/5 rounded-full blur-xl pointer-events-none"/>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center"><Wrench size={16}/></div>
            <span className="text-white/70 text-sm font-medium">Study Toolkit</span>
          </div>
          <h1 className="font-heading font-bold text-2xl md:text-3xl mb-1">All the tools you need — in one place</h1>
          <p className="text-white/70 text-sm max-w-xl">Write essays, make flashcards, generate citations, solve maths, convert units, check readability, and export images as PDF — all free, all offline-capable.</p>
        </div>
      </div>

      {/* Tab grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex flex-col items-center gap-2 p-3 rounded-2xl border text-center transition-all ${tab===t.id?'border-primary bg-primary/8 text-primary shadow-sm':'border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground bg-card'}`}
            >
              <Icon size={20} className={tab===t.id?'text-primary':''}/>
              <span className="text-xs font-semibold leading-tight">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active tool */}
      <div className="bg-card border border-border/50 rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
          {(() => { const Icon = active.icon; return <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Icon size={20} className="text-primary"/></div>; })()}
          <div>
            <h2 className="font-heading font-bold text-secondary text-lg">{active.label}</h2>
            <p className="text-xs text-muted-foreground">{active.desc}</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} transition={{ duration:0.18 }}>
            {tab === 'writer'     && <EssayWriter/>}
            {tab === 'flashcards' && <FlashcardMaker/>}
            {tab === 'citations'  && <CitationGenerator/>}
            {tab === 'calculator' && <ScientificCalculator/>}
            {tab === 'converter'  && <UnitConverter/>}
            {tab === 'analyser'   && <WordAnalyser/>}
            {tab === 'imagepdf'   && <ImageToPDF/>}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
