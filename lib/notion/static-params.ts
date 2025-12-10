import { Client } from "@notionhq/client";
import { getPublishedPosts, getTags } from "./notion";
import { isNotionPage } from "./notion-mappers";
import { getPostsPerPage } from "./config";
import type { NotionSourceConfig, Tag } from "@/components/notion/types";

type StaticParam = { slug: string[] };

/**
 * Generate static params for a Notion content source.
 * This enables static generation for all routes at build time.
 */
export async function generateStaticParams(
  client: Client,
  source: NotionSourceConfig
): Promise<StaticParam[]> {
  const allParams: StaticParam[] = [];
  const postsPerPage = getPostsPerPage(source);

  // Add root route (slug: [])
  allParams.push({ slug: [] });

  // 1. Get all published posts
  const { results: posts } = await getPublishedPosts(client, source.databaseId);

  // 2. Generate root pagination paths (/page/2, etc.)
  const rootParams = generateRootPathParams(posts.length, postsPerPage);
  allParams.push(...rootParams);

  // 3. Generate individual post paths (/{slug})
  const postParams = generatePostPathParams(posts);
  allParams.push(...postParams);

  // 4. Generate tag paths if tag database is configured
  if (source.tagDatabaseId) {
    const tagParams = await generateTagPathParams(
      client,
      source.tagDatabaseId,
      posts,
      postsPerPage
    );
    allParams.push(...tagParams);
  }

  return allParams;
}

function generateRootPathParams(
  totalPosts: number,
  postsPerPage: number
): StaticParam[] {
  const totalPages = Math.ceil(totalPosts / postsPerPage);
  const params: StaticParam[] = [];

  // Skip page 1 as it's handled by the root route
  for (let i = 1; i < totalPages; i++) {
    params.push({ slug: ["page", (i + 1).toString()] });
  }

  return params;
}

function generatePostPathParams(posts: any[]): StaticParam[] {
  return posts
    .filter((post) => "properties" in post)
    .filter((post) => {
      const slugProp = post.properties.Slug;
      return (
        slugProp?.type === "rich_text" &&
        Array.isArray(slugProp.rich_text) &&
        slugProp.rich_text.length > 0
      );
    })
    .map((post) => ({
      slug: [post.properties.Slug.rich_text[0].plain_text],
    }));
}

async function generateTagPathParams(
  client: Client,
  tagDatabaseId: string,
  posts: any[],
  postsPerPage: number
): Promise<StaticParam[]> {
  const tags = await getTags(client, tagDatabaseId);

  const allParams: StaticParam[] = [];
  const tagPostCounts = new Map<string, number>();

  // Count posts per tag
  for (const post of posts) {
    if (isNotionPage(post)) {
      const tagsProperty = post.properties.Tags;
      if (tagsProperty) {
        const tagIds = tagsProperty.relation?.map((r) => r.id) || [];
        tagIds.forEach((tagId: string) => {
          tagPostCounts.set(tagId, (tagPostCounts.get(tagId) || 0) + 1);
        });
      }
    }
  }

  // Generate paths for each tag
  for (const tag of tags) {
    const postCount = tagPostCounts.get(tag.id) || 0;

    if (postCount === 0) continue;

    // Add tag page (/tag/{tag-slug})
    allParams.push({ slug: ["tag", tag.value] });

    // Add pagination pages if needed (/tag/{tag-slug}/page/2, etc.)
    const totalPages = Math.ceil(postCount / postsPerPage);
    for (let i = 1; i < totalPages; i++) {
      allParams.push({
        slug: ["tag", tag.value, "page", (i + 1).toString()],
      });
    }
  }

  return allParams;
}
