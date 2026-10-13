export const THEME_COLORS = [
  {
    name: "zinc",
    label: "Zinc",
    swatch: "#71717a",
  },
  {
    name: "blue",
    label: "Blue",
    swatch: "#2563eb",
  },
  {
    name: "emerald",
    label: "Emerald",
    swatch: "#059669",
  },
  {
    name: "violet",
    label: "Violet",
    swatch: "#7c3aed",
  },
  {
    name: "rose",
    label: "Rose",
    swatch: "#e11d48",
  },
  {
    name: "amber",
    label: "Amber",
    swatch: "#d97706",
  },
  {
    name: "cyan",
    label: "Cyan",
    swatch: "#0891b2",
  },
] as const;

export type ThemeColor = (typeof THEME_COLORS)[number]["name"];
export const DEFAULT_THEME_COLOR: ThemeColor = "zinc";

export const THEME_RADII = [
  { value: "0", label: "0" },
  { value: "0.3", label: "0.3" },
  { value: "0.5", label: "0.5" },
  { value: "0.625", label: "0.625" },
  { value: "0.75", label: "0.75" },
  { value: "1.0", label: "1.0" },
] as const;

export type ThemeRadius = (typeof THEME_RADII)[number]["value"];
export const DEFAULT_THEME_RADIUS: ThemeRadius = "0.625";

export const THEME_MODES = ["light", "dark", "system"] as const;
export type ThemeMode = (typeof THEME_MODES)[number];
export const DEFAULT_THEME_MODE: ThemeMode = "system";

export function isThemeColor(val: unknown): val is ThemeColor {
  return THEME_COLORS.some((c) => c.name === val);
}

export function isThemeRadius(val: unknown): val is ThemeRadius {
  return THEME_RADII.some((r) => r.value === val);
}

export function isThemeMode(val: unknown): val is ThemeMode {
  return typeof val === "string" && THEME_MODES.includes(val as ThemeMode);
}
