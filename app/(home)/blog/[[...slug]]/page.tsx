import {
  getPage,
  getPageBySlug,
  getPublishedPosts,
  getTags,
} from "@/lib/notion";
import { BlogList } from "@/components/blog/BlogList";
import { BlogPost } from "@/components/blog/BlogPost";
import { notFound } from "next/navigation";
import { generateBlogStaticParams } from "@/lib/static-params";
import { POSTS_PER_PAGE } from "@/lib/constants";
import type { NotionPage } from "@/types/notion";
import {
  isBlogRootPage,
  isBlogPostPage,
  isTagPage,
  isPaginatedTagPage,
  isPaginatedBlogPage,
  getTagSlug,
  getPageNumber,
  getPostSlug,
} from "@/lib/page-utils";

export { generateBlogStaticParams as generateStaticParams };

// Main page component
export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const { slug = [] } = params;
  const postsResponse = await getPublishedPosts();
  const posts = (
    Array.isArray(postsResponse) ? postsResponse : postsResponse.results || []
  ) as NotionPage[];
  const tags = await getTags();
  const pageParams = { slug };

  // Handle blog post page
  if (isBlogPostPage(pageParams)) {
    const postSlug = getPostSlug(pageParams);
    if (!postSlug) {
      return <div className="max-w-3xl mx-auto p-4">Invalid post URL</div>;
    }

    const post = await getPageBySlug(postSlug);
    if (!post) {
      return <div className="max-w-3xl mx-auto p-4">Post not found</div>;
    }
    const recordMap = await getPage(post.id, tags);
    return <BlogPost recordMap={recordMap} />;
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
      <BlogList
        posts={taggedPosts}
        tags={tags}
        pageParams={pageParams}
        isPaginated={true}
        heading={`Posts tagged with: ${tag.label}`}
        basePath={`/blog/tag/${tag.value}`}
      />
    );
  }

  // Handle blog root and paginated blog pages
  if (isBlogRootPage(pageParams) || isPaginatedBlogPage(pageParams)) {
    return (
      <BlogList
        posts={posts}
        tags={tags}
        pageParams={pageParams}
        isPaginated={true}
        heading="Latest Posts"
        basePath="/blog"
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
