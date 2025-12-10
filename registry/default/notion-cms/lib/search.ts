import { Client } from "@notionhq/client";
import { getPublishedPosts } from "./notion";
import type { NotionSourceConfig } from "@/registry/default/notion-cms/types/notion";

/**
 * Content section structure for search index
 */
export interface SearchContent {
  heading: string;
  content: string;
}

/**
 * Heading structure for search index
 */
export interface SearchHeading {
  id: string;
  content: string;
}

/**
 * Search index structure compatible with fumadocs-core/search/server AdvancedIndex
 * Define our own type to avoid fumadocs dependency in the registry
 */
export interface SearchIndex {
  id: string;
  title: string;
  description?: string;
  keywords?: string;
  tag?: string;
  url: string;
  structuredData: {
    headline: string;
    description: string;
    contents: SearchContent[];
    headings: SearchHeading[];
  };
}

export interface SearchIndexCache {
  indexes: SearchIndex[];
  lastFetchTime: number;
}

/**
 * Build search indexes for a content source.
 * This fetches all published posts and converts them to search indexes.
 */
export async function buildSearchIndexes(
  client: Client,
  source: NotionSourceConfig
): Promise<SearchIndex[]> {
  const response = await getPublishedPosts(client, source.databaseId);
  const posts = Array.isArray(response) ? response : response?.results || [];

  return posts.map((post: any) => ({
    id: post.id,
    title: post.properties.Name?.title?.[0]?.plain_text || "Untitled",
    description:
      post.properties.Description?.rich_text?.[0]?.plain_text || "",
    keywords: post.properties.Keywords?.rich_text?.[0]?.plain_text || "",
    tag: source.basePath.replace(/^\//, ""), // e.g., "blog" from "/blog"
    url: `${source.basePath}/${
      post.properties.Slug?.rich_text?.[0]?.plain_text || post.id
    }`,
    structuredData: {
      headline: post.properties.Name?.title?.[0]?.plain_text || "Untitled",
      description:
        post.properties.Description?.rich_text?.[0]?.plain_text || "",
      contents: [] as SearchContent[],
      headings: [] as SearchHeading[],
    },
  }));
}

/**
 * Build search indexes for multiple content sources.
 * Combines indexes from all sources into a single array.
 */
export async function buildMultiSourceSearchIndexes(
  client: Client,
  sources: Record<string, NotionSourceConfig>
): Promise<SearchIndex[]> {
  const allIndexes: SearchIndex[] = [];

  for (const [name, source] of Object.entries(sources)) {
    try {
      console.log(`Building search indexes for source: ${name}`);
      const indexes = await buildSearchIndexes(client, source);
      allIndexes.push(...indexes);
    } catch (error) {
      console.error(`Error building search indexes for ${name}:`, error);
    }
  }

  return allIndexes;
}

/**
 * Create a cached search index fetcher.
 * Returns a function that fetches indexes with optional caching.
 */
export function createSearchIndexFetcher(
  client: Client,
  sources: Record<string, NotionSourceConfig>,
  cacheTTL: number = 0 // 0 = no cache
) {
  const cache: SearchIndexCache = {
    indexes: [],
    lastFetchTime: 0,
  };

  return async function getSearchIndexes(): Promise<SearchIndex[]> {
    const now = Date.now();

    // Check if cache is still valid
    if (cache.indexes.length && cacheTTL > 0 && now - cache.lastFetchTime < cacheTTL) {
      console.log("Returning cached search indexes");
      return cache.indexes;
    }

    console.log("Fetching fresh search indexes from Notion");

    try {
      cache.indexes = await buildMultiSourceSearchIndexes(client, sources);
      cache.lastFetchTime = now;
    } catch (error) {
      console.error("Error fetching search indexes:", error);
      cache.indexes = [];
    }

    console.log(`Search indexes count: ${cache.indexes.length}`);
    return cache.indexes;
  };
}
