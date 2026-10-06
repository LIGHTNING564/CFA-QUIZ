'use client';

import { FormEvent, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { StudentAuthShell } from '@/components/student/StudentShell';
import styles from '@/components/student/StudentAuth.module.css';

export default function SignupPage() {
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage('Account created. Check your email to confirm your account.');
    setLoading(false);
  }

  return (
    <StudentAuthShell>
      <div className={styles.brand}><span className={styles.mark} aria-hidden="true">C</span> CFA PRACTICE</div>
      <h1 className={styles.heading}>Create your account</h1>
      <p className={styles.intro}>Start building a clear record of your practice.</p>

      <form className={styles.form} onSubmit={handleSignup}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="email">Email address</label>
          <input
            className={styles.input}
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="password">Password</label>
          <input
            className={styles.input}
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={6}
          />
          <p className={styles.fieldHint}>Use at least 6 characters.</p>
        </div>

        <button className={styles.submit} type="submit" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      {message && <p className={`${styles.message} ${message.startsWith('Account created') ? styles.messageSuccess : ''}`} role="status">{message}</p>}
      <p className={styles.footer}>Already have an account? <Link className={styles.footerLink} href="/login">Log in</Link>.</p>
    </StudentAuthShell>
  );
}
