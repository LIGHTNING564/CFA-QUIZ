import { notFound } from 'next/navigation';
import QuizEditor from '@/components/admin/QuizEditor';
import { getQuiz, listTopics } from '@/lib/store';

export default async function EditQuizPage({ params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = await params;
  const [quiz, topics] = await Promise.all([getQuiz(quizId), listTopics()]);
  if (!quiz) notFound();
  return <QuizEditor topics={topics} initialQuiz={quiz} />;
}
