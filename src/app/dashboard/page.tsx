import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <main>
      <h1>CFA Practice</h1>

      <p>Welcome back</p>

      <p>{user.email}</p>

      <div>
        <a href="/topics">Topics</a>
      </div>

      <div>
        <a href="/history">History</a>
      </div>
    </main>
  );
}