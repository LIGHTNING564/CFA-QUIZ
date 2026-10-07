import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { StudentShell } from '@/components/student/StudentShell';
import { 
  BookOpen, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles,
  Layers
} from 'lucide-react';
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
    <StudentShell
      eyebrow="Curriculum Modules"
      title="Practice Topics"
      description="Choose a CFA Level I study area to access targeted practice quizzes and mock problems."
    >
      {topics && topics.length > 0 ? (
        <div className={styles.topicGrid}>
          {topics.map((topic, index) => (
            <article className={styles.topicCard} key={topic.id}>
              <div className={styles.topicCardHeader}>
                <span className={styles.topicNumber} aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className={styles.topicBadge}>
                  <Layers size={13} />
                  <span>Module {index + 1}</span>
                </span>
              </div>
              <h2>{topic.name}</h2>
              <p>Explore question banks, exam-weighted problems, and detailed explanations.</p>
              <Link className={styles.cardAction} href={`/topics/${topic.id}`}>
                <span>View practice quizzes</span>
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className={styles.topicCard}>
          <h2>No topics available yet</h2>
          <p>Please check back soon or create new quizzes in the admin workspace.</p>
        </div>
      )}

      <div>
        <Link className={styles.backLink} href="/dashboard">
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    </StudentShell>
  );
}
