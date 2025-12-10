import { defineNotionConfig } from "@/registry/default/notion-cms/lib/config";

/**
 * Notion CMS Configuration
 *
 * Define your content sources here. Each source connects to a Notion database
 * and can power a different section of your site (blog, changelog, etc.).
 *
 * Environment Variables Required:
 * - NOTION_API_KEY: Your Notion integration API key
 * - NOTION_BLOG_DATABASE_ID: The ID of your blog posts database
 * - NOTION_TAG_DATABASE_ID: (Optional) The ID of your tags database
 * - NOTION_AUTHOR_DATABASE_ID: (Optional) Shared author database ID
 */
const config = defineNotionConfig({
  apiKey: process.env.NOTION_API_KEY!,

  // Shared author database - used across all content sources
  authorDatabaseId: process.env.NOTION_AUTHOR_DATABASE_ID,

  sources: {
    // Blog source - powers /blog routes
    blog: {
      databaseId: process.env.NOTION_BLOG_DATABASE_ID!,
      tagDatabaseId: process.env.NOTION_TAG_DATABASE_ID,
      basePath: "/blog",
      postsPerPage: 3,
    },

    // Updates source - powers /updates routes
    updates: {
      databaseId: process.env.NOTION_UPDATES_DATABASE_ID!,
      basePath: "/updates",
      postsPerPage: 10,
    },
  },
});

export default config;
