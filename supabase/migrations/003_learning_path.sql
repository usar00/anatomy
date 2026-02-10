-- ============================================================
-- Phase 3: Learning Path (Duolingo-style)
-- ============================================================

-- ============================================================
-- 1. units (大テーマ)
-- ============================================================
CREATE TABLE units (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  description TEXT,
  icon_url    TEXT,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. sections (小テーマ、5-7問のレッスン単位)
-- ============================================================
CREATE TABLE sections (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unit_id     UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL,
  description TEXT,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sections_unit ON sections(unit_id);

-- ============================================================
-- 3. concepts (1つの知識単位)
-- ============================================================
CREATE TABLE concepts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id  UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  sort_order  INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_concepts_section ON concepts(section_id);

-- ============================================================
-- 4. question_concepts (問題とコンセプトの多対多)
-- ============================================================
CREATE TABLE question_concepts (
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  concept_id  UUID NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
  PRIMARY KEY (question_id, concept_id)
);

-- ============================================================
-- 5. questions に interaction_type と section_id を追加
-- ============================================================
ALTER TABLE questions
  ADD COLUMN interaction_type TEXT NOT NULL DEFAULT 'standard_mcq'
    CHECK (interaction_type IN ('standard_mcq', 'word_bank', 'matching_pairs', 'free_input'));

ALTER TABLE questions
  ADD COLUMN section_id UUID REFERENCES sections(id) ON DELETE SET NULL;

CREATE INDEX idx_questions_section ON questions(section_id);

-- ============================================================
-- 6. user_section_progress (セクション別進捗)
-- ============================================================
CREATE TABLE user_section_progress (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  section_id   UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  status       TEXT NOT NULL DEFAULT 'locked'
               CHECK (status IN ('locked', 'available', 'in_progress', 'completed')),
  stars        INT NOT NULL DEFAULT 0 CHECK (stars BETWEEN 0 AND 3),
  best_score   INT NOT NULL DEFAULT 0,
  attempts     INT NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  UNIQUE (user_id, section_id)
);

CREATE INDEX idx_user_section_progress_user ON user_section_progress(user_id);

-- ============================================================
-- 7. user_concept_mastery (コンセプト別習熟度)
-- ============================================================
CREATE TABLE user_concept_mastery (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  concept_id    UUID NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
  mastery_level INT NOT NULL DEFAULT 0 CHECK (mastery_level BETWEEN 0 AND 5),
  times_correct INT NOT NULL DEFAULT 0,
  times_seen    INT NOT NULL DEFAULT 0,
  last_seen_at  TIMESTAMPTZ,
  next_review_at TIMESTAMPTZ,
  UNIQUE (user_id, concept_id)
);

CREATE INDEX idx_user_concept_mastery_user ON user_concept_mastery(user_id);
CREATE INDEX idx_user_concept_mastery_review ON user_concept_mastery(next_review_at);

-- ============================================================
-- quiz_answers: free_input 用に answer_text を追加
-- ============================================================
ALTER TABLE quiz_answers
  ADD COLUMN answer_text TEXT;

-- ============================================================
-- Row Level Security
-- ============================================================

-- Public read tables
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE concepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_concepts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read units"
  ON units FOR SELECT USING (true);

CREATE POLICY "Anyone can read sections"
  ON sections FOR SELECT USING (true);

CREATE POLICY "Anyone can read concepts"
  ON concepts FOR SELECT USING (true);

CREATE POLICY "Anyone can read question_concepts"
  ON question_concepts FOR SELECT USING (true);

-- User progress tables
ALTER TABLE user_section_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_concept_mastery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own section progress"
  ON user_section_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own section progress"
  ON user_section_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own section progress"
  ON user_section_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read own concept mastery"
  ON user_concept_mastery FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own concept mastery"
  ON user_concept_mastery FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own concept mastery"
  ON user_concept_mastery FOR UPDATE
  USING (auth.uid() = user_id);
