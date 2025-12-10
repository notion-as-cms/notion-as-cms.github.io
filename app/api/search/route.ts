import { createSearchAPI } from "fumadocs-core/search/server";
import notionConfig from "@/notion.config";
import { createNotionClient } from "@/lib/notion/notion-client";
import { createSearchIndexFetcher } from "@/lib/notion/search";

const { client } = createNotionClient(notionConfig.apiKey);
const getSearchIndexes = createSearchIndexFetcher(client, notionConfig.sources);

export const revalidate = false;

export const { staticGET: GET } = createSearchAPI("advanced", {
  indexes: () => getSearchIndexes(),
});
