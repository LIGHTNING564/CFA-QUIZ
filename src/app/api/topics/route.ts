import { NextResponse } from 'next/server';
import { createTopic, listTopics } from '@/lib/store';

export async function GET() {
  try {
    return NextResponse.json({ topics: await listTopics() });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to load topics.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { name?: string };
    const topic = await createTopic(body.name ?? '');
    return NextResponse.json({ topic }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to create topic.' }, { status: 400 });
  }
}
