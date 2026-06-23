import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  
  // Disable Turbopack HMR warnings in development
  experimental: {
    // Use Turbopack with proper HMR handling
    turbopack: {},
  },

  // Configure webpack for development with polling
  webpackDevMiddleware: (config: any) => {
    // Use polling for file changes (better for network drives and mobile)
    config.watchOptions = {
      poll: 1000,  // Poll every 1 second
      aggregateTimeout: 300,  // Wait 300ms after last change
      ignored: ['**/node_modules', '**/.next'],
    };
    return config;
  },

  // Suppress HMR errors that don't affect functionality
  onDemandEntries: {
    maxInactiveAge: 60000,
    pagesBufferLength: 5,
  },
  
  // Handle CORS headers for API routes instead of middleware
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
          {
            key: "Access-Control-Max-Age",
            value: "86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
