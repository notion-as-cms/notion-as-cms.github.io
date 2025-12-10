# Notion CMS

A flexible content system powered by Notion. Supports multiple content sources (blog, changelog, updates, etc.) with pagination, tag filtering, syntax highlighting, and full-featured content rendering.

## Installation

```bash
npx shadcn@latest add https://your-registry-url.com/r/notion-cms.json
```

This installs:
- Components in `components/notion/`
- Library utilities in `lib/notion/`
- Type definitions in `types/notion.ts`
- Config file `notion.config.ts`
- Example page at `app/blog/[[...slug]]/page.tsx`

## Setup

### 1. Create a Notion Integration

1. Go to [notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Click **+ New integration**
3. Name it (e.g., "My CMS")
4. Copy the **Internal Integration Token**

### 2. Create Notion Databases

**Content Database** (required) with these properties:
| Property | Type | Notes |
|----------|------|-------|
| Name | title | Page title |
| Description | rich_text | Short summary |
| Slug | rich_text | URL slug |
| Date | date | Publish date |
| Author | people | Optional |
| Tags | relation | Optional, links to Tags database |
| Published | status | Must have "Done" option |

**Tags Database** (optional):
| Property | Type |
|----------|------|
| Name | title |
| Slug | rich_text |

### 3. Share Databases

For each database:
1. Open database in Notion
2. Click **...** → **Add connections**
3. Select your integration

### 4. Get Database IDs

Open each database as a full page and copy the ID from the URL:
```
notion.so/{workspace}/{DATABASE_ID}?v=...
```

### 5. Configure Environment Variables

Create `.env.local`:

```bash
NOTION_API_KEY=secret_xxxxxxxxxxxxx
NOTION_BLOG_DATABASE_ID=xxxxxxxxxxxxx
NOTION_TAG_DATABASE_ID=xxxxxxxxxxxxx  # Optional
```

### 6. Configure notion.config.ts

```typescript
import { defineNotionConfig } from "@/lib/notion/config";

export default defineNotionConfig({
  apiKey: process.env.NOTION_API_KEY!,

  sources: {
    blog: {
      databaseId: process.env.NOTION_BLOG_DATABASE_ID!,
      tagDatabaseId: process.env.NOTION_TAG_DATABASE_ID,
      basePath: "/blog",
      postsPerPage: 6,
    },
  },
});
```

### 7. Add Required Styles

In your global CSS:

```css
@import "react-notion-x/src/styles.css";
@import "prismjs/themes/prism-tomorrow.css";
```

## Usage

### Basic Page Route

The installed page at `app/blog/[[...slug]]/page.tsx` handles:

| Route | Description |
|-------|-------------|
| `/blog` | Content listing (paginated) |
| `/blog/page/2` | Pagination |
| `/blog/{slug}` | Individual content page |
| `/blog/tag/{tag}` | Content filtered by tag |
| `/blog/tag/{tag}/page/2` | Tag pagination |

### Multiple Content Sources

Add more sources to your config:

```typescript
export default defineNotionConfig({
  apiKey: process.env.NOTION_API_KEY!,

  sources: {
    blog: {
      databaseId: process.env.NOTION_BLOG_DATABASE_ID!,
      tagDatabaseId: process.env.NOTION_TAG_DATABASE_ID,
      basePath: "/blog",
      postsPerPage: 6,
    },
    changelog: {
      databaseId: process.env.NOTION_CHANGELOG_DATABASE_ID!,
      basePath: "/changelog",
      postsPerPage: 10,
    },
    updates: {
      databaseId: process.env.NOTION_UPDATES_DATABASE_ID!,
      basePath: "/updates",
      postsPerPage: 5,
    },
  },
});
```

Then create page routes for each source. Example `app/changelog/[[...slug]]/page.tsx`:

```typescript
import notionConfig from "@/notion.config";
import { createNotionClient } from "@/lib/notion/notion-client";
import { createContentSource } from "@/lib/notion/content-page";

const source = notionConfig.sources.changelog;
const { client, compatClient } = createNotionClient(notionConfig.apiKey);

const { generateStaticParams, Page } = createContentSource({
  source,
  client,
  compatClient,
  listHeading: "Changelog",
  tagHeadingPrefix: "Changes tagged with:",
  contentLabel: "Entry",
});

export { generateStaticParams };
export default Page;
```

## Adding Search (Optional)

This component doesn't include search out of the box. To add search with Fumadocs:

### 1. Install Fumadocs

```bash
npm install fumadocs-core
```

### 2. Create Search Utility

Create `lib/notion/search.ts`:

```typescript
import { Client } from "@notionhq/client";
import type { AdvancedIndex } from "fumadocs-core/search/server";
import { getPublishedPosts } from "./notion";
import type { NotionSourceConfig } from "@/types/notion";

export async function buildSearchIndexes(
  client: Client,
  source: NotionSourceConfig
): Promise<AdvancedIndex[]> {
  const response = await getPublishedPosts(client, source.databaseId);
  const posts = Array.isArray(response) ? response : response?.results || [];

  return posts.map((post) => ({
    id: post.id,
    title: post.properties.Name?.title?.[0]?.plain_text || "Untitled",
    description: post.properties.Description?.rich_text?.[0]?.plain_text || "",
    url: `${source.basePath}/${post.properties.Slug?.rich_text?.[0]?.plain_text || post.id}`,
    tag: source.basePath.replace(/^\//, ""),
    structuredData: {
      headline: post.properties.Name?.title?.[0]?.plain_text || "Untitled",
      description: post.properties.Description?.rich_text?.[0]?.plain_text || "",
      contents: [],
      headings: [],
    },
  }));
}

export async function buildMultiSourceSearchIndexes(
  client: Client,
  sources: Record<string, NotionSourceConfig>
): Promise<AdvancedIndex[]> {
  const allIndexes: AdvancedIndex[] = [];
  for (const [name, source] of Object.entries(sources)) {
    const indexes = await buildSearchIndexes(client, source);
    allIndexes.push(...indexes);
  }
  return allIndexes;
}
```

### 3. Create Search API Route

Create `app/api/search/route.ts`:

```typescript
import { createSearchAPI } from "fumadocs-core/search/server";
import notionConfig from "@/notion.config";
import { createNotionClient } from "@/lib/notion/notion-client";
import { buildMultiSourceSearchIndexes } from "@/lib/notion/search";

const { client } = createNotionClient(notionConfig.apiKey);

export const revalidate = false;

export const { staticGET: GET } = createSearchAPI("advanced", {
  indexes: async () => buildMultiSourceSearchIndexes(client, notionConfig.sources),
});
```

## Build & Deploy

```bash
npm run build
```

All content is statically generated at build time. Rebuild to fetch new content from Notion.

## API Reference

### Config Types

```typescript
interface NotionSourceConfig {
  databaseId: string;
  tagDatabaseId?: string;
  basePath: string;
  postsPerPage?: number;
}

interface NotionConfig {
  apiKey: string;
  authorDatabaseId?: string;
  sources: Record<string, NotionSourceConfig>;
}
```

### createContentSource Options

```typescript
interface ContentPageOptions {
  source: NotionSourceConfig;
  client: Client;
  compatClient: NotionCompatAPI;
  listHeading?: string;      // Default: "Latest"
  tagHeadingPrefix?: string; // Default: "Tagged with:"
  contentLabel?: string;     // Default: "Post"
}
```

## Components

| Component | Description |
|-----------|-------------|
| `ContentPage` | Renders a single Notion page with cover, title, tags, content |
| `ContentList` | Handles listing with pagination and tag filtering |
| `ItemList` | Grid/list of content items with cards |
| `Pagination` | Page navigation component |
| `Renderer` | Wraps react-notion-x with syntax highlighting |

## License

MIT
