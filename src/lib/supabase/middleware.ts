import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** セキュリティヘッダーをレスポンスに付与する */
function setSecurityHeaders(response: NextResponse): void {
  // クリックジャッキング防止
  response.headers.set("X-Frame-Options", "DENY");
  // MIMEタイプスニッフィング防止
  response.headers.set("X-Content-Type-Options", "nosniff");
  // リファラー制御
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  // ブラウザ機能の制限
  response.headers.set(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=()"
  );
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the auth token
  await supabase.auth.getUser();

  // セキュリティヘッダーを付与
  setSecurityHeaders(supabaseResponse);

  return supabaseResponse;
}
