"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  fetchTodayStats,
  fetchStreak,
  type TodayStats,
  type StreakInfo,
} from "@/lib/queries/dashboard";

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading: authLoading, isGuest } = useAuth();

  const [todayStats, setTodayStats] = useState<TodayStats | null>(null);
  const [streak, setStreak] = useState<StreakInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    // Redirect guests to learn
    if (!user || isGuest) {
      router.push("/learn");
      return;
    }

    const fetchData = async () => {
      const supabase = createClient();
      const [stats, streakData] = await Promise.all([
        fetchTodayStats(supabase, user.id),
        fetchStreak(supabase, user.id),
      ]);

      setTodayStats(stats);
      setStreak(streakData);
      setIsLoading(false);
    };

    fetchData();
  }, [user, authLoading, isGuest, router]);

  if (authLoading || isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-28 bg-muted rounded-2xl" />
            ))}
          </div>
          <div className="h-48 bg-muted rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">
          {user?.user_metadata?.full_name
            ? `${user.user_metadata.full_name} さん`
            : "ダッシュボード"}
        </h1>
        <p className="text-secondary">今日も解剖学の学習を頑張りましょう</p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <Button
          onClick={() => router.push("/learn")}
        >
          学習を続ける
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <p className="text-sm text-secondary mb-1">今日の回答数</p>
          <p className="text-3xl font-bold text-foreground">
            {todayStats?.questionsAnswered ?? 0}
            <span className="text-sm font-normal text-secondary ml-1">問</span>
          </p>
        </Card>
        <Card>
          <p className="text-sm text-secondary mb-1">今日の正答率</p>
          <p className="text-3xl font-bold text-primary">
            {todayStats?.accuracy ?? 0}
            <span className="text-sm font-normal text-secondary ml-1">%</span>
          </p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm text-secondary">連続学習</p>
            {streak?.todayCompleted && (
              <span className="text-xs bg-success-light text-success px-1.5 py-0.5 rounded-full">
                今日完了
              </span>
            )}
          </div>
          <p className="text-3xl font-bold text-warning">
            {streak?.currentStreak ?? 0}
            <span className="text-sm font-normal text-secondary ml-1">
              日連続
            </span>
          </p>
        </Card>
      </div>

    </div>
  );
}
