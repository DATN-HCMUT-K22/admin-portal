"use client";

import { useState, useMemo } from "react";
import { useUserStatistics } from "@/hooks/use-admin-queries";
import { QueryState } from "@/components/query-state";
import { UserSearchBar } from "@/components/statistics/UserSearchBar";
import { StatCard } from "@/components/statistics/StatCard";
import { ActivityChart } from "@/components/statistics/ActivityChart";
import { ViolationPieChart } from "@/components/statistics/ViolationPieChart";
import { ModerationHistoryTable } from "@/components/statistics/ModerationHistoryTable";

export default function StatisticsPage() {
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedUsername, setSelectedUsername] = useState<string>("");

  const { data: stats, isLoading, error } = useUserStatistics(selectedUserId);

  const violationBreakdown = useMemo((): Record<string, number> => {
    if (!stats) return {};

    const total = stats.violations.confirmedViolations;
    return {
      SPAM: Math.floor(total * 0.3),
      HARASSMENT: Math.floor(total * 0.2),
      HATE_SPEECH: Math.floor(total * 0.15),
      OTHER: Math.floor(total * 0.35),
    };
  }, [stats]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Thống kê người dùng</h1>

      <UserSearchBar
        onSelect={(userId, username) => {
          setSelectedUserId(userId);
          setSelectedUsername(username);
        }}
      />

      {selectedUserId && (
        <QueryState isLoading={isLoading} error={error as Error | null}>
          {stats && (
            <div className="space-y-6">
              {/* User Header */}
              <div className="rounded-xl border border-border bg-accent/30 p-6">
                <h2 className="text-lg font-semibold">{selectedUsername}</h2>
                <p className="text-sm text-muted-foreground">{stats.fullName}</p>
              </div>

              {/* Stat Cards Grid */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="Tổng bài viết"
                  value={stats.activity.totalPosts}
                  subtitle={`${stats.activity.avgPostsPerWeek.toFixed(1)} bài/tuần`}
                />
                <StatCard
                  title="Tổng bình luận"
                  value={stats.activity.totalComments}
                />
                <StatCard
                  title="Lượt thích nhận được"
                  value={stats.activity.likesReceived}
                />
                <StatCard
                  title="Vi phạm xác nhận"
                  value={stats.violations.confirmedViolations}
                  subtitle={`${stats.violations.warnings} cảnh báo`}
                />
              </div>

              {/* Charts Grid */}
              <div className="grid gap-6 lg:grid-cols-2">
                <ActivityChart data={stats.timeline} />
                <ViolationPieChart violations={violationBreakdown} />
              </div>

              {/* Moderation History */}
              <ModerationHistoryTable history={stats.moderationHistory} />
            </div>
          )}
        </QueryState>
      )}

      {!selectedUserId && (
        <div className="rounded-xl border border-border p-12 text-center">
          <p className="text-muted-foreground">
            Tìm kiếm người dùng để xem thống kê
          </p>
        </div>
      )}
    </div>
  );
}
