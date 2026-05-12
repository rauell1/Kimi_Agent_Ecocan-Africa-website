import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Layers, Network, Workflow } from "lucide-react";
import { FadeIn } from "@/components/FadeIn";
import { PROJECTS } from "@/lib/projects";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Rauell" },
      { name: "description", content: "Rauell is a systems-driven builder of energy, digital, and community infrastructure." },
      { property: "og:title", content: "About — Rauell" },
      { property: "og:description", content: "A systems-driven builder of energy, digital, and community infrastructure." },
    ],
  }),
  component: AboutPage,
});

const PRINCIPLES = [
  {
    icon: Layers,
    title: "Systems thinking",
    desc: "Every project is approached as a layered system — hardware, software, data, and people.",
  },
  {
    icon: Workflow,
    title: "Engineering focus",
    desc: "Built for production: observable, maintainable, and grounded in real-world constraints.",
  },
  {
    icon: Network,
    title: "Infrastructure first",
    desc: "Long-lived platforms over short-lived demos — across energy, mobility, and digital.",
  },
];

function AboutPage() {
  const counts = {
    Energy: PROJECTS.filter((p) => p.category === "Energy").length,
    Digital: PROJECTS.filter((p) => p.category === "Digital").length,
    Community: PROJECTS.filter((p) => p.category === "Community").length,
  };

  return (
    <section className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
      <FadeIn>
        <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">/ about</p>
        <h1 className="mt-3 max-w-4xl font-display text-5xl font-bold tracking-tight md:text-6xl">
          A systems-driven builder of infrastructure.
        </h1>
        <p className="mt-6 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
          Rauell develops infrastructure across clean energy, mobility, and digital platforms — designed and operated as connected systems rather than isolated products.
        </p>
      </FadeIn>

      <FadeIn delay={120}>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {PRINCIPLES.map((p) => (
            <div key={p.title} className="spotlight rounded-xl border border-border bg-card p-6">
              <div className="grid h-11 w-11 place-items-center rounded-md border border-border bg-background">
                <p.icon className="h-5 w-5 text-accent" />
              </div>
              <h3 className="mt-6 font-display text-xl font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>
      </FadeIn>

      <FadeIn delay={200}>
        <div className="mt-16 rounded-xl border border-border bg-card p-6 md:p-10">
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">/ footprint</p>
          <div className="mt-6 grid gap-8 md:grid-cols-4">
            <Stat value={`${PROJECTS.length}+`} label="Live systems" />
            <Stat value={`${counts.Energy}`} label="Energy projects" accent="text-energy" />
            <Stat value={`${counts.Digital}`} label="Digital platforms" accent="text-digital" />
            <Stat value={`${counts.Community}`} label="Community platforms" accent="text-community" />
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={280}>
        <div className="mt-16 flex flex-col items-start gap-4 border-t border-border pt-10 md:flex-row md:items-center md:justify-between">
          <p className="max-w-xl text-lg text-foreground/90">
            Want to see what's running in production?
          </p>
          <Link
            to="/projects"
            className="group inline-flex items-center gap-2 rounded-md bg-foreground px-5 py-3 text-sm font-medium text-background hover:opacity-90"
          >
            Explore projects
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </FadeIn>
    </section>
  );
}

function Stat({ value, label, accent }: { value: string; label: string; accent?: string }) {
  return (
    <div>
      <div className={`font-display text-4xl font-bold tracking-tight md:text-5xl ${accent ?? ""}`}>{value}</div>
      <div className="mt-1 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
}
