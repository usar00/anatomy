# Question Image Schema

## JSON内の画像定義

問題JSONの `images` 配列で画像を指定する:

```json
{
  "question_text": "図中の「Compact bone」に相当する日本語名称は？",
  "interaction_type": "standard_mcq",
  "question_type": "image_based",
  "difficulty": "medium",
  "explanation": "Compact bone（緻密骨）は骨の外層を構成する...",
  "images": [
    {
      "url": "/images/anatomy/long-bone-anatomy.jpg",
      "role": "main",
      "alt_text": "長骨の構造図。Epiphysis、Diaphysis、Compact bone、Spongy bone等が英語で標記"
    },
    {
      "url": "/images/anatomy/long-bone-anatomy-labeled.jpg",
      "role": "explanation",
      "alt_text": "長骨の詳細な構造図。各部位が番号付きで解説されている"
    }
  ],
  "choices": [...]
}
```

## フィールド定義

| フィールド | 必須 | 説明 |
|---|---|---|
| `url` | Yes | `/images/anatomy/` からの相対パス |
| `role` | Yes | `main`（出題時）/ `explanation`（解説時）/ `choice`（選択肢） |
| `alt_text` | Yes | 画像の日本語説明。英語ラベルも括弧書きで含める |

## question_type の設定

- `text_only` — 画像なしの問題
- `image_based` — 画像付きの問題（`images` 配列が必要）

## alt_text のガイドライン

画像内容を正確に記述し、英語ラベルも含める:

```
"alt_text": "骨の5つの分類を示す医学図。Long Bone（長骨）、Short Bone（短骨）、Flat Bone（扁平骨）、Irregular Bone（不規則骨）、Sesamoid Bone（種子骨）の代表例がそれぞれ描かれている"
```

## 画像の使い分け

### main（出題時表示）
- 問題に必要な情報を含む画像
- 英語ラベルが見える全体図が望ましい
- 問題文で `図中の「<English label>」` と参照

### explanation（解説時表示）
- より詳細・高解像度な画像
- OpenStaxの番号付き図などが適切
- main と同じ画像でもよい（ない場合は省略可）

### choice（選択肢画像）
- 各選択肢に個別画像がある場合
- `choices` 内の `image_url` で指定
