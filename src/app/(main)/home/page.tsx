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
  fetchCategoryProgress,
  fetchInProgressSession,
  type TodayStats,
  type StreakInfo,
  type CategoryProgress,
  type InProgressSession,
} from "@/lib/queries/dashboard";

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading: authLoading, isGuest } = useAuth();

  const [todayStats, setTodayStats] = useState<TodayStats | null>(null);
  const [streak, setStreak] = useState<StreakInfo | null>(null);
  const [progress, setProgress] = useState<CategoryProgress[]>([]);
  const [inProgress, setInProgress] = useState<InProgressSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    // Redirect guests to categories
    if (!user || isGuest) {
      router.push("/categories");
      return;
    }

    const fetchData = async () => {
      const supabase = createClient();
      const [stats, streakData, progressData, session] = await Promise.all([
        fetchTodayStats(supabase, user.id),
        fetchStreak(supabase, user.id),
        fetchCategoryProgress(supabase, user.id),
        fetchInProgressSession(supabase, user.id),
      ]);

      setTodayStats(stats);
      setStreak(streakData);
      setProgress(progressData);
      setInProgress(session);
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
        {inProgress && (
          <Button
            onClick={() =>
              router.push(`/quiz?category=${inProgress.categoryId}`)
            }
          >
            前回の続きから（{inProgress.categoryName}{" "}
            {inProgress.answeredCount}/{inProgress.totalQuestions}）
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => router.push("/categories")}
        >
          カテゴリを選んで始める
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

      {/* Category Progress */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">カテゴリ別進捗</h2>
        {progress.length === 0 ? (
          <Card>
            <p className="text-sm text-secondary text-center py-4">
              まだ学習データがありません。クイズを始めましょう！
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {progress.map((cat) => {
              const percent =
                cat.totalQuestions > 0
                  ? Math.round(
                      (cat.answeredCorrectly / cat.totalQuestions) * 100
                    )
                  : 0;
              return (
                <Card
                  key={cat.categoryId}
                  hover
                  onClick={() =>
                    router.push(`/categories/${cat.categoryId}/modes`)
                  }
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{cat.categoryName}</span>
                    <span className="text-sm text-secondary">
                      {cat.answeredCorrectly}/{cat.totalQuestions} 問正解（
                      {percent}%）
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
