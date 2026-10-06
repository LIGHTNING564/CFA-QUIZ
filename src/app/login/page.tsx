'use client';

import { FormEvent, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { StudentAuthShell } from '@/components/student/StudentShell';
import styles from '@/components/student/StudentAuth.module.css';

export default function LoginPage() {
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    window.location.href = '/dashboard';
  }

  return (
    <StudentAuthShell>
      <div className={styles.brand}><span className={styles.mark} aria-hidden="true">C</span> CFA PRACTICE</div>
      <h1 className={styles.heading}>Welcome back</h1>
      <p className={styles.intro}>Continue your focused CFA practice.</p>

      <form className={styles.form} onSubmit={handleLogin}>
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
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <button className={styles.submit} type="submit" disabled={loading}>
          {loading ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      {message && <p className={styles.message} role="alert">{message}</p>}
      <p className={styles.footer}>New to CFA Practice? <Link className={styles.footerLink} href="/signup">Create an account</Link>.</p>
    </StudentAuthShell>
  );
}
