'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ChevronLeft, ChevronRight, Check, Pencil, Trash2, Calendar } from 'lucide-react';
import { sessions as sessionsApi } from '@/lib/api';
import { getWeekDates, subjectColor, subjectIcon } from '@/lib/utils';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { SUBJECTS } from '@/types';
import type { Session } from '@/types';

const today = new Date().toISOString().split('T')[0];

function SessionForm({ initial, onSave, onClose }: { initial?: Partial<Session>; onSave: (d: any) => void; onClose: () => void }) {
  const [form, setForm] = useState({ subject: initial?.subject || '', date: initial?.date || today, time: initial?.time || '09:00', endTime: initial?.endTime || '10:30', notes: initial?.notes || '' });
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium block mb-1.5">Subject</label>
        <select value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} className="input-field">
          <option value="">Select subject...</option>
          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label className="text-sm font-medium block mb-1.5">Date</label>
        <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="input-field" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium block mb-1.5">Start Time</label>
          <input type="time" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} className="input-field" />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1.5">End Time</label>
          <input type="time" value={form.endTime} onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))} className="input-field" />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium block mb-1.5">Notes (optional)</label>
        <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} className="input-field resize-none" rows={3} placeholder="Topics to cover, resources to use..." />
      </div>
      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
        <Button onClick={() => onSave(form)} disabled={!form.subject} className="flex-1">
          {initial?.id ? 'Update Session' : 'Add Session'}
        </Button>
      </div>
    </div>
  );
}

export default function TimetablePage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [view, setView] = useState<'week' | 'list'>('week');
  const [modalOpen, setModalOpen] = useState(false);
  const [editSession, setEditSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const weekDays = getWeekDates(weekOffset);
  const weekStart = weekDays[0].date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const weekEnd = weekDays[6].date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  useEffect(() => {
    sessionsApi.list().then(s => { setSessions(s as Session[]); setLoading(false); });
  }, []);

  async function handleSave(data: any) {
    if (editSession) {
      const updated = await sessionsApi.update(editSession.id, data) as Session;
      setSessions(p => p.map(s => s.id === updated.id ? updated : s));
    } else {
      const created = await sessionsApi.create(data) as Session;
      setSessions(p => [...p, created]);
    }
    setModalOpen(false);
    setEditSession(null);
  }

  async function toggleComplete(session: Session) {
    const updated = await sessionsApi.toggle(session.id) as Session;
    setSessions(p => p.map(s => s.id === updated.id ? updated : s));
  }

  async function deleteSession(id: string) {
    await sessionsApi.delete(id);
    setSessions(p => p.filter(s => s.id !== id));
  }

  function sessionsForDay(dateStr: string) {
    return sessions.filter(s => s.date === dateStr).sort((a, b) => a.time.localeCompare(b.time));
  }

  return (
    <div className="animate-enter space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading font-bold text-2xl text-secondary">Study Timetable</h1>
          <p className="text-muted-foreground text-sm mt-1">Plan and track your weekly study sessions</p>
        </div>
        <Button onClick={() => { setEditSession(null); setModalOpen(true); }} className="gap-2 shadow-md shadow-primary/30">
          <Plus size={16} /> Add Session
        </Button>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <button onClick={() => setWeekOffset(p => p - 1)} className="p-2 rounded-xl hover:bg-muted border border-border transition-colors">
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => setWeekOffset(0)} className="px-3 py-1.5 rounded-xl text-sm font-semibold bg-muted hover:bg-muted/80 transition-colors">Today</button>
          <button onClick={() => setWeekOffset(p => p + 1)} className="p-2 rounded-xl hover:bg-muted border border-border transition-colors">
            <ChevronRight size={16} />
          </button>
          <span className="text-sm text-muted-foreground font-medium ml-2">{weekStart} – {weekEnd}</span>
        </div>
        <div className="flex border border-border rounded-xl overflow-hidden">
          {(['week', 'list'] as const).map(v => (
            <button key={v} onClick={() => setView(v)} className={`px-4 py-2 text-sm font-semibold capitalize transition-all ${view === v ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'}`}>{v}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-64 bg-muted rounded-2xl animate-pulse" />
      ) : view === 'week' ? (
        /* Week Grid View */
        <div className="grid grid-cols-7 gap-2 overflow-x-auto">
          {weekDays.map(({ date, label, dateStr }) => {
            const isToday = dateStr === today;
            const daySessions = sessionsForDay(dateStr);
            return (
              <div key={dateStr} className={`min-h-[200px] rounded-2xl border p-2 ${isToday ? 'border-primary/40 bg-primary/3' : 'border-border/50 bg-card'}`}>
                <div className={`text-center mb-2 pb-2 border-b ${isToday ? 'border-primary/20' : 'border-border/30'}`}>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className={`font-heading font-bold text-sm ${isToday ? 'text-primary' : 'text-secondary'}`}>{date.getDate()}</p>
                  {isToday && <span className="text-xs bg-primary text-white px-1.5 py-0.5 rounded-md">Today</span>}
                </div>
                <div className="space-y-1.5">
                  {daySessions.map(s => (
                    <div key={s.id} className={`p-2 rounded-xl text-xs group relative ${s.completed ? 'bg-emerald-50 border border-emerald-200' : 'bg-muted border border-border/50'}`}>
                      <div className="flex items-center gap-1 mb-0.5">
                        <span>{subjectIcon(s.subject)}</span>
                        <p className={`font-semibold truncate flex-1 ${s.completed ? 'line-through text-muted-foreground' : 'text-secondary'}`}>{s.subject.split(' / ')[0]}</p>
                      </div>
                      <p className="text-muted-foreground">{s.time}–{s.endTime}</p>
                      <div className="flex gap-0.5 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => toggleComplete(s)} className="p-0.5 rounded hover:bg-emerald-100 hover:text-emerald-600 transition-colors"><Check size={10} /></button>
                        <button onClick={() => { setEditSession(s); setModalOpen(true); }} className="p-0.5 rounded hover:bg-blue-100 hover:text-blue-600 transition-colors"><Pencil size={10} /></button>
                        <button onClick={() => deleteSession(s.id)} className="p-0.5 rounded hover:bg-red-100 hover:text-red-600 transition-colors"><Trash2 size={10} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="space-y-4">
          {weekDays.map(({ date, label, dateStr }) => {
            const daySessions = sessionsForDay(dateStr);
            const isToday = dateStr === today;
            if (daySessions.length === 0) return null;
            return (
              <div key={dateStr}>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={14} className={isToday ? 'text-primary' : 'text-muted-foreground'} />
                  <h3 className={`text-sm font-semibold ${isToday ? 'text-primary' : 'text-secondary'}`}>{label}, {date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</h3>
                  {isToday && <span className="badge bg-primary/10 text-primary text-xs">Today</span>}
                </div>
                <div className="space-y-2">
                  {daySessions.map(s => (
                    <div key={s.id} className={`bg-card rounded-2xl border p-4 flex items-center gap-4 ${s.completed ? 'border-emerald-200' : 'border-border/50'} ${s.completed ? 'border-l-4 border-l-emerald-500' : ''}`}>
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-lg shrink-0">{subjectIcon(s.subject)}</div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-sm ${s.completed ? 'line-through text-muted-foreground' : 'text-secondary'}`}>{s.subject}</p>
                        <p className="text-xs text-muted-foreground">{s.time} – {s.endTime} · {s.notes || 'No notes'}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {s.completed && <span className="badge bg-emerald-100 text-emerald-700 text-xs">Done</span>}
                        <button onClick={() => toggleComplete(s)} className={`p-1.5 rounded-lg transition-colors ${s.completed ? 'bg-emerald-100 text-emerald-600' : 'hover:bg-emerald-50 hover:text-emerald-600 text-muted-foreground'}`}><Check size={14} /></button>
                        <button onClick={() => { setEditSession(s); setModalOpen(true); }} className="p-1.5 rounded-lg hover:bg-blue-50 hover:text-blue-600 text-muted-foreground transition-colors"><Pencil size={14} /></button>
                        <button onClick={() => deleteSession(s.id)} className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 text-muted-foreground transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {weekDays.every(({ dateStr }) => sessionsForDay(dateStr).length === 0) && (
            <div className="text-center py-16">
              <Calendar size={36} className="text-muted-foreground mx-auto mb-3" />
              <p className="font-semibold text-secondary">No sessions this week</p>
              <p className="text-sm text-muted-foreground mt-1">Click "Add Session" to plan your study time</p>
            </div>
          )}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditSession(null); }} title={editSession ? 'Edit Session' : 'Add Study Session'}>
        <SessionForm initial={editSession || undefined} onSave={handleSave} onClose={() => { setModalOpen(false); setEditSession(null); }} />
      </Modal>
    </div>
  );
}
