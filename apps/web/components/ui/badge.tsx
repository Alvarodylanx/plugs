import { cn, subjectColor } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'subject' | 'accent' | 'success' | 'muted';
  subject?: string;
  className?: string;
}

export function Badge({ children, variant = 'primary', subject, className }: BadgeProps) {
  const variants = {
    primary: 'bg-primary/10 text-primary',
    subject: subject ? subjectColor(subject) : 'bg-gray-100 text-gray-700',
    accent: 'bg-accent/20 text-amber-700',
    success: 'bg-emerald-100 text-emerald-700',
    muted: 'bg-muted text-muted-foreground',
  };
  return (
    <span className={cn('badge', variants[variant], className)}>
      {children}
    </span>
  );
}
