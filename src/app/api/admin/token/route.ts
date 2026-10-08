import { NextResponse } from 'next/server';
import { getAdminAccess } from '@/lib/admin-access';

/**
 * Returns the ADMIN_SECRET to authenticated admin users only.
 * The QuizEditor uses this token as an `x-admin-secret` header
 * when calling write API routes, bypassing Supabase SSR cookie
 * issues that can occur in Next.js Route Handlers.
 */
export async function GET() {
  const access = await getAdminAccess();
  if (!access.isAuthenticated || !access.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Admin secret not configured.' }, { status: 500 });
  }
  return NextResponse.json({ token: secret });
}
