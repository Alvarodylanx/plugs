'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Search, Flame, Bell, Sun, Moon, MessageSquare, Loader2, CheckCheck } from 'lucide-react';
import { MobileDrawer } from './mobile-drawer';
import { useTheme } from '@/components/theme-provider';
import { getInitials, formatRelativeTime } from '@/lib/utils';
import { threads as threadsApi } from '@/lib/api';
import type { User } from '@/types';

const NOTIF_SEEN_KEY = 'plug_notif_seen';

interface Notification {
  id: string;
  type: 'reply';
  threadId: string;
  threadTitle: string;
  authorName: string;
  preview: string;
  createdAt: string;
}

function NotificationBell({ user }: { user: User | null }) {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [seenId, setSeenId] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSeenId(localStorage.getItem(NOTIF_SEEN_KEY));
  }, []);

  useEffect(() => {
    if (!open || !user) return;
    setLoading(true);
    threadsApi.notifications()
      .then(n => setNotifs(n as Notification[]))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, user]);

  useEffect(() => {
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  function markAllSeen() {
    const latest = notifs[0]?.id;
    if (latest) {
      localStorage.setItem(NOTIF_SEEN_KEY, latest);
      setSeenId(latest);
    }
  }

  const hasUnseen = seenId === null ? notifs.length > 0 : notifs.length > 0 && notifs[0]?.id !== seenId;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => { setOpen(o => !o); }}
        className="relative p-2 rounded-xl hover:bg-muted transition-colors"
        aria-label="Notifications"
      >
        <Bell size={18} className="text-foreground" />
        {hasUnseen && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full animate-pulse" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-80 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
              <p className="font-semibold text-sm text-secondary">Notifications</p>
              {hasUnseen && (
                <button
                  onClick={markAllSeen}
                  className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  <CheckCheck size={12} /> Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-10 gap-2 text-muted-foreground">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-sm">Loading...</span>
                </div>
              ) : notifs.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <Bell size={28} className="text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-secondary">All caught up!</p>
                  <p className="text-xs text-muted-foreground mt-1">Replies to your questions will appear here.</p>
                </div>
              ) : (
                notifs.map((n, i) => {
                  const isUnseen = seenId === null || i < notifs.findIndex(x => x.id === seenId);
                  return (
                    <Link
                      key={n.id}
                      href="/social"
                      onClick={() => setOpen(false)}
                      className={`flex items-start gap-3 px-4 py-3 hover:bg-muted transition-colors border-b border-border/40 last:border-0 ${isUnseen ? 'bg-primary/3' : ''}`}
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <MessageSquare size={13} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground leading-snug">
                          <span className="font-semibold">{n.authorName}</span> replied to your question
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 font-medium truncate">{n.threadTitle}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-snug">{n.preview}</p>
                        <p className="text-[10px] text-muted-foreground/70 mt-1">{formatRelativeTime(n.createdAt)}</p>
                      </div>
                      {isUnseen && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                    </Link>
                  );
                })
              )}
            </div>

            <div className="px-4 py-2.5 border-t border-border/60 text-center">
              <Link
                href="/social"
                onClick={() => setOpen(false)}
                className="text-xs text-primary font-semibold hover:underline"
              >
                View all community threads →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Header({ user, onSearchClick }: { user: User | null; onSearchClick?: () => void }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const { theme, toggle } = useTheme();

  useEffect(() => {
    const load = () => setAvatar(localStorage.getItem('plug_avatar'));
    load();
    window.addEventListener('plug_profile_updated', load);
    return () => window.removeEventListener('plug_profile_updated', load);
  }, []);

  return (
    <>
      <header className="glass sticky top-0 z-20 h-20 flex items-center px-4 md:px-6 gap-4 border-b border-border/50">
        {/* Mobile menu button */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="lg:hidden p-2 rounded-xl hover:bg-muted transition-colors"
        >
          <Menu size={22} className="text-foreground" />
        </button>

        {/* Search — opens command palette */}
        <button
          onClick={onSearchClick}
          className="flex-1 max-w-sm flex items-center gap-2 pl-3 pr-4 py-2 rounded-full bg-muted/50 border border-border/50 text-sm text-muted-foreground hover:bg-card hover:border-primary/30 hover:text-foreground transition-all group"
        >
          <Search size={16} className="shrink-0" />
          <span className="flex-1 text-left">Search notes, quizzes...</span>
          <kbd className="hidden sm:inline-flex items-center gap-1 text-[10px] bg-background border border-border/60 px-1.5 py-0.5 rounded font-mono opacity-60 group-hover:opacity-100 transition-opacity">
            Ctrl K
          </kbd>
        </button>

        <div className="flex items-center gap-2 ml-auto">
          {/* Streak badge */}
          {user && (
            <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full px-3 py-1.5">
              <Flame size={14} className="text-orange-500" />
              <span className="text-xs font-bold text-orange-500">{user.streak}</span>
            </div>
          )}

          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
            aria-label="Toggle dark mode"
          >
            {theme === 'dark'
              ? <Sun size={18} className="text-amber-400" />
              : <Moon size={18} className="text-foreground" />}
          </button>

          {/* Notification bell */}
          <NotificationBell user={user} />

          {/* Avatar + info */}
          {user && (
            <Link href="/settings" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
              {avatar ? (
                <img src={avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/40" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-indigo-500 flex items-center justify-center text-white font-bold text-sm ring-2 ring-primary/30">
                  {getInitials(user.name)}
                </div>
              )}
              <div className="hidden lg:block">
                <p className="text-sm font-semibold text-foreground leading-none">{user.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{user.points.toLocaleString()} pts</p>
              </div>
            </Link>
          )}
        </div>
      </header>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} user={user} />
    </>
  );
}
