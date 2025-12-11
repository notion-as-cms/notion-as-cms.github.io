/**
 * Example: Using Primitives Directly (Full Control)
 *
 * This file shows how to build a completely custom page
 * without using createContentSource at all.
 *
 * Use this approach when you need:
 * - Custom routing logic
 * - Different data fetching patterns
 * - Complete control over the page structure
 *
 * Copy this pattern to your page.tsx file and customize.
 */

import { Client } from "@notionhq/client";
import { NotionCompatAPI } from "notion-compat";
import {
  getPublishedPosts,
  getTags,
  getAuthors,
  getPage,
  getPageBySlug,
} from "@/lib/notion/notion";
import { mapNotionPageToContentItem } from "@/lib/notion/notion-mappers";
import type { ContentItem, Tag, Author } from "@/components/notion/types";

// Initialize clients
const client = new Client({ auth: process.env.NOTION_API_KEY });
const compatClient = new NotionCompatAPI(client);

// Config
const DATABASE_ID = process.env.NOTION_BLOG_DATABASE_ID!;
const TAG_DATABASE_ID = process.env.NOTION_TAG_DATABASE_ID;
const AUTHOR_DATABASE_ID = process.env.NOTION_AUTHOR_DATABASE_ID;
const BASE_PATH = "/my-custom-blog";

/**
 * Generate static paths for all posts
 */
export async function generateStaticParams() {
  const response = await getPublishedPosts(client, DATABASE_ID);
  const posts = response.results as any[];

  return posts.map((post) => ({
    slug: [post.properties.Slug?.rich_text?.[0]?.plain_text || post.id],
  }));
}

/**
 * Custom page component with full control
 */
export default async function CustomBlogPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug = [] } = await params;

  // Fetch all data
  const postsResponse = await getPublishedPosts(client, DATABASE_ID);
  const posts = postsResponse.results as any[];

  const tags: Tag[] = TAG_DATABASE_ID
    ? await getTags(client, TAG_DATABASE_ID)
    : [];

  const authors: Author[] = AUTHOR_DATABASE_ID
    ? await getAuthors(client, AUTHOR_DATABASE_ID)
    : [];

  // Map to content items
  const items: ContentItem[] = posts
    .map((post) => mapNotionPageToContentItem(post, tags, BASE_PATH, authors))
    .filter((item): item is ContentItem => item !== null);

  // List page (no slug)
  if (slug.length === 0) {
    return (
      <div className="py-12">
        <h1 className="text-4xl font-bold mb-8">My Custom Blog</h1>
        <div className="space-y-6">
          {items.map((item) => (
            <article key={item.id} className="border-b pb-6">
              <h2 className="text-2xl font-semibold">
                <a href={item.url} className="hover:underline">
                  {item.data.title}
                </a>
              </h2>
              <p className="text-muted-foreground mt-2">
                {item.data.description}
              </p>
              <div className="text-sm text-muted-foreground mt-2">
                {item.data.author && <span>By {item.data.author} • </span>}
                {new Date(item.data.date).toLocaleDateString()}
              </div>
            </article>
          ))}
        </div>
      </div>
    );
  }

  // Detail page
  const postSlug = slug[0];
  const post = await getPageBySlug(client, DATABASE_ID, postSlug);

  if (!post) {
    return <div>Post not found</div>;
  }

  const recordMap = await getPage(compatClient, post.id, tags);

  // Render with your own layout - import Renderer from components/notion/renderer
  // return <Renderer recordMap={recordMap} />;

  return (
    <div className="py-12">
      <h1 className="text-4xl font-bold mb-4">
        {recordMap.pageInfo?.title || "Untitled"}
      </h1>
      <p className="text-muted-foreground mb-8">
        {recordMap.pageInfo?.description}
      </p>
      {/* Add your custom rendering here */}
      <p className="text-sm text-muted-foreground">
        Import and use the Renderer component to display Notion content
      </p>
    </div>
  );
}
