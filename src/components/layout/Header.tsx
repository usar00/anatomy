"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";

export function Header() {
  const { user, isGuest, isFreeMember, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-card-border">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href={isFreeMember ? "/home" : "/"} className="flex items-center gap-2 group">
          <span className="text-2xl" role="img" aria-label="anatomy">
            🦴
          </span>
          <span className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
            Anatomy Quiz
          </span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            href="/learn"
            className="text-sm text-primary font-semibold hover:text-primary-hover transition-colors"
          >
            学習
          </Link>
          {user && isFreeMember && (
            <Link
              href="/home"
              className="text-sm text-secondary hover:text-foreground transition-colors"
            >
              ホーム
            </Link>
          )}
          {user && !user.is_anonymous ? (
            <button
              onClick={() => signOut()}
              className="text-sm text-secondary hover:text-foreground transition-colors"
            >
              ログアウト
            </button>
          ) : (
            <Link
              href="/login"
              className="text-sm text-primary hover:text-primary-hover font-medium transition-colors"
            >
              ログイン
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
