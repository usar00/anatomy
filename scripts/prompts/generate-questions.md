# 解剖学クイズ問題 生成プロンプト

以下のJSON形式で、解剖学の4択クイズ問題を生成してください。

## 出力形式

```json
{
  "category": "カテゴリ名",
  "category_slug": "英語のスラッグ（小文字・ハイフン区切り）",
  "category_description": "カテゴリの簡単な説明",
  "questions": [
    {
      "question_text": "問題文をここに書く",
      "question_type": "text_only",
      "difficulty": "medium",
      "explanation": "正解の詳しい解説をここに書く。なぜその答えが正しいのか、関連する解剖学的知識も含めて説明する。",
      "source": "OpenStax Anatomy and Physiology",
      "metadata": {
        "tags": ["関連するタグ"],
        "subcategory": "サブカテゴリ（任意）"
      },
      "images": [],
      "choices": [
        { "text": "正解の選択肢", "is_correct": true },
        { "text": "不正解の選択肢1", "is_correct": false },
        { "text": "不正解の選択肢2", "is_correct": false },
        { "text": "不正解の選択肢3", "is_correct": false }
      ]
    }
  ]
}
```

## ルール

1. **問題数**: 1回につき10〜30問程度を目安に生成してください
2. **選択肢**: 必ず4つの選択肢を用意し、正解は1つだけ`"is_correct": true`にしてください
3. **難易度のバランス**: easy(30%), medium(50%), hard(20%)の割合を目安にしてください
4. **解説**: 各問題に必ず解説を付けてください。「なぜ正解がその答えなのか」「他の選択肢がなぜ不正解なのか」を説明すると学習効果が高まります
5. **question_type**: 
   - `text_only`: テキストのみの問題（画像なし）→ imagesは空配列`[]`にしてください
   - `image_based`: 画像を見て答える問題 → imagesに画像情報を入れてください（画像ファイルは別途用意が必要）
6. **出典**: 可能であれば出典を記載してください
7. **正確性**: 医学的に正確な情報のみを使用してください

## カテゴリ一覧（参考）

- 筋骨格系 (musculoskeletal) - 骨格、関節、筋肉
- 循環器系 (cardiovascular) - 心臓、血管、血液循環
- 神経系 (nervous) - 脳、脊髄、末梢神経
- 呼吸器系 (respiratory) - 肺、気道
- 消化器系 (digestive) - 消化管、消化腺
- 泌尿器系 (urinary) - 腎臓、膀胱
- 内分泌系 (endocrine) - ホルモン、内分泌腺
- 生殖器系 (reproductive) - 男性・女性生殖器
- 外皮系 (integumentary) - 皮膚、毛、爪
- リンパ系 (lymphatic) - リンパ節、免疫
- 感覚器系 (sensory) - 目、耳、味覚、嗅覚

## 画像付き問題の場合

画像付き問題を作成する場合は、以下のように`images`フィールドにファイル名を指定してください。
実際の画像ファイルは別途Supabase Storageにアップロードします。

```json
{
  "question_text": "この画像で矢印が示している構造の名称は？",
  "question_type": "image_based",
  "images": [
    {
      "url": "heart_anterior_view.png",
      "role": "main",
      "alt_text": "心臓の前面図。矢印が左心室を指している"
    }
  ],
  "choices": [...]
}
```

## リクエスト例

「筋骨格系の問題を20問、主に上肢の筋肉に関する問題を生成してください」
「循環器系の初級〜中級問題を15問生成してください」
「神経系の脳神経に関する問題を10問、上級者向けで生成してください」
