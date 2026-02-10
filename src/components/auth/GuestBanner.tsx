"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";

export function GuestBanner() {
  const { isGuest, upgradeToGoogle } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isGuest || dismissed) return null;

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      await upgradeToGoogle();
    } catch (error) {
      console.error("Upgrade error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-card-border shadow-lg">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <p className="text-sm text-secondary flex-1">
          <span className="font-medium text-foreground">
            Google アカウントで登録
          </span>
          すると、学習記録が永続保存されます
        </p>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleUpgrade}
            isLoading={isLoading}
          >
            登録する
          </Button>
          <button
            onClick={() => setDismissed(true)}
            className="text-secondary hover:text-foreground transition-colors p-1"
            aria-label="閉じる"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
