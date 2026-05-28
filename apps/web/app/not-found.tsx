import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="text-8xl font-heading font-black text-primary/20 select-none">404</div>
        <div className="space-y-2">
          <h1 className="font-heading font-bold text-2xl text-foreground">Page not found</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            This page doesn't exist or was moved. Head back to your dashboard to keep studying.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="btn-primary gap-2"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/notes"
            className="btn-outline gap-2"
          >
            My Notes
          </Link>
        </div>
      </div>
    </div>
  );
}
