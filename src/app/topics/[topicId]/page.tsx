import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { StudentShell } from '@/components/student/StudentShell';
import styles from '@/components/student/StudentCatalog.module.css';

type TopicPageProps = {
  params: Promise<{
    topicId: string;
  }>;
};

export default async function TopicPage({ params }: TopicPageProps) {
  const { topicId } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: topic, error: topicError } = await supabase
    .from('topics')
    .select('id, name')
    .eq('id', topicId)
    .single();

  if (topicError) {
    throw new Error(topicError.message);
  }

  const { data: quizzes, error: quizzesError } = await supabase
    .from('quizzes')
    .select('id, title, question_count, created_at')
    .eq('topic_id', topicId)
    .order('created_at', { ascending: false });

  if (quizzesError) {
    throw new Error(quizzesError.message);
  }

  return (
    <StudentShell eyebrow="Practice library" title={topic.name} description="Select a quiz when you are ready to practise.">

      {quizzes && quizzes.length > 0 ? (
        <div className={styles.quizGrid}>
          {quizzes.map((quiz) => (
            <article className={styles.quizCard} key={quiz.id}>
              <span className={styles.quizBadge}>Practice quiz</span>
              <h2>{quiz.title}</h2>

              <p className={styles.quizMeta}>{quiz.question_count} questions</p>

              <Link className={styles.startButton} href={`/quiz/${quiz.id}`}>
                Start quiz <span aria-hidden="true">→</span>
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <p>No quizzes are available in this topic yet. Please check back soon.</p>
      )}

      <Link className={styles.backLink} href="/topics">← Back to topics</Link>
    </StudentShell>
  );
}
