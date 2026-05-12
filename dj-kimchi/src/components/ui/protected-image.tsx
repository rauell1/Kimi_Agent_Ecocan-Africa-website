"use client";

import { useCallback } from "react";

interface ProtectedImageProps {
  src: string;
  alt: string;
  className?: string;
}

/**
 * Image wrapper that prevents casual downloading via:
 * 1. Transparent overlay intercepting all pointer events (right-click, drag, long-press)
 * 2. `pointer-events: none` on the underlying <img> so it cannot be targeted
 * 3. `draggable={false}` on the <img>
 * 4. Context menu (right-click → Save As) blocked on the container
 * 5. CSS `user-select: none` + `-webkit-touch-callout: none` (iOS long-press save)
 */
export function ProtectedImage({ src, alt, className }: ProtectedImageProps) {
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  return (
    <div
      className="relative w-full h-full overflow-hidden select-none"
      onContextMenu={handleContextMenu}
      onDragStart={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      style={{
        WebkitTouchCallout: "none",
        WebkitUserSelect: "none",
        userSelect: "none",
      }}
    >
      <img
        src={src}
        alt={alt}
        className={className}
        loading="lazy"
        draggable={false}
        style={{ pointerEvents: "none", userSelect: "none" }}
      />
      {/* Invisible overlay blocks all interaction with the underlying image */}
      <div
        className="absolute inset-0"
        aria-hidden="true"
      />
    </div>
  );
}
