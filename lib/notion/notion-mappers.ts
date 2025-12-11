import type { Author, ContentItem, NotionPage, Tag } from "@/components/notion/types";

export function isNotionPage(page: any): page is NotionPage {
  return page && typeof page === "object" && "properties" in page;
}

/**
 * Map a Notion page to a ContentItem object.
 * @param page - The Notion page object
 * @param tags - Available tags to resolve tag relations
 * @param basePath - Base path for the content URL (e.g., '/blog', '/changelog')
 * @param authors - Optional authors map to resolve author relations
 */
export function mapNotionPageToContentItem(
  page: any,
  tags: Tag[] = [],
  basePath: string = "/blog",
  authors: Author[] = []
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

  // Author can be either a "people" property or a "relation" to an Author database
  let author: string | undefined;
  if (page.properties.Author?.people?.[0]?.name) {
    // People type
    author = page.properties.Author.people[0].name;
  } else if (page.properties.Author?.relation?.[0]?.id) {
    // Relation type - look up in authors array
    const authorId = page.properties.Author.relation[0].id;
    const foundAuthor = authors.find((a) => a.id === authorId);
    author = foundAuthor?.name;
  }

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
