import { ItemList } from "./item-list";
import { mapNotionPostToBlogPost } from "@/registry/default/notion-cms/lib/notion-mappers";
import type { ContentItem, ContentListProps } from "@/registry/default/notion-cms/types/notion";
import { DEFAULT_POSTS_PER_PAGE } from "@/registry/default/notion-cms/lib/config";

export function ContentList({
  posts,
  tags,
  pageParams,
  isPaginated = false,
  heading = "Latest Posts",
  basePath = "/blog",
  configuration,
}: ContentListProps) {
  const currentPage = isPaginated ? getPageNumber(pageParams) : 1;
  const postsPerPage = configuration?.pageSize ?? DEFAULT_POSTS_PER_PAGE;

  // Map all posts, filtering out any null or invalid posts
  // Pass basePath to mapper so URLs are generated correctly
  const allBlogPosts = posts
    .map((post) => mapNotionPostToBlogPost(post, tags, basePath))
    .filter((post): post is ContentItem => post !== null);

  // Calculate total pages based on all valid posts
  const totalPages = Math.ceil(allBlogPosts.length / postsPerPage);

  // Apply pagination if enabled, otherwise show all posts
  const displayedPosts = isPaginated
    ? allBlogPosts.slice(
        (currentPage - 1) * postsPerPage,
        currentPage * postsPerPage
      )
    : allBlogPosts;

  return (
    <ItemList
      posts={displayedPosts}
      currentPage={currentPage}
      totalPages={totalPages}
      heading={heading}
      basePath={basePath}
      disablePagination={!isPaginated}
    />
  );
}

// Alias for backward compatibility
export { ContentList as BlogList };

// Helper function to get page number from params
function getPageNumber(pageParams: { slug?: string[] }): number {
  if (!pageParams.slug || pageParams.slug.length === 0) return 1;
  const page = parseInt(pageParams.slug[pageParams.slug.length - 1], 10);
  return isNaN(page) ? 1 : Math.max(1, page);
}
