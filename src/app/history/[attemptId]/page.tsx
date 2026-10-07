import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { StudentShell } from '@/components/student/StudentShell';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Lightbulb,
  BookOpen,
  ArrowLeft,
  Award,
  Sparkles,
  BookmarkCheck,
} from 'lucide-react';
import styles from '@/components/student/StudentHistory.module.css';

type AttemptPageProps = {
  params: Promise<{
    attemptId: string;
  }>;
};

export default async function AttemptPage({ params }: AttemptPageProps) {
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

  const { data: questionAttempts, error: questionError } = await supabase
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

  const score = Math.round(attempt.score_percentage);
  const isMastery = score >= 75;
  const isPassing = score >= 70;
  const scoreColor = isMastery ? '#10b981' : isPassing ? '#06b6d4' : score >= 60 ? '#f59e0b' : '#f43f5e';

  return (
    <StudentShell
      eyebrow="Detailed Attempt Review"
      title={quiz.title}
      description="Review your answers against the CFA answer key, step-by-step rationales, and reading references."
    >
      {/* Top Score Banner */}
      <div className={styles.detailHeaderCard}>
        <div className={styles.detailScoreWrap}>
          <div className={styles.detailScoreNumber} style={{ color: scoreColor }}>
            {score}%
          </div>
          <div>
            <div className={styles.detailScoreTitle}>
              {isMastery ? 'Mastery Level Achieved 🎉' : isPassing ? 'Passing Standard Met 🎯' : 'Needs Review & Practice 💡'}
            </div>
            <div className={styles.detailScoreSub}>
              {attempt.correct_answers} of {attempt.total_questions} questions answered correctly
            </div>
          </div>
        </div>

        <div className={styles.detailStatsGrid}>
          <span className={styles.detailStatPill} style={{ background: '#ecfdf5', color: '#059669', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
            <CheckCircle2 size={16} />
            <span>{attempt.correct_answers} Correct</span>
          </span>
          <span className={styles.detailStatPill} style={{ background: '#fff1f2', color: '#e11d48', border: '1px solid rgba(244, 63, 94, 0.25)' }}>
            <XCircle size={16} />
            <span>{attempt.incorrect_answers} Incorrect</span>
          </span>
          {attempt.unanswered > 0 && (
            <span className={styles.detailStatPill} style={{ background: '#fffbeb', color: '#b45309', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
              <HelpCircle size={16} />
              <span>{attempt.unanswered} Skipped</span>
            </span>
          )}
        </div>
      </div>

      {/* Question by Question Review */}
      <div className={styles.questionReviewSection}>
        {questionAttempts && questionAttempts.length > 0 ? (
          questionAttempts.map((q) => {
            const snapshot = q.question_snapshot as {
              text: string;
              options: { label: string; value: string }[];
              explanation?: string;
              reference?: string;
            };

            const isCorrect = q.is_correct;

            return (
              <article className={styles.questionReviewCard} key={q.id}>
                <div className={styles.questionReviewTop}>
                  <span className={styles.questionNumberTag}>
                    <BookmarkCheck size={16} />
                    <span>Question {q.question_number}</span>
                  </span>

                  <span
                    className={`${styles.resultTag} ${
                      isCorrect ? styles.resultTagCorrect : styles.resultTagIncorrect
                    }`}
                  >
                    {isCorrect ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    <span>{isCorrect ? 'Correct' : 'Incorrect'}</span>
                  </span>
                </div>

                <p className={styles.questionPrompt}>{snapshot.text}</p>

                <div className={styles.reviewOptionsList}>
                  {snapshot.options.map((opt) => {
                    const isOptionCorrect = opt.label === q.correct_answer;
                    const isUserChoice = opt.label === q.selected_answer;

                    let optionClass = styles.reviewOption;
                    if (isOptionCorrect) {
                      optionClass += ` ${styles.reviewOptionCorrect}`;
                    } else if (isUserChoice && !isCorrect) {
                      optionClass += ` ${styles.reviewOptionIncorrectUser}`;
                    }

                    return (
                      <div className={optionClass} key={opt.label}>
                        <span className={styles.reviewOptionKey}>{opt.label}</span>
                        <div style={{ flex: 1 }}>
                          <span>{opt.value}</span>
                          {isUserChoice && (
                            <strong style={{ display: 'block', fontSize: '11.5px', marginTop: '4px' }}>
                              (Your Choice)
                            </strong>
                          )}
                        </div>
                        {isOptionCorrect && (
                          <span style={{ fontSize: '12px', fontWeight: 800, color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={15} /> Correct
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {snapshot.explanation && (
                  <div className={styles.explanationBox}>
                    <div className={styles.explanationHeader}>
                      <Lightbulb size={16} />
                      <span>Explanation & Reasoning</span>
                    </div>
                    <p className={styles.explanationText}>{snapshot.explanation}</p>
                    {snapshot.reference && (
                      <div className={styles.referenceBadge}>
                        <BookOpen size={13} />
                        <span>Curriculum Reference: {snapshot.reference}</span>
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })
        ) : (
          <div className={styles.emptyCard}>
            <p>No question details found for this attempt.</p>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '16px', marginTop: '36px' }}>
        <Link className={styles.backLink} href="/history">
          <ArrowLeft size={16} />
          <span>Back to Attempt History</span>
        </Link>
      </div>
    </StudentShell>
  );
}
