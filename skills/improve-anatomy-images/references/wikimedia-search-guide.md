# Wikimedia Commons 画像検索ガイド

## 推奨ソース（品質順）

### 1. Blausen Medical (CC BY 3.0)
3D医学イラスト。ラベル付き、高品質。
- 検索: `Blausen <anatomical term>` on Wikimedia Commons
- 例: `Blausen_0229_ClassificationofBones.png`
- カテゴリ: https://commons.wikimedia.org/wiki/Category:Blausen_Medical_images

### 2. OpenStax Anatomy (CC BY 3.0)
教科書品質の図。番号付き、ラベル付き。
- 検索: `OpenStax <anatomical term>` or `<3-digit number> Anatomy`
- 例: `603_Anatomy_of_Long_Bone.jpg`
- カテゴリ: https://commons.wikimedia.org/wiki/Category:Anatomy_%26_Physiology_(OpenStax)

### 3. Gray's Anatomy Plates (Public Domain)
1918年版の古典的解剖図。
- 検索: `Gray <plate number>` or `Gray's Anatomy <term>`
- 例: `Gray_111_-_Vertebral_column-coloured.png`
- カテゴリ: https://commons.wikimedia.org/wiki/Category:Gray%27s_Anatomy_plates

### 4. LadyofHats / Mariana Ruiz (Public Domain)
シンプルで明瞭なSVGダイアグラム。
- 検索: `LadyofHats <anatomical term>`
- 例: `Human_arm_bones_diagram.svg`

## 検索戦略

1. **英語の解剖学用語で検索**: 日本語では画像が少ないため
2. **カテゴリブラウズ**: `Category:Bones of the human <body part>`
3. **ライセンスフィルタ**: 検索時に "Only public domain" または "CC BY" でフィルタ

## ライセンス要件

| ライセンス | 使用可否 | 帰属表示 |
|---|---|---|
| Public Domain | OK | 不要（推奨） |
| CC BY 3.0 | OK | 必須 |
| CC BY-SA | 要検討 | 必須 + SA条件 |
| CC BY-NC | NG | 商用利用不可 |
| その他 | NG | - |

## ファイル命名規則

Wikimediaのファイル名から変換:
```
Blausen_0229_ClassificationofBones.png → bone-classification-types.png
Gray_111_-_Vertebral_column-coloured.png → vertebral-column-colored.png
Human_arm_bones_diagram.svg → upper-limb-bones-labeled.svg
```

ルール:
- kebab-case（小文字・ハイフン区切り）
- 内容を表す説明的な名前
- `-labeled` サフィックス: ラベル付き画像
- 拡張子はオリジナルを維持（PNG/JPG/SVG）
