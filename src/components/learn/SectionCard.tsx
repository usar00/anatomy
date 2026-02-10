"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { SectionWithProgress } from "@/types/quiz";

interface SectionCardProps {
  section: SectionWithProgress;
  index: number;
}

function Stars({ count, max = 3 }: { count: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={cn("text-sm", i < count ? "text-warning" : "text-muted")}>
          &#9733;
        </span>
      ))}
    </div>
  );
}

export function SectionCard({ section, index }: SectionCardProps) {
  const router = useRouter();
  const status = section.progress?.status || "locked";
  const isLocked = status === "locked";
  const isCompleted = status === "completed";
  const stars = section.progress?.stars || 0;

  const handleClick = () => {
    if (isLocked) return;
    router.push(`/learn/${section.id}`);
  };

  // Zigzag layout offset
  const offset = index % 2 === 0 ? "ml-0" : "ml-12";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className={cn("flex flex-col items-center", offset)}
    >
      <button
        onClick={handleClick}
        disabled={isLocked}
        className={cn(
          "relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200",
          "border-4 shadow-lg",
          isLocked && "bg-muted border-card-border text-secondary cursor-not-allowed opacity-50",
          !isLocked && !isCompleted && "bg-primary border-primary-hover text-white hover:scale-110 cursor-pointer",
          isCompleted && "bg-success border-success text-white hover:scale-110 cursor-pointer"
        )}
      >
        {isLocked ? (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        ) : isCompleted ? (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      {/* Stars (if completed or attempted) */}
      {!isLocked && (section.progress?.attempts || 0) > 0 && (
        <Stars count={stars} />
      )}

      {/* Section name */}
      <p
        className={cn(
          "text-xs font-medium mt-1 text-center max-w-[120px] leading-tight",
          isLocked ? "text-secondary/60" : "text-foreground"
        )}
      >
        {section.name}
      </p>
    </motion.div>
  );
}
