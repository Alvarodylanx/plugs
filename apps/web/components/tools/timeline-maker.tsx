'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Printer, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

interface TimelineEvent {
  id: string;
  title: string;
  date: string;
  description: string;
  category: string;
  color: string;
}

const COLORS = [
  { label: 'Teal',   value: '#0fb8a0' },
  { label: 'Indigo', value: '#6366f1' },
  { label: 'Amber',  value: '#f59e0b' },
  { label: 'Rose',   value: '#f43f5e' },
  { label: 'Blue',   value: '#3b82f6' },
  { label: 'Green',  value: '#22c55e' },
  { label: 'Purple', value: '#a855f7' },
  { label: 'Orange', value: '#f97316' },
];

const BLANK_EVENT = { title: '', date: '', description: '', category: '', color: '#6366f1' };

function uid() { return Math.random().toString(36).slice(2); }

function formatDate(d: string) {
  if (!d) return '';
  try {
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return d; }
}

export function TimelineMaker() {
  const [events, setEvents] = useState<TimelineEvent[]>([
    { id: uid(), title: 'World War I begins', date: '1914-07-28', description: 'Austria-Hungary declares war on Serbia following the assassination of Archduke Franz Ferdinand.', category: 'War', color: '#f43f5e' },
    { id: uid(), title: 'Treaty of Versailles', date: '1919-06-28', description: 'Peace treaty ending WWI, signed in the Palace of Versailles.', category: 'Peace', color: '#22c55e' },
    { id: uid(), title: 'World War II begins', date: '1939-09-01', description: 'Germany invades Poland, triggering declarations of war from Britain and France.', category: 'War', color: '#f43f5e' },
  ]);
  const [form, setForm] = useState<Omit<TimelineEvent,'id'>>(BLANK_EVENT);
  const [adding, setAdding] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [title, setTitle] = useState('My Timeline');
  const [editingTitle, setEditingTitle] = useState(false);

  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));

  function addEvent() {
    if (!form.title.trim() || !form.date) return;
    setEvents(prev => [...prev, { ...form, id: uid() }]);
    setForm(BLANK_EVENT);
    setAdding(false);
  }

  function deleteEvent(id: string) { setEvents(prev => prev.filter(e => e.id !== id)); }

  function exportPDF() {
    const el = document.createElement('div');
    el.id = 'plug-timeline-print';
    el.innerHTML = `
      <style>
        body { font-family: Georgia, serif; margin: 2cm; }
        h1 { font-size: 24pt; margin-bottom: 1cm; }
        .event { display: flex; gap: 20px; margin-bottom: 24px; }
        .dot { width: 16px; height: 16px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; }
        .line { border-left: 2px solid #e5e7eb; margin-left: 7px; flex-shrink: 0; }
        .date { font-size: 10pt; color: #6b7280; margin-bottom: 4px; font-weight: bold; }
        .title { font-size: 14pt; font-weight: bold; margin-bottom: 4px; }
        .desc { font-size: 11pt; color: #374151; }
        .cat { font-size: 9pt; color: #9ca3af; margin-top: 2px; }
      </style>
      <h1>${title}</h1>
      ${sorted.map((e, i) => `
        <div class="event">
          <div>
            <div class="dot" style="background:${e.color}"></div>
            ${i < sorted.length - 1 ? '<div class="line" style="height:60px"></div>' : ''}
          </div>
          <div>
            <div class="date">${formatDate(e.date)}</div>
            <div class="title">${e.title}</div>
            ${e.description ? `<div class="desc">${e.description}</div>` : ''}
            ${e.category ? `<div class="cat">${e.category}</div>` : ''}
          </div>
        </div>
      `).join('')}
    `;
    document.body.appendChild(el);
    const style = document.createElement('style');
    style.innerHTML = `@media print { body > *:not(#plug-timeline-print) { display: none !important; } @page { margin: 0; } }`;
    document.head.appendChild(style);
    window.print();
    setTimeout(() => { document.body.removeChild(el); document.head.removeChild(style); }, 800);
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          {editingTitle ? (
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              onBlur={() => setEditingTitle(false)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') setEditingTitle(false); }}
              className="input-field text-lg font-heading font-bold py-1 max-w-[240px]"
            />
          ) : (
            <h2 onClick={() => setEditingTitle(true)} className="font-heading font-bold text-xl text-secondary cursor-pointer hover:text-primary transition-colors" title="Click to edit title">
              {title}
            </h2>
          )}
          <span className="text-xs text-muted-foreground">{events.length} event{events.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setAdding(a => !a)} className="btn-primary gap-2 text-sm">
            <Plus size={14}/> Add Event
          </button>
          <button onClick={exportPDF} className="btn-outline gap-2 text-sm">
            <Printer size={14}/> Export PDF
          </button>
        </div>
      </div>

      {/* Add event form */}
      <AnimatePresence>
        {adding && (
          <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }} className="overflow-hidden">
            <div className="bg-card border border-primary/20 rounded-2xl p-5 space-y-3">
              <p className="font-semibold text-secondary text-sm">New Event</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Event title *</label>
                  <input value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))} className="input-field text-sm" placeholder="e.g. Treaty of Versailles"/>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Date *</label>
                  <input type="date" value={form.date} onChange={e => setForm(f=>({...f,date:e.target.value}))} className="input-field text-sm"/>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Category (optional)</label>
                  <input value={form.category} onChange={e => setForm(f=>({...f,category:e.target.value}))} className="input-field text-sm" placeholder="e.g. War, Science, Politics"/>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Colour</label>
                  <div className="flex gap-2 flex-wrap">
                    {COLORS.map(c => (
                      <button key={c.value} onClick={() => setForm(f=>({...f,color:c.value}))}
                        className="w-6 h-6 rounded-full border-2 transition-all"
                        style={{ backgroundColor: c.value, borderColor: form.color === c.value ? 'white' : 'transparent', boxShadow: form.color === c.value ? `0 0 0 2px ${c.value}` : 'none' }}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Description (optional)</label>
                <textarea value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} className="input-field text-sm resize-none" rows={2} placeholder="Brief summary of what happened…"/>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setAdding(false)} className="btn-ghost flex-1 text-sm">Cancel</button>
                <button onClick={addEvent} disabled={!form.title.trim() || !form.date} className="btn-primary flex-1 text-sm">Add to Timeline</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timeline */}
      {events.length === 0 ? (
        <div className="text-center py-14 border-2 border-dashed border-border rounded-3xl">
          <Calendar size={32} className="text-muted-foreground/30 mx-auto mb-3"/>
          <p className="font-semibold text-secondary">No events yet</p>
          <p className="text-sm text-muted-foreground mt-1">Add your first historical event above</p>
        </div>
      ) : (
        <div className="relative pl-8">
          {/* Vertical line */}
          <div className="absolute left-3 top-3 bottom-3 w-0.5 bg-border rounded-full" />

          <div className="space-y-4">
            {sorted.map((event, i) => {
              const isExpanded = expanded === event.id;
              return (
                <motion.div key={event.id} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay: i * 0.04 }}
                  className="relative"
                >
                  {/* Dot */}
                  <div
                    className="absolute -left-[21px] top-3 w-4 h-4 rounded-full border-2 border-background shadow-md z-10"
                    style={{ backgroundColor: event.color }}
                  />

                  <div className="bg-card border border-border/50 rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-sm transition-all">
                    <button
                      onClick={() => setExpanded(isExpanded ? null : event.id)}
                      className="w-full flex items-start gap-3 p-4 text-left"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-muted-foreground">{formatDate(event.date)}</span>
                          {event.category && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border" style={{ backgroundColor: event.color + '20', borderColor: event.color + '40', color: event.color }}>
                              {event.category}
                            </span>
                          )}
                        </div>
                        <p className="font-heading font-bold text-secondary mt-0.5">{event.title}</p>
                        {!isExpanded && event.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{event.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={e => { e.stopPropagation(); deleteEvent(event.id); }} className="p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-colors">
                          <Trash2 size={13}/>
                        </button>
                        {isExpanded ? <ChevronUp size={15} className="text-muted-foreground"/> : <ChevronDown size={15} className="text-muted-foreground"/>}
                      </div>
                    </button>

                    <AnimatePresence>
                      {isExpanded && event.description && (
                        <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }} className="overflow-hidden">
                          <div className="px-4 pb-4 pt-0 border-t border-border/30">
                            <p className="text-sm text-muted-foreground leading-relaxed mt-3">{event.description}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
