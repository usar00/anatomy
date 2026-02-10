"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { Category, CategoryWithStats } from "@/types/quiz";

// Category icons mapping
const categoryIcons: Record<string, string> = {
  musculoskeletal: "🦴",
  cardiovascular: "❤️",
  nervous: "🧠",
  respiratory: "🫁",
  digestive: "🫃",
  urinary: "🫘",
  endocrine: "⚗️",
  reproductive: "🧬",
  integumentary: "🖐️",
  lymphatic: "🛡️",
  sensory: "👁️",
};

function getCategoryIcon(slug: string): string {
  return categoryIcons[slug] || "📖";
}

interface CategoryWithProgress extends CategoryWithStats {
  answered_correctly: number;
}

export default function CategoriesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, isGuest, signInAnonymously } =
    useAuth();
  const [categories, setCategories] = useState<CategoryWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const ensureAuthAndFetch = async () => {
      if (authLoading) return;

      // Auto sign-in anonymously if no user
      if (!user) {
        try {
          await signInAnonymously();
        } catch {
          console.error("Failed to sign in anonymously");
        }
        return;
      }

      const supabase = createClient();

      // Fetch categories
      const { data: categoriesData, error: catError } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order");

      if (catError) {
        console.error("Error fetching categories:", catError);
        setIsLoading(false);
        return;
      }

      // Fetch question counts per category
      const { data: countData } = await supabase
        .from("questions")
        .select("id, category_id")
        .eq("is_active", true);

      // Calculate counts
      const countMap: Record<string, number> = {};
      const questionCategoryMap: Record<string, string> = {};
      if (countData) {
        for (const q of countData as { id: string; category_id: string }[]) {
          countMap[q.category_id] = (countMap[q.category_id] || 0) + 1;
          questionCategoryMap[q.id] = q.category_id;
        }
      }

      // Fetch user's correct answers for progress
      let correctByCategory: Record<string, Set<string>> = {};
      if (user) {
        const { data: sessions } = await supabase
          .from("quiz_sessions")
          .select("id")
          .eq("user_id", user.id);

        if (sessions) {
          const sessionIds = new Set(
            (sessions as { id: string }[]).map((s) => s.id)
          );

          const { data: answers } = await supabase
            .from("quiz_answers")
            .select("question_id, session_id")
            .eq("is_correct", true);

          if (answers) {
            for (const a of answers as {
              question_id: string;
              session_id: string;
            }[]) {
              if (!sessionIds.has(a.session_id)) continue;
              const catId = questionCategoryMap[a.question_id];
              if (!catId) continue;
              if (!correctByCategory[catId])
                correctByCategory[catId] = new Set();
              correctByCategory[catId].add(a.question_id);
            }
          }
        }
      }

      const categoriesWithProgress: CategoryWithProgress[] = (
        (categoriesData || []) as Category[]
      ).map((cat) => ({
        ...cat,
        question_count: countMap[cat.id] || 0,
        answered_correctly: correctByCategory[cat.id]?.size || 0,
      }));

      setCategories(categoriesWithProgress);
      setIsLoading(false);
    };

    ensureAuthAndFetch();
  }, [user, authLoading, signInAnonymously]);

  const handleCategorySelect = (categoryId: string) => {
    router.push(`/categories/${categoryId}/modes`);
  };

  if (authLoading || isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-40 bg-muted rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">カテゴリを選択</h1>
        <p className="text-secondary">
          学習したい分野を選んでクイズを始めましょう
        </p>
      </div>

      {categories.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-4xl mb-4">📭</p>
          <p className="text-lg font-medium mb-2">
            カテゴリがまだ登録されていません
          </p>
          <p className="text-sm text-secondary mb-6">
            問題データのインポートを行ってください
          </p>
          <Button variant="outline" onClick={() => router.push("/")}>
            トップに戻る
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const progressPercent =
              category.question_count > 0
                ? Math.round(
                    (category.answered_correctly / category.question_count) * 100
                  )
                : 0;

            return (
              <Card
                key={category.id}
                hover
                onClick={() => handleCategorySelect(category.id)}
                className="relative"
              >
                {category.is_premium_only && (
                  <span className="absolute top-3 right-3 text-xs bg-warning-light text-warning font-medium px-2 py-0.5 rounded-full">
                    🔒 プレミアム
                  </span>
                )}
                <div className="text-4xl mb-3">
                  {getCategoryIcon(category.slug)}
                </div>
                <h3 className="text-lg font-semibold mb-1">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-sm text-secondary mb-3 line-clamp-2">
                    {category.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-sm text-secondary mb-2">
                  <span>📝 {category.question_count} 問</span>
                  {category.answered_correctly > 0 && (
                    <span className="text-success">
                      {category.answered_correctly}/{category.question_count}{" "}
                      正解済
                    </span>
                  )}
                </div>
                {/* Progress bar */}
                {category.answered_correctly > 0 && (
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-success h-full rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          variant="outline"
          onClick={() => {
            if (categories.length > 0) {
              const random =
                categories[Math.floor(Math.random() * categories.length)];
              handleCategorySelect(random.id);
            }
          }}
          disabled={categories.length === 0}
        >
          🎲 ランダムカテゴリで始める
        </Button>
      </div>
    </div>
  );
}
