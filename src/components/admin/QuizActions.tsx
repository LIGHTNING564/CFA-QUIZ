'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function QuizActions({ quizId }: { quizId: string }) {
  const router = useRouter();
  const adminTokenRef = useRef<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/token')
      .then((res) => res.json())
      .then((data: { token?: string }) => { if (data.token) adminTokenRef.current = data.token; })
      .catch(() => {});
  }, []);

  async function remove() {
    if (!window.confirm('Delete this quiz? This cannot be undone.')) return;
    const headers: Record<string, string> = {};
    if (adminTokenRef.current) headers['x-admin-secret'] = adminTokenRef.current;
    const response = await fetch(`/api/quizzes/${quizId}`, { method: 'DELETE', headers });
    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      window.alert(data.error ?? 'Unable to delete quiz.');
      return;
    }
    router.push('/admin');
  }
  return <button className="button danger-outline" onClick={remove}>Delete quiz</button>;
}
