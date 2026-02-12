# 次回セッション用タスク: Supabase MCP でマイグレーション & データインポート

## 前提
- `.mcp.json` に Supabase MCP サーバーが設定済み
- セッション起動時に MCP ツール (`execute_sql` 等) が利用可能になるはず

## やること（順番通り）

### 1. MCP で DDL を実行
`supabase/migrations/004_reference_texts.sql` の内容を MCP の `execute_sql` で実行してください。

### 2. Python でデータインポート
```bash
python3 scripts/apply-migration-and-import.py
```
- Step 1: テーブル存在チェック（MCP で作成済みなのでスキップされる）
- Step 2: `scripts/data/reference-texts.json` → `reference_texts` テーブルへ INSERT
- Step 3: `scripts/data/unit*.json` 内の `reference_text_ids` → `question_reference_texts` へ関連付け

### 3. 確認
MCP で以下を実行して件数を確認:
```sql
SELECT count(*) FROM reference_texts;
SELECT count(*) FROM question_reference_texts;
```

## トラブルシューティング
- MCP 接続に認証が必要な場合: Supabase Dashboard でアクセストークンを発行し `.mcp.json` のURLに `&read_only=false` 等のパラメータを追加
- `execute_sql` ツールが見つからない場合: MCP サーバーの features パラメータに `database` が含まれていることを確認
- Python スクリプトのインポートが失敗する場合: `.env.local` に `SUPABASE_SERVICE_ROLE_KEY` が設定されていることを確認

## ブランチ
`claude/expand-anatomy-content-TOkAf` で作業中
