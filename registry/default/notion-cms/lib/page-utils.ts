/**
 * Helper functions to determine page types based on URL parameters
 */

type PageParams = { slug?: string[] };

/**
 * Checks if the current route is the root page (no slug)
 */
export function isRootPage(params: PageParams): boolean {
  return !params.slug || params.slug.length === 0;
}

// Alias for backward compatibility
export { isRootPage as isBlogRootPage };

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
 * Checks if the current route is an individual content page (single slug)
 */
export function isContentPage(params: PageParams): boolean {
  return !!params.slug && params.slug.length === 1 && !!params.slug[0];
}

// Alias for backward compatibility
export { isContentPage as isBlogPostPage };

/**
 * Checks if the current route is a paginated list
 */
export function isPaginatedPage(params: PageParams): boolean {
  return (
    !!params.slug &&
    params.slug.length === 2 &&
    params.slug[0] === "page" &&
    !isNaN(Number(params.slug[1]))
  );
}

// Alias for backward compatibility
export { isPaginatedPage as isPaginatedBlogPage };

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
  if (isPaginatedPage(params)) {
    return Number(params.slug?.[1]) || 1;
  }
  if (isPaginatedTagPage(params)) {
    return Number(params.slug?.[3]) || 1;
  }
  return 1;
}

/**
 * Gets the content slug from params if it's a content page
 */
export function getContentSlug(params: PageParams): string | null {
  if (isContentPage(params)) {
    return params.slug?.[0] || null;
  }
  return null;
}

// Alias for backward compatibility
export { getContentSlug as getPostSlug };
