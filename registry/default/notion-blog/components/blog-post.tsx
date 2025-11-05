import { Renderer } from "./renderer";
import { findPageBlock } from "@/registry/default/notion-blog/lib/notion-utils";
import { getPageTableOfContents } from "notion-utils";
import Image from "next/image";
import Link from "next/link";
import type { Tag } from "@/registry/default/notion-blog/types/notion";
import {
  DocsPage,
  DocsBody,
  DocsDescription,
  DocsTitle,
} from "fumadocs-ui/page";
import type { ExtendedRecordMap } from "notion-types";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";

// Update PageInfo type to include date
interface PageInfo {
  date?: string;
  [key: string]: any;
}

interface TOCItemType {
  title: React.ReactNode;
  url: string;
  depth: number;
}

interface BlogPostProps {
  recordMap: ExtendedRecordMap & {
    pageInfo: PageInfo;
  };
}

type TableOfContents = TOCItemType[];

export function BlogPost({ recordMap }: BlogPostProps) {
  const { tags = [], cover, title, description } = recordMap.pageInfo || {};
  const safeTags = (tags as Tag[]) || [];

  // Generate TOC from recordMap
  const toc: TableOfContents = [];
  try {
    const pageBlock = findPageBlock(recordMap);
    if (pageBlock) {
      const items = getPageTableOfContents(pageBlock, recordMap);
      items.forEach((item) => {
        if (item?.id && item?.text) {
          toc.push({
            title: item.text,
            url: `#${item.id}`,
            depth: item.indentLevel || 0,
          });
        }
      });
    }
  } catch (error) {
    console.error("Error generating TOC:", error);
  }

  return (
    <>
      <div className="relative container px-4 py-8 lg:py-12 lg:px-6 text-left">
        {/* Cover Image */}
        {cover && (
          <div className="relative w-full h-64 md:h-96 mb-8 rounded-lg overflow-hidden">
            <Image
              src={cover}
              alt="Post cover"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 75vw"
            />
          </div>
        )}

        <div className="mb-4 text-gray-600 dark:text-gray-400 text-sm font-medium">
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {new Date(
                recordMap.block[Object.keys(recordMap.block)[0]]?.value
                  ?.last_edited_time || ""
              ).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        <DocsTitle className="text-left dark:text-white">
          {title || "Untitled"}
        </DocsTitle>

        {description && (
          <DocsDescription className="text-left mt-3 dark:text-gray-300">
            {description}
          </DocsDescription>
        )}

        {safeTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {safeTags.map((tag) => (
              <Link
                key={tag.id}
                href={`/blog/tag/${tag.value}`}
                className="px-2.5 py-0.5 bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-300 rounded-full text-xs font-medium"
              >
                {tag.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      <DocsLayout
        nav={{ enabled: false }}
        tree={{
          name: "Blog",
          children: [],
        }}
        sidebar={{ enabled: false, prefetch: false, tabs: false }}
      >
        <DocsPage
          // toc={toc}
          full={false}
          footer={{ enabled: false }}
          tableOfContent={{
            // style: "clerk",
            single: false,
          }}
          container={{
            className: cn(
              "bg-zinc-50/50 dark:bg-zinc-900/50 !container px-4 lg:px-6"
            ),
          }}
        >
          <DocsBody>
            <div
              className="prose dark:prose-invert max-w-none"
              style={
                {
                  "--notion-max-width": "100%",
                } as React.CSSProperties
              }
            >
              <Renderer
                recordMap={recordMap}
                fullPage={false}
                darkMode={false}
                showTableOfContents={false}
              />
            </div>
          </DocsBody>
        </DocsPage>
      </DocsLayout>
    </>
  );
}
