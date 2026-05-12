"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import { NAV_LINKS } from "@/lib/site-data";

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted] = useState(() => typeof window !== "undefined");
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const isDark = useMemo(
    () => (resolvedTheme ?? "dark") === "dark",
    [resolvedTheme],
  );

  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "glass shadow-lg shadow-purple-500/5"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <a href="#hero" className="flex items-center gap-2 group">
              <div className="flex items-end gap-0.5 h-6">
                <div className="w-1 bg-purple-500 rounded-full eq-bar-1" />
                <div className="w-1 bg-cyan-400 rounded-full eq-bar-2" />
                <div className="w-1 bg-pink-500 rounded-full eq-bar-3" />
                <div className="w-1 bg-purple-500 rounded-full eq-bar-4" />
                <div className="w-1 bg-cyan-400 rounded-full eq-bar-5" />
              </div>
              <span className="text-xl sm:text-2xl font-black tracking-tighter gradient-text group-hover:opacity-80 transition-opacity">
                DJ KIMCHI
              </span>
            </a>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-300 relative group"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-400 group-hover:w-full transition-all duration-300" />
                </a>
              ))}
              <button
                type="button"
                onClick={toggleTheme}
                className="ml-2 px-3 py-2 flex items-center gap-2 text-sm font-semibold text-foreground rounded-full border border-border/80 bg-background/70 shadow-sm hover:border-purple-400/60 transition-all"
                aria-label="Toggle theme"
              >
                {mounted && isDark ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
                <span className="hidden lg:inline">
                  {mounted ? (isDark ? "Light mode" : "Dark mode") : "Theme"}
                </span>
              </button>
              <a
                href="#bookings"
                className="ml-4 px-5 py-2 bg-gradient-to-r from-kenya-red to-purple-600 text-white text-sm font-bold rounded-full btn-glow-red"
              >
                Book Now
              </a>
            </div>

            {/* Mobile toggle */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full border border-border/60 bg-background/80 text-foreground hover:border-purple-400/60 transition-colors"
                aria-label="Toggle theme"
              >
                {mounted && isDark ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2 text-foreground hover:text-purple-400 transition-colors"
                aria-label="Toggle menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 glass md:hidden"
          >
            <div className="flex flex-col items-center justify-center h-full gap-6 px-4">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-2xl font-bold text-foreground hover:text-purple-500 transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center gap-3 px-6 py-3 rounded-full border border-border/80 bg-background/80 text-foreground font-semibold shadow-sm hover:border-purple-400/60 transition-all"
                aria-label="Toggle theme"
              >
                {mounted && isDark ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
                <span>{mounted ? (isDark ? "Light mode" : "Dark mode") : "Theme"}</span>
              </button>
              <a
                href="#bookings"
                onClick={() => setMobileOpen(false)}
                className="px-8 py-3 bg-gradient-to-r from-kenya-red to-purple-600 text-white font-bold rounded-full btn-glow-red"
              >
                Book DJ Kimchi
              </a>
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-5 right-5 p-2 text-foreground"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
