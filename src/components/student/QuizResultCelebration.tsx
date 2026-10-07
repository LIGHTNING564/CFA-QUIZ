'use client';

import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import Link from 'next/link';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  BookOpen,
  LayoutDashboard,
  Sparkles,
} from 'lucide-react';
import styles from './StudentHistory.module.css';

type Props = {
  score: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  total: number;
  quizId: string;
  attemptId: string;
  quizTitle: string;
};

export default function QuizResultCelebration({
  score,
  correct,
  incorrect,
  unanswered,
  total,
  quizId,
  attemptId,
  quizTitle,
}: Props) {
  useEffect(() => {
    // Launch confetti if user scored >= 70%
    if (score >= 70) {
      const end = Date.now() + 1.5 * 1000;
      const colors = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];

      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    }
  }, [score]);

  const isMastery = score >= 85;
  const isPassing = score >= 70;
  const tierTitle = isMastery
    ? 'Outstanding Mastery! 🏆'
    : isPassing
    ? 'Target Standard Met! 🎯'
    : 'Practice Makes Perfect! 💡';
  const tierDescription = isMastery
    ? 'Superb performance! You demonstrated exceptional comprehension of these CFA curriculum questions.'
    : isPassing
    ? 'Solid attempt! You exceeded the CFA 70% passing threshold for this topic.'
    : 'Good effort! Review the question explanations to convert your missed questions into strengths.';

  const scoreColor = isPassing ? '#10b981' : score >= 60 ? '#f59e0b' : '#f43f5e';

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto' }}>
      {/* Hero Result Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #065f46 100%)',
          borderRadius: '24px',
          padding: '40px 36px',
          color: '#ffffff',
          textAlign: 'center',
          boxShadow: '0 20px 50px -10px rgba(79, 70, 229, 0.3)',
          marginBottom: '32px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 14px',
            borderRadius: '999px',
            background: 'rgba(255, 255, 255, 0.15)',
            fontSize: '12px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '16px',
          }}
        >
          <Sparkles size={14} />
          <span>Attempt Submitted</span>
        </div>

        <h1 style={{ fontSize: '32px', fontWeight: 800, margin: '0 0 10px', color: '#ffffff' }}>
          {tierTitle}
        </h1>
        <p style={{ color: '#c7d2fe', fontSize: '15px', maxWidth: '560px', margin: '0 auto 28px', lineHeight: 1.6 }}>
          {tierDescription}
        </p>

        {/* Score Circle Card */}
        <div
          style={{
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '130px',
            height: '130px',
            borderRadius: '50%',
            background: '#ffffff',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
            margin: '0 auto',
          }}
        >
          <span style={{ fontSize: '36px', fontWeight: 800, color: scoreColor, fontFamily: 'var(--font-mono)' }}>
            {score}%
          </span>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
            Final Score
          </span>
        </div>
      </div>

      {/* Breakdown KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '20px',
            textAlign: 'center',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'inline-flex', color: '#10b981', marginBottom: '6px' }}>
            <CheckCircle2 size={24} />
          </div>
          <strong style={{ display: 'block', fontSize: '28px', fontFamily: 'var(--font-mono)', color: '#0f172a' }}>
            {correct}
          </strong>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
            Correct Answers
          </span>
        </div>

        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '20px',
            textAlign: 'center',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'inline-flex', color: '#f43f5e', marginBottom: '6px' }}>
            <XCircle size={24} />
          </div>
          <strong style={{ display: 'block', fontSize: '28px', fontFamily: 'var(--font-mono)', color: '#0f172a' }}>
            {incorrect}
          </strong>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
            Incorrect Answers
          </span>
        </div>

        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '20px',
            textAlign: 'center',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'inline-flex', color: '#4f46e5', marginBottom: '6px' }}>
            <Trophy size={24} />
          </div>
          <strong style={{ display: 'block', fontSize: '28px', fontFamily: 'var(--font-mono)', color: '#0f172a' }}>
            {total}
          </strong>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
            Total Questions
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'center' }}>
        <Link
          href={`/history/${attemptId}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '13px 24px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
            color: '#ffffff',
            fontWeight: 750,
            fontSize: '14.5px',
            boxShadow: '0 4px 16px rgba(79, 70, 229, 0.35)',
          }}
        >
          <span>Review Questions & Solutions</span>
          <ArrowRight size={16} />
        </Link>

        <Link
          href={`/quiz/${quizId}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '13px 20px',
            borderRadius: '12px',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            color: '#1e293b',
            fontWeight: 700,
            fontSize: '14.5px',
          }}
        >
          <RotateCcw size={15} />
          <span>Retake Quiz</span>
        </Link>

        <Link
          href="/dashboard"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '13px 20px',
            borderRadius: '12px',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            color: '#1e293b',
            fontWeight: 700,
            fontSize: '14.5px',
          }}
        >
          <LayoutDashboard size={15} />
          <span>Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
