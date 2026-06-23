"use client";

import { usePortfolioStore } from "@/lib/store";
import {
  COLOR_FIELDS,
  DEFAULT_CUSTOM_COLORS,
  THEME_PRESETS,
  expandHex,
  isValidHex,
  normalizeHex,
  resolveThemeColors,
} from "@/lib/themes";
import type { ThemeColors, ThemePreset } from "@/lib/types";

function SwatchStrip({ colors }: { colors: ThemeColors }) {
  return (
    <span className="theme-swatches" aria-hidden="true">
      <span style={{ background: colors.background }} />
      <span style={{ background: colors.surface }} />
      <span style={{ background: colors.accent }} />
      <span style={{ background: colors.foreground }} />
    </span>
  );
}

function PresetCard({
  selected,
  label,
  description,
  colors,
  onSelect,
}: {
  selected: boolean;
  label: string;
  description: string;
  colors: ThemeColors;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      className={`theme-preset-card${selected ? " is-selected" : ""}`}
      onClick={onSelect}
    >
      <SwatchStrip colors={colors} />
      <span className="theme-preset-meta">
        <strong>{label}</strong>
        <span className="muted tiny">{description}</span>
      </span>
    </button>
  );
}

function LivePreview({ palette }: { palette: ThemeColors }) {
  const chips: Array<{ label: string; bg: string; fg: string; border: string }> = [
    {
      label: "Page",
      bg: palette.background,
      fg: palette.foreground,
      border: palette.border,
    },
    {
      label: "Card",
      bg: palette.surface,
      fg: palette.foreground,
      border: palette.border,
    },
    {
      label: "Accent",
      bg: palette.accent,
      fg: palette.accentForeground,
      border: palette.accent,
    },
  ];

  return (
    <div className="theme-live-preview" aria-hidden="true">
      {chips.map((chip) => (
        <span
          key={chip.label}
          className="theme-live-chip"
          style={{
            background: chip.bg,
            color: chip.fg,
            borderColor: chip.border,
          }}
        >
          {chip.label}
        </span>
      ))}
    </div>
  );
}

function ColorFieldRow({
  fieldKey,
  label,
  help,
  value,
  onChange,
}: {
  fieldKey: keyof ThemeColors;
  label: string;
  help: string;
  value: string;
  onChange: (key: keyof ThemeColors, value: string) => void;
}) {
  return (
    <li className="theme-color-row">
      <label className="theme-color-label">
        <span className="theme-color-name">{label}</span>
        <span className="muted tiny">{help}</span>
      </label>
      <div className="theme-color-inputs">
        <input
          type="color"
          value={normalizeHex(value)}
          aria-label={`${label} color picker`}
          onChange={(e) => onChange(fieldKey, e.target.value)}
        />
        <input
          type="text"
          className="theme-hex-input"
          value={value}
          spellCheck={false}
          aria-label={`${label} hex value`}
          onChange={(e) => {
            const next = e.target.value.trim();
            if (isValidHex(next)) onChange(fieldKey, expandHex(next));
          }}
        />
      </div>
    </li>
  );
}

export function ThemeEditor() {
  const data = usePortfolioStore((s) => s.data);
  const setThemeId = usePortfolioStore((s) => s.setThemeId);
  const setCustomColor = usePortfolioStore((s) => s.setCustomColor);
  const setCustomColors = usePortfolioStore((s) => s.setCustomColors);

  const activePalette = resolveThemeColors(data.themeId, data.customColors);
  const isCustom = data.themeId === "custom";

  const selectPreset = (preset: ThemePreset) => setThemeId(preset.id);

  const selectCustomAtelier = () => {
    if (!isCustom) {
      setCustomColors({ ...activePalette });
      return;
    }
    setThemeId("custom");
  };

  const fieldValue = (key: keyof ThemeColors) =>
    isCustom ? data.customColors[key] : activePalette[key];

  return (
    <div className="form-stack theme-editor">
      <p className="muted tiny">
        Choose a classy preset, or refine every surface on the page with custom
        colors. Changes apply live.
      </p>

      <fieldset className="form-fieldset theme-presets-fieldset">
        <legend>Presets</legend>
        <ul className="theme-preset-grid" role="listbox" aria-label="Theme presets">
          {THEME_PRESETS.map((preset) => (
            <li key={preset.id}>
              <PresetCard
                selected={data.themeId === preset.id}
                label={preset.label}
                description={preset.description}
                colors={preset.colors}
                onSelect={() => selectPreset(preset)}
              />
            </li>
          ))}
          <li>
            <PresetCard
              selected={isCustom}
              label="Custom atelier"
              description="Pick colors for page, cards, text, accents, borders & focus"
              colors={data.customColors}
              onSelect={selectCustomAtelier}
            />
          </li>
        </ul>
      </fieldset>

      <LivePreview palette={activePalette} />

      <fieldset className="form-fieldset">
        <legend>
          Element colors{!isCustom ? " (switches to Custom)" : ""}
        </legend>
        <p className="muted tiny" style={{ marginTop: 0 }}>
          Adjust any token below. Editing a color selects the Custom atelier theme.
        </p>
        <ul className="theme-color-fields">
          {COLOR_FIELDS.map((field) => (
            <ColorFieldRow
              key={field.key}
              fieldKey={field.key}
              label={field.label}
              help={field.help}
              value={fieldValue(field.key)}
              onChange={setCustomColor}
            />
          ))}
        </ul>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => setCustomColors({ ...DEFAULT_CUSTOM_COLORS })}
        >
          Reset custom palette to Midnight defaults
        </button>
      </fieldset>
    </div>
  );
}
