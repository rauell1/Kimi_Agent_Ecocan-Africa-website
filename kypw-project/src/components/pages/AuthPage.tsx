"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Droplets, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface AuthPageProps {
  onNavigate: (route: string) => void;
  onAuthSuccess: () => void;
  user: unknown;
}

export function AuthPage({ onNavigate, onAuthSuccess, user }: AuthPageProps) {
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) onNavigate("/dashboard");
  }, [user, onNavigate]);

  async function handleSignIn(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = (fd.get("email") as string)?.trim();
    const password = (fd.get("password") as string);

    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sign in failed");
      toast.success("Welcome back!");
      onAuthSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleSignUp(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const displayName = (fd.get("displayName") as string)?.trim();
    const email = (fd.get("email") as string)?.trim();
    const password = (fd.get("password") as string);

    if (!displayName) { toast.error("Name is required"); return; }
    if (!email) { toast.error("Email is required"); return; }
    if (!password || password.length < 6) { toast.error("Password must be at least 6 characters"); return; }

    setBusy(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name: displayName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sign up failed");
      toast.success("Account created! Welcome aboard.");
      onAuthSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-secondary/40 via-background to-secondary/30">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
        <button onClick={() => onNavigate("/")} className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to site
        </button>

        <div className="rounded-3xl border border-border/70 bg-card p-8 shadow-elevated sm:p-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-hero">
              <Droplets className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <div className="font-display text-lg font-semibold leading-tight">KYPW Dashboard</div>
              <div className="text-xs text-muted-foreground">Coordinator access</div>
            </div>
          </div>

          <Tabs defaultValue="signin" className="mt-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-6">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <Label htmlFor="signin-email">Email</Label>
                  <Input id="signin-email" name="email" type="email" required className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="signin-password">Password</Label>
                  <Input id="signin-password" name="password" type="password" required className="mt-1.5" />
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? "Signing in…" : "Sign in"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-6">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <Label htmlFor="signup-name">Full name</Label>
                  <Input id="signup-name" name="displayName" required maxLength={100} className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="signup-email">Email</Label>
                  <Input id="signup-email" name="email" type="email" required className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="signup-password">Password</Label>
                  <Input id="signup-password" name="password" type="password" required minLength={6} className="mt-1.5" />
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? "Creating…" : "Create account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            Demo credentials
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="rounded-xl bg-secondary/50 p-3 text-center text-xs text-muted-foreground">
            <p className="font-medium text-foreground">admin@kypw.ke / admin123</p>
            <p className="mt-0.5">Sign in with these credentials to explore the dashboard</p>
          </div>
        </div>
      </div>
    </div>
  );
}
