import { NextResponse } from 'next/server';
import { createTopic, listTopics } from '@/lib/store';
import { getAdminAccess, isAdminSecret } from '@/lib/admin-access';

async function requireAdmin(request: Request) {
  if (isAdminSecret(request)) return null;

  const access = await getAdminAccess();
  if (!access.isAuthenticated) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }
  if (!access.isAdmin) {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  }
  return null;
}

export async function GET(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  try {
    return NextResponse.json({ topics: await listTopics() });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to load topics.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  try {
    const body = (await request.json()) as { name?: string };
    const topic = await createTopic(body.name ?? '');
    return NextResponse.json({ topic }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to create topic.' }, { status: 400 });
  }
}
