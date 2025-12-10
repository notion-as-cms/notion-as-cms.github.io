import notionConfig from "@/notion.config";
import { createNotionClient } from "@/registry/default/notion-cms/lib/notion-client";
import { createContentSource } from "@/registry/default/notion-cms/lib/content-page";

const source = notionConfig.sources.updates;
const { client, compatClient } = createNotionClient(notionConfig.apiKey);

const { generateStaticParams, Page } = createContentSource({
  source,
  client,
  compatClient,
  listHeading: "Updates",
  tagHeadingPrefix: "Updates tagged with:",
  contentLabel: "Update",
});

export { generateStaticParams };
export default Page;
