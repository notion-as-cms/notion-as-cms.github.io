import notionConfig from "@/notion.config";
import { createNotionClient } from "@/registry/default/notion-cms/lib/notion-client";
import { getPostsPerPage } from "@/registry/default/notion-cms/lib/config";
import {
  getPage,
  getPageBySlug,
  getPublishedPosts,
  getTags,
} from "@/registry/default/notion-cms/lib/notion";
import { ContentList } from "@/registry/default/notion-cms/components/content-list";
import { ContentPage } from "@/registry/default/notion-cms/components/content-page";
import { generateStaticParams as generateParams } from "@/registry/default/notion-cms/lib/static-params";
import type { NotionPage, Tag } from "@/registry/default/notion-cms/types/notion";
import {
  isBlogRootPage,
  isBlogPostPage,
  isTagPage,
  isPaginatedTagPage,
  isPaginatedBlogPage,
  getTagSlug,
  getPostSlug,
} from "@/registry/default/notion-cms/lib/page-utils";

// Get the updates source configuration
const source = notionConfig.sources.updates;
const { client, compatClient } = createNotionClient(notionConfig.apiKey);

// Generate static params for this source
export async function generateStaticParams() {
  return generateParams(client, source);
}

// Main page component
export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const { slug = [] } = params;
  const pageParams = { slug };

  // Fetch data using config-based approach
  const postsResponse = await getPublishedPosts(client, source.databaseId);
  const posts = (
    Array.isArray(postsResponse) ? postsResponse : postsResponse.results || []
  ) as NotionPage[];

  // Get tags if tag database is configured
  const tags: Tag[] = source.tagDatabaseId
    ? await getTags(client, source.tagDatabaseId)
    : [];

  const postsPerPage = getPostsPerPage(source);

  // Handle individual page
  if (isBlogPostPage(pageParams)) {
    const postSlug = getPostSlug(pageParams);
    if (!postSlug) {
      return <div className="max-w-3xl mx-auto p-4">Invalid URL</div>;
    }

    const post = await getPageBySlug(client, source.databaseId, postSlug);
    if (!post) {
      return <div className="max-w-3xl mx-auto p-4">Update not found</div>;
    }
    const recordMap = await getPage(compatClient, post.id, tags);
    return <ContentPage recordMap={recordMap} basePath={source.basePath} />;
  }

  // Handle tag pages (both paginated and non-paginated)
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
        pageParams={pageParams}
        isPaginated={true}
        heading={`Updates tagged with: ${tag.label}`}
        basePath={`${source.basePath}/tag/${tag.value}`}
        configuration={{ pageSize: postsPerPage }}
      />
    );
  }

  // Handle root and paginated pages
  if (isBlogRootPage(pageParams) || isPaginatedBlogPage(pageParams)) {
    return (
      <ContentList
        posts={posts}
        tags={tags}
        pageParams={pageParams}
        isPaginated={true}
        heading="Updates"
        basePath={source.basePath}
        configuration={{ pageSize: postsPerPage }}
      />
    );
  }

  // 404 - Not Found
  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-gray-600">The requested page could not be found.</p>
    </div>
  );
}
