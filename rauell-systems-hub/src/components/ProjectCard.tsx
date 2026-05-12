import { ArrowUpRight, Github, Radio } from "lucide-react";
import type { Project } from "@/lib/projects";
import { cn } from "@/lib/utils";

const ACCENT: Record<Project["category"], string> = {
  Energy: "bg-energy",
  Digital: "bg-digital",
  Community: "bg-community",
};

export function ProjectCard({ p, className }: { p: Project; className?: string }) {
  return (
    <a
      href={p.url}
      target="_blank"
      rel="noreferrer"
      onMouseMove={(e) => {
        const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
        (e.currentTarget as HTMLElement).style.setProperty("--mx", `${e.clientX - r.left}px`);
        (e.currentTarget as HTMLElement).style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
      className={cn(
        "spotlight group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          <span className={cn("h-1.5 w-1.5 rounded-full", ACCENT[p.category])} />
          {p.category}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background/50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <Radio className="h-3 w-3 text-accent" /> {p.status}
        </span>
      </div>

      <h3 className="mt-5 font-display text-2xl font-semibold tracking-tight">{p.title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>

      <div className="mt-6 flex flex-wrap gap-1.5">
        {p.tags.map((t) => (
          <span
            key={t}
            className="rounded-md border border-border bg-secondary/60 px-2 py-0.5 text-[11px] text-muted-foreground"
          >
            {t}
          </span>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-sm">
        <span className="inline-flex items-center gap-1.5 text-foreground/80 transition-colors group-hover:text-accent">
          Visit <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
        {p.github && (
          <a
            href={p.github}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <Github className="h-4 w-4" />
          </a>
        )}
      </div>
    </a>
  );
}
