import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Analytics } from '@vercel/analytics/react';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/toaster';
import { APP_CONFIG } from '@/lib/config';
import './globals.css';

const appDescription =
  "Kenya's EV charging network for drivers, fleet managers, employees, and administrators.";

export const metadata: Metadata = {
  title: `${APP_CONFIG.name} | Powering Africa's Electric Future`,
  description: appDescription,
  keywords: ['EV charging', 'electric vehicle', 'charging stations', 'Kenya', 'SafariCharge', 'sustainable transport', 'green energy'],
  authors: [{ name: 'SafariCharge Ltd' }],
  icons: {
    icon: '/logo.svg',
  },
  openGraph: {
    title: `${APP_CONFIG.name} | EV Charging Network`,
    description: appDescription,
    url: APP_CONFIG.url,
    siteName: APP_CONFIG.name,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${APP_CONFIG.name} | EV Charging Network`,
    description: appDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
          disableTransitionOnChange={false}
        >
          {children}
          <Toaster />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
