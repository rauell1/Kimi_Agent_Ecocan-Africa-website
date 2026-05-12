import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FadeIn } from "@/components/FadeIn";
import { ProjectCard } from "@/components/ProjectCard";
import { PROJECTS, type ProjectCategory } from "@/lib/projects";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects — Rauell" },
      { name: "description", content: "Live systems by Rauell: solar monitoring, AI tools, community platforms, and CLI utilities." },
      { property: "og:title", content: "Projects — Rauell" },
      { property: "og:description", content: "Live systems by Rauell across energy, digital, and community." },
    ],
  }),
  component: ProjectsPage,
});

const FILTERS: ("All" | ProjectCategory)[] = ["All", "Energy", "Digital", "Community"];

const SPAN: Record<NonNullable<(typeof PROJECTS)[number]["span"]>, string> = {
  sm: "md:col-span-3",
  md: "md:col-span-4",
  lg: "md:col-span-5",
};

function ProjectsPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  const filtered = useMemo(
    () => (filter === "All" ? PROJECTS : PROJECTS.filter((p) => p.category === filter)),
    [filter]
  );

  return (
    <section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
      <FadeIn>
        <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">/ projects</p>
        <div className="mt-3 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <h1 className="max-w-3xl font-display text-5xl font-bold tracking-tight md:text-6xl">
            Systems in production.
          </h1>
          <p className="max-w-md text-sm text-muted-foreground md:text-base">
            A curated bento of live platforms across energy, digital, and community.
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={120}>
        <div className="mt-10 inline-flex flex-wrap gap-1 rounded-lg border border-border bg-card p-1">
          {FILTERS.map((f) => {
            const active = f === filter;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-md px-3.5 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {f}
                <span className="ml-1.5 font-mono text-[10px] text-muted-foreground/70">
                  {f === "All" ? PROJECTS.length : PROJECTS.filter((p) => p.category === f).length}
                </span>
              </button>
            );
          })}
        </div>
      </FadeIn>

      <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-9">
        {filtered.map((p, i) => (
          <FadeIn
            key={p.title}
            delay={i * 50}
            className={cn(SPAN[p.span ?? "md"])}
          >
            <ProjectCard p={p} className="h-full" />
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
