import {
  createSearchAPI,
  type AdvancedIndex,
} from "fumadocs-core/search/server";
import { getPublishedPosts } from "@/registry/default/notion-blog/lib/notion";

let cachedIndexes: AdvancedIndex[] = [];
let lastFetchTime = 0;
const CACHE_TTL = 0; // 0 = no cache, always fetch fresh (or set to 60000 for 1 minute)

async function getSearchIndexes(): Promise<AdvancedIndex[]> {
  const now = Date.now();

  // Check if cache is still valid
  if (cachedIndexes.length && (now - lastFetchTime) < CACHE_TTL) {
    console.log("Returning cached search indexes");
    return cachedIndexes;
  }

  console.log("Fetching fresh search indexes from Notion");

  try {
    const response = await getPublishedPosts();
    const posts = Array.isArray(response) ? response : response?.results || [];

    cachedIndexes = posts.map((post) => ({
      id: post.id,
      title: post.properties.Name?.title?.[0]?.plain_text || "Untitled",
      description:
        post.properties.Description?.rich_text?.[0]?.plain_text || "",
      keywords: post.properties.Keywords?.rich_text?.[0]?.plain_text || "",
      tag: "blog",
      url: `/blog/${
        post.properties.Slug?.rich_text?.[0]?.plain_text || post.id
      }`,
      structuredData: {
        headline: post.properties.Name?.title?.[0]?.plain_text || "Untitled",
        description:
          post.properties.Description?.rich_text?.[0]?.plain_text || "",
        contents: [],
        headings: [],
      },
    }));

    lastFetchTime = now;
  } catch (error) {
    console.error("Error fetching posts for search index:", error);
    cachedIndexes = [];
  }

  console.log("cachedIndexes count:", cachedIndexes.length);

  return cachedIndexes;
}

export const revalidate = false;

export const { staticGET: GET } = createSearchAPI("advanced", {
  indexes: () => getSearchIndexes(),
});
