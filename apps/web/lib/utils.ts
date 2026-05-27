import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function subjectColor(subject: string): string {
  const map: Record<string, string> = {
    'Computer Science / ICT': 'subject-cs',
    'Biology': 'subject-biology',
    'History': 'subject-history',
    'Mathematics': 'subject-mathematics',
    'Physics': 'subject-physics',
    'Chemistry': 'subject-chemistry',
    'English': 'subject-english',
    'Geography': 'subject-geography',
    'Economics': 'subject-economics',
  };
  return map[subject] || 'bg-gray-100 text-gray-700';
}

export function subjectIcon(subject: string): string {
  const map: Record<string, string> = {
    'Computer Science / ICT': '💻',
    'Biology': '🧬',
    'History': '📜',
    'Mathematics': '📐',
    'Physics': '⚛️',
    'Chemistry': '🧪',
    'English': '📖',
    'Geography': '🌍',
    'Economics': '📊',
  };
  return map[subject] || '📝';
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function gradeFromPercentage(pct: number): { grade: string; color: string } {
  if (pct >= 90) return { grade: 'A*', color: 'text-emerald-600' };
  if (pct >= 80) return { grade: 'A', color: 'text-green-600' };
  if (pct >= 70) return { grade: 'B', color: 'text-blue-600' };
  if (pct >= 60) return { grade: 'C', color: 'text-yellow-600' };
  if (pct >= 50) return { grade: 'D', color: 'text-orange-600' };
  return { grade: 'F', color: 'text-red-600' };
}

export function avatarUrl(name: string): string {
  return `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(name)}&backgroundColor=ffffff`;
}

export function getDayOfWeek(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { weekday: 'long' });
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function getWeekDates(offset = 0): { date: Date; label: string; dateStr: string }[] {
  const today = new Date();
  const monday = new Date(today);
  const day = today.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  monday.setDate(today.getDate() + diff + offset * 7);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      date: d,
      label: d.toLocaleDateString('en-GB', { weekday: 'short' }),
      dateStr: d.toISOString().split('T')[0],
    };
  });
}
