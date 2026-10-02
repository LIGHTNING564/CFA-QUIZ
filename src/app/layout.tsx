import type { Metadata } from 'next';
import './globals.css';
import { Analytics } from "@vercel/analytics/next"
export const metadata: Metadata = {
  title: 'CFA Question Bank Admin',
  description: 'Admin authoring workspace for CFA practice quizzes.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}
        <Analytics/>
      </body>
    </html>
  );
}
