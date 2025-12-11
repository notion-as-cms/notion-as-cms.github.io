import notionConfig from "@/notion.config";
import { createNotionClient } from "@/lib/notion/notion-client";
import { createContentSource } from "@/lib/notion/content-page";

const source = notionConfig.sources.blog;
const { client, compatClient } = createNotionClient(notionConfig.apiKey);

const { generateStaticParams, Page } = createContentSource({
  source,
  client,
  compatClient,
  listHeading: "Latest Posts",
  tagHeadingPrefix: "Posts tagged with:",
  contentLabel: "Post",
  tocConfig: {
    mobileTopClass: "top-14",
  },
  authorDatabaseId: notionConfig.authorDatabaseId,
});

export { generateStaticParams };
export default Page;
