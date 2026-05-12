import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, Github, Mail } from "lucide-react";
import { FadeIn } from "@/components/FadeIn";
import { CONTACT_EMAIL, GITHUB_URL } from "@/lib/projects";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Rauell" },
      { name: "description", content: "Let's build systems that matter. Reach Rauell at info@rauell.systems." },
      { property: "og:title", content: "Contact — Rauell" },
      { property: "og:description", content: "Let's build systems that matter." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <div className="relative mx-auto max-w-5xl px-5 py-24 md:px-8 md:py-32">
        <FadeIn>
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">/ contact</p>
          <h1 className="mt-3 font-display text-5xl font-bold tracking-tight md:text-7xl">
            Let's build systems<br />
            <span className="bg-gradient-to-r from-foreground to-accent bg-clip-text text-transparent">
              that matter.
            </span>
          </h1>
        </FadeIn>

        <FadeIn delay={120}>
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="spotlight group flex items-start justify-between gap-6 rounded-xl border border-border bg-card p-6 transition-colors hover:border-accent/40"
            >
              <div>
                <div className="grid h-11 w-11 place-items-center rounded-md border border-border bg-background">
                  <Mail className="h-5 w-5 text-accent" />
                </div>
                <p className="mt-5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">email</p>
                <p className="mt-1 font-display text-2xl font-semibold tracking-tight">{CONTACT_EMAIL}</p>
                <p className="mt-2 text-sm text-muted-foreground">For partnerships, projects, and platform inquiries.</p>
              </div>
              <ArrowUpRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
            </a>

            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="spotlight group flex items-start justify-between gap-6 rounded-xl border border-border bg-card p-6 transition-colors hover:border-accent/40"
            >
              <div>
                <div className="grid h-11 w-11 place-items-center rounded-md border border-border bg-background">
                  <Github className="h-5 w-5 text-accent" />
                </div>
                <p className="mt-5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">github</p>
                <p className="mt-1 font-display text-2xl font-semibold tracking-tight">github.com/rauell1</p>
                <p className="mt-2 text-sm text-muted-foreground">Open-source tools, CLIs, and engineering work.</p>
              </div>
              <ArrowUpRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
            </a>
          </div>
        </FadeIn>

        <FadeIn delay={220}>
          <div className="mt-12 flex items-center gap-3 font-mono text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            currently accepting new systems work
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
