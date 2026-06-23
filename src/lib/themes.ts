import type { ThemeColors, ThemeId, ThemeMode, ThemePreset } from "./types";

/** CSS custom properties driven by the active palette */
export const THEME_CSS_VARS = {
  background: "--bg",
  backgroundAlt: "--bg-alt",
  surface: "--surface",
  surfaceElevated: "--bg-elevated",
  foreground: "--text",
  muted: "--text-muted",
  accent: "--accent",
  accentForeground: "--accent-fg",
  border: "--border",
  ring: "--ring",
} as const satisfies Record<keyof ThemeColors, string>;

/** Extra aliases some components still read */
const LEGACY_CSS_VARS: Partial<Record<keyof ThemeColors, string[]>> = {
  background: ["--background"],
  foreground: ["--foreground"],
  surfaceElevated: ["--surface-2"],
};

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "midnight",
    label: "Midnight Noir",
    description: "Deep charcoal with sapphire accent — default editorial dark",
    mode: "dark",
    colors: {
      background: "#09090b",
      backgroundAlt: "#0f0f14",
      surface: "#18181f",
      surfaceElevated: "#1f1f28",
      foreground: "#f4f4f5",
      muted: "#a1a1aa",
      accent: "#3b82f6",
      accentForeground: "#ffffff",
      border: "#2a2a35",
      ring: "#93c5fd",
    },
  },
  {
    id: "ivory",
    label: "Ivory Editorial",
    description: "Warm paper whites with ink text and restrained blue",
    mode: "light",
    colors: {
      background: "#faf8f5",
      backgroundAlt: "#f3efe8",
      surface: "#ffffff",
      surfaceElevated: "#f7f4ef",
      foreground: "#1c1917",
      muted: "#78716c",
      accent: "#1d4ed8",
      accentForeground: "#ffffff",
      border: "#e7e5e4",
      ring: "#3b82f6",
    },
  },
  {
    id: "slate",
    label: "Slate Minimal",
    description: "Cool monochrome with graphite and a single steel accent",
    mode: "dark",
    colors: {
      background: "#0c0f12",
      backgroundAlt: "#12161b",
      surface: "#171c22",
      surfaceElevated: "#1e252d",
      foreground: "#e8edf2",
      muted: "#8b98a5",
      accent: "#94a3b8",
      accentForeground: "#0c0f12",
      border: "#2a333d",
      ring: "#cbd5e1",
    },
  },
  {
    id: "burgundy",
    label: "Burgundy Luxe",
    description: "Wine and cream for a refined, classic presence",
    mode: "dark",
    colors: {
      background: "#140c0e",
      backgroundAlt: "#1a1013",
      surface: "#22151a",
      surfaceElevated: "#2c1c22",
      foreground: "#faf5f6",
      muted: "#b8a0a6",
      accent: "#9f1239",
      accentForeground: "#fff1f2",
      border: "#3d242c",
      ring: "#fb7185",
    },
  },
  {
    id: "forest",
    label: "Forest Ink",
    description: "Evergreen calm with moss highlights on deep ink",
    mode: "dark",
    colors: {
      background: "#0a100d",
      backgroundAlt: "#0f1712",
      surface: "#152019",
      surfaceElevated: "#1b2a21",
      foreground: "#ecf4ee",
      muted: "#8fa898",
      accent: "#2f6f4e",
      accentForeground: "#f0fdf4",
      border: "#24352b",
      ring: "#6ee7a8",
    },
  },
  {
    id: "champagne",
    label: "Champagne Gold",
    description: "Soft neutral light with understated metallic gold",
    mode: "light",
    colors: {
      background: "#faf9f6",
      backgroundAlt: "#f2efe8",
      surface: "#ffffff",
      surfaceElevated: "#f7f5f0",
      foreground: "#1a1814",
      muted: "#7a7468",
      accent: "#a16207",
      accentForeground: "#fffbeb",
      border: "#e5e0d6",
      ring: "#ca8a04",
    },
  },
  {
    id: "ocean",
    label: "Ocean Depth",
    description: "Navy horizon with teal accent — calm and professional",
    mode: "dark",
    colors: {
      background: "#070d14",
      backgroundAlt: "#0b1420",
      surface: "#101b2a",
      surfaceElevated: "#152234",
      foreground: "#e8f0f8",
      muted: "#8aa0b5",
      accent: "#0d9488",
      accentForeground: "#f0fdfa",
      border: "#1c2d42",
      ring: "#5eead4",
    },
  },
];

const PRESET_BY_ID = new Map(THEME_PRESETS.map((p) => [p.id, p]));

export const DEFAULT_THEME_ID: Exclude<ThemeId, "custom"> = "midnight";
export const DEFAULT_CUSTOM_COLORS: ThemeColors = { ...THEME_PRESETS[0].colors };

export const COLOR_FIELDS: ReadonlyArray<{
  key: keyof ThemeColors;
  label: string;
  help: string;
}> = [
  { key: "background", label: "Page background", help: "Main canvas behind all sections" },
  { key: "backgroundAlt", label: "Alternate section", help: "Striped / alt section backgrounds" },
  { key: "surface", label: "Cards & surfaces", help: "Cards, skill bars, timeline items" },
  { key: "surfaceElevated", label: "Elevated surface", help: "Nav, panel, secondary surfaces" },
  { key: "foreground", label: "Primary text", help: "Headings and body emphasis" },
  { key: "muted", label: "Muted text", help: "Secondary copy, meta labels" },
  { key: "accent", label: "Accent", help: "Buttons, links, progress, highlights" },
  { key: "accentForeground", label: "On accent", help: "Text on accent buttons" },
  { key: "border", label: "Borders", help: "Dividers and card outlines" },
  { key: "ring", label: "Focus ring", help: "Keyboard focus outline" },
];

export function getPreset(id: ThemeId): ThemePreset | undefined {
  if (id === "custom") return undefined;
  return PRESET_BY_ID.get(id);
}

export function resolveThemeColors(themeId: ThemeId, customColors: ThemeColors): ThemeColors {
  if (themeId === "custom") return customColors;
  return getPreset(themeId)?.colors ?? DEFAULT_CUSTOM_COLORS;
}

export function resolveThemeMode(themeId: ThemeId, colors: ThemeColors): ThemeMode {
  if (themeId !== "custom") {
    return getPreset(themeId)?.mode ?? "dark";
  }
  return relativeLuminance(colors.background) > 0.45 ? "light" : "dark";
}

/** Push palette tokens onto the document root for live preview. */
export function applyThemeToDocument(colors: ThemeColors, mode: ThemeMode): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  root.dataset.theme = mode;

  (Object.keys(THEME_CSS_VARS) as Array<keyof ThemeColors>).forEach((key) => {
    const value = colors[key];
    root.style.setProperty(THEME_CSS_VARS[key], value);
    LEGACY_CSS_VARS[key]?.forEach((alias) => root.style.setProperty(alias, value));
  });
}

export function applyPortfolioTheme(themeId: ThemeId, customColors: ThemeColors): void {
  const colors = resolveThemeColors(themeId, customColors);
  applyThemeToDocument(colors, resolveThemeMode(themeId, colors));
}

// —— Color utilities ————————————————————————————————————————————————

const HEX3 = /^#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])$/;
const HEX6 = /^#([0-9a-fA-F]{6})$/;
const HEX_ANY = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function expandHex(hex: string): string {
  const trimmed = hex.trim();
  const short = HEX3.exec(trimmed);
  if (short) {
    const [, r, g, b] = short;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return trimmed.toLowerCase();
}

export function normalizeHex(hex: string): string {
  const expanded = expandHex(hex);
  return HEX6.test(expanded) ? expanded : "#000000";
}

export function isValidHex(value: string): boolean {
  return HEX_ANY.test(value.trim());
}

/** WCAG relative luminance for sRGB hex (used for light/dark heuristic). */
export function relativeLuminance(hex: string): number {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!match) return 0;

  const channel = (part: string) => {
    const c = parseInt(part, 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };

  const r = channel(match[1]);
  const g = channel(match[2]);
  const b = channel(match[3]);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
