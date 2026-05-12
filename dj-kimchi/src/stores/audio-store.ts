import { create } from "zustand";

/* ------------------------------------------------------------------ */
/*  TYPES                                                              */
/* ------------------------------------------------------------------ */

export type TrackSource = "mixcloud" | "hearthis" | "youtube";

export interface AudioTrack {
  id: string;
  title: string;
  subtitle: string;
  artist: string;
  cover: string;
  /** Full page URL on the streaming platform */
  pageUrl: string;
  /** Embed iframe src (kept for reference, no longer used for playback) */
  embedUrl: string;
  /** Direct audio URL for HearThis (MP3) — null for Mixcloud (resolved via API) */
  audioUrl: string | null;
  source: TrackSource;
  genre: string;
  duration: string;
}

export type RepeatMode = "off" | "all" | "one";

export interface AudioStore {
  /* ---- state ---- */
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  queue: AudioTrack[];
  queueIndex: number;
  repeatMode: RepeatMode;
  shuffleMode: boolean;
  /** Resolved audio stream URL (populated by player for Mixcloud tracks) */
  resolvedAudioUrl: string | null;
  /** Whether we're currently resolving a stream URL */
  isResolving: boolean;

  /* ---- actions ---- */
  play: (track: AudioTrack) => void;
  pause: () => void;
  resume: () => void;
  toggle: () => void;
  stop: () => void;
  next: () => void;
  previous: () => void;
  addToQueue: (track: AudioTrack) => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  setResolvedAudioUrl: (url: string | null) => void;
  setIsResolving: (v: boolean) => void;
  /** Replace entire queue (used on init from site-data) */
  initQueue: (tracks: AudioTrack[]) => void;
}

/* ------------------------------------------------------------------ */
/*  PERSISTENCE HELPERS                                                */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = "dj-kimchi-audio";

interface PersistedState {
  lastTrackId: string | null;
  repeatMode: RepeatMode;
  shuffleMode: boolean;
  volume: number;
}

function loadPersisted(): PersistedState {
  if (typeof window === "undefined") {
    return { lastTrackId: null, repeatMode: "off", shuffleMode: false, volume: 0.8 };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return { lastTrackId: null, repeatMode: "off", shuffleMode: false, volume: 0.8 };
}

function persist(state: PersistedState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

/* ------------------------------------------------------------------ */
/*  SHUFFLE HELPERS                                                    */
/* ------------------------------------------------------------------ */

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ------------------------------------------------------------------ */
/*  STORE                                                              */
/* ------------------------------------------------------------------ */

export const useAudioStore = create<AudioStore>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  queue: [],
  queueIndex: -1,
  repeatMode: "off",
  shuffleMode: false,
  resolvedAudioUrl: null,
  isResolving: false,

  /* ---- play a specific track ---- */
  play(track) {
    const { queue } = get();
    const idx = queue.findIndex((t) => t.id === track.id);

    set({
      currentTrack: track,
      isPlaying: true,
      queueIndex: idx >= 0 ? idx : 0,
      /* Reset resolved URL — the player will resolve it */
      resolvedAudioUrl: track.audioUrl, // HearThis has direct URL, Mixcloud is null
      isResolving: !track.audioUrl, // Mixcloud tracks need resolution
    });

    persist({
      lastTrackId: track.id,
      repeatMode: get().repeatMode,
      shuffleMode: get().shuffleMode,
      volume: 0.8,
    });
  },

  /* ---- pause ---- */
  pause() {
    set({ isPlaying: false });
  },

  /* ---- resume ---- */
  resume() {
    const { currentTrack } = get();
    if (!currentTrack) return;
    set({ isPlaying: true });
  },

  /* ---- toggle play/pause ---- */
  toggle() {
    const { isPlaying, currentTrack } = get();
    if (!currentTrack) return;
    if (isPlaying) get().pause();
    else get().resume();
  },

  /* ---- full stop ---- */
  stop() {
    set({
      currentTrack: null,
      isPlaying: false,
      queueIndex: -1,
      resolvedAudioUrl: null,
      isResolving: false,
    });
  },

  /* ---- next track ---- */
  next() {
    const { queue, queueIndex, repeatMode, shuffleMode } = get();
    if (queue.length === 0) return;

    if (repeatMode === "one") {
      get().resume();
      return;
    }

    let nextIdx: number;
    if (shuffleMode) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else {
      nextIdx = queueIndex + 1;
      if (nextIdx >= queue.length) {
        if (repeatMode === "all") nextIdx = 0;
        else {
          get().stop();
          return;
        }
      }
    }

    const track = queue[nextIdx];
    if (track) {
      set({
        currentTrack: track,
        isPlaying: true,
        queueIndex: nextIdx,
        resolvedAudioUrl: track.audioUrl,
        isResolving: !track.audioUrl,
      });
      persist({
        lastTrackId: track.id,
        repeatMode,
        shuffleMode,
        volume: 0.8,
      });
    }
  },

  /* ---- previous track ---- */
  previous() {
    const { queue, queueIndex, shuffleMode } = get();
    if (queue.length === 0) return;

    let prevIdx: number;
    if (shuffleMode) {
      prevIdx = Math.floor(Math.random() * queue.length);
    } else {
      prevIdx = queueIndex - 1;
      if (prevIdx < 0) prevIdx = queue.length - 1;
    }

    const track = queue[prevIdx];
    if (track) {
      set({
        currentTrack: track,
        isPlaying: true,
        queueIndex: prevIdx,
        resolvedAudioUrl: track.audioUrl,
        isResolving: !track.audioUrl,
      });
      persist({
        lastTrackId: track.id,
        repeatMode: get().repeatMode,
        shuffleMode,
        volume: 0.8,
      });
    }
  },

  /* ---- add a track to end of queue ---- */
  addToQueue(track) {
    set((s) => ({ queue: [...s.queue, track] }));
  },

  /* ---- toggle repeat ---- */
  toggleRepeat() {
    const next: RepeatMode =
      get().repeatMode === "off" ? "all" : get().repeatMode === "all" ? "one" : "off";
    set({ repeatMode: next });
    persist({
      lastTrackId: get().currentTrack?.id ?? null,
      repeatMode: next,
      shuffleMode: get().shuffleMode,
      volume: 0.8,
    });
  },

  /* ---- toggle shuffle ---- */
  toggleShuffle() {
    const next = !get().shuffleMode;
    set({ shuffleMode: next });
    persist({
      lastTrackId: get().currentTrack?.id ?? null,
      repeatMode: get().repeatMode,
      shuffleMode: next,
      volume: 0.8,
    });
  },

  /* ---- resolved audio URL ---- */
  setResolvedAudioUrl(url) {
    set({ resolvedAudioUrl: url, isResolving: false });
  },

  setIsResolving(v) {
    set({ isResolving: v });
  },

  /* ---- initialise queue from site-data ---- */
  initQueue(tracks) {
    const { shuffleMode } = get();
    const persisted = loadPersisted();
    const lastTrackId = persisted.lastTrackId;
    let idx = 0;
    if (lastTrackId) {
      const found = tracks.findIndex((t) => t.id === lastTrackId);
      if (found >= 0) idx = found;
    }

    const finalTracks = shuffleMode ? shuffleArray(tracks) : tracks;

    set({
      queue: finalTracks,
      queueIndex: idx,
      repeatMode: persisted.repeatMode,
      shuffleMode: persisted.shuffleMode,
    });
  },
}));
