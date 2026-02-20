import { DashboardShell } from '@/components/layout/DashboardShell';
import { DashboardClient } from '@/components/dashboard/DashboardClient';

/**
 * Dashboard layout: sidebar + main content. Mobile: sidebar as overlay.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell>
      <DashboardClient />
      {children}
    </DashboardShell>
  );
}
