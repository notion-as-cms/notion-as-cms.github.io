import type { NotionConfig, NotionSourceConfig } from "@/registry/default/notion-cms/types/notion";

/**
 * Define your Notion configuration with multiple content sources.
 * Each source can power a different section of your site (blog, changelog, etc.)
 */
export function defineNotionConfig(config: NotionConfig): NotionConfig {
  // Validate required fields
  if (!config.apiKey) {
    throw new Error("Notion API key is required");
  }

  if (!config.sources || Object.keys(config.sources).length === 0) {
    throw new Error("At least one source must be defined");
  }

  // Validate each source
  for (const [name, source] of Object.entries(config.sources)) {
    if (!source.databaseId) {
      throw new Error(`Source "${name}" is missing required databaseId`);
    }
    if (!source.basePath) {
      throw new Error(`Source "${name}" is missing required basePath`);
    }
  }

  return config;
}

/**
 * Get a specific source configuration by name
 */
export function getSource(config: NotionConfig, name: string): NotionSourceConfig {
  const source = config.sources[name];
  if (!source) {
    throw new Error(
      `Source "${name}" not found. Available sources: ${Object.keys(config.sources).join(", ")}`
    );
  }
  return source;
}

/**
 * Default posts per page if not specified in source config
 */
export const DEFAULT_POSTS_PER_PAGE = 3;

/**
 * Get posts per page for a source, falling back to default
 */
export function getPostsPerPage(source: NotionSourceConfig): number {
  return source.postsPerPage ?? DEFAULT_POSTS_PER_PAGE;
}
