import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CFA Question Bank Admin',
  description: 'Admin authoring workspace for CFA practice quizzes.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
