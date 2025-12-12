/**
 * Example: News page with custom list component
 *
 * This demonstrates using a card-grid layout for news items
 * while still leveraging createContentSource for routing.
 */

import notionConfig from "@/notion.config";
import { createNotionClient } from "@/lib/notion/notion-client";
import { createContentSource } from "@/lib/notion/content-page";
import { NewsList } from "@/components/notion/examples/news-list";

const source = notionConfig.sources.news;
const { client, compatClient } = createNotionClient(notionConfig.apiKey);

const { generateStaticParams, generateMetadata, Page } = createContentSource({
  source,
  client,
  compatClient,
  listHeading: "News",
  contentLabel: "Article",
  authorDatabaseId: notionConfig.authorDatabaseId,
  siteName: "Notion CMS",
  // Custom component for list pages - uses card grid layout
  ListComponent: NewsList,
});

export { generateStaticParams, generateMetadata };
export default Page;
