import Link from 'next/link';
import { notFound } from 'next/navigation';
import QuizActions from '@/components/admin/QuizActions';
import { getQuiz, getTopic } from '@/lib/store';

export default async function QuizPage({ params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = await params;
  const quiz = await getQuiz(quizId);
  if (!quiz) notFound();
  const topic = await getTopic(String(quiz.topic_id));

  return (
    <div className="page">
      <div className="page-topbar">
        <div>
          <div className="breadcrumbs"><Link href="/admin">Topics</Link><span>/</span><Link href={`/admin/topics/${quiz.topic_id}`}>{topic?.name ?? 'Topic'}</Link><span>/</span><span>{quiz.title}</span></div>
          <div className="eyebrow">QUIZ</div>
          <h1>{quiz.title}</h1>
          <p className="lede">{quiz.question_count} questions · {topic?.name ?? 'Unknown topic'}</p>
        </div>
        <div className="top-actions">
          <Link href={`/admin/quizzes/${quiz.id}/edit`} className="button secondary">Edit JSON</Link>
          <QuizActions quizId={String(quiz.id)} />
        </div>
      </div>

      <section className="question-preview-list detail-preview">
        {quiz.content.map((question) => (
          <article className="question-preview" key={question.question_id}>
            <div className="question-meta">
              <span className="question-number">Question #{question.question_number} of {question.total_questions}</span>
              <span>Question ID: {question.question_id}</span>
            </div>
            <div className="question-text">{question.text}</div>
            <div className="option-list">
              {question.options.map((option) => (
                <div className={`preview-option ${question.correct_answer === option.label ? 'correct' : ''}`} key={option.label}>
                  <span className="option-copy"><b>{option.label})</b> {option.value}</span>
                  {question.correct_answer === option.label && <span className="check">✓</span>}
                </div>
              ))}
            </div>
            <div className="explanation-block">
              <div className="explanation-title">Explanation</div>
              <p>{question.explanation}</p>
              {question.reference && <div className="reference">({question.reference})</div>}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
