import "@testing-library/jest-dom";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Reset the DOM + mocks between every test. Without this, rendered markup
// (e.g. Radix portals from Drawer/Dialog/Select) leaks across tests and
// produces "Found multiple elements" + stale-spy false failures.
afterEach(() => {
  cleanup();
});

// jsdom doesn't implement ResizeObserver / scrollIntoView / matchMedia: // Radix primitives (ScrollArea, Dialog, DropdownMenu) rely on them.
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = ResizeObserverMock;
}

if (!globalThis.matchMedia) {
  globalThis.matchMedia = () =>
    ({
      matches: false,
      media: "",
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}

if (typeof Element !== "undefined" && !Element.prototype.scrollIntoView) {
  // @ts-expect-error -- not every env (e.g. node test runner) exposes Element
  Element.prototype.scrollIntoView = () => undefined;
}

// jsdom doesn't implement IntersectionObserver -- embla-carousel requires it.
if (!globalThis.IntersectionObserver) {
  globalThis.IntersectionObserver = class {
    disconnect() {}
    observe() {}
    unobserve() {}
    takeRecords() {
      return [];
    }
  } as typeof IntersectionObserver;
}
