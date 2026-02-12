"""
基礎テキスト（reference_texts）のマイグレーション適用 & データインポート

使い方:
  python3 scripts/apply-migration-and-import.py [--db-password YOUR_DB_PASSWORD]

  --db-password: Supabaseのデータベースパスワード（オプション）
    指定するとDDLを直接実行。未指定ならREST APIで存在チェックのみ。

環境変数 (.env.local から読み込み):
  NEXT_PUBLIC_SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY
"""

import json
import os
import sys
import subprocess
import requests

# .env.local を読み込む
def load_env():
    env_path = os.path.join(os.path.dirname(__file__), "..", ".env.local")
    if not os.path.exists(env_path):
        print("❌ .env.local が見つかりません")
        sys.exit(1)
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, _, value = line.partition("=")
                os.environ.setdefault(key.strip(), value.strip())

load_env()

SUPABASE_URL = os.environ["NEXT_PUBLIC_SUPABASE_URL"]
SERVICE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
PROJECT_REF = SUPABASE_URL.replace("https://", "").replace(".supabase.co", "")
HEADERS = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation",
}
BASE = f"{SUPABASE_URL}/rest/v1"


def rest_get(table, params=None):
    r = requests.get(f"{BASE}/{table}", headers=HEADERS, params=params or {})
    r.raise_for_status()
    return r.json()


def rest_post(table, data):
    h = {**HEADERS, "Prefer": "return=representation"}
    r = requests.post(f"{BASE}/{table}", headers=h, json=data)
    if not r.ok:
        print(f"  ❌ POST {table} failed: {r.status_code} {r.text[:200]}")
    r.raise_for_status()
    return r.json()


def table_exists(table_name):
    """REST API でテーブルの存在を確認"""
    r = requests.get(
        f"{BASE}/{table_name}?select=id&limit=1",
        headers=HEADERS,
    )
    return r.ok


# ========================================
# Step 1: マイグレーション適用（DDL）
# ========================================
def apply_migration(db_password=None):
    print("=" * 50)
    print("Step 1: マイグレーション確認")
    print("=" * 50)

    if table_exists("reference_texts"):
        print("✅ reference_texts テーブルは既に存在します")
        return True

    print("📋 reference_texts テーブルが存在しません。作成が必要です。")

    migration_path = os.path.join(
        os.path.dirname(__file__), "..", "supabase", "migrations", "004_reference_texts.sql"
    )

    if db_password:
        # psql で直接実行
        print("🔧 psql でマイグレーションを実行します...")
        pooler_host = f"aws-0-ap-northeast-1.pooler.supabase.com"
        env = {**os.environ, "PGPASSWORD": db_password}
        result = subprocess.run(
            [
                "psql",
                "-h", pooler_host,
                "-p", "6543",
                "-U", f"postgres.{PROJECT_REF}",
                "-d", "postgres",
                "-f", migration_path,
            ],
            capture_output=True, text=True, env=env, timeout=30,
        )
        if result.returncode == 0:
            print("✅ マイグレーション適用成功！")
            print(result.stdout)
            return True
        else:
            print(f"❌ psql エラー: {result.stderr}")
            return False
    else:
        print()
        print("⚠️  テーブルを作成するにはデータベースパスワードが必要です。")
        print("   以下のいずれかの方法で実行してください:")
        print()
        print("   方法1: DBパスワードを指定して再実行")
        print(f"     python3 scripts/apply-migration-and-import.py --db-password YOUR_DB_PASSWORD")
        print()
        print("   方法2: Supabase Dashboard → SQL Editor でSQLを実行")
        print(f"     ファイル: supabase/migrations/004_reference_texts.sql")
        print()
        print("   実行後、このスクリプトを再度実行してください。")
        return False


# ========================================
# Step 2: 基礎テキストのインポート
# ========================================
def import_reference_texts():
    print()
    print("=" * 50)
    print("Step 2: 基礎テキストのインポート")
    print("=" * 50)

    data_path = os.path.join(os.path.dirname(__file__), "data", "reference-texts.json")
    with open(data_path) as f:
        data = json.load(f)

    texts = data["texts"]
    print(f"📝 {len(texts)} 件の基礎テキストをインポートします")

    imported = 0
    for t in texts:
        existing = rest_get("reference_texts", {"text_id": f"eq.{t['id']}", "select": "id"})
        if existing:
            print(f"  ⏭️  既存: {t['title']}")
            continue

        row = {
            "text_id": t["id"],
            "unit_slug": t["unit_slug"],
            "section_slug": t["section_slug"],
            "title": t["title"],
            "body": t["body"],
            "key_terms": t.get("key_terms", []),
            "sort_order": imported,
        }
        rest_post("reference_texts", row)
        print(f"  ✅ 追加: {t['title']}")
        imported += 1

    print(f"\n✅ {imported} 件の基礎テキストをインポートしました")


# ========================================
# Step 3: 問題 ↔ テキスト の関連付け
# ========================================
def link_questions_to_texts():
    print()
    print("=" * 50)
    print("Step 3: 問題 ↔ テキストの関連付け")
    print("=" * 50)

    ref_texts = rest_get("reference_texts", {"select": "id,text_id"})
    text_id_map = {rt["text_id"]: rt["id"] for rt in ref_texts}
    print(f"📋 基礎テキスト {len(text_id_map)} 件を取得")

    data_dir = os.path.join(os.path.dirname(__file__), "data")
    unit_files = [f for f in os.listdir(data_dir) if f.startswith("unit") and f.endswith(".json")]
    unit_files.sort()

    linked = 0
    skipped = 0
    not_found = 0

    for unit_file in unit_files:
        filepath = os.path.join(data_dir, unit_file)
        with open(filepath) as f:
            unit_data = json.load(f)

        print(f"\n📂 {unit_data['unit']['name']} ({unit_file})")

        for section in unit_data["sections"]:
            for q in section.get("questions", []):
                ref_ids = q.get("reference_text_ids", [])
                if not ref_ids:
                    continue

                # 問題を question_text で検索
                questions = rest_get(
                    "questions",
                    {"question_text": f"eq.{q['question_text']}", "select": "id"},
                )
                if not questions:
                    not_found += 1
                    continue

                question_id = questions[0]["id"]

                for idx, ref_text_id_str in enumerate(ref_ids):
                    if ref_text_id_str not in text_id_map:
                        print(f"  ⚠️  テキストID不明: {ref_text_id_str}")
                        continue

                    ref_uuid = text_id_map[ref_text_id_str]

                    existing = rest_get(
                        "question_reference_texts",
                        {
                            "question_id": f"eq.{question_id}",
                            "reference_text_id": f"eq.{ref_uuid}",
                            "select": "question_id",
                        },
                    )
                    if existing:
                        skipped += 1
                        continue

                    rest_post(
                        "question_reference_texts",
                        {
                            "question_id": question_id,
                            "reference_text_id": ref_uuid,
                            "sort_order": idx,
                        },
                    )
                    linked += 1

    print(f"\n✅ {linked} 件の関連付けを作成")
    if skipped:
        print(f"   {skipped} 件は既存のためスキップ")
    if not_found:
        print(f"   {not_found} 問はDB上に未登録（先に問題をインポートしてください）")


# ========================================
# Main
# ========================================
def main():
    print("🦴 Anatomy Quiz — 基礎テキスト セットアップ\n")

    # Parse args
    db_password = None
    args = sys.argv[1:]
    for i, arg in enumerate(args):
        if arg == "--db-password" and i + 1 < len(args):
            db_password = args[i + 1]

    # Step 1
    if not apply_migration(db_password):
        sys.exit(1)

    # Step 2
    import_reference_texts()

    # Step 3
    link_questions_to_texts()

    print()
    print("=" * 50)
    print("🎉 セットアップ完了！")
    print("=" * 50)


if __name__ == "__main__":
    main()
