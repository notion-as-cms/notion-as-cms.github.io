import type { Client } from "@notionhq/client";
import type { NotionCompatAPI } from "notion-compat";
import type { ComponentType } from "react";
import type { Metadata } from "next";
import type {
  NotionPage,
  NotionSourceConfig,
  Tag,
  TOCConfig,
  Author,
  CustomListComponentProps,
  CustomPageComponentProps,
  ContentItem,
} from "@/components/notion/types";
import { getPage, getPageBySlug, getPublishedPosts, getTags, getAuthors } from "@/lib/notion/notion";
import { generateStaticParams } from "@/lib/notion/static-params";
import { getPostsPerPage } from "@/lib/notion/config";
import { ContentList } from "@/components/notion/content-list";
import { ContentPage } from "@/components/notion/content-page";
import { mapNotionPageToContentItem } from "@/lib/notion/notion-mappers";
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
  /** Custom component for list pages (replaces default ContentList) */
  ListComponent?: ComponentType<CustomListComponentProps>;
  /** Custom component for detail pages (replaces default ContentPage) */
  PageComponent?: ComponentType<CustomPageComponentProps>;
  /** Site name for metadata (used in og:site_name) */
  siteName?: string;
  /** Base URL for canonical URLs and OG images */
  baseUrl?: string;
  /** Base path for OG image generation (e.g., "blog-og" for /blog-og/[slug]/image.png) */
  ogImageBase?: string;
  /**
   * Transform metadata before returning. Use this to integrate with your own
   * metadata utilities like createMetadata().
   *
   * @example
   * transformMetadata: (meta) => createMetadata({
   *   ...meta,
   *   title: `${meta.title} | My Site`,
   * })
   */
  transformMetadata?: (metadata: Metadata) => Metadata;
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
    ListComponent,
    PageComponent,
    siteName,
    baseUrl,
    ogImageBase,
    transformMetadata = (m) => m, // Default: pass through unchanged
  } = options;

  // Helper to generate OG image URLs
  const getOgImageUrl = (slugParts: string[] = []): string | undefined => {
    if (!ogImageBase) return undefined;
    const slugPath = slugParts.length > 0 ? `/${slugParts.join("/")}` : "";
    return `/${ogImageBase}${slugPath}/image.png`;
  };

  // Helper to format image metadata
  const getImageMetadata = (url: string) => ({
    url,
    width: 1200,
    height: 630,
    alt: siteName || "MFStack",
  });

  // Generate static params for this source
  async function generateParams() {
    return generateStaticParams(client, source);
  }

  // Generate metadata for SEO
  async function generateMeta(props: {
    params: Promise<{ slug?: string[] }>;
  }): Promise<Metadata> {
    const params = await props.params;
    const { slug = [] } = params;
    const pageParams = { slug };

    // List page metadata
    if (isRootPage(pageParams) || isPaginatedPage(pageParams)) {
      const pageNum = isPaginatedPage(pageParams)
        ? parseInt(slug[slug.length - 1], 10)
        : 1;
      const title = pageNum > 1 ? `${listHeading} - Page ${pageNum}` : listHeading;
      const ogImageUrl = getOgImageUrl();
      const description = `Browse all ${contentLabel.toLowerCase()}s`;
      const canonical = baseUrl ? `${baseUrl}${source.basePath}${pageNum > 1 ? `/page/${pageNum}` : ""}` : undefined;

      return transformMetadata({
        title,
        description,
        openGraph: {
          title,
          description,
          type: "website",
          siteName,
          images: ogImageUrl ? [getImageMetadata(ogImageUrl)] : undefined,
        },
        twitter: {
          card: "summary_large_image",
          title,
          description,
          images: ogImageUrl ? [ogImageUrl] : undefined,
        },
        alternates: canonical ? { canonical } : undefined,
      });
    }

    // Tag page metadata
    if (isTagPage(pageParams) || isPaginatedTagPage(pageParams)) {
      const tagSlug = getTagSlug(pageParams);
      const tags = source.tagDatabaseId
        ? await getTags(client, source.tagDatabaseId)
        : [];
      const tag = tags.find((t) => t.value === tagSlug);
      const tagName = tag?.label ?? tagSlug;
      const title = `${tagHeadingPrefix} ${tagName}`;
      const description = `${contentLabel}s tagged with ${tagName}`;
      const ogImageUrl = getOgImageUrl(["tag", tagSlug]);
      const canonical = baseUrl ? `${baseUrl}${source.basePath}/tag/${tagSlug}` : undefined;

      return transformMetadata({
        title,
        description,
        openGraph: {
          title,
          description,
          type: "website",
          siteName,
          images: ogImageUrl ? [getImageMetadata(ogImageUrl)] : undefined,
        },
        twitter: {
          card: "summary_large_image",
          title,
          description,
          images: ogImageUrl ? [ogImageUrl] : undefined,
        },
        alternates: canonical ? { canonical } : undefined,
      });
    }

    // Content page metadata
    if (isContentPage(pageParams)) {
      const contentSlug = getContentSlug(pageParams);
      if (!contentSlug) {
        return transformMetadata({ title: "Not Found" });
      }

      const post = await getPageBySlug(client, source.databaseId, contentSlug);
      if (!post) {
        return transformMetadata({ title: `${contentLabel} Not Found` });
      }

      const title = (post as NotionPage).properties?.Name?.title?.[0]?.plain_text ?? "Untitled";
      const description = (post as NotionPage).properties?.Description?.rich_text?.[0]?.plain_text ?? "";
      const cover = (post as { cover?: { external?: { url: string }; file?: { url: string } } }).cover;
      const coverUrl = cover?.external?.url ?? cover?.file?.url;

      const canonical = baseUrl ? `${baseUrl}${source.basePath}/${contentSlug}` : undefined;

      // Prefer generated OG image over cover image
      const ogImageUrl = getOgImageUrl([contentSlug]);
      const imageUrl = ogImageUrl || coverUrl;

      return transformMetadata({
        title,
        description,
        openGraph: {
          title,
          description,
          type: "article",
          siteName,
          images: imageUrl ? [ogImageUrl ? getImageMetadata(imageUrl) : { url: imageUrl }] : undefined,
        },
        twitter: {
          card: imageUrl ? "summary_large_image" : "summary",
          title,
          description,
          images: imageUrl ? [imageUrl] : undefined,
        },
        alternates: canonical ? { canonical } : undefined,
      });
    }

    return transformMetadata({ title: listHeading });
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

    // Helper to map posts to content items
    const mapPosts = (postsToMap: NotionPage[]): ContentItem[] =>
      postsToMap
        .map((p) => mapNotionPageToContentItem(p, tags, source.basePath, authors))
        .filter((item): item is ContentItem => item !== null);

    // Helper to get pagination info
    const getPageNumber = (params: { slug?: string[] }): number => {
      if (!params.slug || params.slug.length === 0) return 1;
      const page = parseInt(params.slug[params.slug.length - 1], 10);
      return isNaN(page) ? 1 : Math.max(1, page);
    };

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

      // Use custom component if provided
      if (PageComponent) {
        return <PageComponent recordMap={recordMap} basePath={source.basePath} tocConfig={tocConfig} />;
      }
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

      // Use custom component if provided
      if (ListComponent) {
        const items = mapPosts(taggedPosts);
        const currentPage = getPageNumber(pageParams);
        const totalPages = Math.ceil(items.length / postsPerPage);
        return (
          <ListComponent
            items={items.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage)}
            tags={tags}
            currentPage={currentPage}
            totalPages={totalPages}
            heading={`${tagHeadingPrefix} ${tag.label}`}
            basePath={`${source.basePath}/tag/${tag.value}`}
          />
        );
      }

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
      // Use custom component if provided
      if (ListComponent) {
        const items = mapPosts(posts);
        const currentPage = getPageNumber(pageParams);
        const totalPages = Math.ceil(items.length / postsPerPage);
        return (
          <ListComponent
            items={items.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage)}
            tags={tags}
            currentPage={currentPage}
            totalPages={totalPages}
            heading={listHeading}
            basePath={source.basePath}
          />
        );
      }

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

  return { generateStaticParams: generateParams, generateMetadata: generateMeta, Page };
}
