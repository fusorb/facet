import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  CountryCodeInput,
  getCountryCode,
  getCountryName,
  COMMON_COUNTRY_CODES,
  ISO_COUNTRY_CODES,
  filterCountryCodes,
} from "./country-code-input.js";

describe("getCountryCode", () => {
  it("resolves dial codes from the default list", () => {
    expect(getCountryCode("NG")).toBe("+234");
    expect(getCountryCode("US")).toBe("+1");
  });

  it("falls back to +1 for unknown countries", () => {
    expect(getCountryCode("ZZ")).toBe("+1");
  });

  it("resolves names from the list", () => {
    expect(getCountryName("NG")).toBe("Nigeria");
    expect(getCountryName("US")).toBe("United States");
  });
});

describe("ISO_COUNTRY_CODES", () => {
  it("is a full ISO dial-code list", () => {
    expect(ISO_COUNTRY_CODES.length).toBeGreaterThan(100);
    // Major economies present.
    for (const c of [
      "US",
      "GB",
      "NG",
      "GH",
      "KE",
      "ZA",
      "IN",
      "CN",
      "JP",
      "DE",
      "FR",
      "BR",
      "MX",
    ]) {
      expect(ISO_COUNTRY_CODES.some((x) => x.country === c)).toBe(true);
    }
  });

  it("resolves codes from the full list", () => {
    expect(getCountryCode("NG", ISO_COUNTRY_CODES)).toBe("+234");
    expect(getCountryCode("FR", ISO_COUNTRY_CODES)).toBe("+33");
  });

  it("keeps every entry region-tagged", () => {
    for (const c of ISO_COUNTRY_CODES) {
      expect(c.region, `missing region for ${c.country}`).toBeTruthy();
      expect(c.name, `missing name for ${c.country}`).toBeTruthy();
    }
  });
});

describe("filterCountryCodes", () => {
  it("keeps only the requested regions", () => {
    const out = filterCountryCodes(ISO_COUNTRY_CODES, ["africa"]);
    expect(out.length).toBeGreaterThan(50);
    expect(out.every((c) => c.region === "africa")).toBe(true);
    expect(out.some((c) => c.country === "NG")).toBe(true);
  });

  it("drops the excluded regions", () => {
    const out = filterCountryCodes(ISO_COUNTRY_CODES, undefined, ["europe"]);
    expect(out.some((c) => c.region === "europe")).toBe(false);
    expect(out.some((c) => c.country === "US")).toBe(true);
  });

  it("leaves entries without a region untouched by filters", () => {
    const out = filterCountryCodes(COMMON_COUNTRY_CODES, ["africa"]);
    expect(out.length).toBe(COMMON_COUNTRY_CODES.length);
  });
});

describe("CountryCodeInput", () => {
  it("renders the default country and number", () => {
    render(
      <CountryCodeInput value={{ country: "NG", number: "8012345678" }} />,
    );
    expect(screen.getByPlaceholderText("Phone number")).toHaveValue(
      "8012345678",
    );
  });

  it("renders a label when provided", () => {
    render(
      <CountryCodeInput label="Mobile" value={{ country: "US", number: "" }} />,
    );
    expect(screen.getByText("Mobile")).toBeInTheDocument();
  });

  it("updates the number and keeps the country", () => {
    const onValueChange = vi.fn();
    render(
      <CountryCodeInput
        value={{ country: "US", number: "" }}
        onValueChange={onValueChange}
      />,
    );
    fireEvent.change(screen.getByPlaceholderText("Phone number"), {
      target: { value: "5551234" },
    });
    expect(onValueChange).toHaveBeenLastCalledWith({
      country: "US",
      number: "5551234",
    });
  });

  it("changes the country code via the select", async () => {
    const onValueChange = vi.fn();
    render(
      <CountryCodeInput
        value={{ country: "US", number: "123" }}
        onValueChange={onValueChange}
      />,
    );
    const trigger = screen.getByLabelText("Country code");
    trigger.focus();
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    const ng = await screen.findByText("Nigeria (+234)");
    fireEvent.click(ng);
    expect(onValueChange).toHaveBeenLastCalledWith({
      country: "NG",
      number: "123",
    });
  });

  it("exports the common country list", () => {
    expect(COMMON_COUNTRY_CODES.length).toBeGreaterThan(5);
    expect(COMMON_COUNTRY_CODES.some((c) => c.country === "NG")).toBe(true);
  });

  it("restricts to a region via the regions prop", async () => {
    render(<CountryCodeInput regions={["US", "CA"]} />);
    const trigger = screen.getByLabelText("Country code");
    trigger.focus();
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    const us = await screen.findByText("United States (+1)");
    expect(us).toBeInTheDocument();
    expect(screen.queryByText("Nigeria (+234)")).not.toBeInTheDocument();
  });

  it("supports include and exclude filters", async () => {
    const { unmount } = render(<CountryCodeInput include={["US", "GB"]} />);
    const trigger = screen.getByLabelText("Country code");
    trigger.focus();
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    // COMMON list rows carry a combined label.
    expect(await screen.findByText("United States (+1)")).toBeInTheDocument();
    expect(screen.queryByText("Nigeria (+234)")).not.toBeInTheDocument();
    unmount();

    render(<CountryCodeInput countries={ISO_COUNTRY_CODES} exclude={["US"]} />);
    const t2 = screen.getByLabelText("Country code");
    t2.focus();
    fireEvent.keyDown(t2, { key: "ArrowDown" });
    // ISO rows render the bare country name.
    expect(await screen.findByText("United Kingdom")).toBeInTheDocument();
    expect(screen.queryByText("United States")).not.toBeInTheDocument();
  });

  it("defaults to the first available country when restricted", () => {
    render(<CountryCodeInput include={["GH"]} />);
    // Default country should be Ghana since it's the only one.
    expect(screen.getByText("GH")).toBeInTheDocument();
  });

  it("filters the full list by world region", async () => {
    render(
      <CountryCodeInput
        countries={ISO_COUNTRY_CODES}
        includeRegions={["africa"]}
      />,
    );
    const trigger = screen.getByLabelText("Country code");
    trigger.focus();
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    expect(await screen.findByText("Nigeria")).toBeInTheDocument();
    expect(screen.queryByText("United States")).not.toBeInTheDocument();
  });

  it("groups the full list by region in the dropdown", async () => {
    render(<CountryCodeInput countries={ISO_COUNTRY_CODES} />);
    const trigger = screen.getByLabelText("Country code");
    trigger.focus();
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    expect(await screen.findByText("Africa")).toBeInTheDocument();
    expect(screen.getByText("Europe")).toBeInTheDocument();
  });

  it("excludes a world region from the full list", async () => {
    render(
      <CountryCodeInput
        countries={ISO_COUNTRY_CODES}
        excludeRegions={["europe"]}
      />,
    );
    const trigger = screen.getByLabelText("Country code");
    trigger.focus();
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    expect(await screen.findByText("Nigeria")).toBeInTheDocument();
    expect(screen.queryByText("Germany")).not.toBeInTheDocument();
  });

  it("resolves the name for a full-list country", () => {
    expect(getCountryName("NG", ISO_COUNTRY_CODES)).toBe("Nigeria");
    expect(getCountryName("BR", ISO_COUNTRY_CODES)).toBe("Brazil");
  });
});
