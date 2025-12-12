# Notion CMS

Content management powered by Notion.

## Quick Start

1. **Create `notion.config.ts`** in project root (see `examples/notion.config.ts`)

2. **Set environment variables:**
```bash
NOTION_API_KEY=your_token
NOTION_BLOG_DATABASE_ID=your_database_id
```

3. **Create page route** at `app/blog/[[...slug]]/page.tsx` (see `examples/blog-page.tsx`)

4. **Create layout** at `app/blog/layout.tsx` (see `examples/blog-layout.tsx`)

## Notion Database Properties

- `Name` (Title) - Post title
- `Slug` (Text) - URL slug
- `Description` (Text) - Description
- `Date` (Date) - Publish date
- `Published` (Status) - Use "Done" for published
- `Tags` (Relation) - Optional
- `Author` (Relation) - Optional

## SEO Metadata

Export `generateMetadata` for automatic SEO:

```typescript
const { generateStaticParams, generateMetadata, Page } = createContentSource({
  source,
  client,
  compatClient,
  siteName: "My Site",
  baseUrl: "https://example.com",
  // Transform metadata with your own utility
  transformMetadata: (meta) => ({
    ...meta,
    title: `${meta.title} | My Site`,
  }),
});

export { generateStaticParams, generateMetadata };
```

## Custom Components

Pass custom components to `createContentSource`:

```typescript
createContentSource({
  source,
  client,
  compatClient,
  ListComponent: MyCustomList,  // For list pages
  PageComponent: MyCustomPage,  // For detail pages
});
```

See `examples/` folder for custom component examples.

## Primitives

For full control, use functions directly:

- `getPublishedPosts(client, databaseId)`
- `getTags(client, tagDatabaseId)`
- `getAuthors(client, authorDatabaseId)`
- `getPage(compatClient, pageId, tags?)`
- `getPageBySlug(client, databaseId, slug)`
- `mapNotionPageToContentItem(page, tags, basePath, authors)`

See `examples/primitives-example.tsx` for full usage.

## Examples

All examples in `components/notion/examples/`:

| File | Description |
|------|-------------|
| `notion.config.ts` | Config file template |
| `blog-page.tsx` | Default blog route |
| `blog-layout.tsx` | Layout with container |
| `changelog-list.tsx` | Timeline list component |
| `changelog-page.tsx` | Simple detail page |
| `news-list.tsx` | Card grid list |
| `primitives-example.tsx` | Direct primitives usage |
