import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  reactStrictMode: true,
  // Vercel handles standalone output automatically for serverless
  output: "standalone",

  // Allow images from Supabase storage and external sources
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "*.supabase.in",
      },
    ],
  },

  // Ensure server components can access Supabase environment variables
  serverExternalPackages: ["@supabase/ssr", "@supabase/supabase-js", "bcryptjs"],

  // Allow preview panel cross-origin requests during development
  allowedDevOrigins: ["*"],
};

export default nextConfig;
