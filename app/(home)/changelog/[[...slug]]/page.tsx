/**
 * Example: Changelog page with custom list and page components
 *
 * This demonstrates using both custom ListComponent and PageComponent
 * while still leveraging createContentSource for routing and data fetching.
 */

import notionConfig from "@/notion.config";
import { createNotionClient } from "@/lib/notion/notion-client";
import { createContentSource } from "@/lib/notion/content-page";
import { ChangelogList } from "@/components/notion/examples/changelog-list";
import { ChangelogPage } from "@/components/notion/examples/changelog-page";

const source = notionConfig.sources.changelog;
const { client, compatClient } = createNotionClient(notionConfig.apiKey);

const { generateStaticParams, Page } = createContentSource({
  source,
  client,
  compatClient,
  listHeading: "Changelog",
  contentLabel: "Entry",
  authorDatabaseId: notionConfig.authorDatabaseId,
  // Custom components - uses timeline layout for list, simple layout for detail
  ListComponent: ChangelogList,
  PageComponent: ChangelogPage,
});

export { generateStaticParams };
export default Page;
