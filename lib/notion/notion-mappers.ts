import type {
  Author,
  ContentItem,
  NotionPage,
  Tag,
} from "@/components/notion/types";

/**
 * Type guard to check if an object is a valid Notion page.
 */
export function isNotionPage(page: unknown): page is NotionPage {
  return page !== null && typeof page === "object" && "properties" in page;
}

/**
 * Extract cover image URL from a Notion page.
 * Cover can be external URL or uploaded file.
 */
function getCoverUrl(page: NotionPage): string | undefined {
  const cover = (page as { cover?: { type: string; external?: { url: string }; file?: { url: string } } }).cover;
  if (!cover) return undefined;

  if (cover.type === "external" && cover.external?.url) {
    return cover.external.url;
  }
  if (cover.type === "file" && cover.file?.url) {
    return cover.file.url;
  }
  return undefined;
}

/**
 * Extract author name(s) from a Notion page.
 * Author can be either a "people" property or a "relation" to an Author database.
 * Supports multiple authors, joined by comma.
 */
function getAuthor(page: NotionPage, authors: Author[]): string | undefined {
  const authorProp = page.properties.Author;
  if (!authorProp) return undefined;

  // People type - join all names
  if (authorProp.people && authorProp.people.length > 0) {
    const names = authorProp.people
      .map((p) => p.name)
      .filter((name): name is string => Boolean(name));
    return names.length > 0 ? names.join(", ") : undefined;
  }

  // Relation type - look up all authors in authors array
  if (authorProp.relation && authorProp.relation.length > 0) {
    const names = authorProp.relation
      .map((r) => authors.find((a) => a.id === r.id)?.name)
      .filter((name): name is string => Boolean(name));
    return names.length > 0 ? names.join(", ") : undefined;
  }

  return undefined;
}

/**
 * Map a Notion page to a ContentItem object.
 * @param page - The Notion page object
 * @param tags - Available tags to resolve tag relations
 * @param basePath - Base path for the content URL (e.g., '/blog', '/changelog')
 * @param authors - Optional authors array to resolve author relations
 */
export function mapNotionPageToContentItem(
  page: unknown,
  tags: Tag[] = [],
  basePath: string = "/blog",
  authors: Author[] = []
): ContentItem | null {
  if (!isNotionPage(page)) return null;

  // Extract tag IDs and resolve to labels
  const tagIds = page.properties.Tags?.relation?.map((r) => r.id) ?? [];
  const pageTags = tags
    .filter((tag) => tagIds.includes(tag.id))
    .map((tag) => tag.label);

  // Extract basic properties
  const title = page.properties.Name?.title?.[0]?.plain_text ?? "Untitled";
  const description = page.properties.Description?.rich_text?.[0]?.plain_text ?? "";
  const date = page.properties.Date?.date?.start ?? new Date().toISOString();
  const slug = page.properties.Slug?.rich_text?.[0]?.plain_text ?? page.id;

  // Extract author and cover
  const author = getAuthor(page, authors);
  const cover = getCoverUrl(page);

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
      cover,
    },
  };
}

// Alias for backward compatibility
export { mapNotionPageToContentItem as mapNotionPostToBlogPost };
