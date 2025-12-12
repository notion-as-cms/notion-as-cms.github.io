import Link from "next/link";
import type { CustomListComponentProps } from "@/components/notion/types";
import { Pagination } from "@/components/notion/pagination";

export function NewsList({
  items,
  currentPage,
  totalPages,
  heading,
  basePath,
}: CustomListComponentProps) {
  return (
    <div className="py-8 lg:py-12">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-2">{heading}</h1>
        <p className="text-muted-foreground">
          Stay informed with the latest news and announcements
        </p>
      </header>

      {/* Card grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="group rounded-lg border border-border bg-card overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Card image */}
            <div className="aspect-video bg-muted relative overflow-hidden">
              {item.data.cover ? (
                <img
                  src={item.data.cover}
                  alt={item.data.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <span className="text-4xl">📰</span>
                </div>
              )}
              {/* Category badge */}
              {item.data.tags[0] && (
                <span className="absolute top-3 left-3 px-2 py-1 text-xs font-medium bg-primary text-primary-foreground rounded">
                  {item.data.tags[0]}
                </span>
              )}
            </div>

            {/* Card content */}
            <div className="p-4">
              <time className="text-xs text-muted-foreground">
                {new Date(item.data.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              <h2 className="mt-2 text-lg font-semibold line-clamp-2">
                <Link href={item.url} className="hover:underline">
                  {item.data.title}
                </Link>
              </h2>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                {item.data.description}
              </p>
              {item.data.author && (
                <p className="mt-3 text-xs text-muted-foreground">
                  By {item.data.author}
                </p>
              )}
            </div>
          </article>
        ))}
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
