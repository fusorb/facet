/**
 * InfiniteScroll: an auto-loading container that fires `onLoadMore` when the
 * user reaches the edge(s) of the content.
 *
 * Usage:
 *   <InfiniteScroll hasMore={hasMore} onLoadMore={loadMore} loading={loading} className="max-h-64">
 *     {items}
 *   </InfiniteScroll>
 *
 * Direction:
 *   - "vertical": a scrollable viewport with a bottom sentinel.
 *   - "horizontal": a scrollable row with a right-edge sentinel.
 *   - "diagonal": a 2-D scroll area with sentinels on all four edges
 *     (top, bottom, left, right) so loading triggers from any direction.
 *
 * The consumer controls the scrollable height/width via className
 * (e.g. max-h-64); the component adds the overflow scrolling. An
 * IntersectionObserver watches the sentinel(s) INSIDE the scroll container
 * (container as root), so it fires exactly when the sentinel scrolls into
 * the container's visible area.
 */

import * as React from "react";
import { cn } from "../utils.js";

export interface InfiniteScrollProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether more content is available to load. When false, no sentinel fires. */
  hasMore: boolean;
  /** Called when a sentinel becomes visible. */
  onLoadMore: () => void;
  /** Show a loading indicator in the sentinel area. */
  loading?: boolean;
  /** Loading indicator content. Default: a small spinner. */
  loader?: React.ReactNode;
  /** End-of-list content. Default: "You're all caught up". */
  endMessage?: React.ReactNode;
  /** Scroll direction. Default: "vertical". */
  direction?: "vertical" | "horizontal" | "diagonal";
  /** Pixel distance from the edge that triggers a load. Default: 200 */
  threshold?: number;
  /** Render the scroll container (overflow + flex). Default: true. */
  scrollable?: boolean;
  /** Initial items to render. */
  children: React.ReactNode;
}

const DEFAULT_LOADER = (
  <div className="flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground">
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
    Loading more…
  </div>
);

/**
 * Uses an IntersectionObserver on sentinel element(s) INSIDE the scroll
 * container (container as `root`), so it fires exactly when the sentinel(s)
 * scroll into the container's visible area. A rootMargin extends the trigger
 * zone by `threshold` px before the edge.
 */
const InfiniteScroll = React.forwardRef<HTMLDivElement, InfiniteScrollProps>(
  (
    {
      hasMore,
      onLoadMore,
      loading = false,
      loader = DEFAULT_LOADER,
      endMessage = "You're all caught up",
      direction = "vertical",
      threshold = 200,
      scrollable = true,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const sentinelRef = React.useRef<HTMLDivElement | null>(null);
    const topSentinelRef = React.useRef<HTMLDivElement | null>(null);
    const bottomSentinelRef = React.useRef<HTMLDivElement | null>(null);
    const leftSentinelRef = React.useRef<HTMLDivElement | null>(null);
    const rightSentinelRef = React.useRef<HTMLDivElement | null>(null);

    const [inView, setInView] = React.useState(false);

    // Tracks how many sentinels are currently intersecting. For
    // "diagonal" mode four sentinels share one inView flag so that the
    // load-once guard resets only when *none* of them are visible.
    const inViewCountRef = React.useRef(0);

    const firedRef = React.useRef(false);

    React.useEffect(() => {
      const container = containerRef.current;
      if (!container || typeof IntersectionObserver === "undefined") return;

      const observers: IntersectionObserver[] = [];

      const watch = (node: HTMLDivElement | null, rootMargin: string) => {
        if (!node) return;
        const observer = new IntersectionObserver(
          (entries) => {
            const entry = entries[0];
            if (entry?.isIntersecting) {
              inViewCountRef.current++;
              setInView(true);
            } else {
              inViewCountRef.current = Math.max(0, inViewCountRef.current - 1);
              if (inViewCountRef.current === 0) setInView(false);
            }
          },
          { root: container, rootMargin },
        );
        observer.observe(node);
        observers.push(observer);
      };

      if (direction === "diagonal") {
        watch(topSentinelRef.current, `${threshold}px 0px 0px 0px`);
        watch(bottomSentinelRef.current, `0px 0px ${threshold}px 0px`);
        watch(leftSentinelRef.current, `0px ${threshold}px 0px 0px`);
        watch(rightSentinelRef.current, `0px ${threshold}px 0px 0px`);
      } else {
        const margin =
          direction === "vertical"
            ? `0px 0px ${threshold}px 0px`
            : `0px ${threshold}px 0px 0px`;
        watch(sentinelRef.current, margin);
      }

      return () => {
        observers.forEach((o) => o.disconnect());
        inViewCountRef.current = 0;
      };
    }, [direction, threshold]);

    // Fire when the sentinel is visible and more content is available.
    React.useEffect(() => {
      if (inView && hasMore && !loading) {
        if (!firedRef.current) {
          firedRef.current = true;
          onLoadMore();
        }
      } else if (!inView || !hasMore) {
        firedRef.current = false;
      }
    }, [inView, hasMore, loading, onLoadMore]);

    const isDiagonal = direction === "diagonal";

    const Sentinel = isDiagonal ? (
      <>
        <div
          ref={topSentinelRef}
          aria-hidden="true"
          className="absolute top-0 left-0 h-px w-full"
        />
        <div
          ref={bottomSentinelRef}
          aria-hidden="true"
          className="absolute bottom-0 left-0 h-px w-full"
        />
        <div
          ref={leftSentinelRef}
          aria-hidden="true"
          className="absolute top-0 left-0 h-full w-px"
        />
        <div
          ref={rightSentinelRef}
          aria-hidden="true"
          className="absolute top-0 right-0 h-full w-px"
        />
      </>
    ) : (
      <div
        ref={sentinelRef}
        aria-hidden="true"
        className={cn("shrink-0", direction === "vertical" ? "h-1 w-full" : "h-full w-px")}
      />
    );

    return (
      <div
        ref={(node) => {
          containerRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        className={cn(
          direction === "horizontal"
            ? "flex items-stretch gap-3"
            : "flex flex-col gap-3",
          isDiagonal && "flex-wrap",
          scrollable && direction === "vertical" && "overflow-y-auto",
          scrollable && direction === "horizontal" && "overflow-x-auto",
          scrollable && isDiagonal && "overflow-x-auto overflow-y-auto",
          isDiagonal && "relative",
          className,
        )}
        {...props}
      >
        {children}
        {Sentinel}
        <div
          className={cn(
            "flex w-full shrink-0 items-center justify-center",
            direction === "horizontal" && "w-auto pl-1",
          )}
        >
          {hasMore || loading ? (
            loader
          ) : (
            <span className="py-2 text-xs text-muted-foreground">
              {endMessage}
            </span>
          )}
        </div>
      </div>
    );
  },
);
InfiniteScroll.displayName = "InfiniteScroll";

export { InfiniteScroll };
