"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import {
  Upload,
  Trash2,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  X,
  ChevronUp,
  ChevronDown,
  Loader2,
  ImagePlus,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { api } from "@/lib/api/client";

interface MediaItem {
  id: string;
  eventId: string;
  url: string;
  thumbnailUrl?: string | null;
  title?: string | null;
  description?: string | null;
  fileType?: string | null;
  fileSize?: number | null;
  width?: number | null;
  height?: number | null;
  sortOrder: number;
  uploadedBy?: string | null;
  createdAt: string;
}

interface Props {
  eventId: string;
  canManage?: boolean;
}

export function MediaGalleryPanel({ eventId, canManage = true }: Props) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    try {
      const data = await api.get<{ media: MediaItem[] }>(`/events/${eventId}/media`);
      setMedia(data.media);
    } catch {
      toast.error("Failed to load media");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [eventId]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedItems: { url: string; fileName: string; fileSize: number; mimeType: string }[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch(`/api/upload?type=event&eventId=${eventId}`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Upload failed" }));
          throw new Error(err.error || "Upload failed");
        }

        const uploadData = await res.json();
        uploadedItems.push(uploadData);
      } catch (err) {
        toast.error(`Failed to upload ${file.name}: ${err instanceof Error ? err.message : "Unknown error"}`);
      }
    }

    // Create media entries for each uploaded file
    for (const item of uploadedItems) {
      try {
        await api.post(`/events/${eventId}/media`, {
          url: item.url,
          title: item.fileName,
          fileType: item.mimeType,
        });
      } catch {
        toast.error(`Failed to save media entry for ${item.fileName}`);
      }
    }

    if (uploadedItems.length > 0) {
      toast.success(`${uploadedItems.length} file(s) uploaded successfully`);
    }

    setUploading(false);
    fetchMedia();

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleDelete(mediaId: string) {
    if (!confirm("Delete this media item? This cannot be undone.")) return;

    setDeleting(mediaId);
    try {
      await api.delete(`/events/${eventId}/media/${mediaId}`);
      toast.success("Media deleted");
      if (lightboxIndex !== null && media[lightboxIndex]?.id === mediaId) {
        setLightboxIndex(null);
      }
      fetchMedia();
    } catch {
      toast.error("Failed to delete media");
    } finally {
      setDeleting(null);
    }
  }

  async function handleReorder(mediaId: string, direction: "up" | "down") {
    const currentMedia = [...media];
    const idx = currentMedia.findIndex((m) => m.id === mediaId);
    if (idx === -1) return;
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === currentMedia.length - 1) return;

    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    const currentSort = currentMedia[idx].sortOrder;
    const swapSort = currentMedia[swapIdx].sortOrder;

    try {
      // Swap sort orders via updating both records
      await fetch(`/api/events/${eventId}/media`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          swaps: [
            { id: mediaId, sortOrder: swapSort },
            { id: currentMedia[swapIdx].id, sortOrder: currentSort },
          ],
        }),
      });
      fetchMedia();
    } catch {
      toast.error("Failed to reorder media");
    }
  }

  // Lightbox navigation
  function openLightbox(index: number) {
    setLightboxIndex(index);
  }

  function closeLightbox() {
    setLightboxIndex(null);
  }

  function navigateLightbox(direction: "prev" | "next") {
    if (lightboxIndex === null) return;
    if (direction === "prev") {
      setLightboxIndex(lightboxIndex > 0 ? lightboxIndex - 1 : media.length - 1);
    } else {
      setLightboxIndex(lightboxIndex < media.length - 1 ? lightboxIndex + 1 : 0);
    }
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") navigateLightbox("prev");
      if (e.key === "ArrowRight") navigateLightbox("next");
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, media.length]);

  const isImage = (fileType?: string | null, url?: string) => {
    if (fileType?.startsWith("image/")) return true;
    if (url && /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(url)) return true;
    return false;
  };

  return (
    <div className="space-y-6">
      {/* Header & Upload */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-civic" />
          <h3 className="font-display text-base font-semibold">
            Media Gallery
          </h3>
          <span className="text-xs text-muted-foreground">({media.length} items)</span>
        </div>
        {canManage && (
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf,text/csv,application/msword,application/vnd.openxmlformats-officedocument.*"
              multiple
              onChange={handleUpload}
              className="hidden"
            />
            <Button
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  Uploading…
                </>
              ) : (
                <>
                  <Upload className="mr-1.5 h-4 w-4" />
                  Upload
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : media.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <ImagePlus className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 font-display text-xl font-semibold">No media yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload images, documents, or other files for this event.
          </p>
          {canManage && (
            <Button
              size="sm"
              className="mt-4"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="mr-1.5 h-4 w-4" />
              Upload first file
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {media.map((item, index) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-xl border border-border/70 bg-card transition-shadow hover:shadow-md"
            >
              {/* Thumbnail */}
              <div
                className="flex h-40 items-center justify-center bg-secondary/40 cursor-pointer overflow-hidden"
                onClick={() => openLightbox(index)}
              >
                {isImage(item.fileType, item.url) ? (
                  <img
                    src={item.url}
                    alt={item.title || "Event media"}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <ImageIcon className="h-10 w-10 text-muted-foreground/50" />
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="truncate text-sm font-medium">
                  {item.title || "Untitled"}
                </p>
                {item.fileType && (
                  <p className="mt-0.5 text-[10px] text-muted-foreground uppercase tracking-wider">
                    {item.fileType.split("/").pop()}
                  </p>
                )}
              </div>

              {/* Actions overlay */}
              {canManage && (
                <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {index > 0 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleReorder(item.id, "up"); }}
                      className="rounded-md bg-background/90 p-1.5 shadow-sm hover:bg-background"
                      title="Move up"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {index < media.length - 1 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleReorder(item.id, "down"); }}
                      className="rounded-md bg-background/90 p-1.5 shadow-sm hover:bg-background"
                      title="Move down"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                    className="rounded-md bg-background/90 p-1.5 shadow-sm hover:bg-destructive/10 hover:text-destructive"
                    title="Delete"
                    disabled={deleting === item.id}
                  >
                    {deleting === item.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Dialog */}
      <Dialog open={lightboxIndex !== null} onOpenChange={(open) => { if (!open) closeLightbox(); }}>
        <DialogContent className="max-w-4xl w-full bg-black/95 border-none p-0 overflow-hidden [&>button]:hidden" showCloseButton={false}>
          <DialogTitle className="sr-only">
            Image viewer - {lightboxIndex !== null ? media[lightboxIndex]?.title || "Image" : ""}
          </DialogTitle>
          {lightboxIndex !== null && media[lightboxIndex] && (
            <div className="relative flex flex-col items-center justify-center min-h-[60vh] max-h-[80vh]">
              {/* Image */}
              <div className="flex-1 flex items-center justify-center w-full p-4">
                {isImage(media[lightboxIndex].fileType, media[lightboxIndex].url) ? (
                  <img
                    src={media[lightboxIndex].url}
                    alt={media[lightboxIndex].title || "Event media"}
                    className="max-h-[70vh] max-w-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="text-center text-white/70">
                    <ImageIcon className="mx-auto h-16 w-16 mb-3" />
                    <p className="text-sm">{media[lightboxIndex].title || "File"}</p>
                    <p className="text-xs mt-1">{media[lightboxIndex].fileType}</p>
                  </div>
                )}
              </div>

              {/* Caption */}
              {(media[lightboxIndex].title || media[lightboxIndex].description) && (
                <div className="text-center px-6 pb-3">
                  <p className="text-sm font-medium text-white/90">
                    {media[lightboxIndex].title}
                  </p>
                  {media[lightboxIndex].description && (
                    <p className="text-xs text-white/60 mt-1">
                      {media[lightboxIndex].description}
                    </p>
                  )}
                  <p className="text-[10px] text-white/40 mt-1">
                    {lightboxIndex + 1} of {media.length}
                  </p>
                </div>
              )}

              {/* Navigation buttons */}
              <button
                onClick={() => navigateLightbox("prev")}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 hover:bg-white/20 p-2 text-white/80 hover:text-white transition-colors"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={() => navigateLightbox("next")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 hover:bg-white/20 p-2 text-white/80 hover:text-white transition-colors"
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              {/* Close button */}
              <button
                onClick={closeLightbox}
                className="absolute top-3 right-3 rounded-full bg-white/10 hover:bg-white/20 p-2 text-white/80 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
