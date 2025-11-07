# Notion Blog Registry

This is a shadcn/ui compatible registry for a complete Notion-powered blog system.

## What's Included

**notion-blog** - A comprehensive blog block that includes:

### Components
- `blog-post.tsx` - Full-featured blog post renderer with cover images, tags, and TOC
- `blog-list.tsx` - Blog listing with pagination and filtering
- `post-list.tsx` - Post card layout with metadata
- `pagination.tsx` - Pagination component for navigation
- `renderer.tsx` - Notion content renderer with syntax highlighting

### Library Utilities
- `notion.ts` - Core Notion API client utilities
- `notion-mappers.ts` - Data mapping utilities
- `notion-utils.ts` - Helper functions for Notion blocks
- `page-utils.ts` - URL routing and page type detection
- `static-params.ts` - Static path generation for Next.js
- `constants.ts` - Configuration constants

### Types
- `notion.ts` - TypeScript definitions for all blog components

### App Pages
- `app/blog/[[...slug]]/page.tsx` - Catch-all route handler
- `app/blog/layout.tsx` - Blog layout wrapper

## Usage

Install the complete blog system with a single command:

```bash
npx shadcn@latest add https://notion-as-cms.github.io/r/notion-blog.json
```

This will:
- Install all required dependencies
- Create all components in `components/blog/`
- Add library utilities to `lib/`
- Add type definitions to `types/`
- Create app pages in `app/blog/`
- Generate `.env.example` with required environment variables

## Environment Variables

The following environment variables are required:

- `NOTION_API_KEY` - Your Notion integration API key
- `NOTION_BLOG_DATABASE_ID` - ID of your blog posts database
- `NOTION_TAG_DATABASE_ID` - ID of your tags database

See `.env.example` for detailed setup instructions.

## Building the Registry

To build the registry JSON files:

```bash
npm run registry:build
```

This generates `public/r/notion-blog.json` that can be consumed by the shadcn CLI.

## Development

To watch for changes and rebuild automatically:

```bash
npm run registry:dev
```

## Dependencies

All dependencies are automatically installed:
- @notionhq/client@3.1.1
- notion-compat@7.3.0
- notion-utils@7.3.0
- notion-types@7.3.0
- react-notion-x@7.3.0
- fumadocs-ui@16.0.7
- fumadocs-core@16.0.7
- lucide-react@0.511.0
- prismjs@1.30.0
- @types/prismjs@1.26.5
