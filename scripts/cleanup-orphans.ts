/**
 * 孤児問題の検出・削除スクリプト
 * section_idがNULLの問題（セクション削除で孤児化した問題）を検出して削除する
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

if (process.env.HTTPS_PROXY) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { ProxyAgent, setGlobalDispatcher } = require("undici");
    setGlobalDispatcher(new ProxyAgent(process.env.HTTPS_PROXY));
  } catch {}
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  // section_idがNULLの問題を検索
  const { data: orphans, error } = await supabase
    .from("questions")
    .select("id, question_text, section_id")
    .is("section_id", null);

  if (error) {
    console.error("❌ Error:", error);
    return;
  }

  console.log(`=== section_id が NULL の孤児問題: ${orphans?.length ?? 0}件 ===`);
  if (!orphans || orphans.length === 0) {
    console.log("✅ 孤児問題はありません");
    return;
  }

  for (const q of orphans) {
    console.log(`  - ${q.question_text.substring(0, 80)} [${q.id}]`);
  }

  if (dryRun) {
    console.log(`\n🏃 Dry run: ${orphans.length}件の孤児問題が見つかりました（削除はしません）`);
    return;
  }

  // 削除実行
  const ids = orphans.map((q) => q.id);

  // 関連レコードをカスケード削除
  await supabase.from("question_images").delete().in("question_id", ids);
  await supabase.from("choices").delete().in("question_id", ids);
  await supabase.from("question_concepts").delete().in("question_id", ids);
  const { error: delErr } = await supabase.from("questions").delete().in("id", ids);

  if (delErr) {
    console.error("❌ 削除エラー:", delErr);
  } else {
    console.log(`\n✅ ${orphans.length}件の孤児問題を削除しました`);
  }
}

main().catch(console.error);
