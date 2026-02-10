"use client";

import { motion, AnimatePresence } from "framer-motion";

interface SpeechBubbleProps {
  message: string;
  visible: boolean;
}

export function SpeechBubble({ message, visible }: SpeechBubbleProps) {
  return (
    <AnimatePresence mode="wait">
      {visible && message && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.95 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative bg-card border border-card-border rounded-2xl px-4 py-3 shadow-sm max-w-[260px]"
        >
          <p className="text-sm text-foreground leading-relaxed">{message}</p>
          {/* Tail */}
          <div className="absolute -bottom-2 left-6 w-4 h-4 bg-card border-b border-r border-card-border rotate-45 -z-10" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
