-- ============================================================
-- Anatomy Quiz - Initial Database Schema
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. profiles
-- ============================================================
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url  TEXT,
  role        TEXT NOT NULL DEFAULT 'guest' CHECK (role IN ('guest', 'free', 'premium')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'ゲスト'),
    NEW.raw_user_meta_data->>'avatar_url',
    CASE
      WHEN NEW.is_anonymous = true THEN 'guest'
      ELSE 'free'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. categories
-- ============================================================
CREATE TABLE categories (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  description     TEXT,
  icon_url        TEXT,
  sort_order      INT NOT NULL DEFAULT 0,
  is_premium_only BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. questions
-- ============================================================
CREATE TABLE questions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id   UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'text_only'
                CHECK (question_type IN ('text_only', 'image_based', 'label_image')),
  explanation   TEXT,
  source        TEXT,
  difficulty    TEXT NOT NULL DEFAULT 'medium'
                CHECK (difficulty IN ('easy', 'medium', 'hard')),
  metadata      JSONB,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_questions_category ON questions(category_id);
CREATE INDEX idx_questions_active ON questions(is_active) WHERE is_active = true;

-- ============================================================
-- 4. question_images
-- ============================================================
CREATE TABLE question_images (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  image_url   TEXT NOT NULL,
  image_role  TEXT NOT NULL DEFAULT 'main'
              CHECK (image_role IN ('main', 'explanation', 'choice')),
  alt_text    TEXT,
  sort_order  INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_question_images_question ON question_images(question_id);

-- ============================================================
-- 5. choices
-- ============================================================
CREATE TABLE choices (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id     UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  choice_text     TEXT NOT NULL,
  choice_image_url TEXT,
  is_correct      BOOLEAN NOT NULL DEFAULT false,
  sort_order      INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_choices_question ON choices(question_id);

-- ============================================================
-- 6. quiz_sessions
-- ============================================================
CREATE TABLE quiz_sessions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id     UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  mode            TEXT NOT NULL DEFAULT 'normal'
                  CHECK (mode IN ('normal', 'review', 'random', 'test')),
  total_questions INT NOT NULL,
  answered_count  INT NOT NULL DEFAULT 0,
  correct_count   INT NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'in_progress'
                  CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ
);

CREATE INDEX idx_quiz_sessions_user ON quiz_sessions(user_id);
CREATE INDEX idx_quiz_sessions_status ON quiz_sessions(status);

-- ============================================================
-- 7. quiz_answers
-- ============================================================
CREATE TABLE quiz_answers (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id        UUID NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  question_id       UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  selected_choice_id UUID REFERENCES choices(id) ON DELETE SET NULL,
  is_correct        BOOLEAN NOT NULL,
  response_time_ms  INT,
  answered_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quiz_answers_session ON quiz_answers(session_id);
CREATE INDEX idx_quiz_answers_question ON quiz_answers(question_id);

-- ============================================================
-- 8. daily_streaks
-- ============================================================
CREATE TABLE daily_streaks (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  study_date        DATE NOT NULL,
  questions_answered INT NOT NULL DEFAULT 0,
  correct_answers   INT NOT NULL DEFAULT 0,
  UNIQUE(user_id, study_date)
);

CREATE INDEX idx_daily_streaks_user ON daily_streaks(user_id);

-- ============================================================
-- 9. subscriptions
-- ============================================================
CREATE TABLE subscriptions (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_customer_id      TEXT NOT NULL,
  stripe_subscription_id  TEXT NOT NULL UNIQUE,
  status                  TEXT NOT NULL DEFAULT 'active'
                          CHECK (status IN ('active', 'canceled', 'past_due')),
  plan_id                 TEXT NOT NULL,
  current_period_start    TIMESTAMPTZ NOT NULL,
  current_period_end      TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- profiles: own record full access, others read display_name only
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- categories: public read
CREATE POLICY "Anyone can read categories"
  ON categories FOR SELECT
  USING (true);

-- questions: public read (active only)
CREATE POLICY "Anyone can read active questions"
  ON questions FOR SELECT
  USING (is_active = true);

-- question_images: public read
CREATE POLICY "Anyone can read question images"
  ON question_images FOR SELECT
  USING (true);

-- choices: public read
CREATE POLICY "Anyone can read choices"
  ON choices FOR SELECT
  USING (true);

-- quiz_sessions: own records only
CREATE POLICY "Users can read own sessions"
  ON quiz_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions"
  ON quiz_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON quiz_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- quiz_answers: own records only
CREATE POLICY "Users can read own answers"
  ON quiz_answers FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM quiz_sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own answers"
  ON quiz_answers FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT id FROM quiz_sessions WHERE user_id = auth.uid()
    )
  );

-- daily_streaks: own records only
CREATE POLICY "Users can read own streaks"
  ON daily_streaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streaks"
  ON daily_streaks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks"
  ON daily_streaks FOR UPDATE
  USING (auth.uid() = user_id);

-- subscriptions: own records (read only via client)
CREATE POLICY "Users can read own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);
