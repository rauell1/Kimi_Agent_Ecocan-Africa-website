"use client";

import { useState, useEffect } from "react";
import { Shield, Clock, User, Filter, ChevronDown, ChevronRight, Loader2, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { AuditLogEntry } from "../event-detail-types";

interface Props { eventId: string; canManage: boolean; }

const ACTION_LABELS: Record<string, string> = {
  "event.create": "Event created",
  "event.update": "Event updated",
  "event.delete": "Event deleted",
  "participant.create": "Participant added",
  "participant.update": "Participant updated",
  "participant.delete": "Participant removed",
  "participant.import": "CSV imported",
  "documentation.create": "Documentation added",
  "documentation.delete": "Documentation removed",
  "metrics.update": "Metrics saved",
  "report.create": "Report generated",
  "report.delete": "Report deleted",
  "checklist.update": "Checklist updated",
  "checklist.bulk_update": "Bulk checklist update",
};

const ACTION_COLORS: Record<string, string> = {
  "event.create": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  "event.update": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  "event.delete": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  "participant.create": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  "participant.update": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  "participant.delete": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  "participant.import": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  "documentation.create": "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
  "documentation.delete": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  "metrics.update": "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  "report.create": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  "report.delete": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  "checklist.update": "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
  "checklist.bulk_update": "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
};

export function AuditLogPanel({ eventId }: Props) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [actionFilter, setActionFilter] = useState<string>("_all");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const limit = 50;

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
    if (actionFilter !== "_all") params.set("action", actionFilter);
    fetch(`/api/events/${eventId}/audit-log?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setLogs(data.logs ?? []);
        setTotal(data.total ?? 0);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [eventId, offset, actionFilter, limit]);

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function formatDiff(before: Record<string, unknown> | null, after: Record<string, unknown> | null) {
    if (!before && !after) return null;
    const allKeys = new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})]);
    const changes: Array<{ key: string; before: unknown; after: unknown }> = [];

    for (const key of allKeys) {
      const b = before?.[key];
      const a = after?.[key];
      if (JSON.stringify(b) !== JSON.stringify(a)) {
        changes.push({ key, before: b, after: a });
      }
    }
    return changes;
  }

  function formatValue(val: unknown): string {
    if (val === null || val === undefined) return "-" ;
    if (typeof val === "boolean") return val ? "true" : "false";
    if (typeof val === "number") return String(val);
    if (typeof val === "string") {
      // Truncate long strings
      if (val.length > 80) return val.slice(0, 77) + "…";
      return val;
    }
    return JSON.stringify(val);
  }

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setOffset(0); }}>
            <SelectTrigger className="w-48 h-8 text-xs"><SelectValue placeholder="All actions" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">All actions</SelectItem>
              {Object.entries(ACTION_LABELS).map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Badge variant="secondary" className="text-[10px]">{total} entries</Badge>
        </div>
      </div>

      {/* Log entries */}
      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : logs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <Shield className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 font-display text-xl font-semibold">No activity yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Changes to this event will be recorded here.</p>
        </div>
      ) : (
        <ScrollArea className="max-h-[600px]">
          <div className="space-y-1 pr-4">
            {logs.map((log) => {
              const isExpanded = expanded.has(log.id);
              const diff = log.before || log.after ? formatDiff(log.before, log.after) : null;
              const isImport = log.action === "participant.import" && log.metadata;
              const isBulk = log.action === "checklist.bulk_update" && log.metadata;

              return (
                <div key={log.id} className="rounded-lg border border-border/60 bg-card transition-colors hover:bg-secondary/30">
                  <button onClick={() => toggleExpand(log.id)} className="w-full flex items-center gap-3 px-4 py-3 text-left">
                    {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={`text-[10px] ${ACTION_COLORS[log.action] ?? "bg-secondary text-muted-foreground"}`}>
                          {ACTION_LABELS[log.action] ?? log.action}
                        </Badge>
                        {log.user && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <User className="h-3 w-3" />
                            {log.user.name ?? log.user.email}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {log.entityType && <span className="font-mono">{log.entityType}</span>}
                        {log.metadata && !diff && (
                          <span className="ml-2">
                            {isImport && `→ ${log.metadata.validRows} valid, ${log.metadata.rejectedRows} rejected, ${log.metadata.inserted ?? 0} inserted`}
                            {isBulk && `→ ${log.metadata.updates ? "Updated fields across matching events" : "Bulk operation"}`}
                          </span>
                        )}
                      </p>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
                      <Clock className="h-3 w-3" />
                      {new Date(log.createdAt).toLocaleString("en-KE", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-border/40 px-4 py-3">
                      {diff && diff.length > 0 ? (
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Changes</p>
                          {diff.map(({ key, before: b, after: a }, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs">
                              <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[10px]">{key}</code>
                              <span className="text-red-600 dark:text-red-400 line-through">{formatValue(b)}</span>
                              <ArrowUpDown className="h-3 w-3 text-muted-foreground mt-0.5" />
                              <span className="text-green-600 dark:text-green-400">{formatValue(a)}</span>
                            </div>
                          ))}
                        </div>
                      ) : log.metadata && !isImport && !isBulk ? (
                        <div className="text-xs">
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Details</p>
                          <pre className="rounded-lg bg-secondary/50 p-2 font-mono text-[10px] overflow-auto max-h-40">{JSON.stringify(log.metadata, null, 2)}</pre>
                        </div>
                      ) : isImport || isBulk ? (
                        <div className="text-xs">
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Import Details</p>
                          <pre className="rounded-lg bg-secondary/50 p-2 font-mono text-[10px] overflow-auto max-h-40">{JSON.stringify(log.metadata, null, 2)}</pre>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">No additional details available.</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}

      {/* Pagination */}
      {total > limit && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Showing {offset + 1}-{Math.min(offset + limit, total)} of {total}</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - limit))}>Previous</Button>
            <Button size="sm" variant="outline" disabled={offset + limit >= total} onClick={() => setOffset(offset + limit)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
