import type { NextConfig } from "next";

const isPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  ...(isPages
    ? {
        output: "export",
        basePath: "/noteslib",
        trailingSlash: true,
      }
    : {}),
  images: {
    unoptimized: isPages,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
};

export default nextConfig;
