import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  axes: ["opsz"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#001D39",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://rauell.systems"),
  title: {
    default: "Kenya Youth Parliament for Water | KYPW",
    template: "%s | KYPW - Kenya Youth Parliament for Water",
  },
  description: "The official Kenyan chapter of the World Youth Parliament for Water (WYPW) and the African Youth Parliament for Water (AYPW). Empowering youth for water security and SDG 6 across all 47 counties.",
  keywords: ["KYPW", "Kenya Youth Parliament for Water", "WYPW", "AYPW", "water security", "SDG 6", "youth governance", "Kenya", "sanitation", "clean water"],
  authors: [{ name: "Kenya Youth Parliament for Water", url: "https://rauell.systems" }],
  creator: "Kenya Youth Parliament for Water",
  publisher: "Kenya Youth Parliament for Water",
  openGraph: {
    type: "website",
    locale: "en_KE",
    url: "https://rauell.systems",
    siteName: "KYPW - Kenya Youth Parliament for Water",
    title: "Kenya Youth Parliament for Water",
    description: "The official Kenyan chapter of WYPW and AYPW. Youth-led civic action for water security and SDG 6 across all 47 counties.",
    images: [{ url: "/images/hero-bg.jpg", width: 1920, height: 1080, alt: "KYPW - Kenya Youth Parliament for Water" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kenya Youth Parliament for Water",
    description: "Youth-led civic action for water security and SDG 6 across all 47 counties.",
    images: ["/images/hero-bg.jpg"],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "https://rauell.systems" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <head>
        <link rel="preload" href="/images/hero-bg.jpg" as="image" />
        <link rel="preload" href="/logo-tp.png" as="image" />
      </head>
      <body>
        {children}
        <Toaster richColors closeButton position="top-right" />
      </body>
    </html>
  );
}
