'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  History, 
  Sparkles, 
  GraduationCap 
} from 'lucide-react';
import styles from './StudentShell.module.css';

type StudentShellProps = {
  children: ReactNode;
  eyebrow?: string;
  title?: string;
  description?: string;
};

const navigation = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/topics', label: 'Topics', icon: BookOpen },
  { href: '/history', label: 'History', icon: History },
];

export function StudentShell({ children, eyebrow, title, description }: StudentShellProps) {
  const pathname = usePathname();

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brandGroup}>
            <Link className={styles.brand} href="/dashboard" aria-label="CFA Practice Platform">
              <span className={styles.mark} aria-hidden="true">C</span>
              <div className={styles.brandText}>
                <span className={styles.brandName}>CFA Master</span>
                <span className={styles.brandTag}>Question Bank</span>
              </div>
            </Link>
          </div>

          <nav className={styles.nav} aria-label="Student navigation">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`));
              return (
                <Link
                  className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}
                  href={item.href}
                  key={item.href}
                >
                  <Icon size={16} aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className={styles.headerActions}>
            <div className={styles.prepBadge}>
              <Sparkles size={13} aria-hidden="true" />
              <span>CFA Candidate Hub</span>
            </div>
          </div>
        </div>
      </header>

      <main className={styles.page}>
        {title && (
          <div className={styles.pageIntro}>
            {eyebrow && (
              <p className={styles.eyebrow}>
                <GraduationCap size={14} aria-hidden="true" />
                {eyebrow}
              </p>
            )}
            <h1 className={styles.title}>{title}</h1>
            {description && <p className={styles.description}>{description}</p>}
          </div>
        )}
        <div className={styles.content}>{children}</div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div>© {new Date().getFullYear()} CFA Practice Hub. Designed for focused exam preparation.</div>
          <div className={styles.footerLinks}>
            <Link href="/dashboard" className={styles.footerLink}>Dashboard</Link>
            <Link href="/topics" className={styles.footerLink}>Topics</Link>
            <Link href="/history" className={styles.footerLink}>History</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function StudentAuthShell({ children }: { children: ReactNode }) {
  return (
    <main className={styles.authShell}>
      <div className={styles.authCard}>{children}</div>
    </main>
  );
}

export { styles as studentStyles };
