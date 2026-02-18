-- ============================================================
-- 005: profiles テーブルの role カラム更新を制限
-- クライアントからの role 直接変更による権限昇格を防止する
-- ============================================================

-- 既存の更新ポリシーを削除
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- role カラムの変更を禁止する新しい更新ポリシー
-- ユーザーは自身のプロフィール（display_name, avatar_url）を更新できるが、
-- role の値は変更できない（変更前と同じ値でなければならない）
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT p.role FROM profiles p WHERE p.id = auth.uid())
  );
