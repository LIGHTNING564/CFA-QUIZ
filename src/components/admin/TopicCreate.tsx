'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X } from 'lucide-react';

export default function TopicCreate() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const adminTokenRef = useRef<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/token')
      .then((res) => res.json())
      .then((data: { token?: string }) => { if (data.token) adminTokenRef.current = data.token; })
      .catch(() => {});
  }, []);

  async function submit() {
    setError('');
    if (!name.trim()) return setError('Enter a topic name.');
    setSaving(true);
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (adminTokenRef.current) headers['x-admin-secret'] = adminTokenRef.current;
    const response = await fetch('/api/topics', {
      method: 'POST',
      headers,
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
      <button className="button primary" onClick={() => setOpen(true)}>
        <Plus size={15} />
        <span>Add Topic</span>
      </button>
      {open && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal-card">
            <div className="modal-header">
              <div>
                <div className="eyebrow">NEW CONTENT CONTAINER</div>
                <h2>Create Topic</h2>
              </div>
              <button className="icon-button" onClick={() => setOpen(false)} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <label className="field-label" htmlFor="topic-name">
              Topic Name
            </label>
            <input
              id="topic-name"
              className="text-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Fixed Income or Derivatives"
              autoFocus
            />
            {error && <div className="error-box">{error}</div>}
            <div className="modal-actions">
              <button className="button secondary" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button className="button primary" onClick={submit} disabled={saving}>
                {saving ? 'Creating…' : 'Create Topic'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
