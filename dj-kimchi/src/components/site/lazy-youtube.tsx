"use client";

import { useState } from "react";
import { Play } from "lucide-react";

interface LazyYoutubeProps {
  videoId: string;
  title: string;
  className?: string;
}

export function LazyYoutube({ videoId, title, className }: LazyYoutubeProps) {
  const [loaded, setLoaded] = useState(false);

  if (loaded) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
        title={title}
        className={`w-full h-full max-w-full ${className ?? ""}`}
        style={{ maxWidth: "100%", border: "none" }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return (
    <div
      className={`relative cursor-pointer group/yt overflow-hidden ${className ?? ""}`}
      onClick={() => setLoaded(true)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") setLoaded(true);
      }}
      aria-label={`Play ${title}`}
    >
      <img
        src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
        alt={title}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover/yt:bg-black/20 transition-colors duration-300">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-600/90 flex items-center justify-center shadow-2xl shadow-red-500/30 group-hover/yt:scale-110 transition-transform duration-300">
          <Play className="w-6 h-6 text-white ml-1" />
        </div>
      </div>
    </div>
  );
}
