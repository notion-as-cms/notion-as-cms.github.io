"use client";

import { useEffect, useState, useRef, useLayoutEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { List } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import type {
  TOCEntry,
  TOCConfig,
} from "@/components/notion/types";

// Re-export for convenience
export type { TOCConfig };

// Default offset for scroll calculations (accounts for sticky headers)
const DEFAULT_HEADER_OFFSET = 100;

interface TableOfContentsProps {
  toc: TOCEntry[];
  config?: TOCConfig;
  className?: string;
}

/** Convert hyphenated UUID to non-hyphenated (notion-utils vs react-notion-x format) */
const toElementId = (id: string) => id.replace(/-/g, "");

/** Convert element ID back to hyphenated format for TOC matching */
const toTocId = (elementId: string) => {
  // Convert 32-char hex to UUID format: 8-4-4-4-12
  if (elementId.length === 32 && /^[a-f0-9]+$/.test(elementId)) {
    return `${elementId.slice(0, 8)}-${elementId.slice(8, 12)}-${elementId.slice(12, 16)}-${elementId.slice(16, 20)}-${elementId.slice(20)}`;
  }
  return elementId;
};

/**
 * Hook for scroll spy with URL sync
 * - Tracks which heading is currently at the top of viewport
 * - Syncs with URL hash on load and hash changes
 * - Updates URL when scrolling
 */
function useActiveAnchor(toc: TOCEntry[], headerOffset: number) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get active ID from URL hash on mount
  useEffect(() => {
    if (toc.length === 0) return;

    const hash = window.location.hash.slice(1); // Remove #
    if (hash) {
      const tocId = toTocId(hash);
      const matchingItem = toc.find(
        (item) => item.id === tocId || toElementId(item.id) === hash
      );
      if (matchingItem) {
        setActiveId(matchingItem.id);
        return;
      }
    }
    // Default to first item
    setActiveId(toc[0].id);
  }, [toc]);

  // Listen for hash changes (e.g., browser back/forward)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash) {
        const tocId = toTocId(hash);
        const matchingItem = toc.find(
          (item) => item.id === tocId || toElementId(item.id) === hash
        );
        if (matchingItem) {
          setActiveId(matchingItem.id);
        }
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [toc]);

  // Scroll spy - update active heading based on scroll position
  useEffect(() => {
    if (toc.length === 0) return;

    const ids = toc.map((item) => item.id);

    const updateActiveHeading = () => {
      // Don't update during programmatic scrolling
      if (isScrollingRef.current) return;

      // Find the heading that's closest to the header offset line
      // We want the heading that's just at or slightly above the offset
      let bestMatch: string | null = null;
      let bestDistance = Infinity;

      for (const id of ids) {
        const element = document.getElementById(toElementId(id));
        if (!element) continue;

        const rect = element.getBoundingClientRect();
        const distanceFromOffset = rect.top - headerOffset;

        // Heading is at or above the offset line
        if (distanceFromOffset <= 0) {
          // We want the one closest to 0 (just past the line)
          const absDistance = Math.abs(distanceFromOffset);
          if (absDistance < bestDistance) {
            bestDistance = absDistance;
            bestMatch = id;
          }
        }
      }

      // If no heading is above offset, use the first visible one or first overall
      if (!bestMatch) {
        for (const id of ids) {
          const element = document.getElementById(toElementId(id));
          if (!element) continue;
          const rect = element.getBoundingClientRect();
          if (rect.top >= 0 && rect.top < window.innerHeight) {
            bestMatch = id;
            break;
          }
        }
      }

      if (!bestMatch && ids.length > 0) {
        bestMatch = ids[0];
      }

      if (bestMatch && bestMatch !== activeId) {
        setActiveId(bestMatch);
        // Only update visual highlight, don't update URL hash on scroll
        // URL hash should only change when user explicitly clicks a link
      }
    };

    updateActiveHeading();
    window.addEventListener("scroll", updateActiveHeading, { passive: true });
    return () => window.removeEventListener("scroll", updateActiveHeading);
  }, [toc, headerOffset, activeId]);

  // Function to set active ID and mark as scrolling (to prevent scroll spy override)
  const setActiveWithScroll = useCallback((id: string) => {
    isScrollingRef.current = true;
    setActiveId(id);

    // Clear any existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Re-enable scroll spy after scrolling completes
    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingRef.current = false;
    }, 1000); // Wait for smooth scroll to complete
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return { activeId, setActiveWithScroll };
}

/** Individual TOC item with auto-scroll when becoming active */
function TOCItem({
  item,
  isActive,
  containerRef,
  headerOffset,
  onItemClick,
}: {
  item: TOCEntry;
  isActive: boolean;
  containerRef: React.RefObject<HTMLElement | null>;
  headerOffset: number;
  onItemClick?: (id: string) => void;
}) {
  const itemRef = useRef<HTMLAnchorElement>(null);
  const wasActiveRef = useRef(false);

  // Auto-scroll TOC container when this item becomes active
  useLayoutEffect(() => {
    if (
      isActive &&
      !wasActiveRef.current &&
      itemRef.current &&
      containerRef.current
    ) {
      const container = containerRef.current;
      const itemEl = itemRef.current;
      const containerRect = container.getBoundingClientRect();
      const itemRect = itemEl.getBoundingClientRect();

      if (
        itemRect.top < containerRect.top ||
        itemRect.bottom > containerRect.bottom
      ) {
        itemEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
    wasActiveRef.current = isActive;
  }, [isActive, containerRef]);

  // Handle click - scroll content and update URL
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();

    const elementId = toElementId(item.id);
    const element = document.getElementById(elementId);

    if (element) {
      // Update URL first
      window.history.pushState(null, "", `#${elementId}`);

      // Notify parent to set active (with scroll lock)
      onItemClick?.(item.id);

      // Scroll to element with offset
      const top =
        element.getBoundingClientRect().top + window.scrollY - headerOffset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <a
      ref={itemRef}
      href={`#${toElementId(item.id)}`}
      onClick={handleClick}
      className={cn(
        "block text-sm py-1.5 transition-colors hover:text-foreground",
        item.level === 1 && "pl-0",
        item.level === 2 && "pl-4",
        item.level === 3 && "pl-8 text-xs",
        isActive
          ? "text-foreground font-medium underline underline-offset-4"
          : "text-muted-foreground"
      )}
    >
      {item.text}
    </a>
  );
}

/** Desktop TOC sidebar */
export function DesktopTOC({
  toc,
  config = {},
}: {
  toc: TOCEntry[];
  config?: TOCConfig;
}) {
  const headerOffset = config.headerOffset ?? DEFAULT_HEADER_OFFSET;
  const { activeId, setActiveWithScroll } = useActiveAnchor(toc, headerOffset);
  const containerRef = useRef<HTMLDivElement>(null);

  if (toc.length === 0) return null;

  return (
    <div className="sticky top-24">
      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <List className="h-4 w-4" />
        On this page
      </h4>
      <div
        ref={containerRef}
        className="max-h-[calc(100vh-12rem)] overflow-y-auto scrollbar-thin"
      >
        <nav className="space-y-0.5">
          {toc.map((item) => (
            <TOCItem
              key={item.id}
              item={item}
              isActive={activeId === item.id}
              containerRef={containerRef}
              headerOffset={headerOffset}
              onItemClick={setActiveWithScroll}
            />
          ))}
        </nav>
      </div>
    </div>
  );
}

/** Mobile TOC with Sheet */
export function MobileTOC({
  toc,
  config = {},
}: {
  toc: TOCEntry[];
  config?: TOCConfig;
}) {
  const [open, setOpen] = useState(false);
  const headerOffset = config.headerOffset ?? DEFAULT_HEADER_OFFSET;
  const mobileTopClass = config.mobileTopClass ?? "top-16";
  const { activeId, setActiveWithScroll } = useActiveAnchor(toc, headerOffset);
  const containerRef = useRef<HTMLDivElement>(null);

  if (toc.length === 0) return null;

  const activeItem = toc.find((item) => item.id === activeId);

  const handleItemClick = (id: string) => {
    setActiveWithScroll(id);
    setOpen(false);
  };

  return (
    <div
      className={cn(
        "lg:hidden sticky z-40 -mx-4 px-4 py-3 mb-6",
        "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border",
        mobileTopClass
      )}
    >
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
          >
            <List className="h-4 w-4 shrink-0" />
            <span className="truncate">
              {activeItem?.text || "On this page"}
            </span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 sm:w-96">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <List className="h-4 w-4" />
              On this page
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div ref={containerRef} className="px-4 py-2">
              <nav className="space-y-0.5">
                {toc.map((item) => (
                  <TOCItem
                    key={item.id}
                    item={item}
                    isActive={activeId === item.id}
                    containerRef={containerRef}
                    headerOffset={headerOffset}
                    onItemClick={handleItemClick}
                  />
                ))}
              </nav>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}

/** Combined TOC component */
export function TableOfContents({
  toc,
  config,
  className,
}: TableOfContentsProps) {
  if (toc.length === 0) return null;

  return (
    <div className={className}>
      <MobileTOC toc={toc} config={config} />
      <aside className="hidden lg:block w-64 shrink-0">
        <DesktopTOC toc={toc} config={config} />
      </aside>
    </div>
  );
}
