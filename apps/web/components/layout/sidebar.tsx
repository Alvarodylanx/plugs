'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen, Headphones, BrainCircuit, Calendar, TrendingUp, Users, LogOut, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { logout } from '@/lib/auth';
import type { User } from '@/types';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/notes', label: 'My Notes', icon: BookOpen },
  { href: '/audio-notes', label: 'Audio Notes', icon: Headphones },
  { href: '/quizzes', label: 'Quizzes', icon: BrainCircuit },
  { href: '/timetable', label: 'Timetable', icon: Calendar },
  { href: '/progress', label: 'Progress', icon: TrendingUp },
  { href: '/social', label: 'Community', icon: Users },
];

export function Sidebar({ user }: { user: User | null }) {
  const path = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border flex flex-col z-30 hidden lg:flex">
      {/* Logo */}
      <div className="p-6 pb-4">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/30 group-hover:scale-105 transition-transform">
            <span className="text-white font-heading font-bold text-base">P</span>
          </div>
          <span className="font-heading font-bold text-lg text-secondary">Plug</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto scrollbar-hide">
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

      {/* Bottom */}
      <div className="p-3 space-y-2">
        {/* Streak card */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Flame size={16} className="text-orange-500" />
            <span className="font-heading font-bold text-sm text-secondary">{user?.streak ?? 0} Day Streak!</span>
          </div>
          <p className="text-xs text-muted-foreground leading-snug">Keep it up to unlock the 14-day badge.</p>
        </div>

        {/* User info */}
        {user && (
          <div className="flex items-center gap-3 px-3 py-2">
            <img
              src={`https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(user.name)}&backgroundColor=ffffff`}
              alt={user.name}
              className="w-8 h-8 rounded-full border-2 border-primary/30"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.points.toLocaleString()} pts</p>
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={logout}
          className="nav-item nav-item-inactive w-full hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut size={18} className="shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
