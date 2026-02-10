"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatPercent } from "@/lib/utils";

interface QuizResultProps {
  totalQuestions: number;
  correctCount: number;
  categoryName: string;
  mode?: string;
  isFreeMember?: boolean;
  onRetry: () => void;
  onBackToCategories: () => void;
  onGoHome?: () => void;
}

export function QuizResult({
  totalQuestions,
  correctCount,
  categoryName,
  mode = "normal",
  isFreeMember = false,
  onRetry,
  onBackToCategories,
  onGoHome,
}: QuizResultProps) {
  const percentage =
    totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

  const getGrade = () => {
    if (percentage >= 90)
      return { emoji: "🏆", label: "素晴らしい！", color: "text-success" };
    if (percentage >= 70)
      return { emoji: "🎉", label: "よくできました！", color: "text-primary" };
    if (percentage >= 50)
      return {
        emoji: "📚",
        label: "もう少し頑張ろう！",
        color: "text-warning",
      };
    return { emoji: "💪", label: "復習しましょう！", color: "text-danger" };
  };

  const grade = getGrade();

  const modeLabel =
    mode === "review"
      ? "復習モード"
      : mode === "random"
        ? "ランダムモード"
        : "通常モード";

  return (
    <div className="max-w-lg mx-auto">
      <Card className="text-center">
        <div className="text-6xl mb-4">{grade.emoji}</div>
        <h2 className={`text-2xl font-bold mb-2 ${grade.color}`}>
          {grade.label}
        </h2>
        <p className="text-secondary mb-1">{categoryName}</p>
        <p className="text-xs text-secondary mb-6">{modeLabel}</p>

        <div className="bg-muted rounded-2xl p-6 mb-6">
          <div className="text-5xl font-bold text-foreground mb-1">
            {formatPercent(percentage)}
          </div>
          <p className="text-secondary">
            {totalQuestions} 問中 {correctCount} 問正解
          </p>
        </div>

        {/* Score Breakdown */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div>
            <p className="text-2xl font-bold text-foreground">
              {totalQuestions}
            </p>
            <p className="text-xs text-secondary">出題数</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-success">{correctCount}</p>
            <p className="text-xs text-secondary">正解数</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-danger">
              {totalQuestions - correctCount}
            </p>
            <p className="text-xs text-secondary">不正解数</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button onClick={onRetry} className="w-full">
            もう一度挑戦
          </Button>
          <Button
            variant="outline"
            onClick={onBackToCategories}
            className="w-full"
          >
            カテゴリ一覧に戻る
          </Button>
          {isFreeMember && onGoHome && (
            <Button
              variant="ghost"
              onClick={onGoHome}
              className="w-full"
            >
              ホームに戻る
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
