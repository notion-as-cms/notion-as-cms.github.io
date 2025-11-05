# Notion Blog Registry

This is a shadcn/ui compatible registry for Notion-powered blog components.

## Components

### Blog Components
- **blog-post**: Full-featured blog post renderer with Notion content support
- **blog-list**: Blog list with pagination and filtering
- **post-list**: Post card layout with metadata
- **pagination**: Pagination component for blog navigation
- **renderer**: Notion content renderer with syntax highlighting

### Library Utilities
- **notion**: Core Notion API client utilities
- **notion-mappers**: Data mapping utilities
- **notion-utils**: Helper functions for Notion blocks
- **constants**: Configuration constants

### Types
- **notion-types**: TypeScript definitions for all blog components

## Usage

Users can install these components using the shadcn CLI:

```bash
npx shadcn@latest add https://your-domain.com/r/blog-post.json
```

## Environment Variables

The following environment variables are required:

- `NOTION_API_KEY`: Your Notion integration API key
- `NOTION_BLOG_DATABASE_ID`: ID of your blog posts database
- `NOTION_TAG_DATABASE_ID`: ID of your tags database

See `.env.example` for more details.

## Building the Registry

To build the registry JSON files:

```bash
npm run registry:build
```

This will generate individual JSON files in the `public/r/` directory that can be consumed by the shadcn CLI.

## Development

To watch for changes and rebuild automatically:

```bash
npm run registry:dev
```

## Dependencies

All required dependencies are automatically included when users install components via the shadcn CLI. The main dependencies include:

- @notionhq/client
- notion-compat
- notion-utils
- react-notion-x
- fumadocs-ui
- lucide-react
- prismjs
