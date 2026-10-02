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
  questions: QuizQuestion[];
};

export default function QuizPlayer({ questions }: QuizPlayerProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const question = questions[currentQuestion];

  if (!question) {
    return <p>No questions available.</p>;
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
            onClick={() => setSelectedAnswer(option.label)}
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
            onClick={() => {
              setCurrentQuestion(currentQuestion - 1);
              setSelectedAnswer(null);
            }}
          >
            Previous
          </button>
        )}

        {currentQuestion < questions.length - 1 && (
          <button
            type="button"
            onClick={() => {
              setCurrentQuestion(currentQuestion + 1);
              setSelectedAnswer(null);
            }}
          >
            Next
          </button>
        )}
      </div>

      <p>{question.reference}</p>
    </div>
  );
}