'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, X, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAV_GROUPS } from '@/lib/nav';
import { logout } from '@/lib/auth';
import type { User } from '@/types';

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

            <nav className="flex-1 p-3 overflow-y-auto space-y-4">
              {NAV_GROUPS.map((group) => (
                <div key={group.label}>
                  <p className="px-3 mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 select-none">
                    {group.label}
                  </p>
                  <div className="space-y-0.5">
                    {group.items.map(({ href, label, icon: Icon }) => {
                      const active = path === href || path.startsWith(href + '/');
                      return (
                        <Link key={href} href={href} className={cn('nav-item', active ? 'nav-item-active' : 'nav-item-inactive')}>
                          <Icon size={17} className="shrink-0" />
                          <span>{label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            <div className="p-3 space-y-2 border-t border-border">
              <div className="bg-muted rounded-2xl border border-border p-3">
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
