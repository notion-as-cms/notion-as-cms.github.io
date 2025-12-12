import notionConfig from "@/notion.config";
import { createNotionClient } from "@/lib/notion/notion-client";
import { createContentSource } from "@/lib/notion/content-page";

const source = notionConfig.sources.updates;
const { client, compatClient } = createNotionClient(notionConfig.apiKey);

const { generateStaticParams, generateMetadata, Page } = createContentSource({
  source,
  client,
  compatClient,
  listHeading: "Updates",
  tagHeadingPrefix: "Updates tagged with:",
  contentLabel: "Update",
  authorDatabaseId: notionConfig.authorDatabaseId,
  siteName: "Notion CMS",
});

export { generateStaticParams, generateMetadata };
export default Page;
