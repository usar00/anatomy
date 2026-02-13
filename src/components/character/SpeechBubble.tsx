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
          initial={{ opacity: 0, x: -8, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -4, scale: 0.95 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative bg-card border border-card-border rounded-2xl px-4 py-3 shadow-sm"
        >
          <p className="text-base text-foreground leading-relaxed">{message}</p>
          {/* Tail pointing left toward character */}
          <div className="absolute top-1/2 -left-[7px] -translate-y-1/2 w-3 h-3 bg-card border-l border-b border-card-border rotate-45" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
