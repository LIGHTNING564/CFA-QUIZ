import { NextResponse } from 'next/server';
import { parseAndValidateJson } from '@/lib/quiz-schema';
import { deleteQuiz, getQuiz, updateQuiz } from '@/lib/store';

export async function GET(_request: Request, context: { params: Promise<{ quizId: string }> }) {
  try {
    const { quizId } = await context.params;
    const quiz = await getQuiz(quizId);
    if (!quiz) return NextResponse.json({ error: 'Quiz not found.' }, { status: 404 });
    return NextResponse.json({ quiz });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to load quiz.' }, { status: 500 });
  }
}

export async function PUT(request: Request, context: { params: Promise<{ quizId: string }> }) {
  try {
    const { quizId } = await context.params;
    const body = (await request.json()) as { topic_id?: string; title?: string; content?: unknown };
    const validation = parseAndValidateJson(JSON.stringify(body.content));
    if (!validation.success || !validation.data) {
      return NextResponse.json({ error: 'Invalid quiz content.', issues: validation.issues }, { status: 400 });
    }
    const quiz = await updateQuiz(quizId, {
      topic_id: body.topic_id ?? '',
      title: body.title ?? '',
      content: validation.data,
    });
    return NextResponse.json({ quiz });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to update quiz.' }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ quizId: string }> }) {
  try {
    const { quizId } = await context.params;
    await deleteQuiz(quizId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to delete quiz.' }, { status: 400 });
  }
}
