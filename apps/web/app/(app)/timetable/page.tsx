'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ChevronLeft, ChevronRight, Check, Pencil, Trash2, Calendar, Clock, Target, Flame, LayoutGrid, List } from 'lucide-react';
import { sessions as sessionsApi } from '@/lib/api';
import { getWeekDates, subjectIcon } from '@/lib/utils';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { SUBJECTS } from '@/types';
import type { Session } from '@/types';

const today = new Date().toISOString().split('T')[0];

const SUBJECT_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  'Computer Science / ICT': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', dot: 'bg-blue-500' },
  'Biology': { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  'History': { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
  'Mathematics': { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', dot: 'bg-indigo-500' },
  'Physics': { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', dot: 'bg-purple-500' },
  'Chemistry': { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', dot: 'bg-rose-500' },
  'English': { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700', dot: 'bg-sky-500' },
  'Geography': { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', dot: 'bg-green-500' },
  'Economics': { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', dot: 'bg-yellow-500' },
};
const DEFAULT_COLOR = { bg: 'bg-muted', border: 'border-border', text: 'text-foreground', dot: 'bg-primary' };

function subjectStyle(subject: string) {
  return SUBJECT_COLORS[subject] || DEFAULT_COLOR;
}

function durationMinutes(time: string, endTime: string): number {
  const [h1, m1] = time.split(':').map(Number);
  const [h2, m2] = endTime.split(':').map(Number);
  return (h2 * 60 + m2) - (h1 * 60 + m1);
}

function SessionForm({ initial, onSave, onClose }: { initial?: Partial<Session>; onSave: (d: any) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    subject: initial?.subject || '',
    date: initial?.date || today,
    time: initial?.time || '09:00',
    endTime: initial?.endTime || '10:30',
    notes: initial?.notes || '',
  });

  const dur = form.time && form.endTime ? durationMinutes(form.time, form.endTime) : 0;

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium block mb-1.5">Subject</label>
        <select value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} className="input-field">
          <option value="">Select subject...</option>
          {SUBJECTS.map(s => <option key={s} value={s}>{subjectIcon(s)} {s}</option>)}
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
      {dur > 0 && (
        <p className="text-xs text-primary font-semibold flex items-center gap-1">
          <Clock size={12} /> Duration: {dur >= 60 ? `${Math.floor(dur / 60)}h ${dur % 60}m` : `${dur}m`}
        </p>
      )}
      <div>
        <label className="text-sm font-medium block mb-1.5">Notes (optional)</label>
        <textarea
          value={form.notes}
          onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
          className="input-field resize-none"
          rows={3}
          placeholder="Topics to cover, resources to use..."
        />
      </div>
      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
        <Button onClick={() => onSave(form)} disabled={!form.subject || dur <= 0} className="flex-1">
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
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const weekDays = getWeekDates(weekOffset);
  const weekStart = weekDays[0].date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const weekEnd = weekDays[6].date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  useEffect(() => {
    sessionsApi.list().then(s => { setSessions(s as Session[]); setLoading(false); });
  }, []);

  const weekSessionsAll = sessions.filter(s => weekDays.some(d => d.dateStr === s.date));
  const weekCompleted = weekSessionsAll.filter(s => s.completed).length;
  const weekTotal = weekSessionsAll.length;
  const completionPct = weekTotal ? Math.round((weekCompleted / weekTotal) * 100) : 0;
  const totalWeekMinutes = weekSessionsAll.reduce((acc, s) => acc + durationMinutes(s.time, s.endTime), 0);

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
    setDeletingId(id);
    await sessionsApi.delete(id);
    setSessions(p => p.filter(s => s.id !== id));
    setDeletingId(null);
  }

  function sessionsForDay(dateStr: string) {
    return sessions.filter(s => s.date === dateStr).sort((a, b) => a.time.localeCompare(b.time));
  }

  return (
    <div className="animate-enter space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading font-bold text-2xl text-secondary">Study Timetable</h1>
          <p className="text-muted-foreground text-sm mt-1">Plan and track your weekly study sessions</p>
        </div>
        <Button onClick={() => { setEditSession(null); setModalOpen(true); }} className="gap-2 shadow-md shadow-primary/20">
          <Plus size={16} /> Add Session
        </Button>
      </div>

      {/* This week stats */}
      {!loading && weekTotal > 0 && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { icon: Calendar, label: 'Sessions', value: weekTotal, color: 'text-primary', bg: 'bg-primary/5' },
            { icon: Check, label: 'Completed', value: `${weekCompleted}/${weekTotal}`, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { icon: Clock, label: 'Study Time', value: `${Math.floor(totalWeekMinutes / 60)}h ${totalWeekMinutes % 60}m`, color: 'text-blue-600', bg: 'bg-blue-50' },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className={`${bg} rounded-xl p-3 flex items-center gap-3`}>
              <Icon size={16} className={color} />
              <div>
                <p className={`font-heading font-bold text-sm ${color}`}>{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Completion progress */}
      {weekTotal > 0 && (
        <div className="bg-card rounded-xl border border-border/50 px-4 py-3 flex items-center gap-4">
          <p className="text-sm font-semibold text-secondary shrink-0">Week Progress</p>
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-emerald-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${completionPct}%` }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            />
          </div>
          <span className="text-sm font-bold text-emerald-600 shrink-0">{completionPct}%</span>
        </div>
      )}

      {/* Week nav + view toggle */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <button onClick={() => setWeekOffset(p => p - 1)} className="p-2 rounded-xl hover:bg-muted border border-border transition-colors">
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => setWeekOffset(0)} className="px-3 py-1.5 rounded-xl text-sm font-semibold bg-muted hover:bg-muted/80 transition-colors">Today</button>
          <button onClick={() => setWeekOffset(p => p + 1)} className="p-2 rounded-xl hover:bg-muted border border-border transition-colors">
            <ChevronRight size={16} />
          </button>
          <span className="text-sm text-muted-foreground font-medium ml-1">{weekStart} – {weekEnd}</span>
        </div>
        <div className="flex border border-border rounded-xl overflow-hidden">
          <button onClick={() => setView('week')} className={`px-3 py-2 text-sm font-semibold flex items-center gap-1.5 transition-all ${view === 'week' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'}`}>
            <LayoutGrid size={14} /> Week
          </button>
          <button onClick={() => setView('list')} className={`px-3 py-2 text-sm font-semibold flex items-center gap-1.5 transition-all ${view === 'list' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'}`}>
            <List size={14} /> List
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-64 bg-muted rounded-2xl animate-pulse" />
      ) : view === 'week' ? (
        /* Week Grid View */
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map(({ date, label, dateStr }) => {
            const isToday = dateStr === today;
            const daySessions = sessionsForDay(dateStr);
            return (
              <div key={dateStr}
                className={`min-h-[180px] rounded-2xl border p-2 ${isToday ? 'border-primary/40 bg-primary/3 shadow-sm shadow-primary/10' : 'border-border/50 bg-card'}`}
              >
                <div className={`text-center mb-2 pb-2 border-b ${isToday ? 'border-primary/20' : 'border-border/30'}`}>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className={`font-heading font-bold text-sm ${isToday ? 'text-primary' : 'text-secondary'}`}>{date.getDate()}</p>
                  {isToday && <span className="text-xs bg-primary text-white px-1.5 py-0.5 rounded-md block mt-0.5">Today</span>}
                </div>
                <div className="space-y-1.5">
                  {daySessions.map(s => {
                    const style = subjectStyle(s.subject);
                    return (
                      <div key={s.id} className={`p-1.5 rounded-lg text-xs group relative ${s.completed ? 'bg-emerald-50 border border-emerald-200' : `${style.bg} border ${style.border}`}`}>
                        <div className="flex items-center gap-1 mb-0.5">
                          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.completed ? 'bg-emerald-500' : style.dot}`} />
                          <p className={`font-semibold truncate flex-1 ${s.completed ? 'line-through text-muted-foreground' : style.text}`}>
                            {s.subject.split(' / ')[0].split(' ')[0]}
                          </p>
                        </div>
                        <p className="text-muted-foreground text-[10px]">{s.time}–{s.endTime}</p>
                        <div className="flex gap-0.5 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => toggleComplete(s)} title="Toggle complete" className="p-0.5 rounded hover:bg-emerald-100 hover:text-emerald-600 transition-colors"><Check size={9} /></button>
                          <button onClick={() => { setEditSession(s); setModalOpen(true); }} title="Edit" className="p-0.5 rounded hover:bg-blue-100 hover:text-blue-600 transition-colors"><Pencil size={9} /></button>
                          <button onClick={() => deleteSession(s.id)} disabled={deletingId === s.id} title="Delete" className="p-0.5 rounded hover:bg-red-100 hover:text-red-600 transition-colors disabled:opacity-50"><Trash2 size={9} /></button>
                        </div>
                      </div>
                    );
                  })}
                  {daySessions.length === 0 && (
                    <button
                      onClick={() => { setEditSession(null); setModalOpen(true); }}
                      className="w-full h-8 rounded-lg border border-dashed border-border/50 text-muted-foreground/50 hover:border-primary/30 hover:text-primary/50 transition-colors flex items-center justify-center"
                    >
                      <Plus size={12} />
                    </button>
                  )}
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
                  <h3 className={`text-sm font-semibold ${isToday ? 'text-primary' : 'text-secondary'}`}>
                    {label}, {date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </h3>
                  {isToday && <span className="badge bg-primary/10 text-primary text-xs">Today</span>}
                  <span className="text-xs text-muted-foreground ml-auto">{daySessions.filter(s => s.completed).length}/{daySessions.length} done</span>
                </div>
                <div className="space-y-2">
                  {daySessions.map(s => {
                    const style = subjectStyle(s.subject);
                    const dur = durationMinutes(s.time, s.endTime);
                    return (
                      <motion.div
                        key={s.id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`bg-card rounded-2xl border p-4 flex items-center gap-4 transition-all ${
                          s.completed ? 'border-emerald-200 border-l-4 border-l-emerald-500' : `border-border/50 border-l-4 ${style.border.replace('border-', 'border-l-')}`
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${style.bg}`}>
                          {subjectIcon(s.subject)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold text-sm ${s.completed ? 'line-through text-muted-foreground' : 'text-secondary'}`}>{s.subject}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock size={10} /> {s.time} – {s.endTime}
                            <span className="ml-1">{dur >= 60 ? `${Math.floor(dur / 60)}h ${dur % 60}m` : `${dur}m`}</span>
                            {s.notes && <span className="ml-2 truncate max-w-[120px]">· {s.notes}</span>}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {s.completed && <span className="badge bg-emerald-100 text-emerald-700 text-xs">✓ Done</span>}
                          <button onClick={() => toggleComplete(s)} className={`p-1.5 rounded-lg transition-colors ${s.completed ? 'bg-emerald-100 text-emerald-600' : 'hover:bg-emerald-50 hover:text-emerald-600 text-muted-foreground'}`} title="Toggle complete">
                            <Check size={14} />
                          </button>
                          <button onClick={() => { setEditSession(s); setModalOpen(true); }} className="p-1.5 rounded-lg hover:bg-blue-50 hover:text-blue-600 text-muted-foreground transition-colors" title="Edit">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => deleteSession(s.id)} disabled={deletingId === s.id} className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 text-muted-foreground transition-colors disabled:opacity-50" title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {weekDays.every(({ dateStr }) => sessionsForDay(dateStr).length === 0) && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Calendar size={28} className="text-muted-foreground" />
              </div>
              <p className="font-semibold text-secondary">No sessions this week</p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">Start planning your study time</p>
              <Button onClick={() => setModalOpen(true)} className="gap-2"><Plus size={16} /> Add First Session</Button>
            </motion.div>
          )}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditSession(null); }} title={editSession ? 'Edit Session' : 'Add Study Session'}>
        <SessionForm initial={editSession || undefined} onSave={handleSave} onClose={() => { setModalOpen(false); setEditSession(null); }} />
      </Modal>
    </div>
  );
}
