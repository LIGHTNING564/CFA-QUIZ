'use client';

import { useRouter } from 'next/navigation';

export default function QuizActions({ quizId }: { quizId: string }) {
  const router = useRouter();
  async function remove() {
    if (!window.confirm('Delete this quiz? This cannot be undone.')) return;
    const response = await fetch(`/api/quizzes/${quizId}`, { method: 'DELETE' });
    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      window.alert(data.error ?? 'Unable to delete quiz.');
      return;
    }
    router.push('/admin');
  }
  return <button className="button danger-outline" onClick={remove}>Delete quiz</button>;
}
