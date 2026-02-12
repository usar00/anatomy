# カリキュラム設計書 — Gray's Anatomy 準拠

## 概要

本カリキュラムは **Gray's Anatomy** の章立てに沿い、人体の解剖学を体系的に学習できるよう設計する。
Duolingo スタイルの学習パスとして、各ユニットは独立したテーマを持ち、セクション → コンセプト → 問題の階層で構成される。

## 全体構成（ユニット一覧）

Gray's Anatomy の Part 構成に対応させて以下のユニットを設計する。

| # | ユニット名 | slug | Gray's 対応 | 状態 |
|---|-----------|------|------------|------|
| 1 | 骨格系の基礎 | `skeletal-basics` | Part II: Osteology | ✅ 実装済 |
| 2 | 関節学 | `arthrology` | Part III: Syndesmology | 🆕 今回追加 |
| 3 | 筋学の基礎 | `myology-basics` | Part IV: Myology | 🆕 今回追加 |
| 4 | 循環器系 | `cardiovascular` | Part V-VII: Angiology | 📋 将来 |
| 5 | リンパ系と免疫 | `lymphatic` | Part VIII: Lymphatic | 📋 将来 |
| 6 | 神経系の基礎 | `nervous-basics` | Part IX: Neurology | 📋 将来 |
| 7 | 感覚器系 | `sensory` | Part X: Organs of Senses | 📋 将来 |
| 8 | 呼吸器系 | `respiratory` | Part XI: Splanchnology | 📋 将来 |
| 9 | 消化器系 | `digestive` | Part XI: Splanchnology | 📋 将来 |
| 10 | 泌尿器系 | `urinary` | Part XI: Splanchnology | 📋 将来 |
| 11 | 内分泌系 | `endocrine` | Part XI: Splanchnology | 📋 将来 |
| 12 | 生殖器系 | `reproductive` | Part XI: Splanchnology | 📋 将来 |
| 13 | 外皮系 | `integumentary` | — | 📋 将来 |
| 14 | 体表解剖学 | `surface-anatomy` | Part XII: Surface Anatomy | 📋 将来 |

---

## Unit 1: 骨格系の基礎（実装済・解説拡充対象）

**Gray's Anatomy 対応:** Part II — Osteology

### セクション構成

| # | セクション | slug | コンセプト数 | 問題数 |
|---|-----------|------|------------|--------|
| 1 | 骨の分類 | `bone-classification` | 5 | 8 |
| 2 | 骨の構造 | `bone-structure` | 4 | 9 |
| 3 | 体幹の骨格 | `axial-skeleton` | 4 | 8 |
| 4 | 四肢の骨格（上肢） | `upper-limb` | 4 | 8 |
| 5 | 四肢の骨格（下肢） | `lower-limb` | 4 | 6 |

**改善点:**
- 全問題の解説を2-3倍に拡充（基礎概念からの説明、臨床的意義、関連構造への言及）
- 画像のない問題にWikimedia Commons画像を追加
- 下肢セクションに2問追加して他セクションと問題数を揃える

---

## Unit 2: 関節学（新規追加）

**Gray's Anatomy 対応:** Part III — Syndesmology (Arthrology)

### セクション構成

| # | セクション | slug | コンセプト | 問題数目標 |
|---|-----------|------|----------|-----------|
| 1 | 関節の分類 | `joint-classification` | 線維性関節、軟骨性関節、滑膜性関節、不動関節・半関節・可動関節 | 8 |
| 2 | 滑膜性関節の構造 | `synovial-joint-structure` | 関節包、滑膜、関節軟骨、滑液、靭帯 | 8 |
| 3 | 滑膜性関節の種類 | `synovial-joint-types` | 球関節、蝶番関節、車軸関節、鞍関節、楕円関節、平面関節 | 8 |
| 4 | 上肢の主要関節 | `upper-limb-joints` | 肩関節、肘関節、手関節、橈尺関節 | 8 |
| 5 | 下肢の主要関節 | `lower-limb-joints` | 股関節、膝関節、足関節、仙腸関節 | 8 |

### 学習目標
- 関節の3つの構造的分類（線維性・軟骨性・滑膜性）を理解する
- 滑膜性関節の基本構造（関節包、滑膜、関節軟骨、滑液）を説明できる
- 6種類の滑膜性関節とその運動軸を区別できる
- 上肢・下肢の主要関節の種類と特徴を覚える

### 使用画像（Wikimedia Commons）
- 関節の分類図（線維性・軟骨性・滑膜性）
- 滑膜性関節の断面図
- 6種類の滑膜性関節の比較図
- 膝関節の解剖図
- 股関節の解剖図
- 肩関節の解剖図

---

## Unit 3: 筋学の基礎（新規追加）

**Gray's Anatomy 対応:** Part IV — Myology

### セクション構成

| # | セクション | slug | コンセプト | 問題数目標 |
|---|-----------|------|----------|-----------|
| 1 | 筋組織の分類と構造 | `muscle-tissue-types` | 骨格筋、心筋、平滑筋、筋線維、サルコメア | 8 |
| 2 | 骨格筋の機能 | `skeletal-muscle-function` | 筋収縮の仕組み、主動筋・拮抗筋・協力筋、起始と停止、筋の付着 | 8 |
| 3 | 頭頸部の筋 | `head-neck-muscles` | 咀嚼筋群、表情筋群、胸鎖乳突筋、僧帽筋 | 8 |
| 4 | 体幹の筋 | `trunk-muscles` | 腹直筋、外腹斜筋、内腹斜筋・腹横筋、脊柱起立筋、横隔膜 | 8 |
| 5 | 上肢の筋 | `upper-limb-muscles` | 三角筋、上腕二頭筋、上腕三頭筋、前腕の屈筋群・伸筋群 | 8 |
| 6 | 下肢の筋 | `lower-limb-muscles` | 大腿四頭筋、ハムストリングス、大殿筋、下腿三頭筋 | 8 |

### 学習目標
- 3種類の筋組織（骨格筋・心筋・平滑筋）の構造的・機能的違いを理解する
- 骨格筋の微細構造（筋原線維、サルコメア、アクチン・ミオシン）を説明できる
- 主動筋・拮抗筋・協力筋の概念を理解する
- 主要な骨格筋の名称、起始・停止、作用を覚える

### 使用画像（Wikimedia Commons）
- 3種類の筋組織の顕微鏡像
- 骨格筋の階層構造図（筋束→筋線維→筋原線維→サルコメア）
- 人体前面・後面の筋肉図
- サルコメアの構造とスライディング・フィラメント理論
- 主要な個別筋の解剖図

---

## 解説の拡充方針

### 現状の問題点
- 解説が1-2文で短すぎる（例: 「大腿骨は人体で最も長い骨であり、長さが幅より大きいため「長骨」に分類される。」）
- 基礎的な前提知識の説明がない
- 臨床的な関連や覚え方のヒントが少ない

### 拡充後の解説テンプレート

```
[正解の説明]（なぜその答えが正しいのか）
[基礎概念の説明]（関連する解剖学の基本知識）
[関連構造・機能]（周辺の構造や機能との関連）
[臨床的意義 or 覚え方のヒント]（実用的な知識や暗記法）
[英語用語]（解剖学の国際標準名称）
```

### 拡充例

**Before（現状）:**
> 大腿骨は人体で最も長い骨であり、長さが幅より大きいため「長骨」に分類される。Gray's Anatomy, Chapter 6: Osteology

**After（拡充後）:**
> 大腿骨（femur）は人体で最も長く、最も強い骨であり、「長骨（long bone）」に分類される。長骨とは、長さが幅より明らかに大きい管状の骨のことで、骨幹（diaphysis）と両端の骨端（epiphysis）からなる。大腿骨は身長の約4分の1の長さがあり、体重を支えながら歩行や走行の力を伝達する。大腿骨の近位端には大腿骨頭があり股関節を形成し、遠位端は脛骨と膝関節を形成する。他の長骨の例としては上腕骨（humerus）、橈骨（radius）、尺骨（ulna）、脛骨（tibia）、腓骨（fibula）がある。臨床的に大腿骨頸部骨折は高齢者に多く、転倒時の重要な骨折部位として知られる。

---

## 問題設計の原則

### 難易度配分
- **easy (30%):** 基本的な名称・分類の識別
- **medium (50%):** 構造と機能の関連、複数の知識の統合
- **hard (20%):** 臨床応用、英語用語、詳細な解剖学的関係

### インタラクションタイプの配分（各セクション8問の場合）
- `standard_mcq`: 4-5問（基本の4択）
- `word_bank`: 1問（穴埋め）
- `matching_pairs`: 1問（マッチング）
- `free_input`: 1-2問（自由入力）

### 画像の活用方針
- 各セクションに最低1問は `image_based` 問題を含める
- `main` 画像: クイズ中に表示（英語ラベル付き解剖図を優先）
- `explanation` 画像: 解説時に表示（より詳細なラベル付き図）
- 画像ソース: Wikimedia Commons（Public Domain / CC BY 3.0 / CC BY 4.0）
- 画像の帰属情報は `public/images/anatomy/ATTRIBUTIONS.md` に必ず記載

---

## ファイル構成

```
scripts/data/
├── unit1-skeletal-basics.json      # 既存（解説拡充）
├── unit2-arthrology.json           # 新規
├── unit3-myology-basics.json       # 新規
└── musculoskeletal-sample.json     # 既存（フラット形式）

public/images/anatomy/
├── ATTRIBUTIONS.md                 # 画像帰属情報
├── (既存画像 7点)
├── joint-types-classification.png  # 関節分類図
├── synovial-joint-structure.png    # 滑膜性関節の構造
├── synovial-joint-types.png        # 6種類の滑膜性関節
├── knee-joint-anatomy.png          # 膝関節
├── hip-joint-anatomy.png           # 股関節
├── muscle-tissue-types.jpg         # 3種の筋組織
├── skeletal-muscle-structure.png   # 骨格筋の構造
├── anterior-muscles.png            # 人体前面の筋
├── posterior-muscles.png           # 人体後面の筋
└── ...
```

---

## 今回の実装スコープ

1. ✅ カリキュラム設計書作成（本ドキュメント）
2. 🔨 Unit 1 の解説拡充（全40問 → 解説を2-3倍に、画像追加）
3. 🔨 Unit 2（関節学）の全セクション・問題作成（5セクション×8問 = 40問）
4. 🔨 Unit 3（筋学の基礎）の全セクション・問題作成（6セクション×8問 = 48問）
5. 🔨 Wikimedia Commons 画像の収集・配置・帰属情報更新
6. 🔨 CLAUDE.md へのカリキュラム情報追記
