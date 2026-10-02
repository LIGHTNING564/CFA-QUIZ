import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import QuizPlayer from '@/components/admin/student/QuizPlayer';
import { StudentShell } from '@/components/student/StudentShell';

type QuizPageProps = {
  params: Promise<{
    quizId: string;
  }>;
};

export default async function QuizPage({ params }: QuizPageProps) {
  const { quizId } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: quiz, error } = await supabase
    .from('quizzes')
    .select('id, title, content, question_count')
    .eq('id', quizId)
    .single();

  if (error) {
  return (
    <StudentShell eyebrow="Practice quiz" title="Quiz error">
      <p>{error.message}</p>
    </StudentShell>
  );
}

if (!quiz) {
  return (
    <StudentShell eyebrow="Practice quiz" title="Quiz not found">
      <p>This quiz may no longer be available.</p>
    </StudentShell>
  );
}

  const safeQuestions = (quiz.content ?? []).map((question: any) => ({
    question_number: question.question_number,
    total_questions: question.total_questions,
    question_id: question.question_id,
    text: question.text,
    options: question.options,
    reference: question.reference,
  }));

  return (
    <StudentShell eyebrow="Practice quiz" title={quiz.title} description={`${quiz.question_count} questions`}>

      <QuizPlayer 
      questions={safeQuestions}
      quizId={quizId} />
    </StudentShell>
  );
}
