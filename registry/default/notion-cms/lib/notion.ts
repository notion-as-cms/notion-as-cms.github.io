import { Client } from "@notionhq/client";
import { NotionCompatAPI } from "notion-compat";
import { getPageTableOfContents } from "notion-utils";
import {
  PageObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";
import type { PageInfo, Tag, TOCEntry } from "@/registry/default/notion-cms/types/notion";
import { findPageBlock } from "./notion-utils";

/**
 * Get a full page with content for rendering.
 * Uses NotionCompatAPI to get the ExtendedRecordMap format needed by react-notion-x.
 */
export const getPage = async (
  compatClient: NotionCompatAPI,
  pageId: string,
  allTags?: Tag[]
) => {
  const recordMap = await compatClient.getPage(pageId);
  const rawPage = (recordMap as any).raw?.page;
  const properties = rawPage?.properties || {};

  // Extract common page properties
  const pageInfo: PageInfo = {
    id: rawPage?.id || "",
    title: properties?.Name?.title?.[0]?.plain_text || "No title",
    description: properties?.Description?.rich_text?.[0]?.plain_text || "",
    createdAt: rawPage?.created_time || "",
    lastEditedAt: rawPage?.last_edited_time || "",
    cover:
      rawPage?.cover?.type === "external"
        ? rawPage.cover.external.url
        : rawPage?.cover?.file?.url,
    icon:
      rawPage?.icon?.type === "emoji"
        ? rawPage.icon.emoji
        : rawPage?.icon?.file?.url || null,
  };

  // Process tags if provided
  let blogTags: Tag[] = [];
  if (rawPage && allTags) {
    const tagIds = properties?.Tags?.relation?.map((r: any) => r.id) || [];
    blogTags = allTags.filter((tag) => tagIds.includes(tag.id));
  }

  // Extract table of contents from headings
  let toc: TOCEntry[] = [];
  try {
    const pageBlock = findPageBlock(recordMap);
    if (pageBlock) {
      const rawToc = getPageTableOfContents(pageBlock, recordMap);
      toc = rawToc.map((item) => ({
        id: item.id,
        text: item.text,
        level: item.indentLevel + 1, // Convert 0,1,2 to 1,2,3 for h1,h2,h3
      }));
    }
  } catch (error) {
    console.error("Error extracting TOC:", error);
  }

  return {
    ...recordMap,
    pageInfo: {
      ...pageInfo,
      tags: blogTags,
      cover: pageInfo.cover,
      toc,
    },
    raw: {
      ...(recordMap as any).raw,
      page: rawPage,
    },
  } as typeof recordMap & {
    pageInfo: PageInfo & { toc: TOCEntry[] };
    raw: {
      page: PageObjectResponse;
    };
  };
};

/**
 * Get all tags from a tags database.
 */
export async function getTags(
  client: Client,
  tagDatabaseId: string
): Promise<Tag[]> {
  const response = await client.databases.query({
    database_id: tagDatabaseId,
  });

  return response.results.map((page: any) => ({
    id: page.id,
    value: page.properties.Slug.rich_text[0]?.plain_text || "",
    label: page.properties.Name.title[0]?.plain_text || "",
  }));
}

/**
 * Get all published posts from a database.
 * Filters by Published status = "Done".
 */
export async function getPublishedPosts(client: Client, databaseId: string) {
  return client.databases.query({
    database_id: databaseId,
    filter: {
      property: "Published",
      status: { equals: "Done" },
    },
  });
}

/**
 * Get a page by its slug from a database.
 */
export async function getPageBySlug(
  client: Client,
  databaseId: string,
  slug: string
) {
  const response = await client.databases.query({
    database_id: databaseId,
    filter: {
      property: "Slug",
      rich_text: { equals: slug },
    },
  });
  return response.results[0];
}

/**
 * Extract page info from a PageObjectResponse.
 */
export function getPageInfo(page: PageObjectResponse): PageInfo {
  const properties = page.properties;

  const getIconUrl = () => {
    if (!page.icon) return null;

    switch (page.icon.type) {
      case "emoji":
        return page.icon.emoji;
      case "external":
        return page.icon.external.url;
      case "file":
        return page.icon.file.url;
      default:
        return null;
    }
  };

  return {
    id: page.id,
    title:
      properties?.Name?.type === "title"
        ? getPlainText(properties.Name.title)
        : "No title",
    description:
      properties?.Description?.type === "rich_text"
        ? getPlainText(properties.Description.rich_text)
        : "",
    createdAt: page.created_time,
    lastEditedAt: page.last_edited_time,
    cover:
      page.cover?.type === "external"
        ? page.cover.external.url
        : (page.cover as any)?.file?.url,
    icon: getIconUrl(),
  };
}

/**
 * Extract plain text from rich text array.
 */
export function getPlainText(rich: RichTextItemResponse[]): string {
  return rich.map((v) => v.plain_text).join();
}
