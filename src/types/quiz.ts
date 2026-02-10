import type { Database } from "./database";

// Row type aliases
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Question = Database["public"]["Tables"]["questions"]["Row"];
export type QuestionImage = Database["public"]["Tables"]["question_images"]["Row"];
export type Choice = Database["public"]["Tables"]["choices"]["Row"];
export type QuizSession = Database["public"]["Tables"]["quiz_sessions"]["Row"];
export type QuizAnswer = Database["public"]["Tables"]["quiz_answers"]["Row"];
export type DailyStreak = Database["public"]["Tables"]["daily_streaks"]["Row"];
export type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];

// Composite types for quiz display
export interface QuestionWithChoices extends Question {
  choices: Choice[];
  images: QuestionImage[];
}

export interface CategoryWithStats extends Category {
  question_count: number;
}

export interface QuizSessionState {
  session: QuizSession;
  questions: QuestionWithChoices[];
  currentIndex: number;
  selectedChoiceId: string | null;
  showExplanation: boolean;
  isAnswered: boolean;
}

// Import schema types (for bulk import)
export interface ImportChoice {
  text: string;
  image_url?: string;
  is_correct: boolean;
}

export interface ImportImage {
  url: string;
  role: "main" | "explanation" | "choice";
  alt_text?: string;
}

export interface ImportQuestion {
  question_text: string;
  question_type: "text_only" | "image_based" | "label_image";
  difficulty: "easy" | "medium" | "hard";
  explanation: string;
  source?: string;
  metadata?: Record<string, unknown>;
  images: ImportImage[];
  choices: ImportChoice[];
}

export interface ImportData {
  category: string;
  category_slug?: string;
  category_description?: string;
  questions: ImportQuestion[];
}
