"use client";

import { useState, type FormEvent } from "react";
import { BarChart3, FileDown, X, Filter } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as ReTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid, Legend,
} from "recharts";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { Metrics, Participant } from "../event-detail-types";

interface Props {
  eventId: string; metrics: Metrics; canManage: boolean; reload: () => void; participants: Participant[];
}

const COLORS = ["#06b6d4", "#f59e0b", "#8b5cf6", "#94a3b8"];

export function MetricsPanel({ eventId, metrics, canManage, reload, participants }: Props) {
  const [saving, setSaving] = useState(false);
  const [drilldown, setDrilldown] = useState<{ key: string; value: string; filtered: Participant[] } | null>(null);

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canManage) return;
    const fd = new FormData(e.currentTarget);
    const num = (k: string) => Math.max(0, Number(fd.get(k) ?? 0) || 0);
    setSaving(true);
    try {
      await fetch(`/api/events/${eventId}/metrics`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantsTotal: num("participants_total"), youthCount: num("youth_count"), womenCount: num("women_count"),
          countiesReached: num("counties_reached"), waterPointsAssessed: num("water_points_assessed"),
          communitiesEngaged: num("communities_engaged"), partnershipsFormed: num("partnerships_formed"),
          budgetSpent: num("budget_spent"), currency: String(fd.get("currency") ?? "KES").slice(0, 6),
          narrativeSummary: String(fd.get("narrative_summary") ?? "").slice(0, 2000) || null,
        }),
      });
      toast.success("Impact metrics saved"); reload();
    } catch { toast.error("Failed to save metrics"); }
    setSaving(false);
  }

  // Gender chart data
  const genderData = [
    { name: "Female", value: participants.filter((p) => p.gender?.toLowerCase() === "female").length },
    { name: "Male", value: participants.filter((p) => p.gender?.toLowerCase() === "male").length },
    { name: "Other", value: participants.filter((p) => p.gender && !["male", "female"].includes(p.gender.toLowerCase())).length },
    { name: "Unknown", value: participants.filter((p) => !p.gender).length },
  ].filter((d) => d.value > 0);

  // Bar chart data
  const barData = [
    { name: "Total", value: metrics.participantsTotal },
    { name: "Youth", value: metrics.youthCount },
    { name: "Women", value: metrics.womenCount },
    { name: "Attended", value: participants.filter((p) => p.attended).length },
  ];

  // Age group chart data
  const ageData = [
    { name: "Under 18", value: participants.filter((p) => p.ageGroup === "under-18").length },
    { name: "18-35", value: participants.filter((p) => p.ageGroup === "18-35").length },
    { name: "36-50", value: participants.filter((p) => p.ageGroup === "36-50").length },
    { name: "50+", value: participants.filter((p) => p.ageGroup === "50+").length },
  ].filter((d) => d.value > 0);

  function handlePieClick(data: { name: string; value: number }) {
    const filtered = participants.filter((p) => {
      if (data.name === "Female") return p.gender?.toLowerCase() === "female";
      if (data.name === "Male") return p.gender?.toLowerCase() === "male";
      if (data.name === "Other") return p.gender && !["male", "female"].includes(p.gender.toLowerCase());
      if (data.name === "Unknown") return !p.gender;
      return true;
    });
    setDrilldown({ key: "gender", value: data.name, filtered });
  }

  function handleBarClick(data: { name: string; value: number }) {
    let filtered: Participant[] = [];
    if (data.name === "Attended") filtered = participants.filter((p) => p.attended);
    else if (data.name === "Youth") filtered = participants.filter((p) => p.ageGroup === "18-35");
    else if (data.name === "Women") filtered = participants.filter((p) => p.gender?.toLowerCase() === "female");
    else filtered = participants;
    setDrilldown({ key: "metric", value: data.name, filtered });
  }

  function handleAgeClick(data: { name: string; value: number }) {
    const ageMap: Record<string, string> = { "Under 18": "under-18", "18-35": "18-35", "36-50": "36-50", "50+": "50+" };
    const filtered = participants.filter((p) => p.ageGroup === ageMap[data.name]);
    setDrilldown({ key: "age", value: data.name, filtered });
  }

  function exportDrilldownCsv() {
    if (!drilldown) return;
    const headers = "full_name,email,phone,organization,region,gender,age_group,role_at_event,attended";
    const rows = drilldown.filtered.map((p) =>
      [p.fullName, p.email ?? "", p.phone ?? "", p.organization ?? "", p.region ?? "", p.gender ?? "", p.ageGroup ?? "", p.roleAtEvent ?? "", p.attended]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
    );
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `participants-${drilldown.key}-${drilldown.value.toLowerCase().replace(/\s+/g, "-")}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${drilldown.filtered.length} participants`);
  }

  return (
    <div className="space-y-6">
      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {genderData.length > 0 && (
          <div className="rounded-2xl border border-border/70 bg-card p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold">Gender Distribution</h3>
              <Badge variant="secondary" className="text-[10px]">Click to drill down</Badge>
            </div>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={genderData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label onClick={(_, i) => handlePieClick(genderData[i])} cursor="pointer">
                    {genderData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <ReTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        {ageData.length > 0 && (
          <div className="rounded-2xl border border-border/70 bg-card p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold">Age Distribution</h3>
              <Badge variant="secondary" className="text-[10px]">Click to drill down</Badge>
            </div>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={ageData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label onClick={(_, i) => handleAgeClick(ageData[i])} cursor="pointer">
                    {ageData.map((_, i) => <Cell key={i} fill={COLORS[(i + 1) % COLORS.length]} />)}
                  </Pie>
                  <ReTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        <div className="rounded-2xl border border-border/70 bg-card p-6 md:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">Participants Overview</h3>
            <Badge variant="secondary" className="text-[10px]">Click bars to drill down</Badge>
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} onClick={(data) => { const p = (data as any)?.activePayload?.[0]; if (p) handleBarClick(p.payload); }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <ReTooltip />
                <Bar dataKey="value" fill="oklch(0.50 0.13 225)" radius={[6, 6, 0, 0]} cursor="pointer" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Drilldown overlay */}
      {drilldown && (
        <div className="rounded-2xl border border-border/70 bg-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-civic" />
              <h3 className="font-display text-sm font-semibold">
                Drilldown: <span className="text-civic">{drilldown.value}</span>
              </h3>
              <Badge variant="outline">{drilldown.filtered.length} participants</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={exportDrilldownCsv}><FileDown className="mr-1.5 h-3.5 w-3.5" />Export CSV</Button>
              <button onClick={() => setDrilldown(null)} className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary"><X className="h-4 w-4" /></button>
            </div>
          </div>
          {drilldown.filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No participants match this filter.</div>
          ) : (
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-secondary/80 text-left text-xs uppercase tracking-widest text-muted-foreground">
                  <tr>
                    <th className="px-5 py-2.5 font-medium">Name</th><th className="px-5 py-2.5 font-medium">Organization</th>
                    <th className="px-5 py-2.5 font-medium">Region</th><th className="px-5 py-2.5 font-medium">Gender</th>
                    <th className="px-5 py-2.5 font-medium">Age</th><th className="px-5 py-2.5 font-medium">Attended</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {drilldown.filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-secondary/20">
                      <td className="px-5 py-2.5"><div className="font-medium">{p.fullName}</div><div className="text-xs text-muted-foreground">{p.email ?? ""}</div></td>
                      <td className="px-5 py-2.5 text-muted-foreground">{p.organization ?? "-" }</td>
                      <td className="px-5 py-2.5 text-muted-foreground">{p.region ?? "-" }</td>
                      <td className="px-5 py-2.5 text-muted-foreground">{p.gender ?? "-" }</td>
                      <td className="px-5 py-2.5 text-muted-foreground">{p.ageGroup ?? "-" }</td>
                      <td className="px-5 py-2.5"><Badge variant={p.attended ? "default" : "outline"} className="text-[10px]">{p.attended ? "Yes" : "No"}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Metrics Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <NumField name="participants_total" label="Total participants" defaultValue={metrics.participantsTotal} disabled={!canManage} />
          <NumField name="youth_count" label="Youth (18 - 35)" defaultValue={metrics.youthCount} disabled={!canManage} />
          <NumField name="women_count" label="Women" defaultValue={metrics.womenCount} disabled={!canManage} />
          <NumField name="counties_reached" label="Counties reached" defaultValue={metrics.countiesReached} disabled={!canManage} />
          <NumField name="water_points_assessed" label="Water points assessed" defaultValue={metrics.waterPointsAssessed} disabled={!canManage} />
          <NumField name="communities_engaged" label="Communities engaged" defaultValue={metrics.communitiesEngaged} disabled={!canManage} />
          <NumField name="partnerships_formed" label="Partnerships formed" defaultValue={metrics.partnershipsFormed} disabled={!canManage} />
          <div className="rounded-xl border border-border/70 bg-card p-4">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">Budget spent</Label>
            <div className="mt-2 flex gap-2">
              <Input name="budget_spent" type="number" min={0} step="0.01" defaultValue={metrics.budgetSpent} disabled={!canManage} className="flex-1" />
              <Input name="currency" defaultValue={metrics.currency} maxLength={6} disabled={!canManage} className="w-16" />
            </div>
          </div>
        </div>
        <div>
          <Label>Narrative summary</Label>
          <Textarea name="narrative_summary" rows={5} maxLength={2000} defaultValue={metrics.narrativeSummary ?? ""} disabled={!canManage} className="mt-1.5" placeholder="Highlight key achievements, lessons, and stories from this event…" />
        </div>
        {canManage && <div className="flex justify-end"><Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save metrics"}</Button></div>}
      </form>
    </div>
  );
}

function NumField({ name, label, defaultValue, disabled }: { name: string; label: string; defaultValue: number; disabled: boolean }) {
  return (
    <div className="rounded-xl border border-border/70 bg-card p-4">
      <Label htmlFor={name} className="text-xs uppercase tracking-widest text-muted-foreground">{label}</Label>
      <Input id={name} name={name} type="number" min={0} defaultValue={defaultValue} disabled={disabled}
        className="mt-2 border-0 bg-transparent p-0 text-2xl font-semibold focus-visible:ring-0" />
    </div>
  );
}
