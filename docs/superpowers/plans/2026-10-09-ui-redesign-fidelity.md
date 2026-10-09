# UI Redesign — Stitch Fidelity Pass

**Why:** Review of the first pass (plan `2026-10-09-ui-redesign.md`) against the Stitch screens showed the build is far from the design. User approved a fidelity pass on 2026-10-09, plus two screens that had no Stitch design yet (palette editor, Help & About page).

**Source of truth:** the HTML Stitch generated for each screen (project `13329545837469135411`), rendered side-by-side with the app at the same viewport.

| Screen | Stitch screen id |
|---|---|
| Desktop studio | `f301eeef5a254938af876ae20f3b4e95` |
| Mobile studio (peek) | `1e9078957b7d4cf2a1569b4306cc64f6` |
| Mobile params sheet | `4ab03adee83b482d949eb2111465da2a` |
| Export modal | `887827611c674b59a3d689909f12ec04` |
| Palette editor (desktop) | `9d72f52268474205916d7d04814a0d25` |
| Palette editor (mobile sheet) | `5ef8aae96cae4681899c23213131de7b` |
| Help & About (desktop) | `5245a6517a4943b8be76c2915c248f60` |
| Help & About (mobile) | `6612b7428fdb431497d7453c3c0b2f80` |

## Decisions (approved)

- Inspector is a **single scrolling panel** with all sections visible; the icon pill cluster jumps to sections (not tabs).
- Canvas is full-bleed on a dotted field; no bordered frame.
- Icons use **Material Symbols Outlined** (the icon set Stitch uses) with the same glyph names.
- Colors follow the Stitch Material palette for Cyber Cyan (surfaces `#0b0e17/#10131c/#181b25/#1c1f29/#272a33/#32343f`, text `#e0e2ef/#bcc9cd`, primary `#4cd7f6`, primary container `#06b6d4`, secondary `#d0bcff`, outline-variant `#3d494c`); the other four themes keep their own hue.
- Still excluded ("no fake data"): FPS/WebGL/VRAM/Lyapunov readouts, version badges, "Lorenz 63", Help search box, "Performance tip", JPG/WebP/transparent export. Labels stay plain.
- **Help & About keeps all content**: every image (34 sources), every system entry (25), every section (12), all formulas and the comments tab. Only layout and styling change. A test enforces the inventory.
- Palette editor: inline picker under the color ramp; Reset restores the palette as it was when the editor opened.

## Tasks

R1. Tokens aligned to Stitch palette; Material Symbols font; `Icon` renders Material glyphs.
R2. Desktop chrome: TopBar (48px, logo tile, pill with system count badge, bordered Share, primary Export), full-bleed stage with dot grid, Stitch floating toolbar.
R3. Inspector single-scroll: header, jump pills, System (category chips + keyboard-usable list), Presets (thumbnail cards), Parameters card (alternating cyan/violet accents), Render chips, Palette ribbon + Background pills, Effects, stats card + Reset / Run actions.
R4. Mobile shell fidelity + review fixes: canvas tap collapses sheet (native listener through the portal), visible Share failure state, swipe flag reset + pointer capture on sheet handle.
R5. Palette editor rebuild (desktop modal + mobile sheet) with tested pure color-ramp operations.
R6. Export modal fidelity.
R7. Help & About: top bar, left rail with nested systems, "On this page", mobile section chips, restyled content primitives; content inventory test.
R8. Full verification (tests, tsc, CI build, side-by-side screenshots) and fresh review.
