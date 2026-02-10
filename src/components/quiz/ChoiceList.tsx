"use client";

import { cn } from "@/lib/utils";
import type { Choice } from "@/types/quiz";

interface ChoiceListProps {
  choices: Choice[];
  selectedChoiceId: string | null;
  isAnswered: boolean;
  onSelect: (choiceId: string) => void;
}

export function ChoiceList({
  choices,
  selectedChoiceId,
  isAnswered,
  onSelect,
}: ChoiceListProps) {
  const getChoiceStyle = (choice: Choice) => {
    if (!isAnswered) {
      if (choice.id === selectedChoiceId) {
        return "border-2 border-primary bg-primary-light";
      }
      return "border border-card-border bg-background hover:border-primary/50 hover:bg-primary-light/30";
    }

    // After answering
    if (choice.is_correct) {
      return "border-2 border-success bg-success-light";
    }
    if (choice.id === selectedChoiceId && !choice.is_correct) {
      return "border-2 border-danger bg-danger-light";
    }
    return "border border-card-border bg-background opacity-50";
  };

  const getChoiceIcon = (choice: Choice) => {
    if (!isAnswered) return null;

    if (choice.is_correct) {
      return <span className="text-success font-bold">✓</span>;
    }
    if (choice.id === selectedChoiceId && !choice.is_correct) {
      return <span className="text-danger font-bold">✗</span>;
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-3">
      {choices.map((choice, index) => (
        <button
          key={choice.id}
          onClick={() => !isAnswered && onSelect(choice.id)}
          disabled={isAnswered}
          className={cn(
            "w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3",
            getChoiceStyle(choice),
            !isAnswered && "cursor-pointer",
            isAnswered && "cursor-default"
          )}
        >
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
            {String.fromCharCode(65 + index)}
          </span>
          <span className="flex-1">{choice.choice_text}</span>
          {getChoiceIcon(choice)}
        </button>
      ))}
    </div>
  );
}
