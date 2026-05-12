"use client";

import { useState, useRef, type FormEvent } from "react";
import { motion, useInView } from "framer-motion";
import { Mail, MapPin, Send, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const CONTACT_EMAIL = "kypw.youthforwater@gmail.com";

function SectionReveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 50 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

const contactInfo = [
  { icon: Mail, label: "Email", value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
  { icon: MapPin, label: "Based in", value: "Nairobi, Kenya" },
];

export function ContactPage() {
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = fd.get("name") as string;
    const email = fd.get("email") as string;
    const message = fd.get("message") as string;
    if (!name?.trim() || !email?.trim() || !message?.trim()) { toast.error("All fields are required"); return; }
    if (message.trim().length < 10) { toast.error("Message must be at least 10 characters"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), message: message.trim() }),
      });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || "Failed to send"); }
      toast.success("Thank you for reaching out. We will respond within one working day.");
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send message");
    } finally { setSubmitting(false); }
  }

  return (
    <main className="flex-1">
      <div className="relative">
        {/* ═══════════ Header — Dark section ═══════════ */}
        <section className="relative overflow-hidden section-dark">
          <div className="absolute inset-0" style={{
            background: "radial-gradient(ellipse at 50% 30%, rgba(78,142,162,0.06) 0%, transparent 60%)"
          }} />
          <div className="absolute inset-0 noise-light" />

          <div className="relative mx-auto max-w-7xl px-4 py-28 sm:px-6 sm:py-36">
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}>
              <span className="inline-block rounded-full bg-white/8 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
                Contact
              </span>
              <h1 className="mt-5 font-display text-5xl font-semibold text-white sm:text-6xl lg:text-7xl tracking-tight">
                Every voice strengthens the current.
              </h1>
              <p className="mt-6 max-w-2xl text-xl text-white/55 leading-relaxed font-light text-prose">
                The Kenya Youth Parliament for Water exists because young Kenyans demanded a seat at the table in water governance. Whether you are a potential partner, a journalist covering SDG&nbsp;6, a student looking to join our county coordinator network, or a policymaker seeking youth perspectives, we welcome every conversation that moves us closer to equitable water access for all.
              </p>
            </motion.div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </section>

        {/* ═══════════ Contact content ═══════════ */}
        <section className="mx-auto max-w-7xl px-4 py-28 sm:px-6">
          <div className="grid gap-20 lg:grid-cols-2">
            {/* Left column — Contact info */}
            <div>
              <SectionReveal>
                <h2 className="font-display text-3xl font-semibold tracking-tight">
                  Connect with our team
                </h2>
                <p className="mt-3 max-w-md text-muted-foreground leading-relaxed text-prose">
                  As a youth-led organisation operating across all 47 counties, every enquiry receives personal attention from our coordinating team. We are here to help you explore partnerships, join our network, or simply learn more about how young Kenyans are shaping the future of water governance.
                </p>
              </SectionReveal>

              <div className="mt-12 space-y-3">
                {contactInfo.map((item, i) => (
                  <SectionReveal key={item.label} delay={0.1 + i * 0.1}>
                    <div className="group flex items-start gap-5 rounded-2xl p-5 transition-all duration-500 hover:bg-secondary/30 hover-glow">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary transition-transform duration-500 group-hover:scale-105">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div className="pt-0.5">
                        <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">{item.label}</div>
                        {"href" in item ? (
                          <a href={item.href} className="mt-2 inline-flex items-center gap-1.5 text-lg font-medium hover:text-primary transition-colors duration-300">
                            {item.value}
                            <ArrowUpRight className="h-3.5 w-3.5 opacity-0 -translate-y-0.5 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0" />
                          </a>
                        ) : (
                          <>
                            <div className="mt-2 text-lg font-medium">{item.value}</div>
                            {"subValue" in item && (
                              <div className="mt-1 text-lg font-medium text-muted-foreground">{item.subValue}</div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </SectionReveal>
                ))}
              </div>
            </div>

            {/* Right column — Form */}
            <SectionReveal delay={0.2}>
              <div className="border-gradient border-gradient-active rounded-3xl border border-border/50 bg-card p-8 shadow-dramatic sm:p-10 lg:p-12">
                <h2 className="font-display text-2xl font-semibold tracking-tight">Write to us</h2>
                <p className="mt-2 text-muted-foreground text-prose">We read every message and aim to respond within one working day. Your input helps strengthen youth participation in water decision-making.</p>
                <form onSubmit={handleSubmit} className="mt-10 space-y-6">
                  <div>
                    <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Full name</Label>
                    <Input id="name" name="name" required maxLength={100} className="mt-3 h-12 rounded-xl bg-secondary/15 border-border/40 text-base" placeholder="John Doe" />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Email address</Label>
                    <Input id="email" name="email" type="email" required maxLength={255} className="mt-3 h-12 rounded-xl bg-secondary/15 border-border/40 text-base" placeholder="john@example.com" />
                  </div>
                  <div>
                    <Label htmlFor="message" className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Your message</Label>
                    <Textarea id="message" name="message" required rows={6} maxLength={1000} className="mt-3 rounded-xl bg-secondary/15 border-border/40 resize-none text-base leading-relaxed" placeholder="Tell us about your project, question, or idea…" />
                  </div>
                  <Button type="submit" disabled={submitting} className="w-full h-13 rounded-xl font-semibold shadow-lg transition-all duration-500 hover:shadow-xl text-base" size="lg">
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                        Sending…
                      </span>
                    ) : (
                      <>Send your message <Send className="ml-2 h-4 w-4" /></>
                    )}
                  </Button>
                </form>
              </div>
            </SectionReveal>
          </div>
        </section>
      </div>
    </main>
  );
}
