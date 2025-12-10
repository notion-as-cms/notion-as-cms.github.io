import { createSearchAPI } from "fumadocs-core/search/server";
import notionConfig from "@/notion.config";
import { createNotionClient } from "@/registry/default/notion-cms/lib/notion-client";
import { createSearchIndexFetcher } from "@/registry/default/notion-cms/lib/search";

// Create client and search index fetcher
const { client } = createNotionClient(notionConfig.apiKey);
const getSearchIndexes = createSearchIndexFetcher(client, notionConfig.sources);

export const revalidate = false;

export const { staticGET: GET } = createSearchAPI("advanced", {
  indexes: () => getSearchIndexes(),
});
