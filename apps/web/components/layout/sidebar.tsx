'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Flame, Settings } from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import { NAV_GROUPS } from '@/lib/nav';
import { logout } from '@/lib/auth';
import type { User } from '@/types';

export function Sidebar({ user }: { user: User | null }) {
  const path = usePathname();
  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => {
    const load = () => setAvatar(localStorage.getItem('plug_avatar'));
    load();
    window.addEventListener('plug_profile_updated', load);
    return () => window.removeEventListener('plug_profile_updated', load);
  }, []);

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border flex flex-col z-30 hidden lg:flex">
      {/* Logo */}
      <div className="px-5 pt-5 pb-4">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shadow-md shadow-primary/30 group-hover:scale-105 transition-transform">
            <span className="text-white font-heading font-bold text-base">P</span>
          </div>
          <span className="font-heading font-bold text-lg text-secondary">Plug</span>
        </Link>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 px-3 overflow-y-auto scrollbar-hide space-y-4 pb-2">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 select-none">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ href, label, icon: Icon }) => {
                const active = path === href || path.startsWith(href + '/');
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn('nav-item', active ? 'nav-item-active' : 'nav-item-inactive')}
                  >
                    <Icon size={17} className="shrink-0" />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-3 space-y-2 border-t border-border/60">
        {/* Streak card */}
        <div className="bg-muted rounded-2xl border border-border p-3.5">
          <div className="flex items-center gap-2 mb-0.5">
            <Flame size={15} className="text-orange-500" />
            <span className="font-heading font-bold text-sm text-secondary">{user?.streak ?? 0} Day Streak!</span>
          </div>
          <p className="text-xs text-muted-foreground leading-snug">Keep it up to unlock the 14-day badge.</p>
        </div>

        {/* User card */}
        {user && (
          <Link href="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors group">
            {avatar ? (
              <img src={avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover border-2 border-primary/30 shrink-0" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-indigo-500 flex items-center justify-center text-white font-bold text-sm shrink-0 border-2 border-primary/20">
                {getInitials(user.name)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.points.toLocaleString()} pts</p>
            </div>
            <Settings size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </Link>
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
