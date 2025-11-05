/**
 * Helper functions to determine page types based on URL parameters
 */

type PageParams = { slug?: string[] };

/**
 * Checks if the current route is the blog root page
 */
export function isBlogRootPage(params: PageParams): boolean {
  return !params.slug || params.slug.length === 0;
}

/**
 * Checks if the current route is a tag page
 */
export function isTagPage(params: PageParams): boolean {
  return (
    !!params.slug &&
    params.slug.length >= 2 &&
    params.slug[0] === "tag" &&
    !!params.slug[1]
  );
}

/**
 * Checks if the current route is a paginated tag page
 */
export function isPaginatedTagPage(params: PageParams): boolean {
  return (
    !!params.slug &&
    params.slug.length === 4 &&
    params.slug[0] === "tag" &&
    !!params.slug[1] &&
    params.slug[2] === "page" &&
    !isNaN(Number(params.slug[3]))
  );
}

/**
 * Checks if the current route is a blog post page
 */
export function isBlogPostPage(params: PageParams): boolean {
  return !!params.slug && params.slug.length === 1 && !!params.slug[0];
}

/**
 * Checks if the current route is a paginated blog list
 */
export function isPaginatedBlogPage(params: PageParams): boolean {
  return (
    !!params.slug &&
    params.slug.length === 2 &&
    params.slug[0] === "page" &&
    !isNaN(Number(params.slug[1]))
  );
}

/**
 * Gets the tag slug from params if it's a tag page
 */
export function getTagSlug(params: PageParams): string | null {
  if (isTagPage(params) || isPaginatedTagPage(params)) {
    return params.slug?.[1] || null;
  }
  return null;
}

/**
 * Gets the page number from params if it's a paginated page
 */
export function getPageNumber(params: PageParams): number {
  if (isPaginatedBlogPage(params)) {
    return Number(params.slug?.[1]) || 1;
  }
  if (isPaginatedTagPage(params)) {
    return Number(params.slug?.[3]) || 1;
  }
  return 1;
}

/**
 * Gets the post slug from params if it's a blog post page
 */
export function getPostSlug(params: PageParams): string | null {
  if (isBlogPostPage(params)) {
    return params.slug?.[0] || null;
  }
  return null;
}
