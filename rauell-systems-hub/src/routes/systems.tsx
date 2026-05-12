import { createFileRoute } from "@tanstack/react-router";
import { Battery, Cpu, Gauge, Leaf, Network, Terminal as TermIcon, Users, Zap } from "lucide-react";
import { FadeIn } from "@/components/FadeIn";

export const Route = createFileRoute("/systems")({
  head: () => ({
    meta: [
      { title: "Systems — Rauell" },
      { name: "description", content: "Three pillars powering Rauell: Energy & Mobility, Platforms & Tools, Community Impact." },
      { property: "og:title", content: "Systems — Rauell" },
      { property: "og:description", content: "Three pillars powering Rauell: energy, platforms, community." },
    ],
  }),
  component: SystemsPage,
});

const PILLARS = [
  {
    icon: Zap,
    color: "text-energy",
    title: "Energy & Mobility",
    desc: "Solar monitoring, real-time analytics, and infrastructure for clean energy and electric mobility.",
    items: [
      { icon: Battery, label: "Solar monitoring & fleet intelligence" },
      { icon: Gauge, label: "Real-time performance analytics" },
      { icon: Network, label: "Energy infrastructure for communities" },
    ],
  },
  {
    icon: Cpu,
    color: "text-digital",
    title: "Platforms & Tools",
    desc: "AI tools, dashboards, and CLI utilities engineered for builders and operators.",
    items: [
      { icon: TermIcon, label: "CLI tools for AI design systems" },
      { icon: Cpu, label: "AI-powered productivity tools" },
      { icon: Gauge, label: "Operational dashboards" },
    ],
  },
  {
    icon: Leaf,
    color: "text-community",
    title: "Community Impact",
    desc: "Sustainability initiatives, events, and creative platforms that bring people together.",
    items: [
      { icon: Leaf, label: "Sustainability and environmental impact" },
      { icon: Users, label: "Event management & engagement" },
      { icon: Network, label: "Creative & artistic platforms" },
    ],
  },
];

function SystemsPage() {
  return (
    <section className="relative">
      <div className="absolute inset-x-0 top-0 h-72 grid-bg opacity-30 [mask-image:linear-gradient(black,transparent)]" />
      <div className="relative mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <FadeIn>
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">/ systems</p>
          <h1 className="mt-3 max-w-3xl font-display text-5xl font-bold tracking-tight md:text-6xl">
            One ecosystem.<br />Three operating layers.
          </h1>
          <p className="mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
            Rauell's work is organized around three interconnected pillars — each a layer of the same systems-thinking approach.
          </p>
        </FadeIn>

        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {PILLARS.map((p, i) => (
            <FadeIn key={p.title} delay={i * 80}>
              <div className="spotlight flex h-full flex-col rounded-xl border border-border bg-card p-6">
                <div className="flex items-center justify-between">
                  <div className="grid h-11 w-11 place-items-center rounded-md border border-border bg-background">
                    <p.icon className={`h-5 w-5 ${p.color}`} />
                  </div>
                  <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">0{i + 1}</span>
                </div>
                <h2 className="mt-6 font-display text-2xl font-semibold tracking-tight">{p.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
                <ul className="mt-6 space-y-3 border-t border-border pt-5">
                  {p.items.map((it) => (
                    <li key={it.label} className="flex items-start gap-3 text-sm">
                      <it.icon className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground/85">{it.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
