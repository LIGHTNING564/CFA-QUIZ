import Link from 'next/link';
import TopicCreate from '@/components/admin/TopicCreate';
import { listQuizzes, listTopics } from '@/lib/store';

export default async function AdminHome() {
  const [topics, quizzes] = await Promise.all([listTopics(), listQuizzes()]);
  const counts = new Map<string, number>();
  quizzes.forEach((quiz) => counts.set(String(quiz.topic_id), (counts.get(String(quiz.topic_id)) ?? 0) + 1));

  return (
    <div className="page">
      <div className="page-topbar">
        <div>
          <div className="eyebrow">CONTENT LIBRARY</div>
          <h1>Topics</h1>
          <p className="lede">Organize your CFA question sets by topic, then keep each quiz as one validated JSON payload.</p>
        </div>
        <TopicCreate />
      </div>

      <section className="stats-row">
        <div className="stat-card"><span>Topics</span><strong>{topics.length}</strong></div>
        <div className="stat-card"><span>Quizzes</span><strong>{quizzes.length}</strong></div>
        <div className="stat-card"><span>Questions</span><strong>{quizzes.reduce((total, quiz) => total + quiz.question_count, 0)}</strong></div>
      </section>

      <section className="topic-grid">
        {topics.map((topic) => (
          <Link href={`/admin/topics/${topic.id}`} className="topic-card" key={String(topic.id)}>
            <div className="topic-card-top">
              <span className="topic-icon">{topic.name.slice(0, 1).toUpperCase()}</span>
              <span className="topic-arrow">↗</span>
            </div>
            <h2>{topic.name}</h2>
            <div className="topic-meta">{counts.get(String(topic.id)) ?? 0} quizzes</div>
          </Link>
        ))}
        {topics.length === 0 && (
          <div className="empty-card">
            <div className="empty-icon">+</div>
            <h2>No topics yet</h2>
            <p>Create your first topic to start organizing quizzes.</p>
          </div>
        )}
      </section>
    </div>
  );
}
