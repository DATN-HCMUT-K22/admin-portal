"use client";

import { useQuery } from "@tanstack/react-query";
import { getAdminDashboardOverview } from "@/lib/api/dashboard";
import { queryKeys } from "@/lib/query-keys";
import {
  Col,
  Row,
  Spin,
  Badge,
  Tooltip,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  FileTextOutlined,
  CommentOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SafetyOutlined,
  DashboardOutlined,
  InfoCircleOutlined,
  RiseOutlined,
  FallOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { GaugeChart, TreemapChart, FunnelChart } from "@/components/dashboard/charts";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import clsx from "clsx";

// ─── Premium UI Components ───────────────────────────────────────────────────

function PremiumCard({ children, className, title, icon, action }: any) {
  return (
    <div className={clsx("bg-white rounded-3xl p-6 shadow-[0_2px_20px_rgb(0,0,0,0.03)] border border-slate-100/60 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-500 h-full flex flex-col", className)}>
      {(title || icon || action) && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {icon && <div className="p-2 bg-slate-50/80 rounded-xl text-slate-500">{icon}</div>}
            <h3 className="text-base font-bold text-slate-800 m-0 tracking-tight">{title}</h3>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="flex-1 flex flex-col min-h-0">
        {children}
      </div>
    </div>
  );
}

function StatCardSafe({ title, value, icon, bgClass, textClass, borderClass, tooltip }: any) {
  return (
    <div className="relative overflow-hidden bg-white rounded-3xl p-6 shadow-[0_2px_20px_rgb(0,0,0,0.03)] border border-slate-100/60 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-500 group h-full">
      <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full ${bgClass} opacity-40 group-hover:scale-[2.5] transition-transform duration-700 ease-out`} />
      <div className="relative z-10 flex justify-between items-start h-full flex-col gap-5">
        <div className="flex justify-between items-start w-full">
           <div className={`flex items-center justify-center w-12 h-12 rounded-2xl ${bgClass} ${textClass} text-xl shadow-sm ${borderClass} group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
           {tooltip && (
            <Tooltip title={tooltip} color="#0f172a">
              <InfoCircleOutlined className="text-slate-300 text-lg cursor-help hover:text-slate-600 transition-colors" />
            </Tooltip>
          )}
        </div>
        <div>
          <span className="text-4xl font-black text-slate-800 tracking-tight block">{value}</span>
          <div className="text-slate-500 font-medium text-sm mt-1">{title}</div>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle, icon, gradientFrom, gradientTo }: any) {
  return (
    <div className="mb-8 flex items-center gap-5">
      <div className={`flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${gradientFrom} ${gradientTo} text-white shadow-lg shadow-${gradientFrom.split('-')[1]}/30`}>
        <span className="text-2xl">{icon}</span>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-1 tracking-tight">{title}</h2>
        <p className="text-sm font-medium text-slate-500 mb-0">{subtitle}</p>
      </div>
    </div>
  );
}

function KpiBadge({ label, value, status }: { label: string; value: string; status: "success" | "warning" | "error" | "default" }) {
  const colorMap = {
    success: "bg-emerald-50/80 text-emerald-700 border-emerald-200/50",
    warning: "bg-amber-50/80 text-amber-700 border-amber-200/50",
    error: "bg-rose-50/80 text-rose-700 border-rose-200/50",
    default: "bg-slate-50/80 text-slate-600 border-slate-200/50",
  };
  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold tracking-wide ${colorMap[status]} backdrop-blur-sm shadow-sm`}>
      <Badge status={status === "default" ? "default" : status} />
      {label}: <span className="text-sm">{value}</span>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function DashboardOverviewPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) {
      const hasAccess = user.roles?.some((role) =>
        role.permissions?.some((p) => p.name === "READ_ADMIN_DASHBOARD")
      );
      if (!hasAccess) {
        router.replace("/403");
      }
    }
  }, [user, authLoading, router]);

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.admin.dashboardOverview(),
    queryFn: getAdminDashboardOverview,
    enabled: !!user,
  });

  if (authLoading || isLoading) {
    return (
      <div className="flex h-[calc(100vh-100px)] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spin size="large" />
          <div className="text-slate-400 font-medium tracking-wide animate-pulse">Loading Insights...</div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-full w-full items-center justify-center min-h-[500px]">
        <div className="bg-rose-50 text-rose-600 px-6 py-4 rounded-2xl font-medium flex items-center gap-3">
          <WarningOutlined className="text-xl" />
          Failed to load dashboard data. Please try again.
        </div>
      </div>
    );
  }

  const { users, content, moderation, generatedAt } = data;

  // ── Format timestamp ──
  let formattedDate = "N/A";
  try {
    if (generatedAt) {
      const dateVal = Array.isArray(generatedAt)
        ? new Date(
            (generatedAt as number[])[0],
            (generatedAt as number[])[1] - 1,
            (generatedAt as number[])[2],
            (generatedAt as number[])[3] ?? 0,
            (generatedAt as number[])[4] ?? 0,
            (generatedAt as number[])[5] ?? 0
          )
        : new Date(generatedAt as string);
      if (!isNaN(dateVal.getTime())) {
        formattedDate = new Intl.DateTimeFormat("en-US", {
          dateStyle: "medium",
          timeStyle: "medium",
        }).format(dateVal);
      }
    }
  } catch {
    // ignore parse errors
  }

  // ── Derived Metrics ──
  const activeUsers = users.total - users.locked;
  const lockRate = users.total > 0 ? users.locked / users.total : 0;
  const lockRatePct = (lockRate * 100).toFixed(1);

  const totalContent =
    content.posts + content.comments + content.itineraries + content.groups;

  const totalHandled = moderation.processedReports + moderation.pendingReports;
  const resolutionRate =
    totalHandled > 0 ? moderation.processedReports / totalHandled : 0;
  const resolutionRatePct = (resolutionRate * 100).toFixed(1);

  const dismissedRate =
    moderation.dismissedReports + moderation.processedReports > 0
      ? (
          (moderation.dismissedReports /
            (moderation.dismissedReports + moderation.processedReports)) *
          100
        ).toFixed(1)
      : "0";

  // ── Chart Data ──

  const userDonutData = [
    { name: "Active", value: activeUsers },
    { name: "Locked", value: users.locked },
  ];
  const userDonutColors = ["#3b82f6", "#f43f5e"];

  const contentTreemapData = [
    { name: "Posts", value: content.posts },
    { name: "Comments", value: content.comments },
    { name: "Itineraries", value: content.itineraries },
    { name: "Groups", value: content.groups },
  ];
  const contentHBarData = [...contentTreemapData].sort(
    (a, b) => b.value - a.value
  );

  const funnelData = [
    {
      stage: "Total Reports",
      value: moderation.pendingReports + moderation.processedReports + moderation.dismissedReports,
    },
    { stage: "Processed", value: moderation.processedReports },
    { stage: "Pending", value: moderation.pendingReports },
    { stage: "Dismissed", value: moderation.dismissedReports },
  ].filter((d) => d.value > 0);

  return (
    <div className="p-4 md:p-8 min-h-screen space-y-12 bg-slate-50/50 pb-20">
      
      {/* ── HEADER (Premium Hero) ── */}
      <div className="relative bg-slate-900 rounded-[2.5rem] p-8 md:p-12 overflow-hidden shadow-2xl shadow-slate-900/20">
        {/* Abstract background blobs */}
        <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-indigo-500 rounded-full mix-blend-screen filter blur-[120px] opacity-30 animate-pulse pointer-events-none"></div>
        <div className="absolute -bottom-32 -left-32 w-[30rem] h-[30rem] bg-blue-500 rounded-full mix-blend-screen filter blur-[120px] opacity-30 animate-pulse pointer-events-none" style={{ animationDelay: '2s' }}></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:justify-between lg:items-end gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 backdrop-blur-md mb-6 text-indigo-200 text-xs font-bold tracking-widest uppercase shadow-sm">
              <ThunderboltOutlined className="text-yellow-400" /> Admin Workspace
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight leading-tight">
              Dashboard Overview
            </h1>
            <p className="text-slate-300 text-lg font-medium leading-relaxed">
              Real-time aggregated metrics across users, content, and moderation actions. Gain deep insights into platform health and operational efficiency.
            </p>
          </div>
          <div className="text-left lg:text-right bg-white/10 backdrop-blur-md py-4 px-6 rounded-3xl border border-white/10 shadow-xl">
            <div className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-1.5 opacity-80">
              Snapshot Generated
            </div>
            <div className="text-base font-bold text-white tracking-wide" suppressHydrationWarning>
              {formattedDate}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 1 — USERS                                                  */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section>
        <SectionHeader
          icon={<UserOutlined />}
          title="Users Overview"
          subtitle="Active vs locked accounts — lock rate as health indicator"
          gradientFrom="from-blue-500"
          gradientTo="to-indigo-500"
        />

        <div className="flex flex-wrap gap-3 mb-8">
          <KpiBadge
            label="Lock Rate"
            value={`${lockRatePct}%`}
            status={parseFloat(lockRatePct) > 5 ? "warning" : "success"}
          />
          <KpiBadge
            label="Active Users"
            value={new Intl.NumberFormat().format(activeUsers)}
            status="success"
          />
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={8}>
            <StatCardSafe
              title="Total Users"
              value={new Intl.NumberFormat().format(users.total)}
              icon={<UserOutlined />}
              bgClass="bg-blue-50"
              textClass="text-blue-600"
              borderClass="border-blue-100"
              tooltip="Total registered users on the platform"
            />
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <StatCardSafe
              title="Active Users"
              value={new Intl.NumberFormat().format(activeUsers)}
              icon={<RiseOutlined />}
              bgClass="bg-emerald-50"
              textClass="text-emerald-600"
              borderClass="border-emerald-100"
              tooltip="Users who are not locked"
            />
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <StatCardSafe
              title="Locked Users"
              value={new Intl.NumberFormat().format(users.locked)}
              icon={<LockOutlined />}
              bgClass="bg-rose-50"
              textClass="text-rose-600"
              borderClass="border-rose-100"
              tooltip="Accounts suspended by admin action"
            />
          </Col>

          <Col xs={24} lg={8}>
            <PremiumCard title="Lock Rate Health" icon={<FallOutlined />}>
              <div className="mt-4">
                <GaugeChart
                  percent={lockRate}
                  title="Lock Rate"
                  color={parseFloat(lockRatePct) > 5 ? "#f43f5e" : "#3b82f6"}
                  height={200}
                />
              </div>
            </PremiumCard>
          </Col>

          <Col xs={24} lg={16}>
            <PremiumCard title="User Status Distribution" icon={<PieChart className="w-5 h-5" />}>
              <div style={{ height: 240 }} className="mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={userDonutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={95}
                      paddingAngle={6}
                      dataKey="value"
                      stroke="none"
                      cornerRadius={6}
                    >
                      {userDonutData.map((_, index) => (
                        <Cell
                          key={`cell-user-${index}`}
                          fill={userDonutColors[index % userDonutColors.length]}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(v) => new Intl.NumberFormat().format(Number(v ?? 0))}
                      contentStyle={{
                        borderRadius: "16px",
                        border: "none",
                        boxShadow: "0 10px 40px -10px rgb(0 0 0 / 0.15)",
                        padding: "12px 20px",
                        fontWeight: 600,
                      }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: "20px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </PremiumCard>
          </Col>
        </Row>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 2 — CONTENT                                               */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section>
        <SectionHeader
          icon={<FileTextOutlined />}
          title="Content Distribution"
          subtitle={`${new Intl.NumberFormat().format(totalContent)} total content items across all types`}
          gradientFrom="from-purple-500"
          gradientTo="to-pink-500"
        />

        <Row gutter={[24, 24]} className="mb-8">
          <Col xs={12} lg={6}>
            <StatCardSafe
              title="Posts"
              value={new Intl.NumberFormat().format(content.posts)}
              icon={<FileTextOutlined />}
              bgClass="bg-indigo-50"
              textClass="text-indigo-600"
              borderClass="border-indigo-100"
            />
          </Col>
          <Col xs={12} lg={6}>
            <StatCardSafe
              title="Comments"
              value={new Intl.NumberFormat().format(content.comments)}
              icon={<CommentOutlined />}
              bgClass="bg-cyan-50"
              textClass="text-cyan-600"
              borderClass="border-cyan-100"
            />
          </Col>
          <Col xs={12} lg={6}>
            <StatCardSafe
              title="Itineraries"
              value={new Intl.NumberFormat().format(content.itineraries)}
              icon={<EnvironmentOutlined />}
              bgClass="bg-emerald-50"
              textClass="text-emerald-600"
              borderClass="border-emerald-100"
            />
          </Col>
          <Col xs={12} lg={6}>
            <StatCardSafe
              title="Groups"
              value={new Intl.NumberFormat().format(content.groups)}
              icon={<TeamOutlined />}
              bgClass="bg-purple-50"
              textClass="text-purple-600"
              borderClass="border-purple-100"
            />
          </Col>
        </Row>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <PremiumCard title="Content Mix Breakdown" icon={<AppstoreOutlined className="w-5 h-5" />}>
              <div className="mt-4 -mx-2">
                <TreemapChart data={contentTreemapData} height={320} />
              </div>
            </PremiumCard>
          </Col>

          <Col xs={24} lg={12}>
            <PremiumCard title="Volume Comparison" icon={<BarChartOutlined className="w-5 h-5" />}>
              <div style={{ height: 320 }} className="mt-4 -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={contentHBarData}
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid
                      horizontal={false}
                      strokeDasharray="3 3"
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      type="number"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 500 }}
                      tickFormatter={(v) =>
                        v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
                      }
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#475569", fontWeight: 700, fontSize: 13 }}
                      width={90}
                    />
                    <RechartsTooltip
                      cursor={{ fill: "#f8fafc" }}
                      formatter={(v) => new Intl.NumberFormat().format(Number(v ?? 0))}
                      contentStyle={{
                        borderRadius: "16px",
                        border: "none",
                        boxShadow: "0 10px 40px -10px rgb(0 0 0 / 0.15)",
                        padding: "12px 20px",
                        fontWeight: 600,
                      }}
                    />
                    <Bar
                      dataKey="value"
                      radius={[0, 8, 8, 0]}
                      maxBarSize={48}
                    >
                      {contentHBarData.map((_, index) => {
                        const colors = [
                          "#6366f1",
                          "#06b6d4",
                          "#10b981",
                          "#8b5cf6",
                        ];
                        return (
                          <Cell
                            key={`cell-content-${index}`}
                            fill={colors[index % colors.length]}
                          />
                        );
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </PremiumCard>
          </Col>
        </Row>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* SECTION 3 — MODERATION                                             */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section>
        <SectionHeader
          icon={<SafetyOutlined />}
          title="Moderation Activity"
          subtitle="Report handling pipeline — resolution rate as performance KPI"
          gradientFrom="from-amber-400"
          gradientTo="to-orange-500"
        />

        <div className="flex flex-wrap gap-3 mb-8">
          <KpiBadge
            label="Resolution Rate"
            value={`${resolutionRatePct}%`}
            status={parseFloat(resolutionRatePct) >= 70 ? "success" : "warning"}
          />
          <KpiBadge
            label="Dismissed Rate"
            value={`${dismissedRate}%`}
            status="default"
          />
          <KpiBadge
            label="Total Actions"
            value={new Intl.NumberFormat().format(moderation.totalActions)}
            status="default"
          />
        </div>

        <Row gutter={[24, 24]} className="mb-8">
          <Col xs={12} lg={6}>
            <StatCardSafe
              title="Pending Reports"
              value={new Intl.NumberFormat().format(moderation.pendingReports)}
              icon={<WarningOutlined />}
              bgClass="bg-amber-50"
              textClass="text-amber-500"
              borderClass="border-amber-100"
              tooltip="Reports awaiting admin review"
            />
          </Col>
          <Col xs={12} lg={6}>
            <StatCardSafe
              title="Processed"
              value={new Intl.NumberFormat().format(moderation.processedReports)}
              icon={<CheckCircleOutlined />}
              bgClass="bg-teal-50"
              textClass="text-teal-500"
              borderClass="border-teal-100"
            />
          </Col>
          <Col xs={12} lg={6}>
            <StatCardSafe
              title="Dismissed"
              value={new Intl.NumberFormat().format(moderation.dismissedReports)}
              icon={<CloseCircleOutlined />}
              bgClass="bg-slate-100"
              textClass="text-slate-500"
              borderClass="border-slate-200"
            />
          </Col>
          <Col xs={12} lg={6}>
            <StatCardSafe
              title="Total Actions"
              value={new Intl.NumberFormat().format(moderation.totalActions)}
              icon={<SafetyOutlined />}
              bgClass="bg-blue-50"
              textClass="text-blue-500"
              borderClass="border-blue-100"
              tooltip="Total moderation actions taken by admins"
            />
          </Col>
        </Row>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={10}>
            <PremiumCard title="Resolution Efficiency" icon={<RiseOutlined />}>
              <div className="mt-4">
                <GaugeChart
                  percent={resolutionRate}
                  title="Resolution Rate"
                  color={resolutionRate >= 0.7 ? "#14b8a6" : "#f59e0b"}
                  height={260}
                />
                <div className="text-center mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="font-bold text-slate-800">{new Intl.NumberFormat().format(moderation.processedReports)}</span>
                  <span className="text-slate-500 font-medium"> processed out of </span>
                  <span className="font-bold text-slate-800">{new Intl.NumberFormat().format(totalHandled)}</span>
                  <span className="text-slate-500 font-medium"> reports</span>
                </div>
              </div>
            </PremiumCard>
          </Col>

          <Col xs={24} lg={14}>
            <PremiumCard title="Moderation Pipeline" icon={<FilterOutlined className="w-5 h-5" />}>
              <div className="mt-4 -mx-2 h-[320px] flex items-center justify-center">
                {funnelData.length > 0 ? (
                  <FunnelChart
                    data={funnelData}
                    colors={["#4f46e5", "#0ea5e9", "#f59e0b", "#94a3b8"]}
                    height={300}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                    <SafetyOutlined className="text-4xl opacity-20" />
                    <span className="font-medium">No moderation data available</span>
                  </div>
                )}
              </div>
            </PremiumCard>
          </Col>
        </Row>
      </section>
    </div>
  );
}

// Add some missing icons for PremiumCards
function AppstoreOutlined(props: any) {
  return (
    <svg viewBox="64 64 896 896" focusable="false" data-icon="appstore" width="1em" height="1em" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M464 144H160c-8.8 0-16 7.2-16 16v304c0 8.8 7.2 16 16 16h304c8.8 0 16-7.2 16-16V160c0-8.8-7.2-16-16-16zm-52 268H212V212h200v200zm452-268H560c-8.8 0-16 7.2-16 16v304c0 8.8 7.2 16 16 16h304c8.8 0 16-7.2 16-16V160c0-8.8-7.2-16-16-16zm-52 268H612V212h200v200zM464 544H160c-8.8 0-16 7.2-16 16v304c0 8.8 7.2 16 16 16h304c8.8 0 16-7.2 16-16V560c0-8.8-7.2-16-16-16zm-52 268H212V612h200v200zm452-268H560c-8.8 0-16 7.2-16 16v304c0 8.8 7.2 16 16 16h304c8.8 0 16-7.2 16-16V560c0-8.8-7.2-16-16-16zm-52 268H612V612h200v200z"></path>
    </svg>
  );
}

function BarChartOutlined(props: any) {
  return (
    <svg viewBox="64 64 896 896" focusable="false" data-icon="bar-chart" width="1em" height="1em" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M888 792H200V168c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v688c0 4.4 3.6 8 8 8h752c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zM288 604a8 8 0 008 8h60c4.4 0 8-3.6 8-8V260a8 8 0 00-8-8h-60c-4.4 0-8 3.6-8 8v344zm116 0a8 8 0 008 8h60c4.4 0 8-3.6 8-8v-160a8 8 0 00-8-8h-60c-4.4 0-8 3.6-8 8v160zm116 0a8 8 0 008 8h60c4.4 0 8-3.6 8-8V436a8 8 0 00-8-8h-60c-4.4 0-8 3.6-8 8v168zm116 0a8 8 0 008 8h60c4.4 0 8-3.6 8-8V332a8 8 0 00-8-8h-60c-4.4 0-8 3.6-8 8v272z"></path>
    </svg>
  );
}

function FilterOutlined(props: any) {
  return (
    <svg viewBox="64 64 896 896" focusable="false" data-icon="filter" width="1em" height="1em" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M880.1 154H143.9c-24.5 0-39.8 26.7-27.5 48L349 597.4V838c0 17.7 14.2 32 31.8 32h262.4c17.6 0 31.8-14.3 31.8-32V597.4L907.7 202c12.2-21.3-3.1-48-27.6-48zM603.4 541.3l-22.1 37.8V806H442.7V579.1l-22.1-37.8L211.3 226h601.4L603.4 541.3z"></path>
    </svg>
  );
}
