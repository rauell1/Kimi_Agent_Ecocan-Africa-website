"use client";

import { ErrorBoundary } from "@/components/error-boundary";
import { Navigation } from "@/components/site/navigation";
import { HeroSection } from "@/components/site/hero";
import { AboutSection } from "@/components/site/about";
import { MusicSection } from "@/components/site/music";
import { VideosSection } from "@/components/site/videos";
import { PhotosSection } from "@/components/site/photos";
import { BookingsSection } from "@/components/site/bookings";
import { Footer } from "@/components/site/footer";
import { GlobalPlayer } from "@/components/site/global-player";
import { PagePadding } from "@/components/site/page-padding";

export default function HomePage() {
  return (
    <PagePadding>
      <main className="min-h-screen bg-background text-foreground overflow-x-hidden w-full max-w-[100vw]">
        <Navigation />
        <ErrorBoundary>
          <HeroSection />
        </ErrorBoundary>
        <ErrorBoundary>
          <AboutSection />
        </ErrorBoundary>
        <ErrorBoundary>
          <MusicSection />
        </ErrorBoundary>
        <ErrorBoundary>
          <VideosSection />
        </ErrorBoundary>
        <ErrorBoundary>
          <PhotosSection />
        </ErrorBoundary>
        <ErrorBoundary>
          <BookingsSection />
        </ErrorBoundary>
        <Footer />
      </main>
      <GlobalPlayer />
    </PagePadding>
  );
}
