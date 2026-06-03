'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, X, Flame, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAV_GROUPS } from '@/lib/nav';
import { logout } from '@/lib/auth';
import type { User } from '@/types';

function getActiveGroup(path: string): string {
  for (const group of NAV_GROUPS) {
    if (group.items.some((item) => path === item.href || path.startsWith(item.href + '/'))) {
      return group.label;
    }
  }
  return NAV_GROUPS[0].label;
}

export function MobileDrawer({ open, onClose, user }: { open: boolean; onClose: () => void; user: User | null }) {
  const path = usePathname();
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => new Set(NAV_GROUPS.map((g) => g.label)));

  useEffect(() => { if (open) onClose(); }, [path]);

  // Keep the active group open on navigation
  useEffect(() => {
    const active = getActiveGroup(path);
    setOpenGroups((prev) => {
      if (prev.has(active)) return prev;
      const next = new Set(prev);
      next.add(active);
      return next;
    });
  }, [path]);

  function toggleGroup(label: string) {
    if (label === getActiveGroup(path)) return; // never collapse active group
    setOpenGroups((prev) => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  }

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

            <nav className="flex-1 p-3 overflow-y-auto space-y-0.5">
              {NAV_GROUPS.map((group) => {
                const isOpen = openGroups.has(group.label);
                const hasActive = group.items.some((item) => path === item.href || path.startsWith(item.href + '/'));

                return (
                  <div key={group.label}>
                    <button
                      onClick={() => toggleGroup(group.label)}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors select-none',
                        hasActive ? 'text-primary' : 'text-muted-foreground/60 hover:text-muted-foreground',
                      )}
                    >
                      <span>{group.label}</span>
                      <ChevronDown
                        size={13}
                        className={cn('transition-transform duration-200', isOpen ? 'rotate-0' : '-rotate-90')}
                      />
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.18, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-0.5 pb-1">
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
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
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
