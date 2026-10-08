'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Quiz, Topic } from '@/lib/types';
import { parseAndValidateJson } from '@/lib/quiz-schema';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const sampleJson = JSON.stringify([
  {
    question_number: 1,
    total_questions: 1,
    question_id: 1572658,
    text: 'If a stock decreases from $90 to $80, the continuously compounded rate of return for the period is:',
    options: [
      { label: 'A', value: '-0.1250' },
      { label: 'B', value: '-0.1000' },
      { label: 'C', value: '-0.1178' },
    ],
    correct_answer: 'C',
    explanation: 'This is given by the natural logarithm of the new price divided by the old price; ln(80 / 90) = -0.1178.',
    reference: 'Module 1.3, LOS 1.d',
  },
], null, 2);

type Props = {
  topics: Topic[];
  initialQuiz?: Quiz | null;
  presetTopicId?: string;
};

export default function QuizEditor({ topics, initialQuiz, presetTopicId }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initialQuiz?.title ?? '');
  const [topicId, setTopicId] = useState(String(initialQuiz?.topic_id ?? presetTopicId ?? topics[0]?.id ?? ''));
  const [jsonText, setJsonText] = useState(initialQuiz ? JSON.stringify(initialQuiz.content, null, 2) : sampleJson);
  const [issues, setIssues] = useState<{ path: string; message: string }[]>([]);
  const [validated, setValidated] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(Boolean(initialQuiz));
  const adminTokenRef = useRef<string | null>(null);

  // Fetch admin token once on mount so save requests don't depend on Supabase
  // SSR cookie reading inside Route Handlers (which can silently fail).
  useEffect(() => {
    fetch('/api/admin/token')
      .then((res) => res.json())
      .then((data: { token?: string; error?: string }) => {
        if (data.token) adminTokenRef.current = data.token;
      })
      .catch(() => { /* non-fatal – falls back to cookie auth */ });
  }, []);

  const validation = useMemo(() => parseAndValidateJson(jsonText), [jsonText]);
  const questions = validation.success ? validation.data ?? [] : [];

  function validate() {
    setValidated(true);
    setIssues(validation.issues);
    setError('');
    setPreviewOpen(validation.success);
  }

  async function save() {
    setValidated(true);
    setIssues(validation.issues);
    if (!validation.success || !validation.data) return;
    if (!topicId) return setError('Choose a topic.');
    if (!title.trim()) return setError('Enter a quiz title.');

    setSaving(true);
    setError('');
    const url = initialQuiz ? `/api/quizzes/${initialQuiz.id}` : '/api/quizzes';
    const method = initialQuiz ? 'PUT' : 'POST';
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (adminTokenRef.current) headers['x-admin-secret'] = adminTokenRef.current;
    const response = await fetch(url, {
      method,
      headers,
      body: JSON.stringify({ topic_id: topicId, title, content: validation.data }),
    });
    const result = (await response.json()) as { error?: string; quiz?: Quiz; issues?: { path: string; message: string }[] };
    setSaving(false);
    if (!response.ok) {
      setError(result.error ?? 'Unable to save quiz.');
      setIssues(result.issues ?? []);
      return;
    }
    setSaved(true);
    const id = result.quiz?.id ?? initialQuiz?.id;
    if (id) router.push(`/admin/quizzes/${id}`);
  }

  return (
    <div className="editor-page">
      <div className="page-topbar">
        <div>
          <div className="breadcrumbs"><Link href="/admin">Topics</Link><span>/</span><span>{initialQuiz ? 'Edit quiz' : 'Create quiz'}</span></div>
          <div className="eyebrow">CONTENT AUTHORING</div>
          <h1>{initialQuiz ? 'Edit quiz' : 'Create quiz'}</h1>
        </div>
        <div className="top-actions">
          <button className="button secondary" onClick={validate}>Validate</button>
          <button className="button primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : initialQuiz ? 'Save changes' : 'Save quiz'}</button>
        </div>
      </div>

      {error && <div className="error-box page-error">{error}</div>}

      <div className="form-grid">
        <div>
          <label className="field-label" htmlFor="quiz-title">Quiz title</label>
          <input id="quiz-title" className="text-input" value={title} onChange={(e) => { setTitle(e.target.value); setSaved(false); }} placeholder="Bond Valuation Practice 01" />
        </div>
        <div>
          <label className="field-label" htmlFor="quiz-topic">Topic</label>
          <select id="quiz-topic" className="text-input" value={topicId} onChange={(e) => { setTopicId(e.target.value); setSaved(false); }}>
            <option value="">Select a topic</option>
            {topics.map((topic) => <option key={String(topic.id)} value={String(topic.id)}>{topic.name}</option>)}
          </select>
        </div>
      </div>

      <section className="workspace-card">
        <div className="workspace-header">
          <div>
            <div className="card-title">Questions JSON</div>
            <div className="muted">Paste the full question array. The content contract is validated before save.</div>
          </div>
          <button className="text-button" onClick={() => setJsonText(sampleJson)}>Load sample</button>
        </div>
        <div className="editor-shell">
          <MonacoEditor
            height="520px"
            language="json"
            theme="vs-dark"
            value={jsonText}
            onChange={(value) => { setJsonText(value ?? ''); setValidated(false); setSaved(false); }}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              tabSize: 2,
              automaticLayout: true,
              wordWrap: 'on',
              padding: { top: 16 },
              scrollBeyondLastLine: false,
            }}
          />
        </div>
      </section>

      {validated && (
        <section className={validation.success ? 'validation-card success' : 'validation-card error'}>
          {validation.success ? (
            <div>
              <strong>✓ Valid quiz</strong>
              <span>{questions.length} question{questions.length === 1 ? '' : 's'} detected. All structural checks passed.</span>
            </div>
          ) : (
            <div>
              <strong>✕ Fix the quiz before saving</strong>
              <div className="issue-list">
                {issues.slice(0, 20).map((issue, index) => <div key={`${issue.path}-${index}`}><b>{issue.path}</b> — {issue.message}</div>)}
              </div>
            </div>
          )}
        </section>
      )}

      {validation.success && (
        <section className="preview-section">
          <div className="section-heading">
            <div>
              <div className="card-title">Preview</div>
              <div className="muted">This is how the authored question data will render later.</div>
            </div>
            <button className="text-button" onClick={() => setPreviewOpen((value) => !value)}>{previewOpen ? 'Collapse' : 'Expand'}</button>
          </div>
          {previewOpen && (
            <div className="question-preview-list">
              {questions.map((question) => (
                <article key={question.question_id} className="question-preview">
                  <div className="question-meta">
                    <span className="question-number">Question #{question.question_number} of {question.total_questions}</span>
                    <span>Question ID: {question.question_id}</span>
                  </div>
                  <div className="question-text">{question.text}</div>
                  <div className="option-list">
                    {question.options.map((option) => (
                      <div className={`preview-option ${question.correct_answer === option.label ? 'correct' : ''}`} key={option.label}>
                        <span className="option-copy"><b>{option.label})</b> {option.value}</span>
                        {question.correct_answer === option.label && <span className="check">✓</span>}
                      </div>
                    ))}
                  </div>
                  <div className="explanation-block">
                    <div className="explanation-title">Explanation</div>
                    <p>{question.explanation}</p>
                    {question.reference && <div className="reference">({question.reference})</div>}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      <div className="sticky-savebar">
        <div>
          {saved ? <span className="saved-state">✓ Saved</span> : <span className="muted">Changes are not saved until you click Save.</span>}
        </div>
        <div className="top-actions">
          <Link href={initialQuiz ? `/admin/quizzes/${initialQuiz.id}` : '/admin'} className="button secondary">Cancel</Link>
          <button className="button primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : initialQuiz ? 'Save changes' : 'Save quiz'}</button>
        </div>
      </div>
    </div>
  );
}
