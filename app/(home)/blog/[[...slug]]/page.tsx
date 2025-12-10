import notionConfig from "@/notion.config";
import { createNotionClient } from "@/registry/default/notion-cms/lib/notion-client";
import { createContentSource } from "@/registry/default/notion-cms/lib/content-page";

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
});

export { generateStaticParams };
export default Page;
