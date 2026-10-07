import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { StudentShell } from '@/components/student/StudentShell';
import QuizResultCelebration from '@/components/student/QuizResultCelebration';

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
    <StudentShell
      eyebrow="Evaluation Summary"
      title="Quiz Results"
      description={quiz.title}
    >
      <QuizResultCelebration
        score={Math.round(attempt.score_percentage)}
        correct={attempt.correct_answers}
        incorrect={attempt.incorrect_answers}
        unanswered={attempt.unanswered}
        total={attempt.total_questions}
        quizId={quizId}
        attemptId={attempt.id}
        quizTitle={quiz.title}
      />
    </StudentShell>
  );
}
