"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isGuest: boolean;
  isFreeMember: boolean;
  signInAnonymously: () => Promise<void>;
  upgradeToGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isGuest: false,
  isFreeMember: false,
  signInAnonymously: async () => {},
  upgradeToGoogle: async () => {},
  signOut: async () => {},
});

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState<string>("guest");
  const supabase = createClient();

  // Fetch user role from profiles table
  const fetchRole = useCallback(
    async (userId: string) => {
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();
      if (data) setRole((data as { role: string }).role);
    },
    [supabase]
  );

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setIsLoading(false);
      // Fetch role in background (non-blocking)
      if (currentUser) fetchRole(currentUser.id);
    };

    getSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setIsLoading(false);
      if (currentUser) fetchRole(currentUser.id);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth, fetchRole]);

  const signInAnonymously = useCallback(async () => {
    const { error } = await supabase.auth.signInAnonymously();
    if (error) {
      console.error("Anonymous sign-in error:", error.message);
      throw error;
    }
  }, [supabase.auth]);

  const upgradeToGoogle = useCallback(async () => {
    const { error } = await supabase.auth.linkIdentity({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/learn`,
      },
    });
    if (error) {
      console.error("Upgrade to Google error:", error.message);
      throw error;
    }
    // After redirect + callback, update the profile role
    if (user) {
      await supabase
        .from("profiles")
        .update({ role: "free" })
        .eq("id", user.id);
      setRole("free");
    }
  }, [supabase, user]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Sign-out error:", error.message);
      throw error;
    }
    setRole("guest");
  }, [supabase.auth]);

  const isGuest = user?.is_anonymous ?? false;
  const isFreeMember = role === "free" || role === "premium";

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isGuest,
        isFreeMember,
        signInAnonymously,
        upgradeToGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
