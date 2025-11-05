// lib/notion.ts
import { Client } from "@notionhq/client";
import { NotionCompatAPI } from "notion-compat";
import {
  PageObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";
import type { PageInfo, Tag } from "@/types/notion";

export const notion = new Client({ auth: process.env.NOTION_API_KEY });

export const notionCustom = new NotionCompatAPI(notion);

export const getPage = async (pageId: string, allTags?: Tag[]) => {
  const recordMap = await notionCustom.getPage(pageId);
  const rawPage = (recordMap as any).raw?.page;
  const properties = rawPage?.properties || {};

  console.log("rawPage", rawPage);

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

  return {
    ...recordMap,
    pageInfo: {
      ...pageInfo,
      tags: blogTags, // Include tags in the page info
      cover: pageInfo.cover, // Include cover URL
    },
    raw: {
      ...(recordMap as any).raw,
      page: rawPage,
    },
  } as typeof recordMap & {
    pageInfo: PageInfo;
    raw: {
      page: PageObjectResponse;
    };
  };
};

export async function getTags(): Promise<Tag[]> {
  const response = await notion.databases.query({
    database_id: process.env.NOTION_TAG_DATABASE_ID!,
  });

  return response.results.map((page: any) => ({
    id: page.id,
    value: page.properties.Slug.rich_text[0]?.plain_text || "",
    label: page.properties.Name.title[0]?.plain_text || "",
  }));
}

export async function getPublishedPosts() {
  return notion.databases.query({
    database_id: process.env.NOTION_BLOG_DATABASE_ID!,
    filter: {
      property: "Published",
      status: { equals: "Done" },
    },
  });
}

export async function getPageBySlug(slug: string) {
  const response = await notion.databases.query({
    database_id: process.env.NOTION_BLOG_DATABASE_ID!,
    filter: {
      property: "Slug",
      rich_text: { equals: slug },
    },
  });
  return response.results[0];
}

export function getPageInfo(page: PageObjectResponse): PageInfo {
  const properties = page.properties;

  // Helper to get icon URL
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
        : (page.cover as any)?.file?.url, // Type assertion as cover type is complex
    icon: getIconUrl(),
  };
}

export function getPlainText(rich: RichTextItemResponse[]): string {
  return rich.map((v) => v.plain_text).join();
}
