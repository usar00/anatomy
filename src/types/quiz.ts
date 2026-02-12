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
export type Unit = Database["public"]["Tables"]["units"]["Row"];
export type Section = Database["public"]["Tables"]["sections"]["Row"];
export type Concept = Database["public"]["Tables"]["concepts"]["Row"];
export type UserSectionProgress = Database["public"]["Tables"]["user_section_progress"]["Row"];
export type UserConceptMastery = Database["public"]["Tables"]["user_concept_mastery"]["Row"];
export type ReferenceText = Database["public"]["Tables"]["reference_texts"]["Row"];

// 基礎テキストの用語
export interface KeyTerm {
  term: string;
  english: string;
  definition: string;
}

// Interaction types
export type InteractionType = "standard_mcq" | "word_bank" | "matching_pairs" | "free_input";

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

// Learning path types
export interface SectionWithProgress extends Section {
  progress: UserSectionProgress | null;
  concepts: Concept[];
}

export interface UnitWithSections extends Unit {
  sections: SectionWithProgress[];
}

export interface LessonQuestion extends QuestionWithChoices {
  interaction_type: InteractionType;
  concepts: Concept[];
  referenceTexts: ReferenceText[];
}

// Word bank metadata
export interface WordBankMeta {
  template: string; // e.g. "上腕骨は {{blank}} に分類される"
  distractors?: string[]; // extra wrong options
}

// Matching pairs metadata
export interface MatchingPairsMeta {
  pairs: { left: string; right: string }[];
}

// Free input metadata
export interface FreeInputMeta {
  accepted_answers: string[];
  hint?: string;
}

// Character states
export type CharacterState = "idle" | "happy" | "encouraging" | "thinking" | "celebrating" | "comforting";
