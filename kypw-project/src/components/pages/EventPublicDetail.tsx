"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Calendar, MapPin, Droplet, Users, ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface EventPublicDetailProps {
  eventId: string;
  onNavigate: (route: string) => void;
}

interface EventData {
  id: string;
  title: string;
  description: string | null;
  eventType: string;
  status: string;
  startAt: string | null;
  endAt: string | null;
  region: string | null;
  locationName: string | null;
  locationType: string;
  coverImageUrl: string | null;
  metrics: {
    participantsTotal: number;
    youthCount: number;
    womenCount: number;
    countiesReached: number;
    waterPointsAssessed: number;
    communitiesEngaged: number;
    partnershipsFormed: number;
    budgetSpent: number;
    currency: string;
    narrativeSummary: string | null;
  } | null;
  _count: {
    participants: number;
    media: number;
  };
  media: Array<{
    id: string;
    url: string;
    thumbnailUrl: string | null;
    title: string | null;
    fileType: string | null;
  }>;
}

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  published: "bg-[#7BBDE8]/30 text-[#0A4174]",
  ongoing: "bg-[#4E8EA2]/20 text-[#4E8EA2]",
  completed: "bg-[#49769F]/20 text-[#49769F]",
  planned: "bg-[#6EA2B3]/20 text-[#6EA2B3]",
};

const typeColors: Record<string, string> = {
  workshop: "bg-[#49769F]/15 text-[#49769F]",
  dialogue: "bg-[#4E8EA2]/15 text-[#4E8EA2]",
  hackathon: "bg-[#7BBDE8]/15 text-[#0A4174]",
  webinar: "bg-[#BDD8E9]/15 text-[#0A4174]",
  field_visit: "bg-[#6EA2B3]/15 text-[#6EA2B3]",
  conference: "bg-[#0A4174]/15 text-[#0A4174]",
};

export function EventPublicDetail({ eventId, onNavigate }: EventPublicDetailProps) {
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/events/${eventId}`)
      .then((res) => res.json())
      .then((data) => {
        setEvent(data.event ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [eventId]);

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    );
  }

  if (!event) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 py-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
          <Droplet className="h-8 w-8 text-primary/40" />
        </div>
        <h2 className="font-display text-2xl font-semibold">Event not found</h2>
        <p className="text-sm text-muted-foreground">The event you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <Button variant="outline" onClick={() => onNavigate("/events")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
        </Button>
      </main>
    );
  }

  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/50 to-background" />
        <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-water-light/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-civic/10 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-4 pt-12 pb-8 sm:px-6">
          <button
            onClick={() => onNavigate("/events")}
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Events
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge variant="secondary" className={typeColors[event.eventType] ?? ""}>
              {event.eventType.replace(/_/g, " ")}
            </Badge>
            <Badge variant="secondary" className={statusColors[event.status] ?? ""}>
              {event.status}
            </Badge>
          </div>

          <h1 className="font-display text-4xl font-semibold sm:text-5xl leading-tight">{event.title}</h1>

          <div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
            {event.startAt && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {new Date(event.startAt).toLocaleDateString("en-KE", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
                {event.endAt && ` - ${new Date(event.endAt).toLocaleDateString("en-KE", { month: "short", day: "numeric" })}`}
              </span>
            )}
            {(event.region || event.locationName) && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {[event.locationName, event.region].filter(Boolean).join(", ")}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              {event._count.participants} participant{event._count.participants !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Cover image */}
            {event.coverImageUrl && (
              <div className="overflow-hidden rounded-2xl">
                <img
                  src={event.coverImageUrl}
                  alt={event.title}
                  className="h-auto w-full rounded-2xl object-cover"
                />
              </div>
            )}

            {/* Description */}
            {event.description && (
              <div className="rounded-2xl border border-border/70 bg-card p-6">
                <h2 className="font-display text-lg font-semibold mb-3">About this Event</h2>
                <div className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line text-prose">
                  {event.description}
                </div>
              </div>
            )}

            {/* Impact Metrics */}
            {event.metrics && (
              <div className="rounded-2xl border border-border/70 bg-card p-6">
                <h2 className="font-display text-lg font-semibold mb-4">Impact Metrics</h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {[
                    { label: "Participants", value: event.metrics.participantsTotal },
                    { label: "Youth (18-35)", value: event.metrics.youthCount },
                    { label: "Women", value: event.metrics.womenCount },
                    { label: "Counties", value: event.metrics.countiesReached },
                    { label: "Water Points", value: event.metrics.waterPointsAssessed },
                    { label: "Communities", value: event.metrics.communitiesEngaged },
                    { label: "Partnerships", value: event.metrics.partnershipsFormed },
                    {
                      label: `Budget (${event.metrics.currency})`,
                      value: event.metrics.budgetSpent.toLocaleString("en-KE"),
                    },
                  ].map((m) => (
                    <div key={m.label} className="rounded-xl border border-border/50 bg-secondary/20 p-3 text-center">
                      <div className="text-xs uppercase tracking-widest text-muted-foreground">{m.label}</div>
                      <div className="mt-1 text-xl font-semibold font-display">{m.value}</div>
                    </div>
                  ))}
                </div>
                {event.metrics.narrativeSummary && (
                  <div className="mt-5 rounded-xl bg-secondary/30 p-4">
                    <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Narrative Summary</h3>
                    <p className="text-sm leading-relaxed text-prose">{event.metrics.narrativeSummary}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick info card */}
            <div className="rounded-2xl border border-border/70 bg-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">Event Details</h3>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-primary/40">KYPW</span>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-medium capitalize">{event.eventType.replace(/_/g, " ")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium capitalize">{event.locationType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="secondary" className={statusColors[event.status] ?? ""}>
                    {event.status}
                  </Badge>
                </div>
                {event.region && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Region</span>
                    <span className="font-medium">{event.region}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Participants</span>
                  <span className="font-semibold">{event._count.participants}</span>
                </div>
              </div>
            </div>

            {/* Media Gallery */}
            {event.media && event.media.length > 0 && (
              <div className="rounded-2xl border border-border/70 bg-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">Media</h3>
                  <Badge variant="outline">{event.media.length}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {event.media.slice(0, 6).map((m) => (
                    <div
                      key={m.id}
                      className="aspect-square overflow-hidden rounded-xl bg-secondary/30"
                    >
                      {m.thumbnailUrl || m.url ? (
                        <img
                          src={m.thumbnailUrl || m.url}
                          alt={m.title ?? "Event media"}
                          className="h-full w-full object-cover hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
