"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  Users,
  Globe2,
  Sparkles,
  Droplet,
  Waves,
  MapPin,
  Mail,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CircularDecorations, FloatingRings, WaterRipple } from "@/components/CircularDecorations";
import { ModernGallery, type GalleryImage } from "@/components/ModernGallery";

/* ── Animation helpers ────────────────────────────── */
function SectionReveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 50 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

function StaggerReveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? "visible" : "hidden"}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }} className={className}>
      {children}
    </motion.div>
  );
}

const staggerChild = {
  hidden: { opacity: 0, y: 35 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const } },
};

/* ── Counter animation component ── */
function AnimatedCounter({ value, inView }: { value: string; inView: boolean }) {
  const [display, setDisplay] = useState(value);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!inView || hasAnimated.current) return;
    hasAnimated.current = true;

    const numericMatch = value.match(/[\d.]+/);
    if (!numericMatch) return;

    const target = parseFloat(numericMatch[0]);
    const suffix = value.replace(numericMatch[0], "");
    const hasDecimal = value.includes(".");
    const hasPlus = value.includes("+");
    const duration = 2000;
    const startTime = Date.now();

    function tick() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      const current = target * eased;

      if (hasDecimal) {
        setDisplay(current.toFixed(1) + suffix);
      } else {
        setDisplay(Math.floor(current) + (hasPlus ? "+" : "") + suffix.replace("+", ""));
      }

      if (progress < 1) requestAnimationFrame(tick);
      else setDisplay(value);
    }
    requestAnimationFrame(tick);
  }, [inView, value]);

  return <>{display}</>;
}

/* ── Data ── */
interface FeaturedEvent {
  id: string; title: string; startAt: string | null; region: string | null;
  eventType: string; status: string; coverImageUrl: string | null;
}

const galleryImages: GalleryImage[] = [
  { src: "/images/events/World Water Week at the Embassy of Netherlands in 2024.jpeg", alt: "World Water Week at the Embassy of Netherlands, 2024", caption: "World Water Week at the Embassy of Netherlands" },
  { src: "/images/events/KYPW at UNESCO Water Youth Dialogue in 2025.png", alt: "KYPW at UNESCO Water Youth Dialogue, 2025", caption: "KYPW at UNESCO Water Youth Dialogue" },
  { src: "/images/events/KYPW and Opero Training Students in MUST on Sanitation Technologies - 07.03.2025.jpeg", alt: "Training Students in MUST on Sanitation Technologies", caption: "Training Students on Sanitation Technologies" },
  { src: "/images/events/Habiba at CGIAR Science Week in 2025.jpeg", alt: "Habiba at CGIAR Science Week, 2025", caption: "Habiba at CGIAR Science Week" },
  { src: "/images/events/Danielle Kamtie, Co-Founder AYPW, pictured with KYPW during a visit on 31.05.2025.png", alt: "Danielle Kamtie, Co-Founder AYPW, with KYPW", caption: "Danielle Kamtie of AYPW visiting KYPW" },
  { src: "/images/events/President (Habiba Dida) and Partnerships Officer (Pamba Ojera) at World Water Week at the Embassy of Netherlands in 2024.jpeg", alt: "President Habiba Dida and Partnerships Officer Pamba Ojera at World Water Week", caption: "President & Partnerships Officer at World Water Week" },
  { src: "/images/events/Vice President (Njeri Ngugi) at a Multi-Stakeholder Consultation Ahead of the 2026 UN Water Conference.png", alt: "Vice President Njeri Ngugi at Multi-Stakeholder Consultation", caption: "Vice President at UN Water Conference Consultation" },
  { src: "/images/events/Habiba Dida at Africa Climate Summit 2023.jpeg", alt: "Habiba Dida at Africa Climate Summit 2023", caption: "Habiba Dida at Africa Climate Summit" },
];

const STATS = [
  { value: "47", label: "Counties engaged", dot: "bg-[#49769F]" },
  { value: "120+", label: "Youth coordinators", dot: "bg-[#4E8EA2]" },
  { value: "32", label: "Events delivered", dot: "bg-[#7BBDE8]" },
  { value: "8.4k", label: "Lives reached", dot: "bg-[#6EA2B3]" },
];

const MARQUEE_TEXT = "Kenya Youth Parliament for Water \u2022 National Chapter of the World Youth Parliament for Water \u2022 African Youth Parliament for Water \u2022 Advancing SDG 6: Clean Water and Sanitation \u2022 Leave No One Behind \u2022 Water is a Human Right \u2022 Youth-Led Water Governance \u2022 ";

interface HomePageProps { onNavigate: (route: string) => void; }

export function HomePage({ onNavigate }: HomePageProps) {
  const [events, setEvents] = useState<FeaturedEvent[]>([]);
  const [nlEmail, setNlEmail] = useState("");
  const [nlSubscribing, setNlSubscribing] = useState(false);
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true });

  useEffect(() => {
    fetch("/api/events?public=true")
      .then((res) => res.json())
      .then((data) => { if (data.events) setEvents(data.events.slice(0, 3)); })
      .catch(() => {});
  }, []);

  return (
    <main className="flex-1">
      {/* ═══════════ HERO — Full viewport ═══════════ */}
      <section className="relative min-h-screen overflow-hidden flex flex-col">
        <Image src="/images/hero-bg.jpg" alt="KYPW Hero" fill className="object-cover" priority sizes="100vw" />

        {/* Ocean Blue gradient overlay */}
        <div className="absolute inset-0 z-[1]" style={{ background: "linear-gradient(135deg, rgba(20,60,100,0.82) 0%, rgba(40,100,150,0.75) 40%, rgba(100,170,190,0.68) 100%)" }} />
        <div className="absolute inset-0 z-[2]" style={{ background: "linear-gradient(180deg, transparent 0%, rgba(10,25,40,0.45) 100%)" }} />

        {/* Grain overlay */}
        <div className="absolute inset-0 z-[3] noise-light" />

        {/* Animated circular decorations */}
        <div className="absolute inset-0 z-[4]">
          <CircularDecorations />
        </div>

        {/* Hero content */}
        <div className="relative z-10 flex-1 flex items-center">
          <div className="mx-auto max-w-7xl w-full px-4 py-28 sm:px-6 lg:py-0">
            <motion.div className="max-w-4xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}>
                <span className="inline-flex items-center gap-2.5 rounded-full border border-white/12 bg-white/6 px-5 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-white/70 backdrop-blur-md">
                  <Sparkles className="h-3.5 w-3.5 text-[#7BBDE8]" />
                  National Chapter of the World Youth Parliament for Water
                </span>
              </motion.div>

              <motion.h1 className="mt-10 font-display text-5xl leading-[1.02] text-white text-balance sm:text-7xl lg:text-8xl tracking-tight"
                initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}>
                Water is a right.{" "}
                <span className="block mt-3 bg-gradient-to-r from-[#BDD8E9] via-[#7BBDE8] to-[#4E8EA2] bg-clip-text text-transparent">
                  We are the generation that will secure it.
                </span>
              </motion.h1>

              <motion.p className="mt-8 max-w-2xl text-xl leading-relaxed text-white/75 font-light text-prose"
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}>
                The Kenya Youth Parliament for Water (KYPW) mobilises young leaders across all 47 counties to drive civic action for water security and sanitation. As the Kenyan national chapter of the World Youth Parliament for Water and a proud affiliate of the African Youth Parliament for Water, we work to advance SDG&nbsp;6 by ensuring that Kenyan youth voices shape the policies, programmes and investments that determine who has access to clean water and when.
              </motion.p>

              <motion.div className="mt-12 flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}>
                <Button size="lg" className="group rounded-full bg-[#7BBDE8] px-8 text-[#0A4174] hover:bg-[#6EA2B3] font-semibold shadow-lg shadow-[#4E8EA2]/25 transition-all duration-500 hover:shadow-xl hover:shadow-[#4E8EA2]/30"
                  onClick={() => onNavigate("/events")}>
                  Explore our work
                  <ArrowRight className="ml-2.5 h-4 w-4 transition-transform duration-500 group-hover:translate-x-1.5" />
                </Button>
                <Button size="lg" variant="outline"
                  className="rounded-full border-white/15 bg-white/5 px-8 text-white hover:bg-white/12 hover:text-white hover:border-white/25 backdrop-blur-sm transition-all duration-500"
                  onClick={() => onNavigate("/about")}>
                  Our mission
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scrolling marquee at bottom of hero */}
        <div className="relative z-10 mt-auto border-t border-white/10 bg-black/20 backdrop-blur-sm overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap">
            {[...Array(2)].map((_, setIdx) => (
              <span key={setIdx} className="inline-block px-6 py-4 text-[12px] font-medium uppercase tracking-[0.25em] text-white/40">
                {MARQUEE_TEXT}
              </span>
            ))}
          </div>
        </div>

        <Waves className="pointer-events-none absolute bottom-20 right-8 z-10 h-48 w-48 text-white/5 animate-float" />
      </section>

      {/* ═══════════ IMPACT BAR — Dark section ═══════════ */}
      <section ref={statsRef} className="relative overflow-hidden section-dark">
        <div className="absolute inset-0 noise-light" />
        <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-2 gap-y-12 px-4 py-20 sm:grid-cols-4 sm:px-6">
          {STATS.map((stat, i) => (
            <motion.div key={stat.label} className="text-center"
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}>
              <div className="flex items-center justify-center gap-3">
                <span className={`h-2 w-2 rounded-full ${stat.dot} animate-counter`} />
                <span className="font-display text-5xl font-semibold text-white sm:text-6xl tracking-tight">
                  <AnimatedCounter value={stat.value} inView={statsInView} />
                </span>
              </div>
              <div className="mt-2 text-[11px] uppercase tracking-[0.2em] text-white/40 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>
        {/* Subtle bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </section>

      {/* ═══════════ SECTION DIVIDER ═══════════ */}
      <div className="section-divider" />

      {/* ═══════════ PILLARS ═══════════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-mesh opacity-20 pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 py-32 sm:px-6">
          <SectionReveal>
            <div className="max-w-3xl">
              <span className="inline-block rounded-full bg-[#4E8EA2]/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0A4174]">
                Our pillars
              </span>
              <h2 className="mt-5 font-display text-4xl font-semibold text-foreground sm:text-5xl lg:text-6xl tracking-tight">
                Coordinated youth action,{" "}
                <span className="text-gradient-hero">grounded in community.</span>
              </h2>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl text-prose">
                KYPW unites county coordinators, field officers, institutional partners and communications specialists into a single structured network. Together, we translate local water challenges into evidence-based civic engagement, measurable outcomes and lasting impact on the ground, advancing Kenya&apos;s commitment to SDG&nbsp;6.
              </p>
            </div>
          </SectionReveal>

          <div className="section-divider mt-14 mb-14" />

          <StaggerReveal className="grid gap-6 md:grid-cols-3">
            {[
              { icon: Calendar, title: "Convene", body: "We design and deliver purpose-driven convenings, from community dialogues and county-level policy forums to innovation hackathons and international summits. Every gathering is meticulously planned, rigorously documented and made publicly visible to ensure accountability and shared learning.", iconBg: "bg-[#0A4174]/10 text-[#0A4174]", accent: "from-[#0A4174]/20" },
              { icon: Users, title: "Coordinate", body: "A structured network of youth coordinators and field officers spans all 47 Kenyan counties, working hand in hand with government agencies, civil society organisations and development partners to ensure that water governance efforts are aligned, inclusive and locally led.", iconBg: "bg-[#4E8EA2]/10 text-[#4E8EA2]", accent: "from-[#4E8EA2]/20" },
              { icon: Globe2, title: "Amplify", body: "Through impact storytelling, field-generated data and policy briefs, KYPW positions Kenyan youth at the heart of national and global conversations on water security, from the African Youth Parliament for Water to the World Youth Parliament for Water and the United Nations.", iconBg: "bg-[#6EA2B3]/10 text-[#6EA2B3]", accent: "from-[#6EA2B3]/20" },
            ].map((p) => (
              <motion.div key={p.title} variants={staggerChild}
                className="hover-lift card-modern border-gradient relative overflow-hidden rounded-2xl border border-border/50 bg-card p-8 lg:p-10">
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${p.accent} to-transparent`} />
                <div className="relative">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${p.iconBg}`}>
                    <p.icon className="h-7 w-7" />
                  </div>
                  <h3 className="mt-8 font-display text-2xl font-semibold tracking-tight">{p.title}</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground text-prose">{p.body}</p>
                </div>
              </motion.div>
            ))}
          </StaggerReveal>
        </div>
      </section>

      {/* ═══════════ FEATURED EVENTS — Dark section ═══════════ */}
      <section className="relative overflow-hidden section-dark py-28">
        <div className="absolute inset-0 noise-light" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
          <SectionReveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="inline-block rounded-full bg-white/8 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
                  Latest
                </span>
                <h2 className="mt-5 font-display text-4xl font-semibold text-white sm:text-5xl tracking-tight">
                  From the field
                </h2>
              </div>
              <Button variant="ghost" className="group rounded-full text-white/40 hover:text-white hover:bg-white/8"
                onClick={() => onNavigate("/events")}>
                All events <ArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-500 group-hover:translate-x-1.5" />
              </Button>
            </div>
          </SectionReveal>

          <div className="section-divider mt-12 mb-12 !bg-gradient-to-r !from-transparent !via-white/10 !to-transparent" />

          <StaggerReveal className="grid gap-6 md:grid-cols-3">
            {events.length === 0
              ? Array.from({ length: 3 }).map((_, i) => (
                  <motion.div key={i} variants={staggerChild}>
                    <div className="aspect-[4/5] animate-shimmer rounded-2xl bg-gradient-to-r from-white/5 via-white/3 to-white/5" />
                  </motion.div>
                ))
              : events.map((e) => (
                  <motion.article key={e.id} variants={staggerChild}
                    className="group hover-press cursor-pointer overflow-hidden rounded-2xl border border-white/8 bg-white/5 backdrop-blur-sm"
                    onClick={() => onNavigate(`/events/${e.id}`)}>
                    <div className="relative aspect-[4/3] overflow-hidden">
                      {e.coverImageUrl ? (
                        <img src={e.coverImageUrl} alt={e.title} loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-hero text-white/20">
                          <Droplet className="h-16 w-16" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                      <span className="absolute left-4 top-4 rounded-full bg-white/15 backdrop-blur-md px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white border border-white/10">
                        {e.eventType.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div className="p-7">
                      <h3 className="font-display text-xl font-semibold leading-tight text-white">{e.title}</h3>
                      <div className="mt-4 flex items-center gap-4 text-xs text-white/40">
                        {e.startAt && (
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(e.startAt).toLocaleDateString("en-KE", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        )}
                        {e.region && (
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5" />{e.region}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.article>
                ))}
          </StaggerReveal>

          {events.length === 0 && (
            <p className="mt-10 text-center text-sm text-white/30">
              No events published yet. Sign in and head to the dashboard to create the first one.
            </p>
          )}
        </div>
      </section>

      {/* ═══════════ GALLERY ═══════════ */}
      <section className="relative overflow-hidden py-28">
        <div className="absolute inset-0 opacity-10">
          <FloatingRings color="#6EA2B3" />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
          <SectionReveal>
            <div className="flex items-start justify-between">
              <div className="max-w-2xl">
                <span className="inline-block rounded-full bg-[#49769F]/8 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0A4174]">
                  Gallery
                </span>
                <h2 className="mt-5 font-display text-4xl font-semibold text-foreground sm:text-5xl tracking-tight">
                  Moments that define our movement
                </h2>
                <p className="mt-5 text-muted-foreground text-lg text-prose">
                  From floor interventions at the UN Water Conference and the World Youth Parliament for Water, to hands-on community training sessions across Kenya, these images capture the milestones and everyday moments of a growing youth-led movement for water security and sanitation.
                </p>
              </div>
              <span className="hidden sm:block font-display text-8xl font-bold text-foreground/[0.04] tracking-tighter leading-none mt-2">
                08
              </span>
            </div>
          </SectionReveal>

          <div className="section-divider mt-14 mb-14" />

          <div className="mt-2">
            <ModernGallery images={galleryImages} columns={4} />
          </div>
        </div>
      </section>

      {/* ═══════════ NEWSLETTER CTA — Dramatic ═══════════ */}
      <section className="mx-auto max-w-7xl px-4 pb-32 sm:px-6">
        <SectionReveal>
          <div className="relative overflow-hidden rounded-3xl p-12 sm:p-20 shadow-dramatic">
            {/* Dark gradient base */}
            <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, oklch(0.22 0.035 245) 0%, oklch(0.20 0.03 250) 50%, oklch(0.25 0.04 245) 100%)" }} />
            {/* Animated gradient shift */}
            <div className="absolute inset-0 animate-gradient-shift" style={{ background: "linear-gradient(135deg, oklch(0.45 0.08 220 / 0.3) 0%, oklch(0.42 0.075 245 / 0.25) 35%, oklch(0.50 0.06 220 / 0.3) 100%)", backgroundSize: "200% 200%" }} />
            {/* Grain */}
            <div className="absolute inset-0 noise-light" />
            {/* Glow orbs */}
            <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full blur-3xl" style={{ background: "rgba(123,189,232,0.15)" }} />
            <div className="absolute -left-20 -bottom-20 h-72 w-72 rounded-full blur-3xl" style={{ background: "rgba(78,142,162,0.12)" }} />

            <div className="relative z-10 grid gap-12 md:grid-cols-2 md:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#7BBDE8]/20 bg-[#7BBDE8]/8 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#BDD8E9]">
                  <Mail className="h-3 w-3" />
                  Newsletter
                </div>
                <h2 className="mt-6 font-display text-4xl font-semibold text-white sm:text-5xl lg:text-6xl tracking-tight leading-[1.05]">
                  Be part of the
                  <span className="block mt-1 bg-gradient-to-r from-[#BDD8E9] via-[#7BBDE8] to-[#4E8EA2] bg-clip-text text-transparent">
                    water generation.
                  </span>
                </h2>
                <p className="mt-5 text-lg text-white/70 leading-relaxed max-w-md text-prose">
                  Get exclusive updates on events and convenings across Kenya, impact stories from the field, and early access to volunteer and partnership opportunities. Join 120+ youth coordinators already driving change in all 47 counties.
                </p>
                <div className="mt-6 flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[oklch(0.22,0.035,245)] text-[10px] font-bold text-white" style={{ background: `oklch(${0.55 + i * 0.06} 0.08 ${200 + i * 12})` }}>
                        {String.fromCharCode(65 + i)}
                      </div>
                    ))}
                  </div>
                  <span className="text-sm text-white/50">Trusted by <strong className="text-white/70">120+</strong> youth leaders</span>
                </div>
              </div>
              <div>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!nlEmail.includes("@")) { toast.error("Please enter a valid email address"); return; }
                    setNlSubscribing(true);
                    try {
                      const res = await fetch("/api/newsletter/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: nlEmail.trim() }) });
                      const data = await res.json();
                      if (data.success) { toast.success(data.message); setNlEmail(""); }
                      else { toast.error(data.error || "Subscription failed. Please try again."); }
                    } catch { toast.error("Something went wrong. Please check your connection and try again."); }
                    finally { setNlSubscribing(false); }
                  }}
                  className="space-y-4">
                  <div className="relative">
                    <Input type="email" placeholder="your@email.com" value={nlEmail} onChange={(e) => setNlEmail(e.target.value)} required
                      className="h-14 rounded-2xl border-white/10 bg-white/6 pl-6 pr-4 text-white placeholder:text-white/25 focus-visible:ring-[#7BBDE8]/30 focus-visible:border-[#7BBDE8]/30 backdrop-blur-sm text-base" />
                  </div>
                  <Button type="submit" size="lg" disabled={nlSubscribing}
                    className="w-full h-14 rounded-2xl bg-[#BDD8E9] px-7 text-[#0A4174] hover:bg-[#9CC8E0] font-bold text-base shadow-lg shadow-[#4E8EA2]/20 transition-all duration-500 hover:shadow-[#4E8EA2]/30">
                    {nlSubscribing ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Mail className="mr-2.5 h-5 w-5" />Subscribe to updates</>}
                  </Button>
                </form>
                <p className="mt-4 text-[11px] text-white/30 leading-relaxed">
                  No spam, ever. Unsubscribe anytime. We respect your privacy and only share content that matters to Kenya&apos;s water sector.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Button size="sm" variant="outline"
                    className="rounded-full border-white/15 bg-white/5 text-white/80 hover:bg-white/12 hover:text-white hover:border-white/25 backdrop-blur-sm transition-all duration-500"
                    onClick={() => onNavigate("/auth")}>
                    Sign in to dashboard <ArrowRight className="ml-2 h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </SectionReveal>
      </section>
    </main>
  );
}
