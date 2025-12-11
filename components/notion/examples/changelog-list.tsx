/**
 * Example: Custom Changelog List Component
 *
 * This demonstrates how to create a completely custom list component
 * for a specific content type. This uses a timeline-style layout
 * different from the default blog list.
 */

import Link from "next/link";
import type { CustomListComponentProps } from "@/components/notion/types";
import { Pagination } from "@/components/notion/pagination";

export function ChangelogList({
  items,
  currentPage,
  totalPages,
  heading,
  basePath,
}: CustomListComponentProps) {
  return (
    <div className="py-8 lg:py-12">
      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-2">{heading}</h1>
        <p className="text-muted-foreground">
          Track all the latest updates and improvements
        </p>
      </header>

      {/* Timeline layout */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

        <div className="space-y-8">
          {items.map((item) => (
            <article key={item.id} className="relative pl-12">
              {/* Timeline dot */}
              <div className="absolute left-2 top-2 w-5 h-5 rounded-full bg-primary border-4 border-background" />

              {/* Date badge */}
              <time className="inline-block px-3 py-1 mb-3 text-xs font-medium bg-muted rounded-full">
                {new Date(item.data.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </time>

              {/* Content */}
              <h2 className="text-xl font-semibold mb-2">
                <Link href={item.url} className="hover:underline">
                  {item.data.title}
                </Link>
              </h2>
              <p className="text-muted-foreground mb-3">{item.data.description}</p>

              {/* Tags as badges */}
              {item.data.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {item.data.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-xs bg-secondary text-secondary-foreground rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-12 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            basePath={basePath}
          />
        </div>
      )}
    </div>
  );
}
