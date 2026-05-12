import type { MetadataRoute } from "next";

/**
 * KYPW Sitemap Generator
 *
 * Note: This app uses client-side hash routing (#/events, #/about, etc.)
 * Search engines treat all hash URLs as the same page (the root /).
 * This sitemap registers the canonical URLs so crawlers at least know
 * the site exists and can index the root page's metadata.
 *
 * For full SEO of sub-pages, consider migrating to file-based routing
 * (app/events/page.tsx, app/about/page.tsx, etc.) in a future update.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://rauell.systems";
  const now = new Date();

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
  ];
}
