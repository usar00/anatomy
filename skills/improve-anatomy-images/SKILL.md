---
name: improve-anatomy-images
description: Improve anatomy quiz image quality by sourcing high-quality images from Wikimedia Commons, optimizing them, updating question data JSON, and importing to the database. Use when adding or replacing anatomy images for quiz questions, updating image references in learning path JSON files, or improving visual quality of existing questions.
---

# Improve Anatomy Images

Replace placeholder or low-quality images with high-quality Wikimedia Commons images for anatomy quiz questions.

## Workflow

### 1. Identify Images to Improve

Audit the current state:

```bash
# 現在の画像ファイル一覧
ls -la public/images/anatomy/

# JSON内の画像参照を確認
grep -n '"images"' scripts/data/*.json -A 4

# 帰属情報を確認
cat public/images/anatomy/ATTRIBUTIONS.md
```

### 2. Source Images from Wikimedia Commons

See [references/wikimedia-search-guide.md](references/wikimedia-search-guide.md) for detailed search strategies.

Key requirements:
- **License:** Public Domain or CC BY 3.0 only
- **Quality:** Prefer labeled medical illustrations (Blausen Medical, OpenStax, Gray's Anatomy plates)
- **Labels:** Images with English anatomical labels are ideal (supports bilingual learning)
- **Resolution:** At least 800px wide for main images

### 3. Download and Optimize

Use the optimization script:

```bash
# 単一画像の最適化（1200px幅、品質85）
python3 skills/improve-anatomy-images/scripts/optimize-image.py <input> <output>

# カスタムサイズ
python3 skills/improve-anatomy-images/scripts/optimize-image.py <input> <output> --max-width 800 --quality 90
```

Save optimized images to `public/images/anatomy/` with kebab-case naming:
- `bone-classification-types.png`
- `vertebral-column-colored.png`
- `upper-limb-bones-labeled.svg`

SVG files from Wikimedia can be used as-is without optimization.

### 4. Update ATTRIBUTIONS.md

Add entry for each new image to `public/images/anatomy/ATTRIBUTIONS.md`:

```markdown
### <filename>
- **Title:** <original title on Wikimedia>
- **Author:** <author name>
- **Source:** <Wikimedia Commons URL>
- **License:** <Public Domain | CC BY 3.0>
```

### 5. Update Question JSON Data

Edit the relevant `scripts/data/*.json` file. See [references/question-image-schema.md](references/question-image-schema.md) for the image schema.

Image roles:
- `main` — shown during quiz (the question references labels in this image)
- `explanation` — shown after answering (detailed/labeled version)

Question text for image-based questions should reference English labels visible in the image:
```
"question_text": "図中の「Compact bone」に相当する日本語名称は？"
```

Set `question_type` to `"image_based"` when images are present.

### 6. Import to Database

```bash
# ドライラン（検証のみ）
npm run import:dry

# インポート（--replace で既存データを置換）
npx tsx scripts/import-learning-path.ts scripts/data/<file>.json --replace
```

If Node.js DNS fails in the environment, use curl-based REST API calls against Supabase directly. See [references/rest-api-fallback.md](references/rest-api-fallback.md) for the procedure.

### 7. Verify

```bash
# DB内の画像参照を確認
curl -s "$SUPABASE_URL/rest/v1/question_images?select=image_url,image_role" \
  -H "apikey: $SUPABASE_KEY" -H "Authorization: Bearer $SUPABASE_KEY"

# ローカルで画像ファイルの存在確認
ls -la public/images/anatomy/
```
