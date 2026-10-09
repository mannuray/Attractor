# UI Redesign (Canvas-First + Mobile) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the sidebar UI with a canvas-first desktop layout (top bar + right inspector + floating toolbar) and a touch-friendly mobile layout (full-screen canvas + bottom sheet), restyled to the Stitch "Chaos Iterator" design system across all 5 themes.

**Architecture:** `Home.tsx` keeps every hook and handler and builds one `ShellProps` bag. `ResponsiveShell` picks `DesktopShell` or `MobileShell` via `useIsMobile()`; both compose the same panel components (`SystemPanel`, `RenderPanel`, `ColorPanel`, `FxPanel`, `StatsReadout`). Shared attractor control primitives are restyled in place so the 27 per-system `Controls.tsx` files change appearance without edits. Canvas input moves to Pointer Events so mouse and touch share one path.

**Tech Stack:** React 18, TypeScript 4.9, styled-components 6, react-router 6, CRA (`react-scripts` 5) with Jest + @testing-library/react 13.

**Spec:** `docs/superpowers/specs/2026-10-09-ui-redesign-design.md`

**Visual reference:** Stitch project `projects/13329545837469135411` — desktop `f301eeef5a254938af876ae20f3b4e95`, mobile peek `1e9078957b7d4cf2a1569b4306cc64f6`, mobile params `4ab03adee83b482d949eb2111465da2a`, export modal `887827611c674b59a3d689909f12ec04`. Use the Stitch MCP `get_screen` tool to fetch screenshots when styling.

## Global Constraints

- Do not modify hooks' state logic, workers, iterators, math, URL sync format: `useAttractorState`, `usePalette`, `useCanvasWorker`, `useExportWorker`, `useUrlSync`, `src/model-controller/**`, `src/attractors/*/config.ts|types.ts|index.ts`. Only `useFractalZoom` handler signatures change (Task 10); its exported `calculate*` functions stay byte-identical.
- Do not edit the 27 `src/attractors/<system>/Controls.tsx` files; restyle via `src/attractors/shared/*`.
- Mobile breakpoint: `(max-width: 1023px)` is mobile; ≥ 1024px is desktop.
- Touch targets ≥ 44px on mobile. No horizontal page scroll at 390px width.
- Fonts: `Inter` for UI, `JetBrains Mono` for numbers/values.
- Labels use plain wording: "Parameters", "Presets", "Size", "Quality", "Background", "Effects". No "System.Theme", "Core.System", "EXPORT.HD"-style labels.
- Stats show only computed values: iterations, points/sec (derived from iteration count over time), elapsed run time; fractals show max iterations ("Complexity"). No FPS, Lyapunov, equation overlay.
- Export offers only existing capabilities: current view, 1080, 1440, 2160, 4320 (PNG). No JPG/WebP/transparent toggles.
- Keep all 5 themes and the theme switcher; Cyber Cyan uses primary `rgb(6, 182, 212)` and secondary `rgb(139, 92, 246)`.
- Respect `prefers-reduced-motion: reduce` (no slide/glow animations).
- Run tests with: `CI=true npm test -- --watchAll=false` (optionally append a path pattern).
- Commit after every task with message ending in `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Work on branch `ui-redesign`.

## Review Focus

1. **Clipboard unavailable** (non-HTTPS preview, denied permission, `navigator.clipboard` undefined): Share must show "Couldn't copy", never throw. → test in Task 7 (`useShare`).
2. **Pinch with degenerate input** (both fingers at the same point, a finger lifting mid-pinch, a third finger): zoom must stay a finite number within [0.1, 4]. → tests in Task 2 (`gestureMath`).
3. **Theme switch while background is "Ink"**: Ink is the theme's page color, which changes with theme; the Background control must still show Ink selected. → test in Task 2 (`bgMode`).
4. **Crossing the 1024px breakpoint (rotate phone / resize window) while rendering**: the shell swaps without resetting system, parameters, or run state. → test in Task 8 (`ResponsiveShell`).
5. **Closing the Export modal during an export** (backdrop click, X, Escape): must be ignored while `exporting` is true, as today. → test in Task 11 (`ExportModal`).

---

## File Structure

```
src/theme/
  themes.ts                 MODIFY  ThemeColors gains design tokens; 5 themes built via designColors()
  tokens.ts                 CREATE  non-color tokens: radii, fonts, z-index, breakpoints
src/hooks/
  useIsMobile.ts            CREATE  matchMedia breakpoint hook
  useShare.ts               CREATE  copy URL → "idle" | "copied" | "failed"
  useFractalZoom.ts         MODIFY  point-based beginDrag/moveDrag/endDrag
  index.ts                  MODIFY  export new hooks
src/lib/
  bgMode.ts                 CREATE  Void/Ink/Paper <-> BgColor
  gestureMath.ts            CREATE  distance, midpoint, pinchZoom, clampZoom
  sheetState.ts             CREATE  bottom-sheet reducer
  statsSample.ts            CREATE  iterations/rate/elapsed sampler
src/components/ui/
  Segmented.tsx             CREATE  segmented control
  Chip.tsx                  CREATE  selectable chip
  IconButton.tsx            CREATE  toolbar/top-bar icon button
  Icon.tsx                  CREATE  inline SVG icon set
src/components/panels/
  SystemPanel.tsx           CREATE  category chips + search + module list
  RenderPanel.tsx           CREATE  canvas size + quality
  ColorPanel.tsx            CREATE  palette strip + edit + background
  FxPanel.tsx               CREATE  FX toggle + sliders (replaces FXControls)
  StatsReadout.tsx          CREATE  live stats (replaces LiveStats)
src/components/shell/
  types.ts                  CREATE  ShellProps
  TopBar.tsx                CREATE
  Inspector.tsx             CREATE  (replaces Sidebar)
  CanvasToolbar.tsx         CREATE  (replaces SystemCommandBar)
  BottomSheet.tsx           CREATE
  DesktopShell.tsx          CREATE
  MobileShell.tsx           CREATE
  ResponsiveShell.tsx       CREATE
src/components/
  CanvasArea.tsx            MODIFY  pointer/touch gestures, new props
  ExportModal.tsx           MODIFY  new layout
  ModalStyles.ts            MODIFY  glass2 dialog / mobile sheet
  PaletteModal.tsx          MODIFY  restyle
  Sidebar.tsx, SystemCommandBar.tsx, FloatingPanels.tsx, FXControls.tsx, LiveStats.tsx   DELETE (Task 8)
  index.ts                  MODIFY
src/attractors/shared/
  styles.ts, ParameterInput.tsx, PresetSelector.tsx   MODIFY  restyle
src/view/pages/Home.tsx      MODIFY  build ShellProps, render ResponsiveShell
src/view/components/colorbar.tsx  MODIFY  mouse → pointer events
src/index.css, public/index.html  MODIFY  fonts, globals, reduced motion
src/App.test.js              DELETE  stale CRA template test
```

Tests live in `src/__tests__/` (existing convention).

---

### Task 0: Setup and baseline

**Files:**
- Delete: `src/App.test.js`
- Modify: `public/index.html`, `src/index.css`

- [ ] **Step 1: Install dependencies**

Run: `npm ci`
Expected: completes; `node_modules/typescript` exists.

- [ ] **Step 2: Run the suite to get a baseline**

Run: `CI=true npm test -- --watchAll=false`
Expected: `src/__tests__/*` pass; `src/App.test.js` FAILS (it looks for the CRA "learn react" text that does not exist).

- [ ] **Step 3: Delete the stale template test**

```bash
git rm src/App.test.js
```

- [ ] **Step 4: Load fonts** — in `public/index.html`, directly after the `<meta name="viewport" ...>` line, add:

```html
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
```

Also change the viewport meta to `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />` (safe-area insets on phones).

- [ ] **Step 5: Global reduced-motion and overscroll rules** — append to `src/index.css`:

```css
html, body, #root {
  height: 100%;
  overscroll-behavior: none;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 6: Run the suite**

Run: `CI=true npm test -- --watchAll=false`
Expected: all PASS.

- [ ] **Step 7: Commit**

```bash
git add -A public/index.html src/index.css src/App.test.js
git commit -m "chore: load UI fonts, add reduced-motion globals, drop stale CRA test"
```

---

### Task 1: Theme tokens

**Files:**
- Modify: `src/theme/themes.ts`
- Create: `src/theme/tokens.ts`
- Test: `src/__tests__/themes.test.ts`

**Interfaces:**
- Produces: `ThemeColors` gains keys `primary, primarySoft, primaryBorder, focusBorder, onPrimary, secondary, secondarySoft, glowPrimary, glowSecondary, canvasBg, surface, surfaceLow, surfaceHigh, glass1, glass2, hairline, hairlineStrong, textHigh, textMid, textLow` (all `string`). All existing keys remain.
- Produces: `tokens` from `src/theme/tokens.ts`: `{ radius: { sm, md, lg, full }, font: { ui, mono }, z: { canvas, toolbar, panel, sheet, modal }, breakpoint: { mobileMax } }`.

- [ ] **Step 1: Write the failing test** — `src/__tests__/themes.test.ts`:

```ts
import { themes } from "../theme/themes";
import { tokens } from "../theme/tokens";

const NEW_KEYS = [
  "primary", "primarySoft", "primaryBorder", "focusBorder", "onPrimary",
  "secondary", "secondarySoft", "glowPrimary", "glowSecondary",
  "canvasBg", "surface", "surfaceLow", "surfaceHigh", "glass1", "glass2",
  "hairline", "hairlineStrong", "textHigh", "textMid", "textLow",
];
const LEGACY_KEYS = ["accent", "accentBorder", "glassBg", "bgPage", "danger"];

describe("themes", () => {
  it("keeps all five themes", () => {
    expect(Object.keys(themes)).toEqual([
      "cyber_cyan", "electric_indigo", "emerald_matrix", "solar_flare", "crimson_void",
    ]);
  });

  it.each(Object.keys(themes))("%s has every design token and legacy key", (id) => {
    const c = themes[id].colors as unknown as Record<string, string>;
    for (const k of [...NEW_KEYS, ...LEGACY_KEYS]) {
      expect(typeof c[k]).toBe("string");
      expect(c[k].length).toBeGreaterThan(0);
    }
  });

  it("cyber cyan matches the Stitch palette", () => {
    expect(themes.cyber_cyan.colors.primary).toBe("rgba(6, 182, 212, 1)");
    expect(themes.cyber_cyan.colors.secondary).toBe("rgba(139, 92, 246, 1)");
  });

  it("exposes non-color tokens", () => {
    expect(tokens.font.mono).toMatch(/JetBrains Mono/);
    expect(tokens.breakpoint.mobileMax).toBe(1023);
  });
});
```

Note: check the actual keys of `themes` with `grep -n "^  [a-z_]*: {" src/theme/themes.ts` first; the five ids in order are `cyber_cyan, electric_indigo, emerald_matrix, solar_flare, crimson_void`. If an id differs, use the real id in the test (do not rename themes — localStorage stores the id).

- [ ] **Step 2: Run to verify it fails**

Run: `CI=true npm test -- --watchAll=false themes`
Expected: FAIL — cannot find module `../theme/tokens`.

- [ ] **Step 3: Create `src/theme/tokens.ts`**

```ts
export const tokens = {
  radius: { sm: "4px", md: "10px", lg: "16px", full: "9999px" },
  font: {
    ui: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'JetBrains Mono', ui-monospace, monospace",
  },
  z: { canvas: 0, toolbar: 20, panel: 30, sheet: 40, modal: 1000 },
  breakpoint: { mobileMax: 1023 },
} as const;
```

- [ ] **Step 4: Extend `src/theme/themes.ts`**

Add the new keys to the `ThemeColors` interface (after `bgPage: string;`):

```ts
  primary: string;
  primarySoft: string;
  primaryBorder: string;
  focusBorder: string;
  onPrimary: string;
  secondary: string;
  secondarySoft: string;
  glowPrimary: string;
  glowSecondary: string;
  canvasBg: string;
  surface: string;
  surfaceLow: string;
  surfaceHigh: string;
  glass1: string;
  glass2: string;
  hairline: string;
  hairlineStrong: string;
  textHigh: string;
  textMid: string;
  textLow: string;
```

Above `export const themes`, add:

```ts
type RGB = [number, number, number];
const rgba = (c: RGB, a: number) => `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${a})`;

function designColors(primary: RGB, secondary: RGB) {
  return {
    primary: rgba(primary, 1),
    primarySoft: rgba(primary, 0.15),
    primaryBorder: rgba(primary, 0.6),
    focusBorder: rgba(primary, 0.35),
    onPrimary: "#0A0B10",
    secondary: rgba(secondary, 1),
    secondarySoft: rgba(secondary, 0.15),
    glowPrimary: `0 0 16px -2px ${rgba(primary, 0.35)}`,
    glowSecondary: `0 0 16px -2px ${rgba(secondary, 0.35)}`,
    canvasBg: "#0A0B10",
    surface: "#0E111A",
    surfaceLow: "#181B25",
    surfaceHigh: "#272A33",
    glass1: "rgba(14, 17, 26, 0.75)",
    glass2: "rgba(22, 27, 40, 0.88)",
    hairline: "rgba(255, 255, 255, 0.08)",
    hairlineStrong: "rgba(255, 255, 255, 0.12)",
    textHigh: "#F1F5F9",
    textMid: "#94A3B8",
    textLow: "#475569",
  };
}
```

In each theme's `colors` object, add a spread as the last entry:

| theme id | spread |
|---|---|
| cyber_cyan | `...designColors([6, 182, 212], [139, 92, 246]),` |
| electric_indigo | `...designColors([99, 102, 241], [236, 72, 153]),` |
| emerald_matrix | `...designColors([52, 211, 153], [34, 211, 238]),` |
| solar_flare | `...designColors([251, 146, 60], [244, 63, 94]),` |
| crimson_void | `...designColors([244, 63, 94], [251, 146, 60]),` |

- [ ] **Step 5: Run tests**

Run: `CI=true npm test -- --watchAll=false themes`
Expected: PASS.

- [ ] **Step 6: Type-check**

Run: `npx tsc --noEmit -p .`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/theme src/__tests__/themes.test.ts
git commit -m "feat(theme): add Stitch design tokens to all five themes"
```

---

### Task 2: Pure helpers — background mode, gesture math, sheet state, stats sampler, breakpoint hook

**Files:**
- Create: `src/lib/bgMode.ts`, `src/lib/gestureMath.ts`, `src/lib/sheetState.ts`, `src/lib/statsSample.ts`, `src/hooks/useIsMobile.ts`
- Modify: `src/hooks/index.ts`
- Test: `src/__tests__/bgMode.test.ts`, `src/__tests__/gestureMath.test.ts`, `src/__tests__/sheetState.test.ts`, `src/__tests__/statsSample.test.ts`, `src/__tests__/useIsMobile.test.tsx`

**Interfaces:**
- Produces:
  - `type BgMode = "void" | "ink" | "paper"`; `interface BgColor { r: number; g: number; b: number }`; `bgModeOf(c: BgColor): BgMode`; `bgColorFor(mode: BgMode, inkHex: string): BgColor`.
  - `interface Pt { x: number; y: number }`; `distance(a: Pt, b: Pt): number`; `midpoint(a: Pt, b: Pt): Pt`; `clampZoom(z: number): number` (range [0.1, 4], non-finite → 1); `pinchZoom(startZoom: number, startDist: number, dist: number): number`.
  - `type SheetTab = "system" | "params" | "color" | "export"`; `interface SheetState { expanded: boolean; tab: SheetTab }`; `type SheetAction = { type: "tapTab"; tab: SheetTab } | { type: "toggle" } | { type: "collapse" } | { type: "expand" }`; `sheetReducer(s: SheetState, a: SheetAction): SheetState`; `initialSheet: SheetState`.
  - `interface StatsSample { iterations: number; rate: number; elapsedMs: number; t: number; startT: number | null }`; `initialStats: StatsSample`; `nextStatsSample(prev: StatsSample, iterations: number, now: number, running: boolean): StatsSample`.
  - `useIsMobile(): boolean`.

- [ ] **Step 1: Write failing tests**

`src/__tests__/bgMode.test.ts`:

```ts
import { bgModeOf, bgColorFor } from "../lib/bgMode";

describe("bgMode", () => {
  it("maps black to void and white to paper", () => {
    expect(bgModeOf({ r: 0, g: 0, b: 0 })).toBe("void");
    expect(bgModeOf({ r: 255, g: 255, b: 255 })).toBe("paper");
  });

  it("treats any other color as ink, so a theme switch keeps Ink selected", () => {
    expect(bgModeOf(bgColorFor("ink", "#05070a"))).toBe("ink");
    expect(bgModeOf(bgColorFor("ink", "#121214"))).toBe("ink");
  });

  it("produces colors for each mode", () => {
    expect(bgColorFor("void", "#05070a")).toEqual({ r: 0, g: 0, b: 0 });
    expect(bgColorFor("paper", "#05070a")).toEqual({ r: 255, g: 255, b: 255 });
    expect(bgColorFor("ink", "#05070a")).toEqual({ r: 5, g: 7, b: 10 });
  });

  it("falls back to near-black ink when the hex is invalid", () => {
    expect(bgModeOf(bgColorFor("ink", "not-a-color"))).toBe("ink");
  });
});
```

`src/__tests__/gestureMath.test.ts`:

```ts
import { distance, midpoint, clampZoom, pinchZoom } from "../lib/gestureMath";

describe("gestureMath", () => {
  it("computes distance and midpoint", () => {
    expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
    expect(midpoint({ x: 0, y: 0 }, { x: 4, y: 2 })).toEqual({ x: 2, y: 1 });
  });

  it("scales zoom by finger spread", () => {
    expect(pinchZoom(1, 100, 200)).toBe(2);
    expect(pinchZoom(2, 200, 100)).toBe(1);
  });

  it("clamps to [0.1, 4]", () => {
    expect(pinchZoom(1, 10, 1000)).toBe(4);
    expect(pinchZoom(1, 1000, 1)).toBe(0.1);
  });

  it("keeps zoom finite when fingers start at the same point", () => {
    expect(pinchZoom(1.5, 0, 50)).toBe(1.5);
    expect(clampZoom(NaN)).toBe(1);
    expect(clampZoom(Infinity)).toBe(1);
  });
});
```

`src/__tests__/sheetState.test.ts`:

```ts
import { sheetReducer, initialSheet } from "../lib/sheetState";

describe("sheetReducer", () => {
  it("starts collapsed on params", () => {
    expect(initialSheet).toEqual({ expanded: false, tab: "params" });
  });

  it("tapping a tab while collapsed expands to that tab", () => {
    expect(sheetReducer(initialSheet, { type: "tapTab", tab: "color" }))
      .toEqual({ expanded: true, tab: "color" });
  });

  it("tapping the active tab while expanded collapses", () => {
    const open = { expanded: true, tab: "color" as const };
    expect(sheetReducer(open, { type: "tapTab", tab: "color" }))
      .toEqual({ expanded: false, tab: "color" });
  });

  it("tapping another tab while expanded switches tab and stays open", () => {
    const open = { expanded: true, tab: "color" as const };
    expect(sheetReducer(open, { type: "tapTab", tab: "system" }))
      .toEqual({ expanded: true, tab: "system" });
  });

  it("toggle / collapse / expand", () => {
    expect(sheetReducer(initialSheet, { type: "toggle" }).expanded).toBe(true);
    expect(sheetReducer({ expanded: true, tab: "params" }, { type: "collapse" }).expanded).toBe(false);
    expect(sheetReducer(initialSheet, { type: "expand" }).expanded).toBe(true);
  });
});
```

`src/__tests__/statsSample.test.ts`:

```ts
import { nextStatsSample, initialStats } from "../lib/statsSample";

describe("nextStatsSample", () => {
  it("starts the clock on the first running sample", () => {
    const s = nextStatsSample(initialStats, 0, 1000, true);
    expect(s.startT).toBe(1000);
    expect(s.elapsedMs).toBe(0);
  });

  it("derives points/sec from iteration delta", () => {
    const a = nextStatsSample(initialStats, 0, 1000, true);
    const b = nextStatsSample(a, 500_000, 1500, true);
    expect(b.rate).toBe(1_000_000);
    expect(b.elapsedMs).toBe(500);
  });

  it("freezes elapsed and zeroes rate when not running", () => {
    const a = nextStatsSample(initialStats, 0, 1000, true);
    const b = nextStatsSample(a, 100, 2000, true);
    const c = nextStatsSample(b, 100, 5000, false);
    expect(c.rate).toBe(0);
    expect(c.elapsedMs).toBe(1000);
  });

  it("resets the clock when iterations go backwards (new render)", () => {
    const a = nextStatsSample(initialStats, 0, 1000, true);
    const b = nextStatsSample(a, 1000, 2000, true);
    const c = nextStatsSample(b, 10, 3000, true);
    expect(c.startT).toBe(3000);
    expect(c.elapsedMs).toBe(0);
  });

  it("ignores samples with no time delta", () => {
    const a = nextStatsSample(initialStats, 0, 1000, true);
    const b = nextStatsSample(a, 100, 1000, true);
    expect(Number.isFinite(b.rate)).toBe(true);
  });
});
```

`src/__tests__/useIsMobile.test.tsx`:

```tsx
import { renderHook, act } from "@testing-library/react";
import { useIsMobile } from "../hooks/useIsMobile";

type Listener = (e: { matches: boolean }) => void;

function mockMatchMedia(initial: boolean) {
  let matches = initial;
  const listeners: Listener[] = [];
  window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    get matches() { return matches; },
    media: query,
    addEventListener: (_: string, l: Listener) => listeners.push(l),
    removeEventListener: (_: string, l: Listener) => listeners.splice(listeners.indexOf(l), 1),
  })) as any;
  return (next: boolean) => { matches = next; listeners.forEach(l => l({ matches })); };
}

describe("useIsMobile", () => {
  it("uses the 1023px max-width query", () => {
    mockMatchMedia(false);
    renderHook(() => useIsMobile());
    expect(window.matchMedia).toHaveBeenCalledWith("(max-width: 1023px)");
  });

  it("follows media query changes", () => {
    const set = mockMatchMedia(false);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
    act(() => set(true));
    expect(result.current).toBe(true);
  });
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `CI=true npm test -- --watchAll=false "bgMode|gestureMath|sheetState|statsSample|useIsMobile"`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement**

`src/lib/bgMode.ts`:

```ts
export type BgMode = "void" | "ink" | "paper";
export interface BgColor { r: number; g: number; b: number }

const INK_FALLBACK: BgColor = { r: 10, g: 11, b: 16 };

function hexToRgb(hex: string): BgColor | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : null;
}

export function bgModeOf(c: BgColor): BgMode {
  if (c.r === 0 && c.g === 0 && c.b === 0) return "void";
  if (c.r === 255 && c.g === 255 && c.b === 255) return "paper";
  return "ink";
}

export function bgColorFor(mode: BgMode, inkHex: string): BgColor {
  if (mode === "void") return { r: 0, g: 0, b: 0 };
  if (mode === "paper") return { r: 255, g: 255, b: 255 };
  const ink = hexToRgb(inkHex) ?? INK_FALLBACK;
  // Ink must never collide with void/paper sentinels.
  return bgModeOf(ink) === "ink" ? ink : INK_FALLBACK;
}
```

`src/lib/gestureMath.ts`:

```ts
export interface Pt { x: number; y: number }

export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 4;

export const distance = (a: Pt, b: Pt) => Math.hypot(b.x - a.x, b.y - a.y);
export const midpoint = (a: Pt, b: Pt): Pt => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

export function clampZoom(z: number): number {
  if (!Number.isFinite(z)) return 1;
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));
}

export function pinchZoom(startZoom: number, startDist: number, dist: number): number {
  if (startDist <= 0 || !Number.isFinite(dist)) return clampZoom(startZoom);
  return clampZoom(startZoom * (dist / startDist));
}
```

`src/lib/sheetState.ts`:

```ts
export type SheetTab = "system" | "params" | "color" | "export";
export interface SheetState { expanded: boolean; tab: SheetTab }
export type SheetAction =
  | { type: "tapTab"; tab: SheetTab }
  | { type: "toggle" }
  | { type: "collapse" }
  | { type: "expand" };

export const initialSheet: SheetState = { expanded: false, tab: "params" };

export function sheetReducer(s: SheetState, a: SheetAction): SheetState {
  switch (a.type) {
    case "tapTab":
      if (s.expanded && s.tab === a.tab) return { ...s, expanded: false };
      return { expanded: true, tab: a.tab };
    case "toggle":
      return { ...s, expanded: !s.expanded };
    case "collapse":
      return { ...s, expanded: false };
    case "expand":
      return { ...s, expanded: true };
  }
}
```

`src/lib/statsSample.ts`:

```ts
export interface StatsSample {
  iterations: number;
  rate: number;
  elapsedMs: number;
  t: number;
  startT: number | null;
}

export const initialStats: StatsSample = { iterations: 0, rate: 0, elapsedMs: 0, t: 0, startT: null };

export function nextStatsSample(prev: StatsSample, iterations: number, now: number, running: boolean): StatsSample {
  const reset = iterations < prev.iterations;
  if (!running) {
    return { ...prev, iterations, rate: 0, t: now, startT: reset ? null : prev.startT, elapsedMs: reset ? 0 : prev.elapsedMs };
  }
  if (prev.startT === null || reset) {
    return { iterations, rate: 0, elapsedMs: 0, t: now, startT: now };
  }
  const dt = now - prev.t;
  const rate = dt > 0 ? ((iterations - prev.iterations) / dt) * 1000 : prev.rate;
  return { iterations, rate, elapsedMs: now - prev.startT, t: now, startT: prev.startT };
}
```

`src/hooks/useIsMobile.ts`:

```ts
import { useEffect, useState } from "react";
import { tokens } from "../theme/tokens";

const QUERY = `(max-width: ${tokens.breakpoint.mobileMax}px)`;

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" && !!window.matchMedia && window.matchMedia(QUERY).matches
  );

  useEffect(() => {
    if (!window.matchMedia) return;
    const mql = window.matchMedia(QUERY);
    const onChange = (e: { matches: boolean }) => setIsMobile(e.matches);
    setIsMobile(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}
```

Append to `src/hooks/index.ts`: `export * from "./useIsMobile";`

- [ ] **Step 4: Run tests**

Run: `CI=true npm test -- --watchAll=false "bgMode|gestureMath|sheetState|statsSample|useIsMobile"`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib src/hooks/useIsMobile.ts src/hooks/index.ts src/__tests__
git commit -m "feat: add bg mode, gesture math, sheet state, stats sampler, useIsMobile"
```

---

### Task 3: UI primitives + shared control restyle

**Files:**
- Create: `src/components/ui/Segmented.tsx`, `src/components/ui/Chip.tsx`, `src/components/ui/IconButton.tsx`, `src/components/ui/Icon.tsx`
- Modify: `src/attractors/shared/styles.ts`, `src/attractors/shared/ParameterInput.tsx`, `src/attractors/shared/PresetSelector.tsx`
- Test: `src/__tests__/uiPrimitives.test.tsx`, `src/__tests__/PresetSelector.test.tsx`
- Test helper: `src/__tests__/renderWithTheme.tsx`

**Interfaces:**
- Consumes: `ThemeColors` tokens (Task 1), `tokens` (Task 1).
- Produces:
  - `Segmented<T extends string | number>(props: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; ariaLabel: string; size?: "sm" | "md" })`
  - `Chip(props: { selected: boolean; onClick: () => void; children: React.ReactNode })`
  - `IconButton(props: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string; active?: boolean; variant?: "ghost" | "primary" | "soft"; size?: "sm" | "md" | "lg" })` — renders `aria-label={label}` and `title={label}`.
  - `Icon(props: { name: IconName; size?: number })`, `type IconName = "play" | "pause" | "sparkle" | "fit" | "plus" | "minus" | "recenter" | "share" | "download" | "palette" | "sliders" | "layers" | "image" | "wand" | "info" | "chevronDown" | "chevronLeft" | "chevronRight" | "close" | "search"`.
  - `PresetSelector` keeps props `{ label, value, options, onChange(value: string), disabled? }`; renders a horizontal list of `role="radio"` buttons inside `role="radiogroup"`.
  - Test helper `renderWithTheme(ui)` wraps in styled-components `ThemeProvider` with `themes.cyber_cyan.colors`.

- [ ] **Step 1: Test helper** — `src/__tests__/renderWithTheme.tsx`:

```tsx
import React from "react";
import { render } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import { themes } from "../theme/themes";

export function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={themes.cyber_cyan.colors}>{ui}</ThemeProvider>);
}
```

Add to `package.json` → under `"jest"` (create the key if missing): `"testMatch": ["<rootDir>/src/**/*.test.{js,jsx,ts,tsx}"]` so the helper file is not run as a test. (CRA allows overriding `testMatch`.)

- [ ] **Step 2: Write failing tests**

`src/__tests__/uiPrimitives.test.tsx`:

```tsx
import { screen, fireEvent } from "@testing-library/react";
import { renderWithTheme } from "./renderWithTheme";
import { Segmented } from "../components/ui/Segmented";
import { Chip } from "../components/ui/Chip";
import { IconButton } from "../components/ui/IconButton";

describe("Segmented", () => {
  it("marks the selected option and reports changes", () => {
    const onChange = jest.fn();
    renderWithTheme(
      <Segmented ariaLabel="Background" value="ink" onChange={onChange}
        options={[{ value: "void", label: "Void" }, { value: "ink", label: "Ink" }, { value: "paper", label: "Paper" }]} />
    );
    expect(screen.getByRole("radio", { name: "Ink" })).toHaveAttribute("aria-checked", "true");
    fireEvent.click(screen.getByRole("radio", { name: "Paper" }));
    expect(onChange).toHaveBeenCalledWith("paper");
  });
});

describe("Chip", () => {
  it("exposes pressed state", () => {
    const onClick = jest.fn();
    renderWithTheme(<Chip selected onClick={onClick}>Fractals</Chip>);
    const chip = screen.getByRole("button", { name: "Fractals" });
    expect(chip).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(chip);
    expect(onClick).toHaveBeenCalled();
  });
});

describe("IconButton", () => {
  it("is labelled for screen readers and tooltips", () => {
    renderWithTheme(<IconButton label="Zoom in" onClick={() => {}}>+</IconButton>);
    const b = screen.getByRole("button", { name: "Zoom in" });
    expect(b).toHaveAttribute("title", "Zoom in");
  });
});
```

`src/__tests__/PresetSelector.test.tsx`:

```tsx
import { screen, fireEvent } from "@testing-library/react";
import { renderWithTheme } from "./renderWithTheme";
import { PresetSelector } from "../attractors/shared/PresetSelector";

const options = [{ value: 0, label: "Cyan Caustic" }, { value: 1, label: "Violet Silk" }];

describe("PresetSelector", () => {
  it("renders presets as a radio group and keeps the string onChange contract", () => {
    const onChange = jest.fn();
    renderWithTheme(<PresetSelector label="Presets" value={1} options={options} onChange={onChange} />);
    expect(screen.getByRole("radiogroup", { name: "Presets" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Violet Silk" })).toHaveAttribute("aria-checked", "true");
    fireEvent.click(screen.getByRole("radio", { name: "Cyan Caustic" }));
    expect(onChange).toHaveBeenCalledWith("0");
  });

  it("does nothing when disabled", () => {
    const onChange = jest.fn();
    renderWithTheme(<PresetSelector label="Presets" value={0} options={options} onChange={onChange} disabled />);
    fireEvent.click(screen.getByRole("radio", { name: "Violet Silk" }));
    expect(onChange).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 3: Run to verify they fail**

Run: `CI=true npm test -- --watchAll=false "uiPrimitives|PresetSelector"`
Expected: FAIL — modules not found / no radiogroup.

- [ ] **Step 4: Implement primitives**

`src/components/ui/Segmented.tsx`:

```tsx
import React from "react";
import styled from "styled-components";
import { tokens } from "../../theme/tokens";

const Group = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  gap: 4px;
  padding: 4px;
  background: ${p => p.theme.surface};
  border: 1px solid ${p => p.theme.hairline};
  border-radius: ${tokens.radius.md};
`;

const Option = styled.button<{ $active: boolean; $size: "sm" | "md" }>`
  min-height: ${p => (p.$size === "sm" ? "28px" : "36px")};
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid ${p => (p.$active ? p.theme.primaryBorder : "transparent")};
  background: ${p => (p.$active ? p.theme.primarySoft : "transparent")};
  color: ${p => (p.$active ? p.theme.primary : p.theme.textMid)};
  font: 500 12px/1 ${tokens.font.mono};
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
  &:hover { color: ${p => p.theme.textHigh}; }
  &:focus-visible { outline: 2px solid ${p => p.theme.focusBorder}; outline-offset: 1px; }
  @media (max-width: ${tokens.breakpoint.mobileMax}px) { min-height: 44px; }
`;

interface SegmentedProps<T extends string | number> {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  ariaLabel: string;
  size?: "sm" | "md";
}

export function Segmented<T extends string | number>({ value, options, onChange, ariaLabel, size = "md" }: SegmentedProps<T>) {
  return (
    <Group role="radiogroup" aria-label={ariaLabel}>
      {options.map(o => (
        <Option key={String(o.value)} type="button" role="radio" aria-checked={o.value === value}
          $active={o.value === value} $size={size} onClick={() => onChange(o.value)}>
          {o.label}
        </Option>
      ))}
    </Group>
  );
}
```

`src/components/ui/Chip.tsx`:

```tsx
import React from "react";
import styled from "styled-components";
import { tokens } from "../../theme/tokens";

const ChipButton = styled.button<{ $selected: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 32px;
  padding: 0 12px;
  border-radius: ${tokens.radius.full};
  border: 1px solid ${p => (p.$selected ? p.theme.primaryBorder : p.theme.hairline)};
  background: ${p => (p.$selected ? p.theme.primarySoft : "rgba(255, 255, 255, 0.03)")};
  color: ${p => (p.$selected ? p.theme.primary : p.theme.textMid)};
  font: 500 12px/1 ${tokens.font.ui};
  cursor: pointer;
  white-space: nowrap;
  &::before {
    content: "";
    display: ${p => (p.$selected ? "block" : "none")};
    width: 4px; height: 4px; border-radius: 50%;
    background: ${p => p.theme.primary};
    box-shadow: ${p => p.theme.glowPrimary};
  }
  &:focus-visible { outline: 2px solid ${p => p.theme.focusBorder}; }
  @media (max-width: ${tokens.breakpoint.mobileMax}px) { min-height: 44px; }
`;

export const Chip: React.FC<{ selected: boolean; onClick: () => void; children: React.ReactNode }> = ({ selected, onClick, children }) => (
  <ChipButton type="button" aria-pressed={selected} $selected={selected} onClick={onClick}>{children}</ChipButton>
);
```

`src/components/ui/IconButton.tsx`:

```tsx
import React from "react";
import styled, { css } from "styled-components";
import { tokens } from "../../theme/tokens";

type Variant = "ghost" | "primary" | "soft";
type Size = "sm" | "md" | "lg";
const SIZES: Record<Size, string> = { sm: "32px", md: "40px", lg: "52px" };

const Btn = styled.button<{ $variant: Variant; $size: Size; $active: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: ${p => SIZES[p.$size]};
  height: ${p => SIZES[p.$size]};
  padding: 0 ${p => (p.$size === "lg" ? "0" : "10px")};
  border-radius: ${p => (p.$size === "lg" ? tokens.radius.full : "10px")};
  font: 500 12px/1 ${tokens.font.ui};
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
  ${p => p.$variant === "primary" && css`
    background: ${p.theme.primary};
    color: ${p.theme.onPrimary};
    border: none;
    &:hover { box-shadow: ${p.theme.glowPrimary}; }
  `}
  ${p => p.$variant === "soft" && css`
    background: ${p.$active ? p.theme.primarySoft : "rgba(255, 255, 255, 0.04)"};
    color: ${p.$active ? p.theme.primary : p.theme.textHigh};
    border: 1px solid ${p.$active ? p.theme.primaryBorder : p.theme.hairline};
    &:hover { border-color: ${p.theme.focusBorder}; }
  `}
  ${p => p.$variant === "ghost" && css`
    background: ${p.$active ? p.theme.primarySoft : "transparent"};
    color: ${p.$active ? p.theme.primary : p.theme.textMid};
    border: 1px solid transparent;
    &:hover { color: ${p.theme.textHigh}; background: rgba(255, 255, 255, 0.06); }
  `}
  &:disabled { opacity: 0.4; cursor: not-allowed; }
  &:focus-visible { outline: 2px solid ${p => p.theme.focusBorder}; outline-offset: 2px; }
  @media (max-width: ${tokens.breakpoint.mobileMax}px) {
    min-width: ${p => (p.$size === "sm" ? "44px" : SIZES[p.$size])};
    height: ${p => (p.$size === "sm" ? "44px" : SIZES[p.$size])};
  }
`;

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  active?: boolean;
  variant?: Variant;
  size?: Size;
};

export const IconButton: React.FC<Props> = ({ label, active = false, variant = "ghost", size = "md", children, ...rest }) => (
  <Btn type="button" aria-label={label} title={label} $variant={variant} $size={size} $active={active} {...rest}>
    {children}
  </Btn>
);
```

`src/components/ui/Icon.tsx` (24×24 stroke icons, `currentColor`):

```tsx
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
```

- [ ] **Step 5: Rewrite `PresetSelector`** — `src/attractors/shared/PresetSelector.tsx`:

```tsx
import React from "react";
import styled from "styled-components";
import { SectionLabel } from "./styles";
import { tokens } from "../../theme/tokens";

interface PresetOption { value: string | number; label: string }
interface PresetSelectorProps {
  label: string;
  value: string | number;
  options: PresetOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
}

const Wrap = styled.div`margin-bottom: 16px;`;

const Row = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
  scroll-snap-type: x proximity;
  &::-webkit-scrollbar { height: 3px; }
  &::-webkit-scrollbar-thumb { background: ${p => p.theme.hairlineStrong}; border-radius: 2px; }
`;

const Card = styled.button<{ $active: boolean }>`
  flex: 0 0 auto;
  scroll-snap-align: start;
  min-width: 96px;
  max-width: 140px;
  min-height: 44px;
  padding: 10px 12px;
  text-align: left;
  border-radius: ${tokens.radius.md};
  border: 1px solid ${p => (p.$active ? p.theme.primaryBorder : p.theme.hairline)};
  background: ${p => (p.$active ? p.theme.primarySoft : p.theme.surfaceLow)};
  box-shadow: ${p => (p.$active ? p.theme.glowPrimary : "none")};
  color: ${p => (p.$active ? p.theme.primary : p.theme.textHigh)};
  font: 500 12px/1.3 ${tokens.font.mono};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  &:disabled { opacity: 0.4; cursor: not-allowed; }
  &:focus-visible { outline: 2px solid ${p => p.theme.focusBorder}; }
`;

export const PresetSelector: React.FC<PresetSelectorProps> = ({ label, value, options, onChange, disabled = false }) => {
  const groupLabel = label === "Preset" ? "Presets" : label;
  return (
    <Wrap>
      <SectionLabel as="div">{groupLabel}</SectionLabel>
      <Row role="radiogroup" aria-label={groupLabel}>
        {options.map(o => {
          const active = String(o.value) === String(value);
          return (
            <Card key={o.value} type="button" role="radio" aria-checked={active} title={o.label}
              $active={active} disabled={disabled} onClick={() => !disabled && onChange(String(o.value))}>
              {o.label}
            </Card>
          );
        })}
      </Row>
    </Wrap>
  );
};

export default PresetSelector;
```

- [ ] **Step 6: Restyle `src/attractors/shared/styles.ts`**

Keep every existing export name (other files import them). Change bodies as follows; add `SectionLabel`:

```ts
import { tokens } from "../../theme/tokens";

// New: small uppercase section label used across panels
export const SectionLabel = styled.label`
  display: block;
  margin: 0 0 8px;
  font: 600 11px/1 ${tokens.font.mono};
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${p => p.theme.textMid};
`;
```

Replace these existing definitions (keep names, props and exports):

```ts
export const glassEffect = css`
  background: ${p => p.theme.glass1};
  backdrop-filter: blur(16px) saturate(160%);
  -webkit-backdrop-filter: blur(16px) saturate(160%);
  border: 1px solid ${p => p.theme.hairline};
  border-radius: 14px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
`;

export const Card = styled.div`
  padding: 0 0 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid ${p => p.theme.hairline};
  &:last-child { border-bottom: none; }
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 6px;
  font: 600 11px/1 ${tokens.font.mono};
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${p => p.theme.textMid};
`;
```

For `Select`, `Input`, `ValueText`, `ValueInput`, `SliderInput`, `ParameterRow`, `ParameterRowWithSlider`, `SectionHeader`, `SectionTitle`, `StatLabel`, `StatValue`, `FloatingButton`: open the file, and in each replace legacy accent styling with tokens:
- text: `p.theme.textHigh` (values), `p.theme.textMid` (labels); numbers use `font-family: ${tokens.font.mono}`; UI text uses `${tokens.font.ui}`.
- borders: `p.theme.hairline`; focus: `p.theme.focusBorder`; active fill: `p.theme.primarySoft`.
- `ValueText`: monospace 12px, right-aligned, `padding: 4px 8px; border-radius: 6px; background: ${p.theme.surface}; border: 1px solid ${p.theme.hairline}; min-width: 64px; text-align: right;`.
- `SliderInput` (range): track 4px, `appearance: none; height: 4px; border-radius: 2px; background: linear-gradient(to right, ${p.theme.primary} 0%, ${p.theme.primary} var(--fill, 0%), rgba(255,255,255,0.1) var(--fill, 0%));` thumb 14px circle `background: ${p.theme.textHigh}; border: 2px solid ${p.theme.primary}; box-shadow: ${p.theme.glowPrimary};`; add mobile rule `@media (max-width: ${tokens.breakpoint.mobileMax}px) { height: 24px; background-clip: content-box; padding: 10px 0; &::-webkit-slider-thumb { width: 22px; height: 22px; } }`.
- `Select`: `min-height: 36px; border-radius: 10px; background: ${p.theme.surface}; color: ${p.theme.textHigh}; border: 1px solid ${p.theme.hairline}; font: 500 12px ${tokens.font.ui};`.

- [ ] **Step 7: Slider fill** — in `src/attractors/shared/ParameterInput.tsx`, where the slider `percent` is computed, pass it to the slider as a CSS variable: on the `<SliderInput ...>` element add `style={{ ["--fill" as any]: `${percent}%` }}`. Do the same in `ParameterInputCompact` if it renders its own slider (it computes `percent` the same way).

- [ ] **Step 8: Run tests and type-check**

Run: `CI=true npm test -- --watchAll=false && npx tsc --noEmit -p .`
Expected: PASS, no type errors.

- [ ] **Step 9: Visual check** — `npm start`, open http://localhost:3000, confirm Clifford's controls (old sidebar still present at this point) show preset cards, monospace values and the new slider. Stop the server.

- [ ] **Step 10: Commit**

```bash
git add src/components/ui src/attractors/shared src/__tests__ package.json
git commit -m "feat(ui): add Segmented/Chip/IconButton/Icon, restyle shared attractor controls"
```

---

### Task 4: Panels — System, Render, Color, FX, Stats

**Files:**
- Create: `src/components/panels/SystemPanel.tsx`, `RenderPanel.tsx`, `ColorPanel.tsx`, `FxPanel.tsx`, `StatsReadout.tsx`, `src/components/panels/index.ts`
- Test: `src/__tests__/panels.test.tsx`

**Interfaces:**
- Consumes: `Segmented`, `Chip`, `Icon` (Task 3); `bgModeOf`, `bgColorFor`, `BgMode`, `BgColor` (Task 2); `nextStatsSample`, `initialStats` (Task 2); `registry`, `AttractorCategory` from `src/attractors/registry`; `AttractorType` from `src/attractors/shared/types`; `Color` from `src/model-controller/Attractor/palette`.
- Produces:
  - `SystemPanel(props: { value: AttractorType; onChange: (t: AttractorType) => void; onPicked?: () => void })`
  - `RenderPanel(props: { canvasSize: number; onCanvasSizeChange: (n: number) => void; oversampling: number; onOversamplingChange: (n: number) => void })`
  - `ColorPanel(props: { paletteData: Color[]; bgColor: BgColor; onBgModeChange: (m: BgMode) => void; onOpenPalette: () => void })`
  - `FxPanel(props: { fx: FxState; onChange: (patch: Partial<FxState>) => void })`, `interface FxState { enabled: boolean; bloom: number; grain: number; vignette: number; exposure: number }`
  - `StatsReadout(props: { statsRef: React.MutableRefObject<{ maxHits: number; totalIterations: number }>; running: boolean; rendering: boolean; isFractal: boolean; maxIter?: number; compact?: boolean })`
  - `paletteGradient(colors: Color[]): string` (exported from `ColorPanel.tsx`) — CSS `linear-gradient(...)`.
  - `formatDuration(ms: number): string` (exported from `StatsReadout.tsx`) — `"mm:ss"`.

- [ ] **Step 1: Write failing tests** — `src/__tests__/panels.test.tsx`:

```tsx
import React from "react";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithTheme } from "./renderWithTheme";
import "../attractors"; // registers all modules
import { registry } from "../attractors/registry";
import { SystemPanel, RenderPanel, ColorPanel, FxPanel } from "../components/panels";
import { paletteGradient } from "../components/panels/ColorPanel";
import { formatDuration } from "../components/panels/StatsReadout";

describe("SystemPanel", () => {
  it("shows the active system's category and filters by search", () => {
    const onChange = jest.fn();
    renderWithTheme(<SystemPanel value="clifford" onChange={onChange} />);
    expect(screen.getByRole("button", { name: "Attractors" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.change(screen.getByRole("searchbox", { name: "Search systems" }), { target: { value: "jong" } });
    const options = screen.getAllByRole("option");
    expect(options.length).toBeGreaterThan(0);
    options.forEach(o => expect(o.textContent!.toLowerCase()).toContain("jong"));
  });

  it("search spans all categories", () => {
    renderWithTheme(<SystemPanel value="clifford" onChange={() => {}} />);
    fireEvent.change(screen.getByRole("searchbox", { name: "Search systems" }), { target: { value: "mandel" } });
    expect(screen.getByRole("option", { name: /mandelbrot/i })).toBeInTheDocument();
  });

  it("picking a system calls onChange and onPicked", () => {
    const onChange = jest.fn();
    const onPicked = jest.fn();
    renderWithTheme(<SystemPanel value="clifford" onChange={onChange} onPicked={onPicked} />);
    fireEvent.click(screen.getByRole("button", { name: "Fractals" }));
    const first = registry.getByCategory("Fractals")[0];
    fireEvent.click(screen.getByRole("option", { name: first.label }));
    expect(onChange).toHaveBeenCalledWith(first.id);
    expect(onPicked).toHaveBeenCalled();
  });
});

describe("RenderPanel", () => {
  it("changes size and quality", () => {
    const onSize = jest.fn();
    const onQ = jest.fn();
    renderWithTheme(<RenderPanel canvasSize={1200} onCanvasSizeChange={onSize} oversampling={2} onOversamplingChange={onQ} />);
    fireEvent.click(screen.getByRole("radio", { name: "2400" }));
    expect(onSize).toHaveBeenCalledWith(2400);
    fireEvent.click(screen.getByRole("radio", { name: "4×" }));
    expect(onQ).toHaveBeenCalledWith(4);
  });
});

describe("ColorPanel", () => {
  const palette = [
    { position: 0, red: 0, green: 0, blue: 0 },
    { position: 1, red: 255, green: 255, blue: 255 },
  ];
  it("reflects and changes background mode", () => {
    const onMode = jest.fn();
    renderWithTheme(<ColorPanel paletteData={palette as any} bgColor={{ r: 0, g: 0, b: 0 }} onBgModeChange={onMode} onOpenPalette={() => {}} />);
    expect(screen.getByRole("radio", { name: "Void" })).toHaveAttribute("aria-checked", "true");
    fireEvent.click(screen.getByRole("radio", { name: "Paper" }));
    expect(onMode).toHaveBeenCalledWith("paper");
  });

  it("opens the palette editor", () => {
    const onOpen = jest.fn();
    renderWithTheme(<ColorPanel paletteData={palette as any} bgColor={{ r: 0, g: 0, b: 0 }} onBgModeChange={() => {}} onOpenPalette={onOpen} />);
    fireEvent.click(screen.getByRole("button", { name: "Edit palette" }));
    expect(onOpen).toHaveBeenCalled();
  });

  it("builds a gradient from palette stops", () => {
    expect(paletteGradient(palette as any)).toBe("linear-gradient(90deg, rgb(0, 0, 0) 0%, rgb(255, 255, 255) 100%)");
    expect(paletteGradient([])).toBe("none");
  });
});

describe("FxPanel", () => {
  it("toggles effects", () => {
    const onChange = jest.fn();
    renderWithTheme(<FxPanel fx={{ enabled: false, bloom: 0, grain: 0, vignette: 0, exposure: 1 }} onChange={onChange} />);
    fireEvent.click(screen.getByRole("switch", { name: "Effects" }));
    expect(onChange).toHaveBeenCalledWith({ enabled: true });
  });
});

describe("formatDuration", () => {
  it("formats mm:ss", () => {
    expect(formatDuration(0)).toBe("00:00");
    expect(formatDuration(75_000)).toBe("01:15");
    expect(formatDuration(3_600_000)).toBe("60:00");
  });
});
```

Before running: confirm a De Jong module label contains "Jong" (`grep -n "label" src/attractors/deJong/index.ts`) and Mandelbrot's label contains "Mandelbrot". If not, adjust the search strings to substrings of the real labels.

- [ ] **Step 2: Run to verify fails**

Run: `CI=true npm test -- --watchAll=false panels`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `SystemPanel.tsx`**

```tsx
import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { registry, AttractorCategory } from "../../attractors/registry";
import { AttractorType } from "../../attractors/shared/types";
import { SectionLabel } from "../../attractors/shared/styles";
import { Chip } from "../ui/Chip";
import { Icon } from "../ui/Icon";
import { tokens } from "../../theme/tokens";

const CATEGORIES: AttractorCategory[] = ["Attractors", "Fractals", "IFS"];

const Chips = styled.div`display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px;`;
const SearchWrap = styled.label`
  display: flex; align-items: center; gap: 8px;
  padding: 0 10px; min-height: 40px; margin-bottom: 8px;
  border-radius: 10px; border: 1px solid ${p => p.theme.hairline}; background: ${p => p.theme.surface};
  color: ${p => p.theme.textMid};
  &:focus-within { border-color: ${p => p.theme.focusBorder}; }
`;
const Search = styled.input`
  flex: 1; min-width: 0; background: transparent; border: none; outline: none;
  color: ${p => p.theme.textHigh}; font: 400 13px ${tokens.font.ui};
  @media (max-width: ${tokens.breakpoint.mobileMax}px) { font-size: 16px; } /* avoid iOS zoom-on-focus */
`;
const List = styled.ul`list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px;`;
const Item = styled.li<{ $active: boolean }>`
  display: flex; align-items: center; justify-content: space-between;
  min-height: 40px; padding: 0 12px; border-radius: 8px; cursor: pointer;
  color: ${p => (p.$active ? p.theme.primary : p.theme.textHigh)};
  background: ${p => (p.$active ? p.theme.primarySoft : "transparent")};
  font: 500 13px ${tokens.font.ui};
  &:hover { background: rgba(255, 255, 255, 0.05); }
  @media (max-width: ${tokens.breakpoint.mobileMax}px) { min-height: 44px; }
`;
const Cat = styled.span`font: 400 11px ${tokens.font.mono}; color: ${p => p.theme.textLow};`;

interface Props { value: AttractorType; onChange: (t: AttractorType) => void; onPicked?: () => void }

export const SystemPanel: React.FC<Props> = ({ value, onChange, onPicked }) => {
  const activeCategory = registry.get(value)?.category ?? "Attractors";
  const [category, setCategory] = useState<AttractorCategory>(activeCategory);
  const [query, setQuery] = useState("");

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = q ? registry.getAll() : registry.getByCategory(category);
    return q ? pool.filter(m => m.label.toLowerCase().includes(q)) : pool;
  }, [category, query]);

  return (
    <div>
      <SectionLabel as="div">System</SectionLabel>
      <Chips>
        {CATEGORIES.map(c => (
          <Chip key={c} selected={!query && c === category} onClick={() => { setCategory(c); setQuery(""); }}>{c}</Chip>
        ))}
      </Chips>
      <SearchWrap>
        <Icon name="search" size={16} />
        <Search type="search" aria-label="Search systems" placeholder="Search systems"
          value={query} onChange={e => setQuery(e.target.value)} />
      </SearchWrap>
      <List role="listbox" aria-label="Systems">
        {items.map(m => (
          <Item key={m.id} role="option" aria-selected={m.id === value} $active={m.id === value}
            onClick={() => { onChange(m.id); onPicked?.(); }}>
            <span>{m.label}</span>
            {query && <Cat>{m.category}</Cat>}
          </Item>
        ))}
      </List>
    </div>
  );
};
```

Note: the option's accessible name includes the category text when searching; tests use regex/label without query, which matches. If `registry.getAll` is not the method name, check `src/attractors/registry.ts` (it is used by `getByCategory` as `this.getAll()`).

- [ ] **Step 4: Implement `RenderPanel.tsx`**

```tsx
import React from "react";
import { Segmented } from "../ui/Segmented";
import { SectionLabel } from "../../attractors/shared/styles";

const SIZES = [800, 1200, 1800, 2400, 3600, 4096];
const QUALITY = [1, 2, 3, 4];

interface Props {
  canvasSize: number; onCanvasSizeChange: (n: number) => void;
  oversampling: number; onOversamplingChange: (n: number) => void;
}

export const RenderPanel: React.FC<Props> = ({ canvasSize, onCanvasSizeChange, oversampling, onOversamplingChange }) => (
  <div>
    <SectionLabel as="div">Size (px)</SectionLabel>
    <div style={{ display: "grid", gap: 6, marginBottom: 16 }}>
      <Segmented ariaLabel="Size row 1" size="sm" value={canvasSize} onChange={onCanvasSizeChange}
        options={SIZES.slice(0, 3).map(s => ({ value: s, label: String(s) }))} />
      <Segmented ariaLabel="Size row 2" size="sm" value={canvasSize} onChange={onCanvasSizeChange}
        options={SIZES.slice(3).map(s => ({ value: s, label: String(s) }))} />
    </div>
    <SectionLabel as="div">Quality</SectionLabel>
    <Segmented ariaLabel="Quality" size="sm" value={oversampling} onChange={onOversamplingChange}
      options={QUALITY.map(q => ({ value: q, label: `${q}×` }))} />
  </div>
);
```

- [ ] **Step 5: Implement `ColorPanel.tsx`**

```tsx
import React from "react";
import styled from "styled-components";
import { Color } from "../../model-controller/Attractor/palette";
import { BgColor, BgMode, bgModeOf } from "../../lib/bgMode";
import { Segmented } from "../ui/Segmented";
import { IconButton } from "../ui/IconButton";
import { Icon } from "../ui/Icon";
import { SectionLabel } from "../../attractors/shared/styles";

export function paletteGradient(colors: Color[]): string {
  if (!colors.length) return "none";
  const stops = [...colors]
    .sort((a, b) => a.position - b.position)
    .map(c => `rgb(${c.red}, ${c.green}, ${c.blue}) ${Math.round(c.position * 100)}%`);
  return `linear-gradient(90deg, ${stops.join(", ")})`;
}

const Strip = styled.div<{ $bg: string }>`
  height: 14px; border-radius: 7px; margin-bottom: 10px;
  background: ${p => p.$bg}; border: 1px solid ${p => p.theme.hairline};
`;
const Header = styled.div`display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;`;

interface Props { paletteData: Color[]; bgColor: BgColor; onBgModeChange: (m: BgMode) => void; onOpenPalette: () => void }

export const ColorPanel: React.FC<Props> = ({ paletteData, bgColor, onBgModeChange, onOpenPalette }) => (
  <div>
    <Header>
      <SectionLabel as="div" style={{ margin: 0 }}>Palette</SectionLabel>
      <IconButton label="Edit palette" variant="soft" size="sm" onClick={onOpenPalette}>
        <Icon name="palette" size={16} /> Edit
      </IconButton>
    </Header>
    <Strip $bg={paletteGradient(paletteData)} />
    <SectionLabel as="div">Background</SectionLabel>
    <Segmented<BgMode> ariaLabel="Background" size="sm" value={bgModeOf(bgColor)} onChange={onBgModeChange}
      options={[{ value: "void", label: "Void" }, { value: "ink", label: "Ink" }, { value: "paper", label: "Paper" }]} />
  </div>
);
```

Before writing: confirm `Color.position` is 0–1 by opening one palette entry in `src/Parametersets.ts` (`grep -n "position" src/Parametersets.ts | head -3`). If positions are 0–255 or 0–100, change `Math.round(c.position * 100)` to the matching scale and update the test's expected string.

- [ ] **Step 6: Implement `FxPanel.tsx`**

```tsx
import React from "react";
import styled from "styled-components";
import { ParameterInputCompact } from "../../attractors/shared/ParameterInput";
import { SectionLabel } from "../../attractors/shared/styles";

export interface FxState { enabled: boolean; bloom: number; grain: number; vignette: number; exposure: number }

const Row = styled.div`display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;`;
const Switch = styled.button<{ $on: boolean }>`
  width: 40px; height: 22px; border-radius: 11px; position: relative; cursor: pointer;
  border: 1px solid ${p => (p.$on ? p.theme.primaryBorder : p.theme.hairlineStrong)};
  background: ${p => (p.$on ? p.theme.primarySoft : p.theme.surface)};
  &::after {
    content: ""; position: absolute; top: 2px; left: ${p => (p.$on ? "20px" : "2px")};
    width: 16px; height: 16px; border-radius: 50%;
    background: ${p => (p.$on ? p.theme.primary : p.theme.textMid)};
    box-shadow: ${p => (p.$on ? p.theme.glowPrimary : "none")};
    transition: left 0.15s ease;
  }
`;

export const FxPanel: React.FC<{ fx: FxState; onChange: (patch: Partial<FxState>) => void }> = ({ fx, onChange }) => {
  const set = (k: keyof FxState) => (v: number) => onChange({ [k]: v });
  return (
    <div>
      <Row>
        <SectionLabel as="div" style={{ margin: 0 }}>Effects</SectionLabel>
        <Switch type="button" role="switch" aria-checked={fx.enabled} aria-label="Effects" $on={fx.enabled}
          onClick={() => onChange({ enabled: !fx.enabled })} />
      </Row>
      <ParameterInputCompact label="Vignette" value={fx.vignette} onChange={set("vignette")} min={0} max={1} step={0.01} disabled={!fx.enabled} />
      <ParameterInputCompact label="Grain" value={fx.grain} onChange={set("grain")} min={0} max={0.5} step={0.01} disabled={!fx.enabled} />
      <ParameterInputCompact label="Bloom" value={fx.bloom} onChange={set("bloom")} min={0} max={1} step={0.01} disabled={!fx.enabled} />
      <ParameterInputCompact label="Exposure" value={fx.exposure} onChange={set("exposure")} min={0.5} max={3} step={0.05} disabled={!fx.enabled} />
    </div>
  );
};
```

(`attractor.setFx` today accepts a partial patch — `FXControls` calls `onChange({ enabled: ... })` — so the patch contract is unchanged.)

- [ ] **Step 7: Implement `StatsReadout.tsx`**

```tsx
import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { formatCompact } from "../../attractors/shared/types";
import { initialStats, nextStatsSample, StatsSample } from "../../lib/statsSample";
import { tokens } from "../../theme/tokens";

export function formatDuration(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const Grid = styled.dl<{ $compact: boolean }>`
  display: grid;
  grid-template-columns: ${p => (p.$compact ? "auto auto auto" : "auto 1fr")};
  gap: ${p => (p.$compact ? "0 10px" : "4px 12px")};
  margin: 0;
  font: 400 11px/1.6 ${tokens.font.mono};
  dt { color: ${p => p.theme.textMid}; display: ${p => (p.$compact ? "none" : "block")}; }
  dd { margin: 0; color: ${p => p.theme.primary}; text-align: ${p => (p.$compact ? "left" : "right")}; }
`;

interface Props {
  statsRef: React.MutableRefObject<{ maxHits: number; totalIterations: number }>;
  running: boolean; rendering: boolean; isFractal: boolean; maxIter?: number; compact?: boolean;
}

export const StatsReadout: React.FC<Props> = ({ statsRef, running, rendering, isFractal, maxIter, compact = false }) => {
  const [sample, setSample] = useState<StatsSample>(initialStats);
  const runningRef = useRef(running);
  runningRef.current = running;

  useEffect(() => {
    if (isFractal) return;
    let last = initialStats;
    const id = window.setInterval(() => {
      last = nextStatsSample(last, statsRef.current.totalIterations, performance.now(), runningRef.current);
      setSample(last);
    }, 250);
    return () => window.clearInterval(id);
  }, [statsRef, isFractal]);

  if (rendering) return <Grid $compact={compact}><dt>Status</dt><dd>Computing…</dd></Grid>;
  if (isFractal) return <Grid $compact={compact}><dt>Complexity</dt><dd>{maxIter ?? "—"}</dd></Grid>;

  return (
    <Grid $compact={compact} aria-label="Render statistics">
      <dt>Iterations</dt><dd>{formatCompact(sample.iterations)}</dd>
      <dt>Points/sec</dt><dd>{formatCompact(Math.round(sample.rate))}{compact ? " pts/s" : ""}</dd>
      <dt>Elapsed</dt><dd>{formatDuration(sample.elapsedMs)}</dd>
    </Grid>
  );
};
```

(Sampling at 250ms replaces LiveStats' per-frame `setState`, which re-rendered 60×/s.)

- [ ] **Step 8: `src/components/panels/index.ts`**

```ts
export * from "./SystemPanel";
export * from "./RenderPanel";
export * from "./ColorPanel";
export * from "./FxPanel";
export * from "./StatsReadout";
```

- [ ] **Step 9: Run tests + type-check**

Run: `CI=true npm test -- --watchAll=false panels && npx tsc --noEmit -p .`
Expected: PASS.

- [ ] **Step 10: Commit**

```bash
git add src/components/panels src/__tests__/panels.test.tsx
git commit -m "feat(ui): add System/Render/Color/FX panels and stats readout"
```

---

### Task 5: CanvasToolbar

**Files:**
- Create: `src/components/shell/CanvasToolbar.tsx`
- Test: `src/__tests__/CanvasToolbar.test.tsx`

**Interfaces:**
- Consumes: `IconButton`, `Icon` (Task 3).
- Produces: `CanvasToolbar(props: CanvasToolbarProps)` where

```ts
export interface CanvasToolbarProps {
  iterating: boolean; onToggleIteration: () => void;
  hunting: boolean; onHunt: () => void; onCancelHunt: () => void;
  isFractalType: boolean;
  zoom: number;
  onFitToView: () => void; onZoomIn: () => void; onZoomOut: () => void; onZoomReset: () => void;
  onResetFractalView: () => void;
  variant?: "desktop" | "mobile";
}
```

`variant="mobile"` renders only Hunt, Run/Pause, Fit (thumb row).

- [ ] **Step 1: Write failing test** — `src/__tests__/CanvasToolbar.test.tsx`:

```tsx
import { screen, fireEvent } from "@testing-library/react";
import { renderWithTheme } from "./renderWithTheme";
import { CanvasToolbar, CanvasToolbarProps } from "../components/shell/CanvasToolbar";

const base = (): CanvasToolbarProps => ({
  iterating: false, onToggleIteration: jest.fn(),
  hunting: false, onHunt: jest.fn(), onCancelHunt: jest.fn(),
  isFractalType: false, zoom: 1,
  onFitToView: jest.fn(), onZoomIn: jest.fn(), onZoomOut: jest.fn(), onZoomReset: jest.fn(),
  onResetFractalView: jest.fn(),
});

describe("CanvasToolbar", () => {
  it("toggles run/pause label", () => {
    const p = base();
    const { rerender } = renderWithTheme(<CanvasToolbar {...p} />);
    fireEvent.click(screen.getByRole("button", { name: "Run" }));
    expect(p.onToggleIteration).toHaveBeenCalled();
    rerender(<CanvasToolbar {...p} iterating />);
    expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();
  });

  it("hunt becomes cancel while hunting", () => {
    const p = base();
    const { rerender } = renderWithTheme(<CanvasToolbar {...p} />);
    fireEvent.click(screen.getByRole("button", { name: "Hunt" }));
    expect(p.onHunt).toHaveBeenCalled();
    rerender(<CanvasToolbar {...p} hunting />);
    fireEvent.click(screen.getByRole("button", { name: "Cancel hunt" }));
    expect(p.onCancelHunt).toHaveBeenCalled();
  });

  it("hides hunt and shows recenter for fractals", () => {
    renderWithTheme(<CanvasToolbar {...base()} isFractalType />);
    expect(screen.queryByRole("button", { name: "Hunt" })).toBeNull();
    expect(screen.getByRole("button", { name: "Recenter" })).toBeInTheDocument();
  });

  it("shows zoom percentage and zoom controls on desktop", () => {
    const p = base();
    renderWithTheme(<CanvasToolbar {...p} zoom={1.5} />);
    expect(screen.getByText("150%")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    fireEvent.click(screen.getByRole("button", { name: "Zoom out" }));
    fireEvent.click(screen.getByRole("button", { name: "Actual size" }));
    fireEvent.click(screen.getByRole("button", { name: "Fit to view" }));
    expect(p.onZoomIn).toHaveBeenCalled();
    expect(p.onZoomOut).toHaveBeenCalled();
    expect(p.onZoomReset).toHaveBeenCalled();
    expect(p.onFitToView).toHaveBeenCalled();
  });

  it("mobile variant only has the thumb row", () => {
    renderWithTheme(<CanvasToolbar {...base()} variant="mobile" />);
    expect(screen.getByRole("button", { name: "Run" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Fit to view" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Zoom in" })).toBeNull();
  });
});
```

Check first whether today's `SystemCommandBar` hides Hunt for fractals (`sed -n 200,240p src/components/SystemCommandBar.tsx`). If Hunt is shown for fractals today, keep it shown and change the third test to only assert Recenter is present.

- [ ] **Step 2: Run to verify fails** — `CI=true npm test -- --watchAll=false CanvasToolbar` → FAIL.

- [ ] **Step 3: Implement** — `src/components/shell/CanvasToolbar.tsx`:

```tsx
import React from "react";
import styled from "styled-components";
import { IconButton } from "../ui/IconButton";
import { Icon } from "../ui/Icon";
import { tokens } from "../../theme/tokens";

export interface CanvasToolbarProps {
  iterating: boolean; onToggleIteration: () => void;
  hunting: boolean; onHunt: () => void; onCancelHunt: () => void;
  isFractalType: boolean;
  zoom: number;
  onFitToView: () => void; onZoomIn: () => void; onZoomOut: () => void; onZoomReset: () => void;
  onResetFractalView: () => void;
  variant?: "desktop" | "mobile";
}

const Bar = styled.div<{ $mobile: boolean }>`
  display: flex; align-items: center; gap: ${p => (p.$mobile ? "12px" : "6px")};
  justify-content: ${p => (p.$mobile ? "space-between" : "center")};
  padding: ${p => (p.$mobile ? "0" : "8px")};
  ${p => !p.$mobile && `
    background: ${p.theme.glass1};
    backdrop-filter: blur(16px) saturate(160%);
    -webkit-backdrop-filter: blur(16px) saturate(160%);
    border: 1px solid ${p.theme.hairline};
    border-radius: ${tokens.radius.full};
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
  `}
`;
const Divider = styled.span`width: 1px; height: 24px; background: ${p => p.theme.hairline}; margin: 0 4px;`;
const ZoomText = styled.span`
  min-width: 48px; text-align: center; font: 500 12px ${tokens.font.mono}; color: ${p => p.theme.primary};
`;
const Spinner = styled.span`
  display: inline-block; animation: spin 1s linear infinite;
  @keyframes spin { to { transform: rotate(360deg); } }
`;

export const CanvasToolbar: React.FC<CanvasToolbarProps> = (p) => {
  const mobile = p.variant === "mobile";
  const run = (
    <IconButton label={p.iterating ? "Pause" : "Run"} variant="primary" size="lg" onClick={p.onToggleIteration}>
      <Icon name={p.iterating ? "pause" : "play"} size={20} />
    </IconButton>
  );
  const hunt = !p.isFractalType && (
    p.hunting
      ? <IconButton label="Cancel hunt" variant="soft" active onClick={p.onCancelHunt}><Spinner><Icon name="sparkle" size={16} /></Spinner> Cancel</IconButton>
      : <IconButton label="Hunt" variant="soft" onClick={p.onHunt}><Icon name="sparkle" size={16} /> Hunt</IconButton>
  );
  const fit = <IconButton label="Fit to view" variant={mobile ? "soft" : "ghost"} onClick={p.onFitToView}><Icon name="fit" size={16} />{mobile && " Fit"}</IconButton>;

  if (mobile) {
    return <Bar $mobile>{hunt || <span style={{ width: 88 }} />}{run}{fit}</Bar>;
  }

  return (
    <Bar $mobile={false} role="toolbar" aria-label="Canvas controls">
      {run}
      {hunt}
      <Divider />
      {fit}
      <IconButton label="Zoom out" onClick={p.onZoomOut}><Icon name="minus" size={16} /></IconButton>
      <ZoomText>{Math.round(p.zoom * 100)}%</ZoomText>
      <IconButton label="Zoom in" onClick={p.onZoomIn}><Icon name="plus" size={16} /></IconButton>
      <IconButton label="Actual size" onClick={p.onZoomReset}>1:1</IconButton>
      {p.isFractalType && <IconButton label="Recenter" onClick={p.onResetFractalView}><Icon name="recenter" size={16} /></IconButton>}
    </Bar>
  );
};
```

- [ ] **Step 4: Run tests** — `CI=true npm test -- --watchAll=false CanvasToolbar` → PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/shell/CanvasToolbar.tsx src/__tests__/CanvasToolbar.test.tsx
git commit -m "feat(ui): add floating CanvasToolbar"
```

---

### Task 6: Inspector

**Files:**
- Create: `src/components/shell/Inspector.tsx`, `src/components/shell/types.ts`
- Test: `src/__tests__/Inspector.test.tsx`

**Interfaces:**
- Consumes: panels (Task 4), `IconButton`, `Icon` (Task 3).
- Produces: `ShellProps` in `src/components/shell/types.ts` (used by Tasks 7–9):

```ts
import React from "react";
import { AttractorType } from "../../attractors/shared/types";
import { Color } from "../../model-controller/Attractor/palette";
import { BgColor, BgMode } from "../../lib/bgMode";
import { FxState } from "../panels/FxPanel";
import { CanvasToolbarProps } from "./CanvasToolbar";

export interface ShellProps extends Omit<CanvasToolbarProps, "variant"> {
  canvas: React.ReactNode;
  attractorType: AttractorType;
  systemLabel: string;
  onAttractorTypeChange: (t: AttractorType) => void;
  controls: React.ReactNode;
  fx: FxState;
  onFxChange: (patch: Partial<FxState>) => void;
  canvasSize: number; onCanvasSizeChange: (n: number) => void;
  oversampling: number; onOversamplingChange: (n: number) => void;
  paletteData: Color[]; bgColor: BgColor; onBgModeChange: (m: BgMode) => void; onOpenPalette: () => void;
  onOpenExport: () => void;
  rendering: boolean;
  statsRef: React.MutableRefObject<{ maxHits: number; totalIterations: number }>;
  maxIter?: number;
}
```

- Produces: `type InspectorTab = "system" | "params" | "render" | "color" | "fx"`; `Inspector(props: ShellProps & { collapsed: boolean; onToggleCollapse: () => void; tab: InspectorTab; onTabChange: (t: InspectorTab) => void })`.

- [ ] **Step 1: Write failing test** — `src/__tests__/Inspector.test.tsx`:

```tsx
import React from "react";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithTheme } from "./renderWithTheme";
import "../attractors";
import { Inspector } from "../components/shell/Inspector";
import { makeShellProps } from "./shellProps";

describe("Inspector", () => {
  it("shows the selected tab's panel", () => {
    const onTabChange = jest.fn();
    const { rerender } = renderWithTheme(
      <Inspector {...makeShellProps()} collapsed={false} onToggleCollapse={() => {}} tab="params" onTabChange={onTabChange} />
    );
    expect(screen.getByTestId("controls")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "Color" }));
    expect(onTabChange).toHaveBeenCalledWith("color");
    rerender(<Inspector {...makeShellProps()} collapsed={false} onToggleCollapse={() => {}} tab="color" onTabChange={onTabChange} />);
    expect(screen.getByRole("radiogroup", { name: "Background" })).toBeInTheDocument();
  });

  it("has all five tabs", () => {
    renderWithTheme(<Inspector {...makeShellProps()} collapsed={false} onToggleCollapse={() => {}} tab="params" onTabChange={() => {}} />);
    for (const name of ["System", "Parameters", "Render", "Color", "Effects"]) {
      expect(screen.getByRole("tab", { name })).toBeInTheDocument();
    }
  });

  it("collapsed: hides panel content, keeps expand control", () => {
    const onToggle = jest.fn();
    renderWithTheme(<Inspector {...makeShellProps()} collapsed onToggleCollapse={onToggle} tab="params" onTabChange={() => {}} />);
    expect(screen.queryByTestId("controls")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Expand inspector" }));
    expect(onToggle).toHaveBeenCalled();
  });
});
```

Also create the shared fixture `src/__tests__/shellProps.tsx` (not a test file — excluded by `testMatch`; reused by Task 8):

```tsx
import React from "react";
import { ShellProps } from "../components/shell/types";

export function makeShellProps(over: Partial<ShellProps> = {}): ShellProps {
  return {
    canvas: <div data-testid="canvas" />,
    attractorType: "clifford", systemLabel: "Clifford", onAttractorTypeChange: jest.fn(),
    controls: <div data-testid="controls">controls</div>,
    fx: { enabled: false, bloom: 0, grain: 0, vignette: 0, exposure: 1 }, onFxChange: jest.fn(),
    canvasSize: 1200, onCanvasSizeChange: jest.fn(), oversampling: 2, onOversamplingChange: jest.fn(),
    paletteData: [], bgColor: { r: 0, g: 0, b: 0 }, onBgModeChange: jest.fn(), onOpenPalette: jest.fn(),
    onOpenExport: jest.fn(), rendering: false,
    statsRef: { current: { maxHits: 0, totalIterations: 0 } }, maxIter: undefined,
    iterating: false, onToggleIteration: jest.fn(), hunting: false, onHunt: jest.fn(), onCancelHunt: jest.fn(),
    isFractalType: false, zoom: 1, onFitToView: jest.fn(), onZoomIn: jest.fn(), onZoomOut: jest.fn(),
    onZoomReset: jest.fn(), onResetFractalView: jest.fn(),
    ...over,
  };
}
```

- [ ] **Step 2: Run to verify fails** — `CI=true npm test -- --watchAll=false Inspector` → FAIL.

- [ ] **Step 3: Write `src/components/shell/types.ts`** with the `ShellProps` interface exactly as in Interfaces above.

- [ ] **Step 4: Implement `Inspector.tsx`**

```tsx
import React from "react";
import styled from "styled-components";
import { ShellProps } from "./types";
import { SystemPanel, RenderPanel, ColorPanel, FxPanel, StatsReadout } from "../panels";
import { IconButton } from "../ui/IconButton";
import { Icon, IconName } from "../ui/Icon";
import { tokens } from "../../theme/tokens";

export type InspectorTab = "system" | "params" | "render" | "color" | "fx";

const TABS: { id: InspectorTab; label: string; icon: IconName }[] = [
  { id: "system", label: "System", icon: "layers" },
  { id: "params", label: "Parameters", icon: "sliders" },
  { id: "render", label: "Render", icon: "image" },
  { id: "color", label: "Color", icon: "palette" },
  { id: "fx", label: "Effects", icon: "wand" },
];

const Aside = styled.aside<{ $collapsed: boolean }>`
  width: ${p => (p.$collapsed ? "56px" : "320px")};
  flex-shrink: 0;
  display: flex; flex-direction: column;
  background: ${p => p.theme.glass1};
  backdrop-filter: blur(16px) saturate(160%);
  -webkit-backdrop-filter: blur(16px) saturate(160%);
  border-left: 1px solid ${p => p.theme.hairline};
  transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: ${tokens.z.panel};
  min-height: 0;
`;
const TabRow = styled.div<{ $collapsed: boolean }>`
  display: flex; flex-direction: ${p => (p.$collapsed ? "column" : "row")};
  gap: 4px; padding: 10px; border-bottom: 1px solid ${p => p.theme.hairline};
`;
const Body = styled.div`
  flex: 1; overflow-y: auto; padding: 16px; min-height: 0;
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: ${p => p.theme.hairlineStrong}; border-radius: 2px; }
`;
const Footer = styled.div`padding: 12px 16px; border-top: 1px solid ${p => p.theme.hairline};`;
const Title = styled.div`
  display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 14px;
  h2 { margin: 0; font: 600 16px ${tokens.font.ui}; color: ${p => p.theme.textHigh}; }
`;

type Props = ShellProps & {
  collapsed: boolean; onToggleCollapse: () => void;
  tab: InspectorTab; onTabChange: (t: InspectorTab) => void;
};

export const Inspector: React.FC<Props> = (p) => {
  const tabButtons = TABS.map(t => (
    <IconButton key={t.id} role="tab" aria-selected={p.tab === t.id} label={t.label} size="sm"
      active={!p.collapsed && p.tab === t.id}
      onClick={() => { if (p.collapsed) p.onToggleCollapse(); p.onTabChange(t.id); }}>
      <Icon name={t.icon} size={16} />
    </IconButton>
  ));

  return (
    <Aside $collapsed={p.collapsed} aria-label="Inspector">
      <TabRow role="tablist" aria-label="Inspector sections" $collapsed={p.collapsed}>
        {tabButtons}
        <span style={{ flex: 1 }} />
        <IconButton label={p.collapsed ? "Expand inspector" : "Collapse inspector"} size="sm" onClick={p.onToggleCollapse}>
          <Icon name={p.collapsed ? "chevronLeft" : "chevronRight"} size={16} />
        </IconButton>
      </TabRow>

      {!p.collapsed && (
        <>
          <Body role="tabpanel">
            {p.tab === "system" && <SystemPanel value={p.attractorType} onChange={p.onAttractorTypeChange} />}
            {p.tab === "params" && (
              <>
                <Title><h2>{p.systemLabel}</h2></Title>
                {p.controls}
              </>
            )}
            {p.tab === "render" && <RenderPanel canvasSize={p.canvasSize} onCanvasSizeChange={p.onCanvasSizeChange}
              oversampling={p.oversampling} onOversamplingChange={p.onOversamplingChange} />}
            {p.tab === "color" && <ColorPanel paletteData={p.paletteData} bgColor={p.bgColor}
              onBgModeChange={p.onBgModeChange} onOpenPalette={p.onOpenPalette} />}
            {p.tab === "fx" && <FxPanel fx={p.fx} onChange={p.onFxChange} />}
          </Body>
          <Footer>
            <StatsReadout statsRef={p.statsRef} running={p.iterating} rendering={p.rendering}
              isFractal={p.isFractalType} maxIter={p.maxIter} />
          </Footer>
        </>
      )}
    </Aside>
  );
};
```

- [ ] **Step 5: Run tests** — `CI=true npm test -- --watchAll=false Inspector` → PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/shell/Inspector.tsx src/components/shell/types.ts src/__tests__/Inspector.test.tsx src/__tests__/shellProps.tsx
git commit -m "feat(ui): add tabbed Inspector and ShellProps contract"
```

---

### Task 7: useShare + TopBar

**Files:**
- Create: `src/hooks/useShare.ts`, `src/components/shell/TopBar.tsx`
- Modify: `src/hooks/index.ts`
- Test: `src/__tests__/useShare.test.tsx`, `src/__tests__/TopBar.test.tsx`

**Interfaces:**
- Produces: `type ShareStatus = "idle" | "copied" | "failed"`; `useShare(resetMs = 2000): { status: ShareStatus; share: () => Promise<void> }` — copies `window.location.href`.
- Produces: `TopBar(props: { systemLabel: string; onSystemClick: () => void; onOpenExport: () => void; compact?: boolean })`. Uses `useTheme()` from `src/theme/ThemeContext` for the theme switcher, `useNavigate()` for Docs, `useShare()` for Share. `compact` = mobile overlay (logo mark, system pill, Share only).

- [ ] **Step 1: Write failing tests**

`src/__tests__/useShare.test.tsx`:

```tsx
import { renderHook, act } from "@testing-library/react";
import { useShare } from "../hooks/useShare";

describe("useShare", () => {
  const original = navigator.clipboard;
  afterEach(() => { Object.assign(navigator, { clipboard: original }); jest.useRealTimers(); });

  it("reports copied, then resets", async () => {
    jest.useFakeTimers();
    Object.assign(navigator, { clipboard: { writeText: jest.fn().mockResolvedValue(undefined) } });
    const { result } = renderHook(() => useShare(1000));
    await act(async () => { await result.current.share(); });
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(window.location.href);
    expect(result.current.status).toBe("copied");
    act(() => { jest.advanceTimersByTime(1000); });
    expect(result.current.status).toBe("idle");
  });

  it("reports failed when the clipboard rejects", async () => {
    Object.assign(navigator, { clipboard: { writeText: jest.fn().mockRejectedValue(new Error("denied")) } });
    const { result } = renderHook(() => useShare());
    await act(async () => { await result.current.share(); });
    expect(result.current.status).toBe("failed");
  });

  it("reports failed when the clipboard API is missing", async () => {
    Object.assign(navigator, { clipboard: undefined });
    const { result } = renderHook(() => useShare());
    await act(async () => { await result.current.share(); });
    expect(result.current.status).toBe("failed");
  });
});
```

`src/__tests__/TopBar.test.tsx`:

```tsx
import React from "react";
import { screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { renderWithTheme } from "./renderWithTheme";
import { ThemeProvider as AppThemeProvider } from "../theme/ThemeContext";
import { TopBar } from "../components/shell/TopBar";

const wrap = (ui: React.ReactElement) =>
  renderWithTheme(<MemoryRouter><AppThemeProvider>{ui}</AppThemeProvider></MemoryRouter>);

describe("TopBar", () => {
  it("shows the system pill and opens the picker", () => {
    const onSystemClick = jest.fn();
    wrap(<TopBar systemLabel="Clifford" onSystemClick={onSystemClick} onOpenExport={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: /Clifford/ }));
    expect(onSystemClick).toHaveBeenCalled();
  });

  it("export opens the export modal", () => {
    const onOpenExport = jest.fn();
    wrap(<TopBar systemLabel="Clifford" onSystemClick={() => {}} onOpenExport={onOpenExport} />);
    fireEvent.click(screen.getByRole("button", { name: "Export" }));
    expect(onOpenExport).toHaveBeenCalled();
  });

  it("compact mode hides export, docs and theme", () => {
    wrap(<TopBar compact systemLabel="Clifford" onSystemClick={() => {}} onOpenExport={() => {}} />);
    expect(screen.queryByRole("button", { name: "Export" })).toBeNull();
    expect(screen.queryByRole("combobox", { name: "Theme" })).toBeNull();
    expect(screen.getByRole("button", { name: "Share" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to verify fails** — `CI=true npm test -- --watchAll=false "useShare|TopBar"` → FAIL.

- [ ] **Step 3: Implement `useShare.ts`**

```ts
import { useCallback, useEffect, useRef, useState } from "react";

export type ShareStatus = "idle" | "copied" | "failed";

export function useShare(resetMs = 2000) {
  const [status, setStatus] = useState<ShareStatus>("idle");
  const timer = useRef<number>();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const share = useCallback(async () => {
    let next: ShareStatus = "failed";
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(window.location.href);
        next = "copied";
      }
    } catch {
      next = "failed";
    }
    setStatus(next);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setStatus("idle"), resetMs);
  }, [resetMs]);

  return { status, share };
}
```

Append to `src/hooks/index.ts`: `export * from "./useShare";`

- [ ] **Step 4: Implement `TopBar.tsx`**

```tsx
import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../theme/ThemeContext";
import { useShare } from "../../hooks/useShare";
import { IconButton } from "../ui/IconButton";
import { Icon } from "../ui/Icon";
import { tokens } from "../../theme/tokens";

const Bar = styled.header<{ $compact: boolean }>`
  display: flex; align-items: center; gap: 12px;
  height: ${p => (p.$compact ? "auto" : "52px")};
  padding: ${p => (p.$compact ? "calc(env(safe-area-inset-top) + 10px) 12px 0" : "0 16px")};
  background: ${p => (p.$compact ? "transparent" : p.theme.glass1)};
  backdrop-filter: ${p => (p.$compact ? "none" : "blur(16px) saturate(160%)")};
  -webkit-backdrop-filter: ${p => (p.$compact ? "none" : "blur(16px) saturate(160%)")};
  border-bottom: ${p => (p.$compact ? "none" : `1px solid ${p.theme.hairline}`)};
  z-index: ${tokens.z.toolbar};
`;
const Brand = styled.div`
  display: flex; align-items: center; gap: 8px;
  font: 600 15px ${tokens.font.ui}; color: ${p => p.theme.textHigh}; white-space: nowrap;
`;
const Mark = styled.span`
  width: 28px; height: 28px; border-radius: 8px; display: grid; place-items: center;
  border: 1px solid ${p => p.theme.primaryBorder}; color: ${p => p.theme.primary}; box-shadow: ${p => p.theme.glowPrimary};
  font: 700 14px ${tokens.font.mono};
`;
const Pill = styled.button`
  display: inline-flex; align-items: center; gap: 8px; min-height: 36px; max-width: 100%;
  padding: 0 14px; border-radius: ${tokens.radius.full}; cursor: pointer;
  background: ${p => p.theme.glass1}; border: 1px solid ${p => p.theme.hairlineStrong};
  color: ${p => p.theme.textHigh}; font: 500 13px ${tokens.font.ui};
  span.label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  &::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: ${p => p.theme.primary}; box-shadow: ${p => p.theme.glowPrimary}; flex-shrink: 0; }
  @media (max-width: ${tokens.breakpoint.mobileMax}px) { min-height: 44px; }
`;
const Center = styled.div`flex: 1; min-width: 0; display: flex; justify-content: center;`;
const ThemeSelect = styled.select`
  min-height: 32px; border-radius: 8px; padding: 0 8px;
  background: transparent; color: ${p => p.theme.textMid}; border: 1px solid ${p => p.theme.hairline};
  font: 500 12px ${tokens.font.ui};
`;

interface Props { systemLabel: string; onSystemClick: () => void; onOpenExport: () => void; compact?: boolean }

export const TopBar: React.FC<Props> = ({ systemLabel, onSystemClick, onOpenExport, compact = false }) => {
  const navigate = useNavigate();
  const { currentTheme, setTheme, availableThemes } = useTheme();
  const { status, share } = useShare();
  const shareText = status === "copied" ? "Copied" : status === "failed" ? "Couldn't copy" : "Share";

  return (
    <Bar $compact={compact}>
      <Brand><Mark>∞</Mark>{!compact && "Chaos Iterator"}</Brand>
      <Center>
        <Pill type="button" onClick={onSystemClick} aria-label={`${systemLabel} — change system`}>
          <span className="label">{systemLabel}</span><Icon name="chevronDown" size={14} />
        </Pill>
      </Center>
      {!compact && (
        <ThemeSelect aria-label="Theme" value={currentTheme} onChange={e => setTheme(e.target.value)}>
          {availableThemes.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
        </ThemeSelect>
      )}
      {!compact && <IconButton label="Docs" onClick={() => navigate("/info")}><Icon name="info" size={16} /></IconButton>}
      <IconButton label="Share" variant={compact ? "soft" : "ghost"} active={status === "copied"} onClick={share}>
        <Icon name="share" size={16} />{!compact && ` ${shareText}`}
      </IconButton>
      <span role="status" aria-live="polite" style={{ position: "absolute", left: -9999 }}>{status !== "idle" ? shareText : ""}</span>
      {!compact && <IconButton label="Export" variant="primary" onClick={onOpenExport}><Icon name="download" size={16} /> Export</IconButton>}
    </Bar>
  );
};
```

Note: the `IconButton` aria-label stays "Share" in every state; the live region announces "Copied"/"Couldn't copy".

- [ ] **Step 5: Run tests** — `CI=true npm test -- --watchAll=false "useShare|TopBar"` → PASS.

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useShare.ts src/hooks/index.ts src/components/shell/TopBar.tsx src/__tests__/useShare.test.tsx src/__tests__/TopBar.test.tsx
git commit -m "feat(ui): add TopBar with theme switcher and resilient share"
```

---

### Task 8: DesktopShell, ResponsiveShell, Home refactor, remove old chrome

**Files:**
- Create: `src/components/shell/DesktopShell.tsx`, `src/components/shell/ResponsiveShell.tsx`, `src/components/shell/index.ts`
- Create (temporary, replaced in Task 9): `src/components/shell/MobileShell.tsx` exporting `MobileShell` that renders `<DesktopShell {...props} />`
- Modify: `src/view/pages/Home.tsx`, `src/components/index.ts`
- Delete: `src/components/Sidebar.tsx`, `SystemCommandBar.tsx`, `FloatingPanels.tsx`, `FXControls.tsx`, `LiveStats.tsx`
- Test: `src/__tests__/ResponsiveShell.test.tsx`

**Interfaces:**
- Consumes: `ShellProps` (Task 6), `TopBar` (Task 7), `Inspector` (Task 6), `CanvasToolbar` (Task 5), `useIsMobile` (Task 2), `bgColorFor` (Task 2).
- Produces: `DesktopShell(props: ShellProps)`, `MobileShell(props: ShellProps)`, `ResponsiveShell(props: ShellProps)`.

- [ ] **Step 1: Write failing test** — `src/__tests__/ResponsiveShell.test.tsx`:

```tsx
import React from "react";
import { screen, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { renderWithTheme } from "./renderWithTheme";
import { ThemeProvider as AppThemeProvider } from "../theme/ThemeContext";
import "../attractors";
import { ResponsiveShell } from "../components/shell";
import { makeShellProps } from "./shellProps";

type L = (e: { matches: boolean }) => void;
function mockMatchMedia(initial: boolean) {
  let matches = initial; const ls: L[] = [];
  window.matchMedia = jest.fn().mockImplementation(() => ({
    get matches() { return matches; },
    addEventListener: (_: string, l: L) => ls.push(l),
    removeEventListener: (_: string, l: L) => ls.splice(ls.indexOf(l), 1),
  })) as any;
  return (v: boolean) => { matches = v; ls.forEach(l => l({ matches })); };
}

describe("ResponsiveShell", () => {
  it("renders the same canvas and run state on both sides of the breakpoint", () => {
    const set = mockMatchMedia(false);
    const props = makeShellProps({ systemLabel: "Clifford", iterating: true });
    renderWithTheme(<MemoryRouter><AppThemeProvider><ResponsiveShell {...props} /></AppThemeProvider></MemoryRouter>);
    expect(screen.getByTestId("canvas")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();

    act(() => set(true));
    expect(screen.getByTestId("canvas")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Clifford/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();
  });
});
```

(State lives in `Home`'s hooks, which this test simulates via props; both shells must render from the same props and show the same run state.)

- [ ] **Step 2: Run to verify fails** — `CI=true npm test -- --watchAll=false ResponsiveShell` → FAIL.

- [ ] **Step 3: Implement `DesktopShell.tsx`**

```tsx
import React, { useState } from "react";
import styled from "styled-components";
import { ShellProps } from "./types";
import { TopBar } from "./TopBar";
import { Inspector, InspectorTab } from "./Inspector";
import { CanvasToolbar } from "./CanvasToolbar";
import { tokens } from "../../theme/tokens";

const Page = styled.div`
  display: grid; grid-template-rows: auto 1fr; width: 100vw; height: 100vh; overflow: hidden;
  background: ${p => p.theme.canvasBg}; color: ${p => p.theme.textHigh}; font-family: ${tokens.font.ui};
`;
const Row = styled.div`display: flex; min-height: 0;`;
const Stage = styled.main`flex: 1; min-width: 0; position: relative; display: flex;`;
const ToolbarDock = styled.div`
  position: absolute; left: 50%; bottom: 20px; transform: translateX(-50%); z-index: ${tokens.z.toolbar};
`;

export const DesktopShell: React.FC<ShellProps> = (p) => {
  const [collapsed, setCollapsed] = useState(false);
  const [tab, setTab] = useState<InspectorTab>("params");

  const { canvas, ...rest } = p;
  return (
    <Page>
      <TopBar systemLabel={p.systemLabel} onOpenExport={p.onOpenExport}
        onSystemClick={() => { setCollapsed(false); setTab("system"); }} />
      <Row>
        <Stage>
          {canvas}
          <ToolbarDock>
            <CanvasToolbar {...rest} />
          </ToolbarDock>
        </Stage>
        <Inspector {...p} collapsed={collapsed} onToggleCollapse={() => setCollapsed(c => !c)} tab={tab} onTabChange={setTab} />
      </Row>
    </Page>
  );
};
```

- [ ] **Step 4: Implement `ResponsiveShell.tsx`, temporary `MobileShell.tsx`, `index.ts`**

```tsx
// ResponsiveShell.tsx
import React from "react";
import { useIsMobile } from "../../hooks/useIsMobile";
import { DesktopShell } from "./DesktopShell";
import { MobileShell } from "./MobileShell";
import { ShellProps } from "./types";

export const ResponsiveShell: React.FC<ShellProps> = (props) =>
  useIsMobile() ? <MobileShell {...props} /> : <DesktopShell {...props} />;
```

```tsx
// MobileShell.tsx (temporary; replaced in Task 9)
import React from "react";
import { DesktopShell } from "./DesktopShell";
import { ShellProps } from "./types";
export const MobileShell: React.FC<ShellProps> = (p) => <DesktopShell {...p} />;
```

```ts
// index.ts
export * from "./types";
export * from "./TopBar";
export * from "./Inspector";
export * from "./CanvasToolbar";
export * from "./DesktopShell";
export * from "./MobileShell";
export * from "./ResponsiveShell";
```

- [ ] **Step 5: Refactor `Home.tsx`**

1. Replace the components import with:

```ts
import { CanvasArea, PaletteModal, ExportModal } from "../../components";
import { ResponsiveShell } from "../../components/shell";
import { bgColorFor, BgMode } from "../../lib/bgMode";
import { useTheme } from "../../theme/ThemeContext";
```

2. Delete `PageContainer`, `MainContent` styled components and `sidebarCollapsed` state.
3. Replace `handleShareLink` and its usage (share now lives in `TopBar` via `useShare`) — delete `handleShareLink`.
4. Add, after the palette hook:

```ts
const { colors: themeColors } = useTheme();
const handleBgModeChange = useCallback((mode: BgMode) => {
  palette.setBgColor(bgColorFor(mode, themeColors.bgPage));
}, [palette, themeColors.bgPage]);
const systemLabel = registry.get(attractor.attractorType)?.label ?? attractor.attractorType;
```

5. Replace the entire `return (...)` with:

```tsx
const canvas = (
  <CanvasArea
    canvasRef={worker.canvasRef}
    containerRef={worker.containerRef}
    canvasSize={worker.canvasSize}
    zoom={worker.zoom}
    canvasKey={worker.canvasKey}
    isFractalType={attractor.isFractalType}
    rendering={worker.rendering}
    isDragging={fractalZoom.isDragging}
    dragSelection={dragSelection}
    onMouseDown={handleFractalMouseDown}
    onMouseMove={handleFractalMouseMove}
    onMouseUp={handleFractalMouseUp}
    fx={attractor.fx}
  />
);

return (
  <>
    <ResponsiveShell
      canvas={canvas}
      attractorType={attractor.attractorType}
      systemLabel={systemLabel}
      onAttractorTypeChange={handleAttractorTypeChange}
      controls={renderControls()}
      fx={attractor.fx}
      onFxChange={attractor.setFx}
      canvasSize={worker.canvasSize}
      onCanvasSizeChange={worker.setCanvasSize}
      oversampling={worker.oversampling}
      onOversamplingChange={worker.setOversampling}
      paletteData={palette.paletteData}
      bgColor={palette.bgColor}
      onBgModeChange={handleBgModeChange}
      onOpenPalette={handleOpenPalette}
      onOpenExport={handleOpenExport}
      rendering={worker.rendering}
      statsRef={worker.statsRef}
      maxIter={currentMaxIter}
      iterating={worker.iterating}
      onToggleIteration={worker.toggleIteration}
      hunting={hunting}
      onHunt={handleHunt}
      onCancelHunt={handleCancelHunt}
      isFractalType={attractor.isFractalType}
      zoom={worker.zoom}
      onFitToView={worker.fitToView}
      onZoomIn={worker.zoomIn}
      onZoomOut={worker.zoomOut}
      onZoomReset={worker.zoomReset}
      onResetFractalView={handleResetFractalView}
    />
    {/* PaletteModal and ExportModal: keep the existing JSX blocks unchanged */}
  </>
);
```

Keep the existing `<PaletteModal .../>` and `<ExportModal .../>` JSX inside the fragment exactly as they are today.

If `attractor.setFx`'s TypeScript type rejects `Partial<FxState>`, check its signature in `src/hooks/useAttractorState.ts` and adapt `FxState` in `FxPanel.tsx` to match its fx type (do not change the hook).

6. `CanvasArea.tsx`: change `CanvasContainer` background to `background-color: ${p => p.theme.canvasBg};` and grid lines to `p.theme.hairline` at `48px` spacing; `CanvasWrapper` border → `1px solid ${p => p.theme.hairline}`, radius `10px`.

- [ ] **Step 6: Remove old chrome**

```bash
git rm src/components/Sidebar.tsx src/components/SystemCommandBar.tsx src/components/FloatingPanels.tsx src/components/FXControls.tsx src/components/LiveStats.tsx
```

Edit `src/components/index.ts` to:

```ts
export * from "./CanvasArea";
export * from "./PaletteModal";
export * from "./ExportModal";
export * from "./CustomDropdown";
export * from "./ModalStyles";
export * from "./GiscusComments";
```

Run `grep -rn "Sidebar\|SystemCommandBar\|FloatingPanels\|FXControls\|LiveStats" src` → expect no matches outside tests.

- [ ] **Step 7: Run all tests + type-check**

Run: `CI=true npm test -- --watchAll=false && npx tsc --noEmit -p .`
Expected: PASS, no errors.

- [ ] **Step 8: Manual check (desktop)** — `npm start`, at 1440×900:
  - Top bar shows brand, "Clifford…" pill, theme select, Docs, Share, Export.
  - Inspector tabs switch; Parameters shows presets as cards; changing a preset re-renders.
  - Run/Pause, Hunt, Fit/±/1:1 work; Mandelbrot shows Recenter and drag-to-zoom still works with the mouse.
  - System pill opens the System tab; picking De Jong switches render.
  - Background Void/Ink/Paper changes canvas background.
  - Theme switch recolors everything.
  Stop the server.

- [ ] **Step 9: Commit**

```bash
git add -A src
git commit -m "feat(ui): desktop shell with top bar, inspector and floating toolbar; remove sidebar UI"
```

---

### Task 9: BottomSheet + MobileShell

**Files:**
- Create: `src/components/shell/BottomSheet.tsx`
- Modify: `src/components/shell/MobileShell.tsx` (replace temporary), `src/components/shell/index.ts`
- Test: `src/__tests__/BottomSheet.test.tsx`

**Interfaces:**
- Consumes: `sheetReducer`, `initialSheet`, `SheetTab` (Task 2); panels (Task 4); `CanvasToolbar` variant `"mobile"` (Task 5); `TopBar` compact (Task 7); `StatsReadout` compact (Task 4).
- Produces: `BottomSheet(props: { state: SheetState; dispatch: React.Dispatch<SheetAction>; actionRow: React.ReactNode; children: React.ReactNode })` — renders handle, `actionRow`, the tab bar, and `children` (the active panel) only when expanded. Constants `SHEET_PEEK_PX = 148`.

- [ ] **Step 1: Write failing test** — `src/__tests__/BottomSheet.test.tsx`:

```tsx
import React, { useReducer } from "react";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithTheme } from "./renderWithTheme";
import { BottomSheet } from "../components/shell/BottomSheet";
import { sheetReducer, initialSheet } from "../lib/sheetState";

function Harness() {
  const [state, dispatch] = useReducer(sheetReducer, initialSheet);
  return (
    <BottomSheet state={state} dispatch={dispatch} actionRow={<button>Run</button>}>
      <div data-testid={`panel-${state.tab}`} />
    </BottomSheet>
  );
}

describe("BottomSheet", () => {
  it("peek shows action row and tabs but no panel", () => {
    renderWithTheme(<Harness />);
    expect(screen.getByRole("button", { name: "Run" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Params" })).toBeInTheDocument();
    expect(screen.queryByTestId("panel-params")).toBeNull();
  });

  it("tapping a tab expands to it; tapping again collapses", () => {
    renderWithTheme(<Harness />);
    fireEvent.click(screen.getByRole("tab", { name: "Color" }));
    expect(screen.getByTestId("panel-color")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Color" })).toHaveAttribute("aria-selected", "true");
    fireEvent.click(screen.getByRole("tab", { name: "Color" }));
    expect(screen.queryByTestId("panel-color")).toBeNull();
  });

  it("handle toggles expansion", () => {
    renderWithTheme(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: "Expand panel" }));
    expect(screen.getByTestId("panel-params")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Collapse panel" }));
    expect(screen.queryByTestId("panel-params")).toBeNull();
  });
});
```

- [ ] **Step 2: Run to verify fails** — `CI=true npm test -- --watchAll=false BottomSheet` → FAIL.

- [ ] **Step 3: Implement `BottomSheet.tsx`**

```tsx
import React, { useRef } from "react";
import styled from "styled-components";
import { SheetAction, SheetState, SheetTab } from "../../lib/sheetState";
import { Icon, IconName } from "../ui/Icon";
import { tokens } from "../../theme/tokens";

export const SHEET_PEEK_PX = 148;

const TABS: { id: SheetTab; label: string; icon: IconName }[] = [
  { id: "system", label: "System", icon: "layers" },
  { id: "params", label: "Params", icon: "sliders" },
  { id: "color", label: "Color", icon: "palette" },
  { id: "export", label: "Export", icon: "download" },
];

const Sheet = styled.section<{ $expanded: boolean }>`
  position: absolute; left: 0; right: 0; bottom: 0; z-index: ${tokens.z.sheet};
  height: ${p => (p.$expanded ? "68vh" : `${SHEET_PEEK_PX}px`)};
  padding-bottom: env(safe-area-inset-bottom);
  display: flex; flex-direction: column;
  background: ${p => p.theme.glass2};
  backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
  border-top: 1px solid ${p => p.theme.hairlineStrong};
  border-radius: 20px 20px 0 0;
  transition: height 0.28s cubic-bezier(0.16, 1, 0.3, 1);
`;
const Handle = styled.button`
  align-self: center; width: 64px; height: 24px; border: none; background: transparent; cursor: grab;
  touch-action: none;
  &::after { content: ""; display: block; margin: 0 auto; width: 40px; height: 4px; border-radius: 2px; background: ${p => p.theme.hairlineStrong}; }
`;
const ActionRow = styled.div`padding: 0 16px 8px;`;
const Tabs = styled.div`
  order: 3; display: grid; grid-template-columns: repeat(4, 1fr);
  border-top: 1px solid ${p => p.theme.hairline};
`;
const Tab = styled.button<{ $active: boolean }>`
  min-height: 52px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px;
  background: transparent; border: none; cursor: pointer;
  color: ${p => (p.$active ? p.theme.primary : p.theme.textMid)};
  font: 500 11px ${tokens.font.mono};
`;
const Panel = styled.div`order: 2; flex: 1; overflow-y: auto; padding: 8px 16px 16px; min-height: 0; overscroll-behavior: contain;`;

interface Props {
  state: SheetState;
  dispatch: React.Dispatch<SheetAction>;
  actionRow: React.ReactNode;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<Props> = ({ state, dispatch, actionRow, children }) => {
  const dragStartY = useRef<number | null>(null);

  const onPointerDown = (e: React.PointerEvent) => { dragStartY.current = e.clientY; };
  const onPointerUp = (e: React.PointerEvent) => {
    if (dragStartY.current === null) return;
    const dy = e.clientY - dragStartY.current;
    dragStartY.current = null;
    if (dy < -40) dispatch({ type: "expand" });
    else if (dy > 40) dispatch({ type: "collapse" });
  };

  return (
    <Sheet $expanded={state.expanded} aria-label="Controls">
      <Handle type="button" aria-label={state.expanded ? "Collapse panel" : "Expand panel"}
        aria-expanded={state.expanded}
        onClick={() => dispatch({ type: "toggle" })} onPointerDown={onPointerDown} onPointerUp={onPointerUp} />
      <ActionRow>{actionRow}</ActionRow>
      {state.expanded && <Panel role="tabpanel">{children}</Panel>}
      <Tabs role="tablist" aria-label="Control sections">
        {TABS.map(t => (
          <Tab key={t.id} type="button" role="tab" aria-selected={state.expanded && state.tab === t.id}
            $active={state.tab === t.id} onClick={() => dispatch({ type: "tapTab", tab: t.id })}>
            <Icon name={t.icon} size={20} />{t.label}
          </Tab>
        ))}
      </Tabs>
    </Sheet>
  );
};
```

Note: a swipe ends with a `click` as well; `onClick` toggles, so a swipe-up from peek would expand then toggle back. Guard it: in `onPointerUp`, if `Math.abs(dy) > 40`, set a ref `swiped.current = true`; in `onClick`, if `swiped.current` is true, reset it and return without toggling. Add that ref and logic.

- [ ] **Step 4: Replace `MobileShell.tsx`**

```tsx
import React, { useReducer } from "react";
import styled from "styled-components";
import { ShellProps } from "./types";
import { TopBar } from "./TopBar";
import { CanvasToolbar } from "./CanvasToolbar";
import { BottomSheet, SHEET_PEEK_PX } from "./BottomSheet";
import { SystemPanel, RenderPanel, ColorPanel, FxPanel, StatsReadout } from "../panels";
import { IconButton } from "../ui/IconButton";
import { Icon } from "../ui/Icon";
import { sheetReducer, initialSheet } from "../../lib/sheetState";
import { tokens } from "../../theme/tokens";

const Page = styled.div`
  position: fixed; inset: 0; overflow: hidden;
  background: ${p => p.theme.canvasBg}; color: ${p => p.theme.textHigh}; font-family: ${tokens.font.ui};
`;
const Stage = styled.div`position: absolute; top: 0; left: 0; right: 0; bottom: ${SHEET_PEEK_PX}px; display: flex;`;
const Overlay = styled.div`position: absolute; top: 0; left: 0; right: 0; z-index: ${tokens.z.toolbar}; pointer-events: none; & > * { pointer-events: auto; }`;
const StatsChip = styled.div`
  margin: 8px auto 0; width: fit-content; padding: 6px 12px; border-radius: ${tokens.radius.full};
  background: ${p => p.theme.glass1}; border: 1px solid ${p => p.theme.hairline};
`;
const Section = styled.div`margin-bottom: 20px;`;
const Title = styled.h2`margin: 0 0 12px; font: 600 18px ${tokens.font.ui}; color: ${p => p.theme.textHigh};`;
const ExportButton = styled(IconButton)`width: 100%; height: 48px;`;

export const MobileShell: React.FC<ShellProps> = (p) => {
  const [sheet, dispatch] = useReducer(sheetReducer, initialSheet);
  const { canvas, ...rest } = p;

  return (
    <Page>
      <Stage onPointerDown={() => sheet.expanded && dispatch({ type: "collapse" })}>{canvas}</Stage>
      <Overlay>
        <TopBar compact systemLabel={p.systemLabel} onOpenExport={p.onOpenExport}
          onSystemClick={() => dispatch({ type: "tapTab", tab: "system" })} />
        <StatsChip>
          <StatsReadout compact statsRef={p.statsRef} running={p.iterating} rendering={p.rendering}
            isFractal={p.isFractalType} maxIter={p.maxIter} />
        </StatsChip>
      </Overlay>
      <BottomSheet state={sheet} dispatch={dispatch} actionRow={<CanvasToolbar {...rest} variant="mobile" />}>
        {sheet.tab === "system" && (
          <SystemPanel value={p.attractorType} onChange={p.onAttractorTypeChange}
            onPicked={() => dispatch({ type: "tapTab", tab: "params" })} />
        )}
        {sheet.tab === "params" && (<><Title>{p.systemLabel}</Title>{p.controls}</>)}
        {sheet.tab === "color" && (
          <>
            <Section><ColorPanel paletteData={p.paletteData} bgColor={p.bgColor} onBgModeChange={p.onBgModeChange} onOpenPalette={p.onOpenPalette} /></Section>
            <Section><FxPanel fx={p.fx} onChange={p.onFxChange} /></Section>
          </>
        )}
        {sheet.tab === "export" && (
          <>
            <Section><RenderPanel canvasSize={p.canvasSize} onCanvasSizeChange={p.onCanvasSizeChange}
              oversampling={p.oversampling} onOversamplingChange={p.onOversamplingChange} /></Section>
            <ExportButton label="Export image" variant="primary" onClick={p.onOpenExport}>
              <Icon name="download" size={18} /> Export image
            </ExportButton>
          </>
        )}
      </BottomSheet>
    </Page>
  );
};
```

Note on `onPicked` for System: `tapTab` with a different tab while expanded switches to Params and stays open — the user sees the new system's parameters immediately.

- [ ] **Step 5: Run all tests + type-check** — `CI=true npm test -- --watchAll=false && npx tsc --noEmit -p .` → PASS.

- [ ] **Step 6: Manual check (mobile)** — `npm start`; Chrome DevTools device toolbar, iPhone 12/13 (390×844):
  - No horizontal scroll; canvas visible above the sheet; stats chip under the top overlay.
  - Hunt / Run / Fit reachable in the peek row; tabs expand the sheet; tapping canvas collapses it.
  - System tab → pick Julia → sheet switches to Params for Julia.
  - Long system names ellipsize in the pill (try "Symmetric Quilt" / the longest label).
  Stop the server.

- [ ] **Step 7: Commit**

```bash
git add src/components/shell src/__tests__/BottomSheet.test.tsx
git commit -m "feat(ui): mobile shell with bottom sheet and thumb-reach actions"
```

---

### Task 10: Canvas touch gestures (pinch, pan, fractal drag)

**Files:**
- Create: `src/hooks/useCanvasGestures.ts`
- Modify: `src/hooks/useFractalZoom.ts` (handler signatures only), `src/components/CanvasArea.tsx`, `src/view/pages/Home.tsx`, `src/hooks/index.ts`
- Test: `src/__tests__/useCanvasGestures.test.tsx`

**Interfaces:**
- Consumes: `distance`, `midpoint`, `pinchZoom`, `Pt` (Task 2).
- Produces (useFractalZoom — replaces `handleMouseDown/handleMouseMove/handleMouseUp`):
  - `beginDrag(pt: DragPoint): void`, `moveDrag(pt: DragPoint): void`, `endDrag(): void`. `pt` is in canvas pixels (already divided by display zoom). `isDragging`, `dragStart`, `dragEnd`, `clearDrag`, `calculateNewParams`, `calculateNewLyapunovParams` unchanged.
- Produces: `useCanvasGestures(opts: { zoom: number; onZoomChange: (z: number) => void; scrollRef: React.RefObject<HTMLElement>; selectEnabled: boolean; toCanvasPoint: (clientX: number, clientY: number) => DragPoint | null; onSelectStart: (pt: DragPoint) => void; onSelectMove: (pt: DragPoint) => void; onSelectEnd: () => void; }): { onPointerDown, onPointerMove, onPointerUp, onPointerCancel }` (React pointer handlers for the container).
  - Behavior: 1 pointer + `selectEnabled` → selection. 1 touch pointer + `!selectEnabled` → pan (scrollBy negative delta). 1 mouse pointer + `!selectEnabled` → nothing (as today). 2 pointers → pinch zoom via `pinchZoom(startZoom, startDist, dist)` and pan by midpoint delta; starting a pinch cancels an in-progress selection via `onSelectEnd()` without zooming the fractal (Home must not apply the selection — see Step 5). A 3rd+ pointer is ignored. Lifting one finger of a pinch ends the pinch; the remaining finger does nothing until all pointers lift.
- `CanvasArea` new props replace `onMouseDown/onMouseMove/onMouseUp`: `onSelectStart(pt)`, `onSelectMove(pt)`, `onSelectEnd()`, `onSelectCancel()`, `onZoomChange(z)`.

- [ ] **Step 1: Write failing test** — the gesture state machine is exercised through the hook with synthetic pointer objects (jsdom's PointerEvent support is incomplete, so call the returned handlers directly):

```tsx
import { renderHook, act } from "@testing-library/react";
import { useCanvasGestures } from "../hooks/useCanvasGestures";

const ev = (pointerId: number, x: number, y: number, pointerType = "touch") =>
  ({ pointerId, clientX: x, clientY: y, pointerType, currentTarget: { setPointerCapture() {}, releasePointerCapture() {} }, preventDefault() {} }) as any;

function setup(selectEnabled: boolean) {
  const scrollBy = jest.fn();
  const opts = {
    zoom: 1,
    onZoomChange: jest.fn(),
    scrollRef: { current: { scrollBy } as any },
    selectEnabled,
    toCanvasPoint: (x: number, y: number) => ({ x, y }),
    onSelectStart: jest.fn(), onSelectMove: jest.fn(), onSelectEnd: jest.fn(),
  };
  const { result } = renderHook(() => useCanvasGestures(opts));
  return { h: () => result.current, opts, scrollBy };
}

describe("useCanvasGestures", () => {
  it("one pointer on a fractal drives selection", () => {
    const { h, opts } = setup(true);
    act(() => { h().onPointerDown(ev(1, 10, 10)); h().onPointerMove(ev(1, 50, 60)); h().onPointerUp(ev(1, 50, 60)); });
    expect(opts.onSelectStart).toHaveBeenCalledWith({ x: 10, y: 10 });
    expect(opts.onSelectMove).toHaveBeenCalledWith({ x: 50, y: 60 });
    expect(opts.onSelectEnd).toHaveBeenCalledTimes(1);
  });

  it("one touch on an attractor pans", () => {
    const { h, scrollBy } = setup(false);
    act(() => { h().onPointerDown(ev(1, 100, 100)); h().onPointerMove(ev(1, 80, 70)); });
    expect(scrollBy).toHaveBeenCalledWith(20, 30);
  });

  it("one mouse pointer on an attractor does nothing", () => {
    const { h, scrollBy, opts } = setup(false);
    act(() => { h().onPointerDown(ev(1, 100, 100, "mouse")); h().onPointerMove(ev(1, 80, 70, "mouse")); });
    expect(scrollBy).not.toHaveBeenCalled();
    expect(opts.onSelectStart).not.toHaveBeenCalled();
  });

  it("two pointers pinch-zoom and cancel a selection in progress", () => {
    const { h, opts } = setup(true);
    act(() => {
      h().onPointerDown(ev(1, 100, 100));
      h().onPointerDown(ev(2, 200, 100));       // dist 100
      h().onPointerMove(ev(2, 300, 100));       // dist 200
    });
    expect(opts.onSelectEnd).toHaveBeenCalled();
    expect(opts.onZoomChange).toHaveBeenLastCalledWith(2);
  });

  it("ignores a third pointer and stays finite when fingers coincide", () => {
    const { h, opts } = setup(false);
    act(() => {
      h().onPointerDown(ev(1, 100, 100));
      h().onPointerDown(ev(2, 100, 100));       // dist 0
      h().onPointerDown(ev(3, 300, 300));       // ignored
      h().onPointerMove(ev(2, 150, 100));
    });
    for (const [z] of opts.onZoomChange.mock.calls) {
      expect(Number.isFinite(z)).toBe(true);
      expect(z).toBeGreaterThanOrEqual(0.1);
      expect(z).toBeLessThanOrEqual(4);
    }
  });

  it("lifting one finger ends the pinch; the remaining finger does not pan", () => {
    const { h, scrollBy } = setup(false);
    act(() => {
      h().onPointerDown(ev(1, 100, 100));
      h().onPointerDown(ev(2, 200, 100));
      h().onPointerUp(ev(2, 200, 100));
      h().onPointerMove(ev(1, 50, 50));
    });
    expect(scrollBy).not.toHaveBeenCalledWith(50, 50);
  });
});
```

- [ ] **Step 2: Run to verify fails** — `CI=true npm test -- --watchAll=false useCanvasGestures` → FAIL.

- [ ] **Step 3: Implement `src/hooks/useCanvasGestures.ts`**

```ts
import React, { useCallback, useRef } from "react";
import { distance, midpoint, pinchZoom, Pt } from "../lib/gestureMath";
import { DragPoint } from "./useFractalZoom";

interface Options {
  zoom: number;
  onZoomChange: (z: number) => void;
  scrollRef: React.RefObject<HTMLElement>;
  selectEnabled: boolean;
  toCanvasPoint: (clientX: number, clientY: number) => DragPoint | null;
  onSelectStart: (pt: DragPoint) => void;
  onSelectMove: (pt: DragPoint) => void;
  onSelectEnd: () => void;
}

type Mode = "idle" | "select" | "pan" | "pinch" | "done";

export function useCanvasGestures(o: Options) {
  const pointers = useRef(new Map<number, Pt>());
  const mode = useRef<Mode>("idle");
  const pinch = useRef<{ startDist: number; startZoom: number; lastMid: Pt } | null>(null);
  const opts = useRef(o);
  opts.current = o;

  const pts = () => Array.from(pointers.current.values());

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const { selectEnabled, toCanvasPoint, onSelectStart, onSelectEnd, zoom } = opts.current;
    if (pointers.current.size >= 2) return; // ignore 3rd+ finger
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    try { (e.currentTarget as any).setPointerCapture?.(e.pointerId); } catch {}

    if (pointers.current.size === 2) {
      if (mode.current === "select") onSelectEnd();
      const [a, b] = pts();
      pinch.current = { startDist: distance(a, b), startZoom: zoom, lastMid: midpoint(a, b) };
      mode.current = "pinch";
      return;
    }
    if (selectEnabled) {
      const pt = toCanvasPoint(e.clientX, e.clientY);
      if (pt) { mode.current = "select"; onSelectStart(pt); }
    } else if (e.pointerType !== "mouse") {
      mode.current = "pan";
    }
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    const prev = pointers.current.get(e.pointerId)!;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const { toCanvasPoint, onSelectMove, onZoomChange, scrollRef } = opts.current;

    if (mode.current === "select") {
      const pt = toCanvasPoint(e.clientX, e.clientY);
      if (pt) onSelectMove(pt);
    } else if (mode.current === "pan") {
      scrollRef.current?.scrollBy(prev.x - e.clientX, prev.y - e.clientY);
    } else if (mode.current === "pinch" && pinch.current && pointers.current.size === 2) {
      const [a, b] = pts();
      onZoomChange(pinchZoom(pinch.current.startZoom, pinch.current.startDist, distance(a, b)));
      const mid = midpoint(a, b);
      scrollRef.current?.scrollBy(pinch.current.lastMid.x - mid.x, pinch.current.lastMid.y - mid.y);
      pinch.current.lastMid = mid;
    }
  }, []);

  const release = useCallback((e: React.PointerEvent) => {
    if (!pointers.current.delete(e.pointerId)) return;
    if (mode.current === "select") opts.current.onSelectEnd();
    if (mode.current === "pinch") { pinch.current = null; mode.current = "done"; }
    if (pointers.current.size === 0) mode.current = "idle";
    else if (mode.current !== "done") mode.current = "done";
  }, []);

  return { onPointerDown, onPointerMove, onPointerUp: release, onPointerCancel: release };
}
```

Append to `src/hooks/index.ts`: `export * from "./useCanvasGestures";`

- [ ] **Step 4: Change `useFractalZoom` handlers** — in `src/hooks/useFractalZoom.ts`, replace the three handler definitions and the interface lines 19–21:

```ts
  beginDrag: (pt: DragPoint) => void;
  moveDrag: (pt: DragPoint) => void;
  endDrag: () => void;
```

```ts
  const beginDrag = useCallback((pt: DragPoint) => {
    setDragStart(pt);
    setDragEnd(pt);
    setIsDragging(true);
  }, []);

  const moveDrag = useCallback((pt: DragPoint) => {
    if (!isDragging || !dragStart) return;
    setDragEnd(pt);
  }, [isDragging, dragStart]);

  const endDrag = useCallback(() => {
    setIsDragging(false);
  }, []);
```

Return `beginDrag, moveDrag, endDrag` instead of the `handleMouse*` names. Do not touch `calculateNewFractalParams`, `calculateNewLyapunovZoomParams`, `clearDrag`, `calculateNewParams`, `calculateNewLyapunovParams`.

- [ ] **Step 5: Wire `CanvasArea`**

Props: remove `onMouseDown/onMouseMove/onMouseUp`; add:

```ts
  onSelectStart: (pt: DragPoint) => void;
  onSelectMove: (pt: DragPoint) => void;
  onSelectEnd: () => void;
  onSelectCancel: () => void;
  onZoomChange: (z: number) => void;
```

Inside the component:

```tsx
const wrapperRef = React.useRef<HTMLDivElement>(null);
const cancelledRef = React.useRef(false);

const toCanvasPoint = React.useCallback((clientX: number, clientY: number) => {
  const el = wrapperRef.current;
  if (!el) return null;
  const r = el.getBoundingClientRect();
  const x = (clientX - r.left) / zoom;
  const y = (clientY - r.top) / zoom;
  if (x < 0 || y < 0 || x > canvasSize || y > canvasSize) return null;
  return { x, y };
}, [zoom, canvasSize]);

const gestures = useCanvasGestures({
  zoom,
  onZoomChange,
  scrollRef: containerRef,
  selectEnabled: isFractalType,
  toCanvasPoint,
  onSelectStart: (pt) => { cancelledRef.current = false; onSelectStart(pt); },
  onSelectMove,
  onSelectEnd: () => { (cancelledRef.current ? onSelectCancel : onSelectEnd)(); },
});
```

To distinguish "pinch started during a selection" from a normal release, set `cancelledRef.current = true` when a second pointer arrives: wrap `gestures.onPointerDown` as `(e) => { if (activePointers.current.size === 1) cancelledRef.current = true; activePointers.current.add(e.pointerId); gestures.onPointerDown(e); }`, and delete from `activePointers` in the up/cancel wrappers. (`activePointers = useRef(new Set<number>())`.)

Attach to `CanvasContainer`: `{...wrappedHandlers}` and add CSS `touch-action: none;` to `CanvasContainer`. Attach `ref={wrapperRef}` to `CanvasWrapper` and remove its `onMouse*` props. Import `useCanvasGestures` from `../hooks/useCanvasGestures` and `DragPoint` from `../hooks/useFractalZoom`.

`containerRef`'s type: if it is `RefObject<HTMLDivElement>` the hook accepts it (`HTMLDivElement` extends `HTMLElement`).

- [ ] **Step 6: Update `Home.tsx`**

Replace `handleFractalMouseDown` / `handleFractalMouseMove` with:

```ts
const handleSelectStart = useCallback((pt: DragPoint) => fractalZoom.beginDrag(pt), [fractalZoom]);
const handleSelectMove = useCallback((pt: DragPoint) => fractalZoom.moveDrag(pt), [fractalZoom]);
const handleSelectCancel = useCallback(() => fractalZoom.clearDrag(), [fractalZoom]);
```

Rename `handleFractalMouseUp` → `handleSelectEnd`; inside it replace `fractalZoom.handleMouseUp()` with `fractalZoom.endDrag()`. Import `DragPoint` from `../../hooks/useFractalZoom`. Update the `<CanvasArea>` props:

```tsx
onSelectStart={handleSelectStart}
onSelectMove={handleSelectMove}
onSelectEnd={handleSelectEnd}
onSelectCancel={handleSelectCancel}
onZoomChange={worker.setZoom}
```

- [ ] **Step 7: Run all tests + type-check** — `CI=true npm test -- --watchAll=false && npx tsc --noEmit -p .` → PASS (including the untouched `fractalZoom.test.ts`).

- [ ] **Step 8: Manual check** — `npm start`:
  - Desktop mouse: Mandelbrot drag-to-zoom still zooms; attractors unaffected by mouse drag.
  - DevTools iPhone emulation (enable touch): one-finger drag on Mandelbrot draws selection and zooms; on Clifford at zoom > 1 one-finger drag pans. Pinch: Chrome DevTools supports shift+drag to emulate pinch — zoom % in the desktop toolbar (or visibly on mobile) changes and stays within 10%–400%.
  Stop the server.

- [ ] **Step 9: Commit**

```bash
git add src/hooks src/components/CanvasArea.tsx src/view/pages/Home.tsx src/__tests__/useCanvasGestures.test.tsx
git commit -m "feat: pointer-based canvas gestures (pinch, pan, touch fractal zoom)"
```

---

### Task 11: Modals — glass dialog / mobile sheet, Export layout, touch palette editor

**Files:**
- Modify: `src/components/ModalStyles.ts`, `src/components/ExportModal.tsx`, `src/components/PaletteModal.tsx`, `src/view/components/colorbar.tsx`
- Test: `src/__tests__/ExportModal.test.tsx`

**Interfaces:**
- `ExportModal` props unchanged: `{ isOpen, onClose, onExportCurrent, onExportSize(size: number), exporting }`. No live preview thumbnail (it would need a new render path; out of scope). Single-column layout on both desktop and mobile.
- Option labels (plain): "Current view", "1080 px", "1440 px", "2160 px (4K)", "4320 px (8K)".

- [ ] **Step 1: Write failing test** — `src/__tests__/ExportModal.test.tsx`:

```tsx
import { screen, fireEvent } from "@testing-library/react";
import { renderWithTheme } from "./renderWithTheme";
import { ExportModal } from "../components/ExportModal";

const props = () => ({ isOpen: true, onClose: jest.fn(), onExportCurrent: jest.fn(), onExportSize: jest.fn(), exporting: false });

describe("ExportModal", () => {
  it("is a labelled dialog", () => {
    renderWithTheme(<ExportModal {...props()} />);
    expect(screen.getByRole("dialog", { name: "Export image" })).toBeInTheDocument();
  });

  it("exports the selected size", () => {
    const p = props();
    renderWithTheme(<ExportModal {...p} />);
    fireEvent.click(screen.getByRole("radio", { name: "2160 px (4K)" }));
    fireEvent.click(screen.getByRole("button", { name: "Export PNG" }));
    expect(p.onExportSize).toHaveBeenCalledWith(2160);
  });

  it("current view exports immediately and closes", () => {
    const p = props();
    renderWithTheme(<ExportModal {...p} />);
    fireEvent.click(screen.getByRole("radio", { name: "Current view" }));
    fireEvent.click(screen.getByRole("button", { name: "Export PNG" }));
    expect(p.onExportCurrent).toHaveBeenCalled();
    expect(p.onClose).toHaveBeenCalled();
  });

  it("cannot be closed while exporting (backdrop, X, Escape)", () => {
    const p = { ...props(), exporting: true };
    renderWithTheme(<ExportModal {...p} />);
    fireEvent.click(screen.getByTestId("modal-backdrop"));
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(p.onClose).not.toHaveBeenCalled();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("Escape closes when idle", () => {
    const p = props();
    renderWithTheme(<ExportModal {...p} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(p.onClose).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run to verify fails** — `CI=true npm test -- --watchAll=false ExportModal` → FAIL.

- [ ] **Step 3: Rewrite `ModalStyles.ts`** (keep export names `ModalOverlay`, `ModalContent`, `ModalHeader`, `ModalTitle`, `CloseButton`):

```ts
import styled from "styled-components";
import { tokens } from "../theme/tokens";

const mobile = `@media (max-width: ${tokens.breakpoint.mobileMax}px)`;

export const ModalOverlay = styled.div`
  position: fixed; inset: 0; z-index: ${tokens.z.modal};
  display: flex; align-items: center; justify-content: center; padding: 24px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
  animation: fadeIn 0.18s ease-out;
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  ${mobile} { align-items: flex-end; padding: 0; }
`;

export const ModalContent = styled.div`
  width: 100%; max-width: 560px; max-height: 85vh; overflow-y: auto;
  padding: 20px 24px 24px;
  background: ${p => p.theme.glass2};
  backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
  border: 1px solid ${p => p.theme.hairlineStrong};
  border-radius: ${tokens.radius.lg};
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.6);
  color: ${p => p.theme.textHigh};
  font-family: ${tokens.font.ui};
  animation: rise 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  @keyframes rise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
  ${mobile} {
    max-width: none; max-height: 92vh; border-radius: 20px 20px 0 0;
    padding-bottom: calc(24px + env(safe-area-inset-bottom));
  }
`;

export const ModalHeader = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid ${p => p.theme.hairline};
`;

export const ModalTitle = styled.h2`
  margin: 0; font: 600 16px ${tokens.font.ui}; color: ${p => p.theme.textHigh};
`;

export const CloseButton = styled.button`
  width: 36px; height: 36px; border-radius: 10px; display: grid; place-items: center; cursor: pointer;
  background: transparent; border: 1px solid transparent; color: ${p => p.theme.textMid}; font-size: 20px;
  &:hover { background: rgba(255, 255, 255, 0.06); color: ${p => p.theme.textHigh}; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
  ${mobile} { width: 44px; height: 44px; }
`;
```

Check `PaletteModal.tsx` and `ExportModal.tsx` for `styled(GlassPanel)`-based content; switch them to `ModalContent` (or `styled(ModalContent)` with a width override).

- [ ] **Step 4: Rewrite `ExportModal.tsx`**

```tsx
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import { ModalOverlay, ModalContent, ModalHeader, ModalTitle, CloseButton } from "./ModalStyles";
import { Segmented } from "./ui/Segmented";
import { IconButton } from "./ui/IconButton";
import { Icon } from "./ui/Icon";
import { SectionLabel } from "../attractors/shared/styles";
import { tokens } from "../theme/tokens";

type Choice = "current" | 1080 | 1440 | 2160 | 4320;
const CHOICES: { value: Choice; label: string }[] = [
  { value: "current", label: "Current view" },
  { value: 1080, label: "1080 px" },
  { value: 1440, label: "1440 px" },
  { value: 2160, label: "2160 px (4K)" },
  { value: 4320, label: "4320 px (8K)" },
];

const Grid = styled.div`
  display: grid; gap: 16px;
  [role="radiogroup"] { grid-auto-flow: row; }
`;
const Hint = styled.p`margin: 0; font: 400 12px/1.5 ${tokens.font.ui}; color: ${p => p.theme.textMid};`;
const Footer = styled.div`
  display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px; padding-top: 16px;
  border-top: 1px solid ${p => p.theme.hairline};
`;
const Progress = styled.div`
  height: 4px; border-radius: 2px; overflow: hidden; background: ${p => p.theme.surfaceHigh};
  &::after {
    content: ""; display: block; height: 100%; width: 40%; background: ${p => p.theme.primary};
    animation: slide 1.2s ease-in-out infinite;
  }
  @keyframes slide { from { transform: translateX(-100%); } to { transform: translateX(250%); } }
`;

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportCurrent: () => void;
  onExportSize: (size: number) => void;
  exporting: boolean;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, onExportCurrent, onExportSize, exporting }) => {
  const [choice, setChoice] = useState<Choice>(2160);
  const wasExporting = useRef(false);

  useEffect(() => {
    if (exporting) wasExporting.current = true;
    else if (wasExporting.current) { wasExporting.current = false; onClose(); }
  }, [exporting, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && !exporting) onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, exporting, onClose]);

  if (!isOpen) return null;

  const tryClose = () => { if (!exporting) onClose(); };
  const doExport = () => {
    if (exporting) return;
    if (choice === "current") { onExportCurrent(); onClose(); }
    else onExportSize(choice);
  };

  return createPortal(
    <ModalOverlay data-testid="modal-backdrop" onClick={tryClose}>
      <ModalContent role="dialog" aria-modal="true" aria-labelledby="export-title" onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle id="export-title">Export image</ModalTitle>
          <CloseButton aria-label="Close" onClick={tryClose} disabled={exporting}>×</CloseButton>
        </ModalHeader>
        <Grid>
          <div>
            <SectionLabel as="div">Resolution</SectionLabel>
            <Segmented<Choice> ariaLabel="Resolution" value={choice} onChange={setChoice} options={CHOICES} />
          </div>
          <Hint>
            {choice === "current"
              ? "Saves the canvas exactly as it is now."
              : `Re-renders a ${choice} × ${choice} PNG with the current parameters and palette.`}
          </Hint>
          {exporting && <div role="progressbar" aria-label="Exporting" aria-busy="true"><Progress /></div>}
        </Grid>
        <Footer>
          <IconButton label="Cancel" variant="soft" onClick={tryClose} disabled={exporting}>Cancel</IconButton>
          <IconButton label="Export PNG" variant="primary" onClick={doExport} disabled={exporting}>
            <Icon name="download" size={16} /> Export PNG
          </IconButton>
        </Footer>
      </ModalContent>
    </ModalOverlay>,
    document.body
  );
};

export default ExportModal;
```

Note: in the "cannot be closed while exporting" test, the Close button is `disabled`; `fireEvent.click` on a disabled button does not fire `onClick` — expected.

- [ ] **Step 5: Restyle `PaletteModal.tsx`**

- Wrap content in `ModalContent` with `role="dialog" aria-modal="true" aria-labelledby="palette-title"`; title "Palette" with `id="palette-title"`; close button `aria-label="Close"`; add the same Escape-to-close effect as ExportModal (no exporting guard).
- Replace legacy color references inside its styled components: `colors.darkerBg` → `p.theme.surface`, `colors.accentBorder`/`accentMuted` → `p.theme.hairline`, `colors.accent` → `p.theme.primary`, `colors.accentLight` → `p.theme.textMid`, `'JetBrains Mono'` font → `${tokens.font.mono}`; radii 4px → 10px.
- Replace any "System."-style uppercase labels with plain labels: "Gamma", "Scale", "Max", "Background".

- [ ] **Step 6: Touch-enable `colorbar.tsx`** (palette editor is used inside PaletteModal; mouse-only today):

| line (approx) | change |
|---|---|
| 171, 184 | `React.MouseEvent<HTMLCanvasElement>` → `React.PointerEvent<HTMLCanvasElement>` |
| 219 | `onMouseDown` → `onPointerDown` |
| 299–302 | `onMouseDown/onMouseMove/onMouseUp/onMouseLeave` → `onPointerDown/onPointerMove/onPointerUp/onPointerLeave`; in `onPointerDown` add `e.currentTarget.setPointerCapture(e.pointerId);` |
| 332–335 | same as 299–302 |
| 523–536, 164–173 in CustomDropdown | `"mousedown"` → `"pointerdown"`; handler param type `MouseEvent` → `PointerEvent` |
| 555–589 | `handleMouseMove(e: MouseEvent)` → `(e: PointerEvent)`, `handleMouseUp` likewise; `"mousemove"` → `"pointermove"`, `"mouseup"` → `"pointerup"` |
| 597, 603, 643, 674 | `React.MouseEvent` → `React.PointerEvent` only where bound to pointer props; keep `onClick`/`onDoubleClick` handlers typed `React.MouseEvent` |
| 770 | `onMouseDown={(e) => handleHandleMouseDown(index, e)}` → `onPointerDown={...}` |

Add `touch-action: none;` to the styled components for the saturation square, hue strip, and gradient bar (the elements that receive those pointer handlers). Leave `onMouseEnter/onMouseLeave` hover effects as they are.

Run `npx tsc --noEmit -p .` after the edit and fix any handler type mismatch by widening to `React.PointerEvent`.

- [ ] **Step 7: Run all tests + type-check** — `CI=true npm test -- --watchAll=false && npx tsc --noEmit -p .` → PASS.

- [ ] **Step 8: Manual check** — desktop: Export modal centered, sizes export a PNG, X/backdrop/Escape blocked during export. Mobile emulation: Export and Palette open as bottom sheets; dragging palette stops and the hue/saturation pickers works with touch.

- [ ] **Step 9: Commit**

```bash
git add src/components/ModalStyles.ts src/components/ExportModal.tsx src/components/PaletteModal.tsx src/view/components/colorbar.tsx src/components/CustomDropdown.tsx src/__tests__/ExportModal.test.tsx
git commit -m "feat(ui): restyled export/palette modals, mobile sheets, touch palette editor"
```

---

### Task 12: Info page tokens + final verification

**Files:**
- Modify: `src/view/pages/Info.tsx`, `src/view/pages/NoPage.tsx`

- [ ] **Step 1: Info page tokens** — in `src/view/pages/Info.tsx`:
  - Replace `'JetBrains Mono', monospace` font declarations with `${tokens.font.mono}` and `'Inter', -apple-system, BlinkMacSystemFont, sans-serif` with `${tokens.font.ui}` (import `tokens` from `../../theme/tokens`).
  - The page root container background → `${p => p.theme.canvasBg}`; body text color → `p.theme.textHigh`; secondary text → `p.theme.textMid`; borders using `accentBorder`/`accentMuted` → `p.theme.hairline`.
  - Do not change layout, content, or KaTeX usage.
  - Same font/background swap in `NoPage.tsx`.

- [ ] **Step 2: Full test suite + type-check + build**

Run: `CI=true npm test -- --watchAll=false && npx tsc --noEmit -p . && npm run build`
Expected: all tests PASS; no type errors; build succeeds (warnings about unused vars must be fixed — CRA treats warnings as errors when `CI=true`; run `CI=true npm run build` to confirm).

- [ ] **Step 3: Manual verification matrix** — `npm start`, check each item at 1440×900 and at 390×844 (DevTools, touch emulation) for Clifford, Symmetric Icon, Mandelbrot, Julia:

| Check | Desktop | Mobile |
|---|---|---|
| Switch system | System tab / pill | pill or System tab → lands on Params |
| Apply preset | preset cards | preset cards |
| Edit parameter (slider + typed value) | ✓ | ✓ (numeric keyboard) |
| Run / Pause | toolbar | thumb row |
| Hunt / Cancel (attractors) | ✓ | ✓ |
| Zoom | buttons | pinch; Fit button |
| Fractal zoom | mouse drag | one-finger drag |
| Palette edit | modal | sheet, touch drag |
| Background Void/Ink/Paper | Color tab | Color tab |
| Theme switch (all 5) + Ink stays selected | top bar | (desktop only control) |
| Export 1080 + Current view | modal | sheet |
| Share → "Copied" | ✓ | ✓ |
| No horizontal scroll | — | ✓ |
| Resize across 1024px while running keeps state | ✓ | ✓ |
| `prefers-reduced-motion` (DevTools Rendering tab) disables sheet/inspector animation | ✓ | ✓ |

Fix anything that fails before committing.

- [ ] **Step 4: Commit**

```bash
git add src/view/pages
git commit -m "feat(ui): apply design tokens to info and 404 pages"
```
