"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  X,
  Repeat,
  Repeat1,
  Shuffle,
  ExternalLink,
  Volume2,
  VolumeX,
  Loader2,
} from "lucide-react";
import { useAudioStore } from "@/stores/audio-store";

/* ------------------------------------------------------------------ */
/*  HELPERS                                                            */
/* ------------------------------------------------------------------ */

function formatTime(sec: number): string {
  if (!sec || !isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * For tracks with direct audio URLs (e.g. HearThis), return the URL.
 */
async function resolveStreamUrl(track: {
  audioUrl: string | null;
}): Promise<string> {
  if (track.audioUrl) return track.audioUrl;
  throw new Error("No direct audio URL for this source");
}

function getMixcloudWidgetUrl(pageUrl: string): string {
  return `https://www.mixcloud.com/widget/iframe/?hide_cover=1&mini=1&light=0&autoplay=1&feed=${encodeURIComponent(pageUrl)}`;
}

/* ------------------------------------------------------------------ */
/*  PLAYER BAR — control bar with real <audio> element                  */
/* ------------------------------------------------------------------ */

function PlayerBar() {
  const currentTrack = useAudioStore((s) => s.currentTrack);
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const next = useAudioStore((s) => s.next);
  const previous = useAudioStore((s) => s.previous);
  const stop = useAudioStore((s) => s.stop);
  const repeatMode = useAudioStore((s) => s.repeatMode);
  const shuffleMode = useAudioStore((s) => s.shuffleMode);
  const resolvedAudioUrl = useAudioStore((s) => s.resolvedAudioUrl);
  const isResolving = useAudioStore((s) => s.isResolving);
  const setResolvedAudioUrl = useAudioStore((s) => s.setResolvedAudioUrl);
  const setIsResolving = useAudioStore((s) => s.setIsResolving);

  /* ---- Real audio element ---- */
  const audioRef = useRef<HTMLAudioElement | null>(null);

  /* Playback state from the real audio element */
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  /* ---- Create a single persistent audio element ---- */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const audio = new Audio();
    audio.preload = "auto";
    /*
     * Do NOT set crossOrigin — HearThis.at & Mixcloud streams
     * are either CORS-enabled or don't require CORS for playback.
     * Setting crossOrigin would block non-CORS sources.
     */
    audio.volume = volume;
    audioRef.current = audio;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration || 0);
    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setIsLoading(false);
    };
    const onCanPlay = () => setIsLoading(false);
    const onWaiting = () => setIsLoading(true);
    const onPlaying = () => {
      setIsLoading(false);
      setAudioError(null);
      setAudioPlaying(true);
    };
    const onPause = () => setAudioPlaying(false);
    const onError = () => {
      setIsLoading(false);
      setAudioPlaying(false);
      const mediaErr = audio.error;
      let msg = "Failed to load audio";
      if (mediaErr) {
        switch (mediaErr.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            msg = "Playback aborted";
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            msg = "Network error while loading audio";
            break;
          case MediaError.MEDIA_ERR_DECODE:
            msg = "Audio decoding failed";
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            msg = "Audio format not supported or URL blocked";
            break;
          default:
            msg = mediaErr.message || msg;
        }
      }
      setAudioError(msg);
      console.error("[AudioPlayer] Error:", msg, mediaErr);
    };
    const onEnded = () => {
      setAudioPlaying(false);
      const s = useAudioStore.getState();
      if (s.repeatMode === "one") {
        audio.currentTime = 0;
        audio.play().catch(() => { /* ignore */ });
      } else {
        s.next();
      }
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("error", onError);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("ended", onEnded);
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, []);

  /* ---- Sync volume from state ---- */
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  /* ---- React to track changes: resolve URL & play ---- */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    let cancelled = false;

    async function loadAndPlay() {
      if (currentTrack.source === "mixcloud") {
        audio.pause();
        audio.src = "";
        setCurrentTime(0);
        setDuration(0);
        setAudioError(null);
        setAudioPlaying(false);
        setIsLoading(false);
        setResolvedAudioUrl(null);
        setIsResolving(false);
        return;
      }

      // Reset state
      audio.pause();
      audio.src = "";
      setCurrentTime(0);
      setDuration(0);
      setAudioError(null);
      setAudioPlaying(false);
      setIsLoading(true);

      try {
        // Resolve the stream URL for direct-audio sources
        const streamUrl = await resolveStreamUrl({ audioUrl: currentTrack.audioUrl });

        if (cancelled) return;

        console.log("[AudioPlayer] Playing:", currentTrack.title);
        console.log("[AudioPlayer] Stream URL:", streamUrl.substring(0, 80) + "...");

        setResolvedAudioUrl(streamUrl);
        audio.src = streamUrl;
        audio.load();

        // This play() call works because we're in a chain that started
        // from the user's click on the music card
        const playPromise = audio.play();
        if (playPromise) {
          await playPromise;
          console.log("[AudioPlayer] Audio is playing!");
        }
      } catch (err: unknown) {
        if (cancelled) return;
        setIsLoading(false);
        const errMsg = err instanceof Error ? err.message : String(err);
        console.warn("[AudioPlayer] Play failed:", errMsg);
        // If autoplay was blocked, user can click the play button
        if (errMsg.includes("NotAllowedError") || errMsg.includes("play()")) {
          setAudioError("Click the play button to start");
        } else {
          setAudioError(errMsg);
        }
      }
    }

    loadAndPlay();

    return () => {
      cancelled = true;
      audio.pause();
    };
  }, [currentTrack, setResolvedAudioUrl]);

  /* ---- Play / Pause toggle ---- */
  const handleTogglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    // If we have a resolved URL but haven't loaded it yet
    if (resolvedAudioUrl && !audio.src) {
      audio.src = resolvedAudioUrl;
      audio.load();
    }

    if (audio.paused) {
      setIsLoading(true);
      try {
        await audio.play();
      } catch (err) {
        console.error("[AudioPlayer] Play failed:", err);
        setIsLoading(false);
      }
    } else {
      audio.pause();
    }
  }, [currentTrack, resolvedAudioUrl]);

  /* ---- Seek on progress bar click ---- */
  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const audio = audioRef.current;
      if (!audio || !duration) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      audio.currentTime = ratio * duration;
    },
    [duration],
  );

  /* ---- Volume control ---- */
  const handleVolumeClick = useCallback(() => {
    setIsMuted((m) => !m);
  }, []);

  if (!currentTrack) return null;

  const RepeatIcon = repeatMode === "one" ? Repeat1 : Repeat;
  const sourceLabel =
    currentTrack.source === "mixcloud"
      ? "Mixcloud"
      : currentTrack.source === "hearthis"
        ? "HearThis.at"
        : "YouTube";

  // The play button should show loading when resolving or buffering
  const showLoading = isResolving || isLoading;
  const actuallyPlaying = audioPlaying && !showLoading;
  const isMixcloudTrack = currentTrack.source === "mixcloud";

  if (isMixcloudTrack) {
    const mixcloudWidgetSrc = getMixcloudWidgetUrl(currentTrack.pageUrl);
    return (
      <>
        <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 h-14 sm:h-16">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
              <img
                src={currentTrack.cover}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate leading-tight">
                {currentTrack.title}
              </p>
              <p className="text-[11px] text-white/50 truncate">
                Mixcloud widget playback
              </p>
            </div>
          </div>

          <a
            href={currentTrack.pageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 flex items-center justify-center rounded-full text-white/40 hover:text-white transition-colors"
            aria-label="Open on Mixcloud"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={stop}
            className="w-8 h-8 flex items-center justify-center rounded-full text-white/30 hover:text-kenya-red transition-colors"
            aria-label="Close player"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-3 pb-2 sm:px-4 sm:pb-3">
          <iframe
            title={`Mixcloud player for ${currentTrack.title}`}
            src={mixcloudWidgetSrc}
            width="100%"
            height="60"
            loading="lazy"
            allow="autoplay; encrypted-media"
            className="w-full rounded-md border border-white/10 bg-black/20"
          />
        </div>
      </>
    );
  }

  return (
    <>
      {/* ── Progress bar ── */}
      <div
        className="relative h-1.5 bg-white/5 cursor-pointer group"
        onClick={handleSeek}
        role="slider"
        aria-label="Seek"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      >
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-kenya-green via-purple-500 to-kenya-red transition-[width] duration-200"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
        {/* Seek thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `calc(${Math.min(progress, 100)}% - 6px)` }}
        />
      </div>

      {/* ── Main control bar ── */}
      <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 h-14 sm:h-16">
        {/* Cover + Track info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
            <img
              src={currentTrack.cover}
              alt={currentTrack.title}
              className="w-full h-full object-cover"
            />
            {actuallyPlaying && (
              <div className="absolute inset-0 bg-black/40 flex items-end justify-center pb-1 gap-px">
                <div className="w-0.5 bg-white rounded-full eq-bar-1" />
                <div className="w-0.5 bg-white rounded-full eq-bar-2" />
                <div className="w-0.5 bg-white rounded-full eq-bar-3" />
                <div className="w-0.5 bg-white rounded-full eq-bar-4" />
              </div>
            )}
            {/* Loading spinner */}
            {showLoading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              </div>
            )}
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate leading-tight">
              {currentTrack.title}
            </p>
            <p className="text-[11px] text-white/50 truncate">
              {sourceLabel} &middot; {currentTrack.genre}
            </p>
          </div>
        </div>

        {/* Time display */}
        <span className="text-[11px] text-white/40 font-mono tabular-nums flex-shrink-0 hidden sm:block">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        {/* Controls */}
        <div className="flex items-center gap-0.5 sm:gap-1.5 flex-shrink-0">
          {/* Shuffle — desktop only */}
          <button
            onClick={() => useAudioStore.getState().toggleShuffle()}
            className={`hidden sm:flex w-8 h-8 items-center justify-center rounded-full transition-colors ${shuffleMode ? "text-purple-400" : "text-white/30 hover:text-white/60"}`}
            aria-label="Toggle shuffle"
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={previous}
            className="w-8 h-8 flex items-center justify-center rounded-full text-white/60 hover:text-white transition-colors"
            aria-label="Previous track"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Play / Pause — THE MAIN BUTTON */}
          <button
            onClick={handleTogglePlay}
            disabled={showLoading}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-lg disabled:opacity-60"
            aria-label={actuallyPlaying ? "Pause" : "Play"}
          >
            {showLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : actuallyPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </button>

          <button
            onClick={next}
            className="w-8 h-8 flex items-center justify-center rounded-full text-white/60 hover:text-white transition-colors"
            aria-label="Next track"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Volume — desktop only */}
          <button
            onClick={handleVolumeClick}
            className={`hidden sm:flex w-8 h-8 items-center justify-center rounded-full transition-colors ${isMuted ? "text-white/30" : "text-white/60 hover:text-white"}`}
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {/* Repeat — desktop only */}
          <button
            onClick={() => useAudioStore.getState().toggleRepeat()}
            className={`hidden sm:flex w-8 h-8 items-center justify-center rounded-full transition-colors ${repeatMode !== "off" ? "text-purple-400" : "text-white/30 hover:text-white/60"}`}
            aria-label={`Repeat: ${repeatMode}`}
          >
            <RepeatIcon className="w-3.5 h-3.5" />
          </button>

          {/* External link — desktop only */}
          <a
            href={currentTrack.pageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex w-8 h-8 items-center justify-center rounded-full text-white/30 hover:text-white/60 transition-colors"
            aria-label={`Open on ${sourceLabel}`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {/* Close */}
          <button
            onClick={stop}
            className="w-8 h-8 flex items-center justify-center rounded-full text-white/30 hover:text-kenya-red transition-colors"
            aria-label="Close player"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Error banner */}
      {audioError && (
        <div className="px-4 py-1.5 bg-red-500/10 border-t border-red-500/20 text-red-400 text-xs text-center">
          {audioError}
        </div>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  GLOBAL PLAYER (fixed bottom bar wrapper)                           */
/* ------------------------------------------------------------------ */

export function GlobalPlayer() {
  const currentTrack = useAudioStore((s) => s.currentTrack);

  /* Media Session API — for lock-screen controls */
  useEffect(() => {
    if (typeof window === "undefined" || !("mediaSession" in navigator)) return;
    if (!currentTrack) return;

    const artwork = currentTrack.cover
      ? [{ src: currentTrack.cover, sizes: "512x512", type: "image/jpeg" }]
      : [];

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title,
      artist: currentTrack.artist || currentTrack.subtitle || "DJ Kimchi",
      album: "DJ Kimchi Mixes",
      artwork,
    });

    navigator.mediaSession.setActionHandler("play", () => {
      const playBtn = document.querySelector("[aria-label='Play']") as HTMLButtonElement;
      if (playBtn) playBtn.click();
    });
    navigator.mediaSession.setActionHandler("pause", () => {
      const pauseBtn = document.querySelector("[aria-label='Pause']") as HTMLButtonElement;
      if (pauseBtn) pauseBtn.click();
    });
    navigator.mediaSession.setActionHandler("nexttrack", () => {
      useAudioStore.getState().next();
    });
    navigator.mediaSession.setActionHandler("previoustrack", () => {
      useAudioStore.getState().previous();
    });

    return () => {
      try {
        navigator.mediaSession.setActionHandler("play", null);
        navigator.mediaSession.setActionHandler("pause", null);
        navigator.mediaSession.setActionHandler("nexttrack", null);
        navigator.mediaSession.setActionHandler("previoustrack", null);
      } catch {
        /* cleanup */
      }
    };
  }, [currentTrack]);

  /* Update playback state for media session */
  const isPlaying = useAudioStore((s) => s.isPlaying);
  useEffect(() => {
    if (typeof window === "undefined" || !("mediaSession" in navigator)) return;
    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
  }, [isPlaying]);

  /* Persist on beforeunload */
  useEffect(() => {
    const handler = () => {
      const { currentTrack: ct, repeatMode, shuffleMode } = useAudioStore.getState();
      if (typeof window === "undefined" || !ct) return;
      try {
        localStorage.setItem(
          "dj-kimchi-audio",
          JSON.stringify({ lastTrackId: ct.id, repeatMode, shuffleMode, volume: 0.8 }),
        );
      } catch { /* ignore */ }
    };
    window.addEventListener("beforeunload", handler);
    return () => {
      handler();
      window.removeEventListener("beforeunload", handler);
    };
  }, []);

  return (
    <AnimatePresence>
      {currentTrack && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50"
        >
          <div className="glass border-t border-white/[0.08] shadow-[0_-8px_32px_rgba(0,0,0,0.5)]">
            <PlayerBar />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
