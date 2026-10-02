import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { StudentShell } from '@/components/student/StudentShell';
import styles from '@/components/student/StudentDashboard.module.css';

type CompletedAttempt = {
  id: string;
  quiz_id: string | number;
  completed_at: string | null;
  total_questions: number;
  correct_answers: number;
  incorrect_answers: number;
  unanswered: number;
  score_percentage: number;
};

type QuizLookup = { id: string | number; title: string; topic_id: string | number };
type TopicLookup = { id: string | number; name: string };

const percentage = (value: number) => `${Math.round(value)}%`;
const formatDate = (value: string | null) => value
  ? new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value))
  : 'Date unavailable';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: attemptData, error: attemptsError } = await supabase
    .from('quiz_attempts')
    .select('id, quiz_id, completed_at, total_questions, correct_answers, incorrect_answers, unanswered, score_percentage')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false });

  if (attemptsError) {
    return <StudentShell eyebrow="Your study space" title="Welcome back" description="Your progress and practice activity in one place.">
      <div className={styles.errorCard}>We couldn’t load your study dashboard right now. Please refresh the page and try again.</div>
    </StudentShell>;
  }

  const attempts = (attemptData ?? []) as CompletedAttempt[];
  const quizIds = [...new Set(attempts.map((attempt) => attempt.quiz_id))];
  let quizzes: QuizLookup[] = [];
  let topics: TopicLookup[] = [];
  let lookupError = false;

  if (quizIds.length) {
    const { data, error } = await supabase.from('quizzes').select('id, title, topic_id').in('id', quizIds);
    if (error) lookupError = true;
    else quizzes = (data ?? []) as QuizLookup[];

    const topicIds = [...new Set(quizzes.map((quiz) => quiz.topic_id))];
    if (topicIds.length) {
      const { data, error } = await supabase.from('topics').select('id, name').in('id', topicIds);
      if (error) lookupError = true;
      else topics = (data ?? []) as TopicLookup[];
    }
  }

  const answered = attempts.reduce((total, attempt) => total + attempt.correct_answers + attempt.incorrect_answers, 0);
  const correct = attempts.reduce((total, attempt) => total + attempt.correct_answers, 0);
  const averageScore = attempts.length ? attempts.reduce((total, attempt) => total + attempt.score_percentage, 0) / attempts.length : 0;
  const bestScore = attempts.length ? Math.max(...attempts.map((attempt) => attempt.score_percentage)) : 0;
  const correctRate = answered ? (correct / answered) * 100 : 0;
  const quizById = new Map(quizzes.map((quiz) => [String(quiz.id), quiz]));
  const topicById = new Map(topics.map((topic) => [String(topic.id), topic.name]));
  const topicTotals = new Map<string, { name: string; total: number; count: number }>();

  attempts.forEach((attempt) => {
    const quiz = quizById.get(String(attempt.quiz_id));
    if (!quiz) return;
    const topicId = String(quiz.topic_id);
    const current = topicTotals.get(topicId) ?? { name: topicById.get(topicId) ?? 'Topic unavailable', total: 0, count: 0 };
    current.total += attempt.score_percentage;
    current.count += 1;
    topicTotals.set(topicId, current);
  });

  const topicPerformance = [...topicTotals.values()]
    .map((topic) => ({ name: topic.name, score: topic.total / topic.count, attempts: topic.count }))
    .sort((a, b) => b.score - a.score || b.attempts - a.attempts);

  return (
    <StudentShell eyebrow="Your study space" title="Welcome back" description="Your progress and practice activity in one place.">
      <section className={styles.actionGrid} aria-label="Study actions">
        <Link className={styles.actionCard} href="/topics">
          <span className={styles.actionIcon} aria-hidden="true">↗</span>
          <h3>Browse topics</h3>
          <p>Choose a study area and start a practice quiz.</p>
        </Link>
        <Link className={styles.actionCard} href="/history">
          <span className={styles.actionIcon} aria-hidden="true">◷</span>
          <h3>Review history</h3>
          <p>Revisit completed attempts, explanations, and references.</p>
        </Link>
      </section>

      {attempts.length === 0 ? <section className={styles.section} aria-labelledby="progress-heading">
        <div className={styles.emptyCard}>
          <h3 id="progress-heading">No completed attempts yet</h3>
          <p>Complete a quiz to see your scores, question totals, and topic performance here.</p>
          <Link className={styles.emptyAction} href="/topics">Browse topics</Link>
        </div>
      </section> : <>
        <section className={styles.section} aria-label="Performance summary">
          <div className={styles.statsGrid}>
            <div className={styles.statCard}><span className={styles.statLabel}>Quizzes taken</span><strong className={styles.statValue}>{attempts.length}</strong><span className={styles.statHint}>Completed attempts</span></div>
            <div className={styles.statCard}><span className={styles.statLabel}>Questions answered</span><strong className={styles.statValue}>{answered}</strong><span className={styles.statHint}>Across completed quizzes</span></div>
            <div className={styles.statCard}><span className={styles.statLabel}>Average score</span><strong className={styles.statValue}>{percentage(averageScore)}</strong><span className={styles.statHint}>Across all attempts</span></div>
            <div className={styles.statCard}><span className={styles.statLabel}>Best score</span><strong className={styles.statValue}>{percentage(bestScore)}</strong><span className={styles.statHint}>{percentage(correctRate)} correct-answer rate</span></div>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="recent-activity">
          <div className={styles.sectionHeader}><div><h2 id="recent-activity">Recent activity</h2><p>Your five most recently completed quizzes.</p></div><Link className={styles.sectionLink} href="/history">View all history</Link></div>
          <div className={styles.activityCard}><ul className={styles.activityList}>
            {attempts.slice(0, 5).map((attempt) => <li className={styles.activityItem} key={attempt.id}>
              <div><div className={styles.attemptName}>{quizById.get(String(attempt.quiz_id))?.title ?? 'Quiz unavailable'}</div><div className={styles.attemptDate}>{formatDate(attempt.completed_at)}</div></div>
              <strong className={styles.score}>{percentage(attempt.score_percentage)}</strong>
              <Link className={styles.reviewLink} href={`/history/${attempt.id}`}>Review attempt</Link>
            </li>)}
          </ul></div>
        </section>

        <section className={styles.section} aria-labelledby="topic-performance">
          <div className={styles.sectionHeader}><div><h2 id="topic-performance">Topic performance</h2><p>Average score across completed attempts in each topic.</p></div><Link className={styles.sectionLink} href="/topics">Browse topics</Link></div>
          {lookupError || topicPerformance.length === 0 ? <div className={styles.emptyCard}><h3>Topic performance is unavailable</h3><p>Refresh the page to try loading this breakdown again.</p></div> : <div className={styles.performanceCard}>
            {topicPerformance.map((topic) => <div className={styles.performanceRow} key={topic.name}><span className={styles.topicName}>{topic.name}</span><div className={styles.barTrack} aria-hidden="true"><div className={styles.barValue} style={{ width: `${Math.max(0, Math.min(100, topic.score))}%` }} /></div><span className={styles.topicScore}>{percentage(topic.score)}</span></div>)}
          </div>}
        </section>
      </>}
    </StudentShell>
  );
}
