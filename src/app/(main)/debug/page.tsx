"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const DEBUG_PASS = "anatomy2026";

interface DebugData {
  profile: Record<string, unknown> | null;
  unitCount: number;
  sectionCount: number;
  questionCount: number;
  progressRows: Record<string, unknown>[];
  masteryRows: Record<string, unknown>[];
  streakRows: Record<string, unknown>[];
  sessionRows: Record<string, unknown>[];
}

export default function DebugPage() {
  const { user, isLoading, isGuest, isFreeMember } = useAuth();
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState("");
  const [data, setData] = useState<DebugData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUnlock = () => {
    if (pass === DEBUG_PASS) {
      setAuthed(true);
      setError("");
    } else {
      setError("パスワードが違います");
    }
  };

  useEffect(() => {
    if (!authed || isLoading) return;

    const load = async () => {
      setLoading(true);
      const supabase = createClient();

      // Profile
      let profile: Record<string, unknown> | null = null;
      if (user) {
        const { data: p } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        profile = p as Record<string, unknown> | null;
      }

      // Counts
      const [units, sections, questions] = await Promise.all([
        supabase.from("units").select("id", { count: "exact", head: true }),
        supabase.from("sections").select("id", { count: "exact", head: true }),
        supabase.from("questions").select("id", { count: "exact", head: true }),
      ]);

      // User progress
      let progressRows: Record<string, unknown>[] = [];
      let masteryRows: Record<string, unknown>[] = [];
      let streakRows: Record<string, unknown>[] = [];
      let sessionRows: Record<string, unknown>[] = [];

      if (user) {
        const [prog, mastery, streak, sessions] = await Promise.all([
          supabase.from("user_section_progress").select("*").eq("user_id", user.id),
          supabase.from("user_concept_mastery").select("*").eq("user_id", user.id).limit(20),
          supabase.from("daily_streaks").select("*").eq("user_id", user.id).order("study_date", { ascending: false }).limit(7),
          supabase.from("quiz_sessions").select("*").eq("user_id", user.id).order("started_at", { ascending: false }).limit(5),
        ]);
        progressRows = (prog.data || []) as Record<string, unknown>[];
        masteryRows = (mastery.data || []) as Record<string, unknown>[];
        streakRows = (streak.data || []) as Record<string, unknown>[];
        sessionRows = (sessions.data || []) as Record<string, unknown>[];
      }

      setData({
        profile,
        unitCount: units.count || 0,
        sectionCount: sections.count || 0,
        questionCount: questions.count || 0,
        progressRows,
        masteryRows,
        streakRows,
        sessionRows,
      });
      setLoading(false);
    };

    load();
  }, [authed, user, isLoading]);

  // Password gate
  if (!authed) {
    return (
      <div className="max-w-sm mx-auto px-4 py-20">
        <Card>
          <h1 className="text-lg font-bold mb-4">Debug</h1>
          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
            placeholder="パスワード"
            className="w-full px-3 py-2 border border-card-border rounded-lg bg-background text-foreground mb-3"
          />
          {error && <p className="text-danger text-sm mb-2">{error}</p>}
          <Button onClick={handleUnlock} className="w-full">
            開く
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-xl font-bold">Debug / 動作検証</h1>

      {/* Auth State */}
      <Card>
        <h2 className="font-bold text-sm text-secondary mb-2">認証状態</h2>
        <div className="space-y-1 text-sm">
          <Row label="isLoading" value={String(isLoading)} />
          <Row label="user" value={user ? "あり" : "なし"} ok={!!user} />
          <Row label="user.id" value={user?.id ?? "-"} />
          <Row label="user.email" value={user?.email ?? "(なし)"} />
          <Row label="provider" value={user?.app_metadata?.provider ?? "-"} />
          <Row label="is_anonymous" value={String(user?.is_anonymous ?? "-")} />
          <Row label="isGuest" value={String(isGuest)} />
          <Row label="isFreeMember" value={String(isFreeMember)} ok={isFreeMember} />
        </div>
      </Card>

      {/* Profile */}
      <Card>
        <h2 className="font-bold text-sm text-secondary mb-2">プロフィール (DB)</h2>
        {loading ? (
          <p className="text-sm text-secondary">読み込み中...</p>
        ) : data?.profile ? (
          <div className="space-y-1 text-sm">
            <Row label="display_name" value={String(data.profile.display_name ?? "-")} />
            <Row label="role" value={String(data.profile.role ?? "-")} ok={data.profile.role === "free" || data.profile.role === "premium"} />
            <Row label="avatar_url" value={data.profile.avatar_url ? "あり" : "なし"} />
            <Row label="created_at" value={String(data.profile.created_at ?? "-")} />
          </div>
        ) : (
          <p className="text-sm text-danger">プロフィールなし</p>
        )}
      </Card>

      {/* Content Counts */}
      <Card>
        <h2 className="font-bold text-sm text-secondary mb-2">コンテンツ</h2>
        {loading ? (
          <p className="text-sm text-secondary">読み込み中...</p>
        ) : (
          <div className="space-y-1 text-sm">
            <Row label="ユニット数" value={String(data?.unitCount ?? 0)} ok={(data?.unitCount ?? 0) > 0} />
            <Row label="セクション数" value={String(data?.sectionCount ?? 0)} ok={(data?.sectionCount ?? 0) > 0} />
            <Row label="問題数" value={String(data?.questionCount ?? 0)} ok={(data?.questionCount ?? 0) > 0} />
          </div>
        )}
      </Card>

      {/* User Progress */}
      <Card>
        <h2 className="font-bold text-sm text-secondary mb-2">学習進捗</h2>
        {!user ? (
          <p className="text-sm text-secondary">ログインが必要</p>
        ) : loading ? (
          <p className="text-sm text-secondary">読み込み中...</p>
        ) : (
          <div className="space-y-3">
            <div>
              <p className="text-xs text-secondary font-medium">セクション進捗 ({data?.progressRows.length ?? 0}件)</p>
              {(data?.progressRows.length ?? 0) === 0 ? (
                <p className="text-xs text-secondary">まだなし</p>
              ) : (
                <Table rows={data!.progressRows} keys={["section_id", "status", "stars", "best_score", "attempts"]} />
              )}
            </div>
            <div>
              <p className="text-xs text-secondary font-medium">コンセプト習熟 ({data?.masteryRows.length ?? 0}件)</p>
              {(data?.masteryRows.length ?? 0) === 0 ? (
                <p className="text-xs text-secondary">まだなし</p>
              ) : (
                <Table rows={data!.masteryRows} keys={["concept_id", "mastery_level", "times_correct", "times_seen"]} />
              )}
            </div>
            <div>
              <p className="text-xs text-secondary font-medium">ストリーク (直近7日)</p>
              {(data?.streakRows.length ?? 0) === 0 ? (
                <p className="text-xs text-secondary">まだなし</p>
              ) : (
                <Table rows={data!.streakRows} keys={["study_date", "questions_answered", "correct_answers"]} />
              )}
            </div>
            <div>
              <p className="text-xs text-secondary font-medium">セッション (直近5件)</p>
              {(data?.sessionRows.length ?? 0) === 0 ? (
                <p className="text-xs text-secondary">まだなし</p>
              ) : (
                <Table rows={data!.sessionRows} keys={["mode", "status", "total_questions", "correct_count", "started_at"]} />
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function Row({ label, value, ok }: { label: string; value: string; ok?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-secondary">{label}</span>
      <span className={`font-mono text-xs ${ok === true ? "text-success" : ok === false ? "text-danger" : ""}`}>
        {value.length > 40 ? value.slice(0, 37) + "..." : value}
      </span>
    </div>
  );
}

function Table({ rows, keys }: { rows: Record<string, unknown>[]; keys: string[] }) {
  return (
    <div className="overflow-x-auto mt-1">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-card-border">
            {keys.map((k) => (
              <th key={k} className="text-left py-1 pr-2 text-secondary font-medium">
                {k}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-card-border/50">
              {keys.map((k) => (
                <td key={k} className="py-1 pr-2 font-mono truncate max-w-[120px]">
                  {String(row[k] ?? "-")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
