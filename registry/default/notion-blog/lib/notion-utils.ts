import type { Block, PageBlock, ExtendedRecordMap } from "notion-types";

export const isPageBlock = (block: Block): block is PageBlock => {
  return block.type === "page";
};

export const findPageBlock = (recordMap: ExtendedRecordMap): PageBlock | null => {
  for (const blockId in recordMap.block) {
    const block = recordMap.block[blockId]?.value;
    if (block && isPageBlock(block)) {
      return block;
    }
  }
  return null;
};
