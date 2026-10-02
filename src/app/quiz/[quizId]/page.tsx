import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import QuizPlayer from '@/components/admin/student/QuizPlayer';

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
    <main>
      <h1>Quiz error</h1>
      <p>{error.message}</p>
    </main>
  );
}

if (!quiz) {
  return (
    <main>
      <h1>Quiz not found</h1>
    </main>
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
    <main>
      <h1>{quiz.title}</h1>

      <p>{quiz.question_count} questions</p>

      <QuizPlayer questions={safeQuestions} />
    </main>
  );
}