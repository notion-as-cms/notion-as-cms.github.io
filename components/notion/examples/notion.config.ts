/**
 * Example: Notion CMS Configuration
 *
 * Copy this file to your project root as `notion.config.ts`
 * and customize the sources for your needs.
 */

import { defineNotionConfig } from "@/lib/notion/config";

const config = defineNotionConfig({
  apiKey: process.env.NOTION_API_KEY!,

  // Optional: Shared author database for all sources
  authorDatabaseId: process.env.NOTION_AUTHOR_DATABASE_ID,

  sources: {
    // Blog source - powers /blog routes
    blog: {
      databaseId: process.env.NOTION_BLOG_DATABASE_ID!,
      tagDatabaseId: process.env.NOTION_TAG_DATABASE_ID,
      basePath: "/blog",
      postsPerPage: 6,
    },

    // Changelog source - powers /changelog routes
    changelog: {
      databaseId: process.env.NOTION_CHANGELOGS_DATABASE_ID!,
      basePath: "/changelog",
      postsPerPage: 10,
    },

    // News source - powers /news routes
    news: {
      databaseId: process.env.NOTION_NEWS_DATABASE_ID!,
      basePath: "/news",
      postsPerPage: 6,
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
