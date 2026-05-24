import { DashboardAuthGate } from "@/components/auth/dashboard-auth-gate";
import { AdminLayout } from "@/components/layouts/AdminLayout";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardAuthGate>
      <AdminLayout>{children}</AdminLayout>
    </DashboardAuthGate>
  );
}
