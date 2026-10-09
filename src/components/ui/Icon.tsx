import React from "react";

// Icons use Google's Material Symbols Outlined font (the icon set of the Stitch designs).
// Legacy short names map to Material glyphs; any other string is used as a glyph name directly.
const ALIASES = {
  play: "play_arrow",
  pause: "pause",
  sparkle: "auto_awesome",
  fit: "fit_screen",
  plus: "add",
  minus: "remove",
  recenter: "center_focus_strong",
  share: "share",
  download: "download",
  palette: "palette",
  sliders: "tune",
  layers: "category",
  image: "aspect_ratio",
  wand: "auto_fix_high",
  info: "help",
  chevronDown: "expand_more",
  chevronLeft: "chevron_left",
  chevronRight: "chevron_right",
  close: "close",
  search: "search",
} as const;

export type IconName = keyof typeof ALIASES | (string & {});

export const Icon: React.FC<{ name: IconName; size?: number; filled?: boolean; className?: string }> = ({
  name,
  size = 18,
  filled = false,
  className,
}) => (
  <span
    className={`material-symbols-outlined${className ? ` ${className}` : ""}`}
    aria-hidden="true"
    style={{
      fontSize: `${size}px`,
      fontVariationSettings: filled ? "'FILL' 1" : undefined,
    }}
  >
    {(ALIASES as Record<string, string>)[name] ?? name}
  </span>
);
