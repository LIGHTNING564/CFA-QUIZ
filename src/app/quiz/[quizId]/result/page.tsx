import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { StudentShell } from '@/components/student/StudentShell';

type QuizResultPageProps = {
  params: Promise<{
    quizId: string;
  }>;
  searchParams: Promise<{
    attemptId?: string;
  }>;
};

export default async function QuizResultPage({
  params,
  searchParams,
}: QuizResultPageProps) {
  const { quizId } = await params;
  const { attemptId } = await searchParams;

  if (!attemptId) {
    redirect(`/quiz/${quizId}`);
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: attempt, error } = await supabase
    .from('quiz_attempts')
    .select(`
      id,
      quiz_id,
      total_questions,
      correct_answers,
      incorrect_answers,
      unanswered,
      score_percentage,
      completed_at
    `)
    .eq('id', attemptId)
    .eq('quiz_id', quizId)
    .eq('user_id', user.id)
    .single();

  if (error || !attempt) {
    notFound();
  }

  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .select('id, title')
    .eq('id', quizId)
    .single();

  if (quizError || !quiz) {
    notFound();
  }

  return (
    <StudentShell eyebrow="Quiz complete" title="Quiz result" description={quiz.title}>

      <p>
        Score: {attempt.score_percentage}%
      </p>

      <p>
        Correct: {attempt.correct_answers}
      </p>

      <p>
        Incorrect: {attempt.incorrect_answers}
      </p>

      <p>
        Unanswered: {attempt.unanswered}
      </p>

      <p>
        Total questions: {attempt.total_questions}
      </p>

      <div>
        <a href={`/history/${attempt.id}`}>
          Review this attempt
        </a>
      </div>

      <div>
        <a href="/history">
          View attempt history
        </a>
      </div>

      <div>
        <a href="/topics">
          Back to topics
        </a>
      </div>
    </StudentShell>
  );
}
