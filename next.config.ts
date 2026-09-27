import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable standalone tracing on Vercel to avoid the missing nft.json bug
  output: process.env.VERCEL ? undefined : 'standalone',
};

export default nextConfig;