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

/**
 * Checks if the incoming request carries a valid admin secret header.
 * API routes pass `x-admin-secret: <value>` when calling from the browser
 * after the page-level layout has already verified the Supabase session.
 */
export function isAdminSecret(request: Request): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  return request.headers.get('x-admin-secret') === secret;
}

export async function getAdminAccess() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return {
      isAuthenticated: Boolean(user),
      isAdmin: isAdminEmail(user?.email),
    };
  } catch {
    // Supabase client may fail in certain Route Handler contexts;
    // fall back to unauthenticated so the secret-based check still works.
    return { isAuthenticated: false, isAdmin: false };
  }
}
