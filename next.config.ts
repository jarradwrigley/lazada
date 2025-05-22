import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    unoptimized: true, // ⬅️ This will ensure images load as they are
  },
};

export default nextConfig;
