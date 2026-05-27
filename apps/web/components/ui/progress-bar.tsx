'use client';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  fillClassName?: string;
  label?: string;
  showPercent?: boolean;
}

export function ProgressBar({ value, max = 100, className, fillClassName, label, showPercent }: ProgressBarProps) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="flex flex-col gap-1">
      {(label || showPercent) && (
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          {label && <span>{label}</span>}
          {showPercent && <span className="font-semibold text-foreground">{pct}%</span>}
        </div>
      )}
      <div className={cn('progress-bar', className)}>
        <div className={cn('progress-fill', fillClassName)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
