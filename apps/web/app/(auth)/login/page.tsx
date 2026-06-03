'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Sparkles, Zap, Brain, BookOpen, Target } from 'lucide-react';
import { auth } from '@/lib/api';
import { clearUser } from '@/lib/auth';

const FLOATING = [
  { emoji: '📚', x: '8%', y: '15%', delay: 0 },
  { emoji: '🧬', x: '85%', y: '10%', delay: 0.4 },
  { emoji: '📐', x: '75%', y: '70%', delay: 0.8 },
  { emoji: '💡', x: '12%', y: '75%', delay: 1.2 },
  { emoji: '🎯', x: '50%', y: '5%', delay: 0.6 },
  { emoji: '⚛️', x: '90%', y: '45%', delay: 1.0 },
];

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      clearUser();
      await auth.login(form.email, form.password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Try again!');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden min-h-screen">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-indigo-50 dark:to-background pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-200/20 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Floating emojis */}
      {FLOATING.map((item, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl pointer-events-none select-none hidden md:block"
          style={{ left: item.x, top: item.y }}
          animate={{ y: [0, -12, 0], rotate: [-3, 3, -3] }}
          transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: item.delay, ease: 'easeInOut' }}
        >
          {item.emoji}
        </motion.div>
      ))}

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-2">
            <motion.div
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shadow-xl shadow-primary/30"
              whileHover={{ scale: 1.08, rotate: 3 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Brain size={28} className="text-white" />
            </motion.div>
            <span className="font-heading font-bold text-2xl text-secondary">Plug</span>
          </Link>
          <p className="text-muted-foreground text-sm mt-2">Your AI-powered study companion 🚀</p>
        </div>

        <div className="bg-card/90 backdrop-blur rounded-3xl shadow-2xl border border-border/50 p-8">
          <div className="mb-6">
            <h1 className="font-heading font-bold text-2xl text-secondary">Welcome back!</h1>
            <p className="text-muted-foreground text-sm mt-1">Sign in to continue your study journey</p>
          </div>

          {/* Demo credentials */}
          <motion.div
            className="mb-6 p-3.5 bg-gradient-to-r from-primary/5 to-indigo-50 dark:to-card rounded-xl border border-primary/20 flex items-start gap-2.5 cursor-pointer"
            whileHover={{ scale: 1.01 }}
            onClick={() => setForm({ email: 'alex@auraprep.com', password: 'demo1234!' })}
          >
            <Sparkles size={15} className="text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-primary font-semibold">Demo account (click to fill)</p>
              <p className="text-xs text-muted-foreground mt-0.5">alex@auraprep.com · demo1234!</p>
            </div>
          </motion.div>

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
              <label className="text-sm font-medium text-foreground block mb-1.5">Email address</label>
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
              <label className="text-sm font-medium text-foreground block mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className="input-field pr-10"
                  required
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-primary rounded" />
                <span className="text-sm text-muted-foreground">Remember me</span>
              </label>
              <Link href="#" className="text-sm text-primary hover:text-primary/80 font-medium">Forgot password?</Link>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              className="btn-primary w-full py-3 text-base shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                <><Zap size={16} /> Sign In</>
              )}
            </motion.button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            New here?{' '}
            <Link href="/register" className="text-primary font-semibold hover:underline">Create free account →</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
