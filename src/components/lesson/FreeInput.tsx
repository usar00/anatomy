"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import type { FreeInputMeta } from "@/types/quiz";

interface FreeInputProps {
  meta: FreeInputMeta;
  isAnswered: boolean;
  onAnswer: (answer: string, isCorrect: boolean) => void;
}

export function FreeInput({ meta, isAnswered, onAnswer }: FreeInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [showHint, setShowHint] = useState(false);

  const normalize = (s: string) =>
    s.trim().toLowerCase().replace(/\s+/g, "");

  const handleSubmit = useCallback(() => {
    if (!inputValue.trim() || isAnswered) return;
    const normalizedInput = normalize(inputValue);
    const isCorrect = meta.accepted_answers.some(
      (ans) => normalize(ans) === normalizedInput
    );
    onAnswer(inputValue.trim(), isCorrect);
  }, [inputValue, isAnswered, meta.accepted_answers, onAnswer]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  const isCorrect =
    isAnswered &&
    meta.accepted_answers.some(
      (ans) => normalize(ans) === normalize(inputValue)
    );

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isAnswered}
          placeholder="答えを入力..."
          className={cn(
            "w-full px-4 py-3.5 rounded-xl border-2 text-base font-medium transition-all outline-none",
            "placeholder:text-secondary/50",
            !isAnswered && "border-card-border bg-card focus:border-primary focus:ring-2 focus:ring-primary/20",
            isAnswered && isCorrect && "border-success bg-success-light text-success",
            isAnswered && !isCorrect && "border-danger bg-danger-light text-danger"
          )}
          autoComplete="off"
          autoCapitalize="off"
        />
        {isAnswered && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-lg">
            {isCorrect ? "✓" : "✗"}
          </span>
        )}
      </div>

      {/* Hint button */}
      {!isAnswered && meta.hint && !showHint && (
        <button
          onClick={() => setShowHint(true)}
          className="text-xs text-secondary hover:text-foreground transition-colors"
        >
          ヒントを見る
        </button>
      )}
      {!isAnswered && showHint && meta.hint && (
        <p className="text-sm text-secondary bg-muted rounded-lg px-3 py-2">
          💡 {meta.hint}
        </p>
      )}

      {/* Submit button */}
      {!isAnswered && (
        <Button
          onClick={handleSubmit}
          disabled={!inputValue.trim()}
          className="w-full"
        >
          回答する
        </Button>
      )}

      {/* Correct answer if wrong */}
      {isAnswered && !isCorrect && (
        <p className="text-sm text-success text-center">
          正解: {meta.accepted_answers[0]}
        </p>
      )}
    </div>
  );
}
