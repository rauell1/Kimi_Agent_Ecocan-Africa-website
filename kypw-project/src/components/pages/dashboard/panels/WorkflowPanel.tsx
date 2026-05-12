"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api/client";
import { toast } from "sonner";

interface WorkflowStep {
  id: string;
  stepName: string;
  status: string;
  output: string | null;
  error: string | null;
  attempt: number;
  durationMs: number | null;
  createdAt: string;
}

interface WorkflowRun {
  id: string;
  workflow: string;
  status: string;
  trigger: string;
  input: string | null;
  output: string | null;
  error: string | null;
  createdAt: string;
  steps: WorkflowStep[];
}

interface WorkflowStats {
  total: number;
  running: number;
  completed: number;
  failed: number;
  byType: { workflow: string; _count: { id: number } }[];
}

const WORKFLOW_LABELS: Record<string, { label: string; color: string }> = {
  "ai-report": { label: "AI Report", color: "bg-blue-500/15 text-blue-600 border-blue-500/20" },
  "newsletter.subscribe": { label: "Newsletter", color: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20" },
  "contact.notify": { label: "Contact", color: "bg-amber-500/15 text-amber-600 border-amber-500/20" },
};

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle2; color: string; label: string }> = {
  running: { icon: Loader2, color: "text-blue-500", label: "Running" },
  completed: { icon: CheckCircle2, color: "text-emerald-500", label: "Completed" },
  failed: { icon: XCircle, color: "text-red-500", label: "Failed" },
  cancelled: { icon: Clock, color: "text-gray-400", label: "Cancelled" },
};

export default function WorkflowPanel() {
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [stats, setStats] = useState<WorkflowStats | null>(null);
  const [selectedRun, setSelectedRun] = useState<WorkflowRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterWorkflow, setFilterWorkflow] = useState<string>("all");

  async function loadData() {
    setLoading(true);
    try {
      const [runsData, statsData] = await Promise.all([
        api.get<{ runs: WorkflowRun[] }>(`/workflows?workflow=${filterWorkflow !== "all" ? filterWorkflow : ""}&limit=30`),
        api.get<{ stats: WorkflowStats }>("/workflows?stats=true"),
      ]);
      setRuns(runsData.runs ?? []);
      setStats(statsData.stats ?? null);
    } catch {
      toast.error("Failed to load workflow data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [filterWorkflow]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-tight flex items-center gap-2.5">
          <Activity className="h-5 w-5 text-primary" />
          Workflows
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Durable execution engine with step isolation, automatic retries, and full observability.
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-3 sm:grid-cols-4">
          {[
            { label: "Total runs", value: stats.total, icon: Activity, color: "text-foreground" },
            { label: "Completed", value: stats.completed, icon: CheckCircle2, color: "text-emerald-500" },
            { label: "Failed", value: stats.failed, icon: XCircle, color: "text-red-500" },
            { label: "Running", value: stats.running, icon: Clock, color: "text-blue-500" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border/60 bg-card p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">{s.label}</span>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <div className={`mt-2 font-display text-3xl font-semibold ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* By Type */}
      {stats && stats.byType.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {stats.byType.map((t) => {
            const meta = WORKFLOW_LABELS[t.workflow] ?? { label: t.workflow, color: "bg-gray-100 text-gray-600" };
            return (
              <div key={t.workflow} className="inline-flex items-center gap-2 rounded-lg border border-border/50 px-3 py-1.5">
                <span className="text-xs font-medium">{meta.label}</span>
                <span className="text-xs text-muted-foreground">{t._count.id}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="flex gap-1.5">
          {["all", "ai-report", "newsletter.subscribe", "contact.notify"].map((w) => {
            const meta = WORKFLOW_LABELS[w] ?? { label: "All" };
            return (
              <Button
                key={w}
                size="sm"
                variant={filterWorkflow === w ? "default" : "outline"}
                onClick={() => setFilterWorkflow(w)}
                className="text-xs"
              >
                {meta.label}
              </Button>
            );
          })}
        </div>
        <div className="ml-auto">
          <Button size="sm" variant="ghost" onClick={loadData} disabled={loading}>
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Runs List + Detail */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* List */}
        <div className="lg:col-span-2 space-y-2 max-h-[600px] overflow-y-auto scrollbar-modern">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : runs.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <Activity className="h-10 w-10 text-muted-foreground/30" />
              <h3 className="mt-4 font-display text-lg font-semibold">No workflow runs yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">Workflows will appear here when AI reports are generated, newsletter subscriptions are processed, or contact messages are received.</p>
            </div>
          ) : (
            runs.map((run) => {
              const meta = WORKFLOW_LABELS[run.workflow] ?? { label: run.workflow, color: "bg-gray-100 text-gray-600" };
              const statusCfg = STATUS_CONFIG[run.status] ?? STATUS_CONFIG.cancelled;
              const StatusIcon = statusCfg.icon;
              return (
                <button
                  key={run.id}
                  onClick={() => setSelectedRun(run)}
                  className={`w-full flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all duration-200 ${
                    selectedRun?.id === run.id
                      ? "border-primary/30 bg-primary/5"
                      : "border-border/50 bg-card hover:border-border hover:bg-secondary/20"
                  }`}
                >
                  <StatusIcon className={`mt-0.5 h-4 w-4 shrink-0 ${statusCfg.color} ${run.status === "running" ? "animate-spin" : ""}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-[10px] px-2 py-0 border ${meta.color}`}>
                        {meta.label}
                      </Badge>
                      <span className={`text-[10px] font-semibold uppercase tracking-wider ${statusCfg.color}`}>
                        {statusCfg.label}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {new Date(run.createdAt).toLocaleString("en-KE", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      {run.steps.length > 0 && (
                        <span className="ml-2">
                          {run.steps.filter((s) => s.status === "completed").length}/{run.steps.length} steps
                        </span>
                      )}
                    </div>
                    {run.error && (
                      <p className="mt-1 text-[11px] text-red-500 truncate">{run.error}</p>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                </button>
              );
            })
          )}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-3">
          {selectedRun ? (
            <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
              <div className="border-b border-border/50 px-5 py-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={WORKFLOW_LABELS[selectedRun.workflow]?.color}>
                    {WORKFLOW_LABELS[selectedRun.workflow]?.label ?? selectedRun.workflow}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{selectedRun.id}</span>
                </div>
                <div className="mt-2 flex items-center gap-3 text-sm">
                  <span className={`font-medium ${STATUS_CONFIG[selectedRun.status]?.color}`}>
                    {STATUS_CONFIG[selectedRun.status]?.label}
                  </span>
                  <span className="text-muted-foreground">
                    {new Date(selectedRun.createdAt).toLocaleString("en-KE")}
                  </span>
                </div>
              </div>

              {/* Steps */}
              <div className="divide-y divide-border/30">
                {selectedRun.steps.map((step, i) => {
                  const stepStatus = STATUS_CONFIG[step.status] ?? STATUS_CONFIG.cancelled;
                  const StepIcon = stepStatus.icon;
                  return (
                    <div key={step.id} className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`flex h-7 w-7 items-center justify-center rounded-full border ${
                            step.status === "completed"
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                              : step.status === "failed"
                                ? "border-red-500/30 bg-red-500/10 text-red-500"
                                : "border-gray-300/30 bg-gray-100 text-gray-400"
                          }`}>
                            <StepIcon className={`h-3.5 w-3.5 ${step.status === "running" ? "animate-spin" : ""}`} />
                          </div>
                          {i < selectedRun.steps.length - 1 && (
                            <div className={`mt-1 h-4 w-px ${
                              step.status === "completed" ? "bg-emerald-500/30" : "bg-gray-200"
                            }`} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{step.stepName}</span>
                            {step.attempt > 1 && (
                              <Badge variant="outline" className="text-[9px] px-1.5 py-0 text-amber-600 border-amber-500/20">
                                Retry {step.attempt}
                              </Badge>
                            )}
                          </div>
                          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                            {step.durationMs !== null && <span>{step.durationMs}ms</span>}
                            <span>{new Date(step.createdAt).toLocaleTimeString("en-KE")}</span>
                          </div>
                          {step.error && (
                            <div className="mt-2 rounded-lg bg-red-500/5 border border-red-500/10 px-3 py-2">
                              <p className="text-xs text-red-600">{step.error}</p>
                            </div>
                          )}
                          {step.output && step.status === "completed" && (
                            <details className="mt-2">
                              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                                View output
                              </summary>
                              <pre className="mt-1 rounded-lg bg-muted p-2 text-[11px] overflow-x-auto max-h-32 overflow-y-auto scrollbar-modern">
                                {(() => {
                                  try { return JSON.stringify(JSON.parse(step.output!), null, 2); }
                                  catch { return step.output!.slice(0, 500); }
                                })()}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Input/Output */}
              {selectedRun.input && (
                <details className="border-t border-border/30 px-5 py-3">
                  <summary className="text-xs font-medium text-muted-foreground cursor-pointer">Input payload</summary>
                  <pre className="mt-2 rounded-lg bg-muted p-3 text-[11px] overflow-x-auto max-h-40 overflow-y-auto scrollbar-modern">
                    {(() => { try { return JSON.stringify(JSON.parse(selectedRun.input!), null, 2); } catch { return selectedRun.input; } })()}
                  </pre>
                </details>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 rounded-xl border border-dashed border-border/50 text-muted-foreground text-sm">
              <div className="text-center">
                <ExternalLink className="mx-auto h-8 w-8 text-muted-foreground/30" />
                <p className="mt-3">Select a workflow run to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
