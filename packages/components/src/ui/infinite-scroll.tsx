/**
 * InfiniteScroll: an auto-loading container that fires `onLoadMore` when the
 * user reaches the end (vertical) or right edge (horizontal) of the content.
 *
 * Usage:
 *   <InfiniteScroll hasMore={hasMore} onLoadMore={loadMore} loading={loading} className="max-h-64">
 *     {items}
 *   </InfiniteScroll>
 *
 * Direction:
 *   - "vertical": a scrollable viewport with a bottom sentinel.
 *   - "horizontal": a scrollable row with a right-edge sentinel.
 *
 * The consumer controls the scrollable height/width via className
 * (e.g. max-h-64); the component adds the overflow scrolling. An
 * IntersectionObserver watches a sentinel INSIDE the scroll container
 * (container as root), so it fires exactly when the sentinel scrolls into
 * the container's visible area.
 */

import * as React from "react";
import { cn } from "../utils.js";

export interface InfiniteScrollProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether more content is available to load. When false, no sentinel fires. */
  hasMore: boolean;
  /** Called when the sentinel becomes visible. */
  onLoadMore: () => void;
  /** Show a loading indicator in the sentinel area. */
  loading?: boolean;
  /** Loading indicator content. Default: a small spinner. */
  loader?: React.ReactNode;
  /** End-of-list content. Default: "You're all caught up". */
  endMessage?: React.ReactNode;
  /** Scroll direction. Default: "vertical". */
  direction?: "vertical" | "horizontal";
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
 * Uses an IntersectionObserver on a sentinel element INSIDE the scroll
 * container (container as `root`), so it fires exactly when the sentinel
 * scrolls into the container's visible area. A negative rootMargin extends
 * the trigger zone by `threshold` px before the edge.
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
    const [inView, setInView] = React.useState(false);

    React.useEffect(() => {
      const container = containerRef.current;
      const node = sentinelRef.current;
      if (!container || !node || typeof IntersectionObserver === "undefined")
        return;

      // root = the scroll container; rootMargin pulls the boundary inward by
      // `threshold` px so loading starts before the exact edge.
      const margin =
        direction === "vertical"
          ? `0px 0px ${threshold}px 0px`
          : `0px ${threshold}px 0px 0px`;

      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry?.isIntersecting) setInView(true);
          else setInView(false);
        },
        { root: container, rootMargin: margin },
      );
      observer.observe(node);
      return () => observer.disconnect();
    }, [direction, threshold]);

    // Fire when the sentinel is visible and more content is available.
    const firedRef = React.useRef(false);
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

    const inner = (
      <>
        {children}
        {/* A sentinel with real height so the observer can see it cross the
            container's visible area reliably. */}
        <div
          ref={sentinelRef}
          aria-hidden="true"
          className={cn(
            "shrink-0",
            direction === "vertical" ? "h-1 w-full" : "h-full w-px",
          )}
        />
      </>
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
          // The CONSUMER controls the max height (e.g. max-h-64) so the
          // container can actually scroll; this component adds the overflow.
          scrollable && direction === "vertical" && "overflow-y-auto",
          scrollable && direction === "horizontal" && "overflow-x-auto",
          className,
        )}
        {...props}
      >
        {inner}
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
