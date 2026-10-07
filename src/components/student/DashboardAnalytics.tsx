'use client';

import { useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  Award,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Zap,
} from 'lucide-react';
import styles from './StudentDashboard.module.css';

export type AttemptChartData = {
  id: string;
  name: string;
  score: number;
  date: string;
  correct: number;
  incorrect: number;
  unanswered: number;
  total: number;
};

export type TopicChartData = {
  name: string;
  score: number;
  attempts: number;
};

type Props = {
  attempts: AttemptChartData[];
  topics: TopicChartData[];
  totalAnswered: number;
  totalCorrect: number;
  totalIncorrect: number;
  totalUnanswered: number;
  averageScore: number;
};

const ACCURACY_COLORS = ['#10b981', '#f43f5e', '#f59e0b'];

export default function DashboardAnalytics({
  attempts,
  topics,
  totalCorrect,
  totalIncorrect,
  totalUnanswered,
  averageScore,
}: Props) {
  const [activeTab, setActiveTab] = useState<'trend' | 'topics' | 'accuracy' | 'readiness'>('trend');

  // Trend data in chronological order for smooth progression
  const trendData = [...attempts].reverse().map((a, i) => ({
    name: `Quiz #${i + 1}`,
    fullTitle: a.name,
    score: Math.round(a.score),
    date: a.date,
    correct: a.correct,
    total: a.total,
  }));

  // Accuracy Pie Data
  const accuracyPieData = [
    { name: 'Correct', value: totalCorrect, color: '#10b981' },
    { name: 'Incorrect', value: totalIncorrect, color: '#f43f5e' },
    { name: 'Unanswered', value: totalUnanswered, color: '#f59e0b' },
  ].filter((d) => d.value > 0);

  // Score tiers / readiness distribution
  const readinessTiers = [
    { range: '90-100%', label: 'Mastery', count: 0, color: '#10b981' },
    { range: '75-89%', label: 'Exam Ready', count: 0, color: '#06b6d4' },
    { range: '60-74%', label: 'Borderline', count: 0, color: '#f59e0b' },
    { range: '<60%', label: 'Needs Review', count: 0, color: '#f43f5e' },
  ];

  attempts.forEach((attempt) => {
    const s = attempt.score;
    if (s >= 90) readinessTiers[0].count += 1;
    else if (s >= 75) readinessTiers[1].count += 1;
    else if (s >= 60) readinessTiers[2].count += 1;
    else readinessTiers[3].count += 1;
  });

  const CustomTrendTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className={styles.chartTooltip}>
          <div className={styles.tooltipTitle}>{data.fullTitle}</div>
          <div className={styles.tooltipDate}>{data.date}</div>
          <div className={styles.tooltipScore}>
            Score: <strong>{data.score}%</strong>
          </div>
          <div className={styles.tooltipMeta}>
            {data.correct} of {data.total} correct
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomTopicTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className={styles.chartTooltip}>
          <div className={styles.tooltipTitle}>{data.name}</div>
          <div className={styles.tooltipScore}>
            Average: <strong>{Math.round(data.score)}%</strong>
          </div>
          <div className={styles.tooltipMeta}>
            {data.attempts} {data.attempts === 1 ? 'attempt' : 'attempts'} completed
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.analyticsHub}>
      <div className={styles.analyticsHeader}>
        <div>
          <div className={styles.analyticsBadge}>
            <Sparkles size={14} />
            <span>Smart Performance Analytics</span>
          </div>
          <h2 className={styles.analyticsTitle}>Study Insights & Progress</h2>
          <p className={styles.analyticsSub}>
            Track your score velocity, topic strengths, and readiness distribution.
          </p>
        </div>

        {/* Tab Controls */}
        <div className={styles.chartTabs} role="tablist">
          <button
            type="button"
            className={`${styles.chartTab} ${activeTab === 'trend' ? styles.chartTabActive : ''}`}
            onClick={() => setActiveTab('trend')}
            role="tab"
            aria-selected={activeTab === 'trend'}
          >
            <TrendingUp size={15} />
            <span>Score Trend</span>
          </button>
          <button
            type="button"
            className={`${styles.chartTab} ${activeTab === 'topics' ? styles.chartTabActive : ''}`}
            onClick={() => setActiveTab('topics')}
            role="tab"
            aria-selected={activeTab === 'topics'}
          >
            <BarChart3 size={15} />
            <span>Topic Mastery</span>
          </button>
          <button
            type="button"
            className={`${styles.chartTab} ${activeTab === 'accuracy' ? styles.chartTabActive : ''}`}
            onClick={() => setActiveTab('accuracy')}
            role="tab"
            aria-selected={activeTab === 'accuracy'}
          >
            <PieIcon size={15} />
            <span>Accuracy Ratio</span>
          </button>
          <button
            type="button"
            className={`${styles.chartTab} ${activeTab === 'readiness' ? styles.chartTabActive : ''}`}
            onClick={() => setActiveTab('readiness')}
            role="tab"
            aria-selected={activeTab === 'readiness'}
          >
            <Award size={15} />
            <span>Exam Readiness</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className={styles.chartContainer}>
        {activeTab === 'trend' && (
          <div className={styles.chartWrapper}>
            <div className={styles.chartLegendBar}>
              <div className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: '#4f46e5' }} />
                <span>Attempt Score (%)</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendDash} />
                <span>CFA 70% Target Benchmark</span>
              </div>
            </div>
            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreTrendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.45} />
                      <stop offset="50%" stopColor="#06b6d4" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    stroke="#94a3b8"
                    fontSize={12}
                    tickFormatter={(val) => `${val}%`}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <Tooltip content={<CustomTrendTooltip />} />
                  <ReferenceLine
                    y={70}
                    stroke="#10b981"
                    strokeDasharray="4 4"
                    strokeWidth={2}
                    label={{
                      value: 'Target (70%)',
                      position: 'insideTopRight',
                      fill: '#059669',
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#4f46e5"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#scoreTrendGradient)"
                    activeDot={{ r: 7, fill: '#4f46e5', stroke: '#ffffff', strokeWidth: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'topics' && (
          <div className={styles.chartWrapper}>
            <div className={styles.chartLegendBar}>
              <div className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: '#10b981' }} />
                <span>Strong (&gt;75%)</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: '#f59e0b' }} />
                <span>Moderate (60-75%)</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: '#f43f5e' }} />
                <span>Review Needed (&lt;60%)</span>
              </div>
            </div>
            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topics} margin={{ top: 20, right: 20, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis
                    domain={[0, 100]}
                    stroke="#94a3b8"
                    fontSize={12}
                    tickFormatter={(val) => `${val}%`}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTopicTooltip />} />
                  <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                    {topics.map((entry, index) => {
                      const color =
                        entry.score >= 75 ? '#10b981' : entry.score >= 60 ? '#f59e0b' : '#f43f5e';
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'accuracy' && (
          <div className={styles.chartFlexWrapper}>
            <div className={styles.pieContainer}>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={accuracyPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={105}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {accuracyPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any) => [
                      `${value} questions (${Math.round(
                        (Number(value) / (totalCorrect + totalIncorrect + totalUnanswered)) * 100
                      )}%)`,
                      name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className={styles.pieCenterStats}>
                <span className={styles.pieCenterValue}>{Math.round(averageScore)}%</span>
                <span className={styles.pieCenterLabel}>Avg Score</span>
              </div>
            </div>

            <div className={styles.pieStatsList}>
              <div className={styles.pieStatCard} style={{ borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                <div className={styles.pieStatHeader}>
                  <CheckCircle2 size={18} color="#10b981" />
                  <span className={styles.pieStatName}>Correct Answers</span>
                </div>
                <strong className={styles.pieStatNum} style={{ color: '#10b981' }}>
                  {totalCorrect}
                </strong>
                <span className={styles.pieStatPct}>
                  {totalCorrect + totalIncorrect > 0
                    ? `${Math.round(
                        (totalCorrect / (totalCorrect + totalIncorrect + totalUnanswered)) * 100
                      )}% of all attempts`
                    : '0%'}
                </span>
              </div>

              <div className={styles.pieStatCard} style={{ borderColor: 'rgba(244, 63, 94, 0.3)' }}>
                <div className={styles.pieStatHeader}>
                  <XCircle size={18} color="#f43f5e" />
                  <span className={styles.pieStatName}>Incorrect Answers</span>
                </div>
                <strong className={styles.pieStatNum} style={{ color: '#f43f5e' }}>
                  {totalIncorrect}
                </strong>
                <span className={styles.pieStatPct}>
                  {totalCorrect + totalIncorrect > 0
                    ? `${Math.round(
                        (totalIncorrect / (totalCorrect + totalIncorrect + totalUnanswered)) * 100
                      )}% error rate`
                    : '0%'}
                </span>
              </div>

              {totalUnanswered > 0 && (
                <div className={styles.pieStatCard} style={{ borderColor: 'rgba(245, 158, 11, 0.3)' }}>
                  <div className={styles.pieStatHeader}>
                    <HelpCircle size={18} color="#f59e0b" />
                    <span className={styles.pieStatName}>Unanswered</span>
                  </div>
                  <strong className={styles.pieStatNum} style={{ color: '#f59e0b' }}>
                    {totalUnanswered}
                  </strong>
                  <span className={styles.pieStatPct}>Skipped or timed out</span>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'readiness' && (
          <div className={styles.chartWrapper}>
            <div className={styles.readinessHeader}>
              <div className={styles.readinessScoreBanner}>
                <Zap size={20} color="#6366f1" />
                <span>
                  Exam Readiness Indicator: <strong>{averageScore >= 70 ? 'On Track' : 'Needs Practice'}</strong>
                </span>
              </div>
            </div>
            <div className={styles.readinessGrid}>
              {readinessTiers.map((tier) => (
                <div
                  key={tier.range}
                  className={styles.readinessCard}
                  style={{ borderTop: `4px solid ${tier.color}` }}
                >
                  <div className={styles.readinessBadge} style={{ color: tier.color, background: `${tier.color}15` }}>
                    {tier.label}
                  </div>
                  <strong className={styles.readinessCount}>{tier.count}</strong>
                  <span className={styles.readinessRange}>{tier.range} Score</span>
                  <span className={styles.readinessHint}>
                    {tier.count === 1 ? '1 Quiz' : `${tier.count} Quizzes`} in this bracket
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
