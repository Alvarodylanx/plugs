'use client';
import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function QuizResultsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/notes/${id}`);
  }, [id, router]);

  return null;
}
