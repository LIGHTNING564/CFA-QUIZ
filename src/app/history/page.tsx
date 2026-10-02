import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function HistoryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: attempts, error } = await supabase
  .from('quiz_attempts')
  .select(`
    id,
    quiz_id,
    status,
    completed_at,
    total_questions,
    correct_answers,
    incorrect_answers,
    unanswered,
    score_percentage
  `)
  .eq('user_id', user.id)
  .eq('status', 'completed')
  .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }
  const quizIds = [
  ...new Set(
    (attempts ?? []).map((attempt) => attempt.quiz_id)
  ),
];

const { data: quizzes, error: quizzesError } = await supabase
  .from('quizzes')
  .select('id, title')
  .in('id', quizIds);

if (quizzesError) {
  throw new Error(quizzesError.message);
}

  return (
    <main>
      <h1>Attempt History</h1>

      {attempts && attempts.length > 0 ? (
        <div>
          {attempts.map((attempt) => (
            <div key={attempt.id}>
                <h2>
  {quizzes?.find(
    (quiz) => quiz.id === attempt.quiz_id
  )?.title ?? `Quiz #${attempt.quiz_id}`}
</h2>

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

              <p>
                Completed:{' '}
                {attempt.completed_at
                  ? new Date(attempt.completed_at).toLocaleString()
                  : 'Unknown'}
              </p>

              <a href={`/history/${attempt.id}`}>
                View attempt
              </a>

              <hr />
            </div>
          ))}
        </div>
      ) : (
        <p>No completed attempts yet.</p>
      )}

      <div>
        <a href="/dashboard">Back to dashboard</a>
      </div>
    </main>
  );
}