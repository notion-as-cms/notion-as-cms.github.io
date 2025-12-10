import type { ExtendedRecordMap, PageBlock } from "notion-types";
import type { PageObjectResponse, DatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints";

type NotionResponse = PageObjectResponse | DatabaseObjectResponse;

// Configuration types for multi-source support
export interface NotionSourceConfig {
  databaseId: string;
  tagDatabaseId?: string;
  basePath: string;
  postsPerPage?: number;
}

export interface NotionConfig {
  apiKey: string;
  // Shared author database - can be used by all sources
  authorDatabaseId?: string;
  sources: Record<string, NotionSourceConfig>;
}

export interface Tag {
  id: string;
  value: string;
  label: string;
}

// Table of Contents entry extracted from Notion headings
export interface TOCEntry {
  id: string;
  text: string;
  level: number; // 1, 2, or 3 for h1, h2, h3
}

export interface PageInfo {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  lastEditedAt: string;
  cover?: string;
  icon?: string | null;
  tags?: Tag[];
}

export type NotionPage = {
  id: string;
  properties: {
    Name?: {
      title: Array<{ plain_text: string }>;
    };
    Description?: {
      rich_text: Array<{ plain_text: string }>;
    };
    Slug?: {
      rich_text: Array<{ plain_text: string }>;
    };
    Date?: {
      date: { start: string };
    };
    Author?: {
      people: Array<{ name: string }>;
    };
    Tags?: {
      relation: Array<{ id: string }>;
    };
    [key: string]: any;
  };
} & (
  | { object: 'page' }
  | { object: 'database' }
  | { object: 'block' }
);

export interface NotionPageWithInfo extends ExtendedRecordMap {
  pageInfo: PageInfo;
  raw: {
    page: PageObjectResponse;
  };
}

// Generic content item (can be blog post, changelog entry, etc.)
export interface ContentItem {
  id: string;
  url: string;
  data: {
    title: string;
    description: string;
    date: string;
    author: string | undefined;
    tags: string[];
  };
}

// Alias for backward compatibility
export type BlogPost = ContentItem;

export interface ContentConfiguration {
  pageSize?: number;
  basePath?: string;
}

// Alias for backward compatibility
export type BlogConfiguration = ContentConfiguration;

export interface ContentListProps {
  posts: NotionPage[];
  tags: Tag[];
  pageParams: { slug?: string[] };
  isPaginated: boolean;
  heading?: string;
  basePath?: string;
  configuration?: ContentConfiguration;
}

// Alias for backward compatibility
export type BlogListProps = ContentListProps;

export interface ContentPageProps {
  recordMap: NotionPageWithInfo;
  basePath?: string;
}

// Alias for backward compatibility
export type BlogPostProps = ContentPageProps;

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath?: string;
}

export interface ItemListProps {
  posts: ContentItem[];
  currentPage: number;
  totalPages: number;
  heading?: string;
  description?: string;
  basePath?: string;
  disablePagination?: boolean;
  configuration?: ContentConfiguration;
}

// Alias for backward compatibility
export type PostListProps = ItemListProps;

export interface TableOfContentsProps {
  pageBlock: PageBlock | null;
  recordMap: ExtendedRecordMap;
}
