import { DashboardAuthGate } from "@/components/auth/dashboard-auth-gate";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { TopBar } from "@/components/dashboard/top-bar";
import { Breadcrumbs } from "@/components/dashboard/breadcrumbs";
import { ToastProvider } from "@/components/ui/toast-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardAuthGate>
      <ToastProvider>
        <DashboardShell>
          <TopBar />
          <main className="p-6">
            <Breadcrumbs />
            {children}
          </main>
        </DashboardShell>
      </ToastProvider>
    </DashboardAuthGate>
  );
}
