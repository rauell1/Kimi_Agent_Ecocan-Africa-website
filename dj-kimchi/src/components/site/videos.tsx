"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { Youtube, ExternalLink } from "lucide-react";
import { useInView } from "@/hooks/use-in-view";
import { useAudioStore } from "@/stores/audio-store";
import { FEATURED_VIDEO, MORE_VIDEOS } from "@/lib/site-data";
import { LazyYoutube } from "./lazy-youtube";

export function VideosSection() {
  const { ref, inView } = useInView(0.1);
  const pauseMusic = useAudioStore((s) => s.pause);

  /** Pause any playing audio when a YouTube video starts */
  const handleVideoPlay = useCallback(() => {
    pauseMusic();
  }, [pauseMusic]);

  return (
    <section id="videos" className="relative py-24 sm:py-32">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />

      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-hidden">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-bold tracking-[0.3em] text-amber-400 uppercase mb-4 block">
            Watch
          </span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6">
            Video <span className="gradient-text">Sets</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Recorded sets, Kenyan music affairs &amp; mashups. All straight from the Nairobi decks.
          </p>
          <div className="w-16 h-0.5 bg-gradient-to-r from-amber-400 via-kenya-green to-purple-500 mx-auto rounded-full mt-6" />
        </motion.div>

        {/* Featured video */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mb-8"
        >
          <div className="relative rounded-2xl overflow-hidden border border-white/[0.06] shadow-2xl shadow-purple-500/5 glow-kenya-dual">
            <div className="aspect-video" onClick={handleVideoPlay}>
              <LazyYoutube videoId={FEATURED_VIDEO.id} title={FEATURED_VIDEO.title} />
            </div>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white mt-4 line-clamp-2">
            {FEATURED_VIDEO.title}
          </h3>
        </motion.div>

        {/* More videos grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scroll-smooth sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-4 sm:overflow-visible"
        >
          {MORE_VIDEOS.map((video, i) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
              className="group rounded-xl overflow-hidden border border-white/[0.06] bg-[#0a0a0a] video-card-glow min-w-[260px] max-w-[320px] flex-shrink-0 snap-start sm:min-w-0 sm:max-w-none"
            >
              <div className="relative aspect-video" onClick={handleVideoPlay}>
                <LazyYoutube videoId={video.id} title={video.title} />
              </div>
              <div className="p-3">
                <h4 className="text-sm font-medium text-white/80 line-clamp-1">{video.title}</h4>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* YouTube CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="text-center mt-10"
        >
          <a
            href="https://www.youtube.com/@djkimchi254"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600/10 border border-red-500/20 text-red-400 hover:bg-red-600/20 rounded-full transition-all duration-300 text-sm font-medium"
          >
            <Youtube className="w-4 h-4" />
            Subscribe on YouTube
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
