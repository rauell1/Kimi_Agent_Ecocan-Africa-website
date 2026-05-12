"use client";

import { useEffect, useState, useCallback } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  configured: boolean;
}

interface AuthActions {
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, fullName?: string) => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<void>;
  signInWithProvider: (provider: "google" | "github") => Promise<void>;
  signOut: () => Promise<void>;
}

type UseSupabaseAuth = AuthState & AuthActions;

export function useSupabaseAuth(): UseSupabaseAuth {
  const configured = isSupabaseConfigured();

  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: configured,
    error: null,
    configured,
  });

  useEffect(() => {
    if (!configured) {
      return;
    }

    // loading is already true from initial state when configured

    // Get initial session with a timeout so the app doesn't hang forever
    const timeout = setTimeout(() => {
      setState((s) => ({ ...s, loading: false }));
    }, 5000);

    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(timeout);
      setState((s) => ({
        ...s,
        user: session?.user ?? null,
        session: session ?? null,
        loading: false,
        error: null,
      }));
    }).catch(() => {
      clearTimeout(timeout);
      setState((s) => ({ ...s, loading: false, error: "Failed to connect to Supabase" }));
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState((s) => ({
        ...s,
        user: session?.user ?? null,
        session: session ?? null,
        loading: false,
        error: null,
      }));
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [configured]);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    if (!configured) throw new Error("Supabase is not configured");
    setState((s) => ({ ...s, loading: true, error: null }));
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setState((s) => ({ ...s, loading: false, error: error.message }));
      throw error;
    }
    setState((s) => ({ ...s, loading: false }));
  }, [configured]);

  const signUpWithEmail = useCallback(
    async (email: string, password: string, fullName?: string) => {
      if (!configured) throw new Error("Supabase is not configured");
      setState((s) => ({ ...s, loading: true, error: null }));
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: fullName ? { data: { full_name: fullName } } : undefined,
      });
      if (error) {
        setState((s) => ({ ...s, loading: false, error: error.message }));
        throw error;
      }
      setState((s) => ({ ...s, loading: false }));
    },
    [configured],
  );

  const signInWithMagicLink = useCallback(async (email: string) => {
    if (!configured) throw new Error("Supabase is not configured");
    setState((s) => ({ ...s, loading: true, error: null }));
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/api/supabase/auth-callback`,
      },
    });
    if (error) {
      setState((s) => ({ ...s, loading: false, error: error.message }));
      throw error;
    }
    setState((s) => ({ ...s, loading: false }));
  }, [configured]);

  const signInWithProvider = useCallback(async (provider: "google" | "github") => {
    if (!configured) throw new Error("Supabase is not configured");
    setState((s) => ({ ...s, loading: true, error: null }));
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/api/supabase/auth-callback`,
      },
    });
    if (error) {
      setState((s) => ({ ...s, loading: false, error: error.message }));
      throw error;
    }
  }, [configured]);

  const signOut = useCallback(async () => {
    if (!configured) return;
    setState((s) => ({ ...s, loading: true }));
    const { error } = await supabase.auth.signOut();
    if (error) {
      setState((s) => ({ ...s, loading: false, error: error.message }));
      throw error;
    }
    setState({ user: null, session: null, loading: false, error: null, configured });
  }, [configured]);

  return {
    ...state,
    signInWithEmail,
    signUpWithEmail,
    signInWithMagicLink,
    signInWithProvider,
    signOut,
  };
}
