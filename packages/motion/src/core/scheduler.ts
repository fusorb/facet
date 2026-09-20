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
export const defaultScheduler: Scheduler = (callback: TickCallback): Unscheduler => {
  let stopped = false;

  if (typeof requestAnimationFrame === "function") {
    let last = 0;

    const tick = (now: number) => {
      if (stopped) return;
      // On the first frame, treat the start as t=0 so delta = now.
      const delta = last === 0 ? now : now - last;
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
