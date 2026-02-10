"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { ProgressBar } from "@/components/quiz/ProgressBar";
import { QuestionCard } from "@/components/quiz/QuestionCard";
import { ChoiceList } from "@/components/quiz/ChoiceList";
import { ExplanationPanel } from "@/components/quiz/ExplanationPanel";
import { QuizResult } from "@/components/quiz/QuizResult";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { shuffle } from "@/lib/utils";
import type { QuestionWithChoices, Category } from "@/types/quiz";

function QuizContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("category");
  const mode = searchParams.get("mode") || "normal";
  const limitParam = searchParams.get("limit");
  const questionLimit = limitParam ? parseInt(limitParam, 10) : 0;
  const { user, isLoading: authLoading, isGuest, isFreeMember } = useAuth();

  const [questions, setQuestions] = useState<QuestionWithChoices[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [answerStartTime, setAnswerStartTime] = useState<number>(0);

  const supabase = createClient();

  // Fetch questions for the category
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!categoryId || authLoading || !user) return;

      // Fetch category info
      const { data: catData } = await supabase
        .from("categories")
        .select("*")
        .eq("id", categoryId)
        .single();

      if (catData) setCategory(catData as Category);

      let filteredQuestionIds: Set<string> | null = null;

      // Review mode: fetch incorrect question IDs
      if (mode === "review" && !isGuest) {
        const { data: sessions } = await supabase
          .from("quiz_sessions")
          .select("id")
          .eq("user_id", user.id);

        if (sessions && sessions.length > 0) {
          const sessionIds = (sessions as { id: string }[]).map((s) => s.id);

          const { data: incorrectAnswers } = await supabase
            .from("quiz_answers")
            .select("question_id")
            .in("session_id", sessionIds)
            .eq("is_correct", false);

          if (incorrectAnswers) {
            filteredQuestionIds = new Set(
              (incorrectAnswers as { question_id: string }[]).map(
                (a) => a.question_id
              )
            );
          }
        }
      }

      // Fetch questions with choices and images
      const { data: questionsData, error } = await supabase
        .from("questions")
        .select(`
          *,
          choices (*),
          images:question_images (*)
        `)
        .eq("category_id", categoryId)
        .eq("is_active", true);

      if (error) {
        console.error("Error fetching questions:", error);
        setIsLoading(false);
        return;
      }

      if (!questionsData || questionsData.length === 0) {
        setIsLoading(false);
        return;
      }

      let typedQuestions = questionsData as unknown as QuestionWithChoices[];

      // Apply review filter
      if (mode === "review" && filteredQuestionIds) {
        typedQuestions = typedQuestions.filter((q) =>
          filteredQuestionIds!.has(q.id)
        );
      }

      if (typedQuestions.length === 0) {
        setIsLoading(false);
        return;
      }

      // Shuffle questions and choices
      let shuffledQuestions = shuffle(typedQuestions).map((q) => ({
        ...q,
        choices: shuffle(q.choices),
      }));

      // Apply question limit
      if (questionLimit > 0 && questionLimit < shuffledQuestions.length) {
        shuffledQuestions = shuffledQuestions.slice(0, questionLimit);
      }

      setQuestions(shuffledQuestions);

      // Create quiz session
      const { data: session } = await supabase
        .from("quiz_sessions")
        .insert({
          user_id: user.id,
          category_id: categoryId,
          mode: mode as "normal" | "review" | "random" | "test",
          total_questions: shuffledQuestions.length,
          status: "in_progress",
        })
        .select()
        .single();

      if (session) setSessionId((session as { id: string }).id);

      setAnswerStartTime(Date.now());
      setIsLoading(false);
    };

    fetchQuestions();
  }, [categoryId, mode, questionLimit, user, authLoading, isGuest]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectChoice = useCallback(
    (choiceId: string) => {
      if (isAnswered) return;
      setSelectedChoiceId(choiceId);
    },
    [isAnswered]
  );

  const handleAnswer = useCallback(async () => {
    if (!selectedChoiceId || isAnswered) return;

    const currentQuestion = questions[currentIndex];
    const selectedChoice = currentQuestion.choices.find(
      (c) => c.id === selectedChoiceId
    );
    const correct = selectedChoice?.is_correct ?? false;
    const responseTimeMs = Date.now() - answerStartTime;

    setIsAnswered(true);
    if (correct) {
      setCorrectCount((prev) => prev + 1);
    }

    // Save answer to DB
    if (sessionId && user) {
      await supabase.from("quiz_answers").insert({
        session_id: sessionId,
        question_id: currentQuestion.id,
        selected_choice_id: selectedChoiceId,
        is_correct: correct,
        response_time_ms: responseTimeMs,
      });

      // Update session counts
      await supabase
        .from("quiz_sessions")
        .update({
          answered_count: currentIndex + 1,
          correct_count: correct ? correctCount + 1 : correctCount,
        })
        .eq("id", sessionId);

      // Update daily streak
      await supabase.rpc("upsert_daily_streak", {
        p_user_id: user.id,
        p_correct: correct,
      });
    }
  }, [
    selectedChoiceId,
    isAnswered,
    questions,
    currentIndex,
    answerStartTime,
    sessionId,
    user,
    correctCount,
    supabase,
  ]);

  const handleNext = useCallback(async () => {
    if (currentIndex + 1 >= questions.length) {
      setIsComplete(true);

      if (sessionId) {
        await supabase
          .from("quiz_sessions")
          .update({
            status: "completed",
            completed_at: new Date().toISOString(),
          })
          .eq("id", sessionId);
      }
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setSelectedChoiceId(null);
    setIsAnswered(false);
    setAnswerStartTime(Date.now());
  }, [currentIndex, questions.length, sessionId, supabase]);

  const handleRetry = () => {
    setCurrentIndex(0);
    setSelectedChoiceId(null);
    setIsAnswered(false);
    setCorrectCount(0);
    setIsComplete(false);
    setSessionId(null);
    setAnswerStartTime(Date.now());

    setQuestions((prev) => {
      const reshuffled = shuffle([...prev]);
      return reshuffled.map((q) => ({
        ...q,
        choices: shuffle([...q.choices]),
      }));
    });

    const createNewSession = async () => {
      if (!user || !categoryId) return;
      const { data: session } = await supabase
        .from("quiz_sessions")
        .insert({
          user_id: user.id,
          category_id: categoryId,
          mode: mode as "normal" | "review" | "random" | "test",
          total_questions: questions.length,
          status: "in_progress",
        })
        .select()
        .single();
      if (session) setSessionId((session as { id: string }).id);
    };
    createNewSession();
  };

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-32 bg-muted rounded-2xl" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-14 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!categoryId) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <Card>
          <p className="text-lg font-medium mb-4">
            カテゴリが選択されていません
          </p>
          <Button onClick={() => router.push("/categories")}>
            カテゴリを選択する
          </Button>
        </Card>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <Card>
          <p className="text-4xl mb-4">
            {mode === "review" ? "🎉" : "📭"}
          </p>
          <p className="text-lg font-medium mb-2">
            {mode === "review"
              ? "復習する問題がありません"
              : "このカテゴリにはまだ問題がありません"}
          </p>
          <p className="text-sm text-secondary mb-6">
            {mode === "review"
              ? "全問正解しています！他のモードを試してみましょう"
              : "問題データのインポートを行ってください"}
          </p>
          <Button onClick={() => router.push("/categories")}>
            カテゴリ一覧に戻る
          </Button>
        </Card>
      </div>
    );
  }

  // Quiz complete
  if (isComplete) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <QuizResult
          totalQuestions={questions.length}
          correctCount={correctCount}
          categoryName={category?.name ?? ""}
          mode={mode}
          isFreeMember={isFreeMember}
          onRetry={handleRetry}
          onBackToCategories={() => router.push("/categories")}
          onGoHome={() => router.push("/home")}
        />
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const isCorrect =
    isAnswered &&
    currentQuestion.choices.find((c) => c.id === selectedChoiceId)
      ?.is_correct === true;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Mode indicator */}
      {mode !== "normal" && (
        <div className="mb-4">
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary-light text-primary">
            {mode === "review" ? "🔄 復習モード" : "🎲 ランダムモード"}
          </span>
        </div>
      )}

      <ProgressBar
        current={currentIndex}
        total={questions.length}
        correctCount={correctCount}
        className="mb-8"
      />

      <Card className="mb-6">
        <QuestionCard
          question={currentQuestion}
          questionNumber={currentIndex + 1}
          totalQuestions={questions.length}
        />
      </Card>

      <div className="mb-6">
        <ChoiceList
          choices={currentQuestion.choices}
          selectedChoiceId={selectedChoiceId}
          isAnswered={isAnswered}
          onSelect={handleSelectChoice}
        />
      </div>

      {!isAnswered ? (
        <Button
          onClick={handleAnswer}
          disabled={!selectedChoiceId}
          className="w-full"
          size="lg"
        >
          回答する
        </Button>
      ) : (
        <div className="space-y-4">
          <ExplanationPanel
            question={currentQuestion}
            isCorrect={isCorrect ?? false}
          />
          <Button onClick={handleNext} className="w-full" size="lg">
            {currentIndex + 1 >= questions.length
              ? "結果を見る"
              : "次の問題へ →"}
          </Button>
        </div>
      )}

      <div className="mt-4 text-center">
        <button
          onClick={() => router.push("/categories")}
          className="text-sm text-secondary hover:text-foreground transition-colors"
        >
          クイズを終了する
        </button>
      </div>
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-32 bg-muted rounded-2xl" />
          </div>
        </div>
      }
    >
      <QuizContent />
    </Suspense>
  );
}
