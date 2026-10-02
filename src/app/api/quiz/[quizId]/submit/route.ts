import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

type SubmitRequest = {
  answers: Record<string, string>;
};

type RouteProps = {
  params: Promise<{
    quizId: string;
  }>;
};

export async function POST(
  request: Request,
  { params }: RouteProps
) {
  const { quizId } = await params;

  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const body = (await request.json()) as SubmitRequest;

  const answers = body.answers ?? {};

  const { data: quiz, error } = await supabase
    .from('quizzes')
    .select('id, title, content, question_count')
    .eq('id', quizId)
    .single();

  if (error || !quiz) {
    return NextResponse.json(
      { error: 'Quiz not found' },
      { status: 404 }
    );
  }

  const questions = quiz.content ?? [];

  let correctAnswers = 0;
  let incorrectAnswers = 0;
  let unanswered = 0;

  const review = questions.map((question: any) => {
    const selectedAnswer =
      answers[String(question.question_id)] ?? null;

    if (!selectedAnswer) {
      unanswered += 1;
    } else if (selectedAnswer === question.correct_answer) {
      correctAnswers += 1;
    } else {
      incorrectAnswers += 1;
    }

    return {
      question_id: question.question_id,
      question_number: question.question_number,
      text: question.text,
      options: question.options,
      selected_answer: selectedAnswer,
      correct_answer: question.correct_answer,
      explanation: question.explanation,
      reference: question.reference,
    };
  });

  const totalQuestions = questions.length;

  const scorePercentage =
    totalQuestions > 0
      ? (correctAnswers / totalQuestions) * 100
      : 0;

  /*
   * Save the quiz attempt.
   */

  const completedAt = new Date().toISOString();

  const { data: attempt, error: attemptError } =
    await adminSupabase
      .from('quiz_attempts')
      .insert({
        user_id: user.id,
        quiz_id: quiz.id,
        status: 'completed',
        completed_at: completedAt,
        total_questions: totalQuestions,
        correct_answers: correctAnswers,
        incorrect_answers: incorrectAnswers,
        unanswered,
        score_percentage: Number(scorePercentage.toFixed(2)),
      })
      .select('id')
      .single();

  if (attemptError || !attempt) {
    console.error('Failed to save quiz attempt:', attemptError);

    return NextResponse.json(
      { error: 'Failed to save quiz attempt' },
      { status: 500 }
    );
  }

  /*
   * Save each question response.
   */

  const questionAttempts = questions.map((question: any) => {
    const selectedAnswer =
      answers[String(question.question_id)] ?? null;

    return {
      attempt_id: attempt.id,
      question_id: question.question_id,
      question_number: question.question_number,
      selected_answer: selectedAnswer,
      correct_answer: question.correct_answer,
      is_correct:
        selectedAnswer !== null &&
        selectedAnswer === question.correct_answer,
      time_spent_seconds: 0,
      question_snapshot: {
  question_number: question.question_number,
  total_questions: question.total_questions,
  question_id: question.question_id,
  text: question.text,
  options: question.options,
  explanation: question.explanation,
  reference: question.reference,
},
    };
  });

  const { error: questionAttemptsError } =
    await adminSupabase
      .from('question_attempts')
      .insert(questionAttempts);

  if (questionAttemptsError) {
    console.error(
      'Failed to save question attempts:',
      questionAttemptsError
    );

    return NextResponse.json(
      { error: 'Failed to save question attempts' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    attempt_id: attempt.id,
    quiz_id: quiz.id,
    quiz_title: quiz.title,
    total_questions: totalQuestions,
    correct_answers: correctAnswers,
    incorrect_answers: incorrectAnswers,
    unanswered,
    score_percentage: Number(scorePercentage.toFixed(2)),
    review,
  });
}