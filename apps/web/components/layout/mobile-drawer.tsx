'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, BookOpen, Headphones, BrainCircuit, Calendar, TrendingUp, Users, LogOut, X, Flame, Youtube } from 'lucide-react';
import { cn } from '@/lib/utils';
import { logout } from '@/lib/auth';
import type { User } from '@/types';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/notes', label: 'My Notes', icon: BookOpen },
  { href: '/audio-notes', label: 'Audio Notes', icon: Headphones },
  { href: '/quizzes', label: 'Quizzes', icon: BrainCircuit },
  { href: '/videos', label: 'Videos', icon: Youtube },
  { href: '/timetable', label: 'Timetable', icon: Calendar },
  { href: '/progress', label: 'Progress', icon: TrendingUp },
  { href: '/social', label: 'Community', icon: Users },
];

export function MobileDrawer({ open, onClose, user }: { open: boolean; onClose: () => void; user: User | null }) {
  const path = usePathname();
  useEffect(() => { if (open) onClose(); }, [path]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
            className="absolute left-0 top-0 h-full w-3/4 max-w-xs bg-card shadow-xl flex flex-col"
          >
            <div className="flex items-center justify-between p-5 border-b border-border">
              <Link href="/dashboard" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
                  <span className="text-white font-heading font-bold text-sm">P</span>
                </div>
                <span className="font-heading font-bold text-secondary">Plug</span>
              </Link>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted">
                <X size={18} className="text-muted-foreground" />
              </button>
            </div>

            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {NAV.map(({ href, label, icon: Icon }) => {
                const active = path === href || path.startsWith(href + '/');
                return (
                  <Link key={href} href={href} className={cn('nav-item', active ? 'nav-item-active' : 'nav-item-inactive')}>
                    <Icon size={18} className="shrink-0" />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-3 space-y-2 border-t border-border">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-3">
                <div className="flex items-center gap-2">
                  <Flame size={14} className="text-orange-500" />
                  <span className="text-sm font-bold text-secondary">{user?.streak ?? 0} Day Streak!</span>
                </div>
              </div>
              <button onClick={logout} className="nav-item nav-item-inactive w-full hover:bg-destructive/10 hover:text-destructive">
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
