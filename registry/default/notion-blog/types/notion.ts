import type { ExtendedRecordMap, PageBlock } from "notion-types";
import type { PageObjectResponse, DatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints";

type NotionResponse = PageObjectResponse | DatabaseObjectResponse;

export interface Tag {
  id: string;
  value: string;
  label: string;
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

export interface BlogPost {
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

export interface BlogConfiguration {
  pageSize?: number;
  basePath?: string;
}

export interface BlogListProps {
  posts: NotionPage[];
  tags: Tag[];
  pageParams: { slug?: string[] };
  isPaginated: boolean;
  heading?: string;
  basePath?: string;
}

export interface BlogPostProps {
  recordMap: NotionPageWithInfo;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath?: string;
}

export interface PostListProps {
  posts: BlogPost[];
  currentPage: number;
  totalPages: number;
  heading?: string;
  description?: string;
  basePath?: string;
  disablePagination?: boolean;
  configuration?: BlogConfiguration;
}

export interface TableOfContentsProps {
  pageBlock: PageBlock | null;
  recordMap: ExtendedRecordMap;
}
