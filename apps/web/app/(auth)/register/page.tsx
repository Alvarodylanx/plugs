'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { auth } from '@/lib/api';
import { clearUser } from '@/lib/auth';
import { LEVELS } from '@/types';

const PERKS = ['AI-structured notes', 'Audio lessons', '12 quiz questions per note', 'Community forum', 'Progress analytics'];

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', level: 'O-Level' as string });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      clearUser();
      await auth.register(form.name, form.email, form.password, form.level);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center"
      >
        {/* Left — Perks */}
        <div className="hidden md:block">
          <div className="mb-6">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-md">
                <span className="text-white font-heading font-bold">P</span>
              </div>
              <span className="font-heading font-bold text-xl text-secondary">Plug</span>
            </Link>
          </div>
          <h2 className="font-heading font-bold text-3xl text-secondary mb-3">Your free account includes:</h2>
          <p className="text-muted-foreground mb-8">Everything you need to prepare for GCE O &amp; A Level exams.</p>
          <div className="space-y-3">
            {PERKS.map(p => (
              <div key={p} className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-primary shrink-0" />
                <span className="text-foreground font-medium">{p}</span>
              </div>
            ))}
          </div>
          <div className="mt-10 p-4 bg-primary/5 rounded-2xl border border-primary/20">
            <p className="text-sm text-muted-foreground"><span className="text-primary font-semibold">50,000+ students</span> already studying smarter with Plug. Join them today — it&apos;s free forever.</p>
          </div>
        </div>

        {/* Right — Form */}
        <div className="bg-card rounded-2xl shadow-xl border border-border/50 p-8">
          <div className="mb-6">
            <h1 className="font-heading font-bold text-2xl text-secondary">Create your account</h1>
            <p className="text-muted-foreground text-sm mt-1">Free forever · No credit card</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 rounded-xl border border-destructive/20 text-destructive text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">Full Name</label>
              <input type="text" placeholder="Alex Student" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="input-field" required />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Email</label>
              <input type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="input-field" required />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} placeholder="At least 6 characters" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} className="input-field pr-10" required />
                <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Confirm Password</label>
              <input type="password" placeholder="••••••••" value={form.confirm} onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))} className="input-field" required />
            </div>

            {/* Level selector */}
            <div>
              <label className="text-sm font-medium block mb-2">Your Level</label>
              <div className="grid grid-cols-2 gap-2">
                {(['O-Level', 'A-Level'] as string[]).map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, level: lvl }))}
                    className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${form.level === lvl ? 'bg-primary text-white border-primary shadow-sm' : 'border-border text-muted-foreground hover:border-primary/50 hover:text-primary'}`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base shadow-md shadow-primary/30">
              {loading ? (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
