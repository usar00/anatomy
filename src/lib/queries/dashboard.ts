import type { SupabaseClient } from "@supabase/supabase-js";

export interface TodayStats {
  questionsAnswered: number;
  correctAnswers: number;
  accuracy: number;
}

export interface StreakInfo {
  currentStreak: number;
  todayCompleted: boolean;
}

export interface CategoryProgress {
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  totalQuestions: number;
  answeredCorrectly: number;
}

export interface InProgressSession {
  id: string;
  categoryId: string;
  categoryName: string;
  answeredCount: number;
  totalQuestions: number;
  startedAt: string;
}

export async function fetchTodayStats(
  supabase: SupabaseClient,
  userId: string
): Promise<TodayStats> {
  const today = new Date().toISOString().split("T")[0];
  const { data } = await supabase
    .from("daily_streaks")
    .select("questions_answered, correct_answers")
    .eq("user_id", userId)
    .eq("study_date", today)
    .single();

  if (!data) {
    return { questionsAnswered: 0, correctAnswers: 0, accuracy: 0 };
  }

  const d = data as { questions_answered: number; correct_answers: number };
  return {
    questionsAnswered: d.questions_answered,
    correctAnswers: d.correct_answers,
    accuracy:
      d.questions_answered > 0
        ? Math.round((d.correct_answers / d.questions_answered) * 100)
        : 0,
  };
}

export async function fetchStreak(
  supabase: SupabaseClient,
  userId: string
): Promise<StreakInfo> {
  const { data } = await supabase
    .from("daily_streaks")
    .select("study_date")
    .eq("user_id", userId)
    .order("study_date", { ascending: false })
    .limit(60);

  if (!data || data.length === 0) {
    return { currentStreak: 0, todayCompleted: false };
  }

  const dates = (data as { study_date: string }[]).map(
    (d) => d.study_date
  );
  const today = new Date().toISOString().split("T")[0];
  const todayCompleted = dates[0] === today;

  let streak = 0;
  const startDate = new Date(todayCompleted ? today : today);
  if (!todayCompleted) {
    // Check if yesterday is in the list
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];
    if (dates[0] !== yesterdayStr) {
      return { currentStreak: 0, todayCompleted: false };
    }
    startDate.setDate(startDate.getDate() - 1);
  }

  const dateSet = new Set(dates);
  const checkDate = new Date(startDate);

  while (true) {
    const dateStr = checkDate.toISOString().split("T")[0];
    if (dateSet.has(dateStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return { currentStreak: streak, todayCompleted };
}

export async function fetchCategoryProgress(
  supabase: SupabaseClient,
  userId: string
): Promise<CategoryProgress[]> {
  // Fetch all categories
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("sort_order");

  if (!categories) return [];

  // Fetch question counts per category
  const { data: questions } = await supabase
    .from("questions")
    .select("id, category_id")
    .eq("is_active", true);

  // Fetch user's correct answers (unique questions)
  const { data: answers } = await supabase
    .from("quiz_answers")
    .select("question_id, is_correct, session_id")
    .eq("is_correct", true);

  // Filter answers to only those belonging to the user's sessions
  const { data: sessions } = await supabase
    .from("quiz_sessions")
    .select("id")
    .eq("user_id", userId);

  const sessionIds = new Set(
    ((sessions || []) as { id: string }[]).map((s) => s.id)
  );

  const questionCountMap: Record<string, number> = {};
  for (const q of (questions || []) as { id: string; category_id: string }[]) {
    questionCountMap[q.category_id] =
      (questionCountMap[q.category_id] || 0) + 1;
  }

  // Build question -> category mapping
  const questionCategoryMap: Record<string, string> = {};
  for (const q of (questions || []) as { id: string; category_id: string }[]) {
    questionCategoryMap[q.id] = q.category_id;
  }

  // Count unique correct questions per category
  const correctByCategory: Record<string, Set<string>> = {};
  for (const a of (answers || []) as {
    question_id: string;
    is_correct: boolean;
    session_id: string;
  }[]) {
    if (!sessionIds.has(a.session_id)) continue;
    const catId = questionCategoryMap[a.question_id];
    if (!catId) continue;
    if (!correctByCategory[catId]) correctByCategory[catId] = new Set();
    correctByCategory[catId].add(a.question_id);
  }

  return (
    (categories as { id: string; name: string; slug: string }[]).map((cat) => ({
      categoryId: cat.id,
      categoryName: cat.name,
      categorySlug: cat.slug,
      totalQuestions: questionCountMap[cat.id] || 0,
      answeredCorrectly: correctByCategory[cat.id]?.size || 0,
    }))
  );
}

export async function fetchInProgressSession(
  supabase: SupabaseClient,
  userId: string
): Promise<InProgressSession | null> {
  const { data } = await supabase
    .from("quiz_sessions")
    .select("id, category_id, answered_count, total_questions, started_at")
    .eq("user_id", userId)
    .eq("status", "in_progress")
    .order("started_at", { ascending: false })
    .limit(1)
    .single();

  if (!data) return null;

  const session = data as {
    id: string;
    category_id: string;
    answered_count: number;
    total_questions: number;
    started_at: string;
  };

  // Get category name
  const { data: cat } = await supabase
    .from("categories")
    .select("name")
    .eq("id", session.category_id)
    .single();

  return {
    id: session.id,
    categoryId: session.category_id,
    categoryName: (cat as { name: string })?.name || "",
    answeredCount: session.answered_count,
    totalQuestions: session.total_questions,
    startedAt: session.started_at,
  };
}
