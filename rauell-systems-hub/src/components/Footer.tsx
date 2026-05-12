import { Link } from "@tanstack/react-router";
import { Github, Mail } from "lucide-react";
import { CONTACT_EMAIL, GITHUB_URL } from "@/lib/projects";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-7xl px-5 py-12 md:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-md bg-foreground text-background font-display text-sm font-bold">R</span>
              <span className="font-display text-lg font-semibold">Rauell</span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Infrastructure across clean energy, mobility, and digital platforms.
            </p>
          </div>

          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Navigate</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link to="/systems" className="hover:text-accent">Systems</Link></li>
              <li><Link to="/projects" className="hover:text-accent">Projects</Link></li>
              <li><Link to="/ai-lab" className="hover:text-accent">AI Lab</Link></li>
              <li><Link to="/about" className="hover:text-accent">About</Link></li>
              <li><Link to="/contact" className="hover:text-accent">Contact</Link></li>
            </ul>
          </div>

          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Contact</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a className="inline-flex items-center gap-2 hover:text-accent" href={`mailto:${CONTACT_EMAIL}`}>
                  <Mail className="h-4 w-4" /> {CONTACT_EMAIL}
                </a>
              </li>
              <li>
                <a className="inline-flex items-center gap-2 hover:text-accent" href={GITHUB_URL} target="_blank" rel="noreferrer">
                  <Github className="h-4 w-4" /> github.com/rauell1
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} Rauell. All systems operational.</p>
          <p className="font-mono">v1.0 · built for systems that matter</p>
        </div>
      </div>
    </footer>
  );
}
