import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** リダイレクト先として許可するパスのプレフィックス */
const ALLOWED_REDIRECT_PREFIXES = ["/learn", "/home", "/categories", "/quiz", "/debug"];

/**
 * リダイレクトパスの安全性を検証する。
 * 相対パスのみ許可し、プロトコルや外部ドメインへのリダイレクトを防止。
 */
function getSafeRedirectPath(next: string | null): string {
  const fallback = "/learn";
  if (!next) return fallback;

  // プロトコル付きURL・ダブルスラッシュ（//evil.com）・バックスラッシュを拒否
  if (
    next.includes("://") ||
    next.startsWith("//") ||
    next.startsWith("\\") ||
    next.includes("\\\\")
  ) {
    return fallback;
  }

  // "/"で始まる相対パスのみ許可
  if (!next.startsWith("/")) return fallback;

  // 許可リストに含まれるパスプレフィックスかチェック
  const isAllowed = ALLOWED_REDIRECT_PREFIXES.some(
    (prefix) => next === prefix || next.startsWith(prefix + "/") || next.startsWith(prefix + "?")
  );

  return isAllowed ? next : fallback;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = getSafeRedirectPath(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Check if this user was previously a guest and upgrade their role
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profile && (profile as { role: string }).role === "guest") {
          await supabase
            .from("profiles")
            .update({ role: "free" })
            .eq("id", user.id);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
