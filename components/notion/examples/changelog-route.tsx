/**
 * Example: Changelog Page Route with Custom Components
 *
 * Copy this to `app/changelog/[[...slug]]/page.tsx` in your project.
 * Uses custom ChangelogList (timeline) and ChangelogPage (simple) components.
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
  // Custom components for different layout
  ListComponent: ChangelogList,
  PageComponent: ChangelogPage,
});

export { generateStaticParams };
export default Page;
