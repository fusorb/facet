import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { InfiniteScroll } from "./infinite-scroll.js";

function mockIntersectionObserver() {
  const observe = vi.fn();
  const disconnect = vi.fn();
  let callback: IntersectionObserverCallback = () => {};
  const captured: { root?: Element | Document | null; rootMargin?: string } =
    {};
  class MockIO {
    constructor(
      cb: IntersectionObserverCallback,
      options?: IntersectionObserverInit,
    ) {
      callback = cb;
      captured.root = options?.root ?? null;
      captured.rootMargin = options?.rootMargin ?? "";
    }
    observe = observe;
    disconnect = disconnect;
    unobserve = vi.fn();
    root = null;
    rootMargin = "";
    thresholds = [];
    takeRecords = () => [];
  }
  vi.stubGlobal("IntersectionObserver", MockIO);
  return {
    fire(intersects: boolean) {
      callback(
        [{ isIntersecting: intersects } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    },
    observe,
    disconnect,
    captured,
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("InfiniteScroll", () => {
  it("renders children and an end message when exhausted", () => {
    render(
      <InfiniteScroll hasMore={false} onLoadMore={vi.fn()} endMessage="No more">
        <div>Item</div>
      </InfiniteScroll>,
    );
    expect(screen.getByText("Item")).toBeInTheDocument();
    expect(screen.getByText("No more")).toBeInTheDocument();
  });

  it("calls onLoadMore when the sentinel is visible", async () => {
    const io = mockIntersectionObserver();
    const onLoadMore = vi.fn();
    render(
      <InfiniteScroll hasMore onLoadMore={onLoadMore}>
        <div>Item</div>
      </InfiniteScroll>,
    );
    expect(onLoadMore).not.toHaveBeenCalled();
    io.fire(true);
    // onLoadMore fires via state (inView -> effect), so flush React.
    await waitFor(() => expect(onLoadMore).toHaveBeenCalledTimes(1));
  });

  it("observes the sentinel with the scroll container as root", () => {
    const io = mockIntersectionObserver();
    render(
      <InfiniteScroll hasMore onLoadMore={vi.fn()} threshold={120}>
        <div>Item</div>
      </InfiniteScroll>,
    );
    // The observer must root on the component itself (not the window),
    // with a negative bottom margin extending the trigger zone.
    expect(io.observe).toHaveBeenCalledTimes(1);
    expect(io.captured.root).toBeInstanceOf(HTMLDivElement);
    expect(io.captured.rootMargin).toContain("120px");
    expect(io.captured.rootMargin).toContain("0px");
  });

  it("does not call onLoadMore when hasMore is false", () => {
    const io = mockIntersectionObserver();
    const onLoadMore = vi.fn();
    render(
      <InfiniteScroll hasMore={false} onLoadMore={onLoadMore}>
        <div>Item</div>
      </InfiniteScroll>,
    );
    io.fire(true);
    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it("does not re-fire while loading", async () => {
    const io = mockIntersectionObserver();
    const onLoadMore = vi.fn();
    const { rerender } = render(
      <InfiniteScroll hasMore onLoadMore={onLoadMore}>
        <div>Item</div>
      </InfiniteScroll>,
    );
    io.fire(true);
    await waitFor(() => expect(onLoadMore).toHaveBeenCalledTimes(1));
    // Keep it in view + loading: no new fire.
    rerender(
      <InfiniteScroll hasMore onLoadMore={onLoadMore} loading>
        <div>Item</div>
      </InfiniteScroll>,
    );
    await new Promise((r) => setTimeout(r, 10));
    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it("supports horizontal direction", () => {
    render(
      <InfiniteScroll hasMore onLoadMore={vi.fn()} direction="horizontal">
        <div>Card</div>
      </InfiniteScroll>,
    );
    expect(screen.getByText("Card")).toBeInTheDocument();
  });
});
