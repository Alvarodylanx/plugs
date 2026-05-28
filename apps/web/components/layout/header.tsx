'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, Search, Flame, Bell, Sun, Moon } from 'lucide-react';
import { MobileDrawer } from './mobile-drawer';
import { useTheme } from '@/components/theme-provider';
import type { User } from '@/types';

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export function Header({ user }: { user: User | null }) {
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

        {/* Search */}
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search notes, quizzes..."
              className="w-full pl-9 pr-4 py-2 rounded-full bg-muted/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary focus:bg-card transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Streak badge */}
          {user && (
            <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-100 rounded-full px-3 py-1.5">
              <Flame size={14} className="text-orange-500" />
              <span className="text-xs font-bold text-orange-700">{user.streak}</span>
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

          {/* Bell */}
          <button className="relative p-2 rounded-xl hover:bg-muted transition-colors">
            <Bell size={18} className="text-foreground" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" />
          </button>

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
