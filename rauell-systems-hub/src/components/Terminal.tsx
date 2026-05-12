import { useEffect, useRef, useState } from "react";

type Line = { kind: "in" | "out" | "sys"; text: string };

const HELP = `Available commands:
  help         Show this message
  systems      List ecosystem pillars
  projects     List live projects
  deploy       Deployment status
  contact      Show contact details
  ai <query>   Ask the Rauell AI Lab
  whoami       About Rauell
  clear        Clear terminal`;

const DEPLOY = `[ok] safaricharge       deployed · live
[ok] roam-energy        deployed · live
[ok] solar dashboard    deployed · live
[ok] cv builder         deployed · live
[ok] greenwave          deployed · live
[ok] events             deployed · live
[ok] dj-kimchi          deployed · live
[ok] uipro-cli          published · github
[ok] portfolio          deployed · live
→ 9/9 systems operational`;

const SYSTEMS = `· Energy & Mobility   — solar, monitoring, infrastructure
· Platforms & Tools   — AI tools, dashboards, CLI
· Community Impact    — events, sustainability, creative`;

const PROJECTS = `· SafariCharge        safaricharge.rauell.systems
· Roam Energy         roam-energy.rauell.systems
· Solar Dashboard     solar.rauell.systems
· AI CV Builder       cv.rauell.systems
· Greenwave Society   greenwave.rauell.systems
· Events Platform     events.rauell.systems
· DJ Kimchi           dj-kimchi.rauell.systems
· UIPro CLI           github.com/rauell1/uipro-cli
· Portfolio           royotieno.rauell.systems`;

const WHOAMI = `Rauell develops infrastructure across clean energy,
mobility, and digital platforms.`;

const CONTACT = `email   info@rauell.systems
github  github.com/rauell1`;

export function Terminal() {
  const [lines, setLines] = useState<Line[]>([
    { kind: "sys", text: "rauell-shell v1.0 — type 'help' to begin" },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 9e9 });
  }, [lines]);

  const run = (raw: string) => {
    const cmd = raw.trim().toLowerCase();
    const next: Line[] = [...lines, { kind: "in", text: raw }];
    if (!cmd) return setLines(next);
    if (cmd === "clear") return setLines([]);
    let out = "";
    if (cmd.startsWith("ai ")) {
      const q = raw.trim().slice(3).trim();
      out = q
        ? `→ routing "${q}" to /ai-lab\n  open the AI Lab to generate a full architecture.`
        : `usage: ai <your challenge>`;
    } else {
      switch (cmd) {
        case "help": out = HELP; break;
        case "systems": out = SYSTEMS; break;
        case "projects": out = PROJECTS; break;
        case "deploy": out = DEPLOY; break;
        case "whoami": out = WHOAMI; break;
        case "contact": out = CONTACT; break;
        case "ai": out = `usage: ai <your challenge>`; break;
        default: out = `command not found: ${cmd}\ntry 'help'`;
      }
    }
    setLines([...next, { kind: "out", text: out }]);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-elevated">
      <div className="flex items-center gap-2 border-b border-border bg-secondary/60 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-energy/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-accent/80" />
        <span className="ml-3 font-mono text-xs text-muted-foreground">~/rauell — bash</span>
      </div>
      <div
        ref={scrollRef}
        className="h-[280px] overflow-y-auto px-4 py-3 font-mono text-[12.5px] leading-relaxed"
      >
        {lines.map((l, i) => (
          <div key={i} className="whitespace-pre-wrap">
            {l.kind === "in" && (
              <span><span className="text-accent">➜</span> <span className="text-muted-foreground">rauell</span> {l.text}</span>
            )}
            {l.kind === "out" && <span className="text-foreground/85">{l.text}</span>}
            {l.kind === "sys" && <span className="text-muted-foreground">{l.text}</span>}
          </div>
        ))}
        <form
          onSubmit={(e) => { e.preventDefault(); run(input); setInput(""); }}
          className="mt-1 flex items-center gap-2"
        >
          <span className="text-accent">➜</span>
          <span className="text-muted-foreground">rauell</span>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            autoComplete="off"
            className="flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground/60"
            placeholder="type a command…"
          />
          <span className="inline-block h-4 w-1.5 animate-blink bg-accent" />
        </form>
      </div>
    </div>
  );
}
