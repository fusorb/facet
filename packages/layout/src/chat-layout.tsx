/**
 * @fusorb/facet-layout: ChatLayout
 *
 * Chat-style app shell: a sidebar (brand + navigation / conversations) on
 * the left and a chat main area (scrollable message list) with an inline
 * chat-input bar at the bottom. Modeled on ChatGPT / Claude / Lovable
 * agent interfaces — the sidebar is persistent on desktop and slides in on
 * mobile, reusing LayoutProvider for the open/closed state (same UX as
 * ConsoleLayout). Not restricted to AI agents: swap the message list for any
 * chat surface (agent, support, team, ...).
 */

import * as React from "react";
import { useOptionalAuth } from "@fusorb/facet-auth";
import { LayoutProvider, useLayout } from "./layout-context.js";
import { Sidebar } from "./sidebar.js";
import type { LayoutConfig } from "./types.js";
import type { RouterAdapter } from "./router.js";

/* ── Props ────────────────────────────────────────────────── */

export interface ChatInputProps {
  /** Called with the trimmed message on submit (Enter, or the Send button). */
  onSendMessage: (message: string) => void;
  /** Disable the input + button (e.g. while streaming a response). */
  disabled?: boolean;
  /** Textarea placeholder. */
  placeholder?: string;
}

export interface ChatLayoutProps {
  config: LayoutConfig;
  /** Chat history + active message content. */
  children: React.ReactNode;
  /** "New chat" button handler (rendered in the sidebar header). */
  onNewChat?: () => void;
  /** Submit handler wired to the default {@link ChatInput}. */
  onSendMessage?: (message: string) => void;
  /** Replace the bottom input area entirely. */
  chatInput?: React.ReactNode;
  /** Optional content above the chat area (model selector, title, ...). */
  topbar?: React.ReactNode;
  /** Disable the default chat input. */
  inputDisabled?: boolean;
  /** Placeholder for the default chat input. */
  inputPlaceholder?: string;
  /** Framework-aware sidebar navigation links. */
  router?: RouterAdapter;
}

/* ── Default chat input ──────────────────────────────────── */

/**
 * Default chat input bar: an auto-growing textarea (Shift+Enter inserts a
 * newline, Enter sends) with a Send button. Drop it in directly or override
 * the `chatInput` slot on {@link ChatLayout}.
 */
export function ChatInput({
  onSendMessage,
  disabled,
  placeholder = "Type a message...",
}: ChatInputProps) {
  const [value, setValue] = React.useState("");

  const send = () => {
    const msg = value.trim();
    if (!msg || disabled) return;
    onSendMessage(msg);
    setValue("");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const rows = Math.min(6, Math.max(1, value.split("\n").length));

  return (
    <div className="flex items-end gap-2">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        rows={rows}
        className="flex-1 resize-none rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      />
      <button
        type="button"
        onClick={send}
        disabled={disabled || !value.trim()}
        className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
      >
        Send
      </button>
    </div>
  );
}

/* ── Sidebar ─────────────────────────────────────────────── */

interface ChatSidebarProps {
  config: LayoutConfig;
  onNewChat?: () => void;
  isLoading?: boolean;
}

function ChatSidebar({ config, onNewChat, isLoading }: ChatSidebarProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border p-4">
        {config.brand?.name && (
          <span className="text-lg font-semibold text-foreground">
            {config.brand.name}
          </span>
        )}
        {onNewChat && (
          <button
            type="button"
            onClick={onNewChat}
            className="rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
          >
            + New chat
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        <Sidebar config={config} isLoading={isLoading} />
      </div>
    </div>
  );
}

/* ── Responsivity ─────────────────────────────────────────── */

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isDesktop;
}

/* ── Shell ───────────────────────────────────────────────── */

function ChatLayoutInner({
  config,
  children,
  onNewChat,
  onSendMessage,
  chatInput,
  topbar,
  inputDisabled,
  inputPlaceholder,
}: ChatLayoutProps) {
  const { sidebarOpen, setSidebarOpen } = useLayout();
  const isDesktop = useIsDesktop();

  // Auth is optional. Without an <ArcProvider>, treat the user as
  // authenticated so the shell works for static/docs chat sites too.
  const auth = useOptionalAuth();
  const isAuthenticated = auth?.isAuthenticated ?? true;
  const isLoading = auth?.isLoading ?? false;

  // Click-outside (and Escape) closes the mobile sidebar. Declared before the
  // conditional returns so hook order stays stable across loading/auth
  // transitions (Rules of Hooks); guarded so it is a no-op until the shell is
  // live. The hamburger is excluded via [data-mobile-trigger] so click-to-pin
  // still works.
  React.useEffect(() => {
    if (!sidebarOpen || isLoading || !isAuthenticated) return;
    const close = () => setSidebarOpen(false);
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target?.closest("[data-sidebar]") ||
        target?.closest("[data-mobile-trigger]")
      )
        return;
      close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [sidebarOpen, isLoading, isAuthenticated, setSidebarOpen]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // Not authenticated: render children directly (let a Guard or SignIn handle it).
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile hamburger */}
      {!isDesktop && (
        <button
          data-mobile-trigger
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-4 left-4 z-[90] rounded-md p-2 text-foreground hover:bg-muted"
        >
          <MenuIcon />
        </button>
      )}

      {/* Desktop persistent sidebar */}
      {isDesktop && (
        <div className="hidden w-64 border-r border-border bg-sidebar lg:block">
          <ChatSidebar config={config} onNewChat={onNewChat} isLoading={isLoading} />
        </div>
      )}

      {/* Mobile slide-in sidebar */}
      {!isDesktop && (
        <div
          className={`fixed inset-y-0 left-0 z-[80] flex h-screen w-64 transform flex-col border-r bg-sidebar transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
          data-sidebar
        >
          <ChatSidebar config={config} onNewChat={onNewChat} isLoading={isLoading} />
        </div>
      )}

      {/* Chat main */}
      <main className="flex min-w-0 flex-1 flex-col">
        {topbar && (
          <header className="border-b border-border px-4 py-2">{topbar}</header>
        )}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="mx-auto w-full max-w-3xl">{children}</div>
        </div>
        <div className="border-t border-border p-3">
          {chatInput ?? (
            <ChatInput
              onSendMessage={onSendMessage ?? (() => {})}
              disabled={inputDisabled}
              placeholder={inputPlaceholder}
            />
          )}
        </div>
      </main>
    </div>
  );
}

/** Minimal menu icon (inline SVG, no icon dependency). */
function MenuIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

export function ChatLayout(props: ChatLayoutProps) {
  return (
    <LayoutProvider router={props.router}>
      <ChatLayoutInner {...props} />
    </LayoutProvider>
  );
}
