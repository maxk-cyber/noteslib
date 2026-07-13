const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Prefix public asset URLs with the Next.js basePath (required on GitHub Pages). */
export function assetPath(path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${basePath}${normalized}`;
}
