import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  images: {
    // Next's optimizer does not forward Basic Auth when fetching source images.
    // Load them in the browser so they stay protected without repeated challenges.
    unoptimized: true,
  },
  transpilePackages: ["@coss/ui"],
  webpack(config) {
    config.resolve.modules.push(path.resolve(process.cwd(), "node_modules"));
    return config;
  },
};

export default nextConfig;
