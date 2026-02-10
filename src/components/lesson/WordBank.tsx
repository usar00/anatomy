"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { WordBankMeta } from "@/types/quiz";

interface WordBankProps {
  meta: WordBankMeta;
  correctAnswer: string;
  allOptions: string[];
  isAnswered: boolean;
  onAnswer: (answer: string, isCorrect: boolean) => void;
}

export function WordBank({
  meta,
  correctAnswer,
  allOptions,
  isAnswered,
  onAnswer,
}: WordBankProps) {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  // Parse template: "上腕骨は {{blank}} に分類される"
  const parts = meta.template.split("{{blank}}");

  const handleSelect = useCallback(
    (word: string) => {
      if (isAnswered) return;
      setSelectedWord(word);
      onAnswer(word, word === correctAnswer);
    },
    [isAnswered, onAnswer, correctAnswer]
  );

  return (
    <div className="space-y-6">
      {/* Template sentence with blank */}
      <div className="bg-card border border-card-border rounded-2xl p-5 text-center">
        <p className="text-lg leading-relaxed">
          {parts[0]}
          <span
            className={cn(
              "inline-block min-w-[100px] mx-1 px-3 py-1 rounded-lg border-2 border-dashed font-bold transition-all",
              !selectedWord && "border-primary/40 text-primary/40",
              selectedWord && !isAnswered && "border-primary bg-primary-light text-primary",
              isAnswered && selectedWord === correctAnswer && "border-success bg-success-light text-success",
              isAnswered && selectedWord !== correctAnswer && "border-danger bg-danger-light text-danger"
            )}
          >
            {selectedWord || "　　　　"}
          </span>
          {parts[1]}
        </p>
      </div>

      {/* Word bank buttons */}
      <div className="flex flex-wrap gap-2 justify-center">
        {allOptions.map((word) => {
          const isSelected = selectedWord === word;
          const isCorrectWord = word === correctAnswer;

          return (
            <button
              key={word}
              onClick={() => handleSelect(word)}
              disabled={isAnswered}
              className={cn(
                "px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all",
                !isAnswered && !isSelected && "border-card-border bg-card hover:border-primary/40",
                !isAnswered && isSelected && "border-primary bg-primary text-white",
                isAnswered && isCorrectWord && "border-success bg-success-light text-success",
                isAnswered && isSelected && !isCorrectWord && "border-danger bg-danger-light text-danger",
                isAnswered && !isSelected && !isCorrectWord && "border-card-border bg-card opacity-40"
              )}
            >
              {word}
            </button>
          );
        })}
      </div>

      {/* Show correct answer if wrong */}
      {isAnswered && selectedWord !== correctAnswer && (
        <p className="text-sm text-success text-center">
          正解: {correctAnswer}
        </p>
      )}
    </div>
  );
}
