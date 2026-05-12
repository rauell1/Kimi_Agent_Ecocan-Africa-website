"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

export interface GalleryImage {
  src: string;
  alt: string;
  caption: string;
}

interface ModernGalleryProps {
  images: GalleryImage[];
  columns?: number;
}

const GRID_LAYOUTS = [
  [
    { col: "md:col-span-2", row: "md:row-span-2" },
    { col: "md:col-span-1", row: "md:row-span-1" },
    { col: "md:col-span-1", row: "md:row-span-1" },
    { col: "md:col-span-1", row: "md:row-span-1" },
    { col: "md:col-span-1", row: "md:row-span-1" },
    { col: "md:col-span-1", row: "md:row-span-1" },
    { col: "md:col-span-1", row: "md:row-span-1" },
    { col: "md:col-span-1", row: "md:row-span-1" },
  ],
];

function ScrollReveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.65, 0, 0.35, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function GalleryItem({
  image,
  index,
  layout,
  onOpen,
}: {
  image: GalleryImage;
  index: number;
  layout: { col: string; row: string };
  onOpen: (index: number) => void;
}) {
  const isLarge = layout.col.includes("col-span-2");
  const aspectClass = isLarge ? "aspect-[4/3]" : "aspect-[3/4] md:aspect-[4/5]";

  return (
    <motion.div
      className={`${layout.col} ${layout.row}`}
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.65, 0, 0.35, 1] }}
    >
      <button
        onClick={() => onOpen(index)}
        className={`group relative block w-full overflow-hidden rounded-2xl bg-secondary/30 ${aspectClass} cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50`}
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          sizes={isLarge ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 25vw"}
        />

        {/* Subtle caption - always visible, slightly enhanced on hover */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/40 via-black/15 to-transparent p-4 pt-8 transition-all duration-300 group-hover:from-black/55 group-hover:via-black/20 group-hover:pt-10">
          <p className="text-xs font-medium text-white/80 leading-relaxed group-hover:text-white/95 transition-colors duration-300">
            {image.caption}
          </p>
        </div>

        {/* Expand icon - subtle, appears on hover */}
        <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 backdrop-blur-sm text-white/60 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:bg-black/30 group-hover:text-white/90">
          <Maximize2 className="h-3.5 w-3.5" />
        </div>
      </button>
    </motion.div>
  );
}

/* ── Lightbox Image ── */
function LightboxImage({ image }: { image: GalleryImage }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {!loaded && (
        <div className="flex items-center justify-center" style={{ width: "min(85vw, 900px)", height: "min(70vh, 600px)" }}>
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        </div>
      )}
      <img
        src={image.src}
        alt={image.alt}
        onLoad={() => setLoaded(true)}
        className={`max-h-[75vh] max-w-[85vw] rounded-2xl object-contain shadow-2xl transition-opacity duration-300 ${
          loaded ? "opacity-100" : "opacity-0 h-0 w-0"
        }`}
        style={{ display: loaded ? "block" : "none" }}
      />
    </>
  );
}

/* ── Lightbox ── */
function Lightbox({
  images,
  currentIndex,
  onClose,
  onPrev,
  onNext,
}: {
  images: GalleryImage[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    }
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose, onPrev, onNext]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div className="absolute inset-0 bg-black/85 backdrop-blur-xl" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />

        <button onClick={onClose} className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-all duration-200">
          <X className="h-5 w-5" />
        </button>

        <div className="absolute left-4 top-4 z-10 rounded-full bg-white/10 backdrop-blur-md px-3 py-1.5 text-xs font-medium text-white/70 border border-white/10">
          {currentIndex + 1} / {images.length}
        </div>

        {images.length > 1 && (
          <button onClick={(e) => { e.stopPropagation(); onPrev(); }} className="absolute left-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all duration-200">
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}
        {images.length > 1 && (
          <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="absolute right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all duration-200">
            <ChevronRight className="h-6 w-6" />
          </button>
        )}

        <motion.div
          className="relative z-10 mx-16 flex max-h-[85vh] max-w-5xl flex-col items-center justify-center"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ duration: 0.4, ease: [0.65, 0, 0.35, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: currentIndex > 0 ? 30 : -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: currentIndex > 0 ? -30 : 30 }}
              transition={{ duration: 0.3, ease: [0.65, 0, 0.35, 1] }}
            >
              <LightboxImage key={currentIndex} image={images[currentIndex]} />
            </motion.div>
          </AnimatePresence>

          <motion.div
            key={`caption-${currentIndex}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="mt-4 text-center"
          >
            <p className="text-sm font-medium text-white/70">{images[currentIndex].caption}</p>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ── Main Gallery ── */
export function ModernGallery({ images, columns = 4 }: ModernGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const layout = GRID_LAYOUTS[0];

  const openLightbox = useCallback((index: number) => setLightboxIndex(index), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const prevImage = useCallback(() => {
    setLightboxIndex((i) => (i !== null ? (i - 1 + images.length) % images.length : null));
  }, [images.length]);
  const nextImage = useCallback(() => {
    setLightboxIndex((i) => (i !== null ? (i + 1) % images.length : null));
  }, [images.length]);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 md:auto-rows-[200px] lg:auto-rows-[240px]">
        {images.map((image, i) => (
          <GalleryItem key={i} image={image} index={i} layout={layout[i] || { col: "md:col-span-1", row: "md:row-span-1" }} onOpen={openLightbox} />
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <ScrollReveal>
          <button
            onClick={() => openLightbox(0)}
            className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-6 py-3 text-sm font-medium text-foreground/80 shadow-sm hover:border-primary/30 hover:shadow-elevated transition-all duration-300"
          >
            <Maximize2 className="h-4 w-4" />
            View all {images.length} photos
          </button>
        </ScrollReveal>
      </div>

      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox images={images} currentIndex={lightboxIndex} onClose={closeLightbox} onPrev={prevImage} onNext={nextImage} />
        )}
      </AnimatePresence>
    </>
  );
}
