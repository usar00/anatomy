/**
 * 問題データ一括インポートスクリプト
 *
 * 使い方:
 *   npx tsx scripts/import-questions.ts scripts/data/sample.json
 *   npx tsx scripts/import-questions.ts scripts/data/sample.json --dry-run
 *   npx tsx scripts/import-questions.ts scripts/data/*.json
 *
 * 環境変数:
 *   NEXT_PUBLIC_SUPABASE_URL - Supabase URL
 *   SUPABASE_SERVICE_ROLE_KEY - Supabase Service Role Key (RLS bypass用)
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Load .env.local
config({ path: ".env.local" });

// Types
interface ImportChoice {
  text: string;
  image_url?: string;
  is_correct: boolean;
}

interface ImportImage {
  url: string;
  role: "main" | "explanation" | "choice";
  alt_text?: string;
}

interface ImportQuestion {
  question_text: string;
  question_type: "text_only" | "image_based" | "label_image";
  difficulty: "easy" | "medium" | "hard";
  explanation: string;
  source?: string;
  metadata?: Record<string, unknown>;
  images: ImportImage[];
  choices: ImportChoice[];
}

interface ImportData {
  category: string;
  category_slug?: string;
  category_description?: string;
  questions: ImportQuestion[];
}

// Validation
function validateImportData(data: unknown): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data || typeof data !== "object") {
    return { valid: false, errors: ["Data must be a JSON object"] };
  }

  const d = data as Record<string, unknown>;

  if (!d.category || typeof d.category !== "string") {
    errors.push("Missing or invalid 'category' field");
  }

  if (!Array.isArray(d.questions) || d.questions.length === 0) {
    errors.push("'questions' must be a non-empty array");
  }

  if (Array.isArray(d.questions)) {
    d.questions.forEach((q: unknown, i: number) => {
      const question = q as Record<string, unknown>;
      if (!question.question_text) {
        errors.push(`Question ${i + 1}: missing 'question_text'`);
      }
      if (
        !["text_only", "image_based", "label_image"].includes(
          question.question_type as string
        )
      ) {
        errors.push(
          `Question ${i + 1}: invalid 'question_type' (must be text_only, image_based, or label_image)`
        );
      }
      if (
        !["easy", "medium", "hard"].includes(question.difficulty as string)
      ) {
        errors.push(
          `Question ${i + 1}: invalid 'difficulty' (must be easy, medium, or hard)`
        );
      }
      if (!question.explanation) {
        errors.push(`Question ${i + 1}: missing 'explanation'`);
      }

      if (!Array.isArray(question.choices) || question.choices.length < 2) {
        errors.push(
          `Question ${i + 1}: 'choices' must have at least 2 items`
        );
      } else {
        const choices = question.choices as ImportChoice[];
        const correctCount = choices.filter((c) => c.is_correct).length;
        if (correctCount === 0) {
          errors.push(
            `Question ${i + 1}: must have at least one correct choice`
          );
        }
        if (correctCount > 1) {
          errors.push(
            `Question ${i + 1}: has ${correctCount} correct choices (expected 1)`
          );
        }
        choices.forEach((c, j) => {
          if (!c.text || typeof c.text !== "string") {
            errors.push(
              `Question ${i + 1}, Choice ${j + 1}: missing 'text'`
            );
          }
        });
      }
    });
  }

  return { valid: errors.length === 0, errors };
}

// Slug generation
function generateSlug(name: string): string {
  const slugMap: Record<string, string> = {
    筋骨格系: "musculoskeletal",
    循環器系: "cardiovascular",
    神経系: "nervous",
    呼吸器系: "respiratory",
    消化器系: "digestive",
    泌尿器系: "urinary",
    内分泌系: "endocrine",
    生殖器系: "reproductive",
    外皮系: "integumentary",
    リンパ系: "lymphatic",
    感覚器系: "sensory",
  };

  return (
    slugMap[name] ||
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
  );
}

async function importQuestions(
  filePath: string,
  dryRun: boolean
): Promise<{ success: boolean; imported: number; errors: string[] }> {
  const errors: string[] = [];

  // Read and parse file
  let data: ImportData;
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    data = JSON.parse(content);
  } catch (e) {
    return {
      success: false,
      imported: 0,
      errors: [`Failed to read/parse ${filePath}: ${e}`],
    };
  }

  // Validate
  const validation = validateImportData(data);
  if (!validation.valid) {
    return { success: false, imported: 0, errors: validation.errors };
  }

  console.log(`📄 File: ${path.basename(filePath)}`);
  console.log(`📂 Category: ${data.category}`);
  console.log(`📝 Questions: ${data.questions.length}`);

  // Difficulty breakdown
  const diffCounts = { easy: 0, medium: 0, hard: 0 };
  data.questions.forEach((q) => diffCounts[q.difficulty]++);
  console.log(
    `   Easy: ${diffCounts.easy}, Medium: ${diffCounts.medium}, Hard: ${diffCounts.hard}`
  );

  // Type breakdown
  const typeCounts: Record<string, number> = {};
  data.questions.forEach((q) => {
    typeCounts[q.question_type] = (typeCounts[q.question_type] || 0) + 1;
  });
  console.log(`   Types: ${JSON.stringify(typeCounts)}`);

  if (dryRun) {
    console.log("🏃 Dry run mode - no data will be written");
    console.log("✅ Validation passed");

    // Print sample of first question
    const sample = data.questions[0];
    console.log("\n--- Sample Question ---");
    console.log(`Q: ${sample.question_text}`);
    sample.choices.forEach((c, i) => {
      console.log(
        `  ${String.fromCharCode(65 + i)}. ${c.text} ${c.is_correct ? "✓" : ""}`
      );
    });
    console.log(`Explanation: ${sample.explanation}`);
    console.log("---\n");

    return { success: true, imported: 0, errors: [] };
  }

  // Initialize Supabase client with service role key
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return {
      success: false,
      imported: 0,
      errors: [
        "Missing environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required",
      ],
    };
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Upsert category
  const slug = data.category_slug || generateSlug(data.category);

  const { data: existingCat } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", slug)
    .single();

  let categoryId: string;

  if (existingCat) {
    categoryId = existingCat.id;
    console.log(`📁 Using existing category: ${data.category} (${slug})`);
  } else {
    const { data: newCat, error: catError } = await supabase
      .from("categories")
      .insert({
        name: data.category,
        slug,
        description: data.category_description || null,
      })
      .select("id")
      .single();

    if (catError || !newCat) {
      return {
        success: false,
        imported: 0,
        errors: [`Failed to create category: ${catError?.message}`],
      };
    }
    categoryId = newCat.id;
    console.log(`📁 Created new category: ${data.category} (${slug})`);
  }

  // Import questions
  let importedCount = 0;

  for (const q of data.questions) {
    // Check for duplicate
    const { data: existing } = await supabase
      .from("questions")
      .select("id")
      .eq("category_id", categoryId)
      .eq("question_text", q.question_text)
      .single();

    if (existing) {
      console.log(`⚠️  Skipping duplicate: "${q.question_text.substring(0, 40)}..."`);
      continue;
    }

    // Insert question
    const { data: newQuestion, error: qError } = await supabase
      .from("questions")
      .insert({
        category_id: categoryId,
        question_text: q.question_text,
        question_type: q.question_type,
        explanation: q.explanation,
        source: q.source || null,
        difficulty: q.difficulty,
        metadata: q.metadata || null,
        is_active: true,
      })
      .select("id")
      .single();

    if (qError || !newQuestion) {
      errors.push(
        `Failed to insert question "${q.question_text.substring(0, 40)}...": ${qError?.message}`
      );
      continue;
    }

    // Insert choices
    const choiceInserts = q.choices.map((c, index) => ({
      question_id: newQuestion.id,
      choice_text: c.text,
      choice_image_url: c.image_url || null,
      is_correct: c.is_correct,
      sort_order: index,
    }));

    const { error: choicesError } = await supabase
      .from("choices")
      .insert(choiceInserts);

    if (choicesError) {
      errors.push(
        `Failed to insert choices for question "${q.question_text.substring(0, 40)}...": ${choicesError.message}`
      );
      continue;
    }

    // Insert images if any
    if (q.images && q.images.length > 0) {
      const imageInserts = q.images.map((img, index) => ({
        question_id: newQuestion.id,
        image_url: img.url,
        image_role: img.role,
        alt_text: img.alt_text || null,
        sort_order: index,
      }));

      const { error: imgError } = await supabase
        .from("question_images")
        .insert(imageInserts);

      if (imgError) {
        errors.push(
          `Failed to insert images for question "${q.question_text.substring(0, 40)}...": ${imgError.message}`
        );
      }
    }

    importedCount++;
  }

  console.log(`\n✅ Imported ${importedCount}/${data.questions.length} questions`);
  if (errors.length > 0) {
    console.log(`⚠️  ${errors.length} errors occurred`);
  }

  return { success: errors.length === 0, imported: importedCount, errors };
}

// Main
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const files = args.filter((a) => !a.startsWith("--"));

  if (files.length === 0) {
    console.log("Usage: npx tsx scripts/import-questions.ts <file.json> [--dry-run]");
    console.log("");
    console.log("Options:");
    console.log("  --dry-run  Validate without writing to database");
    console.log("");
    console.log("Examples:");
    console.log("  npx tsx scripts/import-questions.ts scripts/data/musculoskeletal.json");
    console.log("  npx tsx scripts/import-questions.ts scripts/data/*.json --dry-run");
    process.exit(1);
  }

  console.log("🦴 Anatomy Quiz - Question Importer\n");

  let totalImported = 0;
  let totalErrors = 0;

  for (const file of files) {
    const resolvedPath = path.resolve(file);
    if (!fs.existsSync(resolvedPath)) {
      console.error(`❌ File not found: ${file}`);
      totalErrors++;
      continue;
    }

    console.log(`\n${"=".repeat(50)}`);
    const result = await importQuestions(resolvedPath, dryRun);
    totalImported += result.imported;
    totalErrors += result.errors.length;

    if (result.errors.length > 0) {
      console.log("\nErrors:");
      result.errors.forEach((e) => console.log(`  ❌ ${e}`));
    }
  }

  console.log(`\n${"=".repeat(50)}`);
  console.log(`📊 Total: ${totalImported} questions imported, ${totalErrors} errors`);
  process.exit(totalErrors > 0 ? 1 : 0);
}

main();
