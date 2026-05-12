"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import {
  Headphones,
  Calendar,
  ChevronDown,
} from "lucide-react";
import { SOCIAL_LINKS } from "@/lib/site-data";

export function HeroSection() {
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <section id="hero" className="relative h-screen w-full overflow-hidden">
      {/* Background image with parallax */}
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110"
          style={{ backgroundImage: "url('/images/hero-bg.png')" }}
        />
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-transparent to-cyan-900/20" />
        {/* Strobe light effect */}
        <div className="absolute inset-0 bg-white strobe-overlay" />
        {/* Club light sweep */}
        <div className="absolute inset-0 light-sweep overflow-hidden" />
        {/* Animated noise */}
        <div className="noise-overlay absolute inset-0" />
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4"
      >
        {/* Equalizer animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex items-end gap-1 h-10">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className={`w-1.5 rounded-full ${i % 2 === 0 ? "bg-purple-500" : "bg-cyan-400"} eq-bar-${(i % 5) + 1}`}
              />
            ))}
          </div>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-xs sm:text-sm font-bold tracking-[0.15em] sm:tracking-[0.3em] text-kenya-red uppercase mb-3"
        >
          Nairobi&apos;s Hottest DJ
        </motion.p>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-4xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-4 break-words max-w-full"
        >
          <span className="gradient-text">DJ KIMCHI</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-xs sm:text-lg md:text-2xl text-foreground/70 font-light tracking-wider sm:tracking-widest uppercase mb-2 break-words max-w-full"
        >
          Afrobeats | Amapiano | Gengetone | Club Bangers
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="text-xs sm:text-base text-kenya-green/70 font-medium tracking-wider mb-10 break-words max-w-full"
        >
          The East African Sound | Straight Out of Nairobi
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <a
            href="#music"
            className="group flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 bg-gradient-to-r from-kenya-red to-purple-600 text-white font-bold rounded-full btn-glow-red"
          >
            <Headphones className="w-5 h-5 group-hover:animate-pulse" />
            Listen Now
          </a>
          <a
            href="#bookings"
            className="group flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 border-2 border-kenya-green/40 text-kenya-green font-bold rounded-full hover:bg-kenya-green/10 hover:border-kenya-green/70 btn-glow-green"
          >
            <Calendar className="w-5 h-5" />
            Book DJ Kimchi
          </a>
        </motion.div>

        {/* Social row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="flex items-center gap-4 mt-10"
        >
          {SOCIAL_LINKS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-foreground/40 hover:text-foreground transition-all duration-300 social-icon ${s.color}`}
              aria-label={s.label}
            >
              <s.icon className="w-5 h-5" />
            </a>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 animate-scroll-bounce z-10">
        <a
          href="#about"
          className="flex flex-col items-center gap-2 text-foreground/40 hover:text-foreground/70 transition-colors"
        >
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <ChevronDown className="w-5 h-5" />
        </a>
      </div>
    </section>
  );
}
