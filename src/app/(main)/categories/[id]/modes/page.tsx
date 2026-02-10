"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { Category } from "@/types/quiz";

interface ModeOption {
  id: string;
  label: string;
  description: string;
  icon: string;
  requiresAuth: boolean;
}

const modes: ModeOption[] = [
  {
    id: "normal",
    label: "通常モード",
    description: "全問題から順番に出題",
    icon: "📝",
    requiresAuth: false,
  },
  {
    id: "random",
    label: "ランダムモード",
    description: "カテゴリ内からランダムに出題",
    icon: "🎲",
    requiresAuth: false,
  },
  {
    id: "review",
    label: "復習モード",
    description: "過去に間違えた問題のみ出題",
    icon: "🔄",
    requiresAuth: true,
  },
];

const questionCountOptions = [10, 25, 50, 0]; // 0 = 全問

export default function ModesPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;
  const { user, isLoading: authLoading, isGuest } = useAuth();

  const [category, setCategory] = useState<Category | null>(null);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [selectedMode, setSelectedMode] = useState("normal");
  const [selectedCount, setSelectedCount] = useState(0); // 0 = all
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (authLoading || !user) return;

      const supabase = createClient();

      // Fetch category info
      const { data: catData } = await supabase
        .from("categories")
        .select("*")
        .eq("id", categoryId)
        .single();

      if (catData) setCategory(catData as Category);

      // Count total questions
      const { count } = await supabase
        .from("questions")
        .select("id", { count: "exact", head: true })
        .eq("category_id", categoryId)
        .eq("is_active", true);

      setTotalQuestions(count || 0);

      // Count review-eligible questions (incorrect answers)
      if (!isGuest) {
        const { data: sessions } = await supabase
          .from("quiz_sessions")
          .select("id")
          .eq("user_id", user.id);

        if (sessions && sessions.length > 0) {
          const sessionIds = (sessions as { id: string }[]).map((s) => s.id);

          const { data: incorrectAnswers } = await supabase
            .from("quiz_answers")
            .select("question_id")
            .in("session_id", sessionIds)
            .eq("is_correct", false);

          if (incorrectAnswers) {
            // Get unique question IDs that belong to this category
            const { data: catQuestions } = await supabase
              .from("questions")
              .select("id")
              .eq("category_id", categoryId)
              .eq("is_active", true);

            const catQuestionIds = new Set(
              ((catQuestions || []) as { id: string }[]).map((q) => q.id)
            );
            const incorrectIds = new Set(
              (incorrectAnswers as { question_id: string }[])
                .filter((a) => catQuestionIds.has(a.question_id))
                .map((a) => a.question_id)
            );
            setReviewCount(incorrectIds.size);
          }
        }
      }

      setIsLoading(false);
    };

    fetchData();
  }, [categoryId, user, authLoading, isGuest]);

  const handleStart = () => {
    const params = new URLSearchParams();
    params.set("category", categoryId);
    params.set("mode", selectedMode);
    if (selectedCount > 0) {
      params.set("limit", String(selectedCount));
    }
    router.push(`/quiz?${params.toString()}`);
  };

  if (authLoading || isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push("/categories")}
          className="text-sm text-secondary hover:text-foreground transition-colors mb-4 flex items-center gap-1"
        >
          ← カテゴリ一覧
        </button>
        <h1 className="text-3xl font-bold mb-1">
          {category?.name || "カテゴリ"}
        </h1>
        <p className="text-secondary">
          出題モードと問題数を選択してください（全 {totalQuestions} 問）
        </p>
      </div>

      {/* Mode Selection */}
      <div className="space-y-3 mb-8">
        <h2 className="text-lg font-semibold mb-2">出題モード</h2>
        {modes.map((mode) => {
          const isDisabled =
            mode.requiresAuth && isGuest;
          const isReviewEmpty =
            mode.id === "review" && reviewCount === 0 && !isGuest;

          return (
            <Card
              key={mode.id}
              hover={!isDisabled && !isReviewEmpty}
              onClick={() => {
                if (!isDisabled && !isReviewEmpty) {
                  setSelectedMode(mode.id);
                }
              }}
              className={`cursor-pointer ${
                selectedMode === mode.id
                  ? "ring-2 ring-primary border-primary"
                  : ""
              } ${isDisabled || isReviewEmpty ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl">{mode.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{mode.label}</h3>
                    {mode.id === "review" && !isGuest && (
                      <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                        {reviewCount} 問
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-secondary">{mode.description}</p>
                  {isDisabled && (
                    <p className="text-xs text-warning mt-1">
                      ログインすると利用できます
                    </p>
                  )}
                  {isReviewEmpty && (
                    <p className="text-xs text-secondary mt-1">
                      間違えた問題がまだありません
                    </p>
                  )}
                </div>
                {selectedMode === mode.id && (
                  <span className="text-primary text-xl">✓</span>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Question Count Selection */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">問題数</h2>
        <div className="grid grid-cols-4 gap-2">
          {questionCountOptions.map((count) => {
            const label = count === 0 ? "全問" : `${count}問`;
            const isDisabled = count > 0 && count > totalQuestions;
            const effectiveCount =
              selectedMode === "review"
                ? count === 0
                  ? reviewCount
                  : Math.min(count, reviewCount)
                : count === 0
                  ? totalQuestions
                  : Math.min(count, totalQuestions);

            return (
              <button
                key={count}
                onClick={() => !isDisabled && setSelectedCount(count)}
                disabled={isDisabled}
                className={`py-3 px-2 rounded-xl text-sm font-medium transition-all ${
                  selectedCount === count
                    ? "bg-primary text-white shadow-sm"
                    : "bg-muted text-foreground hover:bg-card-border"
                } ${isDisabled ? "opacity-30 cursor-not-allowed" : ""}`}
              >
                {label}
                {count !== 0 && (
                  <span className="block text-xs opacity-70 mt-0.5">
                    {effectiveCount}問出題
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Start Button */}
      <Button onClick={handleStart} size="lg" className="w-full">
        クイズを開始
      </Button>
    </div>
  );
}
