# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # start Vite dev server at http://localhost:5173
npm run build     # tsc + Vite bundle into dist/
npm run preview   # serve the production build locally
```

There are no tests or linter configured.

## Architecture

Chrono is a **vanilla TypeScript + Vite** single-page app — no framework, no components, no build-time HTML templating.

### DOM ownership model

All DOM structure lives in [index.html](index.html). [src/main.ts](src/main.ts) queries every element once at the top of the file and stores the references as module-level constants. There is no reactive state system — the single piece of mutable state is `selectedTZ: string | null`, and UI updates are driven by direct DOM manipulation.

### Clock rendering

Both clocks are purely CSS-transform based. `setClock()` runs every second via `setInterval` and sets `rotateZ(...)` on the `.hour`, `.min`, and `.sec` divs inside each `.clock`. The math:
- hour hand: `hour * 30 + minute * 2.5` degrees
- minute/second hands: `value * 6` degrees

### Timezone picker flow

The picker is a `<dialog>` element (`.tz-picker`) driven by a three-step drill-down:
1. **Region** — buttons are hardcoded in HTML with `data-region` attributes
2. **Country** — dynamically generated from `tz-countries.json` (shape: `{ [region]: string[] }`)
3. **City/TZ** — dynamically generated from `tz-zones.json` (shape: `{ [country]: string[] }` where values are full IANA zone IDs like `"America/New_York"`)

`getTZByCountryAndRegion()` filters the country's zones using `IANAZone.isValidZone(region + '/' + tz)` to avoid showing zones that don't belong to the selected region. Selecting UTC/GMT skips steps 2–3 entirely.

### Theming

CSS custom properties `--main-bg-color` and `--main-text-color` control the palette. A `[data-theme="dark"]` override is defined in [src/style.css](src/style.css) but no JS toggle is wired up yet.
