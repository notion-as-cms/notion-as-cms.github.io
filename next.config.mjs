import { withContentCollections } from "@content-collections/next";

// Support dynamic base path for PR previews
// For PR previews: NEXT_PUBLIC_BASE_PATH=/pr-preview/pr-123
// For production: NEXT_PUBLIC_BASE_PATH="" (empty or undefined)
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

// CRITICAL: assetPrefix needs trailing slash for GitHub Pages subdirectories
// basePath: "/pr-preview/pr-5"  (no trailing slash)
// assetPrefix: "/pr-preview/pr-5/" (WITH trailing slash)
// This ensures _next/static assets load correctly from subdirectories
const assetPrefix = basePath ? `${basePath}/` : basePath;

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  output: "export",
  images: { unoptimized: true },
  basePath: basePath,
  assetPrefix: assetPrefix,
};

export default withContentCollections(config);
