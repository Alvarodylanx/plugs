'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Menu, Search, Flame, Bell } from 'lucide-react';
import { MobileDrawer } from './mobile-drawer';
import type { User } from '@/types';

export function Header({ user }: { user: User | null }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

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

          {/* Bell */}
          <button className="relative p-2 rounded-xl hover:bg-muted transition-colors">
            <Bell size={18} className="text-foreground" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" />
          </button>

          {/* Avatar + info */}
          {user && (
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <img
                  src={`https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(user.name)}&backgroundColor=ffffff`}
                  alt={user.name}
                  className="w-10 h-10 rounded-full"
                  style={{ border: '2px solid transparent', backgroundClip: 'padding-box', boxShadow: '0 0 0 2px hsl(173,85%,38%), 0 0 0 4px hsl(252,39%,30%)' }}
                />
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-semibold text-foreground leading-none">{user.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{user.points.toLocaleString()} pts</p>
              </div>
            </div>
          )}
        </div>
      </header>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} user={user} />
    </>
  );
}
