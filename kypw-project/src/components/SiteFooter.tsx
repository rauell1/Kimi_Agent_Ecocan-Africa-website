"use client";

import { useState } from "react";
import Image from "next/image";
import { Mail, Loader2, ArrowUpRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const CONTACT_EMAIL = "kypw.youthforwater@gmail.com";

interface SiteFooterProps {
  onNavigate: (route: string) => void;
}

interface FooterLink {
  label: string;
  to: string;
  external?: boolean;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

export function SiteFooter({ onNavigate }: SiteFooterProps) {
  const [subEmail, setSubEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!subEmail.includes("@")) { toast.error("Please enter a valid email"); return; }
    setSubscribing(true);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: subEmail.trim() }),
      });
      const data = await res.json();
      if (data.success) { toast.success(data.message); setSubEmail(""); }
      else { toast.error(data.error || "Failed to subscribe"); }
    } catch { toast.error("Something went wrong"); }
    finally { setSubscribing(false); }
  }

  const footerLinks: FooterSection[] = [
    {
      title: "Explore",
      links: [
        { label: "Events", to: "/events" },
        { label: "About", to: "/about" },
        { label: "Contact", to: "/contact" },
        { label: "News", to: "/news" },
      ],
    },
    {
      title: "Connect",
      links: [
        { label: "WYPW", to: "https://youthforwater.org", external: true },
        { label: "AYPW", to: "https://aypw.org", external: true },
        { label: "SDG 6", to: "https://sdgs.un.org/goals/goal6", external: true },
        { label: "Dashboard", to: "/auth" },
      ],
    },
  ];

  return (
    <footer className="relative mt-auto">
      {/* ═══════════ Newsletter CTA Section ═══════════ */}
      <section className="relative overflow-hidden section-dark">
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse at 30% 50%, rgba(78,142,162,0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 60%, rgba(73,118,159,0.06) 0%, transparent 50%)"
        }} />
        <div className="absolute inset-0 noise-light" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="grid gap-10 md:grid-cols-2 md:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#7BBDE8]/15 bg-[#7BBDE8]/6 px-3.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#BDD8E9]">
                <Mail className="h-3 w-3" />
                Newsletter
              </div>
              <h2 className="mt-5 font-display text-3xl font-semibold text-white sm:text-4xl tracking-tight">
                Never miss a drop.
              </h2>
              <p className="mt-4 text-white/50 leading-relaxed text-prose max-w-lg">
                From high-level policy dialogues and international summits to grassroots training sessions in your county, get the stories and opportunities that matter, delivered straight to your inbox.
              </p>
            </div>
            <div>
              <form onSubmit={handleSubscribe} className="flex gap-3">
                <Input type="email" placeholder="your@email.com" value={subEmail} onChange={(e) => setSubEmail(e.target.value)} required
                  className="h-12 flex-1 rounded-2xl border-white/10 bg-white/5 pl-5 text-white placeholder:text-white/25 focus-visible:ring-[#7BBDE8]/25 focus-visible:border-[#7BBDE8]/25 backdrop-blur-sm" />
                <Button type="submit" size="lg" disabled={subscribing}
                  className="h-12 shrink-0 rounded-2xl bg-[#7BBDE8] px-6 text-[#0A4174] hover:bg-[#9CC8E0] font-bold shadow-lg shadow-[#4E8EA2]/20 transition-all duration-500 hover:shadow-[#4E8EA2]/30">
                  {subscribing ? <Loader2 className="h-5 w-5 animate-spin" /> : "Subscribe"}
                </Button>
              </form>
              <p className="mt-3 text-[11px] text-white/25">No spam. Unsubscribe anytime.</p>
            </div>
          </div>
        </div>

        {/* Gradient divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
      </section>

      {/* ═══════════ Main Footer ═══════════ */}
      <div className="section-dark relative overflow-hidden">
        <div className="absolute inset-0 noise-light" />

        <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-8 sm:px-6">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            {/* Brand column */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden border border-white/10">
                  <Image src="/logo-tp.png" alt="KYPW Logo" width={40} height={40} className="h-10 w-10 object-contain" />
                </div>
                <div className="font-display text-lg font-semibold text-white tracking-tight">Kenya Youth Parliament for Water</div>
              </div>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-white/40 text-prose">
                KYPW is the Kenyan national chapter of the World Youth Parliament for Water (WYPW) and the African Youth Parliament for Water (AYPW). We are a youth-led civic platform committed to SDG&nbsp;6, coordinating community action, documenting field impact, and amplifying Kenyan youth voices in national and global water governance.
              </p>

              <a href={`mailto:${CONTACT_EMAIL}`} className="mt-5 inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors duration-300">
                <Mail className="h-4 w-4" />{CONTACT_EMAIL}
              </a>
            </div>

            {/* Link columns */}
            {footerLinks.map((section) => (
              <div key={section.title}>
                <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/30">{section.title}</h4>
                <ul className="mt-5 space-y-3.5">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      {link.external ? (
                        <a
                          href={link.to}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors duration-300"
                        >
                          {link.label}
                          <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-0.5 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0" />
                        </a>
                      ) : (
                        <button onClick={() => onNavigate(link.to)} className="group inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors duration-300">
                          {link.label}
                          <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-0.5 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0" />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/6 pt-7 text-xs text-white/25 sm:flex-row">
            <span className="text-center sm:text-left text-prose leading-relaxed">
              &copy; {new Date().getFullYear()} Kenya Youth Parliament for Water (KYPW). A national chapter of the World Youth Parliament for Water (WYPW) under the African Youth Parliament for Water (AYPW).
            </span>
            <span className="flex items-center gap-3">
              <a
                href="https://youthforwater.org"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/6 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/30 hover:text-white/60 hover:border-white/15 transition-all duration-300"
              >
                WYPW
                <ArrowUpRight className="h-2.5 w-2.5 opacity-60" />
              </a>
              <a
                href="https://aypw.org"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/6 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/30 hover:text-white/60 hover:border-white/15 transition-all duration-300"
              >
                AYPW
                <ArrowUpRight className="h-2.5 w-2.5 opacity-60" />
              </a>
              <a
                href="https://sdgs.un.org/goals/goal6"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/6 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/30 hover:text-white/60 hover:border-white/15 transition-all duration-300"
              >
                SDG 6
                <ArrowUpRight className="h-2.5 w-2.5 opacity-60" />
              </a>
              <span className="text-white/15">#WaterGeneration</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
