"use client";

import Image from "next/image";
import type { QuestionWithChoices } from "@/types/quiz";

interface QuestionCardProps {
  question: QuestionWithChoices;
  questionNumber: number;
  totalQuestions: number;
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
}: QuestionCardProps) {
  const mainImage = question.images?.find((img) => img.image_role === "main");

  const difficultyLabel = {
    easy: { text: "初級", color: "text-success bg-success-light" },
    medium: { text: "中級", color: "text-warning bg-warning-light" },
    hard: { text: "上級", color: "text-danger bg-danger-light" },
  };

  const diff = difficultyLabel[question.difficulty];

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-secondary">
          Q{questionNumber}/{totalQuestions}
        </span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${diff.color}`}>
          {diff.text}
        </span>
        {question.question_type !== "text_only" && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary-light text-primary">
            画像問題
          </span>
        )}
      </div>

      {mainImage && (
        <div className="mb-4 rounded-xl overflow-hidden bg-muted flex items-center justify-center">
          <Image
            src={mainImage.image_url}
            alt={mainImage.alt_text || "問題画像"}
            width={600}
            height={400}
            className="object-contain max-h-64 w-auto"
          />
        </div>
      )}

      <p className="text-lg font-medium leading-relaxed">
        {question.question_text}
      </p>
    </div>
  );
}
