"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useAuth } from "@/lib/store/auth";
import { api } from "@/lib/api/client";
import { Droplets, Loader2, ArrowLeft, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import type { FormEvent } from "react";

// Dynamic imports for code splitting - public pages
const HomePage = dynamic(() => import("@/components/pages/HomePage").then(m => ({ default: m.HomePage })), { ssr: false, loading: () => <LoadingSpinner /> });
const EventsPage = dynamic(() => import("@/components/pages/EventsPage").then(m => ({ default: m.EventsPage })), { ssr: false, loading: () => <LoadingSpinner /> });
const AboutPage = dynamic(() => import("@/components/pages/AboutPage").then(m => ({ default: m.AboutPage })), { ssr: false, loading: () => <LoadingSpinner /> });
const ContactPage = dynamic(() => import("@/components/pages/ContactPage").then(m => ({ default: m.ContactPage })), { ssr: false, loading: () => <LoadingSpinner /> });
const EventPublicDetail = dynamic(() => import("@/components/pages/EventPublicDetail").then(m => ({ default: m.EventPublicDetail })), { ssr: false, loading: () => <LoadingSpinner /> });
const NewsPublicPage = dynamic(() => import("@/components/pages/NewsPublicPage").then(m => ({ default: m.NewsPublicPage })), { ssr: false, loading: () => <LoadingSpinner /> });

// Dynamic imports - dashboard
const DashboardLayout = dynamic(() => import("@/components/pages/dashboard/DashboardLayout").then(m => ({ default: m.DashboardLayout })), { ssr: false, loading: () => <LoadingSpinner /> });
const EventDetailPage = dynamic(() => import("@/components/pages/dashboard/EventDetailPage").then(m => ({ default: m.EventDetailPage })), { ssr: false });
const SupabasePanel = dynamic(() => import("@/components/pages/dashboard/panels/SupabasePanel").then(m => ({ default: m.SupabasePanel })), { ssr: false });
const SettingsPanel = dynamic(() => import("@/components/pages/dashboard/panels/SettingsPanel").then(m => ({ default: m.SettingsPanel })), { ssr: false });
const AnalyticsPanel = dynamic(() => import("@/components/pages/dashboard/panels/AnalyticsPanel").then(m => ({ default: m.AnalyticsPanel })), { ssr: false });
const NewsPanel = dynamic(() => import("@/components/pages/dashboard/panels/NewsPanel").then(m => ({ default: m.NewsPanel })), { ssr: false });
const NotificationsPanel = dynamic(() => import("@/components/pages/dashboard/panels/NotificationsPanel").then(m => ({ default: m.NotificationsPanel })), { ssr: false });
const UsersPanel = dynamic(() => import("@/components/pages/dashboard/panels/UsersPanel").then(m => ({ default: m.UsersPanel })), { ssr: false });
const NewsletterPanel = dynamic(() => import("@/components/pages/dashboard/panels/NewsletterPanel").then(m => ({ default: m.NewsletterPanel })), { ssr: false });
const WorkflowPanel = dynamic(() => import("@/components/pages/dashboard/panels/WorkflowPanel").then(m => ({ default: m.WorkflowPanel })), { ssr: false });

function parseRoute(hash: string): { route: string; params: Record<string, string> } {
  const path = hash.replace(/^#\/?/, "") || "/";
  const parts = path.split("/").filter(Boolean);
  const params: Record<string, string> = {};

  if (parts[0] === "dashboard") {
    if (parts[1] === "events" && parts[2]) {
      return { route: "/dashboard/event-detail", params: { eventId: parts[2] } };
    }
    if (parts[1] === "events") return { route: "/dashboard/events", params };
    if (parts[1] === "create") return { route: "/dashboard/create-event", params };
    if (parts[1] === "supabase") return { route: "/dashboard/supabase", params };
    if (parts[1] === "settings") return { route: "/dashboard/settings", params };
    if (parts[1] === "analytics") return { route: "/dashboard/analytics", params };
    if (parts[1] === "news" && parts[2]) return { route: "/dashboard/news-edit", params: { newsId: parts[2] } };
    if (parts[1] === "news") return { route: "/dashboard/news", params };
    if (parts[1] === "notifications") return { route: "/dashboard/notifications", params };
    if (parts[1] === "users") return { route: "/dashboard/users", params };
    if (parts[1] === "newsletter") return { route: "/dashboard/newsletter", params };
    if (parts[1] === "workflows") return { route: "/dashboard/workflows", params };
    return { route: "/dashboard", params };
  }

  // Public routes
  if (parts[0] === "events" && parts[1]) {
    return { route: "/event-detail", params: { eventId: parts[1] } };
  }
  if (parts[0] === "news") {
    return { route: "/news", params };
  }

  return { route: "/" + parts.join("/"), params };
}

function LoadingSpinner() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl animate-pulse" style={{ background: "linear-gradient(135deg, #1a3a5c, #3d6d8a)" }}>
          <Droplets className="h-5 w-5 text-white" />
        </div>
        <div className="text-sm text-muted-foreground">Loading…</div>
      </div>
    </div>
  );
}

function AuthPage({ onNavigate }: { onNavigate: (r: string) => void }) {
  const { setUser, user } = useAuth();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) onNavigate("/dashboard");
  }, [user, onNavigate]);

  async function handleSignIn(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = (fd.get("email") as string)?.trim();
    const password = fd.get("password") as string;
    if (!email || !password) { toast.error("Email and password are required"); return; }
    setBusy(true);
    try {
      const res = await api.post<{ user: { id: string; email: string; name: string | null; role: string } }>("/auth/signin", { email, password });
      setUser({ id: res.user.id, email: res.user.email, displayName: res.user.name ?? undefined, role: res.user.role });
      toast.success("Welcome back!");
      onNavigate("/dashboard");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Sign in failed");
    } finally { setBusy(false); }
  }

  async function handleSignUp(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = (fd.get("name") as string)?.trim();
    const email = (fd.get("email") as string)?.trim();
    const password = fd.get("password") as string;
    if (!name || !email || !password) { toast.error("All fields are required"); return; }
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setBusy(true);
    try {
      await api.post("/auth/signup", { name, email, password });
      toast.success("Account created! Please sign in.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Sign up failed");
    } finally { setBusy(false); }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-secondary/40 via-background to-secondary/30">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-water-light/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-civic/10 blur-3xl" />
      </div>
      <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
        <motion.button
          initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
          onClick={() => onNavigate("/")}
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to site
        </motion.button>
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.65, 0, 0.35, 1] }}
          className="rounded-3xl border border-border/70 bg-card p-8 shadow-elevated sm:p-10"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: "linear-gradient(135deg, #1a3a5c, #3d6d8a)" }}>
              <Droplets className="h-6 w-6 text-white" />
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
              {isSupabaseConfigured() && (
                <div className="mb-4 grid grid-cols-2 gap-3">
                  <Button variant="outline" className="w-full" onClick={async () => {
                    const { supabase } = await import("@/lib/supabase/client");
                    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${location.origin}/api/supabase/auth-callback` } });
                    if (error) toast.error(error.message);
                  }}>
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    Google
                  </Button>
                  <Button variant="outline" className="w-full" onClick={async () => {
                    const { supabase } = await import("@/lib/supabase/client");
                    const { error } = await supabase.auth.signInWithOAuth({ provider: "github", options: { redirectTo: `${location.origin}/api/supabase/auth-callback` } });
                    if (error) toast.error(error.message);
                  }}>
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                    GitHub
                  </Button>
                </div>
              )}
              {!isSupabaseConfigured() && (
                <div className="mb-4 rounded-xl bg-secondary/30 p-3 text-center text-xs text-muted-foreground">
                  <Database className="mx-auto h-4 w-4 mb-1" />
                  <p>Supabase not configured. Set <code className="rounded bg-secondary px-1">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="rounded bg-secondary px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in <code className="rounded bg-secondary px-1">.env.local</code> to enable OAuth.</p>
                </div>
              )}
              <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
                <div className="h-px flex-1 bg-border" /> or email <div className="h-px flex-1 bg-border" />
              </div>
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <Label htmlFor="signin-email">Email</Label>
                  <Input id="signin-email" name="email" type="email" required className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="signin-password">Password</Label>
                  <Input id="signin-password" name="password" type="password" required minLength={6} className="mt-1.5" />
                </div>
                <div className="text-right">
                  <button type="button" className="text-xs text-primary hover:underline" onClick={() => toast.info("Password reset will be sent to your email")}>
                    Forgot password?
                  </button>
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in…</> : "Sign in"}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup" className="mt-6">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <Label htmlFor="signup-name">Full name</Label>
                  <Input id="signup-name" name="name" required maxLength={100} className="mt-1.5" />
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
                  {busy ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating…</> : "Create account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}

export default function Home() {
  const [route, setRoute] = useState("/");
  const [params, setParams] = useState<Record<string, string>>({});
  const [authChecked, setAuthChecked] = useState(false);
  const { user, setUser, signOut } = useAuth();

  useEffect(() => {
    api.get<{ user: { id: string; email: string; name: string | null; role: string } | null }>("/auth/me")
      .then((data) => {
        if (data.user) {
          setUser({ id: data.user.id, email: data.user.email, displayName: data.user.name ?? undefined, role: data.user.role });
        }
      })
      .catch(() => {})
      .finally(() => setAuthChecked(true));
  }, [setUser]);

  // Pre-fetch all public page chunks in background after initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      Promise.all([
        import("@/components/pages/EventsPage"),
        import("@/components/pages/AboutPage"),
        import("@/components/pages/ContactPage"),
        import("@/components/pages/EventPublicDetail"),
        import("@/components/pages/NewsPublicPage"),
        import("@/components/pages/HomePage"),
      ]);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleHash = () => {
      const { route: r, params: p } = parseRoute(window.location.hash);
      setRoute(r);
      setParams(p);
    };
    window.addEventListener("hashchange", handleHash);
    handleHash();
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const navigate = useCallback((target: string) => {
    window.location.hash = target;
  }, []);

  const handleSignOut = useCallback(async () => {
    try { await api.post("/auth/signout"); } catch { /* ignore */ }
    signOut();
    navigate("/");
  }, [signOut, navigate]);

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (route === "/auth") {
    return <AuthPage onNavigate={navigate} />;
  }

  // Dashboard - require auth
  if (route.startsWith("/dashboard")) {
    if (!user) {
      navigate("/auth");
      return <LoadingSpinner />;
    }
    return (
      <DashboardLayout user={user} currentRoute={route} onNavigate={navigate} onSignOut={handleSignOut} params={params}>
        <AnimatePresence mode="wait">
          {route === "/dashboard" && <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><DashboardOverview user={user} onNavigate={navigate} /></motion.div>}
          {route === "/dashboard/events" && <motion.div key="events" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><DashboardEvents user={user} onNavigate={navigate} /></motion.div>}
          {route === "/dashboard/create-event" && <motion.div key="create" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><EventCreate user={user} onNavigate={navigate} /></motion.div>}
          {route === "/dashboard/event-detail" && <motion.div key="detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><EventDetailPage eventId={params.eventId} onNavigate={navigate} user={user} /></motion.div>}
          {route === "/dashboard/supabase" && <motion.div key="supabase" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><SupabasePanel /></motion.div>}
          {route === "/dashboard/settings" && <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><SettingsPanel /></motion.div>}
          {route === "/dashboard/analytics" && <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><AnalyticsPanel /></motion.div>}
          {route === "/dashboard/news" && <motion.div key="news" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><NewsPanel /></motion.div>}
          {route === "/dashboard/news-edit" && <motion.div key="news-edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><NewsPanel editId={params.newsId} /></motion.div>}
          {route === "/dashboard/notifications" && <motion.div key="notifs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><NotificationsPanel /></motion.div>}
          {route === "/dashboard/users" && <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><UsersPanel /></motion.div>}
          {route === "/dashboard/newsletter" && <motion.div key="newsletter" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><NewsletterPanel /></motion.div>}
          {route === "/dashboard/workflows" && <motion.div key="workflows" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><WorkflowPanel /></motion.div>}
        </AnimatePresence>
      </DashboardLayout>
    );
  }

  // Public pages
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader currentRoute={route} user={user ? { id: user.id, email: user.email, name: user.displayName ?? null, role: user.role ?? "viewer" } : null} onNavigate={navigate} />
      {route === "/" && <HomePage onNavigate={navigate} />}
      {route === "/events" && <EventsPage onNavigate={navigate} />}
      {route === "/event-detail" && <EventPublicDetail eventId={params.eventId} onNavigate={navigate} />}
      {route === "/news" && <NewsPublicPage />}
      {route === "/about" && <AboutPage />}
      {route === "/contact" && <ContactPage />}
      <SiteFooter onNavigate={navigate} />
    </div>
  );
}

/* ── Inline dashboard sub-pages ────────────────────── */

function DashboardOverview({ user, onNavigate }: { user: { id: string; email: string; displayName?: string; role?: string }; onNavigate: (r: string) => void }) {
  const [stats, setStats] = useState({ total: 0, upcoming: 0, completed: 0, participants: 0 });
  const [recentEvents, setRecentEvents] = useState<Array<{ id: string; title: string; status: string; startAt: string | null; region: string | null }>>([]);

  useEffect(() => {
    api.get<{ stats: typeof stats }>("/dashboard").then(d => setStats(d.stats)).catch(() => {});
    api.get<{ events: typeof recentEvents }>("/events").then(d => setRecentEvents(d.events.slice(0, 5))).catch(() => {});
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold">Welcome back{user.displayName ? `, ${user.displayName}` : ""}</h1>
        <p className="mt-1 text-muted-foreground">Here&apos;s an overview of your KYPW operations.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Events", value: stats.total, color: "text-water-deep" },
          { label: "Upcoming", value: stats.upcoming, color: "text-civic" },
          { label: "Completed", value: stats.completed, color: "text-clay" },
          { label: "Participants", value: stats.participants, color: "text-sun-foreground" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border border-border/70 bg-card p-6">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">{s.label}</div>
            <div className={`mt-2 font-display text-4xl font-semibold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Recent Events</h2>
          <Button variant="ghost" size="sm" onClick={() => onNavigate("/dashboard/events")}>View all</Button>
        </div>
        <div className="mt-4 space-y-2">
          {recentEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No events yet. Create your first event!</p>
          ) : recentEvents.map(e => (
            <button key={e.id} onClick={() => onNavigate(`/dashboard/events/${e.id}`)} className="w-full flex items-center justify-between rounded-xl border border-border/60 bg-card px-4 py-3 text-left hover:border-primary/30 transition-colors">
              <div>
                <div className="font-medium">{e.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{e.region ?? "No region"} · {e.startAt ? new Date(e.startAt).toLocaleDateString("en-KE") : "TBD"}</div>
              </div>
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{e.status}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function DashboardEvents({ user, onNavigate }: { user: { id: string; email: string; role?: string }; onNavigate: (r: string) => void }) {
  const [events, setEvents] = useState<Array<{ id: string; title: string; status: string; startAt: string | null; endAt: string | null; region: string | null; eventType: string }>>([]);
  const [loading, setLoading] = useState(true);
  const canCreate = ["admin", "coordinator"].includes(user.role ?? "viewer");

  useEffect(() => {
    api.get<{ events: typeof events }>("/events").then(d => { setEvents(d.events); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const statusColor: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    published: "bg-water-light/30 text-water-deep",
    ongoing: "bg-sun/20 text-sun-foreground",
    completed: "bg-civic/20 text-civic",
    planned: "bg-clay/20 text-clay",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold">Events</h1>
        {canCreate && <Button onClick={() => onNavigate("/dashboard/create-event")}>+ New Event</Button>}
      </div>
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : events.length === 0 ? (
        <div className="py-16 text-center"><Droplets className="mx-auto h-12 w-12 text-primary/30" /><p className="mt-4 text-muted-foreground">No events yet.</p>{canCreate && <Button className="mt-4" onClick={() => onNavigate("/dashboard/create-event")}>Create your first event</Button>}</div>
      ) : (
        <div className="space-y-2">
          {events.map(e => (
            <button key={e.id} onClick={() => onNavigate(`/dashboard/events/${e.id}`)} className="w-full flex items-center justify-between rounded-xl border border-border/60 bg-card px-5 py-4 text-left hover:border-primary/30 transition-colors">
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate">{e.title}</div>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="capitalize">{e.eventType.replace(/_/g, " ")}</span>
                  {e.region && <span>{e.region}</span>}
                  {e.startAt && <span>{new Date(e.startAt).toLocaleDateString("en-KE", { month: "short", day: "numeric" })}{e.endAt && ` - ${new Date(e.endAt).toLocaleDateString("en-KE", { month: "short", day: "numeric" })}`}</span>}
                </div>
              </div>
              <span className={`ml-4 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest shrink-0 ${statusColor[e.status] ?? "bg-muted text-muted-foreground"}`}>{e.status}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function EventCreate({ user, onNavigate }: { user: { id: string; email: string; role?: string }; onNavigate: (r: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", eventType: "workshop", status: "draft", startAt: "", endAt: "", region: "", locationName: "", locationType: "physical" });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    setBusy(true);
    try {
      const res = await api.post<{ event: { id: string } }>("/events", {
        ...form,
        startAt: form.startAt || null,
        endAt: form.endAt || null,
        region: form.region || null,
        locationName: form.locationName || null,
      });
      toast.success("Event created!");
      onNavigate(`/dashboard/events/${res.event.id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create event");
    } finally { setBusy(false); }
  }

  const update = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm(f => ({ ...f, [key]: e.target.value }));

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => onNavigate("/dashboard/events")}><ArrowLeft className="h-4 w-4 mr-1" /> Events</Button>
      </div>
      <h1 className="font-display text-3xl font-semibold">Create Event</h1>
      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-border/70 bg-card p-6">
        <div><Label htmlFor="ev-title">Title</Label><Input id="ev-title" value={form.title} onChange={update("title")} required className="mt-1.5" placeholder="e.g. Nairobi Water Security Workshop" /></div>
        <div><Label htmlFor="ev-desc">Description</Label><textarea id="ev-desc" value={form.description} onChange={update("description")} rows={4} className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Describe the event…" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label htmlFor="ev-type">Type</Label><select id="ev-type" value={form.eventType} onChange={update("eventType")} className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="workshop">Workshop</option><option value="dialogue">Dialogue</option><option value="hackathon">Hackathon</option><option value="webinar">Webinar</option><option value="field_visit">Field Visit</option><option value="conference">Conference</option></select></div>
          <div><Label htmlFor="ev-status">Status</Label><select id="ev-status" value={form.status} onChange={update("status")} className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="draft">Draft</option><option value="planned">Planned</option><option value="published">Published</option><option value="ongoing">Ongoing</option><option value="completed">Completed</option></select></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label htmlFor="ev-start">Start Date</Label><Input id="ev-start" type="datetime-local" value={form.startAt} onChange={update("startAt")} className="mt-1.5" /></div>
          <div><Label htmlFor="ev-end">End Date</Label><Input id="ev-end" type="datetime-local" value={form.endAt} onChange={update("endAt")} className="mt-1.5" /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label htmlFor="ev-region">Region / County</Label><Input id="ev-region" value={form.region} onChange={update("region")} className="mt-1.5" placeholder="e.g. Nairobi" /></div>
          <div><Label htmlFor="ev-venue">Venue</Label><Input id="ev-venue" value={form.locationName} onChange={update("locationName")} className="mt-1.5" placeholder="e.g. KICC" /></div>
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={busy}>{busy ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating…</> : "Create Event"}</Button>
          <Button type="button" variant="outline" onClick={() => onNavigate("/dashboard/events")}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
