import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Cpu, Leaf, Zap } from "lucide-react";
import { Terminal } from "@/components/Terminal";
import { FadeIn } from "@/components/FadeIn";
import { ProjectCard } from "@/components/ProjectCard";
import { PROJECTS } from "@/lib/projects";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Rauell — Energy, Mobility & Digital Systems" },
      {
        name: "description",
        content:
          "Rauell develops infrastructure across clean energy, mobility, and digital platforms.",
      },
      { property: "og:title", content: "Rauell — Energy, Mobility & Digital Systems" },
      {
        property: "og:description",
        content: "Infrastructure across clean energy, mobility, and digital platforms.",
      },
    ],
  }),
  component: HomePage,
});

const STATS = [
  { value: "8+", label: "Live Systems" },
  { value: "4+", label: "Core Verticals" },
  { value: "3+", label: "Platforms" },
];

const PILLARS = [
  {
    icon: Zap,
    title: "Energy & Mobility",
    desc: "Solar monitoring, real-time analytics, and infrastructure for clean energy and mobility.",
    color: "text-energy",
  },
  {
    icon: Cpu,
    title: "Platforms & Tools",
    desc: "AI tools, dashboards, and CLI utilities for builders and engineering teams.",
    color: "text-digital",
  },
  {
    icon: Leaf,
    title: "Community Impact",
    desc: "Sustainability initiatives, events, and creative platforms that bring people together.",
    color: "text-community",
  },
];

function HomePage() {
  const featured = PROJECTS.slice(0, 3);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-16 md:px-8 md:pb-28 md:pt-24">
          <div className="grid items-start gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <FadeIn>
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                  systems · operational
                </div>
              </FadeIn>
              <FadeIn delay={80}>
                <h1 className="mt-6 font-display text-5xl font-bold leading-[1.02] tracking-tight md:text-7xl">
                  Energy, Mobility &<br />
                  <span className="bg-gradient-to-r from-foreground to-accent bg-clip-text text-transparent">
                    Digital Systems.
                  </span>
                </h1>
              </FadeIn>
              <FadeIn delay={160}>
                <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
                  Rauell develops infrastructure across clean energy, mobility, and digital platforms.
                </p>
              </FadeIn>
              <FadeIn delay={240}>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    to="/systems"
                    className="group inline-flex items-center gap-2 rounded-md bg-foreground px-5 py-3 text-sm font-medium text-background transition-all hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Explore Platforms
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link
                    to="/projects"
                    className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-5 py-3 text-sm font-medium transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    View Projects
                  </Link>
                  <Link
                    to="/ai-lab"
                    className="inline-flex items-center gap-2 rounded-md border border-accent/40 bg-accent/10 px-5 py-3 text-sm font-medium text-accent transition-colors hover:bg-accent/15"
                  >
                    AI Lab
                  </Link>
                </div>
              </FadeIn>

              <FadeIn delay={320}>
                <div className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-border pt-8">
                  {STATS.map((s) => (
                    <div key={s.label}>
                      <div className="font-display text-3xl font-bold tracking-tight md:text-4xl">{s.value}</div>
                      <div className="mt-1 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{s.label}</div>
                    </div>
                  ))}
                </div>
              </FadeIn>
            </div>

            <div className="lg:col-span-5">
              <FadeIn delay={200}>
                <Terminal />
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* PILLARS */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
          <FadeIn>
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">/ ecosystem</p>
                <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-5xl">
                  Three pillars. One system.
                </h2>
              </div>
              <Link to="/systems" className="hidden text-sm text-muted-foreground hover:text-accent md:inline-flex">
                Read more →
              </Link>
            </div>
          </FadeIn>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {PILLARS.map((p, i) => (
              <FadeIn key={p.title} delay={i * 80}>
                <div className="spotlight group h-full rounded-xl border border-border bg-card p-6 transition-colors hover:border-accent/40">
                  <div className="grid h-11 w-11 place-items-center rounded-md border border-border bg-background">
                    <p.icon className={`h-5 w-5 ${p.color}`} />
                  </div>
                  <h3 className="mt-6 font-display text-xl font-semibold">{p.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* SYSTEM NARRATIVE */}
      <section className="relative border-t border-border overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-20 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
        <div className="relative mx-auto max-w-6xl px-5 py-24 md:px-8 md:py-32">
          <FadeIn>
            <p className="text-center font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              / one ecosystem
            </p>
          </FadeIn>

          <FadeIn delay={80}>
            <h2 className="mx-auto mt-5 max-w-4xl text-balance text-center font-display text-3xl font-semibold leading-[1.15] tracking-tight md:text-5xl lg:text-6xl">
              Connecting{" "}
              <span className="text-energy">energy infrastructure</span>,{" "}
              <span className="text-digital">digital tools</span>, and{" "}
              <span className="text-community">community systems</span>.
            </h2>
          </FadeIn>

          <FadeIn delay={160}>
            <div className="relative mx-auto mt-16 grid max-w-3xl grid-cols-1 items-center gap-6 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:gap-4">
              {[
                { label: "Energy", color: "bg-energy", text: "text-energy", count: 3 },
                { label: "Digital", color: "bg-digital", text: "text-digital", count: 3 },
                { label: "Community", color: "bg-community", text: "text-community", count: 3 },
              ].map((node, i, arr) => (
                <div key={node.label} className="contents">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <span className={`h-2 w-2 rounded-full ${node.color} ring-4 ring-offset-2 ring-offset-background`} style={{ ['--tw-ring-color' as never]: 'transparent' }} />
                    <div className={`font-display text-lg font-semibold ${node.text}`}>{node.label}</div>
                    <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                      {node.count} live
                    </div>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="hidden md:block h-px w-full bg-gradient-to-r from-border via-foreground/20 to-border" />
                  )}
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FEATURED PROJECTS */}
      <section className="border-t border-border bg-secondary/30">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
          <FadeIn>
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">/ projects</p>
                <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-5xl">
                  Live systems.
                </h2>
              </div>
              <Link to="/projects" className="text-sm text-muted-foreground hover:text-accent">
                See all →
              </Link>
            </div>
          </FadeIn>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((p, i) => (
              <FadeIn key={p.title} delay={i * 80}>
                <ProjectCard p={p} />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
