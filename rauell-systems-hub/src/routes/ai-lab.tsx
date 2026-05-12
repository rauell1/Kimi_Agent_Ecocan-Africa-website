import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bot, Check, Copy, Cpu, Loader2, Sparkles, Wrench } from "lucide-react";
import { FadeIn } from "@/components/FadeIn";
import { generateArchitecture } from "@/server/ai";

export const Route = createFileRoute("/ai-lab")({
  head: () => ({
    meta: [
      { title: "AI Lab — Rauell" },
      { name: "description", content: "Describe a real-world challenge. The Rauell AI Lab proposes a buildable system architecture." },
      { property: "og:title", content: "AI Lab — Rauell" },
      { property: "og:description", content: "Generate buildable system architectures from real-world challenges." },
    ],
  }),
  component: AILabPage,
});

type Result = Awaited<ReturnType<typeof generateArchitecture>>;

const EXAMPLES = [
  "Solar microgrid for a 200-household rural community",
  "Real-time fleet monitoring for electric boda-bodas",
  "Event check-in & engagement platform for 5,000 attendees",
];

function AILabPage() {
  const [challenge, setChallenge] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const onGenerate = async () => {
    setError(null);
    setResult(null);
    if (challenge.trim().length < 4) {
      setError("Describe your challenge in a sentence or two.");
      return;
    }
    setLoading(true);
    try {
      const r = await generateArchitecture({ data: { challenge } });
      setResult(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
      <FadeIn>
        <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">/ ai-lab</p>
        <h1 className="mt-3 max-w-3xl font-display text-5xl font-bold tracking-tight md:text-6xl">
          Describe a challenge.<br />Get a buildable architecture.
        </h1>
        <p className="mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
          The Rauell AI Lab proposes hardware, software, and AI agents grounded in real systems engineering.
        </p>
      </FadeIn>

      <FadeIn delay={120}>
        <div className="mt-10 rounded-xl border border-border bg-card p-5 shadow-soft md:p-6">
          <label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            challenge
          </label>
          <textarea
            value={challenge}
            onChange={(e) => setChallenge(e.target.value)}
            rows={5}
            placeholder="e.g. Solar monitoring system for an EV charging fleet across rural Kenya…"
            className="mt-2 w-full resize-none rounded-md border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-accent focus-visible:ring-2 focus-visible:ring-ring"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => setChallenge(ex)}
                className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground"
              >
                {ex}
              </button>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={onGenerate}
              disabled={loading}
              className="group inline-flex items-center gap-2 rounded-md bg-foreground px-5 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {loading ? "Designing system…" : "Generate Architecture"}
            </button>
            {error && <span className="text-sm text-destructive">{error}</span>}
          </div>
        </div>
      </FadeIn>

      {loading && !result && (
        <FadeIn>
          <div className="mt-10 space-y-5">
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="h-3 w-24 animate-pulse rounded bg-muted" />
              <div className="mt-4 h-7 w-2/3 animate-pulse rounded bg-muted" />
              <div className="mt-3 h-4 w-full animate-pulse rounded bg-muted" />
              <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-muted" />
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-6">
                  <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                  <div className="mt-5 space-y-2">
                    <div className="h-3 w-full animate-pulse rounded bg-muted" />
                    <div className="h-3 w-11/12 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      )}

      {result && (
        <FadeIn>
          <div className="mt-10 space-y-5">
            <div className="rounded-xl border border-accent/40 bg-accent/5 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-widest text-accent">project</p>
                  <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">{result.project_name}</h2>
                </div>
                <CopyButton getText={() => formatResult(result)} label="Copy all" />
              </div>
              <p className="mt-3 text-sm text-muted-foreground md:text-base">{result.summary}</p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <Section title="Hardware" icon={Wrench} items={result.hardware} />
              <Section title="Software" icon={Cpu} items={result.software} />
              <div className="rounded-xl border border-border bg-card p-6">
                <header className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-accent" />
                    <h3 className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">AI Agents</h3>
                  </div>
                  <CopyButton getText={() => result.ai_agents.map((a) => `${a.name}: ${a.role}`).join("\n")} />
                </header>
                <ul className="mt-4 space-y-3">
                  {result.ai_agents.map((a) => (
                    <li key={a.name} className="rounded-md border border-border bg-background p-3">
                      <div className="font-display text-sm font-semibold">{a.name}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{a.role}</div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </FadeIn>
      )}
    </section>
  );
}

function formatResult(r: Result): string {
  return [
    `# ${r.project_name}`,
    ``,
    r.summary,
    ``,
    `## Hardware`,
    ...r.hardware.map((h) => `- ${h}`),
    ``,
    `## Software`,
    ...r.software.map((s) => `- ${s}`),
    ``,
    `## AI Agents`,
    ...r.ai_agents.map((a) => `- ${a.name}: ${a.role}`),
  ].join("\n");
}

function CopyButton({ getText, label }: { getText: () => string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(getText());
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };
  return (
    <button
      onClick={onCopy}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 font-mono text-[11px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {copied ? <Check className="h-3 w-3 text-accent" /> : <Copy className="h-3 w-3" />}
      {copied ? "copied" : label ?? "copy"}
    </button>
  );
}

function Section({
  title, icon: Icon, items,
}: { title: string; icon: React.ComponentType<{ className?: string }>; items: string[] }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-accent" />
          <h3 className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{title}</h3>
        </div>
        <CopyButton getText={() => items.join("\n")} />
      </header>
      <ul className="mt-4 space-y-2 text-sm">
        {items.map((it) => (
          <li key={it} className="flex gap-2 text-foreground/85">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
