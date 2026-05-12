"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as ReTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
} from "recharts";
import { FileDown, Loader2, Users, MapPin, DollarSign, Calendar, BarChart3, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { api } from "@/lib/api/client";

interface AnalyticsData {
  eventsByStatus: Array<{ status: string; count: number }>;
  eventsByType: Array<{ type: string; count: number }>;
  participantsPerEvent: Array<{ eventId: string; title: string; count: number }>;
  regionalDistribution: Array<{ region: string; count: number }>;
  monthlyTrends: Array<{ month: string; count: number }>;
  totalBudget: number;
  totalParticipants: number;
  totalRegions: number;
  totalEvents: number;
}

const PIE_COLORS = ["#06b6d4", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444", "#ec4899", "#6366f1", "#14b8a6"];
const BAR_COLOR = "oklch(0.50 0.13 225)";
const LINE_COLOR = "#06b6d4";

export function AnalyticsPanel() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<AnalyticsData>("/analytics")
      .then((d) => setData(d))
      .catch(() => toast.error("Failed to load analytics"))
      .finally(() => setLoading(false));
  }, []);

  function exportCsv() {
    if (!data) return;
    const lines: string[] = [];

    // Overview
    lines.push("KYPW Analytics Export");
    lines.push(`Generated,${new Date().toISOString()}`);
    lines.push("");
    lines.push("Overview");
    lines.push(`Total Events,${data.totalEvents}`);
    lines.push(`Total Participants,${data.totalParticipants}`);
    lines.push(`Regions Covered,${data.totalRegions}`);
    lines.push(`Total Budget (KES),${data.totalBudget}`);
    lines.push("");

    // Events by status
    lines.push("Events by Status");
    lines.push("Status,Count");
    data.eventsByStatus.forEach((e) => lines.push(`${e.status},${e.count}`));
    lines.push("");

    // Events by type
    lines.push("Events by Type");
    lines.push("Type,Count");
    data.eventsByType.forEach((e) => lines.push(`${e.type},${e.count}`));
    lines.push("");

    // Participants per event
    lines.push("Participants per Event");
    lines.push("Event,Participants");
    data.participantsPerEvent.forEach((e) => lines.push(`"${e.title}",${e.count}`));
    lines.push("");

    // Regional distribution
    lines.push("Regional Distribution");
    lines.push("Region,Events");
    data.regionalDistribution.forEach((e) => lines.push(`"${e.region}",${e.count}`));
    lines.push("");

    // Monthly trends
    lines.push("Monthly Trends");
    lines.push("Month,Events");
    data.monthlyTrends.forEach((e) => lines.push(`${e.month},${e.count}`));

    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kypw-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Analytics exported as CSV");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        Failed to load analytics data.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold">Analytics</h1>
          <p className="mt-1 text-muted-foreground">
            Cross-event insights and performance metrics.
          </p>
        </div>
        <Button variant="outline" onClick={exportCsv}>
          <FileDown className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/70">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-water-light/20">
                <Calendar className="h-5 w-5 text-water-deep" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Total Events</p>
                <p className="text-2xl font-semibold font-display">{data.totalEvents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/70">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-civic/20">
                <Users className="h-5 w-5 text-civic" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Participants</p>
                <p className="text-2xl font-semibold font-display">{data.totalParticipants}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/70">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sun/20">
                <MapPin className="h-5 w-5 text-sun-foreground" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Regions</p>
                <p className="text-2xl font-semibold font-display">{data.totalRegions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/70">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-clay/20">
                <DollarSign className="h-5 w-5 text-clay" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-semibold font-display">
                  {data.totalBudget.toLocaleString("en-KE")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview" className="gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="trends" className="gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="regions" className="gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            Regions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Participants per Event Bar Chart */}
            <Card className="border-border/70">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Participants per Event</CardTitle>
                <CardDescription>Number of participants registered per event</CardDescription>
              </CardHeader>
              <CardContent>
                {data.participantsPerEvent.length === 0 ? (
                  <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                    No participant data yet
                  </div>
                ) : (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.participantsPerEvent} layout="vertical" margin={{ left: 10, right: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis type="number" fontSize={12} />
                        <YAxis dataKey="title" type="category" width={120} fontSize={11} />
                        <ReTooltip />
                        <Bar dataKey="count" fill={BAR_COLOR} radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Events by Type Pie Chart */}
            <Card className="border-border/70">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Events by Type</CardTitle>
                <CardDescription>Distribution of events across categories</CardDescription>
              </CardHeader>
              <CardContent>
                {data.eventsByType.length === 0 ? (
                  <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                    No events yet
                  </div>
                ) : (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.eventsByType}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          dataKey="count"
                          nameKey="type"
                          label={({ name, value }: { name?: string; value?: number }) => `${name ?? ""} (${value ?? 0})`}
                        >
                          {data.eventsByType.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <ReTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Events by Status Bar Chart */}
          <Card className="border-border/70">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Events by Status</CardTitle>
              <CardDescription>Current distribution of event statuses</CardDescription>
            </CardHeader>
            <CardContent>
              {data.eventsByStatus.length === 0 ? (
                <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                  No events yet
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.eventsByStatus}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="status" fontSize={12} />
                      <YAxis fontSize={12} allowDecimals={false} />
                      <ReTooltip />
                      <Bar dataKey="count" fill={BAR_COLOR} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="mt-6">
          <Card className="border-border/70">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Events Over Time</CardTitle>
              <CardDescription>Monthly event creation trend (last 12 months)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis fontSize={12} allowDecimals={false} />
                    <ReTooltip />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke={LINE_COLOR}
                      strokeWidth={2.5}
                      dot={{ fill: LINE_COLOR, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regions" className="mt-6">
          <Card className="border-border/70">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Regional Distribution</CardTitle>
              <CardDescription>Events by region / county</CardDescription>
            </CardHeader>
            <CardContent>
              {data.regionalDistribution.length === 0 ? (
                <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                  No regional data yet
                </div>
              ) : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.regionalDistribution} layout="vertical" margin={{ left: 10, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis type="number" fontSize={12} allowDecimals={false} />
                      <YAxis dataKey="region" type="category" width={100} fontSize={11} />
                      <ReTooltip />
                      <Bar dataKey="count" fill={BAR_COLOR} radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
