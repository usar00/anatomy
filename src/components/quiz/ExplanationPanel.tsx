"use client";

import Image from "next/image";
import type { QuestionWithChoices } from "@/types/quiz";

interface ExplanationPanelProps {
  question: QuestionWithChoices;
  isCorrect: boolean;
}

export function ExplanationPanel({
  question,
  isCorrect,
}: ExplanationPanelProps) {
  const explanationImage = question.images?.find(
    (img) => img.image_role === "explanation"
  );

  return (
    <div
      className={`rounded-xl p-4 ${
        isCorrect ? "bg-success-light" : "bg-danger-light"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{isCorrect ? "✅" : "❌"}</span>
        <span className="font-semibold">
          {isCorrect ? "正解！" : "不正解"}
        </span>
      </div>

      {question.explanation && (
        <p className="text-base leading-relaxed mb-3">{question.explanation}</p>
      )}

      {explanationImage && (
        <div className="rounded-lg overflow-hidden bg-background/50">
          <Image
            src={explanationImage.image_url}
            alt={explanationImage.alt_text || "解説画像"}
            width={500}
            height={300}
            className="object-contain max-h-48 w-auto mx-auto"
          />
        </div>
      )}

      {question.source && (
        <p className="text-sm text-secondary mt-2">出典: {question.source}</p>
      )}
    </div>
  );
}
