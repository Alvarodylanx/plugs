'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, CheckCircle2, Brain, Sparkles, Zap } from 'lucide-react';
import { auth } from '@/lib/api';
import { clearUser } from '@/lib/auth';

const PERKS = [
  { emoji: '🤖', text: 'AI-structured notes from any document' },
  { emoji: '🎧', text: 'Audio lessons — study hands-free' },
  { emoji: '🧠', text: '12 quiz questions auto-generated per note' },
  { emoji: '👥', text: 'Community forum with expert answers' },
  { emoji: '📊', text: 'Progress analytics & subject breakdown' },
  { emoji: '🏆', text: 'Leaderboard, badges & streaks' },
];

const FLOATING = [
  { emoji: '🧬', x: '5%', y: '20%', delay: 0 },
  { emoji: '📐', x: '88%', y: '15%', delay: 0.5 },
  { emoji: '🌍', x: '80%', y: '75%', delay: 0.9 },
  { emoji: '⚗️', x: '8%', y: '80%', delay: 1.3 },
];

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', level: 'O-Level' as string });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const passwordStrength = form.password.length === 0 ? 0
    : form.password.length < 6 ? 1
    : form.password.length < 10 ? 2
    : 3;
  const strengthColors = ['', 'bg-red-400', 'bg-amber-400', 'bg-emerald-500'];
  const strengthLabels = ['', 'Too short', 'OK', 'Strong'];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      clearUser();
      await auth.register(form.name, form.email, form.password, form.level);
      router.push('/onboarding');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Try again!');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-6 py-10 relative overflow-hidden min-h-screen">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-violet-50 pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Floating emojis */}
      {FLOATING.map((item, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl pointer-events-none select-none hidden md:block"
          style={{ left: item.x, top: item.y }}
          animate={{ y: [0, -10, 0], rotate: [-2, 2, -2] }}
          transition={{ duration: 3.5 + i * 0.4, repeat: Infinity, delay: item.delay, ease: 'easeInOut' }}
        >
          {item.emoji}
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-start relative z-10"
      >
        {/* Left — Perks */}
        <div className="hidden md:block">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6 group">
            <motion.div
              className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shadow-lg shadow-primary/30"
              whileHover={{ scale: 1.08 }}
            >
              <Brain size={22} className="text-white" />
            </motion.div>
            <span className="font-heading font-bold text-xl text-secondary">Plug</span>
          </Link>

          <h2 className="font-heading font-bold text-3xl text-secondary mb-2">Study smarter,<br />not harder. 🚀</h2>
          <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
            Everything you need to ace GCE O &amp; A Level — all in one place, completely free.
          </p>

          <div className="space-y-3 mb-8">
            {PERKS.map((p, i) => (
              <motion.div
                key={p.text}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 + 0.3 }}
                className="flex items-center gap-3"
              >
                <span className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center text-lg shrink-0">{p.emoji}</span>
                <span className="text-foreground text-sm font-medium">{p.text}</span>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="p-4 bg-gradient-to-r from-primary/8 to-indigo-50 rounded-2xl border border-primary/20"
          >
            <p className="text-sm text-muted-foreground leading-relaxed">
              <span className="text-primary font-bold">50,000+ students</span> already studying smarter with Plug. Join them today — it&apos;s <strong>free forever</strong>.
            </p>
          </motion.div>
        </div>

        {/* Right — Form */}
        <div className="bg-card/90 backdrop-blur rounded-3xl shadow-2xl border border-border/50 p-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-6 md:hidden">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Brain size={18} className="text-white" />
            </div>
            <span className="font-heading font-bold text-lg text-secondary">Plug</span>
          </div>

          <div className="mb-6">
            <h1 className="font-heading font-bold text-2xl text-secondary">Create your account</h1>
            <p className="text-muted-foreground text-sm mt-1">Free forever · No credit card needed</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-4 p-3 bg-destructive/8 rounded-xl border border-destructive/20 text-destructive text-sm flex items-center gap-2"
            >
              <span>⚠️</span> {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">Full Name</label>
              <input
                type="text"
                placeholder="Alex Student"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="input-field"
                required
                autoComplete="name"
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">Email address</label>
              <input
                type="email"
                placeholder="your@email.com"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="input-field"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className="input-field pr-10"
                  required
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.password.length > 0 && (
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= passwordStrength ? strengthColors[passwordStrength] : 'bg-muted'}`} />
                    ))}
                  </div>
                  <span className={`text-xs font-medium ${passwordStrength === 3 ? 'text-emerald-600' : passwordStrength === 2 ? 'text-amber-600' : 'text-red-500'}`}>
                    {strengthLabels[passwordStrength]}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">Confirm Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.confirm}
                onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
                className={`input-field ${form.confirm && form.confirm !== form.password ? 'border-destructive/50 focus:ring-destructive/20' : ''}`}
                required
                autoComplete="new-password"
              />
              {form.confirm && form.confirm !== form.password && (
                <p className="text-xs text-destructive mt-1">Passwords don't match</p>
              )}
            </div>

            {/* Level selector */}
            <div>
              <label className="text-sm font-medium block mb-2">Your Level</label>
              <div className="grid grid-cols-2 gap-2">
                {(['O-Level', 'A-Level', 'AS-Level', 'IGCSE'] as string[]).map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, level: lvl }))}
                    className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                      form.level === lvl
                        ? 'bg-primary text-white border-primary shadow-sm shadow-primary/25'
                        : 'border-border text-muted-foreground hover:border-primary/40 hover:text-primary'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              className="btn-primary w-full py-3 text-base shadow-lg shadow-primary/25 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account...
                </>
              ) : (
                <><Sparkles size={16} /> Create Free Account</>
              )}
            </motion.button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-5">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-semibold hover:underline">Sign in →</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
