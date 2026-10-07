'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Send,
  HelpCircle,
  Bookmark,
  CheckCircle2,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import styles from '@/components/student/StudentQuiz.module.css';

type QuizOption = { label: string; value: string };
type QuizQuestion = {
  question_number: number;
  total_questions: number;
  question_id: number;
  text: string;
  options: QuizOption[];
  reference: string;
};
type QuizPlayerProps = { quizId: string; questions: QuizQuestion[] };

export default function QuizPlayer({ quizId, questions }: QuizPlayerProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const continueButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const question = questions[currentQuestion];
  const answeredCount = questions.filter((item) => Boolean(answers[item.question_id])).length;
  const unansweredCount = questions.length - answeredCount;

  useEffect(() => {
    if (submitDialogOpen) continueButtonRef.current?.focus();
  }, [submitDialogOpen]);

  // Keyboard shortcut listener: 1,2,3 or A,B,C to select option; Arrow keys to navigate
  useEffect(() => {
    function handleGlobalKeys(e: KeyboardEvent) {
      if (submitDialogOpen) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowRight' && currentQuestion < questions.length - 1) {
        setCurrentQuestion((c) => c + 1);
      } else if (e.key === 'ArrowLeft' && currentQuestion > 0) {
        setCurrentQuestion((c) => c - 1);
      } else if (question) {
        const key = e.key.toUpperCase();
        const found = question.options.find((opt) => opt.label.toUpperCase() === key);
        if (found) {
          selectAnswer(found.label);
        }
      }
    }

    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, [currentQuestion, question, questions.length, submitDialogOpen]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!submitDialogOpen) return;
      if (event.key === 'Escape' && !submitting) setSubmitDialogOpen(false);
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const controls = dialogRef.current.querySelectorAll<HTMLElement>('button:not(:disabled)');
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [submitDialogOpen, submitting]);

  if (!question) return <p className={styles.error}>No questions are available for this quiz.</p>;

  const selectedAnswer = answers[question.question_id] ?? null;
  const progress = `${((currentQuestion + 1) / questions.length) * 100}%`;

  function selectAnswer(answer: string) {
    setAnswers((previousAnswers) => ({ ...previousAnswers, [question.question_id]: answer }));
  }

  async function submitQuiz() {
    if (submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const response = await fetch(`/api/quiz/${quizId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });
      const result = await response.json();
      if (!response.ok || !result.attempt_id) {
        setError(result.error ?? 'We could not submit this quiz. Please try again.');
        setSubmitting(false);
        setSubmitDialogOpen(false);
        return;
      }
      window.location.href = `/quiz/${quizId}/result?attemptId=${result.attempt_id}`;
    } catch {
      setError('We could not submit this quiz. Check your connection and try again.');
      setSubmitting(false);
      setSubmitDialogOpen(false);
    }
  }

  return (
    <div className={styles.quiz}>
      <div className={styles.quizTopBar}>
        <div className={styles.quizProgressLabel}>
          Question <strong>{currentQuestion + 1}</strong> of {questions.length}
        </div>
        <div className={styles.answeredPill}>
          <CheckCircle2 size={13} />
          <span>
            {answeredCount} of {questions.length} Answered
          </span>
        </div>
      </div>

      <div className={styles.progressTrack} aria-hidden="true">
        <div className={styles.progressValue} style={{ width: progress }} />
      </div>

      {/* Navigation Matrix */}
      <nav className={styles.questionNav} aria-label="Question jump navigator">
        {questions.map((item, index) => {
          const isCurrent = index === currentQuestion;
          const isAnswered = Boolean(answers[item.question_id]);
          return (
            <button
              key={item.question_id}
              type="button"
              className={`${styles.questionIndex} ${
                isCurrent
                  ? styles.questionIndexCurrent
                  : isAnswered
                  ? styles.questionIndexAnswered
                  : ''
              }`}
              onClick={() => setCurrentQuestion(index)}
              aria-label={`Question ${index + 1}${isAnswered ? ', answered' : ''}${
                isCurrent ? ', current' : ''
              }`}
            >
              {index + 1}
            </button>
          );
        })}
      </nav>

      {/* Question Card */}
      <article className={styles.questionCard}>
        <div className={styles.questionMeta}>
          <span className={styles.questionNumber}>
            <Bookmark size={15} />
            <span>Question {question.question_number}</span>
          </span>
          <span
            className={`${styles.questionStatusPill} ${
              selectedAnswer ? styles.questionStatusPillSelected : ''
            }`}
          >
            {selectedAnswer ? `Selected: Option ${selectedAnswer}` : 'Not answered'}
          </span>
        </div>

        <h2 className={styles.questionText}>{question.text}</h2>

        <div
          className={styles.options}
          role="radiogroup"
          aria-label={`Answer choices for question ${question.question_number}`}
        >
          {question.options.map((option) => {
            const selected = selectedAnswer === option.label;
            return (
              <button
                key={option.label}
                type="button"
                role="radio"
                aria-checked={selected}
                className={`${styles.option} ${selected ? styles.optionSelected : ''}`}
                onClick={() => selectAnswer(option.label)}
              >
                <span className={styles.optionKey} aria-hidden="true">
                  {option.label}
                </span>
                <span>{option.value}</span>
              </button>
            );
          })}
        </div>

        {question.reference && (
          <p className={styles.reference}>
            <BookOpen size={13} />
            <span>Curriculum Reference: {question.reference}</span>
          </p>
        )}
      </article>

      {/* Bottom Actions Toolbar */}
      <div className={styles.actions}>
        <div className={styles.actionGroup}>
          <button
            className={`${styles.button} ${styles.secondaryButton}`}
            type="button"
            onClick={() => setCurrentQuestion((index) => index - 1)}
            disabled={currentQuestion === 0}
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>
          <button
            className={`${styles.button} ${styles.primaryButton}`}
            type="button"
            onClick={() => setCurrentQuestion((index) => index + 1)}
            disabled={currentQuestion === questions.length - 1}
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>

        <button
          className={`${styles.button} ${styles.submitButton}`}
          type="button"
          onClick={() => setSubmitDialogOpen(true)}
          disabled={submitting}
        >
          <Send size={15} />
          <span>Submit Quiz</span>
        </button>
      </div>

      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}

      {/* Confirmation Modal */}
      {submitDialogOpen && (
        <div className={styles.backdrop} role="presentation">
          <div
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="submit-quiz-title"
            ref={dialogRef}
          >
            <p className={styles.dialogEyebrow}>Ready to submit?</p>
            <h2 id="submit-quiz-title">Submit Quiz Attempt</h2>
            <p>
              Once submitted, your answers will be evaluated and added to your progress analytics.
            </p>

            <div className={styles.dialogStats}>
              <div className={styles.dialogStat}>
                <strong>
                  {answeredCount} / {questions.length}
                </strong>
                <span>Questions Answered</span>
              </div>
              <div className={styles.dialogStat}>
                <strong style={{ color: unansweredCount > 0 ? '#f59e0b' : '#10b981' }}>
                  {unansweredCount}
                </strong>
                <span>Unanswered</span>
              </div>
            </div>

            <div className={styles.dialogActions}>
              <button
                className={`${styles.button} ${styles.secondaryButton}`}
                type="button"
                ref={continueButtonRef}
                onClick={() => setSubmitDialogOpen(false)}
                disabled={submitting}
              >
                Continue Quiz
              </button>
              <button
                className={`${styles.button} ${styles.submitButton}`}
                type="button"
                onClick={submitQuiz}
                disabled={submitting}
              >
                {submitting ? 'Submitting…' : 'Confirm & Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
