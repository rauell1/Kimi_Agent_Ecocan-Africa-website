"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  Music,
  Play,
  Headphones,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import { useInView } from "@/hooks/use-in-view";
import { useAudioStore, type AudioTrack } from "@/stores/audio-store";
import { MIXES, HEARTHIS_TRACKS } from "@/lib/site-data";

/* ------------------------------------------------------------------ */
/*  Convert site-data mixes into AudioTrack format                      */
/* ------------------------------------------------------------------ */

function toAudioTrack(
  mix: (typeof MIXES)[number],
  source: "mixcloud" | "hearthis",
): AudioTrack {
  const embedBase =
    source === "mixcloud"
      ? `https://www.mixcloud.com/widget/iframe/?hide_cover=1&mini=1&light=0&feed=${encodeURIComponent(mix.mixcloudUrl)}`
      : (mix as unknown as { embedUrl: string }).embedUrl;
  return {
    id: `${source}-${mix.id}`,
    title: mix.title,
    subtitle: mix.subtitle,
    artist: "DJ Kimchi",
    cover: mix.cover,
    pageUrl:
      source === "mixcloud"
        ? mix.mixcloudUrl
        : (mix as unknown as { hearthisUrl: string }).hearthisUrl,
    embedUrl: embedBase,
    audioUrl: source === "mixcloud" ? null : ((mix as unknown as { audioUrl?: string }).audioUrl ?? null),
    source,
    genre: mix.genre,
    duration: mix.duration,
  };
}

function hearthisToAudioTrack(ht: (typeof HEARTHIS_TRACKS)[number]): AudioTrack {
  return {
    id: `hearthis-${ht.id}`,
    title: ht.title,
    subtitle: ht.subtitle,
    artist: "DJ Kimchi",
    cover: ht.cover,
    pageUrl: ht.hearthisUrl,
    embedUrl: ht.embedUrl,
    audioUrl: ht.audioUrl,
    source: "hearthis",
    genre: ht.genre,
    duration: ht.duration,
  };
}

function ScrollHint() {
  return (
    <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background via-background/70 to-transparent flex items-center justify-end pr-3 sm:hidden">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/70">
        <span className="sr-only">Scroll for more tracks</span>
        <motion.span
          aria-hidden
          animate={{ x: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-foreground/10 backdrop-blur-sm"
        >
          <ArrowRight className="h-4 w-4" />
        </motion.span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

export function MusicSection() {
  const { ref, inView } = useInView(0.1);
  const { currentTrack, isPlaying, play, initQueue } = useAudioStore();

  /* Build the full queue from both sources & initialise store */
  useEffect(() => {
    const mixcloudTracks = MIXES.map((m) => toAudioTrack(m, "mixcloud"));
    const hearthisTracks = HEARTHIS_TRACKS.map(hearthisToAudioTrack);
    initQueue([...mixcloudTracks, ...hearthisTracks]);
  }, [initQueue]);

  return (
    <section id="music" className="relative py-24 sm:py-32">
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
          <span className="text-sm font-bold tracking-[0.3em] text-cyan-400 uppercase mb-4 block">
            The Sound
          </span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6">
            Latest <span className="gradient-text">Mixes</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Press play. Feel the Nairobi heat. DJ Kimchi&apos;s hottest mixes. Always fresh, always fire.
          </p>
          <div className="w-16 h-0.5 bg-gradient-to-r from-cyan-400 via-kenya-green to-purple-500 mx-auto rounded-full mt-6" />
        </motion.div>

        {/* ---- Mixcloud cards ---- */}
        <div className="relative">
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 pr-10 snap-x snap-mandatory scroll-smooth sm:mx-0 sm:px-0 sm:pr-0 sm:grid sm:grid-cols-2 md:grid-cols-3 sm:gap-6 lg:gap-8 sm:overflow-visible">
            {MIXES.map((mix, i) => {
              const track = toAudioTrack(mix, "mixcloud");
              const isActive = currentTrack?.id === track.id && isPlaying;

              return (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.2 + i * 0.15 }}
                  className={`group relative rounded-2xl overflow-hidden bg-[#0a0a0a] border transition-all duration-500 mix-card-hover w-[82vw] flex-shrink-0 snap-center sm:w-auto sm:max-w-none sm:snap-start ${isActive ? "border-purple-500/60 shadow-[0_0_24px_rgba(168,85,247,0.15)]" : "border-white/[0.06] hover:border-kenya-red/40"}`}
                >
                  {/* Cover art */}
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={mix.cover}
                      alt={mix.title}
                      className="w-full h-full object-cover transition-transform duration-700 mix-cover-img"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />

                    {/* Active indicator glow */}
                    {isActive && (
                      <div className="absolute inset-0 bg-purple-500/10 flex items-center justify-center">
                        <div className="flex items-end gap-0.5 h-8">
                          <div className="w-1 bg-white rounded-full eq-bar-1" />
                          <div className="w-1 bg-white rounded-full eq-bar-2" />
                          <div className="w-1 bg-white rounded-full eq-bar-3" />
                          <div className="w-1 bg-white rounded-full eq-bar-4" />
                          <div className="w-1 bg-white rounded-full eq-bar-5" />
                        </div>
                      </div>
                    )}

                    {/* Play button */}
                    <button
                      onClick={() => play(track)}
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                      aria-label={`Play ${mix.title}`}
                    >
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-300 mix-play-btn ${isActive ? "bg-purple-500/90 pulse-glow" : "bg-purple-600/90 shadow-purple-500/30"}`}>
                        {isActive ? (
                          <Music className="w-6 h-6 text-white animate-spin-slow" style={{ animationDuration: "3s" }} />
                        ) : (
                          <Play className="w-6 h-6 text-white ml-1" />
                        )}
                      </div>
                    </button>

                    {/* Genre badge */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-1 text-[10px] font-bold tracking-wider uppercase bg-black/60 backdrop-blur-sm text-cyan-400 rounded-full border border-cyan-400/20">
                        {mix.genre}
                      </span>
                    </div>

                    {/* Duration */}
                    <div className="absolute bottom-3 right-3">
                      <span className="px-2 py-1 text-xs font-medium bg-black/60 backdrop-blur-sm text-white/70 rounded-full">
                        <Music className="w-3 h-3 inline mr-1" />
                        {mix.duration}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <h3 className={`text-lg font-bold break-words mb-1 transition-colors ${isActive ? "text-purple-300" : "text-white group-hover:text-purple-300"}`}>
                      {mix.title}
                    </h3>
                    <p className="text-xs font-semibold text-kenya-green/70 uppercase tracking-wider mb-2">{mix.subtitle}</p>
                    <p className="text-sm text-muted-foreground mb-3">{mix.description}</p>
                    <a
                      href={mix.mixcloudUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors group/link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Listen on Mixcloud
                      <ExternalLink className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </div>
          <ScrollHint />
        </div>

        {/* CTA to Mixcloud */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-12"
        >
          <a
            href="https://www.mixcloud.com/djkimchii254/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 border border-white/10 text-white/70 hover:text-white hover:border-purple-500/30 rounded-full transition-all duration-300 text-sm font-medium"
          >
            <Headphones className="w-4 h-4" />
            View All Mixes on Mixcloud
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </motion.div>

        {/* --- HearThis.at Section --- */}
        <div className="mt-20">
          <div className="h-px bg-gradient-to-r from-transparent via-kenya-green/30 to-transparent mb-12" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="text-center mb-12"
          >
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight mb-3">
              More on <span className="gradient-text">HearThis.at</span>
            </h3>
            <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
              Even more mixes and vibes. Stream directly from HearThis.
            </p>
          </motion.div>

          {/* HearThis cards */}
          <div className="relative">
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 pr-10 snap-x snap-mandatory scroll-smooth sm:mx-0 sm:px-0 sm:pr-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 lg:gap-8 sm:overflow-visible">
              {HEARTHIS_TRACKS.map((ht, i) => {
                const track = hearthisToAudioTrack(ht);
                const isActive = currentTrack?.id === track.id && isPlaying;

                return (
                  <motion.div
                    key={track.id}
                    initial={{ opacity: 0, y: 40 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 1.0 + i * 0.1 }}
                    className={`group relative rounded-2xl overflow-hidden bg-[#0a0a0a] border transition-all duration-500 mix-card-hover w-[82vw] flex-shrink-0 snap-center sm:w-auto sm:max-w-none sm:snap-start ${isActive ? "border-kenya-green/60 shadow-[0_0_24px_rgba(39,174,96,0.15)]" : "border-white/[0.06] hover:border-kenya-green/40"}`}
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={ht.cover}
                        alt={ht.title}
                        className="w-full h-full object-cover transition-transform duration-700 mix-cover-img"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />

                      {isActive && (
                        <div className="absolute inset-0 bg-kenya-green/10 flex items-center justify-center">
                          <div className="flex items-end gap-0.5 h-8">
                            <div className="w-1 bg-white rounded-full eq-bar-1" />
                            <div className="w-1 bg-white rounded-full eq-bar-2" />
                            <div className="w-1 bg-white rounded-full eq-bar-3" />
                            <div className="w-1 bg-white rounded-full eq-bar-4" />
                            <div className="w-1 bg-white rounded-full eq-bar-5" />
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => play(track)}
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                        aria-label={`Play ${ht.title}`}
                      >
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-300 mix-play-btn ${isActive ? "bg-kenya-green/90 pulse-glow" : "bg-kenya-green/90 shadow-kenya-green/30"}`}>
                          {isActive ? (
                            <Music className="w-6 h-6 text-white animate-spin-slow" style={{ animationDuration: "3s" }} />
                          ) : (
                            <Play className="w-6 h-6 text-white ml-1" />
                          )}
                        </div>
                      </button>

                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 text-[10px] font-bold tracking-wider uppercase bg-black/60 backdrop-blur-sm text-kenya-green rounded-full border border-kenya-green/20">
                          {ht.genre}
                        </span>
                      </div>

                      <div className="absolute bottom-3 right-3">
                        <span className="px-2 py-1 text-xs font-medium bg-black/60 backdrop-blur-sm text-white/70 rounded-full">
                          <Music className="w-3 h-3 inline mr-1" />
                          {ht.duration}
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      <h3 className={`text-lg font-bold break-words mb-1 transition-colors ${isActive ? "text-kenya-green" : "text-white group-hover:text-kenya-green"}`}>
                        {ht.title}
                      </h3>
                      <p className="text-xs font-semibold text-kenya-green/70 uppercase tracking-wider mb-2">{ht.subtitle}</p>
                      <p className="text-sm text-muted-foreground mb-3">{ht.description}</p>
                      <a
                        href={ht.hearthisUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-kenya-green hover:text-kenya-green/80 transition-colors group/link"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Listen on HearThis.at
                        <ExternalLink className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
                      </a>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <ScrollHint />
          </div>

          {/* CTA to HearThis */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 1.6 }}
            className="text-center mt-12"
          >
            <a
              href="https://hearthis.at/djkimchii254-ja/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 border border-white/10 text-white/70 hover:text-white hover:border-kenya-green/30 rounded-full transition-all duration-300 text-sm font-medium"
            >
              <Headphones className="w-4 h-4" />
              View All Tracks on HearThis.at
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
