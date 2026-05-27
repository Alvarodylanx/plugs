'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, ChevronLeft, ChevronRight, Check, Pencil, Trash2, Calendar, Clock,
  LayoutGrid, List, Bell, BellOff, Volume2, VolumeX, Settings2, Timer,
  ChevronDown, ChevronUp, Sparkles,
} from 'lucide-react';
import { sessions as sessionsApi } from '@/lib/api';
import { getWeekDates, subjectIcon } from '@/lib/utils';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Mascot } from '@/components/mascot';
import { playSound, SOUND_OPTIONS, type SoundType } from '@/lib/sounds';
import { SUBJECTS } from '@/types';
import type { Session } from '@/types';

const today = new Date().toISOString().split('T')[0];

const SUBJECT_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  'Computer Science / ICT': { bg: 'bg-blue-50',    border: 'border-blue-200',    text: 'text-blue-700',    dot: 'bg-blue-500' },
  'Biology':                { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  'History':                { bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-700',   dot: 'bg-amber-500' },
  'Mathematics':            { bg: 'bg-indigo-50',  border: 'border-indigo-200',  text: 'text-indigo-700',  dot: 'bg-indigo-500' },
  'Physics':                { bg: 'bg-purple-50',  border: 'border-purple-200',  text: 'text-purple-700',  dot: 'bg-purple-500' },
  'Chemistry':              { bg: 'bg-rose-50',    border: 'border-rose-200',    text: 'text-rose-700',    dot: 'bg-rose-500' },
  'English':                { bg: 'bg-sky-50',     border: 'border-sky-200',     text: 'text-sky-700',     dot: 'bg-sky-500' },
  'Geography':              { bg: 'bg-green-50',   border: 'border-green-200',   text: 'text-green-700',   dot: 'bg-green-500' },
  'Economics':              { bg: 'bg-yellow-50',  border: 'border-yellow-200',  text: 'text-yellow-700',  dot: 'bg-yellow-500' },
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

function formatDuration(min: number): string {
  if (min >= 60) return `${Math.floor(min / 60)}h ${min % 60 > 0 ? `${min % 60}m` : ''}`.trim();
  return `${min}m`;
}

function formatCountdown(ms: number): string {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

interface NotifSettings {
  enabled: boolean;
  sound: SoundType;
  volume: number;
  alertMinutes: number;
}

const DEFAULT_SETTINGS: NotifSettings = { enabled: true, sound: 'chime', volume: 0.6, alertMinutes: 10 };
const SETTINGS_KEY = 'plug_timetable_notif';

function loadSettings(): NotifSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const s = localStorage.getItem(SETTINGS_KEY);
    return s ? { ...DEFAULT_SETTINGS, ...JSON.parse(s) } : DEFAULT_SETTINGS;
  } catch { return DEFAULT_SETTINGS; }
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
          <label className="text-sm font-medium block mb-1.5">Start</label>
          <input type="time" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} className="input-field" />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1.5">End</label>
          <input type="time" value={form.endTime} onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))} className="input-field" />
        </div>
      </div>
      {dur > 0 && (
        <p className="text-xs text-primary font-semibold flex items-center gap-1">
          <Clock size={12} /> {formatDuration(dur)}
        </p>
      )}
      <div>
        <label className="text-sm font-medium block mb-1.5">Notes (optional)</label>
        <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
          className="input-field resize-none" rows={3} placeholder="Topics to cover, resources to use..." />
      </div>
      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
        <Button onClick={() => onSave(form)} disabled={!form.subject || dur <= 0} className="flex-1">
          {initial?.id ? 'Update' : 'Add Session'}
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

  // Notification state
  const [settings, setSettings] = useState<NotifSettings>(DEFAULT_SETTINGS);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [nextSession, setNextSession] = useState<Session | null>(null);
  const [recentAlert, setRecentAlert] = useState<string | null>(null);

  const sessionsRef = useRef<Session[]>([]);
  const settingsRef = useRef<NotifSettings>(DEFAULT_SETTINGS);
  const notifiedRef = useRef<Set<string>>(new Set());

  useEffect(() => { sessionsRef.current = sessions; }, [sessions]);
  useEffect(() => { settingsRef.current = settings; }, [settings]);

  const weekDays = getWeekDates(weekOffset);
  const weekStart = weekDays[0].date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const weekEnd = weekDays[6].date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  // Load initial data + settings
  useEffect(() => {
    sessionsApi.list().then(s => { setSessions(s as Session[]); setLoading(false); });
    setSettings(loadSettings());
    if (typeof Notification !== 'undefined') setPermission(Notification.permission);
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    }
  }, [settings]);

  // Notification check
  const checkNotifications = useCallback(() => {
    const s = settingsRef.current;
    if (!s.enabled || typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    sessionsRef.current
      .filter(sess => sess.date === today && !sess.completed)
      .forEach(sess => {
        if (notifiedRef.current.has(sess.id)) return;
        const [h, m] = sess.time.split(':').map(Number);
        const diff = h * 60 + m - nowMin;
        if (diff > 0 && diff <= s.alertMinutes) {
          notifiedRef.current.add(sess.id);
          playSound(s.sound, s.volume);
          setRecentAlert(`${sess.subject} starts in ${diff}m`);
          setTimeout(() => setRecentAlert(null), 6000);
          try {
            new Notification('Study time! 📚', {
              body: `${sess.subject} starts in ${diff} minute${diff !== 1 ? 's' : ''} at ${sess.time}`,
              icon: '/favicon.ico',
              tag: `plug-${sess.id}`,
            });
          } catch {}
        }
      });
  }, []);

  // Countdown + notification interval
  useEffect(() => {
    function tick() {
      checkNotifications();
      const now = new Date();
      const todaySessions = sessionsRef.current
        .filter(s => s.date === today && !s.completed)
        .sort((a, b) => a.time.localeCompare(b.time));
      let found: Session | null = null;
      let ms = 0;
      for (const s of todaySessions) {
        const [h, m] = s.time.split(':').map(Number);
        const t = new Date(); t.setHours(h, m, 0, 0);
        const diff = t.getTime() - now.getTime();
        if (diff > 0) { found = s; ms = diff; break; }
      }
      setNextSession(found);
      setCountdown(found ? ms : null);
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [checkNotifications]);

  async function requestPermission() {
    const p = await Notification.requestPermission();
    setPermission(p);
  }

  // Week stats
  const weekSessionsAll = sessions.filter(s => weekDays.some(d => d.dateStr === s.date));
  const weekCompleted = weekSessionsAll.filter(s => s.completed).length;
  const weekTotal = weekSessionsAll.length;
  const completionPct = weekTotal ? Math.round((weekCompleted / weekTotal) * 100) : 0;
  const totalWeekMinutes = weekSessionsAll.reduce((acc, s) => acc + durationMinutes(s.time, s.endTime), 0);

  // Today's sessions
  const todaySessions = sessions.filter(s => s.date === today).sort((a, b) => a.time.localeCompare(b.time));

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
    if (!session.completed) notifiedRef.current.delete(session.id);
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

  const isCurrentWeek = weekOffset === 0;

  return (
    <div className="animate-enter space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading font-bold text-2xl text-secondary">Study Timetable</h1>
          <p className="text-muted-foreground text-sm mt-1">Plan your week, stay on track 🎯</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSettingsOpen(o => !o)}
            className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 text-sm font-medium ${
              settingsOpen ? 'bg-primary text-white border-primary' : 'border-border hover:border-primary/40 text-muted-foreground hover:text-primary'
            }`}
            title="Notification settings"
          >
            {settings.enabled ? <Bell size={16} /> : <BellOff size={16} />}
            <span className="hidden sm:inline text-xs">Alerts</span>
            {settingsOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          <Button onClick={() => { setEditSession(null); setModalOpen(true); }} className="gap-2 shadow-md shadow-primary/20">
            <Plus size={16} /> Add Session
          </Button>
        </div>
      </div>

      {/* Recent alert banner */}
      <AnimatePresence>
        {recentAlert && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            className="bg-gradient-to-r from-primary/10 to-indigo-50 border border-primary/30 rounded-xl px-4 py-3 flex items-center gap-3"
          >
            <span className="text-xl">🔔</span>
            <p className="text-sm font-semibold text-primary">{recentAlert}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification settings panel */}
      <AnimatePresence>
        {settingsOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="bg-card border border-border/60 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-secondary flex items-center gap-2">
                  <Bell size={16} className="text-primary" /> Notification Settings
                </h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-sm text-muted-foreground">Enable alerts</span>
                  <button
                    onClick={() => setSettings(p => ({ ...p, enabled: !p.enabled }))}
                    className={`w-11 h-6 rounded-full transition-colors relative ${settings.enabled ? 'bg-primary' : 'bg-muted'}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${settings.enabled ? 'left-6' : 'left-1'}`} />
                  </button>
                </label>
              </div>

              {settings.enabled && (
                <div className="space-y-4">
                  {/* Permission warning */}
                  {permission !== 'granted' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                      <p className="text-sm text-amber-700">Browser notifications are {permission === 'denied' ? 'blocked' : 'not yet enabled'}.</p>
                      {permission !== 'denied' && (
                        <button onClick={requestPermission} className="text-xs font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
                          Enable Now
                        </button>
                      )}
                    </div>
                  )}

                  {/* Alert timing */}
                  <div>
                    <p className="text-sm font-medium mb-2 flex items-center gap-1.5"><Timer size={14} className="text-muted-foreground" /> Alert me before session starts</p>
                    <div className="flex gap-2">
                      {[5, 10, 15].map(min => (
                        <button
                          key={min}
                          onClick={() => setSettings(p => ({ ...p, alertMinutes: min }))}
                          className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${
                            settings.alertMinutes === min
                              ? 'bg-primary text-white border-primary shadow-sm shadow-primary/25'
                              : 'border-border text-muted-foreground hover:border-primary/40 hover:text-primary'
                          }`}
                        >
                          {min} min
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sound selector */}
                  <div>
                    <p className="text-sm font-medium mb-2 flex items-center gap-1.5"><Volume2 size={14} className="text-muted-foreground" /> Notification sound</p>
                    <div className="grid grid-cols-5 gap-2">
                      {SOUND_OPTIONS.map(opt => (
                        <button
                          key={opt.type}
                          onClick={() => {
                            setSettings(p => ({ ...p, sound: opt.type }));
                            playSound(opt.type, settings.volume);
                          }}
                          className={`py-2 rounded-xl text-center text-xs font-semibold border transition-all ${
                            settings.sound === opt.type
                              ? 'bg-primary text-white border-primary shadow-sm shadow-primary/25'
                              : 'border-border text-muted-foreground hover:border-primary/40 hover:text-primary bg-card'
                          }`}
                        >
                          <span className="block text-base mb-0.5">{opt.emoji}</span>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Volume */}
                  <div>
                    <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
                      {settings.volume === 0 ? <VolumeX size={14} className="text-muted-foreground" /> : <Volume2 size={14} className="text-muted-foreground" />}
                      Volume
                      <span className="ml-auto text-xs text-muted-foreground">{Math.round(settings.volume * 100)}%</span>
                    </p>
                    <input
                      type="range" min="0" max="1" step="0.05"
                      value={settings.volume}
                      onChange={e => setSettings(p => ({ ...p, volume: parseFloat(e.target.value) }))}
                      className="w-full accent-primary"
                    />
                  </div>

                  {/* Test button */}
                  <button
                    onClick={() => playSound(settings.sound, settings.volume)}
                    className="w-full py-2.5 rounded-xl border border-primary/30 text-primary font-semibold text-sm hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
                  >
                    <Sparkles size={14} /> Test Sound
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Today's Agenda (only on current week) */}
      {isCurrentWeek && !loading && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-primary/8 via-card to-indigo-50/60 rounded-2xl border border-primary/20 p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-heading font-bold text-secondary flex items-center gap-2">
                <Calendar size={16} className="text-primary" /> Today's Agenda
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
            {nextSession && countdown !== null && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Next session in</p>
                <p className="font-heading font-bold text-primary text-lg tabular-nums">{formatCountdown(countdown)}</p>
              </div>
            )}
          </div>

          {todaySessions.length === 0 ? (
            <div className="flex flex-col sm:flex-row items-center gap-4 py-2">
              <Mascot mood="idle" size={80} message="No sessions today!" />
              <div>
                <p className="font-semibold text-secondary">Your day is free 🎉</p>
                <p className="text-sm text-muted-foreground mt-1">Add a study session to get started.</p>
                <button
                  onClick={() => setModalOpen(true)}
                  className="mt-3 text-sm font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  <Plus size={14} /> Schedule a session
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {todaySessions.map(s => {
                const style = subjectStyle(s.subject);
                const dur = durationMinutes(s.time, s.endTime);
                const isNext = nextSession?.id === s.id;
                return (
                  <div key={s.id}
                    className={`rounded-xl border p-3 flex items-center gap-3 transition-all ${
                      s.completed
                        ? 'bg-emerald-50/50 border-emerald-200 opacity-60'
                        : isNext
                        ? 'bg-primary/5 border-primary/30 shadow-sm'
                        : `${style.bg} ${style.border}`
                    }`}
                  >
                    <span className="text-xl shrink-0">{subjectIcon(s.subject)}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm ${s.completed ? 'line-through text-muted-foreground' : 'text-secondary'}`}>
                        {s.subject}
                      </p>
                      <p className="text-xs text-muted-foreground">{s.time} – {s.endTime} · {formatDuration(dur)}</p>
                    </div>
                    {isNext && countdown !== null && !s.completed && (
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg shrink-0 tabular-nums">
                        {formatCountdown(countdown)}
                      </span>
                    )}
                    {s.completed && <span className="text-xs text-emerald-600 font-bold shrink-0">✓ Done</span>}
                    <button onClick={() => toggleComplete(s)}
                      className={`p-1.5 rounded-lg transition-colors shrink-0 ${s.completed ? 'bg-emerald-100 text-emerald-600' : 'hover:bg-emerald-50 hover:text-emerald-600 text-muted-foreground'}`}>
                      <Check size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}

      {/* Week stats */}
      {!loading && weekTotal > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Sessions', value: weekTotal, color: 'text-primary', bg: 'bg-primary/5', emoji: '📅' },
            { label: 'Completed', value: `${weekCompleted}/${weekTotal}`, color: 'text-emerald-600', bg: 'bg-emerald-50', emoji: '✅' },
            { label: 'Study Time', value: formatDuration(totalWeekMinutes), color: 'text-blue-600', bg: 'bg-blue-50', emoji: '⏱️' },
          ].map(({ label, value, color, bg, emoji }) => (
            <motion.div key={label} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
              className={`${bg} rounded-xl p-3 flex items-center gap-2.5`}
            >
              <span className="text-xl">{emoji}</span>
              <div>
                <p className={`font-heading font-bold text-sm ${color}`}>{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Progress bar */}
      {weekTotal > 0 && (
        <div className="bg-card rounded-xl border border-border/50 px-4 py-3 flex items-center gap-4">
          <p className="text-sm font-semibold text-secondary shrink-0">Week Progress</p>
          <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${completionPct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <span className="text-sm font-bold text-emerald-600 shrink-0">{completionPct}%</span>
          {completionPct === 100 && <span className="text-lg">🎉</span>}
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
        /* Week Grid */
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
                  {isToday && <span className="text-[10px] bg-primary text-white px-1.5 py-0.5 rounded-md block mt-0.5">Today</span>}
                </div>
                <div className="space-y-1.5">
                  {daySessions.map(s => {
                    const style = subjectStyle(s.subject);
                    const isNext = nextSession?.id === s.id;
                    return (
                      <div key={s.id} className={`p-1.5 rounded-lg text-xs group relative ${
                        s.completed ? 'bg-emerald-50 border border-emerald-200'
                          : isNext ? 'bg-primary/8 border border-primary/30'
                          : `${style.bg} border ${style.border}`
                      }`}>
                        <div className="flex items-center gap-1 mb-0.5">
                          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.completed ? 'bg-emerald-500' : isNext ? 'bg-primary' : style.dot}`} />
                          <p className={`font-semibold truncate flex-1 ${s.completed ? 'line-through text-muted-foreground' : isNext ? 'text-primary' : style.text}`}>
                            {s.subject.split(' / ')[0].split(' ')[0]}
                          </p>
                        </div>
                        <p className="text-muted-foreground text-[10px]">{s.time}–{s.endTime}</p>
                        <div className="flex gap-0.5 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => toggleComplete(s)} className="p-0.5 rounded hover:bg-emerald-100 hover:text-emerald-600 transition-colors"><Check size={9} /></button>
                          <button onClick={() => { setEditSession(s); setModalOpen(true); }} className="p-0.5 rounded hover:bg-blue-100 hover:text-blue-600 transition-colors"><Pencil size={9} /></button>
                          <button onClick={() => deleteSession(s.id)} disabled={deletingId === s.id} className="p-0.5 rounded hover:bg-red-100 hover:text-red-600 transition-colors disabled:opacity-50"><Trash2 size={9} /></button>
                        </div>
                      </div>
                    );
                  })}
                  {daySessions.length === 0 && (
                    <button onClick={() => setModalOpen(true)}
                      className="w-full h-8 rounded-lg border border-dashed border-border/50 text-muted-foreground/50 hover:border-primary/30 hover:text-primary/50 transition-colors flex items-center justify-center">
                      <Plus size={12} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List view */
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
                    const isNext = nextSession?.id === s.id;
                    return (
                      <motion.div key={s.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        className={`bg-card rounded-2xl border p-4 flex items-center gap-4 transition-all ${
                          s.completed ? 'border-emerald-200 border-l-4 border-l-emerald-500'
                            : isNext ? 'border-primary/40 border-l-4 border-l-primary shadow-sm'
                            : `border-border/50 border-l-4 ${style.border.replace('border-', 'border-l-')}`
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${style.bg}`}>
                          {subjectIcon(s.subject)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold text-sm ${s.completed ? 'line-through text-muted-foreground' : 'text-secondary'}`}>{s.subject}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock size={10} /> {s.time} – {s.endTime} · {formatDuration(dur)}
                            {s.notes && <span className="ml-2 truncate max-w-[120px]">· {s.notes}</span>}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {isNext && countdown !== null && !s.completed && (
                            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg tabular-nums">{formatCountdown(countdown)}</span>
                          )}
                          {s.completed && <span className="badge bg-emerald-100 text-emerald-700 text-xs">✓ Done</span>}
                          <button onClick={() => toggleComplete(s)} className={`p-1.5 rounded-lg transition-colors ${s.completed ? 'bg-emerald-100 text-emerald-600' : 'hover:bg-emerald-50 hover:text-emerald-600 text-muted-foreground'}`}><Check size={14} /></button>
                          <button onClick={() => { setEditSession(s); setModalOpen(true); }} className="p-1.5 rounded-lg hover:bg-blue-50 hover:text-blue-600 text-muted-foreground transition-colors"><Pencil size={14} /></button>
                          <button onClick={() => deleteSession(s.id)} disabled={deletingId === s.id} className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 text-muted-foreground transition-colors disabled:opacity-50"><Trash2 size={14} /></button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {weekDays.every(({ dateStr }) => sessionsForDay(dateStr).length === 0) && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 flex flex-col items-center gap-4">
              <Mascot mood="thinking" size={100} message="Nothing planned yet!" />
              <div>
                <p className="font-semibold text-secondary">No sessions this week</p>
                <p className="text-sm text-muted-foreground mt-1 mb-4">Start planning your study time</p>
                <Button onClick={() => setModalOpen(true)} className="gap-2"><Plus size={16} /> Add First Session</Button>
              </div>
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
