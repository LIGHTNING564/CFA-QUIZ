import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTopic, listQuizzes } from '@/lib/store';

export default async function TopicPage({ params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = await params;
  const [topic, quizzes] = await Promise.all([getTopic(topicId), listQuizzes(topicId)]);
  if (!topic) notFound();

  return (
    <div className="page">
      <div className="page-topbar">
        <div>
          <div className="breadcrumbs"><Link href="/admin">Topics</Link><span>/</span><span>{topic.name}</span></div>
          <div className="eyebrow">TOPIC</div>
          <h1>{topic.name}</h1>
          <p className="lede">Quizzes authored under this topic.</p>
        </div>
        <Link href={`/admin/quizzes/new?topicId=${topic.id}`} className="button primary">+ Create Quiz</Link>
      </div>

      <section className="quiz-list">
        {quizzes.map((quiz) => (
          <div className="quiz-row" key={String(quiz.id)}>
            <div>
              <h2>{quiz.title}</h2>
              <div className="quiz-row-meta">{quiz.question_count} questions · Updated {new Date(quiz.updated_at).toLocaleDateString()}</div>
            </div>
            <div className="row-actions">
              <Link className="button secondary small" href={`/admin/quizzes/${quiz.id}`}>Open</Link>
              <Link className="button secondary small" href={`/admin/quizzes/${quiz.id}/edit`}>Edit</Link>
            </div>
          </div>
        ))}
        {quizzes.length === 0 && (
          <div className="empty-card wide">
            <div className="empty-icon">+</div>
            <h2>No quizzes in this topic</h2>
            <p>Create the first quiz from your JSON payload.</p>
            <Link href={`/admin/quizzes/new?topicId=${topic.id}`} className="button primary">Create quiz</Link>
          </div>
        )}
      </section>
    </div>
  );
}
