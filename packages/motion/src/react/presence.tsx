import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import type { ReactNode, HTMLAttributes } from "react";

export interface PresenceProps extends HTMLAttributes<HTMLElement> {
  /** Whether children are "present" (visible). */
  present?: boolean;
  /**
   * Minimum time to keep children mounted after `present` goes false,
   * even if no exit animations are registered (ms).
   */
  exitBeforeUnmount?: number;
  initial?: boolean;
  children: ReactNode;
}

interface PresenceContextValue {
  isPresent: boolean;
  /** True when inside a <Presence> ancestor (vs. the default context). */
  hasPresence: boolean;
  /**
   * Called by a child <Motion> when it begins an exit animation.
   * The returned function MUST be called when that exit animation finishes.
   * Presence counts outstanding exit callbacks and unmounts when all complete.
   */
  registerExit: () => () => void;
}

export const PresenceContext = createContext<PresenceContextValue>({
  isPresent: true,
  hasPresence: false,
  registerExit: () => () => {},
});

export function Presence({
  present = true,
  exitBeforeUnmount = 0,
  initial = true,
  children,
}: PresenceProps) {
  void initial;

  const [mounted, setMounted] = useState(present);
  const pendingExits = useRef(0);
  const presentRef = useRef(present);
  presentRef.current = present;
  const setMountedRef = useRef(setMounted);
  setMountedRef.current = setMounted;

  const registerExit = useCallback(() => {
    pendingExits.current++;
    return () => {
      pendingExits.current--;
      if (pendingExits.current <= 0 && !presentRef.current) {
        pendingExits.current = 0;
        if (exitBeforeUnmount > 0) {
          setTimeout(() => setMountedRef.current(false), exitBeforeUnmount);
        } else {
          setMountedRef.current(false);
        }
      }
    };
  }, [exitBeforeUnmount]);

  // React effects run child-first, parent-last. So by the time this effect
  // runs, any child <Motion> that wants to register an exit has already done so.
  useEffect(() => {
    if (present) {
      if (!mounted) setMounted(true);
    } else if (mounted) {
      if (pendingExits.current === 0) {
        if (exitBeforeUnmount > 0) {
          const id = setTimeout(() => setMounted(false), exitBeforeUnmount);
          return () => clearTimeout(id);
        } else {
          setMounted(false);
        }
      }
      // If pendingExits > 0, children will call setMounted(false) when done.
    }
  }, [present, mounted, exitBeforeUnmount]);

  if (!mounted) return null;

  return (
    <PresenceContext.Provider
      value={{ isPresent: present, hasPresence: true, registerExit }}
    >
      {children}
    </PresenceContext.Provider>
  );
}

export function usePresence(): PresenceContextValue {
  return useContext(PresenceContext);
}
