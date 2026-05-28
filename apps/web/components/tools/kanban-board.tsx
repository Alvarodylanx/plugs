'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, ChevronRight, ChevronLeft, GripVertical } from 'lucide-react';
import { subjectIcon } from '@/lib/utils';
import { SUBJECTS } from '@/types';

interface KanbanCard {
  id: string;
  title: string;
  subject: string;
  priority: 'low' | 'medium' | 'high';
  column: 'todo' | 'inprogress' | 'done';
  createdAt: string;
}

const PRIORITY_STYLE = {
  low:    'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
  medium: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25',
  high:   'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25',
};

const COLUMNS: { id: KanbanCard['column']; label: string; emoji: string; color: string }[] = [
  { id: 'todo',       label: 'To Study',    emoji: '📚', color: 'border-t-blue-400' },
  { id: 'inprogress', label: 'In Progress', emoji: '⚡', color: 'border-t-amber-400' },
  { id: 'done',       label: 'Done',        emoji: '✅', color: 'border-t-emerald-400' },
];

const STORAGE_KEY = 'plug_kanban_cards';

function uid() { return Math.random().toString(36).slice(2); }

function load(): KanbanCard[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}

export function KanbanBoard() {
  const [cards, setCards] = useState<KanbanCard[]>(load);
  const [adding, setAdding] = useState<KanbanCard['column'] | null>(null);
  const [form, setForm] = useState({ title: '', subject: '', priority: 'medium' as KanbanCard['priority'] });

  function save(updated: KanbanCard[]) {
    setCards(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  function addCard() {
    if (!form.title.trim() || !adding) return;
    const card: KanbanCard = { id: uid(), title: form.title.trim(), subject: form.subject, priority: form.priority, column: adding, createdAt: new Date().toISOString() };
    save([...cards, card]);
    setForm({ title: '', subject: '', priority: 'medium' });
    setAdding(null);
  }

  function deleteCard(id: string) { save(cards.filter(c => c.id !== id)); }

  function moveCard(id: string, dir: -1 | 1) {
    const cols: KanbanCard['column'][] = ['todo', 'inprogress', 'done'];
    setCards(prev => {
      const updated = prev.map(c => {
        if (c.id !== id) return c;
        const idx = cols.indexOf(c.column);
        const next = cols[idx + dir];
        return next ? { ...c, column: next } : c;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }

  const colCards = (col: KanbanCard['column']) => cards.filter(c => c.column === col);
  const cols: KanbanCard['column'][] = ['todo', 'inprogress', 'done'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="font-bold text-foreground">{cards.length}</span> card{cards.length !== 1 ? 's' : ''} ·{' '}
          <span className="font-bold text-emerald-600 dark:text-emerald-400">{colCards('done').length} done</span>
        </p>
        {cards.length > 0 && (
          <button onClick={() => save([])} className="text-xs text-muted-foreground hover:text-destructive transition-colors">Clear all</button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {COLUMNS.map(col => {
          const colC = colCards(col.id);
          const isAdding = adding === col.id;
          return (
            <div key={col.id} className={`bg-card border border-border/50 rounded-2xl overflow-hidden border-t-4 ${col.color}`}>
              {/* Column header */}
              <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
                <span className="font-heading font-bold text-sm text-secondary flex items-center gap-2">
                  <span>{col.emoji}</span> {col.label}
                  <span className="text-xs font-normal text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">{colC.length}</span>
                </span>
                <button onClick={() => setAdding(isAdding ? null : col.id)} className="p-1 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-primary">
                  <Plus size={15}/>
                </button>
              </div>

              {/* Add form */}
              <AnimatePresence>
                {isAdding && (
                  <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }}
                    className="overflow-hidden border-b border-border/50"
                  >
                    <div className="p-3 space-y-2 bg-muted/30">
                      <input
                        autoFocus
                        value={form.title}
                        onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                        onKeyDown={e => { if (e.key === 'Enter') addCard(); if (e.key === 'Escape') setAdding(null); }}
                        placeholder="What to study…"
                        className="input-field text-sm py-2"
                      />
                      <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="input-field text-xs py-1.5">
                        <option value="">No subject</option>
                        {SUBJECTS.map(s => <option key={s} value={s}>{subjectIcon(s)} {s}</option>)}
                      </select>
                      <div className="flex gap-2">
                        {(['low','medium','high'] as const).map(p => (
                          <button key={p} onClick={() => setForm(f => ({ ...f, priority: p }))}
                            className={`flex-1 py-1 rounded-lg text-xs font-semibold border capitalize transition-all ${form.priority === p ? PRIORITY_STYLE[p] : 'border-border text-muted-foreground hover:bg-muted'}`}>
                            {p}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setAdding(null)} className="flex-1 py-1.5 rounded-lg text-xs text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
                        <button onClick={addCard} disabled={!form.title.trim()} className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-primary text-white disabled:opacity-40 hover:bg-primary/90 transition-colors">Add</button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Cards */}
              <div className="p-3 space-y-2 min-h-[120px]">
                <AnimatePresence>
                  {colC.length === 0 && !isAdding && (
                    <p className="text-xs text-muted-foreground text-center py-6">
                      {col.id === 'done' ? 'Complete tasks will appear here' : 'No tasks yet — add one above'}
                    </p>
                  )}
                  {colC.map(card => {
                    const colIdx = cols.indexOf(card.column);
                    return (
                      <motion.div key={card.id} layout initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, scale:0.9 }}
                        className="bg-card border border-border/40 rounded-xl p-3 space-y-2 shadow-sm hover:shadow-md transition-shadow group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-semibold leading-snug ${card.column === 'done' ? 'line-through text-muted-foreground' : 'text-secondary'}`}>
                            {card.title}
                          </p>
                          <button onClick={() => deleteCard(card.id)} className="p-1 rounded-lg opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all">
                            <Trash2 size={12}/>
                          </button>
                        </div>
                        {card.subject && (
                          <p className="text-xs text-muted-foreground">{subjectIcon(card.subject)} {card.subject.split(' / ')[0]}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${PRIORITY_STYLE[card.priority]}`}>
                            {card.priority}
                          </span>
                          <div className="flex gap-1">
                            {colIdx > 0 && (
                              <button onClick={() => moveCard(card.id, -1)} className="p-1 rounded-lg hover:bg-muted transition-colors text-muted-foreground" title="Move left">
                                <ChevronLeft size={12}/>
                              </button>
                            )}
                            {colIdx < 2 && (
                              <button onClick={() => moveCard(card.id, 1)} className="p-1 rounded-lg hover:bg-muted transition-colors text-muted-foreground" title="Move right">
                                <ChevronRight size={12}/>
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>

      {cards.length > 0 && (
        <div className="flex gap-2 justify-center">
          {COLUMNS.map(col => (
            <div key={col.id} className="text-center">
              <div className="h-1.5 w-20 bg-muted rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${col.id==='done'?'bg-emerald-500':col.id==='inprogress'?'bg-amber-500':'bg-blue-500'}`}
                  style={{ width: `${cards.length ? (colCards(col.id).length / cards.length * 100) : 0}%` }}/>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">{col.emoji} {colCards(col.id).length}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
