import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

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
    <main>
      <h1>Topics</h1>

      {topics && topics.length > 0 ? (
        <div>
          {topics.map((topic) => (
            <div key={topic.id}>
              <a href={`/topics/${topic.id}`}>
                {topic.name}
              </a>
            </div>
          ))}
        </div>
      ) : (
        <p>No topics available yet.</p>
      )}

      <div>
        <a href="/dashboard">Back to dashboard</a>
      </div>
    </main>
  );
}