# Notion CMS

A flexible content management system powered by Notion. Build blogs, changelogs, documentation, and more using Notion as your CMS.

## Installation

```bash
pnpm dlx shadcn@latest add https://notion-as-cms.github.io/r/notion-cms.json
```

This installs:
- Components: `components/notion/`
- Library files: `lib/notion/`
- Types: `components/notion/types.ts`

## Setup

### 1. Create Notion Integration

1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Create a new integration
3. Copy the "Internal Integration Token"

### 2. Create Notion Databases

Create a **Content Database** with these properties:
- `Name` (Title) - Post title
- `Slug` (Text) - URL slug
- `Description` (Text) - Post description
- `Date` (Date) - Publish date
- `Published` (Status) - With "Done" status for published posts
- `Tags` (Relation) - Optional, links to Tags database
- `Author` (Relation) - Optional, links to Author database

**Optional: Tags Database**
- `Name` (Title) - Tag label
- `Slug` (Text) - URL-friendly slug

**Optional: Author Database**
- `Name` (Title) - Author name

### 3. Connect Database to Integration

1. Open your Notion database
2. Click "..." → "Connections"
3. Add your integration

### 4. Environment Variables

```bash
NOTION_API_KEY=your_integration_token
NOTION_BLOG_DATABASE_ID=your_database_id
NOTION_TAG_DATABASE_ID=your_tags_database_id      # Optional
NOTION_AUTHOR_DATABASE_ID=your_author_database_id # Optional
```

Get database IDs from the URL: `notion.so/username/DATABASE_ID?v=...`

### 5. Create Configuration File

Create `notion.config.ts` in your project root:

```typescript
import { defineNotionConfig } from "@/lib/notion/config";

const config = defineNotionConfig({
  apiKey: process.env.NOTION_API_KEY!,

  // Optional: Shared author database for all sources
  authorDatabaseId: process.env.NOTION_AUTHOR_DATABASE_ID,

  sources: {
    blog: {
      databaseId: process.env.NOTION_BLOG_DATABASE_ID!,
      tagDatabaseId: process.env.NOTION_TAG_DATABASE_ID,
      basePath: "/blog",
      postsPerPage: 6,
    },
  },
});

export default config;
```

### 6. Create Page Routes

Create your page file at `app/blog/[[...slug]]/page.tsx`:

```typescript
import notionConfig from "@/notion.config";
import { createNotionClient } from "@/lib/notion/notion-client";
import { createContentSource } from "@/lib/notion/content-page";

const source = notionConfig.sources.blog;
const { client, compatClient } = createNotionClient(notionConfig.apiKey);

const { generateStaticParams, generateMetadata, Page } = createContentSource({
  source,
  client,
  compatClient,
  listHeading: "Latest Posts",
  tagHeadingPrefix: "Posts tagged with:",
  contentLabel: "Post",
  authorDatabaseId: notionConfig.authorDatabaseId,
  // SEO metadata options
  siteName: "My Site",
  baseUrl: "https://example.com",
});

export { generateStaticParams, generateMetadata };
export default Page;
```

### 7. Create Layout (Optional)

Create `app/blog/layout.tsx` to control width and styling:

```typescript
import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="container max-w-5xl mx-auto px-4">
      {children}
    </div>
  );
}
```

The components are **width-agnostic** - they expand to fill their container. Control width in your layout.

## SEO Metadata

`createContentSource` returns a `generateMetadata` function for automatic SEO:

```typescript
const { generateStaticParams, generateMetadata, Page } = createContentSource({
  source,
  client,
  compatClient,
  // SEO options
  siteName: "My Site",
  baseUrl: "https://example.com", // For canonical URLs
});

export { generateStaticParams, generateMetadata };
```

Generated metadata includes:
- `title` - From Notion page "Name" property
- `description` - From Notion page "Description" property
- `openGraph` - Title, description, type, site name, cover image
- `twitter` - Card, title, description, images
- `alternates.canonical` - If baseUrl is set

### Custom Metadata Transformation

Use `transformMetadata` to integrate with your own metadata utilities:

```typescript
import { createMetadata } from "@/lib/metadata"; // Your utility

const { generateStaticParams, generateMetadata, Page } = createContentSource({
  source,
  client,
  compatClient,
  siteName: "My Site",
  baseUrl: "https://example.com",
  // Transform metadata before returning
  transformMetadata: (meta) => createMetadata({
    ...meta,
    title: `${meta.title} | My Site`, // Add suffix to all titles
  }),
});

export { generateStaticParams, generateMetadata };
```

The `transformMetadata` function receives the generated metadata and returns modified metadata. This allows you to:
- Add title prefixes/suffixes
- Merge with site-wide defaults
- Add custom og:image generation
- Integrate with metadata utilities like `createMetadata()`

## Custom Components

You have two options for customization:

### Option 1: Pass Custom Components to createContentSource

Create your own list or page component and pass it:

```typescript
// components/my-changelog-list.tsx
import type { CustomListComponentProps } from "@/components/notion/types";
import { Pagination } from "@/components/notion/pagination";

export function MyChangelogList({
  items,
  currentPage,
  totalPages,
  heading,
  basePath,
}: CustomListComponentProps) {
  return (
    <div>
      <h1>{heading}</h1>
      {items.map((item) => (
        <article key={item.id}>
          <h2>{item.data.title}</h2>
          <p>{item.data.description}</p>
          <time>{item.data.date}</time>
        </article>
      ))}
      <Pagination currentPage={currentPage} totalPages={totalPages} basePath={basePath} />
    </div>
  );
}
```

Then use it in your page:

```typescript
// app/changelog/[[...slug]]/page.tsx
import notionConfig from "@/notion.config";
import { createNotionClient } from "@/lib/notion/notion-client";
import { createContentSource } from "@/lib/notion/content-page";
import { MyChangelogList } from "@/components/my-changelog-list";

const source = notionConfig.sources.changelog;
const { client, compatClient } = createNotionClient(notionConfig.apiKey);

const { generateStaticParams, Page } = createContentSource({
  source,
  client,
  compatClient,
  listHeading: "Changelog",
  // Use your custom component
  ListComponent: MyChangelogList,
});

export { generateStaticParams };
export default Page;
```

Available custom component props:

**`CustomListComponentProps`** (for list pages):
- `items: ContentItem[]` - Mapped content items
- `tags: Tag[]` - All available tags
- `currentPage: number` - Current page number
- `totalPages: number` - Total number of pages
- `heading: string` - Page heading
- `basePath: string` - Base URL path

**`CustomPageComponentProps`** (for detail pages):
- `recordMap: NotionPageWithInfo` - Notion page data
- `basePath: string` - Base URL path
- `tocConfig?: TOCConfig` - Table of contents config

### Option 2: Use Primitives Directly (Full Control)

For complete control, skip `createContentSource` and use the primitive functions:

```typescript
// app/my-blog/[[...slug]]/page.tsx
import { Client } from "@notionhq/client";
import { NotionCompatAPI } from "notion-compat";
import {
  getPublishedPosts,
  getTags,
  getAuthors,
  getPage,
  getPageBySlug,
} from "@/lib/notion/notion";
import { mapNotionPageToContentItem } from "@/lib/notion/notion-mappers";

const client = new Client({ auth: process.env.NOTION_API_KEY });
const compatClient = new NotionCompatAPI(client);

export async function generateStaticParams() {
  const response = await getPublishedPosts(client, process.env.NOTION_BLOG_DATABASE_ID!);
  return response.results.map((post: any) => ({
    slug: [post.properties.Slug?.rich_text?.[0]?.plain_text || post.id],
  }));
}

export default async function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug = [] } = await params;

  // Fetch data
  const posts = await getPublishedPosts(client, process.env.NOTION_BLOG_DATABASE_ID!);
  const tags = await getTags(client, process.env.NOTION_TAG_DATABASE_ID!);
  const authors = await getAuthors(client, process.env.NOTION_AUTHOR_DATABASE_ID!);

  // Map to content items
  const items = posts.results
    .map((p: any) => mapNotionPageToContentItem(p, tags, "/my-blog", authors))
    .filter(Boolean);

  // List page
  if (slug.length === 0) {
    return (
      <div>
        {items.map((item) => (
          <article key={item.id}>
            <h2><a href={item.url}>{item.data.title}</a></h2>
            <p>{item.data.description}</p>
          </article>
        ))}
      </div>
    );
  }

  // Detail page
  const post = await getPageBySlug(client, process.env.NOTION_BLOG_DATABASE_ID!, slug[0]);
  if (!post) return <div>Not found</div>;

  const recordMap = await getPage(compatClient, post.id, tags);

  // Use the Renderer component or build your own
  return <YourCustomRenderer recordMap={recordMap} />;
}
```

### Available Primitive Functions

| Function | Description |
|----------|-------------|
| `getPublishedPosts(client, databaseId)` | Fetch all posts with Published="Done" |
| `getTags(client, tagDatabaseId)` | Fetch all tags |
| `getAuthors(client, authorDatabaseId)` | Fetch all authors |
| `getPage(compatClient, pageId, tags?)` | Get full page with recordMap for rendering |
| `getPageBySlug(client, databaseId, slug)` | Find a page by its slug |
| `mapNotionPageToContentItem(page, tags, basePath, authors)` | Map Notion page to ContentItem |

## Multiple Content Sources

Add more sources for different content types:

```typescript
// notion.config.ts
const config = defineNotionConfig({
  apiKey: process.env.NOTION_API_KEY!,
  authorDatabaseId: process.env.NOTION_AUTHOR_DATABASE_ID,

  sources: {
    blog: {
      databaseId: process.env.NOTION_BLOG_DATABASE_ID!,
      tagDatabaseId: process.env.NOTION_TAG_DATABASE_ID,
      basePath: "/blog",
      postsPerPage: 6,
    },
    changelog: {
      databaseId: process.env.NOTION_CHANGELOGS_DATABASE_ID!,
      basePath: "/changelog",
      postsPerPage: 10,
    },
    news: {
      databaseId: process.env.NOTION_NEWS_DATABASE_ID!,
      basePath: "/news",
      postsPerPage: 6,
    },
  },
});
```

## Routes Generated

For each source with `basePath: "/blog"`:

| Route | Description |
|-------|-------------|
| `/blog` | List page (paginated) |
| `/blog/page/2` | Page 2 of list |
| `/blog/[slug]` | Individual post |
| `/blog/tag/[tag]` | Posts by tag |
| `/blog/tag/[tag]/page/2` | Tag page 2 |

## API Reference

### `defineNotionConfig(config)`
Creates a typed configuration object.

### `createContentSource(options)`
Returns `{ generateStaticParams, generateMetadata, Page }` for use in Next.js App Router.

Options:
- `source` - Source config from `notionConfig.sources`
- `client` - Notion client
- `compatClient` - Notion compat client
- `listHeading` - Heading for list page (default: "Latest")
- `tagHeadingPrefix` - Prefix for tag pages (default: "Tagged with:")
- `contentLabel` - Label for content type (default: "Post")
- `authorDatabaseId` - Optional author database ID
- `tocConfig` - Optional table of contents configuration
- `ListComponent` - Custom component for list pages
- `PageComponent` - Custom component for detail pages
- `siteName` - Site name for og:site_name
- `baseUrl` - Base URL for canonical URLs and OG images
- `transformMetadata` - Transform metadata before returning (for custom metadata utilities)

### `createNotionClient(apiKey)`
Returns `{ client, compatClient }` for Notion API access.

## Search Integration (Optional)

If using [Fumadocs](https://fumadocs.dev) for search:

```typescript
// app/api/search/route.ts
import { createSearchIndexFetcher } from "@/lib/notion/search";
import notionConfig from "@/notion.config";
import { createNotionClient } from "@/lib/notion/notion-client";
import { createSearchAPI } from "fumadocs-core/search/server";

const { client } = createNotionClient(notionConfig.apiKey);

export const { GET } = createSearchAPI("advanced", {
  indexes: createSearchIndexFetcher(client, notionConfig),
});
```

## Development

```bash
pnpm dev
```

## Build

```bash
pnpm build
```

Content is fetched at build time. Run `pnpm build` to refresh content from Notion.
