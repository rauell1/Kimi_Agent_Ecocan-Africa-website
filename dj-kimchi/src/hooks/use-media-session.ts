"use client";

import { useEffect } from "react";
import { useAudioStore, type AudioTrack } from "@/stores/audio-store";

/**
 * Integrates the Media Session API with the Zustand audio store.
 * Enables lock-screen / notification-bar controls on mobile & desktop.
 */
export function useMediaSession() {
  const currentTrack = useAudioStore((s) => s.currentTrack);
  const isPlaying = useAudioStore((s) => s.isPlaying);

  /* ---- Update metadata whenever the track changes ---- */
  useEffect(() => {
    if (!currentTrack || typeof window === "undefined") return;
    if (!("mediaSession" in navigator)) return;

    const artwork = currentTrack.cover
      ? [{ src: currentTrack.cover, sizes: "512x512", type: "image/jpeg" }]
      : [];

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title,
      artist: currentTrack.artist || currentTrack.subtitle || "DJ Kimchi",
      album: "DJ Kimchi Mixes",
      artwork,
    });

    // setPositionState is optional and may not exist on all browsers
    try {
      navigator.mediaSession.setPositionState?.({
        duration: 0,
        playbackRate: 1,
      });
    } catch {
      /* optional — ignore failures */
    }
  }, [currentTrack]);

  /* ---- Update playback state ---- */
  useEffect(() => {
    if (typeof window === "undefined" || !("mediaSession" in navigator)) return;
    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
  }, [isPlaying]);

  /* ---- Register action handlers once ---- */
  useEffect(() => {
    if (typeof window === "undefined" || !("mediaSession" in navigator)) return;

    navigator.mediaSession.setActionHandler("play", () => {
      const s = useAudioStore.getState();
      if (s.currentTrack) s.resume();
    });

    navigator.mediaSession.setActionHandler("pause", () => {
      useAudioStore.getState().pause();
    });

    navigator.mediaSession.setActionHandler("nexttrack", () => {
      useAudioStore.getState().next();
    });

    navigator.mediaSession.setActionHandler("previoustrack", () => {
      useAudioStore.getState().previous();
    });

    navigator.mediaSession.setActionHandler("stop", () => {
      useAudioStore.getState().stop();
    });

    return () => {
      try {
        navigator.mediaSession.setActionHandler("play", null);
        navigator.mediaSession.setActionHandler("pause", null);
        navigator.mediaSession.setActionHandler("nexttrack", null);
        navigator.mediaSession.setActionHandler("previoustrack", null);
        navigator.mediaSession.setActionHandler("stop", null);
      } catch {
        /* cleanup failures are harmless */
      }
    };
  }, []);
}

/* ------------------------------------------------------------------ */
/*  Helper: build the autoplay embed URL from a track                  */
/* ------------------------------------------------------------------ */

export function getEmbedSrc(track: AudioTrack, autoplay: boolean): string {
  let url = track.embedUrl;
  // Replace existing autoplay parameter, or append if missing
  if (url.includes("autoplay=")) {
    url = url.replace(/autoplay=\d+/, `autoplay=${autoplay ? 1 : 0}`);
  } else {
    const sep = url.includes("?") ? "&" : "?";
    url = `${url}${sep}autoplay=${autoplay ? 1 : 0}`;
  }
  return url;
}
