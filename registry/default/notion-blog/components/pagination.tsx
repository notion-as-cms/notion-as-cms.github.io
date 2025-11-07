import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PaginationProps } from "@/registry/default/notion-blog/types/notion";

export function Pagination({
  currentPage,
  totalPages,
  basePath = "/blog",
}: PaginationProps) {
  // Ensure currentPage is within valid range
  const safeCurrentPage = Math.max(1, Math.min(currentPage, totalPages));
  const pageIndex = safeCurrentPage - 1;

  // Don't render if there's only one page or no pages
  if (totalPages <= 1) {
    return null;
  }

  // Generate proper href for the previous page
  const getPreviousHref = () => {
    if (pageIndex <= 1) return basePath;
    return `${basePath}/page/${pageIndex}`;
  };

  // Generate proper href for the next page
  const getNextHref = () => {
    return `${basePath}/page/${safeCurrentPage + 1}`;
  };

  return (
    <nav 
      className="flex justify-center mt-8 space-x-4" 
      aria-label="Pagination"
    >
      <div className="flex items-center gap-4">
        {/* Previous Page Button */}
        <Button
          variant="outline"
          size="sm"
          asChild={pageIndex > 0}
          disabled={pageIndex === 0}
          aria-disabled={pageIndex === 0 ? "true" : undefined}
          className="min-w-[7rem]"
        >
          {pageIndex > 0 ? (
            <Link
              href={getPreviousHref()}
              prefetch={false}
              className="flex items-center justify-center"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Link>
          ) : (
            <span className="flex items-center">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </span>
          )}
        </Button>

        {/* Page Indicator */}
        <div 
          className="text-sm text-muted-foreground px-4 py-2 bg-muted rounded-md"
          aria-current="page"
        >
          Page {safeCurrentPage} of {totalPages}
        </div>

        {/* Next Page Button */}
        <Button
          variant="outline"
          size="sm"
          asChild={pageIndex + 1 < totalPages}
          disabled={pageIndex + 1 >= totalPages}
          aria-disabled={pageIndex + 1 >= totalPages ? "true" : undefined}
          className="min-w-[7rem]"
        >
          {pageIndex + 1 < totalPages ? (
            <Link 
              href={getNextHref()} 
              prefetch={false}
              className="flex items-center justify-center"
              aria-label="Next page"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          ) : (
            <span className="flex items-center">
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </span>
          )}
        </Button>
      </div>
    </nav>
  );
}
