import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false, // Enable type checking in production
  },
  
  // React strict mode for better development experience
  reactStrictMode: true,
  
  // Security headers
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)',
          },
        ],
      },
      {
        // API routes - additional security
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ];
  },
  
  // Redirects for security
  async redirects() {
    return [
      // Redirect HTTP to HTTPS in production (handled by Caddy, but good to have)
    ];
  },
  
  // Environment variables that should be exposed to the client
  env: {
    NEXT_PUBLIC_APP_NAME: 'SafariCharge',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
  },
  
  // Image domains for external images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Powered-by header removal for security
  poweredByHeader: false,
  
  // Enable compression
  compress: true,
  
  // Generate ETags for caching
  generateEtags: true,
};

export default nextConfig;
