import Link from 'next/link';
import type { ReactNode } from 'react';
import { isUsingLocalStore } from '@/lib/store';
import { BookOpen, ShieldCheck, Database, LayoutDashboard } from 'lucide-react';

export default function AppShell({ children }: { children: ReactNode }) {
  const local = isUsingLocalStore();
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">C</div>
          <div>
            <div className="brand-title">CFA Admin</div>
            <div className="brand-subtitle">Authoring Workspace</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          <Link href="/admin" className="nav-link active">
            <BookOpen size={16} />
            <span>Topics & Quizzes</span>
          </Link>
          <Link href="/dashboard" className="nav-link">
            <LayoutDashboard size={16} />
            <span>Student View</span>
          </Link>
        </nav>
        <div className="sidebar-footer">
          <span className={local ? 'status-dot local' : 'status-dot'} />
          <span>{local ? 'Local Data Store' : 'Supabase Live Store'}</span>
        </div>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  );
}
