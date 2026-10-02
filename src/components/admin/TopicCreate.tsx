'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TopicCreate() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit() {
    setError('');
    if (!name.trim()) return setError('Enter a topic name.');
    setSaving(true);
    const response = await fetch('/api/topics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    const result = (await response.json()) as { error?: string };
    setSaving(false);
    if (!response.ok) return setError(result.error ?? 'Unable to create topic.');
    setName('');
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button className="button primary" onClick={() => setOpen(true)}>+ Add Topic</button>
      {open && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal-card">
            <div className="modal-header">
              <div>
                <div className="eyebrow">NEW CONTENT CONTAINER</div>
                <h2>Create topic</h2>
              </div>
              <button className="icon-button" onClick={() => setOpen(false)} aria-label="Close">×</button>
            </div>
            <label className="field-label" htmlFor="topic-name">Topic name</label>
            <input id="topic-name" className="text-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Fixed Income" autoFocus />
            {error && <div className="error-box">{error}</div>}
            <div className="modal-actions">
              <button className="button secondary" onClick={() => setOpen(false)}>Cancel</button>
              <button className="button primary" onClick={submit} disabled={saving}>{saving ? 'Creating…' : 'Create topic'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
