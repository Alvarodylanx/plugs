'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GenerateQuizPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/notes/upload');
  }, [router]);

  return null;
}
