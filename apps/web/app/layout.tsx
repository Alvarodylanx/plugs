import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Plug — AI-Powered Exam Preparation',
  description: 'Study smarter for GCE O-Level and A-Level with AI-structured notes, audio lessons, adaptive quizzes, and a community forum.',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground antialiased">{children}</body>
    </html>
  );
}
