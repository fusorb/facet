/**
 * Icon registry tests: registerIcon / getIcon / IconProvider overrides /
 * dynamic lowercase lucide name resolution / brand icons / kebab aliases.
 */

import { beforeAll, describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Settings, LogOut, Copy, Compass, User, Heart } from "lucide-react";
import {
  Icon,
  IconProvider,
  getIcon,
  registerIcon,
  resetIconRegistry,
  iconCatalogReady,
} from "./index.js";
import { lucideIconMap, type LucideIconName } from "./icon-map.js";
import { brandIcons } from "./brand-icons.js";

describe("icon registry", () => {
  // The 1,500-icon catalog loads lazily (deferred chunk); await it
  // before assertions that resolve an arbitrary lucide icon by name.
  beforeAll(async () => {
    await iconCatalogReady();
  });

  // registerIcon mutates the module-level globalRegistry; reset between
  // tests so override cases can't pollute later renders.
  beforeEach(resetIconRegistry);

  it("provides built-in semantic icons", () => {
    expect(getIcon("settings")).toBe(Settings);
    expect(getIcon("logout")).toBe(LogOut);
    expect(getIcon("copy")).toBe(Copy);
    expect(getIcon("compass")).toBe(Compass);
    expect(getIcon("user")).toBe(User);
  });

  it("resolves lucide-style kebab semantic names", () => {
    expect(getIcon("chevron-down")).toBeDefined();
    expect(getIcon("triangle-alert")).toBeDefined();
    expect(getIcon("chevron-up-down")).toBeDefined();
    expect(getIcon("book-open")).toBeDefined();
  });

  it("resolves camelCase aliases for back-compat", () => {
    expect(getIcon("chevronDown")).toBe(getIcon("chevron-down"));
    expect(getIcon("triangleAlert")).toBe(getIcon("triangle-alert"));
    expect(getIcon("chevronUpDown")).toBe(getIcon("chevron-up-down"));
    expect(getIcon("bookOpen")).toBe(getIcon("book-open"));
  });

  it("provides brand icons as inline SVGs", () => {
    const brands = Object.keys(brandIcons);
    expect(brands.length).toBeGreaterThan(0);
    for (const name of brands) {
      expect(getIcon(name), name).toBeDefined();
    }
    // Brand icons are NOT in the lucide map (they're ours now)
    for (const name of brands) {
      expect(lucideIconMap[name as LucideIconName], name).toBeUndefined();
    }
  });

  it("resolves any lowercase lucide icon name", () => {
    expect(getIcon("heart")).toBe(Heart);
    expect(getIcon("alarm-clock")).toBe(lucideIconMap["alarm-clock"]);
    // Every entry in the map must resolve
    const allResolve = (Object.keys(lucideIconMap) as LucideIconName[]).every(
      (name) => getIcon(name) != null,
    );
    expect(allResolve).toBe(true);
  });

  it("registerIcon overrides a global icon", () => {
    const Custom = () => <span data-testid="custom-settings">S</span>;
    registerIcon("settings", Custom);
    expect(getIcon("settings")).toBe(Custom);
  });

  it("registerIcon can add a custom icon for any name", () => {
    const CustomHeart = () => <span data-testid="custom-heart">H</span>;
    registerIcon("heart", CustomHeart);
    expect(getIcon("heart")).toBe(CustomHeart);
  });

  it("IconProvider overrides win over the global registry", () => {
    const DomainBell = () => <span data-testid="domain-bell">B</span>;
    render(
      <IconProvider overrides={{ bell: DomainBell }}>
        <Icon name="bell" />
      </IconProvider>,
    );
    expect(screen.getByTestId("domain-bell")).toBeInTheDocument();
  });

  it("IconProvider normalizes camelCase override keys", () => {
    const DomainBell = () => <span data-testid="domain-bell2">B2</span>;
    render(
      <IconProvider overrides={{ chevronDown: DomainBell }}>
        <Icon name="chevron-down" />
      </IconProvider>,
    );
    expect(screen.getByTestId("domain-bell2")).toBeInTheDocument();
  });

  it("Icon renders the default icon without a provider", () => {
    render(<Icon name="logout" />);
    // lucide renders an svg
    expect(document.querySelector("svg")).not.toBeNull();
  });

  it("Icon renders a lowercase lucide name", () => {
    render(<Icon name="heart" aria-label="heart-icon" />);
    expect(screen.getByLabelText("heart-icon")).toBeInTheDocument();
  });

  it("Icon renders a brand icon with an accessible label", () => {
    render(<Icon name="github" aria-label="github-icon" />);
    expect(screen.getByLabelText("github-icon")).toBeInTheDocument();
  });
});
