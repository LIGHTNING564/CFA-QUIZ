'use client';

import { useState } from 'react';

type QuizOption = {
  label: string;
  value: string;
};

type QuizQuestion = {
  question_number: number;
  total_questions: number;
  question_id: number;
  text: string;
  options: QuizOption[];
  reference: string;
};

type QuizPlayerProps = {
  quizId: string;
  questions: QuizQuestion[];
};

export default function QuizPlayer({
  quizId,
  questions,
}: QuizPlayerProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [answers, setAnswers] = useState<Record<number, string>>({});

  const [submitting, setSubmitting] = useState(false);

  const question = questions[currentQuestion];

  if (!question) {
    return <p>No questions available.</p>;
  }

  const selectedAnswer = answers[question.question_id] ?? null;

  function selectAnswer(answer: string) {
    setAnswers((previousAnswers) => ({
      ...previousAnswers,
      [question.question_id]: answer,
    }));
  }

  function goToPreviousQuestion() {
    setCurrentQuestion((previous) => previous - 1);
  }

  function goToNextQuestion() {
    setCurrentQuestion((previous) => previous + 1);
  }

  async function submitQuiz() {
    setSubmitting(true);

    const response = await fetch(`/api/quiz/${quizId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        answers,
      }),
    });

    const result = await response.json();

if (!response.ok) {
  console.error(result);
  setSubmitting(false);
  return;
}


window.location.href =
  `/quiz/${quizId}/result?attemptId=${result.attempt_id}`;
  }

  return (
    <div>
      <p>
        Question {currentQuestion + 1} of {questions.length}
      </p>

      <h2>{question.text}</h2>

      <div>
        {question.options.map((option) => (
          <button
            key={option.label}
            type="button"
            onClick={() => selectAnswer(option.label)}
          >
            {option.label}. {option.value}
          </button>
        ))}
      </div>

      <p>
        Selected answer:{' '}
        {selectedAnswer ?? 'None'}
      </p>

      <div>
        {currentQuestion > 0 && (
          <button
            type="button"
            onClick={goToPreviousQuestion}
          >
            Previous
          </button>
        )}

        {currentQuestion < questions.length - 1 && (
          <button
            type="button"
            onClick={goToNextQuestion}
          >
            Next
          </button>
        )}
      </div>

      {currentQuestion === questions.length - 1 && (
        <div>
          <button
            type="button"
            onClick={submitQuiz}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        </div>
      )}

      <p>{question.reference}</p>
    </div>
  );
}