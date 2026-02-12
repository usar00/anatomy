export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          role: "guest" | "free" | "premium";
          created_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          role?: "guest" | "free" | "premium";
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          role?: "guest" | "free" | "premium";
          created_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          icon_url: string | null;
          sort_order: number;
          is_premium_only: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          icon_url?: string | null;
          sort_order?: number;
          is_premium_only?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          icon_url?: string | null;
          sort_order?: number;
          is_premium_only?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      questions: {
        Row: {
          id: string;
          category_id: string;
          section_id: string | null;
          question_text: string;
          question_type: "text_only" | "image_based" | "label_image";
          interaction_type: "standard_mcq" | "word_bank" | "matching_pairs" | "free_input";
          explanation: string | null;
          source: string | null;
          difficulty: "easy" | "medium" | "hard";
          metadata: Json | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          section_id?: string | null;
          question_text: string;
          question_type?: "text_only" | "image_based" | "label_image";
          interaction_type?: "standard_mcq" | "word_bank" | "matching_pairs" | "free_input";
          explanation?: string | null;
          source?: string | null;
          difficulty?: "easy" | "medium" | "hard";
          metadata?: Json | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          section_id?: string | null;
          question_text?: string;
          question_type?: "text_only" | "image_based" | "label_image";
          interaction_type?: "standard_mcq" | "word_bank" | "matching_pairs" | "free_input";
          explanation?: string | null;
          source?: string | null;
          difficulty?: "easy" | "medium" | "hard";
          metadata?: Json | null;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "questions_category_id_fkey";
            columns: ["category_id"];
            referencedRelation: "categories";
            referencedColumns: ["id"];
            isOneToOne: false;
          },
        ];
      };
      question_images: {
        Row: {
          id: string;
          question_id: string;
          image_url: string;
          image_role: "main" | "explanation" | "choice";
          alt_text: string | null;
          sort_order: number;
        };
        Insert: {
          id?: string;
          question_id: string;
          image_url: string;
          image_role?: "main" | "explanation" | "choice";
          alt_text?: string | null;
          sort_order?: number;
        };
        Update: {
          id?: string;
          question_id?: string;
          image_url?: string;
          image_role?: "main" | "explanation" | "choice";
          alt_text?: string | null;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "question_images_question_id_fkey";
            columns: ["question_id"];
            referencedRelation: "questions";
            referencedColumns: ["id"];
            isOneToOne: false;
          },
        ];
      };
      choices: {
        Row: {
          id: string;
          question_id: string;
          choice_text: string;
          choice_image_url: string | null;
          is_correct: boolean;
          sort_order: number;
        };
        Insert: {
          id?: string;
          question_id: string;
          choice_text: string;
          choice_image_url?: string | null;
          is_correct?: boolean;
          sort_order?: number;
        };
        Update: {
          id?: string;
          question_id?: string;
          choice_text?: string;
          choice_image_url?: string | null;
          is_correct?: boolean;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "choices_question_id_fkey";
            columns: ["question_id"];
            referencedRelation: "questions";
            referencedColumns: ["id"];
            isOneToOne: false;
          },
        ];
      };
      quiz_sessions: {
        Row: {
          id: string;
          user_id: string;
          category_id: string;
          mode: "normal" | "review" | "random" | "test";
          total_questions: number;
          answered_count: number;
          correct_count: number;
          status: "in_progress" | "completed" | "abandoned";
          started_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id: string;
          mode?: "normal" | "review" | "random" | "test";
          total_questions: number;
          answered_count?: number;
          correct_count?: number;
          status?: "in_progress" | "completed" | "abandoned";
          started_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string;
          mode?: "normal" | "review" | "random" | "test";
          total_questions?: number;
          answered_count?: number;
          correct_count?: number;
          status?: "in_progress" | "completed" | "abandoned";
          started_at?: string;
          completed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "quiz_sessions_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
            isOneToOne: false;
          },
          {
            foreignKeyName: "quiz_sessions_category_id_fkey";
            columns: ["category_id"];
            referencedRelation: "categories";
            referencedColumns: ["id"];
            isOneToOne: false;
          },
        ];
      };
      quiz_answers: {
        Row: {
          id: string;
          session_id: string;
          question_id: string;
          selected_choice_id: string | null;
          is_correct: boolean;
          response_time_ms: number | null;
          answered_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          question_id: string;
          selected_choice_id?: string | null;
          is_correct: boolean;
          response_time_ms?: number | null;
          answered_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          question_id?: string;
          selected_choice_id?: string | null;
          is_correct?: boolean;
          response_time_ms?: number | null;
          answered_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "quiz_answers_session_id_fkey";
            columns: ["session_id"];
            referencedRelation: "quiz_sessions";
            referencedColumns: ["id"];
            isOneToOne: false;
          },
          {
            foreignKeyName: "quiz_answers_question_id_fkey";
            columns: ["question_id"];
            referencedRelation: "questions";
            referencedColumns: ["id"];
            isOneToOne: false;
          },
          {
            foreignKeyName: "quiz_answers_selected_choice_id_fkey";
            columns: ["selected_choice_id"];
            referencedRelation: "choices";
            referencedColumns: ["id"];
            isOneToOne: false;
          },
        ];
      };
      daily_streaks: {
        Row: {
          id: string;
          user_id: string;
          study_date: string;
          questions_answered: number;
          correct_answers: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          study_date: string;
          questions_answered?: number;
          correct_answers?: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          study_date?: string;
          questions_answered?: number;
          correct_answers?: number;
        };
        Relationships: [
          {
            foreignKeyName: "daily_streaks_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
            isOneToOne: false;
          },
        ];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_customer_id: string;
          stripe_subscription_id: string;
          status: "active" | "canceled" | "past_due";
          plan_id: string;
          current_period_start: string;
          current_period_end: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_customer_id: string;
          stripe_subscription_id: string;
          status?: "active" | "canceled" | "past_due";
          plan_id: string;
          current_period_start: string;
          current_period_end: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          stripe_customer_id?: string;
          stripe_subscription_id?: string;
          status?: "active" | "canceled" | "past_due";
          plan_id?: string;
          current_period_start?: string;
          current_period_end?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
            isOneToOne: false;
          },
        ];
      };
      units: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          icon_url: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          icon_url?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          icon_url?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      sections: {
        Row: {
          id: string;
          unit_id: string;
          name: string;
          slug: string;
          description: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          unit_id: string;
          name: string;
          slug: string;
          description?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          unit_id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      concepts: {
        Row: {
          id: string;
          section_id: string;
          name: string;
          description: string | null;
          sort_order: number;
        };
        Insert: {
          id?: string;
          section_id: string;
          name: string;
          description?: string | null;
          sort_order?: number;
        };
        Update: {
          id?: string;
          section_id?: string;
          name?: string;
          description?: string | null;
          sort_order?: number;
        };
        Relationships: [];
      };
      user_section_progress: {
        Row: {
          id: string;
          user_id: string;
          section_id: string;
          status: "locked" | "available" | "in_progress" | "completed";
          stars: number;
          best_score: number;
          attempts: number;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          section_id: string;
          status?: "locked" | "available" | "in_progress" | "completed";
          stars?: number;
          best_score?: number;
          attempts?: number;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          section_id?: string;
          status?: "locked" | "available" | "in_progress" | "completed";
          stars?: number;
          best_score?: number;
          attempts?: number;
          completed_at?: string | null;
        };
        Relationships: [];
      };
      user_concept_mastery: {
        Row: {
          id: string;
          user_id: string;
          concept_id: string;
          mastery_level: number;
          times_correct: number;
          times_seen: number;
          last_seen_at: string | null;
          next_review_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          concept_id: string;
          mastery_level?: number;
          times_correct?: number;
          times_seen?: number;
          last_seen_at?: string | null;
          next_review_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          concept_id?: string;
          mastery_level?: number;
          times_correct?: number;
          times_seen?: number;
          last_seen_at?: string | null;
          next_review_at?: string | null;
        };
        Relationships: [];
      };
      reference_texts: {
        Row: {
          id: string;
          text_id: string;
          unit_slug: string;
          section_slug: string;
          title: string;
          body: string;
          key_terms: Json;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          text_id: string;
          unit_slug: string;
          section_slug: string;
          title: string;
          body: string;
          key_terms?: Json;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          text_id?: string;
          unit_slug?: string;
          section_slug?: string;
          title?: string;
          body?: string;
          key_terms?: Json;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      question_reference_texts: {
        Row: {
          question_id: string;
          reference_text_id: string;
          sort_order: number;
        };
        Insert: {
          question_id: string;
          reference_text_id: string;
          sort_order?: number;
        };
        Update: {
          question_id?: string;
          reference_text_id?: string;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "question_reference_texts_question_id_fkey";
            columns: ["question_id"];
            referencedRelation: "questions";
            referencedColumns: ["id"];
            isOneToOne: false;
          },
          {
            foreignKeyName: "question_reference_texts_reference_text_id_fkey";
            columns: ["reference_text_id"];
            referencedRelation: "reference_texts";
            referencedColumns: ["id"];
            isOneToOne: false;
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
