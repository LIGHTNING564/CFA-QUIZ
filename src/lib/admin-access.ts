import { createClient } from '@/lib/supabase/server';

function allowedAdminEmails() {
  return new Set(
    (process.env.ADMIN_EMAILS ?? '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isAdminEmail(email: string | null | undefined) {
  return Boolean(email && allowedAdminEmails().has(email.trim().toLowerCase()));
}

export async function getAdminAccess() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return {
    isAuthenticated: Boolean(user),
    isAdmin: isAdminEmail(user?.email),
  };
}
