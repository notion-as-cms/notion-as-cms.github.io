import { Client } from "@notionhq/client";
import { NotionCompatAPI } from "notion-compat";

export interface NotionClients {
  client: Client;
  compatClient: NotionCompatAPI;
}

/**
 * Create Notion API clients from an API key.
 * Returns both the official client and the compat client for page rendering.
 */
export function createNotionClient(apiKey: string): NotionClients {
  if (!apiKey) {
    throw new Error("Notion API key is required");
  }

  const client = new Client({ auth: apiKey });
  const compatClient = new NotionCompatAPI(client);

  return { client, compatClient };
}
