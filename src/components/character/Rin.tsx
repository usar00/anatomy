"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { SpeechBubble } from "./SpeechBubble";
import type { CharacterState } from "@/types/quiz";

const stateImages: Record<CharacterState, string> = {
  idle: "/images/rin/idle.png",
  happy: "/images/rin/happy.png",
  encouraging: "/images/rin/encouraging.png",
  thinking: "/images/rin/thinking.png",
  celebrating: "/images/rin/celebrating.png",
  comforting: "/images/rin/comforting.png",
};

interface RinProps {
  state: CharacterState;
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: { width: 80, height: 80 },
  md: { width: 120, height: 120 },
  lg: { width: 160, height: 160 },
};

export function Rin({
  state,
  message,
  size = "md",
  className = "",
}: RinProps) {
  const [showMessage, setShowMessage] = useState(false);
  const { width, height } = sizes[size];

  useEffect(() => {
    if (message) {
      setShowMessage(true);
      const timer = setTimeout(() => setShowMessage(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [message, state]);

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <SpeechBubble message={message || ""} visible={showMessage} />
      <AnimatePresence mode="wait">
        <motion.div
          key={state}
          initial={{ opacity: 0.6, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0.6, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <Image
            src={stateImages[state]}
            alt={`リン - ${state}`}
            width={width}
            height={height}
            className="object-contain"
            priority={state === "idle"}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
