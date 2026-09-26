/**
 * Frame scheduler abstraction.
 *
 * Uses `requestAnimationFrame` when available (browser) and falls back
 * to `setInterval` (~60 fps) for plain Node environments - so core/
 * can be unit-tested with `vi.useFakeTimers()` and no jsdom.
 *
 * Consumers can inject a custom scheduler for testing or for platforms
 * that need different timing semantics.
 */

export type TickCallback = (deltaMs: number) => void;
export type Unscheduler = () => void;
export type Scheduler = (callback: TickCallback) => Unscheduler;

/**
 * Default scheduler: rAF in browser, setInterval in Node.
 *
 * On each tick, `callback` receives the elapsed time since the previous
 * tick in milliseconds.
 */
export const defaultScheduler: Scheduler = (
  callback: TickCallback,
): Unscheduler => {
  let stopped = false;

  if (typeof requestAnimationFrame === "function") {
    let last: number | null = null;

    const tick = (now: number) => {
      if (stopped) return;
      // On the first frame, delta is 0 — no time has elapsed since the
      // animation started. Using the absolute rAF timestamp here would
      // inflate `elapsed` by thousands of ms, causing spring generators
      // to jump straight to their settled value (visible "snapping").
      const delta = last === null ? 0 : now - last;
      last = now;
      callback(delta);
      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
    return () => {
      stopped = true;
    };
  }

  // setInterval fallback for Node / non-browser environments
  const interval = 16; // ≈ 60 fps
  let last = Date.now();

  const id = setInterval(() => {
    if (stopped) return;
    const now = Date.now();
    callback(now - last);
    last = now;
  }, interval);

  return () => {
    stopped = true;
    clearInterval(id);
  };
};
