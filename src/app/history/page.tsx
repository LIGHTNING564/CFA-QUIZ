import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { CSSProperties } from 'react';
import { createClient } from '@/lib/supabase/server';
import { StudentShell } from '@/components/student/StudentShell';
import {
  History,
  ArrowRight,
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  BookOpen,
  ChevronRight,
} from 'lucide-react';
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
    ? new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(value))
    : 'Completion time unavailable';
}

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: attemptData, error: attemptsError } = await supabase
    .from('quiz_attempts')
    .select('id, quiz_id, completed_at, total_questions, correct_answers, incorrect_answers, unanswered, score_percentage')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false });

  if (attemptsError) {
    return (
      <StudentShell
        eyebrow="Learning Record"
        title="Attempt History"
        description="Review completed quizzes and revisit each question."
      >
        <div className={styles.errorCard}>
          We couldn’t load your attempt history right now. Please refresh the page and try again.
        </div>
      </StudentShell>
    );
  }

  const attempts = (attemptData ?? []) as Attempt[];
  const quizIds = [...new Set(attempts.map((attempt) => attempt.quiz_id))];
  let quizzes: QuizLookup[] = [];

  if (quizIds.length) {
    const { data, error } = await supabase.from('quizzes').select('id, title').in('id', quizIds);
    if (error) {
      return (
        <StudentShell
          eyebrow="Learning Record"
          title="Attempt History"
          description="Review completed quizzes and revisit each question."
        >
          <div className={styles.errorCard}>
            We couldn’t load the quiz details for your attempts. Please refresh the page and try again.
          </div>
        </StudentShell>
      );
    }
    quizzes = (data ?? []) as QuizLookup[];
  }

  const quizById = new Map(quizzes.map((quiz) => [String(quiz.id), quiz.title]));

  return (
    <StudentShell
      eyebrow="Learning Archive"
      title="Attempt History"
      description="Track your performance progression and deep dive into question explanations."
    >
      {attempts.length ? (
        <div className={styles.attemptList}>
          {attempts.map((attempt) => {
            const score = Math.round(attempt.score_percentage);
            const scoreColor = score >= 75 ? '#10b981' : score >= 60 ? '#f59e0b' : '#f43f5e';

            return (
              <article className={styles.attemptCard} key={attempt.id}>
                <div
                  className={styles.scoreRing}
                  style={
                    {
                      '--score': `${Math.max(0, Math.min(100, attempt.score_percentage))}%`,
                      '--score-color': scoreColor,
                    } as CSSProperties
                  }
                  aria-label={`Score: ${score} percent`}
                >
                  <strong aria-hidden="true">{score}%</strong>
                </div>

                <div>
                  <h2 className={styles.attemptTitle}>
                    {quizById.get(String(attempt.quiz_id)) ?? 'Practice Quiz'}
                  </h2>
                  <div className={styles.attemptDate}>
                    <Clock size={13} />
                    <span>Completed {formatDate(attempt.completed_at)}</span>
                  </div>

                  <ul className={styles.breakdown} aria-label="Attempt breakdown">
                    <li className={`${styles.breakdownItem} ${styles.breakdownCorrect}`}>
                      <CheckCircle2 size={13} />
                      <strong>{attempt.correct_answers}</strong> correct
                    </li>
                    <li className={`${styles.breakdownItem} ${styles.breakdownIncorrect}`}>
                      <XCircle size={13} />
                      <strong>{attempt.incorrect_answers}</strong> incorrect
                    </li>
                    {attempt.unanswered > 0 && (
                      <li className={`${styles.breakdownItem} ${styles.breakdownUnanswered}`}>
                        <HelpCircle size={13} />
                        <strong>{attempt.unanswered}</strong> skipped
                      </li>
                    )}
                    <li className={`${styles.breakdownItem} ${styles.breakdownTotal}`}>
                      <strong>{attempt.total_questions}</strong> total
                    </li>
                  </ul>
                </div>

                <Link className={styles.reviewButton} href={`/history/${attempt.id}`}>
                  <span>Review Answers</span>
                  <ChevronRight size={15} />
                </Link>
              </article>
            );
          })}
        </div>
      ) : (
        <section className={styles.emptyCard}>
          <div className={styles.emptyIcon} aria-hidden="true">
            <History size={26} />
          </div>
          <h2>No completed attempts yet</h2>
          <p>
            When you complete a quiz, it will appear here with your score ring, accuracy breakdown, and solution explanations.
          </p>
          <Link className={styles.emptyAction} href="/topics">
            <BookOpen size={16} />
            <span>Browse Topics</span>
          </Link>
        </section>
      )}

      <div>
        <Link className={styles.backLink} href="/dashboard">
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    </StudentShell>
  );
}
