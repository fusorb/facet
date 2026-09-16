import { createContext, useContext } from "react";
import type { ReactNode, HTMLAttributes } from "react";

export interface PresenceProps extends HTMLAttributes<HTMLElement> {
  /** Whether children are "present" (visible). */
  present?: boolean;
  initial?: boolean;
  children: ReactNode;
}

interface PresenceValue {
  isPresent: boolean;
}

export const PresenceContext = createContext<PresenceValue>({ isPresent: true });

/**
 * Presence wraps a tree of <Motion> children so that exit animations
 * play before the host is unmounted.
 *
 * Thin binding: it only exposes `isPresent` via context. The actual
 * enter/exit orchestration is handled by <Motion>.
 */
export function Presence({
  present = true,
  initial = true,
  children,
}: PresenceProps) {
  void initial; // initial is reserved for future AnimatePresence-style API
  return (
    <PresenceContext.Provider value={{ isPresent: present }}>
      {children}
    </PresenceContext.Provider>
  );
}

/** Read the current presence state from the nearest <Presence>. */
export function usePresence(): PresenceValue {
  return useContext(PresenceContext);
}
