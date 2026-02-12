# REST API フォールバック手順

Node.js の `fetch` が DNS 解決に失敗する環境では、curl で Supabase REST API を直接使用する。

## 環境変数

```bash
SB_URL="$NEXT_PUBLIC_SUPABASE_URL"
SB_KEY="$SUPABASE_SERVICE_ROLE_KEY"
```

## 共通ヘッダー

```bash
-H "apikey: $SB_KEY" \
-H "Authorization: Bearer $SB_KEY" \
-H "Content-Type: application/json" \
-H "Prefer: return=representation"
```

## データ確認

```bash
# カテゴリ一覧
curl -s "$SB_URL/rest/v1/categories?select=id,name,slug" \
  -H "apikey: $SB_KEY" -H "Authorization: Bearer $SB_KEY"

# セクション一覧（ユニットslugで絞り込み）
curl -s "$SB_URL/rest/v1/sections?select=id,slug,unit_id,units!inner(slug)&units.slug=eq.<unit-slug>" \
  -H "apikey: $SB_KEY" -H "Authorization: Bearer $SB_KEY"

# 問題の画像参照を確認
curl -s "$SB_URL/rest/v1/question_images?select=image_url,image_role&order=image_url" \
  -H "apikey: $SB_KEY" -H "Authorization: Bearer $SB_KEY"
```

## 問題の削除と再インポート

Python スクリプトで REST API 経由のインポートを行う:

```python
import json, urllib.request, urllib.parse, os

SB_URL = os.environ["NEXT_PUBLIC_SUPABASE_URL"]
SB_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

def sb_request(method, table, params="", body=None):
    url = f"{SB_URL}/rest/v1/{table}"
    if params:
        url += f"?{params}"
    headers = {
        "apikey": SB_KEY,
        "Authorization": f"Bearer {SB_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    with urllib.request.urlopen(req) as resp:
        result = resp.read().decode()
        return json.loads(result) if result else []
```

## 削除順序（外部キー制約）

1. `question_images` — 画像参照
2. `choices` — 選択肢
3. `question_concepts` — コンセプト紐付け
4. `questions` — 問題本体

```bash
# 例: セクション内の全問題を削除
QUESTION_IDS=$(curl -s "$SB_URL/rest/v1/questions?section_id=eq.<section-id>&select=id" \
  -H "apikey: $SB_KEY" -H "Authorization: Bearer $SB_KEY" | python3 -c "
import json,sys; ids=json.load(sys.stdin); print(','.join('\"'+q['id']+'\"' for q in ids))")

curl -s "$SB_URL/rest/v1/question_images?question_id=in.($QUESTION_IDS)" \
  -X DELETE -H "apikey: $SB_KEY" -H "Authorization: Bearer $SB_KEY"
curl -s "$SB_URL/rest/v1/choices?question_id=in.($QUESTION_IDS)" \
  -X DELETE -H "apikey: $SB_KEY" -H "Authorization: Bearer $SB_KEY"
curl -s "$SB_URL/rest/v1/question_concepts?question_id=in.($QUESTION_IDS)" \
  -X DELETE -H "apikey: $SB_KEY" -H "Authorization: Bearer $SB_KEY"
curl -s "$SB_URL/rest/v1/questions?id=in.($QUESTION_IDS)" \
  -X DELETE -H "apikey: $SB_KEY" -H "Authorization: Bearer $SB_KEY"
```
