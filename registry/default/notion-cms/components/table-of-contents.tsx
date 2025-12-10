"use client";

import { useEffect, useState, useRef, useLayoutEffect } from "react";
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
} from "@/registry/default/notion-cms/types/notion";

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

/** Hook for scroll spy - tracks which heading is currently active */
function useActiveAnchor(toc: TOCEntry[], headerOffset: number) {
  const [activeId, setActiveId] = useState<string | null>(
    toc.length > 0 ? toc[0].id : null
  );

  useEffect(() => {
    if (toc.length === 0) return;

    const ids = toc.map((item) => item.id);

    const updateActiveHeading = () => {
      const scrollTop = window.scrollY + headerOffset;
      let currentId: string | null = null;

      for (const id of ids) {
        const element = document.getElementById(toElementId(id));
        if (!element) continue;

        const elementTop = element.getBoundingClientRect().top + window.scrollY;
        if (elementTop <= scrollTop) {
          currentId = id;
        } else {
          break;
        }
      }

      setActiveId(currentId || ids[0]);
    };

    updateActiveHeading();
    window.addEventListener("scroll", updateActiveHeading, { passive: true });
    return () => window.removeEventListener("scroll", updateActiveHeading);
  }, [toc, headerOffset]);

  return activeId;
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
  onItemClick?: () => void;
}) {
  const itemRef = useRef<HTMLAnchorElement>(null);
  const wasActiveRef = useRef(false);

  // Auto-scroll TOC container when this item becomes active (point 4)
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

  // Handle click with scroll offset (point 3)
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById(toElementId(item.id));
    if (element) {
      const top =
        element.getBoundingClientRect().top + window.scrollY - headerOffset;
      window.scrollTo({ top, behavior: "smooth" });
    }
    onItemClick?.();
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
        // Point 2: underline + semi-bold for active, no left border
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
  const activeId = useActiveAnchor(toc, headerOffset);
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
  const activeId = useActiveAnchor(toc, headerOffset);
  const containerRef = useRef<HTMLDivElement>(null);

  if (toc.length === 0) return null;

  const activeItem = toc.find((item) => item.id === activeId);

  return (
    // Point 1: configurable top position via mobileTopClass
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
                    onItemClick={() => setOpen(false)}
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
