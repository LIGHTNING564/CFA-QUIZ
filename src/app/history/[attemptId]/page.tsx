import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

type AttemptPageProps = {
  params: Promise<{
    attemptId: string;
  }>;
};

export default async function AttemptPage({
  params,
}: AttemptPageProps) {
  const { attemptId } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: attempt, error: attemptError } = await supabase
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
    .eq('id', attemptId)
    .eq('user_id', user.id)
    .single();

  if (attemptError || !attempt) {
    notFound();
  }

  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .select('id, title')
    .eq('id', attempt.quiz_id)
    .single();

  if (quizError || !quiz) {
    throw new Error(quizError?.message ?? 'Quiz not found');
  }

  const { data: questionAttempts, error: questionError } =
    await supabase
      .from('question_attempts')
      .select(`
        id,
        question_id,
        question_number,
        selected_answer,
        correct_answer,
        is_correct,
        question_snapshot
      `)
      .eq('attempt_id', attempt.id)
      .order('question_number');

  if (questionError) {
    throw new Error(questionError.message);
  }

  return (
    <main>
      <h1>{quiz.title}</h1>

      <h2>Attempt Result</h2>

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

      <hr />

      <h2>Question Review</h2>

      {questionAttempts && questionAttempts.length > 0 ? (
        <div>
          {questionAttempts.map((question) => {
            const snapshot = question.question_snapshot as {
  text: string;
  options: {
    label: string;
    value: string;
  }[];
  explanation?: string;
  reference?: string;
};

            return (
              <div key={question.id}>
                <h3>
                  Question {question.question_number}
                </h3>

                <p>{snapshot.text}</p>

                <div>
                  {snapshot.options.map((option) => (
                    <p key={option.label}>
                      {option.label}. {option.value}
                    </p>
                  ))}
                </div>

                <p>
                  Your answer:{' '}
                  {question.selected_answer ?? 'Not answered'}
                </p>

                <p>
                  Correct answer: {question.correct_answer}
                </p>

                <p>
  Result:{' '}
  {question.is_correct
    ? 'Correct'
    : 'Incorrect'}
</p>

{snapshot.explanation && (
  <p>
    Explanation: {snapshot.explanation}
  </p>
)}

{snapshot.reference && (
  <p>
    Reference: {snapshot.reference}
  </p>
)}

                <hr />
              </div>
            );
          })}
        </div>
      ) : (
        <p>No question details found.</p>
      )}

      <div>
        <a href="/history">Back to history</a>
      </div>
    </main>
  );
}