"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { MatchingPairsMeta } from "@/types/quiz";

interface MatchingPairsProps {
  meta: MatchingPairsMeta;
  isAnswered: boolean;
  onAnswer: (isCorrect: boolean) => void;
}

export function MatchingPairs({
  meta,
  isAnswered,
  onAnswer,
}: MatchingPairsProps) {
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matches, setMatches] = useState<Record<number, number>>({});
  const [shuffledRight] = useState(() => {
    const indices = meta.pairs.map((_, i) => i);
    // Fisher-Yates shuffle
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  });

  const allMatched = Object.keys(matches).length === meta.pairs.length;

  const handleLeftClick = useCallback(
    (index: number) => {
      if (isAnswered || matches[index] !== undefined) return;
      setSelectedLeft(index);
    },
    [isAnswered, matches]
  );

  const handleRightClick = useCallback(
    (rightOriginalIndex: number) => {
      if (isAnswered || selectedLeft === null) return;
      // Check if this right item is already matched
      if (Object.values(matches).includes(rightOriginalIndex)) return;

      const newMatches = { ...matches, [selectedLeft]: rightOriginalIndex };
      setMatches(newMatches);
      setSelectedLeft(null);

      // Check if all pairs are matched
      if (Object.keys(newMatches).length === meta.pairs.length) {
        const allCorrect = Object.entries(newMatches).every(
          ([left, right]) => Number(left) === right
        );
        onAnswer(allCorrect);
      }
    },
    [isAnswered, selectedLeft, matches, meta.pairs.length, onAnswer]
  );

  const getMatchColor = (leftIndex: number) => {
    if (!isAnswered) return "bg-primary/20 border-primary";
    return leftIndex === matches[leftIndex]
      ? "bg-success-light border-success"
      : "bg-danger-light border-danger";
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-secondary text-center mb-2">
        左右の正しいペアをタップして結んでください
      </p>
      <div className="grid grid-cols-2 gap-3">
        {/* Left column */}
        <div className="space-y-2">
          {meta.pairs.map((pair, index) => {
            const isMatched = matches[index] !== undefined;
            const isActive = selectedLeft === index;

            return (
              <button
                key={`left-${index}`}
                onClick={() => handleLeftClick(index)}
                disabled={isAnswered || isMatched}
                className={cn(
                  "w-full px-3 py-3 rounded-xl border-2 text-sm font-medium transition-all text-left",
                  !isMatched && !isActive && "border-card-border bg-card hover:border-primary/40",
                  isActive && "border-primary bg-primary-light ring-2 ring-primary/30",
                  isMatched && getMatchColor(index)
                )}
              >
                {pair.left}
              </button>
            );
          })}
        </div>

        {/* Right column (shuffled) */}
        <div className="space-y-2">
          {shuffledRight.map((originalIndex) => {
            const pair = meta.pairs[originalIndex];
            const isMatched = Object.values(matches).includes(originalIndex);
            const matchedLeftIndex = Object.entries(matches).find(
              ([, r]) => r === originalIndex
            )?.[0];

            return (
              <button
                key={`right-${originalIndex}`}
                onClick={() => handleRightClick(originalIndex)}
                disabled={isAnswered || isMatched || selectedLeft === null}
                className={cn(
                  "w-full px-3 py-3 rounded-xl border-2 text-sm font-medium transition-all text-left",
                  !isMatched && selectedLeft === null && "border-card-border bg-card opacity-60",
                  !isMatched && selectedLeft !== null && "border-card-border bg-card hover:border-primary/40",
                  isMatched && matchedLeftIndex !== undefined && (
                    !isAnswered
                      ? "bg-primary/20 border-primary"
                      : Number(matchedLeftIndex) === originalIndex
                        ? "bg-success-light border-success"
                        : "bg-danger-light border-danger"
                  )
                )}
              >
                {pair.right}
              </button>
            );
          })}
        </div>
      </div>

      {/* Status */}
      {!isAnswered && !allMatched && (
        <p className="text-xs text-secondary text-center">
          {Object.keys(matches).length}/{meta.pairs.length} ペア完了
        </p>
      )}

      {/* Show correct answers if wrong */}
      {isAnswered && !Object.entries(matches).every(([l, r]) => Number(l) === r) && (
        <div className="bg-success-light/50 rounded-xl p-3 mt-2">
          <p className="text-xs font-medium text-success mb-1">正しいペア:</p>
          {meta.pairs.map((pair, i) => (
            <p key={i} className="text-xs text-foreground">
              {pair.left} → {pair.right}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
