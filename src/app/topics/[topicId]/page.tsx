import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { StudentShell } from '@/components/student/StudentShell';
import { 
  ArrowLeft, 
  ArrowRight, 
  BookOpen, 
  HelpCircle, 
  Sparkles 
} from 'lucide-react';
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
    <StudentShell
      eyebrow="Practice Library"
      title={topic.name}
      description="Select a quiz when you are ready to test your knowledge. Realistic timing and full solutions included."
    >
      {quizzes && quizzes.length > 0 ? (
        <div className={styles.quizGrid}>
          {quizzes.map((quiz) => (
            <article className={styles.quizCard} key={quiz.id}>
              <div className={styles.quizHeader}>
                <span className={styles.quizBadge}>
                  <Sparkles size={13} />
                  <span>Practice Quiz</span>
                </span>
                <span className={styles.quizMeta}>
                  <HelpCircle size={14} />
                  <span>{quiz.question_count} Questions</span>
                </span>
              </div>

              <h2>{quiz.title}</h2>
              <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 16px', lineHeight: 1.5 }}>
                Master key concepts from this topic with exam-style questions.
              </p>

              <Link className={styles.startButton} href={`/quiz/${quiz.id}`}>
                <span>Start Quiz</span>
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className={styles.quizCard}>
          <h2>No quizzes available in this topic yet</h2>
          <p>Check back soon or explore other curriculum topics.</p>
        </div>
      )}

      <div>
        <Link className={styles.backLink} href="/topics">
          <ArrowLeft size={16} />
          <span>Back to All Topics</span>
        </Link>
      </div>
    </StudentShell>
  );
}
