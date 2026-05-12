"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Droplet, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PublicEvent {
  id: string;
  title: string;
  description: string | null;
  startAt: string | null;
  endAt: string | null;
  region: string | null;
  eventType: string;
  status: string;
  coverImageUrl: string | null;
  locationName: string | null;
}

interface EventsPageProps {
  onNavigate?: (route: string) => void;
}

const TYPE_COLORS: Record<string, string> = {
  conference: "bg-[#0A4174]/20 text-[#BDD8E9] border-[#0A4174]/25",
  dialogue: "bg-[#4E8EA2]/20 text-[#BDD8E9] border-[#4E8EA2]/25",
  workshop: "bg-[#49769F]/20 text-[#7BBDE8] border-[#49769F]/25",
  field_visit: "bg-[#6EA2B3]/20 text-[#BDD8E9] border-[#6EA2B3]/25",
  webinar: "bg-[#7BBDE8]/20 text-[#0A4174] border-[#7BBDE8]/25",
  hackathon: "bg-[#BDD8E9]/20 text-[#0A4174] border-[#BDD8E9]/25",
};

export function EventsPage({ onNavigate }: EventsPageProps) {
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [q, setQ] = useState("");
  const [type, setType] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/events?public=true")
      .then((res) => res.json())
      .then((data) => { setEvents(data.events ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const matchQ = q === "" || e.title.toLowerCase().includes(q.toLowerCase()) || (e.region ?? "").toLowerCase().includes(q.toLowerCase());
      const matchType = type === "all" || e.eventType === type;
      return matchQ && matchType;
    });
  }, [events, q, type]);

  return (
    <main className="flex-1">
      <div className="relative">
        {/* ═══════════ Header — Dark section ═══════════ */}
        <section className="relative overflow-hidden section-dark">
          <div className="absolute inset-0" style={{
            background: "radial-gradient(ellipse at 80% 20%, rgba(78,142,162,0.08) 0%, transparent 60%)"
          }} />
          <div className="absolute inset-0 noise-light" />

          <div className="relative mx-auto max-w-7xl px-4 py-28 sm:px-6 sm:py-36">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}>
              <span className="inline-block rounded-full bg-white/8 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
                Events
              </span>
              <h1 className="mt-5 font-display text-5xl font-semibold text-white sm:text-6xl lg:text-7xl tracking-tight">
                Advancing Water Governance Through Youth Leadership
              </h1>
              <p className="mt-5 max-w-2xl text-lg text-white/55 leading-relaxed font-light text-prose">
                As the Kenyan chapter of the World Youth Parliament for Water, KYPW convenes workshops, policy dialogues, field visits, and conferences that empower young people to shape the future of water and sanitation in Kenya, in line with SDG 6 and the African Youth Parliament for Water network.
              </p>
            </motion.div>

            {/* Filters — Cleaner */}
            <motion.div
              className="mt-12 flex flex-wrap gap-3"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="relative flex-1 min-w-[240px]">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                <Input
                  placeholder="Search by title or region..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="h-12 rounded-xl border-white/10 bg-white/5 pl-11 text-white placeholder:text-white/25 focus-visible:ring-white/15 focus-visible:border-white/20 backdrop-blur-sm"
                />
              </div>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="w-[200px] h-12 rounded-xl border-white/10 bg-white/5 text-white focus:ring-white/15 backdrop-blur-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All event types</SelectItem>
                  <SelectItem value="conference">Conference</SelectItem>
                  <SelectItem value="dialogue">Dialogue</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="field_visit">Field visit</SelectItem>
                  <SelectItem value="webinar">Webinar</SelectItem>
                  <SelectItem value="hackathon">Hackathon</SelectItem>
                </SelectContent>
              </Select>
            </motion.div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </section>

        {/* ═══════════ Events grid ═══════════ */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-shimmer rounded-2xl bg-gradient-to-r from-muted via-muted/60 to-muted" style={{ aspectRatio: "4/5" }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center py-32 text-center"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-secondary/50">
                <Droplet className="h-10 w-10 text-primary/30" />
              </div>
              <h3 className="mt-6 font-display text-2xl font-semibold">No events found</h3>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground text-prose">
                KYPW is actively planning new convenings across Kenya. Try adjusting your search or check back soon for upcoming workshops, dialogues, and field engagements.
              </p>
            </motion.div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((e, i) => (
                <motion.article
                  key={e.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.6, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => onNavigate?.(`/events/${e.id}`)}
                  className="group hover-press cursor-pointer overflow-hidden rounded-2xl border border-border/50 bg-card"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {e.coverImageUrl ? (
                      <img src={e.coverImageUrl} alt={e.title} loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-hero text-primary-foreground/20">
                        <Droplet className="h-16 w-16" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                    <div className="absolute left-4 top-4 flex items-center gap-2">
                      <span className={`rounded-lg border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-sm ${TYPE_COLORS[e.eventType] || "bg-white/15 text-white border-white/10"}`}>
                        {e.eventType.replace(/_/g, " ")}
                      </span>
                      {e.status === "ongoing" && (
                        <span className="rounded-lg bg-[#4E8EA2]/90 border border-[#7BBDE8]/30 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                          Live
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-7">
                    <h3 className="font-display text-xl font-semibold leading-tight">{e.title}</h3>
                    {e.description && (
                      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground leading-relaxed text-prose">{e.description}</p>
                    )}
                    <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      {e.startAt && (
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(e.startAt).toLocaleDateString("en-KE", { month: "short", day: "numeric", year: "numeric" })}
                          {e.endAt && <span> &ndash; {new Date(e.endAt).toLocaleDateString("en-KE", { month: "short", day: "numeric" })}</span>}
                        </span>
                      )}
                      {(e.region || e.locationName) && (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" />
                          {e.region ?? e.locationName}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
