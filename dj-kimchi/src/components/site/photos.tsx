"use client";

import { motion } from "framer-motion";
import { Camera } from "lucide-react";
import { useInView } from "@/hooks/use-in-view";
import { PHOTOS } from "@/lib/site-data";
import { ProtectedImage } from "@/components/ui/protected-image";

export function PhotosSection() {
  const { ref, inView } = useInView(0.1);

  return (
    <section id="photos" className="relative py-24 sm:py-32">
      {/* Background accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-hidden">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-bold tracking-[0.3em] text-purple-400 uppercase mb-4 block">
            The Vibe
          </span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6">
            <span className="gradient-text">Photos</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Moments captured live. From the decks to the crowd.
          </p>
          <div className="w-16 h-0.5 bg-gradient-to-r from-purple-500 via-cyan-400 to-kenya-green mx-auto rounded-full mt-6" />
        </motion.div>

        {/* Photos grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {PHOTOS.map((photo, i) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.15 }}
              className="group rounded-2xl overflow-hidden bg-[#0a0a0a] border border-white/[0.06] hover:border-purple-500/30 transition-all duration-500 card-hover"
            >
              {/* Image (protected — not downloadable) */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <ProtectedImage
                  src={photo.src}
                  alt={photo.alt}
                  className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {/* Camera icon overlay */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center border border-white/10">
                    <Camera className="w-4 h-4 text-purple-400" />
                  </div>
                </div>
              </div>

              {/* Caption */}
              <div className="p-4">
                <p className="text-sm font-semibold text-white/80 group-hover:text-purple-300 transition-colors text-center">
                  {photo.caption}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
