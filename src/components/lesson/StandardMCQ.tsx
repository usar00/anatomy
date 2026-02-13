"use client";

import { cn } from "@/lib/utils";
import type { Choice } from "@/types/quiz";

interface StandardMCQProps {
  choices: Choice[];
  selectedChoiceId: string | null;
  isAnswered: boolean;
  onSelect: (choiceId: string) => void;
}

const labels = ["A", "B", "C", "D", "E", "F"];

export function StandardMCQ({
  choices,
  selectedChoiceId,
  isAnswered,
  onSelect,
}: StandardMCQProps) {
  return (
    <div className="space-y-2">
      {choices.map((choice, index) => {
        const isSelected = selectedChoiceId === choice.id;
        const isCorrect = choice.is_correct;
        const showResult = isAnswered;

        return (
          <button
            key={choice.id}
            onClick={() => !isAnswered && onSelect(choice.id)}
            disabled={isAnswered}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-200 text-left",
              !isAnswered && !isSelected && "border-card-border bg-card hover:border-primary/40 hover:bg-primary-light/30",
              !isAnswered && isSelected && "border-primary bg-primary-light",
              showResult && isSelected && isCorrect && "border-success bg-success-light",
              showResult && isSelected && !isCorrect && "border-danger bg-danger-light",
              showResult && !isSelected && isCorrect && "border-success/50 bg-success-light/50",
              showResult && !isSelected && !isCorrect && "border-card-border bg-card opacity-50"
            )}
          >
            <span
              className={cn(
                "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold",
                !isAnswered && !isSelected && "bg-muted text-secondary",
                !isAnswered && isSelected && "bg-primary text-white",
                showResult && isCorrect && "bg-success text-white",
                showResult && isSelected && !isCorrect && "bg-danger text-white",
                showResult && !isSelected && !isCorrect && "bg-muted text-secondary"
              )}
            >
              {labels[index]}
            </span>
            <span className="text-base font-medium flex-1">
              {choice.choice_text}
            </span>
            {showResult && isCorrect && (
              <span className="text-success text-lg">&#10003;</span>
            )}
            {showResult && isSelected && !isCorrect && (
              <span className="text-danger text-lg">&#10007;</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
