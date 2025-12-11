import type { Client } from "@notionhq/client";
import type { NotionCompatAPI } from "notion-compat";
import type { NotionPage, NotionSourceConfig, Tag, TOCConfig, Author } from "@/components/notion/types";
import { getPage, getPageBySlug, getPublishedPosts, getTags, getAuthors } from "@/lib/notion/notion";
import { generateStaticParams } from "@/lib/notion/static-params";
import { getPostsPerPage } from "@/lib/notion/config";
import { ContentList } from "@/components/notion/content-list";
import { ContentPage } from "@/components/notion/content-page";
import {
  isRootPage,
  isContentPage,
  isTagPage,
  isPaginatedTagPage,
  isPaginatedPage,
  getTagSlug,
  getContentSlug,
} from "@/lib/notion/page-utils";

export interface ContentPageOptions {
  source: NotionSourceConfig;
  client: Client;
  compatClient: NotionCompatAPI;
  /** Heading for the list page (default: "Latest") */
  listHeading?: string;
  /** Heading prefix for tag pages (default: "Tagged with:") */
  tagHeadingPrefix?: string;
  /** Label for content items (default: "Post") */
  contentLabel?: string;
  /** TOC configuration for header offset and mobile positioning */
  tocConfig?: TOCConfig;
  /** Author database ID for resolving author relations */
  authorDatabaseId?: string;
}

/**
 * Creates page handlers for a Notion content source.
 * Returns generateStaticParams and Page component for use in Next.js app router.
 */
export function createContentSource(options: ContentPageOptions) {
  const {
    source,
    client,
    compatClient,
    listHeading = "Latest",
    tagHeadingPrefix = "Tagged with:",
    contentLabel = "Post",
    tocConfig,
    authorDatabaseId,
  } = options;

  // Generate static params for this source
  async function generateParams() {
    return generateStaticParams(client, source);
  }

  // Main page component
  async function Page(props: { params: Promise<{ slug?: string[] }> }) {
    const params = await props.params;
    const { slug = [] } = params;
    const pageParams = { slug };

    // Fetch data
    const postsResponse = await getPublishedPosts(client, source.databaseId);
    const posts = (
      Array.isArray(postsResponse) ? postsResponse : postsResponse.results || []
    ) as NotionPage[];

    const tags: Tag[] = source.tagDatabaseId
      ? await getTags(client, source.tagDatabaseId)
      : [];

    const authors: Author[] = authorDatabaseId
      ? await getAuthors(client, authorDatabaseId)
      : [];

    const postsPerPage = getPostsPerPage(source);

    // Handle individual content page
    if (isContentPage(pageParams)) {
      const contentSlug = getContentSlug(pageParams);
      if (!contentSlug) {
        return <div className="max-w-3xl mx-auto p-4">Invalid URL</div>;
      }

      const post = await getPageBySlug(client, source.databaseId, contentSlug);
      if (!post) {
        return <div className="max-w-3xl mx-auto p-4">{contentLabel} not found</div>;
      }
      const recordMap = await getPage(compatClient, post.id, tags);
      return <ContentPage recordMap={recordMap} basePath={source.basePath} tocConfig={tocConfig} />;
    }

    // Handle tag pages
    if (isTagPage(pageParams) || isPaginatedTagPage(pageParams)) {
      const tagSlug = getTagSlug(pageParams);
      if (!tagSlug) {
        return <div className="max-w-3xl mx-auto p-4">Invalid tag URL</div>;
      }

      const tag = tags.find((t) => t.value === tagSlug);
      if (!tag) {
        return <div className="max-w-3xl mx-auto p-4">Tag not found</div>;
      }

      const taggedPosts = posts.filter((post) => {
        const postTags = post.properties?.Tags?.relation || [];
        return postTags.some((t: { id: string }) => t.id === tag.id);
      });

      return (
        <ContentList
          posts={taggedPosts}
          tags={tags}
          authors={authors}
          pageParams={pageParams}
          isPaginated={true}
          heading={`${tagHeadingPrefix} ${tag.label}`}
          basePath={`${source.basePath}/tag/${tag.value}`}
          configuration={{ pageSize: postsPerPage }}
        />
      );
    }

    // Handle root and paginated pages
    if (isRootPage(pageParams) || isPaginatedPage(pageParams)) {
      return (
        <ContentList
          posts={posts}
          tags={tags}
          authors={authors}
          pageParams={pageParams}
          isPaginated={true}
          heading={listHeading}
          basePath={source.basePath}
          configuration={{ pageSize: postsPerPage }}
        />
      );
    }

    // 404
    return (
      <div className="max-w-3xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">404 - Page Not Found</h1>
        <p className="text-gray-600">The requested page could not be found.</p>
      </div>
    );
  }

  return { generateStaticParams: generateParams, Page };
}
