/**
 * In-session regression test for the Q7 lazy-icon refactor.
 *
 * Verifies the core guarantee that makes Q7 non-regressing: built-in semantic
 * icons resolve SYNCHRONOUSLY through direct imports (SEMANTIC_ICONS) and do
 * NOT pull the ~1,500-icon catalog chunk. This file intentionally avoids
 * awaiting `iconCatalogReady`, so it stays fast and never fetches the catalog.
 *
 * The arbitrary-icon ("heart", "alarm-clock", …) path lives in the deferred
 * catalog and is covered by registry.test.tsx (which awaits it in CI/jsdom).
 */
import { describe, expect, it } from "vitest";
import { getIcon } from "./registry.js";
import { SEMANTIC_ICONS } from "./semantic-icons.js";
import {
  Settings,
  LogOut,
  Copy,
  Compass,
  User,
  ChevronDown,
  ChevronsUpDown,
  TriangleAlert,
  BookOpen,
} from "lucide-react";

describe("semantic icon sync path (Q7)", () => {
  it("resolves built-in semantic icons synchronously via direct imports", () => {
    expect(getIcon("settings")).toBe(Settings);
    expect(getIcon("logout")).toBe(LogOut);
    expect(getIcon("copy")).toBe(Copy);
    expect(getIcon("compass")).toBe(Compass);
    expect(getIcon("user")).toBe(User);
    // Same component reference as the generated direct-import map.
    expect(getIcon("settings")).toBe(SEMANTIC_ICONS.settings);
    expect(getIcon("logout")).toBe(SEMANTIC_ICONS.logout);
  });

  it("resolves kebab semantic names without touching the lazy catalog", () => {
    expect(getIcon("chevron-down")).toBe(ChevronDown);
    expect(getIcon("chevron-down")).toBe(SEMANTIC_ICONS["chevron-down"]);
    expect(getIcon("chevron-up-down")).toBe(ChevronsUpDown);
    expect(getIcon("chevron-up-down")).toBe(SEMANTIC_ICONS["chevron-up-down"]);
    expect(getIcon("triangle-alert")).toBe(TriangleAlert);
    expect(getIcon("book-open")).toBe(BookOpen);
  });
});
