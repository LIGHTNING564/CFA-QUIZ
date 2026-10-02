import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import AppShell from '@/components/admin/AppShell';
import { getAdminAccess } from '@/lib/admin-access';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const access = await getAdminAccess();

  if (!access.isAuthenticated) {
    redirect('/login');
  }

  if (!access.isAdmin) {
    redirect('/dashboard');
  }

  return <AppShell>{children}</AppShell>;
}
