"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft, Users, FileText, BarChart3, Sparkles, Calendar, MapPin, Shield, ImageIcon, Loader2, Wand2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ParticipantsPanel } from "./panels/ParticipantsPanel";
import { DocumentationPanel } from "./panels/DocumentationPanel";
import { MetricsPanel } from "./panels/MetricsPanel";
import { ReportPanel } from "./panels/ReportPanel";
import { AuditLogPanel } from "./panels/AuditLogPanel";
import { MediaGalleryPanel } from "./panels/MediaGalleryPanel";
import { api } from "@/lib/api/client";
import { toast } from "sonner";
import type { EventRow, Participant, DocItem, Metrics, ReportItem } from "./event-detail-types";

interface EventDetailPageProps {
  eventId: string;
  onNavigate: (route: string) => void;
  user?: { id: string; email: string; role?: string };
}

export function EventDetailPage({ eventId, onNavigate, user }: EventDetailPageProps) {
  const userRole = user?.role ?? "viewer";
  const canManage = ["admin", "coordinator"].includes(userRole);
  const canEdit = ["admin", "coordinator", "field_officer"].includes(userRole);

  const [event, setEvent] = useState<EventRow | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [aiGenerating, setAiGenerating] = useState(false);

  const reload = () => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  };

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      fetch(`/api/events/${eventId}`).then((r) => r.json()),
      fetch(`/api/events/${eventId}/participants`).then((r) => r.json()),
      fetch(`/api/events/${eventId}/documentation`).then((r) => r.json()),
      fetch(`/api/events/${eventId}/metrics`).then((r) => r.json()),
      fetch(`/api/events/${eventId}/reports`).then((r) => r.json()),
    ]).then(([evt, parts, dcs, mts, rps]) => {
      if (cancelled) return;
      if (!evt.event) {
        onNavigate("/dashboard/events");
        return;
      }
      setEvent(evt.event);
      setParticipants(parts.participants ?? []);
      setDocs(dcs.docs ?? []);
      setMetrics(mts.metrics ?? {
        eventId, participantsTotal: 0, youthCount: 0, womenCount: 0,
        countiesReached: 0, waterPointsAssessed: 0, communitiesEngaged: 0,
        partnershipsFormed: 0, budgetSpent: 0, currency: "KES", narrativeSummary: "",
      });
      setReports(rps.reports ?? []);
    }).catch(() => {
      // silently handle
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, [eventId, reloadKey, onNavigate]);

  async function generateAIReport() {
    setAiGenerating(true);
    try {
      const res = await api.post<{ report: { id: string; content: string } }>("/events/" + eventId + "/ai-report");
      toast.success("AI report generated successfully!");
      reload();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to generate AI report");
    } finally {
      setAiGenerating(false);
    }
  }

  if (loading || !event) {
    return <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">Loading event…</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <button onClick={() => onNavigate("/dashboard/events")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> All events
        </button>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-civic">{event.eventType.replace(/_/g, " ")}</p>
            <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">{event.title}</h1>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
              {event.startAt && (
                <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" />
                  {new Date(event.startAt).toLocaleDateString("en-KE", { month: "long", day: "numeric", year: "numeric" })}
                </span>
              )}
              {(event.region || event.locationName) && (
                <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" />
                  {event.region ?? event.locationName}
                </span>
              )}
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${statusStyle(event.status)}`}>
                {event.status}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {canManage && (
              <Button variant="outline" size="sm" onClick={generateAIReport} disabled={aiGenerating}>
                {aiGenerating ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Wand2 className="mr-1.5 h-4 w-4" />}
                {aiGenerating ? "Generating…" : "AI Report"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="participants" className="space-y-6">
        <TabsList className="flex w-full flex-wrap gap-1 sm:w-auto">
          <TabsTrigger value="participants"><Users className="mr-1.5 h-4 w-4" />Participants</TabsTrigger>
          <TabsTrigger value="documentation"><FileText className="mr-1.5 h-4 w-4" />Docs</TabsTrigger>
          <TabsTrigger value="metrics"><BarChart3 className="mr-1.5 h-4 w-4" />Impact</TabsTrigger>
          <TabsTrigger value="report"><Sparkles className="mr-1.5 h-4 w-4" />Reports</TabsTrigger>
          <TabsTrigger value="media"><ImageIcon className="mr-1.5 h-4 w-4" />Media</TabsTrigger>
          <TabsTrigger value="audit"><Shield className="mr-1.5 h-4 w-4" />Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="participants">
          <ParticipantsPanel eventId={eventId} participants={participants} canManage={canManage} reload={reload} />
        </TabsContent>
        <TabsContent value="documentation">
          <DocumentationPanel eventId={eventId} event={event} docs={docs} canManage={canManage} reload={reload} />
        </TabsContent>
        <TabsContent value="metrics">
          <MetricsPanel eventId={eventId} metrics={metrics!} canManage={canManage} reload={reload} participants={participants} />
        </TabsContent>
        <TabsContent value="report">
          <ReportPanel eventId={eventId} event={event} participants={participants} metrics={metrics} reports={reports} canManage={canManage} reload={reload} />
        </TabsContent>
        <TabsContent value="media">
          <MediaGalleryPanel eventId={eventId} canManage={canManage} />
        </TabsContent>
        <TabsContent value="audit">
          <AuditLogPanel eventId={eventId} canManage={canManage} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function statusStyle(s: string) {
  switch (s) {
    case "published": return "bg-civic/15 text-civic";
    case "ongoing": return "bg-accent text-accent-foreground";
    case "completed": return "bg-clay/15 text-clay";
    case "draft": return "bg-secondary text-muted-foreground";
    case "planned": return "bg-primary/10 text-primary";
    default: return "bg-secondary text-muted-foreground";
  }
}
