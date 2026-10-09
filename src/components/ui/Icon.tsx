import React from "react";

export type IconName =
  | "play" | "pause" | "sparkle" | "fit" | "plus" | "minus" | "recenter" | "share" | "download"
  | "palette" | "sliders" | "layers" | "image" | "wand" | "info" | "chevronDown" | "chevronLeft"
  | "chevronRight" | "close" | "search";

const PATHS: Record<IconName, string> = {
  play: "M7 4l13 8-13 8z",
  pause: "M7 4h4v16H7zM13 4h4v16h-4z",
  sparkle: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z",
  fit: "M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  recenter: "M12 2v4M12 18v4M2 12h4M18 12h4M12 8a4 4 0 100 8 4 4 0 000-8z",
  share: "M18 8a3 3 0 10-2.8-4M6 15a3 3 0 100-6 3 3 0 000 6zM18 22a3 3 0 100-6 3 3 0 000 6zM8.6 13.5l6.8 4M15.4 6.5l-6.8 4",
  download: "M12 3v12M7 10l5 5 5-5M4 21h16",
  palette: "M12 3a9 9 0 100 18c1 0 1.5-.7 1.5-1.5 0-.4-.2-.8-.4-1.1-.3-.3-.4-.6-.4-1 0-.8.7-1.4 1.5-1.4H16a5 5 0 005-5c0-4.4-4-8-9-8zM7.5 12.5h.01M9.5 8.5h.01M14.5 8.5h.01",
  sliders: "M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0M14 4v4M8 10v4M16 16v4",
  layers: "M12 3l9 5-9 5-9-5zM3 13l9 5 9-5",
  image: "M4 4h16v16H4zM4 16l5-5 4 4 3-3 4 4M15 8h.01",
  wand: "M15 4V2M15 10V8M11 6h2M17 6h2M4 20l10-10",
  info: "M12 8h.01M11 12h1v5h1M12 21a9 9 0 100-18 9 9 0 000 18z",
  chevronDown: "M6 9l6 6 6-6",
  chevronLeft: "M15 6l-6 6 6 6",
  chevronRight: "M9 6l6 6-6 6",
  close: "M6 6l12 12M18 6L6 18",
  search: "M11 18a7 7 0 100-14 7 7 0 000 14zM21 21l-5-5",
};

export const Icon: React.FC<{ name: IconName; size?: number }> = ({ name, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={name === "play" || name === "pause" ? "currentColor" : "none"}
    stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d={PATHS[name]} />
  </svg>
);
