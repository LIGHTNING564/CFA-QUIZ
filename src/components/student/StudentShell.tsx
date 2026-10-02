'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import styles from './StudentShell.module.css';

type StudentShellProps = {
  children: ReactNode;
  eyebrow?: string;
  title?: string;
  description?: string;
};

const navigation = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/topics', label: 'Topics' },
  { href: '/history', label: 'History' },
];

export function StudentShell({ children, eyebrow, title, description }: StudentShellProps) {
  const pathname = usePathname();

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link className={styles.brand} href="/dashboard" aria-label="CFA Practice dashboard">
            <span className={styles.mark} aria-hidden="true">C</span>
            <span>CFA Practice</span>
          </Link>
          <nav className={styles.nav} aria-label="Student navigation">
            {navigation.map((item) => {
              const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`));
              return <Link className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`} href={item.href} key={item.href}>{item.label}</Link>;
            })}
          </nav>
        </div>
      </header>
      <main className={styles.page}>
        {title && <div className={styles.pageIntro}>
          {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
          <h1 className={styles.title}>{title}</h1>
          {description && <p className={styles.description}>{description}</p>}
        </div>}
        <div className={styles.content}>{children}</div>
      </main>
    </div>
  );
}

export function StudentAuthShell({ children }: { children: ReactNode }) {
  return <main className={styles.authShell}><div className={styles.authCard}>{children}</div></main>;
}

export { styles as studentStyles };
