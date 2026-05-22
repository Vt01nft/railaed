import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Explicit so Vercel's modifyConfig has a defined path to anchor against
  // (without this, build fails with "The 'path' argument must be of type string").
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
