import { listTopics } from '@/lib/store';
import QuizEditor from '@/components/admin/QuizEditor';

export default async function NewQuizPage({ searchParams }: { searchParams: Promise<{ topicId?: string }> }) {
  const [topics, query] = await Promise.all([listTopics(), searchParams]);
  return <QuizEditor topics={topics} presetTopicId={query.topicId} />;
}
