'use client';

import { FormEvent, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { StudentAuthShell } from '@/components/student/StudentShell';
import { Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
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
      <div className={styles.brand}>
        <span className={styles.mark} aria-hidden="true">
          C
        </span>
        <div>
          <div style={{ fontWeight: 800, fontSize: '15px' }}>CFA Master</div>
          <div style={{ fontSize: '10px', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Question Bank
          </div>
        </div>
      </div>

      <h1 className={styles.heading}>Welcome Back</h1>
      <p className={styles.intro}>Log in to continue your personalized CFA practice and track your analytics.</p>

      <form className={styles.form} onSubmit={handleLogin}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="email">
            Email Address
          </label>
          <div className={styles.inputWrapper}>
            <Mail size={18} className={styles.inputIcon} />
            <input
              className={styles.input}
              id="email"
              type="email"
              autoComplete="email"
              placeholder="candidate@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="password">
            Password
          </label>
          <div className={styles.inputWrapper}>
            <Lock size={18} className={styles.inputIcon} />
            <input
              className={styles.input}
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
        </div>

        <button className={styles.submit} type="submit" disabled={loading}>
          <span>{loading ? 'Signing in…' : 'Sign in to Dashboard'}</span>
          <ArrowRight size={16} />
        </button>
      </form>

      {message && (
        <p className={styles.message} role="alert">
          {message}
        </p>
      )}

      <p className={styles.footer}>
        New to CFA Master?{' '}
        <Link className={styles.footerLink} href="/signup">
          Create an account
        </Link>
      </p>
    </StudentAuthShell>
  );
}
