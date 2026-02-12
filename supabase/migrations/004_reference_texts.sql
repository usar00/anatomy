-- 004_reference_texts.sql
-- 基礎テキスト（セクションの全体像・専門用語解説）を格納するテーブル
-- 問題の解説画面で表示し、初学者の理解を支援する

-- ===========================================
-- reference_texts: 基礎テキスト本体
-- ===========================================
CREATE TABLE reference_texts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text_id TEXT UNIQUE NOT NULL,          -- アプリ内の一意識別子 (例: "bone-five-types")
  unit_slug TEXT NOT NULL,               -- 所属ユニット (例: "skeletal-basics")
  section_slug TEXT NOT NULL,            -- 所属セクション (例: "bone-classification")
  title TEXT NOT NULL,                   -- 表示タイトル (例: "骨の5つの分類")
  body TEXT NOT NULL,                    -- 本文（Markdown対応）
  key_terms JSONB DEFAULT '[]'::jsonb,   -- 用語集 [{term, english, definition}]
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- text_id での検索用
CREATE INDEX idx_reference_texts_text_id ON reference_texts (text_id);
-- ユニット・セクション別の取得用
CREATE INDEX idx_reference_texts_unit_section ON reference_texts (unit_slug, section_slug);

-- ===========================================
-- question_reference_texts: 問題 ↔ テキストの多対多関係
-- ===========================================
CREATE TABLE question_reference_texts (
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  reference_text_id UUID NOT NULL REFERENCES reference_texts(id) ON DELETE CASCADE,
  sort_order INT DEFAULT 0,
  PRIMARY KEY (question_id, reference_text_id)
);

CREATE INDEX idx_question_reference_texts_question ON question_reference_texts (question_id);
CREATE INDEX idx_question_reference_texts_ref ON question_reference_texts (reference_text_id);

-- ===========================================
-- RLS ポリシー
-- ===========================================
ALTER TABLE reference_texts ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_reference_texts ENABLE ROW LEVEL SECURITY;

-- 基礎テキストは全ユーザーが閲覧可能（コンテンツテーブル）
CREATE POLICY "reference_texts_public_read"
  ON reference_texts FOR SELECT
  USING (true);

-- 問題-テキスト関連も全ユーザーが閲覧可能
CREATE POLICY "question_reference_texts_public_read"
  ON question_reference_texts FOR SELECT
  USING (true);
