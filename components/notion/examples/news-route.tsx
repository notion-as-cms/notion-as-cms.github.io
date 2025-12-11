/**
 * Example: News Page Route with Custom List Component
 *
 * Copy this to `app/news/[[...slug]]/page.tsx` in your project.
 * Uses custom NewsList (card grid) component for list, default ContentPage for detail.
 */

import notionConfig from "@/notion.config";
import { createNotionClient } from "@/lib/notion/notion-client";
import { createContentSource } from "@/lib/notion/content-page";
import { NewsList } from "@/components/notion/examples/news-list";

const source = notionConfig.sources.news;
const { client, compatClient } = createNotionClient(notionConfig.apiKey);

const { generateStaticParams, Page } = createContentSource({
  source,
  client,
  compatClient,
  listHeading: "News",
  contentLabel: "Article",
  authorDatabaseId: notionConfig.authorDatabaseId,
  // Custom list component, uses default ContentPage for detail
  ListComponent: NewsList,
});

export { generateStaticParams };
export default Page;
