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
        env: {
          NEXT_PUBLIC_BASE_PATH: "/noteslib",
        },
      }
    : {}),
  images: {
    unoptimized: isPages,
  },
};

export default nextConfig;
