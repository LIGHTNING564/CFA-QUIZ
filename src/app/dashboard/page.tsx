import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { StudentShell } from '@/components/student/StudentShell';
import DashboardAnalytics, { AttemptChartData, TopicChartData } from '@/components/student/DashboardAnalytics';
import {
  BookOpen,
  History,
  TrendingUp,
  CheckCircle,
  Trophy,
  Target,
  ArrowRight,
  Flame,
  Clock,
  Sparkles,
  BarChart2,
  ChevronRight,
} from 'lucide-react';
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

const formatDate = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value))
    : 'Date unavailable';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: attemptData, error: attemptsError } = await supabase
    .from('quiz_attempts')
    .select('id, quiz_id, completed_at, total_questions, correct_answers, incorrect_answers, unanswered, score_percentage')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false });

  if (attemptsError) {
    return (
      <StudentShell
        eyebrow="Study Analytics"
        title="Welcome back"
        description="Your real-time CFA practice metrics and question mastery."
      >
        <div className={styles.errorCard}>
          We couldn’t load your study dashboard right now. Please refresh the page and try again.
        </div>
      </StudentShell>
    );
  }

  const attempts = (attemptData ?? []) as CompletedAttempt[];
  const quizIds = [...new Set(attempts.map((attempt) => attempt.quiz_id))];
  let quizzes: QuizLookup[] = [];
  let topics: TopicLookup[] = [];
  let lookupError = false;

  // Also fetch all available topics to show in the Topic Discovery section
  const { data: allTopicsData } = await supabase.from('topics').select('id, name').order('name');
  const allTopics = (allTopicsData ?? []) as TopicLookup[];

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

  const answered = attempts.reduce(
    (total, attempt) => total + attempt.correct_answers + attempt.incorrect_answers,
    0
  );
  const correct = attempts.reduce((total, attempt) => total + attempt.correct_answers, 0);
  const incorrect = attempts.reduce((total, attempt) => total + attempt.incorrect_answers, 0);
  const unanswered = attempts.reduce((total, attempt) => total + attempt.unanswered, 0);
  const averageScore = attempts.length
    ? attempts.reduce((total, attempt) => total + attempt.score_percentage, 0) / attempts.length
    : 0;
  const bestScore = attempts.length ? Math.max(...attempts.map((attempt) => attempt.score_percentage)) : 0;
  const correctRate = answered ? (correct / answered) * 100 : 0;

  const quizById = new Map(quizzes.map((quiz) => [String(quiz.id), quiz]));
  const topicById = new Map(topics.map((topic) => [String(topic.id), topic.name]));
  const topicTotals = new Map<string, { name: string; total: number; count: number }>();

  attempts.forEach((attempt) => {
    const quiz = quizById.get(String(attempt.quiz_id));
    if (!quiz) return;
    const topicId = String(quiz.topic_id);
    const current = topicTotals.get(topicId) ?? {
      name: topicById.get(topicId) ?? 'Topic unavailable',
      total: 0,
      count: 0,
    };
    current.total += attempt.score_percentage;
    current.count += 1;
    topicTotals.set(topicId, current);
  });

  const topicPerformance: TopicChartData[] = [...topicTotals.values()]
    .map((topic) => ({
      name: topic.name,
      score: topic.total / topic.count,
      attempts: topic.count,
    }))
    .sort((a, b) => b.score - a.score || b.attempts - a.attempts);

  const chartAttempts: AttemptChartData[] = attempts.map((a) => ({
    id: a.id,
    name: quizById.get(String(a.quiz_id))?.title ?? 'Practice Quiz',
    score: a.score_percentage,
    date: formatDate(a.completed_at),
    correct: a.correct_answers,
    incorrect: a.incorrect_answers,
    unanswered: a.unanswered,
    total: a.total_questions,
  }));

  const userDisplayName = user.email ? user.email.split('@')[0] : 'Candidate';

  return (
    <StudentShell
      eyebrow="CFA Candidate Space"
      title={`Welcome back, ${userDisplayName}`}
      description="Track your performance velocity, topic strengths, and exam readiness."
    >
      {/* Top Hero Banner */}
      <section className={styles.heroBanner}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <Sparkles size={13} />
            <span>CFA Level I Prep Hub</span>
          </div>
          <h2 className={styles.heroTitle}>Master every concept with high-yield practice</h2>
          <p className={styles.heroDescription}>
            Solve realistic questions, review in-depth explanations, and pinpoint focus areas to hit your 70%+ passing target.
          </p>
          <div className={styles.heroActions}>
            <Link href="/topics" className={styles.heroPrimaryBtn}>
              <BookOpen size={16} />
              <span>Start New Quiz</span>
              <ArrowRight size={14} />
            </Link>
            <Link href="/history" className={styles.heroSecondaryBtn}>
              <History size={16} />
              <span>Review Past Attempts</span>
            </Link>
          </div>
        </div>

        <div className={styles.heroStreakCard}>
          <div className={styles.heroStreakIcon}>
            <Flame size={26} color="#fbbf24" />
          </div>
          <strong className={styles.heroStreakValue}>{attempts.length}</strong>
          <span className={styles.heroStreakLabel}>Quizzes Completed</span>
        </div>
      </section>

      {/* KPI Stats Cards */}
      <section className={styles.statsGrid} aria-label="Performance summary">
        <div className={styles.statCard}>
          <div className={styles.statCardHeader}>
            <div className={styles.statIconWrap} style={{ background: '#eef2ff', color: '#4f46e5' }}>
              <Target size={22} />
            </div>
            <span className={styles.statPill} style={{ background: '#eef2ff', color: '#4f46e5' }}>
              Total
            </span>
          </div>
          <span className={styles.statLabel}>Quizzes Completed</span>
          <strong className={styles.statValue}>{attempts.length}</strong>
          <span className={styles.statHint}>Across all topics</span>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statCardHeader}>
            <div className={styles.statIconWrap} style={{ background: '#ecfdf5', color: '#10b981' }}>
              <CheckCircle size={22} />
            </div>
            <span className={styles.statPill} style={{ background: '#ecfdf5', color: '#059669' }}>
              {percentage(correctRate)} Acc.
            </span>
          </div>
          <span className={styles.statLabel}>Questions Solved</span>
          <strong className={styles.statValue}>{answered}</strong>
          <span className={styles.statHint}>{correct} correct answers</span>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statCardHeader}>
            <div className={styles.statIconWrap} style={{ background: '#ecfeff', color: '#06b6d4' }}>
              <TrendingUp size={22} />
            </div>
            <span
              className={styles.statPill}
              style={{
                background: averageScore >= 70 ? '#ecfdf5' : '#fffbeb',
                color: averageScore >= 70 ? '#059669' : '#b45309',
              }}
            >
              {averageScore >= 70 ? 'Target Met' : 'In Progress'}
            </span>
          </div>
          <span className={styles.statLabel}>Average Score</span>
          <strong className={styles.statValue}>{percentage(averageScore)}</strong>
          <span className={styles.statHint}>Target: 70%+</span>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statCardHeader}>
            <div className={styles.statIconWrap} style={{ background: '#fffbeb', color: '#f59e0b' }}>
              <Trophy size={22} />
            </div>
            <span className={styles.statPill} style={{ background: '#fffbeb', color: '#b45309' }}>
              Personal Best
            </span>
          </div>
          <span className={styles.statLabel}>Highest Score</span>
          <strong className={styles.statValue}>{percentage(bestScore)}</strong>
          <span className={styles.statHint}>Peak quiz accuracy</span>
        </div>
      </section>

      {/* Analytics Hub (Interactive Charts & Graphs) */}
      {attempts.length > 0 ? (
        <DashboardAnalytics
          attempts={chartAttempts}
          topics={topicPerformance}
          totalAnswered={answered}
          totalCorrect={correct}
          totalIncorrect={incorrect}
          totalUnanswered={unanswered}
          averageScore={averageScore}
        />
      ) : (
        <section className={styles.emptyCard}>
          <div className={styles.emptyIconWrap}>
            <BarChart2 size={28} />
          </div>
          <h3>Your analytics will light up here</h3>
          <p>
            Complete your first quiz to unlock interactive score trend graphs, topic-by-topic radar charts, and exam readiness breakdowns.
          </p>
          <Link className={styles.emptyAction} href="/topics">
            <BookOpen size={16} />
            <span>Browse Topics & Start Practicing</span>
          </Link>
        </section>
      )}

      {/* Quick Action Navigation Grid */}
      <section className={styles.section} aria-label="Study quick actions">
        <div className={styles.actionGrid}>
          <Link className={styles.actionCard} href="/topics">
            <div className={styles.actionIcon} style={{ background: '#eef2ff', color: '#4f46e5' }}>
              <BookOpen size={24} />
            </div>
            <div>
              <h3>Explore Practice Topics</h3>
              <p>Select specific curriculum subjects from Ethics to Derivatives.</p>
            </div>
            <ChevronRight size={20} className={styles.actionArrow} />
          </Link>

          <Link className={styles.actionCard} href="/history">
            <div className={styles.actionIcon} style={{ background: '#f5f3ff', color: '#8b5cf6' }}>
              <History size={24} />
            </div>
            <div>
              <h3>Review Attempt History</h3>
              <p>Re-examine incorrect answers, solution steps, and syllabus references.</p>
            </div>
            <ChevronRight size={20} className={styles.actionArrow} />
          </Link>
        </div>
      </section>

      {/* Recent Activity & Topic Performance Dual Section */}
      {attempts.length > 0 && (
        <>
          <section className={styles.section} aria-labelledby="recent-activity-title">
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle} id="recent-activity-title">
                  Recent Practice Activity
                </h2>
                <p className={styles.sectionSub}>Your 5 most recent quiz submissions.</p>
              </div>
              <Link className={styles.sectionLink} href="/history">
                <span>View all attempts</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className={styles.activityCard}>
              <ul className={styles.activityList}>
                {attempts.slice(0, 5).map((attempt) => {
                  const score = Math.round(attempt.score_percentage);
                  const isGood = score >= 75;
                  const isMid = score >= 60 && score < 75;
                  const bg = isGood ? '#ecfdf5' : isMid ? '#fffbeb' : '#fff1f2';
                  const color = isGood ? '#059669' : isMid ? '#b45309' : '#e11d48';

                  return (
                    <li className={styles.activityItem} key={attempt.id}>
                      <div>
                        <div className={styles.attemptName}>
                          {quizById.get(String(attempt.quiz_id))?.title ?? 'Practice Quiz'}
                        </div>
                        <div className={styles.attemptDate}>
                          <Clock size={12} />
                          <span>Completed on {formatDate(attempt.completed_at)}</span>
                          <span>•</span>
                          <span>{attempt.total_questions} questions</span>
                        </div>
                      </div>

                      <span className={styles.scoreBadge} style={{ background: bg, color }}>
                        {percentage(attempt.score_percentage)}
                      </span>

                      <Link className={styles.reviewLink} href={`/history/${attempt.id}`}>
                        <span>Review</span>
                        <ChevronRight size={14} />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>

          {/* Topic Performance Bars */}
          <section className={styles.section} aria-labelledby="topic-mastery-title">
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle} id="topic-mastery-title">
                  Topic Mastery Levels
                </h2>
                <p className={styles.sectionSub}>Average performance across topics you have practiced.</p>
              </div>
              <Link className={styles.sectionLink} href="/topics">
                <span>All Topics</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {lookupError || topicPerformance.length === 0 ? (
              <div className={styles.emptyCard}>
                <h3>Topic performance unavailable</h3>
                <p>Refresh the page to reload the topic breakdown.</p>
              </div>
            ) : (
              <div className={styles.performanceCard}>
                {topicPerformance.map((topic) => {
                  const score = Math.round(topic.score);
                  const barColor = score >= 75 ? '#10b981' : score >= 60 ? '#f59e0b' : '#f43f5e';
                  return (
                    <div className={styles.performanceRow} key={topic.name}>
                      <span className={styles.topicName}>{topic.name}</span>
                      <div className={styles.barTrack} aria-hidden="true">
                        <div
                          className={styles.barValue}
                          style={{
                            width: `${Math.max(0, Math.min(100, topic.score))}%`,
                            background: barColor,
                          }}
                        />
                      </div>
                      <span className={styles.topicScore} style={{ color: barColor }}>
                        {percentage(topic.score)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </StudentShell>
  );
}
