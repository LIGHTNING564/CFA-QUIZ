import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { CSSProperties } from 'react';
import { createClient } from '@/lib/supabase/server';
import { StudentShell } from '@/components/student/StudentShell';
import styles from '@/components/student/StudentHistory.module.css';

type Attempt = {
  id: string;
  quiz_id: string | number;
  completed_at: string | null;
  total_questions: number;
  correct_answers: number;
  incorrect_answers: number;
  unanswered: number;
  score_percentage: number;
};

type QuizLookup = { id: string | number; title: string };

function formatDate(value: string | null) {
  return value
    ? new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
    : 'Completion time unavailable';
}

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: attemptData, error: attemptsError } = await supabase
    .from('quiz_attempts')
    .select('id, quiz_id, completed_at, total_questions, correct_answers, incorrect_answers, unanswered, score_percentage')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false });

  if (attemptsError) {
    return <StudentShell eyebrow="Your learning record" title="Attempt history" description="Review completed quizzes and revisit each question.">
      <div className={styles.errorCard}>We couldn’t load your attempt history right now. Please refresh the page and try again.</div>
    </StudentShell>;
  }

  const attempts = (attemptData ?? []) as Attempt[];
  const quizIds = [...new Set(attempts.map((attempt) => attempt.quiz_id))];
  let quizzes: QuizLookup[] = [];

  if (quizIds.length) {
    const { data, error } = await supabase.from('quizzes').select('id, title').in('id', quizIds);
    if (error) {
      return <StudentShell eyebrow="Your learning record" title="Attempt history" description="Review completed quizzes and revisit each question.">
        <div className={styles.errorCard}>We couldn’t load the quiz details for your attempts. Please refresh the page and try again.</div>
      </StudentShell>;
    }
    quizzes = (data ?? []) as QuizLookup[];
  }

  const quizById = new Map(quizzes.map((quiz) => [String(quiz.id), quiz.title]));

  return (
    <StudentShell eyebrow="Your learning record" title="Attempt history" description="Review completed quizzes and revisit each question.">
      {attempts.length ? <div className={styles.attemptList}>
        {attempts.map((attempt) => (
          <article className={styles.attemptCard} key={attempt.id}>
            <div className={styles.scoreRing} style={{ '--score': `${Math.max(0, Math.min(100, attempt.score_percentage))}%` } as CSSProperties} aria-label={`Score: ${Math.round(attempt.score_percentage)} percent`}>
              <strong aria-hidden="true">{Math.round(attempt.score_percentage)}%</strong>
            </div>
            <div>
              <h2 className={styles.attemptTitle}>{quizById.get(String(attempt.quiz_id)) ?? 'Quiz unavailable'}</h2>
              <p className={styles.attemptDate}>Completed {formatDate(attempt.completed_at)}</p>
              <ul className={styles.breakdown} aria-label="Attempt breakdown">
                <li className={styles.breakdownItem}><strong>{attempt.correct_answers}</strong> correct</li>
                <li className={styles.breakdownItem}><strong>{attempt.incorrect_answers}</strong> incorrect</li>
                <li className={styles.breakdownItem}><strong>{attempt.unanswered}</strong> unanswered</li>
                <li className={styles.breakdownItem}><strong>{attempt.total_questions}</strong> total</li>
              </ul>
            </div>
            <Link className={styles.reviewButton} href={`/history/${attempt.id}`}>View attempt</Link>
          </article>
        ))}
      </div> : <section className={styles.emptyCard}>
        <div className={styles.emptyIcon} aria-hidden="true">◷</div>
        <h2>No completed attempts yet</h2>
        <p>When you complete a quiz, it will appear here with your score and question-by-question review.</p>
        <Link className={styles.emptyAction} href="/topics">Browse topics</Link>
      </section>}

      <Link className={styles.backLink} href="/dashboard">← Back to dashboard</Link>
    </StudentShell>
  );
}
