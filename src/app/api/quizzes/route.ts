import { NextResponse } from 'next/server';
import { parseAndValidateJson } from '@/lib/quiz-schema';
import { createQuiz, listQuizzes } from '@/lib/store';
import { getAdminAccess } from '@/lib/admin-access';

async function requireAdmin() {
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
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const topicId = new URL(request.url).searchParams.get('topicId') ?? undefined;
    return NextResponse.json({ quizzes: await listQuizzes(topicId) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to load quizzes.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = (await request.json()) as { topic_id?: string; title?: string; content?: unknown };
    const validation = parseAndValidateJson(JSON.stringify(body.content));
    if (!validation.success || !validation.data) {
      return NextResponse.json({ error: 'Invalid quiz content.', issues: validation.issues }, { status: 400 });
    }
    const quiz = await createQuiz({
      topic_id: body.topic_id ?? '',
      title: body.title ?? '',
      content: validation.data,
    });
    return NextResponse.json({ quiz }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to create quiz.' }, { status: 400 });
  }
}
