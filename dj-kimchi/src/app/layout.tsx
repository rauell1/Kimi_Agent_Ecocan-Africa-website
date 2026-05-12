import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DJ Kimchi | Afrobeats, Amapiano, Gengetone | Nairobi's Hottest DJ",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  description:
    "DJ Kimchi - The baddest DJ from East and Central Africa. Specializing in Afrobeats, Amapiano, Gengetone, Dancehall, and Club Bangers. Book DJ Kimchi for your next event in Nairobi, Kenya.",
  keywords: [
    "DJ Kimchi",
    "DJ in Nairobi",
    "Kenyan DJ",
    "DJ for hire Kenya",
    "Afrobeats DJ",
    "Amapiano DJ",
    "Gengetone DJ",
    "Nairobi DJ",
    "Club DJ Kenya",
    "DJ Kimchi 254",
    "Nairobi nightlife",
    "Kenyan DJ booking",
    "Arbantone DJ",
    "East African DJ",
  ],
  authors: [{ name: "DJ Kimchi" }],
  openGraph: {
    title: "DJ Kimchi | Nairobi's Premier DJ",
    description:
      "Experience the electrifying sound of DJ Kimchi - Afrobeats, Amapiano, Dancehall & Club Anthems. The baddest DJ from East and Central Africa.",
    type: "website",
    siteName: "DJ Kimchi",
  },
  twitter: {
    card: "summary_large_image",
    title: "DJ Kimchi | Nairobi's Premier DJ",
    description:
      "Afrobeats, Amapiano, Dancehall & Club Anthems. Book DJ Kimchi for your next event.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="light">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          storageKey="dj-kimchi-theme"
        >
          {children}
          <Toaster />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
