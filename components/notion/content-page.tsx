import { Renderer } from "./renderer";
import { MobileTOC, DesktopTOC, type TOCConfig } from "./table-of-contents";
import Image from "next/image";
import Link from "next/link";
import type { Tag, TOCEntry } from "@/components/notion/types";
import type { ExtendedRecordMap } from "notion-types";
import { Calendar } from "lucide-react";

interface PageInfo {
  date?: string;
  toc?: TOCEntry[];
  [key: string]: any;
}

interface ContentPageProps {
  recordMap: ExtendedRecordMap & {
    pageInfo: PageInfo;
  };
  basePath?: string;
  /** TOC configuration for header offset and mobile positioning */
  tocConfig?: TOCConfig;
}

export function ContentPage({ recordMap, basePath = "/blog", tocConfig }: ContentPageProps) {
  const { tags = [], cover, title, description, toc = [] } = recordMap.pageInfo || {};
  const safeTags = (tags as Tag[]) || [];

  // Get the last edited time from the first block
  const lastEditedTime =
    recordMap.block[Object.keys(recordMap.block)[0]]?.value?.last_edited_time;

  const hasTOC = toc.length > 0;

  return (
    <article>
      {/* Header Section */}
      <header className="py-8 lg:py-12">
        {/* Cover Image */}
        {cover && (
          <div className="relative w-full h-64 md:h-96 mb-8 rounded-lg overflow-hidden">
            <Image
              src={cover}
              alt="Cover image"
              fill
              className="object-cover"
              priority
              unoptimized
            />
          </div>
        )}

        {/* Date */}
        {lastEditedTime && (
          <div className="mb-4 text-muted-foreground text-sm font-medium">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {new Date(lastEditedTime).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
          {title || "Untitled"}
        </h1>

        {/* Description */}
        {description && (
          <p className="mt-4 text-lg text-muted-foreground">
            {description}
          </p>
        )}

        {/* Tags */}
        {safeTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-6">
            {safeTags.map((tag) => (
              <Link
                key={tag.id}
                href={`${basePath}/tag/${tag.value}`}
                className="px-3 py-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-full text-sm font-medium transition-colors"
              >
                {tag.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Content Section with TOC */}
      <div className="py-8 lg:py-12">
          {/* Mobile TOC - shown at top on mobile */}
          {hasTOC && <MobileTOC toc={toc} config={tocConfig} />}

          <div className={hasTOC ? "lg:flex lg:gap-10" : ""}>
            {/* Desktop TOC - left sidebar */}
            {hasTOC && (
              <aside className="hidden lg:block lg:w-56 lg:shrink-0">
                <DesktopTOC toc={toc} config={tocConfig} />
              </aside>
            )}

            {/* Main Content */}
            <div className={hasTOC ? "lg:flex-1 lg:min-w-0" : ""}>
              <div
                className="prose prose-neutral dark:prose-invert max-w-none
                  prose-headings:font-semibold prose-headings:text-foreground
                  prose-headings:scroll-mt-24
                  prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
                  prose-p:text-muted-foreground
                  prose-a:text-primary hover:prose-a:text-primary/80
                  prose-strong:text-foreground
                  prose-code:text-sm prose-code:bg-muted prose-code:text-foreground
                  prose-pre:bg-card prose-pre:border prose-pre:border-border
                  prose-img:rounded-lg
                  prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground"
                style={{ "--notion-max-width": "100%" } as React.CSSProperties}
              >
                <Renderer
                  recordMap={recordMap}
                  fullPage={false}
                  darkMode={false}
                  showTableOfContents={false}
                />
              </div>
            </div>
          </div>
      </div>
    </article>
  );
}

// Alias for backward compatibility
export { ContentPage as BlogPost };
