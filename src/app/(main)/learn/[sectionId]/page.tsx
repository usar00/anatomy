"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { fetchLessonQuestions, fetchSectionInfo } from "@/lib/queries/learning";
import { calculateNextReview, getNextReviewDate, calculateStars } from "@/lib/spaced-repetition";
import { QuestionRenderer } from "@/components/lesson/QuestionRenderer";
import { Rin } from "@/components/character/Rin";
import { Button } from "@/components/ui/Button";
import {
  getCorrectMessage,
  getRandomMessage,
  incorrectMessages,
  lessonStartMessages,
  getSectionCompleteMessage,
} from "@/components/character/messages";
import type {
  LessonQuestion,
  Section,
  Unit,
  CharacterState,
} from "@/types/quiz";

export default function LessonPage({
  params,
}: {
  params: Promise<{ sectionId: string }>;
}) {
  const { sectionId } = use(params);
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [questions, setQuestions] = useState<LessonQuestion[]>([]);
  const [sectionInfo, setSectionInfo] = useState<{
    section: Section;
    unit: Unit;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // Quiz state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [showResults, setShowResults] = useState(false);

  // Character state
  const [rinState, setRinState] = useState<CharacterState>("idle");
  const [rinMessage, setRinMessage] = useState("");

  useEffect(() => {
    if (authLoading || !user) return;

    const load = async () => {
      const supabase = createClient();
      const [questionsData, info] = await Promise.all([
        fetchLessonQuestions(supabase, sectionId),
        fetchSectionInfo(supabase, sectionId),
      ]);
      setQuestions(questionsData);
      setSectionInfo(info);
      setLoading(false);

      const msg = getRandomMessage(lessonStartMessages);
      setRinState(msg.state);
      setRinMessage(msg.text);
    };

    load();
  }, [user, authLoading, sectionId]);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const progress = totalQuestions > 0 ? ((currentIndex + (isAnswered ? 1 : 0)) / totalQuestions) * 100 : 0;

  const processAnswer = useCallback(
    async (correct: boolean) => {
      setIsAnswered(true);
      setIsCorrect(correct);

      if (correct) {
        setCorrectCount((c) => c + 1);
        setConsecutiveCorrect((c) => c + 1);
        const msg = getCorrectMessage(consecutiveCorrect + 1);
        setRinState(msg.state);
        setRinMessage(msg.text);
      } else {
        setConsecutiveCorrect(0);
        const msg = getRandomMessage(incorrectMessages);
        setRinState(msg.state);
        setRinMessage(msg.text);
      }

      // Update concept mastery
      if (user && currentQuestion?.concepts?.length > 0) {
        const supabase = createClient();
        for (const concept of currentQuestion.concepts) {
          const { newMastery, nextReviewDays } = calculateNextReview(0, correct);
          await supabase.from("user_concept_mastery").upsert(
            {
              user_id: user.id,
              concept_id: concept.id,
              mastery_level: newMastery,
              times_correct: correct ? 1 : 0,
              times_seen: 1,
              last_seen_at: new Date().toISOString(),
              next_review_at: getNextReviewDate(nextReviewDays),
            },
            { onConflict: "user_id,concept_id" }
          );
        }
      }

      // Update daily streak
      if (user) {
        const supabase = createClient();
        await supabase.rpc("upsert_daily_streak", {
          p_user_id: user.id,
          p_correct: correct,
        });
      }
    },
    [user, currentQuestion, consecutiveCorrect]
  );

  // Standard MCQ handler
  const handleSelectChoice = useCallback(
    (choiceId: string) => {
      if (isAnswered) return;
      setSelectedChoiceId(choiceId);
      const choice = currentQuestion?.choices.find((c) => c.id === choiceId);
      if (choice) processAnswer(choice.is_correct);
    },
    [isAnswered, currentQuestion, processAnswer]
  );

  // Word bank handler
  const handleAnswerWordBank = useCallback(
    (_answer: string, correct: boolean) => {
      processAnswer(correct);
    },
    [processAnswer]
  );

  // Matching pairs handler
  const handleAnswerMatchingPairs = useCallback(
    (correct: boolean) => {
      processAnswer(correct);
    },
    [processAnswer]
  );

  // Free input handler
  const handleAnswerFreeInput = useCallback(
    (_answer: string, correct: boolean) => {
      processAnswer(correct);
    },
    [processAnswer]
  );

  const handleNext = useCallback(async () => {
    if (currentIndex + 1 >= totalQuestions) {
      // Lesson complete
      const stars = calculateStars(correctCount, totalQuestions);

      // Update section progress
      if (user) {
        const supabase = createClient();
        await supabase.from("user_section_progress").upsert(
          {
            user_id: user.id,
            section_id: sectionId,
            status: "completed",
            stars: stars,
            best_score: Math.round((correctCount / totalQuestions) * 100),
            attempts: 1,
            completed_at: new Date().toISOString(),
          },
          { onConflict: "user_id,section_id" }
        );
      }

      const msg = getSectionCompleteMessage(stars);
      setRinState(msg.state);
      setRinMessage(msg.text);
      setShowResults(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedChoiceId(null);
      setIsAnswered(false);
      setIsCorrect(false);
      setRinState("idle");
      setRinMessage("");
    }
  }, [currentIndex, totalQuestions, correctCount, user, sectionId]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-secondary">読み込み中...</div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <Rin state="thinking" message="まだ問題がないみたい" size="lg" />
        <Button variant="outline" onClick={() => router.push("/learn")} className="mt-6">
          戻る
        </Button>
      </div>
    );
  }

  // Results screen
  if (showResults) {
    const stars = calculateStars(correctCount, totalQuestions);
    const scorePercent = Math.round((correctCount / totalQuestions) * 100);

    return (
      <div className="max-w-md mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Rin state={rinState} message={rinMessage} size="lg" />

          <h2 className="text-2xl font-bold mt-4 text-foreground">
            レッスン完了
          </h2>

          {sectionInfo && (
            <p className="text-secondary mt-1">{sectionInfo.section.name}</p>
          )}

          {/* Stars */}
          <div className="flex justify-center gap-2 mt-4">
            {[1, 2, 3].map((i) => (
              <motion.span
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 + i * 0.2 }}
                className={`text-4xl ${i <= stars ? "text-warning" : "text-muted"}`}
              >
                &#9733;
              </motion.span>
            ))}
          </div>

          {/* Score */}
          <div className="mt-4 bg-card border border-card-border rounded-2xl p-6">
            <div className="text-4xl font-bold text-primary">{scorePercent}%</div>
            <p className="text-sm text-secondary mt-1">
              {correctCount}/{totalQuestions} 正解
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 mt-6">
            <Button onClick={() => router.push("/learn")} className="w-full">
              学習マップに戻る
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setCurrentIndex(0);
                setSelectedChoiceId(null);
                setIsAnswered(false);
                setIsCorrect(false);
                setCorrectCount(0);
                setConsecutiveCorrect(0);
                setShowResults(false);
              }}
              className="w-full"
            >
              もう一度やる
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-4">
      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <button
            onClick={() => router.push("/learn")}
            className="text-secondary hover:text-foreground text-sm"
          >
            &#10005; 閉じる
          </button>
          <span className="text-xs text-secondary">
            {currentIndex + 1}/{totalQuestions}
          </span>
        </div>
        <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Character */}
      <div className="flex justify-center mb-4">
        <Rin state={rinState} message={rinMessage} size="sm" />
      </div>

      {/* Question */}
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25 }}
      >
        {/* Question text */}
        <div className="mb-5">
          <p className="text-base font-semibold text-foreground leading-relaxed">
            {currentQuestion.question_text}
          </p>
          {/* Question image */}
          {currentQuestion.images && currentQuestion.images.length > 0 && (
            <div className="mt-3">
              {currentQuestion.images
                .filter((img) => img.image_role === "main")
                .map((img) => (
                  <img
                    key={img.id}
                    src={img.image_url}
                    alt={img.alt_text || "問題画像"}
                    className="rounded-xl border border-card-border max-h-48 mx-auto"
                  />
                ))}
            </div>
          )}
        </div>

        {/* Interaction */}
        <QuestionRenderer
          question={currentQuestion}
          selectedChoiceId={selectedChoiceId}
          isAnswered={isAnswered}
          onSelectChoice={handleSelectChoice}
          onAnswerWordBank={handleAnswerWordBank}
          onAnswerMatchingPairs={handleAnswerMatchingPairs}
          onAnswerFreeInput={handleAnswerFreeInput}
        />

        {/* Explanation */}
        {isAnswered && currentQuestion.explanation && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-muted rounded-xl px-4 py-3"
          >
            <p className="text-sm text-secondary">
              <span className="font-semibold text-foreground">解説: </span>
              {currentQuestion.explanation}
            </p>
          </motion.div>
        )}

        {/* Next button */}
        {isAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4"
          >
            <Button onClick={handleNext} className="w-full" size="lg">
              {currentIndex + 1 >= totalQuestions ? "結果を見る" : "次へ"}
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
