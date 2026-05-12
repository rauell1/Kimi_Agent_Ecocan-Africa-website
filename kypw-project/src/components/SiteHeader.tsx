"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/events", label: "Events" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

interface SiteHeaderProps {
  currentRoute: string;
  user: { id: string; email: string; name: string | null; role: string } | null;
  onNavigate: (route: string) => void;
}

export function SiteHeader({ currentRoute, user, onNavigate }: SiteHeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="glass border-b border-white/8 dark:border-white/5">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <button onClick={() => onNavigate("/")} className="group flex items-center gap-3 focus:outline-none">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden shadow-soft transition-all duration-500 group-hover:shadow-glow group-hover:scale-105">
              <Image src="/logo-tp.png" alt="KYPW Logo" width={40} height={40} className="h-10 w-10 object-contain" />
            </div>
            <div className="leading-tight">
              <div className="font-display text-[15px] font-semibold text-foreground tracking-tight">KYPW</div>
              <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                WYPW &middot; AYPW &middot; Kenya
              </div>
            </div>
          </button>

          {/* Desktop nav — dot indicator */}
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => {
              const active = currentRoute === item.to;
              return (
                <button
                  key={item.to}
                  onClick={() => onNavigate(item.to)}
                  className="relative px-5 py-2.5 text-sm font-medium transition-all duration-300 focus:outline-none"
                >
                  <span className={active ? "text-foreground" : "text-muted-foreground hover:text-foreground/80"}>
                    {item.label}
                  </span>
                  {/* Simple dot indicator instead of gradient bar */}
                  {active && (
                    <motion.span
                      layoutId="nav-dot"
                      className="absolute bottom-0.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#4E8EA2] via-[#7BBDE8] to-[#0A4174]"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            {user ? (
              <Button size="sm" className="rounded-full px-6 font-medium transition-all duration-300 hover:shadow-lg" onClick={() => onNavigate("/dashboard")}>
                Dashboard
              </Button>
            ) : (
              <Button size="sm" variant="outline" className="rounded-full border-border/50 px-6 font-medium hover:bg-secondary hover:border-primary/20 transition-all duration-300" onClick={() => onNavigate("/auth")}>
                Sign in
              </Button>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button className="relative z-50 flex h-11 w-11 items-center justify-center rounded-xl md:hidden hover:bg-secondary/50 transition-colors duration-300" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            <AnimatePresence mode="wait" initial={false}>
              {open ? (
                <motion.div key="close" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }} transition={{ duration: 0.2 }}>
                  <X className="h-5 w-5" />
                </motion.div>
              ) : (
                <motion.div key="menu" initial={{ opacity: 0, rotate: 90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: -90 }} transition={{ duration: 0.2 }}>
                  <Menu className="h-5 w-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-x-0 top-18 z-40 overflow-hidden border-b border-border/60 bg-background/95 backdrop-blur-xl md:hidden"
          >
            <nav className="mx-auto flex max-w-7xl flex-col px-4 py-5">
              {NAV.map((item, i) => {
                const active = currentRoute === item.to;
                return (
                  <motion.button key={item.to} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06, duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => { onNavigate(item.to); setOpen(false); }}
                    className={`flex items-center rounded-xl px-5 py-3.5 text-left text-sm font-medium transition-colors duration-300 ${active ? "bg-primary/10 text-primary" : "text-foreground/70 hover:bg-secondary/50 hover:text-foreground"}`}>
                    {item.label}
                    {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
                  </motion.button>
                );
              })}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-4 border-t border-border/60 pt-4">
                <Button className="w-full rounded-xl h-12 font-medium" onClick={() => { onNavigate(user ? "/dashboard" : "/auth"); setOpen(false); }}>
                  {user ? "Dashboard" : "Sign in"}
                </Button>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
