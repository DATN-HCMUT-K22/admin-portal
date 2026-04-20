import { DashboardAuthGate } from "@/components/auth/dashboard-auth-gate";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { TopBar } from "@/components/dashboard/top-bar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardAuthGate>
      <DashboardShell>
        <TopBar />
        <main className="p-6">{children}</main>
      </DashboardShell>
    </DashboardAuthGate>
  );
}
