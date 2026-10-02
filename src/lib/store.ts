import fs from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import type { Quiz, Topic } from './types';

const localDbPath = path.join(process.cwd(), 'data', 'local-db.json');

function hasSupabaseConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function getSupabase() {
  if (!hasSupabaseConfig()) return null;
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

async function readLocal() {
  const raw = await fs.readFile(localDbPath, 'utf8');
  return JSON.parse(raw) as { topics: Topic[]; quizzes: Quiz[] };
}

async function writeLocal(data: { topics: Topic[]; quizzes: Quiz[] }) {
  await fs.writeFile(localDbPath, JSON.stringify(data, null, 2), 'utf8');
}

export async function listTopics(): Promise<Topic[]> {
  const supabase = getSupabase();
  if (!supabase) {
    const db = await readLocal();
    return [...db.topics].sort((a, b) => a.name.localeCompare(b.name));
  }

  const { data, error } = await supabase.from('topics').select('*').order('name');
  if (error) throw new Error(error.message);
  return (data ?? []) as Topic[];
}

export async function getTopic(id: string): Promise<Topic | null> {
  const supabase = getSupabase();
  if (!supabase) {
    const db = await readLocal();
    return db.topics.find((topic) => String(topic.id) === id) ?? null;
  }

  const { data, error } = await supabase.from('topics').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Topic | null) ?? null;
}

export async function createTopic(name: string): Promise<Topic> {
  const now = new Date().toISOString();
  const trimmed = name.trim();
  if (!trimmed) throw new Error('Topic name is required.');

  const supabase = getSupabase();
  if (!supabase) {
    const db = await readLocal();
    if (db.topics.some((topic) => topic.name.toLowerCase() === trimmed.toLowerCase())) {
      throw new Error('A topic with this name already exists.');
    }
    const topic: Topic = {
      id: `topic-${crypto.randomUUID()}`,
      name: trimmed,
      created_at: now,
      updated_at: now,
    };
    db.topics.push(topic);
    await writeLocal(db);
    return topic;
  }

  const { data, error } = await supabase
    .from('topics')
    .insert({ name: trimmed })
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as Topic;
}

export async function listQuizzes(topicId?: string): Promise<Quiz[]> {
  const supabase = getSupabase();
  if (!supabase) {
    const db = await readLocal();
    return db.quizzes
      .filter((quiz) => (topicId ? String(quiz.topic_id) === topicId : true))
      .sort((a, b) => a.title.localeCompare(b.title));
  }

  let query = supabase.from('quizzes').select('*').order('created_at', { ascending: false });
  if (topicId) query = query.eq('topic_id', topicId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as Quiz[];
}

export async function getQuiz(id: string): Promise<Quiz | null> {
  const supabase = getSupabase();
  if (!supabase) {
    const db = await readLocal();
    return db.quizzes.find((quiz) => String(quiz.id) === id) ?? null;
  }

  const { data, error } = await supabase.from('quizzes').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Quiz | null) ?? null;
}

export async function createQuiz(input: {
  topic_id: string;
  title: string;
  content: Quiz['content'];
}): Promise<Quiz> {
  const title = input.title.trim();
  if (!title) throw new Error('Quiz title is required.');
  const now = new Date().toISOString();

  const supabase = getSupabase();
  if (!supabase) {
    const db = await readLocal();
    if (!db.topics.some((topic) => String(topic.id) === input.topic_id)) {
      throw new Error('Selected topic does not exist.');
    }
    const quiz: Quiz = {
      id: `quiz-${crypto.randomUUID()}`,
      topic_id: input.topic_id,
      title,
      content: input.content,
      question_count: input.content.length,
      created_at: now,
      updated_at: now,
    };
    db.quizzes.push(quiz);
    await writeLocal(db);
    return quiz;
  }

  const { data, error } = await supabase
    .from('quizzes')
    .insert({
      topic_id: input.topic_id,
      title,
      content: input.content,
      question_count: input.content.length,
    })
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as Quiz;
}

export async function updateQuiz(id: string, input: {
  topic_id: string;
  title: string;
  content: Quiz['content'];
}): Promise<Quiz> {
  const title = input.title.trim();
  if (!title) throw new Error('Quiz title is required.');
  const now = new Date().toISOString();

  const supabase = getSupabase();
  if (!supabase) {
    const db = await readLocal();
    const index = db.quizzes.findIndex((quiz) => String(quiz.id) === id);
    if (index === -1) throw new Error('Quiz not found.');
    const current = db.quizzes[index];
    const updated: Quiz = {
      ...current,
      topic_id: input.topic_id,
      title,
      content: input.content,
      question_count: input.content.length,
      updated_at: now,
    };
    db.quizzes[index] = updated;
    await writeLocal(db);
    return updated;
  }

  const { data, error } = await supabase
    .from('quizzes')
    .update({
      topic_id: input.topic_id,
      title,
      content: input.content,
      question_count: input.content.length,
      updated_at: now,
    })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as Quiz;
}

export async function deleteQuiz(id: string) {
  const supabase = getSupabase();
  if (!supabase) {
    const db = await readLocal();
    db.quizzes = db.quizzes.filter((quiz) => String(quiz.id) !== id);
    await writeLocal(db);
    return;
  }

  const { error } = await supabase.from('quizzes').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export function isUsingLocalStore() {
  return !hasSupabaseConfig();
}
