import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Pagination } from "./pagination";
import type { ContentItem, ItemListProps } from "@/components/notion/types";

export function ItemList({
  posts,
  currentPage,
  totalPages,
  heading = "Latest",
  description,
  basePath = "/blog",
  disablePagination = false,
  configuration = {},
}: ItemListProps) {
  return (
    <div className="py-8 lg:py-12">
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">{heading}</h1>
        {description && (
          <p className="text-lg text-muted-foreground">{description}</p>
        )}
      </section>

      <section className="space-y-12">
        {posts.map((post) =>
          post ? <ItemCard key={post.id} item={post} /> : null
        )}
      </section>

      {!disablePagination && totalPages > 1 && (
        <div className="mt-12 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            basePath={basePath || "/blog"}
          />
        </div>
      )}
    </div>
  );
}

// Alias for backward compatibility
export { ItemList as PostList };

function ItemCard({ item }: { item: ContentItem }) {
  const { title, description, author, date, tags = [], cover } = item.data;

  return (
    <article className="group">
      <div className="grid gap-y-6 sm:grid-cols-10 sm:gap-x-5 sm:gap-y-0 md:items-center md:gap-x-8 lg:gap-x-12">
        <div className="sm:col-span-5">
          <div className="mb-4 md:mb-6">
            <div className="flex flex-wrap gap-3 text-xs uppercase tracking-wider text-muted-foreground md:gap-5 lg:gap-6">
              {tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </div>
          <h3 className="text-xl font-semibold md:text-2xl lg:text-3xl text-left">
            <Link href={item.url} className="hover:underline cursor-pointer">
              {title}
            </Link>
          </h3>
          <p className="mt-4 text-muted-foreground md:mt-5 text-left">
            {description}
          </p>
          <div className="mt-6 flex items-center space-x-4 text-sm md:mt-8">
            <span className="text-muted-foreground capitalize">
              {author || "Anonymous"}
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">
              {new Date(date).toDateString()}
            </span>
          </div>
          <div className="mt-6 flex items-center space-x-2 md:mt-8">
            <Link
              href={item.url}
              className="inline-flex items-center font-semibold hover:underline md:text-base"
            >
              <span>Read more</span>
              <ArrowRight className="ml-2 size-4 transition-transform" />
            </Link>
          </div>
        </div>
        <div className="order-first sm:order-last sm:col-span-5">
          <Link href={item.url} className="block">
            <div className="aspect-[16/9] overflow-clip rounded-lg border border-border bg-muted">
              {cover ? (
                <img
                  src={cover}
                  alt={title}
                  className="h-full w-full object-cover transition-opacity duration-200 hover:opacity-70"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                  <span className="text-4xl">📝</span>
                </div>
              )}
            </div>
          </Link>
        </div>
      </div>
    </article>
  );
}
