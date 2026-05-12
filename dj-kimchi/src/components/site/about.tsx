"use client";

import { motion } from "framer-motion";
import { Zap, Star, Volume2 } from "lucide-react";
import { useInView } from "@/hooks/use-in-view";
import { STATS } from "@/lib/site-data";

const GENRE_TAGS = [
  "Afrobeats",
  "Amapiano",
  "Gengetone",
  "Dancehall",
  "Arbantone",
  "Club Bangers",
  "Radio DJ",
] as const;

const FEATURES = [
  { icon: Zap, text: "High-energy Nairobi performances that ignite every crowd", color: "text-purple-400" },
  { icon: Star, text: "Featured on VCUT Radio with a dedicated live show", color: "text-amber-400" },
  { icon: Volume2, text: "Versatile open-format mixing across all African genres", color: "text-kenya-green" },
] as const;

function getTagColor(index: number): string {
  if (index === 2 || index === 4) return "border border-kenya-green/30 text-kenya-green";
  if (index === 0) return "border border-kenya-red/30 text-kenya-red";
  return "border border-purple-500/30 text-purple-300";
}

export function AboutSection() {
  const { ref, inView } = useInView(0.2);

  return (
    <section id="about" className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: "url('/images/about-bg.png')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-bold tracking-[0.3em] text-purple-400 uppercase mb-4 block">
            The Artist
          </span>
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-kenya-red" />
            <span className="w-2 h-2 rounded-full bg-kenya-green" />
            <span className="text-xs font-semibold tracking-[0.2em] text-foreground/50 uppercase">Kenyan DJ</span>
            <span className="w-2 h-2 rounded-full bg-kenya-red" />
            <span className="w-2 h-2 rounded-full bg-kenya-green" />
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-2">
            About <span className="gradient-text">DJ Kimchi</span>
          </h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-kenya-green via-purple-500 to-kenya-red mx-auto rounded-full mt-4 mb-4" />
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="space-y-5 text-foreground/80 text-base sm:text-lg leading-relaxed break-words text-justify">
              <p>
                <span className="text-foreground font-bold text-xl">DJ Kimchi</span> is the{" "}
                <span className="text-purple-400 font-semibold">baddest DJ from East &amp; Central Africa</span>. Media DJ, radio host, club resident, setting dancefloors ablaze across Nairobi.
              </p>
              <p>
                Fusing{" "}
                <span className="text-cyan-400 font-medium">Afrobeats</span>,{" "}
                <span className="text-pink-400 font-medium">Amapiano</span>,{" "}
                <span className="text-amber-400 font-medium">Gengetone</span>,{" "}
                <span className="text-amber-400 font-medium">Dancehall</span> &amp;{" "}
                <span className="text-purple-400 font-medium">open-format bangers</span>{" "}
                into an electrifying experience. Every Nairobi crowd stays on their feet.
              </p>
              <p>
                Hosts the weekly{" "}
                <span className="text-foreground font-semibold">&quot;VCUT Radio Mix: DJ Kimchi Live&quot;</span>{" "}
                podcast. Performs at Nairobi&apos;s top clubs &amp; private events across Kenya. Every set is a masterclass in energy.
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-8">
              {GENRE_TAGS.map((tag, ti) => (
                <span
                  key={tag}
                  className={`px-3 py-1 text-xs font-bold tracking-wider uppercase rounded-full tag-hover ${getTagColor(ti)}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <div className="grid grid-cols-2 gap-4">
              {STATS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                  className={`p-6 rounded-2xl bg-gradient-to-br from-foreground/5 to-background/60 border border-border transition-all duration-500 group ${i % 2 === 0 ? "glow-kenya-red ambient-red" : "glow-kenya-green ambient-green"}`}
                >
                  <div className={`text-3xl sm:text-4xl font-black mb-1 ${i % 2 === 0 ? "gradient-text" : "gradient-text-gold"}`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium tracking-wide">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Feature badges */}
            <div className="mt-6 space-y-3">
              {FEATURES.map((feat) => {
                const IconComp = feat.icon;
                return (
                  <div
                    key={feat.text}
                    className="flex items-start gap-3 text-foreground/60 text-sm"
                  >
                    <IconComp className={`w-4 h-4 mt-0.5 flex-shrink-0 ${feat.color}`} />
                    <span>{feat.text}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
