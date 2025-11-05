import { PostList } from "./post-list";
import { mapNotionPostToBlogPost } from "@/registry/default/notion-blog/lib/notion-mappers";
import type { BlogPost, BlogListProps } from "@/registry/default/notion-blog/types/notion";
import { POSTS_PER_PAGE } from "@/registry/default/notion-blog/lib/constants";

export function BlogList({
  posts,
  tags,
  pageParams,
  isPaginated = false,
  heading = "Latest Posts",
  basePath = "/blog",
}: BlogListProps) {
  const currentPage = isPaginated ? getPageNumber(pageParams) : 1;

  // Map all posts, filtering out any null or invalid posts
  const allBlogPosts = posts
    .map((post) => mapNotionPostToBlogPost(post, tags))
    .filter((post): post is BlogPost => post !== null);

  // Calculate total pages based on all valid posts
  const totalPages = Math.ceil(allBlogPosts.length / POSTS_PER_PAGE);

  // Apply pagination if enabled, otherwise show all posts
  const displayedPosts = isPaginated
    ? allBlogPosts.slice(
        (currentPage - 1) * POSTS_PER_PAGE,
        currentPage * POSTS_PER_PAGE
      )
    : allBlogPosts;

  return (
    <PostList
      posts={displayedPosts}
      currentPage={currentPage}
      totalPages={totalPages}
      heading={heading}
      basePath={basePath}
      disablePagination={!isPaginated}
    />
  );
}

// Helper function to get page number from params
function getPageNumber(pageParams: { slug?: string[] }): number {
  if (!pageParams.slug || pageParams.slug.length === 0) return 1;
  const page = parseInt(pageParams.slug[pageParams.slug.length - 1], 10);
  return isNaN(page) ? 1 : Math.max(1, page);
}
