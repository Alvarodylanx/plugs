'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp } from 'lucide-react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { QuikzPopup } from '@/components/quikz-popup';
import { SwRegistrar } from '@/components/sw-registrar';
import { CommandPalette } from '@/components/command-palette';
import { PomodoroTimer } from '@/components/pomodoro-timer';
import { getUser } from '@/lib/auth';
import type { User } from '@/types';

function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={{ duration: 0.2 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-2xl bg-primary text-white shadow-lg shadow-primary/30 flex items-center justify-center hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
          aria-label="Scroll to top"
        >
          <ChevronUp size={20} strokeWidth={2.5} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    getUser().then(u => {
      if (!u) { setLoading(false); router.replace('/login'); return; }
      if (!u.studyProfile) { setLoading(false); router.replace('/onboarding'); return; }
      setUser(u);
      setLoading(false);
    });
  }, []);

  // Global Ctrl+K shortcut
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen(o => !o);
      }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center animate-pulse">
            <span className="text-white font-heading font-bold text-xl">P</span>
          </div>
          <p className="text-sm text-muted-foreground">Loading Plug...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar user={user} />
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Header user={user} onSearchClick={() => setPaletteOpen(true)} />
        <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
      <ScrollToTop />
      <QuikzPopup />
      <SwRegistrar />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <PomodoroTimer />
    </div>
  );
}
