"use client";

import { useAudioStore } from "@/stores/audio-store";
import type { ReactNode } from "react";

/**
 * Wrapper that adds bottom padding when the global audio player is visible,
 * preventing content from being hidden behind the fixed player bar.
 */
export function PagePadding({ children }: { children: ReactNode }) {
  const currentTrack = useAudioStore((s) => s.currentTrack);

  if (!currentTrack) {
    return <>{children}</>;
  }

  const barPad = 80; // control bar height + progress bar

  return (
    <div style={{ paddingBottom: barPad }}>
      {children}
    </div>
  );
}
