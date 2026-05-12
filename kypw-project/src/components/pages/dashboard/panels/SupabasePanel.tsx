"use client";

import { useState, useEffect } from "react";
import { Database, CheckCircle2, XCircle, RefreshCw, ArrowRightLeft, Loader2, AlertTriangle, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface SupabaseStatus {
  configured: boolean;
  connected: boolean;
  tablesExist: boolean;
  schemaMissing?: boolean;
  supabase: { profiles: number; events: number };
  local: { events: number; participants: number };
  message?: string;
  error?: string;
}

interface SyncResult {
  direction: string;
  results: Record<string, { synced: number; errors: string[] }>;
  syncedAt: string;
}

export function SupabasePanel() {
  const [status, setStatus] = useState<SupabaseStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/supabase/status");
      const data = await res.json();
      setStatus(data);
    } catch { /* silent */ }
    setLoading(false);
  };

  useEffect(() => { loadStatus(); }, []);

  async function handleSync() {
    if (!status?.configured) return;
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/supabase/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          direction: "push",
          tables: ["events", "participants", "documentation", "metrics", "reports"],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sync failed");
      setSyncResult(data);
      toast.success("Data synced to Supabase");
      loadStatus(); // refresh counts
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sync failed");
    }
    setSyncing(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold">Supabase Integration</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect to your Supabase project for cloud database, authentication, and storage.
        </p>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="h-4 w-4" /> Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!status?.configured ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-400">Not Configured</p>
                  <p className="mt-1 text-sm text-amber-700 dark:text-amber-400/80">
                    Set these environment variables in <code className="rounded bg-amber-100 dark:bg-amber-900/50 px-1.5 py-0.5 text-xs">.env.local</code>:
                  </p>
                  <div className="mt-3 space-y-1.5 text-xs font-mono">
                    <div className="rounded bg-amber-100/50 dark:bg-amber-900/30 p-2">
                      <span className="text-muted-foreground">NEXT_PUBLIC_SUPABASE_URL=</span>
                      <span className="text-amber-700 dark:text-amber-400">https://your-project.supabase.co</span>
                    </div>
                    <div className="rounded bg-amber-100/50 dark:bg-amber-900/30 p-2">
                      <span className="text-muted-foreground">NEXT_PUBLIC_SUPABASE_ANON_KEY=</span>
                      <span className="text-amber-700 dark:text-amber-400">eyJhbGciOi...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : status?.schemaMissing ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-400">Schema Not Found</p>
                  <p className="mt-1 text-sm text-amber-700 dark:text-amber-400/80">
                    Connected to Supabase but the required tables don&apos;t exist yet. Run the SQL schema file in your Supabase SQL Editor.
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <code className="text-xs bg-amber-100/50 dark:bg-amber-900/30 px-2 py-1 rounded">supabase/schema.sql</code>
                    <a
                      href="https://supabase.com/dashboard"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 hover:underline"
                    >
                      Open Supabase Dashboard <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-3">
              <div className="flex items-center gap-2">
                {status?.connected ? (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    <CheckCircle2 className="mr-1 h-3 w-3" /> Connected
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="mr-1 h-3 w-3" /> Disconnected
                  </Badge>
                )}
              </div>

              {/* Count comparison */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border/70 bg-secondary/20 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Local (SQLite)</p>
                  <div className="mt-2 space-y-1 text-sm">
                    <div className="flex justify-between"><span>Events</span><span className="font-semibold">{status?.local.events ?? 0}</span></div>
                    <div className="flex justify-between"><span>Participants</span><span className="font-semibold">{status?.local.participants ?? 0}</span></div>
                  </div>
                </div>
                <div className="rounded-lg border border-border/70 bg-secondary/20 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Supabase (Cloud)</p>
                  <div className="mt-2 space-y-1 text-sm">
                    <div className="flex justify-between"><span>Profiles</span><span className="font-semibold">{status?.supabase.profiles ?? 0}</span></div>
                    <div className="flex justify-between"><span>Events</span><span className="font-semibold">{status?.supabase.events ?? 0}</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sync Controls */}
      {status?.configured && status?.tablesExist && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4" /> Data Sync
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Push your local SQLite data to Supabase. This upserts records - existing records are updated, new ones are created.
            </p>
            <div className="flex items-center gap-3">
              <Button onClick={handleSync} disabled={syncing}>
                {syncing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Syncing…</> : <><RefreshCw className="mr-2 h-4 w-4" />Push local → Supabase</>}
              </Button>
              <Button variant="outline" size="sm" onClick={loadStatus}>
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />Refresh
              </Button>
            </div>

            {syncResult && (
              <div className="rounded-lg border border-border/70 bg-card p-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                  Sync result - {syncResult.syncedAt ? new Date(syncResult.syncedAt).toLocaleString("en-KE") : ""}
                </p>
                <div className="space-y-1.5">
                  {Object.entries(syncResult.results).map(([table, result]) => (
                    <div key={table} className="flex items-center justify-between text-xs">
                      <span className="font-mono">{table}</span>
                      <div className="flex items-center gap-2">
                        <span className={result.errors.length === 0 ? "text-green-600" : "text-red-600"}>
                          {result.synced} synced
                        </span>
                        {result.errors.length > 0 && (
                          <Badge variant="destructive" className="text-[10px]">{result.errors.length} errors</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {Object.values(syncResult.results).some((r) => r.errors.length > 0) && (
                  <div className="mt-3 max-h-40 overflow-auto space-y-1">
                    {Object.entries(syncResult.results).flatMap(([table, result]) =>
                      result.errors.map((err, i) => (
                        <p key={`${table}-${i}`} className="text-[10px] text-red-600">
                          [{table}] {err}
                        </p>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Reference */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Reference</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="font-medium">1. Create Supabase project</p>
            <p className="text-muted-foreground">Go to <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-civic hover:underline">supabase.com/dashboard</a> and create a new project.</p>
          </div>
          <Separator />
          <div>
            <p className="font-medium">2. Run the SQL schema</p>
            <p className="text-muted-foreground">Open the SQL Editor in your Supabase dashboard and run the contents of <code className="rounded bg-secondary px-1.5 py-0.5 text-xs">supabase/schema.sql</code>.</p>
          </div>
          <Separator />
          <div>
            <p className="font-medium">3. Set environment variables</p>
            <p className="text-muted-foreground">Copy your project URL and anon key into <code className="rounded bg-secondary px-1.5 py-0.5 text-xs">.env.local</code>, then restart the dev server.</p>
          </div>
          <Separator />
          <div>
            <p className="font-medium">4. Enable OAuth providers</p>
            <p className="text-muted-foreground">In Supabase → Authentication → Providers, enable Google and/or GitHub OAuth.</p>
          </div>
          <Separator />
          <div>
            <p className="font-medium">5. Sync your data</p>
            <p className="text-muted-foreground">Use the sync button above to push your local SQLite data into Supabase.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
