# UI Redesign — Canvas-First Layout + Mobile Support

**Date:** 2026-10-09
**Status:** Approved design, pending implementation plan
**Visual reference:** Google Stitch project "Chaos Iterator Redesign" (`projects/13329545837469135411`)

| Screen | Stitch screen id |
|---|---|
| Desktop main (locked layout) | `f301eeef5a254938af876ae20f3b4e95` |
| Mobile main, sheet collapsed | `1e9078957b7d4cf2a1569b4306cc64f6` |
| Mobile, Params sheet expanded | `4ab03adee83b482d949eb2111465da2a` |
| Desktop Export modal | `887827611c674b59a3d689909f12ec04` |
| Design system "Chaos Iterator" | `assets/6291277df1074db891e729417888757a` |

Rejected desktop variants (kept in the Stitch project for reference): Left Rail & Floating Inspector, Bottom Dock & Slide Tray, Ultra-Minimal HUD.

## Goals

1. **New layout & workflow:** canvas-first, minimal chrome. The render is the hero; controls live in one predictable place.
2. **Mobile support:** the app is usable on a phone (390px wide) with touch gestures, not just viewable.

Success = on desktop and on a 390px phone, a user can pick a system, apply a preset, tweak parameters, run/stop, hunt, zoom, change palette, and export/share, without horizontal scrolling or mouse-only interactions.

## Decisions (from brainstorming)

- Desktop layout: **right inspector** (top bar + right inspector + floating bottom toolbar).
- Themes: **keep all 5**, re-derived onto the Stitch design-system structure; theme switcher stays.
- Stitch extras: **plain labels, no fake data.** No equation overlay (modules carry no formula data), no Lyapunov/FPS readouts. Stats show only what the app computes today (iterations, points/sec, elapsed time).
- Implementation approach: **rebuild the UI shell within the existing styled-components setup.** Stitch HTML (Tailwind) is a visual reference only; not imported. No component-library migration.

## Constraints

- Hooks and state stay as-is: `useAttractorState`, `usePalette`, `useCanvasWorker`, `useFractalZoom`, `useUrlSync`, `useExportWorker`. Rendering workers, iterators and math are untouched.
- The 27 per-system `Controls.tsx` files keep their structure; they inherit the new look through the shared primitives in `src/attractors/shared/` (`ParameterInputCompact`, `ParameterGrid`, `PresetSelector`, `Card`, `styles.ts`). The 3 system folders that don't fit this pattern get a quick check.
- Stack stays CRA + React 18 + styled-components 6 + react-router 6.

## Design

### 1. Theme tokens (`src/theme/themes.ts`, `ThemeContext.tsx`)

Extend `ThemeColors` (keep existing keys during migration so untouched components still render) with design-system tokens:

- Surfaces: `canvasBg` (#0A0B10 family), `surface`, `surfaceLow`, `surfaceHigh`
- Glass: `glass1` (rgba(14,17,26,0.75) + blur 16px, toolbars/panels), `glass2` (rgba(22,27,40,0.88) + blur 24px, popovers/modals)
- Borders: `hairline` (rgba(255,255,255,0.08)), `hairlineStrong` (0.12), `focusBorder` (accent at ~0.35)
- Accents: `primary`, `primaryContainer`, `onPrimary`, `secondary` (violet family), glow shadows `glowPrimary`, `glowSecondary`
- Text tiers: `textHigh` (#F1F5F9), `textMid` (#94A3B8), `textLow` (#475569)
- Non-color tokens (shared across themes): radii (sm 4, md 10–12, lg 16, full), font families (`Inter` UI, `JetBrains Mono` numbers), spacing scale (4/8/12/16/24)

Cyber Cyan maps exactly to the Stitch palette (primary #06B6D4/#22D3EE, secondary #8B5CF6). The other 4 themes keep their own accent hue and re-derive primary/secondary/glow from it; surfaces and text tiers are shared. Fonts are loaded via Google Fonts in `public/index.html`.

### 2. Desktop layout (viewport ≥ 1024px)

```
┌───────────────────────── TopBar (48px, glass1) ─────────────────────────┐
│ logo │      [● Clifford Attractor ▾]      │ theme · docs · share · Export │
├─────────────────────────────────────────────────────────┬───────────────┤
│                                                         │  Inspector    │
│                    Canvas (full bleed)                  │  (~320px,     │
│                                                         │   collapsible)│
│          ┌──── CanvasToolbar (floating, glass1) ────┐   │  tabs + stats │
│          │ ▶/❚❚  ✦Hunt │ Fit − 100% + 1:1 ↺        │   │               │
└──────────┴──────────────────────────────────────────┴───┴───────────────┘
```

- **`TopBar`** (new): logo/name, system picker pill (opens the System tab of the inspector, or a popover list), theme switcher, Docs (→ `/info`), Share (copies URL, shows "Copied"), Export (primary button → Export modal).
- **`Inspector`** (replaces `Sidebar`): right side, collapsible to an icon strip. Icon tabs:
  - **System:** category chips from `registry` categories (Attractors / Fractals / IFS), searchable list of modules.
  - **Params:** the active module's `Controls` (presets + parameters), unchanged API.
  - **Render:** canvas size and sampling/oversampling (today's Sidebar "Dimensions" / "Sampling").
  - **Color:** current palette gradient strip, "Edit palette" (→ Palette modal), background Void/Ink/Paper segmented control (replaces BKG cycle button).
  - **FX:** `FXControls` (vignette, grain).
  - Footer: `LiveStats` (iterations, points/sec, elapsed).
- **`CanvasToolbar`** (replaces `SystemCommandBar`): floating, bottom-center. Run/Pause (primary), Hunt (toggles to Cancel while hunting), divider, Fit, −, zoom %, +, 1:1, Recenter (fractal types only).

### 3. Mobile layout (viewport < 1024px)

- Full-screen canvas. Slim top overlay: logo mark, system pill, Share. Small stats chip below it.
- **`BottomSheet`** with two states, **peek** (~140px: action row + tab bar) and **expanded** (~65% height). Drag handle toggles/drag-resizes; tapping a tab while peeking expands to that tab; tapping the canvas while expanded collapses to peek.
  - Tabs: **System**, **Params**, **Color** (palette + background + FX), **Export** (size/sampling + export + share).
  - Action row in thumb reach: Hunt, Run/Pause (large, primary), Fit.
- **Touch gestures** on the canvas:
  - Pinch → zoom (same zoom state as desktop buttons), two-finger drag → pan.
  - Fractal types: one-finger drag draws the selection rectangle and zooms on release, mirroring mouse drag-to-zoom. Implemented with Pointer Events so mouse and touch share one code path in `useFractalZoom`'s handlers.
- All touch targets ≥ 44px. No horizontal page scroll at 390px.

A single `useIsMobile()` hook (matchMedia `(max-width: 1023px)`) chooses `DesktopShell` vs `MobileShell`. Both are fed by the same hook state and handlers in `Home.tsx`, so behaviour cannot drift between layouts.

### 4. Shared control restyle (`src/attractors/shared/`, `src/components/CustomDropdown.tsx`)

- **Slider + value:** slim 4px track, filled portion in primary, 12px glowing circular thumb (larger hit area on touch), value in JetBrains Mono, still click-to-edit.
- **Presets:** horizontal scroll of cards (name + accent swatch). Same `PresetSelector` props.
- **Chips / segmented controls** replace plain selects where the option set is small (categories, size, sampling, background, export resolution/format).
- **Card / section headers:** small uppercase label, hairline separators, no heavy boxes.
- Labels use plain wording: "Parameters", "Presets", "Size", "Quality", "Background", "Effects".

### 5. Modals (`PaletteModal`, `ExportModal`, `ModalStyles`)

- Desktop: centered `glass2` dialog over a dimmed, blurred backdrop.
- Mobile: full-height sheet sliding up from the bottom.
- Export follows the Stitch layout trimmed to supported options: preview thumbnail, resolution presets (from today's `onExportSize` sizes), "Export current", copy share link, primary Export button, progress while `exporting`. Formats/toggles the app doesn't support (JPG/WebP, transparent background) are not added.

### 6. Out of scope

- `Info.tsx` docs page: adopts new tokens and fonts only, no relayout.
- Rendering, workers, iterators, math, URL sync format, i18n setup.
- New metrics (FPS, Lyapunov), equation overlay.
- Delete dead code: `FloatingPanels.tsx` (exported, never used) and its export in `components/index.ts`.

## Component map

| New / changed | Replaces | Notes |
|---|---|---|
| `components/shell/DesktopShell.tsx` | layout in `Home.tsx` | TopBar + Canvas + Inspector + CanvasToolbar |
| `components/shell/MobileShell.tsx` | — | Canvas + top overlay + BottomSheet |
| `components/TopBar.tsx` | parts of `Sidebar` header | |
| `components/Inspector.tsx` | `Sidebar.tsx` | tabbed |
| `components/CanvasToolbar.tsx` | `SystemCommandBar.tsx` | |
| `components/BottomSheet.tsx` | — | peek/expanded state |
| `components/SystemPicker.tsx` | system `CustomDropdown` usage | chips + searchable list, used in both shells |
| `hooks/useIsMobile.ts` | — | |
| `hooks/useCanvasGestures.ts` | — | pinch/pan via Pointer Events |
| `theme/themes.ts` | — | extended tokens, 5 themes |

`Home.tsx` keeps all hooks/handlers and passes a single props bag to whichever shell is active.

## Error handling & edge cases

- Clipboard write failure on Share: show a "Couldn't copy" state instead of "Copied".
- Sheet/inspector open while a modal opens: modal sits above (z-index scale defined in tokens).
- Rotating phone / resizing across the 1024px breakpoint: shell swaps without losing state (state lives in `Home.tsx` hooks, not in shells).
- `prefers-reduced-motion`: disable sheet/inspector slide animations and glow pulses.

## Testing

- Existing tests (`src/__tests__/*`, `App.test.js`) keep passing.
- New unit tests: `BottomSheet` state transitions (peek ↔ expanded, tab tap, canvas tap), gesture math in `useCanvasGestures` (pinch distance → zoom factor, pan delta), `useIsMobile` breakpoint.
- Manual verification in the running app at 1440×900 and 390×844 across Clifford, Symmetric Icon, Mandelbrot and Julia: switch system, apply preset, edit a parameter, run/stop, hunt, zoom (buttons, pinch, fractal drag), palette edit, background switch, export, share, theme switch.
