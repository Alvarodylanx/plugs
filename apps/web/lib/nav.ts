import {
  LayoutDashboard, BookOpen, Headphones, BrainCircuit,
  Calendar, TrendingUp, Users, Youtube, GraduationCap,
  FlaskConical, Globe, Map, Settings, Wrench,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Learn',
    items: [
      { href: '/dashboard',   label: 'Dashboard',    icon: LayoutDashboard },
      { href: '/notes',       label: 'My Notes',     icon: BookOpen },
      { href: '/audio-notes', label: 'Audio Notes',  icon: Headphones },
      { href: '/quizzes',     label: 'Quizzes',      icon: BrainCircuit },
      { href: '/videos',      label: 'Videos',       icon: Youtube },
    ],
  },
  {
    label: 'Plan',
    items: [
      { href: '/timetable',   label: 'Timetable',    icon: Calendar },
      { href: '/progress',    label: 'Progress',     icon: TrendingUp },
    ],
  },
  {
    label: 'Connect',
    items: [
      { href: '/social',      label: 'Community',    icon: Users },
      { href: '/teachers',    label: 'Teachers',     icon: GraduationCap },
    ],
  },
  {
    label: 'Tools',
    items: [
      { href: '/lab',         label: 'Coding Lab',   icon: FlaskConical },
      { href: '/research',    label: 'Research Hub', icon: Globe },
      { href: '/tools',       label: 'Study Toolkit', icon: Wrench },
    ],
  },
  {
    label: 'More',
    items: [
      { href: '/guide',       label: 'Guide',        icon: Map },
      { href: '/settings',    label: 'Profile',      icon: Settings },
    ],
  },
];

// Flat list kept for mobile drawer and any other consumers
export const NAV: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);
