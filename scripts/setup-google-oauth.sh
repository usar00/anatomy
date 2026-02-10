#!/bin/bash
set -euo pipefail

# ========== 設定 ==========
PROJECT_ID="anatomy-quiz-app"
SUPABASE_REF="apcdbqdlqhitkljehmze"
REDIRECT_URI="https://${SUPABASE_REF}.supabase.co/auth/v1/callback"
GCLOUD="$HOME/google-cloud-sdk/bin/gcloud"

echo "=============================="
echo "Google OAuth 自動セットアップ"
echo "=============================="

# ========== 1. プロジェクト作成 ==========
echo ""
echo "[1/5] GCP プロジェクトを作成..."
if $GCLOUD projects describe "$PROJECT_ID" &>/dev/null; then
  echo "  -> プロジェクト '$PROJECT_ID' は既に存在します。スキップ。"
else
  $GCLOUD projects create "$PROJECT_ID" --name="Anatomy Quiz" 2>&1
  echo "  -> 作成完了"
fi
$GCLOUD config set project "$PROJECT_ID" 2>/dev/null

# ========== 2. OAuth 同意画面の設定 ==========
echo ""
echo "[2/5] OAuth 同意画面を設定..."

USER_EMAIL=$($GCLOUD config get-value account 2>/dev/null)
PROJECT_NUMBER=$($GCLOUD projects describe "$PROJECT_ID" --format='value(projectNumber)' 2>/dev/null)
ACCESS_TOKEN=$($GCLOUD auth print-access-token 2>/dev/null)

# OAuth 同意画面の作成（ブランド）
BRAND_RESPONSE=$(curl -s -X POST \
  "https://oauth2.googleapis.com/v1/projects/${PROJECT_NUMBER}/brands" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"applicationTitle\": \"Anatomy Quiz\",
    \"supportEmail\": \"${USER_EMAIL}\"
  }" 2>/dev/null)

if echo "$BRAND_RESPONSE" | grep -q "applicationTitle"; then
  echo "  -> 同意画面を作成しました"
elif echo "$BRAND_RESPONSE" | grep -q "ALREADY_EXISTS"; then
  echo "  -> 同意画面は既に存在します。スキップ。"
else
  echo "  -> レスポンス: $BRAND_RESPONSE"
fi

# ========== 3. OAuth クライアント ID 作成 ==========
echo ""
echo "[3/5] OAuth クライアント ID を作成..."

CLIENT_RESPONSE=$(curl -s -X POST \
  "https://oauth2.googleapis.com/v1/projects/${PROJECT_NUMBER}/brands/${PROJECT_NUMBER}/identityAwareProxyClients" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"displayName\": \"Anatomy Quiz Web\"
  }" 2>/dev/null)

# クライアント ID とシークレットを抽出
CLIENT_ID=$(echo "$CLIENT_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['name'].split('/')[-1])" 2>/dev/null || echo "")
CLIENT_SECRET=$(echo "$CLIENT_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['secret'])" 2>/dev/null || echo "")

if [ -n "$CLIENT_ID" ] && [ -n "$CLIENT_SECRET" ]; then
  echo "  -> クライアント ID: ${CLIENT_ID}"
  echo "  -> クライアント Secret: ${CLIENT_SECRET:0:10}..."
else
  echo "  -> エラー: クライアント作成に失敗しました"
  echo "  -> レスポンス: $CLIENT_RESPONSE"
  echo ""
  echo "IAP API が未有効の場合、以下を実行してから再実行してください："
  echo "  $GCLOUD services enable iap.googleapis.com"
  exit 1
fi

# ========== 4. Supabase に設定 ==========
echo ""
echo "[4/5] Supabase Google プロバイダーを設定..."

# Supabase Management API にはアクセストークンが必要
# ユーザーにトークンを入力してもらう
echo ""
echo "Supabase のアクセストークンが必要です。"
echo "以下の URL から取得してください:"
echo "  https://supabase.com/dashboard/account/tokens"
echo "  -> 'Generate new token' をクリック → トークンをコピー"
echo ""
read -p "Supabase アクセストークンを入力: " SUPABASE_TOKEN

if [ -n "$SUPABASE_TOKEN" ]; then
  # Supabase Management API でGoogle プロバイダーを有効化
  SUPA_RESPONSE=$(curl -s -X PATCH \
    "https://api.supabase.com/v1/projects/${SUPABASE_REF}/config/auth" \
    -H "Authorization: Bearer $SUPABASE_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"EXTERNAL_GOOGLE_ENABLED\": true,
      \"EXTERNAL_GOOGLE_CLIENT_ID\": \"${CLIENT_ID}\",
      \"EXTERNAL_GOOGLE_SECRET\": \"${CLIENT_SECRET}\",
      \"EXTERNAL_GOOGLE_REDIRECT_URI\": \"${REDIRECT_URI}\"
    }" 2>/dev/null)

  if echo "$SUPA_RESPONSE" | grep -q "EXTERNAL_GOOGLE_ENABLED"; then
    echo "  -> Supabase Google プロバイダーを有効化しました！"
  else
    echo "  -> Supabase 設定結果: $SUPA_RESPONSE"
    echo ""
    echo "手動で設定する場合は以下の値を使ってください:"
    echo "  Client ID:     $CLIENT_ID"
    echo "  Client Secret: $CLIENT_SECRET"
  fi
else
  echo "  -> スキップ（手動で Supabase に設定してください）"
  echo "  Client ID:     $CLIENT_ID"
  echo "  Client Secret: $CLIENT_SECRET"
fi

# ========== 5. 完了 ==========
echo ""
echo "=============================="
echo "[5/5] セットアップ完了！"
echo "=============================="
echo ""
echo "注意: IAP クライアントで作成された OAuth 認証情報は"
echo "リダイレクト URI が自動設定されます。"
echo "もし Google ログインで redirect_uri_mismatch エラーが出た場合："
echo "  1. https://console.cloud.google.com/apis/credentials?project=${PROJECT_ID}"
echo "  2. 作成したクライアント ID をクリック"
echo "  3. 「承認済みリダイレクト URI」に追加:"
echo "     ${REDIRECT_URI}"
echo ""
