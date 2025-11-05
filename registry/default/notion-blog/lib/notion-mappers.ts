import type { BlogPost, NotionPage, Tag } from "@/types/notion";

export function isNotionPage(page: any): page is NotionPage {
  return page && typeof page === "object" && "properties" in page;
}

export function mapNotionPostToBlogPost(post: any, tags: Tag[] = []): BlogPost | null {
  if (!isNotionPage(post)) return null;

  const tagIds = post.properties.Tags?.relation?.map((r: any) => r.id) || [];
  const postTags = tags
    .filter(tag => tagIds.includes(tag.id))
    .map(tag => tag.label);

  const title = post.properties.Name?.title?.[0]?.plain_text || 'Untitled';
  const description = post.properties.Description?.rich_text?.[0]?.plain_text || '';
  const date = post.properties.Date?.date?.start || new Date().toISOString();
  const author = post.properties.Author?.people?.[0]?.name;

  // Ensure required fields are present
  if (!title || !description || !date) {
    console.warn(`Skipping post ${post.id} due to missing required fields`);
    return null;
  }

  return {
    id: post.id,
    url: `/blog/${post.properties.Slug?.rich_text?.[0]?.plain_text || post.id}`,
    data: {
      title,
      description,
      date,
      author,
      tags: postTags,
    },
  };
}
