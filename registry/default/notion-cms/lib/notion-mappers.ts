import type { ContentItem, NotionPage, Tag } from "@/registry/default/notion-cms/types/notion";

export function isNotionPage(page: any): page is NotionPage {
  return page && typeof page === "object" && "properties" in page;
}

/**
 * Map a Notion page to a ContentItem object.
 * @param page - The Notion page object
 * @param tags - Available tags to resolve tag relations
 * @param basePath - Base path for the content URL (e.g., '/blog', '/changelog')
 */
export function mapNotionPageToContentItem(
  page: any,
  tags: Tag[] = [],
  basePath: string = "/blog"
): ContentItem | null {
  if (!isNotionPage(page)) return null;

  const tagIds = page.properties.Tags?.relation?.map((r: any) => r.id) || [];
  const pageTags = tags
    .filter((tag) => tagIds.includes(tag.id))
    .map((tag) => tag.label);

  const title = page.properties.Name?.title?.[0]?.plain_text || "Untitled";
  const description =
    page.properties.Description?.rich_text?.[0]?.plain_text || "";
  const date = page.properties.Date?.date?.start || new Date().toISOString();
  const author = page.properties.Author?.people?.[0]?.name;
  const slug = page.properties.Slug?.rich_text?.[0]?.plain_text || page.id;

  // Ensure required fields are present
  if (!title || !description || !date) {
    console.warn(`Skipping page ${page.id} due to missing required fields`);
    return null;
  }

  return {
    id: page.id,
    url: `${basePath}/${slug}`,
    data: {
      title,
      description,
      date,
      author,
      tags: pageTags,
    },
  };
}

// Alias for backward compatibility
export { mapNotionPageToContentItem as mapNotionPostToBlogPost };
