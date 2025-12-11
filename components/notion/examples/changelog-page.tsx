/**
 * Example: Custom Changelog Page Component
 *
 * This demonstrates how to create a completely custom detail page
 * for changelog entries. It uses a simpler layout without TOC,
 * focused on version/release information.
 */

import { Renderer } from "../renderer";
import Link from "next/link";
import type { CustomPageComponentProps } from "@/components/notion/types";
import { ArrowLeft, Calendar, Tag } from "lucide-react";

export function ChangelogPage({
  recordMap,
  basePath = "/changelog",
}: CustomPageComponentProps) {
  const { title, description, tags = [], cover } = recordMap.pageInfo || {};

  // Get the last edited time from the first block
  const lastEditedTime =
    recordMap.block[Object.keys(recordMap.block)[0]]?.value?.last_edited_time;

  return (
    <article className="py-8 lg:py-12">
      {/* Back link */}
      <Link
        href={basePath}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Changelog
      </Link>

      {/* Header */}
      <header className="mb-8 pb-8 border-b border-border">
        {/* Version badge - you might extract this from title or a property */}
        <div className="mb-4">
          <span className="inline-block px-3 py-1 text-sm font-semibold bg-primary text-primary-foreground rounded-full">
            Release
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          {title || "Untitled"}
        </h1>

        {description && (
          <p className="text-lg text-muted-foreground mb-4">{description}</p>
        )}

        {/* Meta info */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {lastEditedTime && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {new Date(lastEditedTime).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          )}
          {(tags as any[]).length > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <Tag className="h-4 w-4" />
              {(tags as any[]).map((t) => t.label).join(", ")}
            </span>
          )}
        </div>
      </header>

      {/* Content - no TOC, simpler layout */}
      <div
        className="prose prose-neutral dark:prose-invert max-w-none
          prose-headings:font-semibold prose-headings:text-foreground
          prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4
          prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3
          prose-p:text-muted-foreground
          prose-li:text-muted-foreground
          prose-a:text-primary hover:prose-a:text-primary/80
          prose-code:text-sm prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
          prose-pre:bg-card prose-pre:border prose-pre:border-border"
        style={{ "--notion-max-width": "100%" } as React.CSSProperties}
      >
        <Renderer
          recordMap={recordMap}
          fullPage={false}
          darkMode={false}
          showTableOfContents={false}
        />
      </div>

      {/* Footer navigation */}
      <footer className="mt-12 pt-8 border-t border-border">
        <Link
          href={basePath}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          View all changelog entries
        </Link>
      </footer>
    </article>
  );
}
