"use client";

import { StandardMCQ } from "./StandardMCQ";
import { WordBank } from "./WordBank";
import { MatchingPairs } from "./MatchingPairs";
import { FreeInput } from "./FreeInput";
import type {
  LessonQuestion,
  WordBankMeta,
  MatchingPairsMeta,
  FreeInputMeta,
} from "@/types/quiz";

interface QuestionRendererProps {
  question: LessonQuestion;
  selectedChoiceId: string | null;
  isAnswered: boolean;
  onSelectChoice: (choiceId: string) => void;
  onAnswerWordBank: (answer: string, isCorrect: boolean) => void;
  onAnswerMatchingPairs: (isCorrect: boolean) => void;
  onAnswerFreeInput: (answer: string, isCorrect: boolean) => void;
}

export function QuestionRenderer({
  question,
  selectedChoiceId,
  isAnswered,
  onSelectChoice,
  onAnswerWordBank,
  onAnswerMatchingPairs,
  onAnswerFreeInput,
}: QuestionRendererProps) {
  const meta = question.metadata as Record<string, unknown> | null;

  switch (question.interaction_type) {
    case "word_bank": {
      const wbMeta = meta as unknown as WordBankMeta;
      const correctChoice = question.choices.find((c) => c.is_correct);
      const allOptions = question.choices.map((c) => c.choice_text);
      return (
        <WordBank
          meta={wbMeta}
          correctAnswer={correctChoice?.choice_text || ""}
          allOptions={allOptions}
          isAnswered={isAnswered}
          onAnswer={onAnswerWordBank}
        />
      );
    }

    case "matching_pairs": {
      const mpMeta = meta as unknown as MatchingPairsMeta;
      return (
        <MatchingPairs
          meta={mpMeta}
          isAnswered={isAnswered}
          onAnswer={onAnswerMatchingPairs}
        />
      );
    }

    case "free_input": {
      const rawFiMeta = meta as unknown as FreeInputMeta & { acceptable_answers?: string[] };
      const fiMeta: FreeInputMeta = {
        ...rawFiMeta,
        accepted_answers: rawFiMeta.accepted_answers ?? rawFiMeta.acceptable_answers ?? [],
      };
      return (
        <FreeInput
          meta={fiMeta}
          isAnswered={isAnswered}
          onAnswer={onAnswerFreeInput}
        />
      );
    }

    case "standard_mcq":
    default:
      return (
        <StandardMCQ
          choices={question.choices}
          selectedChoiceId={selectedChoiceId}
          isAnswered={isAnswered}
          onSelect={onSelectChoice}
        />
      );
  }
}
