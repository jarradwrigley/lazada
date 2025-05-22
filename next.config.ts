import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Public runtime config for client-side access
  publicRuntimeConfig: {
    NODE_ENV: process.env.NODE_ENV,
  },

  // Server runtime config for server-side access
  serverRuntimeConfig: {
    NODE_ENV: process.env.NODE_ENV,
  },

  images: {
    domains: ["localhost"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    unoptimized: true,
  },

  serverExternalPackages: ["prisma"],
};

export default nextConfig;
