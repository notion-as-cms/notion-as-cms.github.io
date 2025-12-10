"use client";

import {
  useEffect,
  useState,
  useRef,
  useLayoutEffect,
} from "react";
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
import type { TOCEntry } from "@/registry/default/notion-cms/types/notion";

interface TableOfContentsProps {
  toc: TOCEntry[];
  className?: string;
}

// Convert hyphenated UUID to non-hyphenated (notion-utils returns with hyphens, react-notion-x renders without)
function toElementId(id: string): string {
  return id.replace(/-/g, "");
}

// Hook for scroll spy - uses scroll position to find the heading closest to top of viewport
function useActiveAnchor(toc: TOCEntry[]) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (toc.length === 0) return;

    const ids = toc.map((item) => item.id);

    const updateActiveHeading = () => {
      // Find the heading that's closest to the top of the viewport (but above it)
      const headerOffset = 100; // Account for sticky header
      const scrollTop = window.scrollY + headerOffset;

      let currentId: string | null = null;

      for (const id of ids) {
        const element = document.getElementById(toElementId(id));
        if (!element) continue;

        const elementTop = element.getBoundingClientRect().top + window.scrollY;

        // If this heading is above or at our scroll position, it could be current
        if (elementTop <= scrollTop) {
          currentId = id;
        } else {
          // We've passed all headings that are above scroll position
          break;
        }
      }

      // If no heading is above scroll position, use the first one
      if (!currentId && ids.length > 0) {
        currentId = ids[0];
      }

      setActiveId(currentId);
    };

    // Initial calculation
    updateActiveHeading();

    // Update on scroll
    window.addEventListener("scroll", updateActiveHeading, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateActiveHeading);
    };
  }, [toc]);

  return activeId;
}

// Individual TOC item with auto-scroll when becoming active
function TOCItem({
  item,
  isActive,
  containerRef,
  onItemClick,
}: {
  item: TOCEntry;
  isActive: boolean;
  containerRef: React.RefObject<HTMLElement | null>;
  onItemClick?: () => void;
}) {
  const itemRef = useRef<HTMLAnchorElement>(null);
  const wasActiveRef = useRef(false);

  // Auto-scroll TOC container when this item becomes active
  useLayoutEffect(() => {
    if (isActive && !wasActiveRef.current && itemRef.current && containerRef.current) {
      const container = containerRef.current;
      const item = itemRef.current;

      const containerRect = container.getBoundingClientRect();
      const itemRect = item.getBoundingClientRect();

      // Check if item is outside visible area
      const isAbove = itemRect.top < containerRect.top;
      const isBelow = itemRect.bottom > containerRect.bottom;

      if (isAbove || isBelow) {
        item.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
    wasActiveRef.current = isActive;
  }, [isActive, containerRef]);

  return (
    <a
      ref={itemRef}
      href={`#${toElementId(item.id)}`}
      onClick={onItemClick}
      data-active={isActive}
      className={cn(
        "relative block text-sm transition-all duration-200 py-1.5 hover:text-foreground",
        item.level === 1 && "pl-3 font-medium",
        item.level === 2 && "pl-6",
        item.level === 3 && "pl-9 text-xs",
        isActive
          ? "text-foreground"
          : "text-muted-foreground"
      )}
    >
      {item.text}
    </a>
  );
}

// Active indicator thumb (like fumadocs clerk style)
function TocThumb({
  containerRef,
  activeId,
  toc,
}: {
  containerRef: React.RefObject<HTMLElement | null>;
  activeId: string | null;
  toc: TOCEntry[];
}) {
  const [style, setStyle] = useState({ top: 0, height: 0 });

  useLayoutEffect(() => {
    if (!containerRef.current || !activeId) {
      setStyle({ top: 0, height: 0 });
      return;
    }

    const container = containerRef.current;
    const activeElement = container.querySelector(
      `a[href="#${toElementId(activeId)}"]`
    ) as HTMLElement | null;

    if (activeElement) {
      const top = activeElement.offsetTop;
      const height = activeElement.offsetHeight;
      setStyle({ top, height });
    }
  }, [containerRef, activeId, toc]);

  if (!activeId || style.height === 0) return null;

  return (
    <div
      className="absolute left-0 w-0.5 bg-primary rounded-full transition-all duration-200 ease-out"
      style={{
        top: style.top,
        height: style.height,
      }}
    />
  );
}

// Desktop TOC with clerk-style indicator
export function DesktopTOC({ toc }: { toc: TOCEntry[] }) {
  const activeId = useActiveAnchor(toc);
  const containerRef = useRef<HTMLDivElement>(null);

  if (toc.length === 0) return null;

  return (
    <div className="sticky top-24">
      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <List className="h-4 w-4" />
        On this page
      </h4>
      <div className="relative max-h-[calc(100vh-12rem)] overflow-y-auto scrollbar-thin">
        <div ref={containerRef} className="relative">
          <TocThumb containerRef={containerRef} activeId={activeId} toc={toc} />
          <nav className="space-y-0.5">
            {toc.map((item) => (
              <TOCItem
                key={item.id}
                item={item}
                isActive={activeId === item.id}
                containerRef={containerRef}
              />
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}

// Mobile TOC with Sheet
export function MobileTOC({ toc }: { toc: TOCEntry[] }) {
  const [open, setOpen] = useState(false);
  const activeId = useActiveAnchor(toc);
  const containerRef = useRef<HTMLDivElement>(null);

  if (toc.length === 0) return null;

  const activeItem = toc.find((item) => item.id === activeId);

  return (
    <div className="lg:hidden sticky top-16 z-40 -mx-4 px-4 py-3 mb-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
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
          <ScrollArea className="h-[calc(100vh-8rem)] mt-6">
            <div ref={containerRef} className="relative pr-4">
              <TocThumb containerRef={containerRef} activeId={activeId} toc={toc} />
              <nav className="space-y-0.5">
                {toc.map((item) => (
                  <TOCItem
                    key={item.id}
                    item={item}
                    isActive={activeId === item.id}
                    containerRef={containerRef}
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

// Combined component
export function TableOfContents({ toc, className }: TableOfContentsProps) {
  if (toc.length === 0) return null;

  return (
    <div className={className}>
      <MobileTOC toc={toc} />
      <aside className="hidden lg:block w-64 shrink-0">
        <DesktopTOC toc={toc} />
      </aside>
    </div>
  );
}
