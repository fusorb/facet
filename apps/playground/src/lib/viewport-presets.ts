export const VIEWPORT_PRESETS = [
  { id: "desktop", label: "Desktop", width: "100%" },
  { id: "tablet", label: "Tablet", width: "768px" },
  { id: "mobile", label: "Mobile", width: "375px" },
] as const;

export type ViewportPresetId = (typeof VIEWPORT_PRESETS)[number]["id"];

export const DEFAULT_VIEWPORT: ViewportPresetId = "desktop";

export function getViewportWidth(id: string): string {
  return VIEWPORT_PRESETS.find((preset) => preset.id === id)?.width ?? "100%";
}
