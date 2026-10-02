import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { StudentShell } from '@/components/student/StudentShell';
import styles from '@/components/student/StudentCatalog.module.css';

export default async function TopicsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: topics, error } = await supabase
    .from('topics')
    .select('id, name')
    .order('name');

  if (error) {
    throw new Error(error.message);
  }

  return (
    <StudentShell eyebrow="Practice library" title="Topics" description="Choose a topic to see its available practice quizzes.">

      {topics && topics.length > 0 ? (
        <div className={styles.topicGrid}>
          {topics.map((topic, index) => (
            <article className={styles.topicCard} key={topic.id}>
              <span className={styles.topicNumber} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <h2>{topic.name}</h2>
              <p>Explore the available practice quizzes for this topic.</p>
              <Link className={styles.cardAction} href={`/topics/${topic.id}`}>
                View quizzes <span aria-hidden="true">→</span>
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <p>No topics are available yet. Please check back soon.</p>
      )}

      <Link className={styles.backLink} href="/dashboard">← Back to dashboard</Link>
    </StudentShell>
  );
}
