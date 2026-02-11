"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  current: number;
  total: number;
  correctCount: number;
  className?: string;
}

export function ProgressBar({
  current,
  total,
  correctCount,
  className,
}: ProgressBarProps) {
  const progress = total > 0 ? ((current + 1) / total) * 100 : 0;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between items-center text-sm">
        <span className="text-secondary">
          問題{" "}
          <span className="font-semibold text-foreground">
            {current + 1}
          </span>{" "}
          / {total}
        </span>
        <span className="text-secondary">
          正解{" "}
          <span className="font-semibold text-success">{correctCount}</span>
          {current > 0 && (
            <span className="ml-1 text-xs">
              ({Math.round((correctCount / current) * 100)}%)
            </span>
          )}
        </span>
      </div>
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <div
          className="bg-primary h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
