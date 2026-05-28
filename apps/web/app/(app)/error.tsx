'use client';
import { useEffect } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[Plug App Error]', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center space-y-5 max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
          <AlertTriangle size={28} className="text-destructive" />
        </div>
        <div className="space-y-2">
          <h2 className="font-heading font-bold text-xl text-secondary">Something went wrong</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            An unexpected error occurred. Your data is safe — try refreshing the page.
          </p>
          {error.message && (
            <p className="text-xs text-muted-foreground bg-muted rounded-xl px-3 py-2 font-mono break-all">
              {error.message}
            </p>
          )}
        </div>
        <div className="flex items-center justify-center gap-3">
          <button onClick={reset} className="btn-primary gap-2">
            <RotateCcw size={15} /> Try again
          </button>
          <Link href="/dashboard" className="btn-outline gap-2">
            <Home size={15} /> Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
