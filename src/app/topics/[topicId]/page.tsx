import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

type TopicPageProps = {
  params: Promise<{
    topicId: string;
  }>;
};

export default async function TopicPage({ params }: TopicPageProps) {
  const { topicId } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: topic, error: topicError } = await supabase
    .from('topics')
    .select('id, name')
    .eq('id', topicId)
    .single();

  if (topicError) {
    throw new Error(topicError.message);
  }

  const { data: quizzes, error: quizzesError } = await supabase
    .from('quizzes')
    .select('id, title, question_count, created_at')
    .eq('topic_id', topicId)
    .order('created_at', { ascending: false });

  if (quizzesError) {
    throw new Error(quizzesError.message);
  }

  return (
    <main>
      <h1>{topic.name}</h1>

      {quizzes && quizzes.length > 0 ? (
        <div>
          {quizzes.map((quiz) => (
            <div key={quiz.id}>
              <h2>{quiz.title}</h2>

              <p>{quiz.question_count} questions</p>

              <a href={`/quiz/${quiz.id}`}>
                Start quiz
              </a>
            </div>
          ))}
        </div>
      ) : (
        <p>No quizzes available in this topic yet.</p>
      )}

      <div>
        <a href="/topics">Back to topics</a>
      </div>
    </main>
  );
}