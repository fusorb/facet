import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {
  LocationPicker,
  CountryInput,
  StateInput,
  LGAInput,
  DEFAULT_REGIONS,
  DEFAULT_COUNTRIES,
  DEFAULT_LOCALITIES,
  getRegionLabel,
  getLocalityLabel,
} from "./location-picker.js";

describe("LocationPicker", () => {
  it("renders the country select first", () => {
    render(<LocationPicker />);
    expect(screen.getByLabelText("Country")).toBeInTheDocument();
  });

  it("shows regions after a country is picked", async () => {
    const onValueChange = vi.fn();
    render(
      <LocationPicker
        value={{ country: "NG" }}
        onValueChange={onValueChange}
      />,
    );
    expect(screen.getByLabelText("Region")).toBeInTheDocument();
    // Radix Select portals its listbox to document.body.
    const region = screen.getByLabelText("Region");
    region.focus();
    fireEvent.keyDown(region, { key: "ArrowDown" });
    expect(await screen.findByText("Lagos")).toBeInTheDocument();
  });

  it("resets region and locality when the country changes", async () => {
    const onValueChange = vi.fn();
    render(
      <LocationPicker
        value={{ country: "NG", region: "lagos", locality: "ikeja" }}
        onValueChange={onValueChange}
        showLocality
      />,
    );
    const country = screen.getByLabelText("Country");
    country.focus();
    fireEvent.keyDown(country, { key: "ArrowDown" });
    const ghana = await screen.findByText("Ghana");
    fireEvent.click(ghana);
    expect(onValueChange).toHaveBeenLastCalledWith({
      country: "GH",
      region: undefined,
      locality: undefined,
    });
  });

  it("shows locality select only when showLocality is set", async () => {
    render(<LocationPicker value={{ country: "NG", region: "lagos" }} />);
    expect(screen.queryByLabelText("Locality")).not.toBeInTheDocument();

    render(
      <LocationPicker
        value={{ country: "NG", region: "lagos" }}
        showLocality
      />,
    );
    expect(screen.getByLabelText("Locality")).toBeInTheDocument();
  });

  it("lists localities for a selected region", async () => {
    render(
      <LocationPicker
        value={{ country: "NG", region: "lagos" }}
        showLocality
      />,
    );
    const locality = screen.getByLabelText("Locality");
    locality.focus();
    fireEvent.keyDown(locality, { key: "ArrowDown" });
    expect(await screen.findByText("Ikeja")).toBeInTheDocument();
  });

  it("uses async loadRegions when provided", async () => {
    const loadRegions = vi.fn(async () => [{ id: "tx", name: "Texas" }]);
    function Harness() {
      const [value, setValue] = React.useState<{
        country?: string;
        region?: string;
      }>({});
      return (
        <LocationPicker
          value={value}
          onValueChange={setValue}
          loadRegions={loadRegions}
        />
      );
    }
    render(<Harness />);
    // Pick a country; the controlled value updates and loadRegions fires.
    const country = screen.getByLabelText("Country");
    country.focus();
    fireEvent.keyDown(country, { key: "ArrowDown" });
    fireEvent.click(await screen.findByText("United States"));
    expect(loadRegions).toHaveBeenCalledWith("US");
    // The region select becomes available after a country is chosen.
    await waitFor(() =>
      expect(screen.getByLabelText("Region")).toBeInTheDocument(),
    );
  });

  it("exports the bundled datasets", () => {
    expect(DEFAULT_COUNTRIES.some((c) => c.code === "NG")).toBe(true);
    expect(DEFAULT_REGIONS.NG?.length).toBeGreaterThan(0);
  });

  it("covers every African country", () => {
    for (const c of [
      "DZ",
      "AO",
      "BJ",
      "BW",
      "BF",
      "BI",
      "CV",
      "CM",
      "CF",
      "TD",
      "KM",
      "CG",
      "CD",
      "CI",
      "DJ",
      "EG",
      "GQ",
      "ER",
      "SZ",
      "ET",
      "GA",
      "GM",
      "GH",
      "GN",
      "GW",
      "KE",
      "LS",
      "LR",
      "LY",
      "MG",
      "MW",
      "ML",
      "MR",
      "MU",
      "MA",
      "MZ",
      "NA",
      "NE",
      "NG",
      "RW",
      "ST",
      "SN",
      "SC",
      "SL",
      "SO",
      "ZA",
      "SS",
      "SD",
      "TZ",
      "TG",
      "TN",
      "UG",
      "ZM",
      "ZW",
    ]) {
      expect(
        DEFAULT_COUNTRIES.some((x) => x.code === c),
        `missing ${c}`,
      ).toBe(true);
    }
  });

  it("lists all 36 Nigerian states + FCT", () => {
    expect(DEFAULT_REGIONS.NG).toHaveLength(37);
    for (const s of [
      "lagos",
      "kano",
      "rivers",
      "oyo",
      "anambra",
      "enugu",
      "delta",
      "fct",
    ]) {
      expect(
        DEFAULT_REGIONS.NG!.some((r) => r.id === s),
        `missing ${s}`,
      ).toBe(true);
    }
  });

  it("carries full state/region lists for the covered countries", () => {
    // Derived from the dr5hn countries-states dataset (ODbL).
    expect(DEFAULT_REGIONS.US!.length).toBeGreaterThanOrEqual(51);
    expect(DEFAULT_REGIONS.KE).toHaveLength(47);
    expect(DEFAULT_REGIONS.GH).toHaveLength(16);
    expect(DEFAULT_REGIONS.IN!.length).toBeGreaterThanOrEqual(28);
    expect(DEFAULT_REGIONS.CN).toHaveLength(34);
    expect(DEFAULT_REGIONS.BR).toHaveLength(27);
    expect(DEFAULT_REGIONS.EG).toHaveLength(27);
    expect(DEFAULT_REGIONS.TZ).toHaveLength(31);
    expect(DEFAULT_REGIONS.ZA).toHaveLength(9);
    expect(DEFAULT_REGIONS.AE).toHaveLength(7);
    expect(DEFAULT_REGIONS.GB!.length).toBeGreaterThanOrEqual(4);
    expect(DEFAULT_REGIONS.RW).toHaveLength(5);
  });

  it("ships regions for the full country list", () => {
    // Every country in DEFAULT_COUNTRIES has a DEFAULT_REGIONS entry.
    for (const c of DEFAULT_COUNTRIES) {
      expect(
        DEFAULT_REGIONS[c.code],
        `missing regions for ${c.code}`,
      ).toBeDefined();
    }
  });

  it("has full LGA depth for all Nigerian states", () => {
    // The full official dataset: 36 states + FCT, ~774 LGAs.
    expect(DEFAULT_LOCALITIES.NG!.lagos!.length).toBeGreaterThan(10);
    expect(DEFAULT_LOCALITIES.NG!.fct!.some((l) => l.id === "fct-bwari")).toBe(
      true,
    );
    // Spot-check a few states have LGA lists now.
    expect(DEFAULT_LOCALITIES.NG!.kaduna!.length).toBeGreaterThan(5);
    expect(DEFAULT_LOCALITIES.NG!.kano!.length).toBeGreaterThan(10);
    // Every state in DEFAULT_REGIONS.NG has a localities entry.
    for (const region of DEFAULT_REGIONS.NG!) {
      expect(
        DEFAULT_LOCALITIES.NG![region.id]?.length,
        `missing LGAs for ${region.id}`,
      ).toBeGreaterThan(0);
    }
    // Roughly the official 774 (we ship 775 with the FCT municipality).
    const total = Object.values(DEFAULT_LOCALITIES.NG!).reduce(
      (sum, list) => sum + list.length,
      0,
    );
    expect(total).toBeGreaterThanOrEqual(774);
  });
});

describe("CountryInput / StateInput / LGAInput", () => {
  it("CountryInput lists countries and reports the selection", async () => {
    const onValueChange = vi.fn();
    render(<CountryInput value="NG" onValueChange={onValueChange} />);
    const trigger = screen.getByLabelText("Country");
    trigger.focus();
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    fireEvent.click(await screen.findByText("Ghana"));
    expect(onValueChange).toHaveBeenLastCalledWith("GH");
  });

  it("StateInput shows a country's states once a country is given", async () => {
    render(<StateInput country="GH" />);
    const trigger = screen.getByLabelText("Region");
    trigger.focus();
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    expect(await screen.findByText("Greater Accra")).toBeInTheDocument();
  });

  it("StateInput renders a resolved country tag on the trigger", () => {
    render(<StateInput country="NG" />);
    // The trigger shows the country code badge resolved from DEFAULT_COUNTRIES.
    expect(screen.getByLabelText("Region")).toHaveTextContent("NG");
    expect(screen.getByLabelText("Region")).toHaveTextContent("Nigeria");
  });

  it("LGAInput renders a resolved country tag", () => {
    render(<LGAInput country="NG" region="lagos" />);
    expect(screen.getByLabelText("Locality")).toHaveTextContent("NG");
    expect(screen.getByLabelText("Locality")).toHaveTextContent("Nigeria");
  });

  it("StateInput is inert without a country", () => {
    render(<StateInput />);
    expect(screen.getByLabelText("Region")).toBeDisabled();
  });

  it("LGAInput lists localities for a country + state", async () => {
    render(<LGAInput country="NG" region="lagos" />);
    const trigger = screen.getByLabelText("Locality");
    trigger.focus();
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    expect(await screen.findByText("Ikeja")).toBeInTheDocument();
  });

  it("LGAInput is inert without a state", () => {
    render(<LGAInput country="NG" />);
    expect(screen.getByLabelText("Locality")).toBeDisabled();
  });

  it("resolves dynamic region labels per country", () => {
    // Nigeria calls its divisions states; Kenya calls them counties.
    expect(getRegionLabel("NG")).toBe("state");
    expect(getRegionLabel("KE")).toBe("county");
    expect(getRegionLabel("ZA")).toBe("province");
    expect(getRegionLabel("AE")).toBe("emirate");
    expect(getRegionLabel("EG")).toBe("governorate");
    expect(getRegionLabel("CN")).toBe("province");
    expect(getRegionLabel(undefined)).toBe("region");
  });

  it("resolves dynamic locality labels per country", () => {
    expect(getLocalityLabel("NG")).toBe("LGA");
    expect(getLocalityLabel("US")).toBe("county");
    expect(getLocalityLabel("GB")).toBe("district");
    expect(getLocalityLabel(undefined)).toBe("locality");
  });

  it("StateInput shows the dynamic region term in its placeholder", () => {
    render(<StateInput country="KE" />);
    // Kenya -> county, so the trigger placeholder says "Select county".
    expect(screen.getByLabelText("Region")).toHaveTextContent("Select county");
  });

  it("StateInput shows a search box when searchable", async () => {
    render(<StateInput country="NG" />);
    const trigger = screen.getByLabelText("Region");
    trigger.focus();
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    // The search input appears inside the select content.
    expect(
      await screen.findByPlaceholderText("Search states..."),
    ).toBeInTheDocument();
  });

  it("CountryInput shows a search box and filters by text", async () => {
    render(<CountryInput />);
    const trigger = screen.getByLabelText("Country");
    trigger.focus();
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    const search = await screen.findByPlaceholderText("Search countries...");
    fireEvent.change(search, { target: { value: "nig" } });
    // Nigeria remains; unrelated entries are filtered out.
    expect(screen.getByText("Nigeria")).toBeInTheDocument();
    expect(screen.queryByText("Algeria")).not.toBeInTheDocument();
  });
});
