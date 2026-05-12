"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api/client";
import { toast } from "sonner";
import { Mail, Users, UserMinus, Loader2, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { isResendConfigured } from "@/lib/email";

interface Subscriber {
  id: string;
  email: string;
  firstName: string | null;
  source: string;
  status: string;
  subscribedAt: string;
  unsubscribedAt: string | null;
}

interface SubscribersStats {
  totalActive: number;
  totalUnsubscribed: number;
}

export function NewsletterPanel() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [stats, setStats] = useState<SubscribersStats>({ totalActive: 0, totalUnsubscribed: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"active" | "unsubscribed">("active");

  async function loadSubscribers() {
    setLoading(true);
    try {
      const data = await api.get<{ subscribers: Subscriber[]; stats: SubscribersStats }>(`/newsletter/subscribers?status=${filter}`);
      setSubscribers(data.subscribers ?? []);
      setStats(data.stats ?? { totalActive: 0, totalUnsubscribed: 0 });
    } catch {
      toast.error("Failed to load subscribers");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSubscribers();
  }, [filter]);

  async function handleUnsubscribe(email: string) {
    if (!confirm(`Unsubscribe ${email}?`)) return;
    try {
      await api.delete("/newsletter/subscribers", { email });
      toast.success("Unsubscribed");
      loadSubscribers();
    } catch {
      toast.error("Failed to unsubscribe");
    }
  }

  const resendReady = isResendConfigured();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Newsletter</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage subscribers and track engagement.
        </p>
      </div>

      {/* Resend Status */}
      <Card className={`border-border/70 ${resendReady ? "bg-emerald-50/50 dark:bg-emerald-950/20" : "bg-amber-50/50 dark:bg-amber-950/20"}`}>
        <CardContent className="p-5">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${resendReady ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" : "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"}`}>
              <Mail className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">Resend.com Integration</p>
                <Badge variant={resendReady ? "default" : "outline"} className={resendReady ? "bg-emerald-600" : ""}>
                  {resendReady ? "Connected" : "Not configured"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Resend integration for outbound transactional &amp; newsletter emails.
              </p>
              {!resendReady && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  Add your RESEND_API_KEY to .env to enable live email delivery.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-border/70">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Active</p>
                <p className="text-2xl font-semibold font-display">{stats.totalActive}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/70">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
                <UserMinus className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Unsubscribed</p>
                <p className="text-2xl font-semibold font-display">{stats.totalUnsubscribed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Button
          variant={filter === "active" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("active")}
        >
          Active ({stats.totalActive})
        </Button>
        <Button
          variant={filter === "unsubscribed" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("unsubscribed")}
        >
          Unsubscribed ({stats.totalUnsubscribed})
        </Button>
        <div className="ml-auto">
          <Button variant="ghost" size="sm" onClick={loadSubscribers} disabled={loading}>
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : subscribers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <Mail className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 font-display text-xl font-semibold">No subscribers yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {filter === "active"
              ? "Newsletter signups will appear here from the homepage and footer."
              : "No one has unsubscribed yet."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
          <div className="max-h-[480px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/40 hover:bg-secondary/40">
                  <TableHead className="text-xs uppercase tracking-widest">Email</TableHead>
                  <TableHead className="text-xs uppercase tracking-widest">Name</TableHead>
                  <TableHead className="text-xs uppercase tracking-widest">Source</TableHead>
                  <TableHead className="text-xs uppercase tracking-widest">Subscribed</TableHead>
                  {filter === "unsubscribed" && (
                    <TableHead className="text-xs uppercase tracking-widest">Unsubscribed</TableHead>
                  )}
                  <TableHead className="text-xs uppercase tracking-widest text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscribers.map((s) => (
                  <TableRow key={s.id} className="hover:bg-secondary/20">
                    <TableCell className="font-medium">{s.email}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {s.firstName || "-" }
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">{s.source}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {new Date(s.subscribedAt).toLocaleDateString("en-KE", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </TableCell>
                    {filter === "unsubscribed" && s.unsubscribedAt && (
                      <TableCell className="text-muted-foreground text-xs">
                        {new Date(s.unsubscribedAt).toLocaleDateString("en-KE", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </TableCell>
                    )}
                    <TableCell className="text-right">
                      {filter === "active" ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleUnsubscribe(s.email)}
                        >
                          <UserMinus className="mr-1 h-3.5 w-3.5" />
                          Remove
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">Left</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
