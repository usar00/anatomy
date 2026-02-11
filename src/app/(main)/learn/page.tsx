"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { fetchUnitsWithProgress } from "@/lib/queries/learning";
import { UnitMap } from "@/components/learn/UnitMap";
import { Rin } from "@/components/character/Rin";
import { getRandomMessage, lessonStartMessages } from "@/components/character/messages";
import type { UnitWithSections, CharacterState } from "@/types/quiz";

export default function LearnPage() {
  const { user, isLoading: authLoading, signInAnonymously } = useAuth();
  const [units, setUnits] = useState<UnitWithSections[]>([]);
  const [loading, setLoading] = useState(true);
  const [rinState, setRinState] = useState<CharacterState>("idle");
  const [rinMessage, setRinMessage] = useState("");
  const fetched = useRef(false);

  useEffect(() => {
    if (authLoading) return;

    // Auto sign-in anonymously if no user (guest flow)
    if (!user) {
      signInAnonymously().catch((err) =>
        console.error("Failed to sign in anonymously:", err)
      );
      return;
    }

    if (fetched.current) return;
    fetched.current = true;

    const load = async () => {
      const supabase = createClient();
      const data = await fetchUnitsWithProgress(supabase, user.id);
      setUnits(data);
      setLoading(false);

      const msg = getRandomMessage(lessonStartMessages);
      setRinState(msg.state);
      setRinMessage(msg.text);
    };

    load();
  }, [user, authLoading, signInAnonymously]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-secondary">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      {/* Character greeting */}
      <div className="mb-6">
        <Rin state={rinState} message={rinMessage} size="md" />
      </div>

      {/* Unit map */}
      <UnitMap units={units} />
    </div>
  );
}
