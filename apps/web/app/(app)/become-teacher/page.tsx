'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { GraduationCap, MapPin, School, Briefcase, BookOpen, CheckCircle2, Loader2 } from 'lucide-react';
import { teachers as teachersApi } from '@/lib/api';
import { getUser } from '@/lib/auth';
import { SUBJECTS } from '@/types';

const JOB_STATUSES = ['Teacher', 'Tutor', 'Private Instructor', 'Student Teacher', 'Professor', 'Retired Teacher'];

export default function BecomeTeacherPage() {
  const router = useRouter();
  const [loading, setLoading]   = useState(false);
  const [checking, setChecking] = useState(true);
  const [saved, setSaved]       = useState(false);
  const [form, setForm] = useState({
    subjects:  [] as string[],
    town:      '',
    school:    '',
    jobStatus: 'Tutor',
    bio:       '',
    available: true,
  });

  useEffect(() => {
    teachersApi.me().then((me: any) => {
      if (me?.id) {
        setForm({
          subjects:  me.subjects || [],
          town:      me.town || '',
          school:    me.school || '',
          jobStatus: me.jobStatus || 'Tutor',
          bio:       me.bio || '',
          available: me.available ?? true,
        });
      }
      setChecking(false);
    }).catch(() => setChecking(false));
  }, []);

  function toggleSubject(s: string) {
    setForm(prev => ({
      ...prev,
      subjects: prev.subjects.includes(s) ? prev.subjects.filter(x => x !== s) : [...prev.subjects, s],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.subjects.length === 0) return;
    setLoading(true);
    try {
      const res = await teachersApi.createProfile(form) as any;
      setSaved(true);
      setTimeout(() => router.push(`/teachers/${res.userId}`), 1200);
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return <div className="h-64 bg-muted rounded-2xl animate-pulse max-w-2xl mx-auto" />;
  }

  return (
    <div className="animate-enter max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-indigo-600 via-primary to-violet-600 rounded-3xl p-6 text-white overflow-hidden shadow-xl">
        <div className="absolute -top-6 -right-6 w-36 h-36 bg-white/10 rounded-full blur-2xl" />
        <div className="relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-3">
            <GraduationCap size={22} />
          </div>
          <h1 className="font-heading font-bold text-2xl">Become a Teacher</h1>
          <p className="text-white/70 text-sm mt-1">
            Create your teacher profile and connect with students who need your help.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Subjects */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border/50 p-5"
        >
          <h2 className="font-semibold text-secondary flex items-center gap-2 mb-1">
            <BookOpen size={15} className="text-primary" /> Subjects You Teach
          </h2>
          <p className="text-xs text-muted-foreground mb-4">Select all that apply</p>
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map(s => {
              const active = form.subjects.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSubject(s)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${
                    active
                      ? 'bg-primary text-white border-primary shadow-sm shadow-primary/20'
                      : 'border-border text-muted-foreground hover:border-primary/40 hover:text-primary'
                  }`}
                >
                  {s.split(' /')[0]}
                </button>
              );
            })}
          </div>
          {form.subjects.length === 0 && (
            <p className="text-xs text-destructive mt-2">Please select at least one subject</p>
          )}
        </motion.div>

        {/* Details */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-card rounded-2xl border border-border/50 p-5 space-y-4"
        >
          <h2 className="font-semibold text-secondary">Personal Details</h2>

          <div>
            <label className="text-sm font-medium block mb-1.5 flex items-center gap-1.5">
              <Briefcase size={13} className="text-muted-foreground" /> Job Status
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {JOB_STATUSES.map(j => (
                <button
                  key={j}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, jobStatus: j }))}
                  className={`py-2 rounded-xl text-sm font-medium border transition-all ${
                    form.jobStatus === j
                      ? 'bg-primary text-white border-primary'
                      : 'border-border text-muted-foreground hover:border-primary/40 hover:text-primary'
                  }`}
                >
                  {j}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1.5 flex items-center gap-1.5">
                <MapPin size={13} className="text-muted-foreground" /> Town / City
              </label>
              <input
                type="text"
                value={form.town}
                onChange={e => setForm(p => ({ ...p, town: e.target.value }))}
                placeholder="e.g. Yaoundé"
                className="input-field"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5 flex items-center gap-1.5">
                <School size={13} className="text-muted-foreground" /> School / Institution
              </label>
              <input
                type="text"
                value={form.school}
                onChange={e => setForm(p => ({ ...p, school: e.target.value }))}
                placeholder="e.g. GBHS Yaoundé"
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">Bio</label>
            <textarea
              value={form.bio}
              onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
              placeholder="Tell students about yourself, your experience, and teaching style..."
              rows={3}
              maxLength={400}
              className="input-field resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">{form.bio.length}/400</p>
          </div>

          <div className="flex items-center justify-between py-3 px-4 bg-muted/30 rounded-xl border border-border/50">
            <div>
              <p className="text-sm font-semibold text-secondary">Available for students</p>
              <p className="text-xs text-muted-foreground">Show as available on your profile</p>
            </div>
            <button
              type="button"
              onClick={() => setForm(p => ({ ...p, available: !p.available }))}
              className={`w-11 h-6 rounded-full transition-all relative ${form.available ? 'bg-primary' : 'bg-muted-foreground/30'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white shadow-sm absolute top-1 transition-all ${form.available ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
        </motion.div>

        {/* Submit */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={loading || form.subjects.length === 0}
          className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 shadow-lg shadow-primary/25 rounded-2xl text-base font-semibold disabled:opacity-50"
        >
          {saved ? (
            <><CheckCircle2 size={18} /> Profile saved! Redirecting...</>
          ) : loading ? (
            <><Loader2 size={18} className="animate-spin" /> Saving...</>
          ) : (
            <><GraduationCap size={18} /> Create Teacher Profile</>
          )}
        </motion.button>
      </form>
    </div>
  );
}
