/**
 * Example: Blog Page Route
 *
 * Copy this to `app/blog/[[...slug]]/page.tsx` in your project.
 * Uses the default ContentList and ContentPage components.
 */

import notionConfig from "@/notion.config";
import { createNotionClient } from "@/lib/notion/notion-client";
import { createContentSource } from "@/lib/notion/content-page";
// Optional: import your own metadata utility
// import { createMetadata } from "@/lib/metadata";

const source = notionConfig.sources.blog;
const { client, compatClient } = createNotionClient(notionConfig.apiKey);

const { generateStaticParams, generateMetadata, Page } = createContentSource({
  source,
  client,
  compatClient,
  listHeading: "Latest Posts",
  tagHeadingPrefix: "Posts tagged with:",
  contentLabel: "Post",
  authorDatabaseId: notionConfig.authorDatabaseId,
  // Metadata options
  siteName: "My Site",
  baseUrl: "https://example.com",
  // Optional: Transform metadata with your own utility
  // transformMetadata: (meta) => createMetadata({
  //   ...meta,
  //   title: `${meta.title} | My Site`,
  // }),
  // Optional: TOC configuration for fixed headers
  tocConfig: {
    headerOffset: 80,
    mobileTopClass: "top-14",
  },
});

export { generateStaticParams, generateMetadata };
export default Page;
