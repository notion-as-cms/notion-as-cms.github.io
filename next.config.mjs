import { withContentCollections } from "@content-collections/next";

// Support dynamic base path for PR previews
// For PR previews: NEXT_PUBLIC_BASE_PATH=/pr-preview/pr-123
// For production: NEXT_PUBLIC_BASE_PATH="" (empty or undefined)
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  output: "export",
  images: { unoptimized: true },
  basePath: basePath,
  // Ensure assets are loaded correctly with base path
  assetPrefix: basePath,
};

export default withContentCollections(config);
