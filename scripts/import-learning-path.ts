/**
 * 学習パスデータ一括インポートスクリプト
 *
 * 使い方:
 *   npx tsx scripts/import-learning-path.ts scripts/data/unit1-skeletal-basics.json
 *   npx tsx scripts/import-learning-path.ts scripts/data/unit1-skeletal-basics.json --dry-run
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// プロキシ環境ではundiciのProxyAgentを使ってfetchをプロキシ経由にする
if (process.env.HTTPS_PROXY) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { ProxyAgent, setGlobalDispatcher } = require("undici");
    setGlobalDispatcher(new ProxyAgent(process.env.HTTPS_PROXY));
  } catch {
    // undiciが利用できない場合は無視（直接接続で試行）
  }
}

config({ path: ".env.local" });

interface ConceptData {
  name: string;
  description?: string;
}

interface ChoiceData {
  text: string;
  image_url?: string;
  is_correct: boolean;
}

interface QuestionData {
  question_text: string;
  interaction_type: "standard_mcq" | "word_bank" | "matching_pairs" | "free_input";
  question_type: "text_only" | "image_based" | "label_image";
  difficulty: "easy" | "medium" | "hard";
  explanation: string;
  source?: string;
  metadata?: Record<string, unknown>;
  choices: ChoiceData[];
  images?: { url: string; role: string; alt_text?: string }[];
}

interface SectionData {
  name: string;
  slug: string;
  description?: string;
  sort_order: number;
  concepts: ConceptData[];
  questions: QuestionData[];
}

interface UnitData {
  name: string;
  slug: string;
  description?: string;
  sort_order: number;
}

interface ImportFile {
  unit: UnitData;
  category: string;
  category_slug?: string;
  sections: SectionData[];
}

async function importLearningPath(filePath: string, dryRun: boolean, replace: boolean) {
  const content = fs.readFileSync(filePath, "utf-8");
  const data: ImportFile = JSON.parse(content);

  console.log(`\n📄 File: ${path.basename(filePath)}`);
  console.log(`📦 Unit: ${data.unit.name}`);
  console.log(`📂 Sections: ${data.sections.length}`);

  let totalQuestions = 0;
  for (const section of data.sections) {
    console.log(`   📝 ${section.name}: ${section.questions.length} questions, ${section.concepts.length} concepts`);
    totalQuestions += section.questions.length;
  }
  console.log(`   Total questions: ${totalQuestions}`);

  if (dryRun) {
    console.log("\n🏃 Dry run mode - validation passed ✅");
    return;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1. Upsert category
  const catSlug = data.category_slug || data.category.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const { data: existingCat } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", catSlug)
    .single();

  let categoryId: string;
  if (existingCat) {
    categoryId = existingCat.id;
    console.log(`📁 Using existing category: ${data.category}`);
  } else {
    const { data: newCat, error } = await supabase
      .from("categories")
      .insert({ name: data.category, slug: catSlug })
      .select("id")
      .single();
    if (error || !newCat) {
      console.error(`❌ Failed to create category: ${error?.message}`);
      process.exit(1);
    }
    categoryId = newCat.id;
    console.log(`📁 Created category: ${data.category}`);
  }

  // 2. Upsert unit
  const { data: existingUnit } = await supabase
    .from("units")
    .select("id")
    .eq("slug", data.unit.slug)
    .single();

  let unitId: string;
  if (existingUnit) {
    unitId = existingUnit.id;
    console.log(`📦 Using existing unit: ${data.unit.name}`);
  } else {
    const { data: newUnit, error } = await supabase
      .from("units")
      .insert({
        name: data.unit.name,
        slug: data.unit.slug,
        description: data.unit.description || null,
        sort_order: data.unit.sort_order,
      })
      .select("id")
      .single();
    if (error || !newUnit) {
      console.error(`❌ Failed to create unit: ${error?.message}`);
      process.exit(1);
    }
    unitId = newUnit.id;
    console.log(`📦 Created unit: ${data.unit.name}`);
  }

  // 3. Import each section
  for (const section of data.sections) {
    console.log(`\n--- Section: ${section.name} ---`);

    // Upsert section
    const { data: existingSection } = await supabase
      .from("sections")
      .select("id")
      .eq("unit_id", unitId)
      .eq("slug", section.slug)
      .single();

    let sectionId: string;
    if (existingSection) {
      sectionId = existingSection.id;
      console.log(`  Using existing section: ${section.name}`);
    } else {
      const { data: newSection, error } = await supabase
        .from("sections")
        .insert({
          unit_id: unitId,
          name: section.name,
          slug: section.slug,
          description: section.description || null,
          sort_order: section.sort_order,
        })
        .select("id")
        .single();
      if (error || !newSection) {
        console.error(`  ❌ Failed to create section: ${error?.message}`);
        continue;
      }
      sectionId = newSection.id;
      console.log(`  Created section: ${section.name}`);
    }

    // Create concepts
    const conceptIds: string[] = [];
    for (const concept of section.concepts) {
      const { data: existingConcept } = await supabase
        .from("concepts")
        .select("id")
        .eq("section_id", sectionId)
        .eq("name", concept.name)
        .single();

      if (existingConcept) {
        conceptIds.push(existingConcept.id);
      } else {
        const { data: newConcept, error } = await supabase
          .from("concepts")
          .insert({
            section_id: sectionId,
            name: concept.name,
            description: concept.description || null,
            sort_order: section.concepts.indexOf(concept),
          })
          .select("id")
          .single();
        if (error || !newConcept) {
          console.error(`  ❌ Failed to create concept ${concept.name}: ${error?.message}`);
          continue;
        }
        conceptIds.push(newConcept.id);
      }
    }
    console.log(`  Concepts: ${conceptIds.length}/${section.concepts.length}`);

    // Replace mode: delete existing questions in this section
    if (replace) {
      const { data: oldQuestions } = await supabase
        .from("questions")
        .select("id")
        .eq("section_id", sectionId);

      if (oldQuestions && oldQuestions.length > 0) {
        const oldIds = oldQuestions.map((q) => q.id);
        // カスケード削除: question_images, choices, question_concepts
        await supabase.from("question_images").delete().in("question_id", oldIds);
        await supabase.from("choices").delete().in("question_id", oldIds);
        await supabase.from("question_concepts").delete().in("question_id", oldIds);
        await supabase.from("questions").delete().in("id", oldIds);
        console.log(`  🔄 Replaced: deleted ${oldQuestions.length} existing questions`);
      }
    }

    // Import questions
    let qImported = 0;
    for (const q of section.questions) {
      if (!replace) {
        // Check duplicate (skip in replace mode since we already deleted)
        const { data: existing } = await supabase
          .from("questions")
          .select("id")
          .eq("section_id", sectionId)
          .eq("question_text", q.question_text)
          .single();

        if (existing) {
          console.log(`  ⚠️  Skip duplicate: "${q.question_text.substring(0, 30)}..."`);
          continue;
        }
      }

      // Insert question
      const { data: newQ, error: qError } = await supabase
        .from("questions")
        .insert({
          category_id: categoryId,
          section_id: sectionId,
          question_text: q.question_text,
          question_type: q.question_type,
          interaction_type: q.interaction_type,
          difficulty: q.difficulty,
          explanation: q.explanation,
          source: q.source || null,
          metadata: q.metadata || null,
          is_active: true,
        })
        .select("id")
        .single();

      if (qError || !newQ) {
        console.error(`  ❌ Failed to insert question: ${qError?.message}`);
        continue;
      }

      // Insert choices
      const choiceInserts = q.choices.map((c, i) => ({
        question_id: newQ.id,
        choice_text: c.text,
        choice_image_url: c.image_url || null,
        is_correct: c.is_correct,
        sort_order: i,
      }));

      const { error: choiceErr } = await supabase.from("choices").insert(choiceInserts);
      if (choiceErr) {
        console.error(`  ❌ Choices error: ${choiceErr.message}`);
      }

      // Insert images if any
      if (q.images && q.images.length > 0) {
        const imgInserts = q.images.map((img, i) => ({
          question_id: newQ.id,
          image_url: img.url,
          image_role: img.role,
          alt_text: img.alt_text || null,
          sort_order: i,
        }));
        await supabase.from("question_images").insert(imgInserts);
      }

      // Link to concepts (link to all concepts in section for now)
      if (conceptIds.length > 0) {
        const links = conceptIds.map((cid) => ({
          question_id: newQ.id,
          concept_id: cid,
        }));
        await supabase.from("question_concepts").insert(links);
      }

      qImported++;
    }

    console.log(`  Questions: ${qImported}/${section.questions.length} imported`);
  }

  console.log(`\n✅ Import complete!`);
}

// Main
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const replace = args.includes("--replace");
  const files = args.filter((a) => !a.startsWith("--"));

  if (files.length === 0) {
    console.log("Usage: npx tsx scripts/import-learning-path.ts <file.json> [--dry-run] [--replace]");
    console.log("");
    console.log("Options:");
    console.log("  --dry-run   Validate without writing to database");
    console.log("  --replace   Delete existing questions in each section before importing");
    process.exit(1);
  }

  console.log("🦴 Anatomy Quiz - Learning Path Importer\n");
  if (replace) {
    console.log("🔄 Replace mode: existing questions will be deleted and re-imported\n");
  }

  for (const file of files) {
    const resolved = path.resolve(file);
    if (!fs.existsSync(resolved)) {
      console.error(`❌ File not found: ${file}`);
      continue;
    }
    await importLearningPath(resolved, dryRun, replace);
  }
}

main();
