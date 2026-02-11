#!/bin/bash
# Import learning path data via curl (proxy-compatible)
set -e

# Load from .env.local if present
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:?Missing NEXT_PUBLIC_SUPABASE_URL}"
SERVICE_KEY="${SUPABASE_SERVICE_ROLE_KEY:?Missing SUPABASE_SERVICE_ROLE_KEY}"
DATA_FILE="${1:-scripts/data/unit1-skeletal-basics.json}"

HEADERS="-H \"apikey: $SERVICE_KEY\" -H \"Authorization: Bearer $SERVICE_KEY\" -H \"Content-Type: application/json\" -H \"Prefer: return=representation\""

api() {
  local method=$1
  local endpoint=$2
  local data=$3

  if [ -n "$data" ]; then
    eval curl -s -X "$method" "$SUPABASE_URL/rest/v1/$endpoint" $HEADERS -d "'$data'"
  else
    eval curl -s -X "$method" "$SUPABASE_URL/rest/v1/$endpoint" $HEADERS
  fi
}

api_post() {
  local endpoint=$1
  local data=$2
  curl -s -X POST "$SUPABASE_URL/rest/v1/$endpoint" \
    -H "apikey: $SERVICE_KEY" \
    -H "Authorization: Bearer $SERVICE_KEY" \
    -H "Content-Type: application/json" \
    -H "Prefer: return=representation" \
    -d "$data"
}

api_get() {
  local endpoint=$1
  curl -s -X GET "$SUPABASE_URL/rest/v1/$endpoint" \
    -H "apikey: $SERVICE_KEY" \
    -H "Authorization: Bearer $SERVICE_KEY"
}

echo "🦴 Anatomy Quiz - Curl-based Importer"
echo ""

# Read JSON data
CATEGORY=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$DATA_FILE','utf-8')).category)")
CAT_SLUG=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$DATA_FILE','utf-8')).category_slug)")
UNIT_NAME=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$DATA_FILE','utf-8')).unit.name)")
UNIT_SLUG=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$DATA_FILE','utf-8')).unit.slug)")
UNIT_DESC=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$DATA_FILE','utf-8')).unit.description)")
UNIT_ORDER=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$DATA_FILE','utf-8')).unit.sort_order)")

echo "📦 Unit: $UNIT_NAME"
echo "📂 Category: $CATEGORY ($CAT_SLUG)"

# 1. Get or create category
EXISTING_CAT=$(api_get "categories?slug=eq.$CAT_SLUG&select=id")
CAT_ID=$(echo "$EXISTING_CAT" | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf-8')); console.log(d[0]?.id || '')")

if [ -z "$CAT_ID" ]; then
  echo "📁 Creating category: $CATEGORY"
  NEW_CAT=$(api_post "categories" "{\"name\":\"$CATEGORY\",\"slug\":\"$CAT_SLUG\"}")
  CAT_ID=$(echo "$NEW_CAT" | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf-8')); console.log(Array.isArray(d)?d[0].id:d.id)")
else
  echo "📁 Using existing category: $CATEGORY (id: $CAT_ID)"
fi

# 2. Get or create unit
EXISTING_UNIT=$(api_get "units?slug=eq.$UNIT_SLUG&select=id")
UNIT_ID=$(echo "$EXISTING_UNIT" | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf-8')); console.log(d[0]?.id || '')")

if [ -z "$UNIT_ID" ]; then
  echo "📦 Creating unit: $UNIT_NAME"
  NEW_UNIT=$(api_post "units" "{\"name\":\"$UNIT_NAME\",\"slug\":\"$UNIT_SLUG\",\"description\":\"$UNIT_DESC\",\"sort_order\":$UNIT_ORDER}")
  UNIT_ID=$(echo "$NEW_UNIT" | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf-8')); console.log(Array.isArray(d)?d[0].id:d.id)")
else
  echo "📦 Using existing unit: $UNIT_NAME (id: $UNIT_ID)"
fi

echo "   CAT_ID=$CAT_ID"
echo "   UNIT_ID=$UNIT_ID"

# 3. Process sections using node to parse the complex JSON
node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('$DATA_FILE', 'utf-8'));
const sections = data.sections;
// Output each section's questions as JSON lines for processing
sections.forEach((s, si) => {
  const out = {
    section: { name: s.name, slug: s.slug, description: s.description || '', sort_order: s.sort_order },
    concepts: s.concepts,
    questions: s.questions
  };
  console.log(JSON.stringify(out));
});
" | while IFS= read -r section_json; do
  SEC_NAME=$(echo "$section_json" | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf-8')); console.log(d.section.name)")
  SEC_SLUG=$(echo "$section_json" | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf-8')); console.log(d.section.slug)")
  SEC_DESC=$(echo "$section_json" | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf-8')); console.log(d.section.description)")
  SEC_ORDER=$(echo "$section_json" | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf-8')); console.log(d.section.sort_order)")

  echo ""
  echo "--- Section: $SEC_NAME ---"

  # Get or create section
  EXISTING_SEC=$(api_get "sections?unit_id=eq.$UNIT_ID&slug=eq.$SEC_SLUG&select=id")
  SEC_ID=$(echo "$EXISTING_SEC" | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf-8')); console.log(d[0]?.id || '')")

  if [ -z "$SEC_ID" ]; then
    SEC_BODY=$(node -e "console.log(JSON.stringify({unit_id:'$UNIT_ID',name:'$SEC_NAME',slug:'$SEC_SLUG',description:'$SEC_DESC',sort_order:$SEC_ORDER}))")
    NEW_SEC=$(api_post "sections" "$SEC_BODY")
    SEC_ID=$(echo "$NEW_SEC" | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf-8')); console.log(Array.isArray(d)?d[0].id:d.id)")
    echo "  Created section (id: $SEC_ID)"
  else
    echo "  Using existing section (id: $SEC_ID)"
  fi

  # Create concepts
  CONCEPT_IDS=""
  NUM_CONCEPTS=$(echo "$section_json" | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf-8')); console.log(d.concepts.length)")

  for i in $(seq 0 $((NUM_CONCEPTS - 1))); do
    C_NAME=$(echo "$section_json" | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf-8')); console.log(d.concepts[$i].name)")
    C_DESC=$(echo "$section_json" | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf-8')); console.log(d.concepts[$i].description || '')")

    EXISTING_C=$(curl -s -G "$SUPABASE_URL/rest/v1/concepts" \
      --data-urlencode "section_id=eq.$SEC_ID" \
      --data-urlencode "name=eq.$C_NAME" \
      --data-urlencode "select=id" \
      -H "apikey: $SERVICE_KEY" \
      -H "Authorization: Bearer $SERVICE_KEY")
    C_ID=$(echo "$EXISTING_C" | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf-8')); console.log(d[0]?.id || '')")

    if [ -z "$C_ID" ]; then
      C_BODY=$(node -e "console.log(JSON.stringify({section_id:'$SEC_ID',name:$(node -e "console.log(JSON.stringify('$C_NAME'))"),description:$(node -e "console.log(JSON.stringify('$C_DESC'))"),sort_order:$i}))")
      NEW_C=$(api_post "concepts" "$C_BODY")
      C_ID=$(echo "$NEW_C" | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf-8')); console.log(Array.isArray(d)?d[0].id:d.id)")
    fi

    if [ -n "$CONCEPT_IDS" ]; then
      CONCEPT_IDS="$CONCEPT_IDS,$C_ID"
    else
      CONCEPT_IDS="$C_ID"
    fi
  done
  echo "  Concepts: $NUM_CONCEPTS"

  # Import questions
  NUM_QUESTIONS=$(echo "$section_json" | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf-8')); console.log(d.questions.length)")
  IMPORTED=0
  SKIPPED=0

  for i in $(seq 0 $((NUM_QUESTIONS - 1))); do
    Q_TEXT=$(echo "$section_json" | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf-8')); console.log(d.questions[$i].question_text)")

    # Check duplicate
    EXISTING_Q=$(curl -s -G "$SUPABASE_URL/rest/v1/questions" \
      --data-urlencode "section_id=eq.$SEC_ID" \
      --data-urlencode "question_text=eq.$Q_TEXT" \
      --data-urlencode "select=id" \
      -H "apikey: $SERVICE_KEY" \
      -H "Authorization: Bearer $SERVICE_KEY")
    Q_EXISTS=$(echo "$EXISTING_Q" | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf-8')); console.log(d.length > 0 ? 'yes' : 'no')")

    if [ "$Q_EXISTS" = "yes" ]; then
      SKIPPED=$((SKIPPED + 1))
      continue
    fi

    # Build question JSON
    Q_BODY=$(echo "$section_json" | node -e "
      const d = JSON.parse(require('fs').readFileSync('/dev/stdin','utf-8'));
      const q = d.questions[$i];
      console.log(JSON.stringify({
        category_id: '$CAT_ID',
        section_id: '$SEC_ID',
        question_text: q.question_text,
        question_type: q.question_type,
        interaction_type: q.interaction_type,
        difficulty: q.difficulty,
        explanation: q.explanation,
        source: q.source || null,
        metadata: q.metadata || null,
        is_active: true
      }));
    ")

    NEW_Q=$(api_post "questions" "$Q_BODY")
    Q_ID=$(echo "$NEW_Q" | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf-8')); console.log(Array.isArray(d)?d[0]?.id:d?.id)")

    if [ -z "$Q_ID" ] || [ "$Q_ID" = "undefined" ]; then
      echo "  ❌ Failed to insert question: $Q_TEXT"
      echo "  Response: $NEW_Q"
      continue
    fi

    # Insert choices
    CHOICES_BODY=$(echo "$section_json" | node -e "
      const d = JSON.parse(require('fs').readFileSync('/dev/stdin','utf-8'));
      const q = d.questions[$i];
      const choices = q.choices.map((c, ci) => ({
        question_id: '$Q_ID',
        choice_text: c.text,
        choice_image_url: c.image_url || null,
        is_correct: c.is_correct,
        sort_order: ci
      }));
      console.log(JSON.stringify(choices));
    ")
    api_post "choices" "$CHOICES_BODY" > /dev/null

    # Insert images if any
    HAS_IMAGES=$(echo "$section_json" | node -e "
      const d = JSON.parse(require('fs').readFileSync('/dev/stdin','utf-8'));
      const q = d.questions[$i];
      console.log(q.images && q.images.length > 0 ? 'yes' : 'no');
    ")

    if [ "$HAS_IMAGES" = "yes" ]; then
      IMAGES_BODY=$(echo "$section_json" | node -e "
        const d = JSON.parse(require('fs').readFileSync('/dev/stdin','utf-8'));
        const q = d.questions[$i];
        const images = q.images.map((img, ii) => ({
          question_id: '$Q_ID',
          image_url: img.url,
          image_role: img.role,
          alt_text: img.alt_text || null,
          sort_order: ii
        }));
        console.log(JSON.stringify(images));
      ")
      api_post "question_images" "$IMAGES_BODY" > /dev/null
    fi

    # Link to concepts
    if [ -n "$CONCEPT_IDS" ]; then
      LINKS_BODY=$(node -e "
        const cids = '$CONCEPT_IDS'.split(',');
        const links = cids.map(cid => ({ question_id: '$Q_ID', concept_id: cid }));
        console.log(JSON.stringify(links));
      ")
      api_post "question_concepts" "$LINKS_BODY" > /dev/null 2>/dev/null
    fi

    IMPORTED=$((IMPORTED + 1))
  done

  echo "  Questions: $IMPORTED imported, $SKIPPED skipped (duplicate)"
done

echo ""
echo "✅ Import complete!"
