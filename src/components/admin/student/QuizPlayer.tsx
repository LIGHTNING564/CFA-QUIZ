'use client';

import { useEffect, useRef, useState } from 'react';
import styles from '@/components/student/StudentQuiz.module.css';

type QuizOption = { label: string; value: string };
type QuizQuestion = { question_number: number; total_questions: number; question_id: number; text: string; options: QuizOption[]; reference: string };
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

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!submitDialogOpen) return;
      if (event.key === 'Escape' && !submitting) setSubmitDialogOpen(false);
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const controls = dialogRef.current.querySelectorAll<HTMLElement>('button:not(:disabled)');
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
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
      <div className={styles.progressHeader} aria-label={`Question ${currentQuestion + 1} of ${questions.length}`}>
        <span><strong>Question {currentQuestion + 1}</strong> of {questions.length}</span>
        <span>{answeredCount} answered</span>
      </div>
      <div className={styles.progressTrack} aria-hidden="true"><div className={styles.progressValue} style={{ width: progress }} /></div>

      <nav className={styles.questionNav} aria-label="Question navigation">
        {questions.map((item, index) => {
          const isCurrent = index === currentQuestion;
          const isAnswered = Boolean(answers[item.question_id]);
          return <button key={item.question_id} type="button" className={`${styles.questionIndex} ${isCurrent ? styles.questionIndexCurrent : isAnswered ? styles.questionIndexAnswered : ''}`} onClick={() => setCurrentQuestion(index)} aria-label={`Question ${index + 1}${isAnswered ? ', answered' : ', unanswered'}${isCurrent ? ', current' : ''}`} aria-current={isCurrent ? 'step' : undefined}>{index + 1}</button>;
        })}
      </nav>

      <article className={styles.questionCard}>
        <div className={styles.questionMeta}><span className={styles.questionNumber}>Question {question.question_number}</span><span>{selectedAnswer ? 'Answer selected' : 'Not answered yet'}</span></div>
        <h2 className={styles.questionText}>{question.text}</h2>
        <div className={styles.options} role="radiogroup" aria-label={`Answer choices for question ${question.question_number}`}>
          {question.options.map((option) => {
            const selected = selectedAnswer === option.label;
            return <button key={option.label} type="button" role="radio" aria-checked={selected} className={`${styles.option} ${selected ? styles.optionSelected : ''}`} onClick={() => selectAnswer(option.label)}>
              <span className={styles.optionKey} aria-hidden="true">{option.label}</span><span>{option.value}</span>
            </button>;
          })}
        </div>
        <p className={styles.selectionStatus} aria-live="polite">{selectedAnswer ? <>Selected answer: <strong>{selectedAnswer}</strong></> : 'Choose one answer to continue.'}</p>
        {question.reference && <p className={styles.reference}>Reference: {question.reference}</p>}
      </article>

      <div className={styles.actions}>
        <div className={styles.actionGroup}>
          <button className={`${styles.button} ${styles.secondaryButton}`} type="button" onClick={() => setCurrentQuestion((index) => index - 1)} disabled={currentQuestion === 0}>Previous</button>
          <button className={`${styles.button} ${styles.primaryButton}`} type="button" onClick={() => setCurrentQuestion((index) => index + 1)} disabled={currentQuestion === questions.length - 1}>Next</button>
        </div>
        <button className={`${styles.button} ${styles.submitButton}`} type="button" onClick={() => setSubmitDialogOpen(true)} disabled={submitting}>Submit quiz</button>
      </div>
      {error && <div className={styles.error} role="alert">{error}</div>}

      {submitDialogOpen && <div className={styles.backdrop} role="presentation">
        <div className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="submit-quiz-title" ref={dialogRef}>
          <p className={styles.dialogEyebrow}>Ready to submit?</p>
          <h2 id="submit-quiz-title">Submit quiz</h2>
          <p>Once submitted, your answers cannot be changed. You can review the completed attempt afterwards.</p>
          <div className={styles.dialogStats}>
            <div className={styles.dialogStat}><strong>{answeredCount} / {questions.length}</strong><span>questions answered</span></div>
            <div className={styles.dialogStat}><strong>{unansweredCount}</strong><span>questions unanswered</span></div>
          </div>
          <div className={styles.dialogActions}>
            <button className={`${styles.button} ${styles.secondaryButton}`} type="button" ref={continueButtonRef} onClick={() => setSubmitDialogOpen(false)} disabled={submitting}>Continue quiz</button>
            <button className={`${styles.button} ${styles.submitButton}`} type="button" onClick={submitQuiz} disabled={submitting}>{submitting ? 'Submitting…' : 'Submit quiz'}</button>
          </div>
        </div>
      </div>}
    </div>
  );
}
