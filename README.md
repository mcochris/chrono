# Chrono

A dual-clock web app that shows your local time alongside any timezone in the world, with a three-step timezone picker (region → country → city).

## Features

- **Two analog clocks** — primary clock always shows your local time; secondary clock shows the timezone you choose
- **Timezone picker modal** — drill down by region, country, and city using IANA timezone data
- **Live updates** — both clocks tick in real time, updating every second
- **UTC shortcut** — select UTC/GMT directly without navigating a country list

## Tech Stack

| Tool | Purpose |
|------|---------|
| [Vite](https://vitejs.dev/) | Dev server and bundler |
| [TypeScript](https://www.typescriptlang.org/) | Type-safe source |
| [Luxon](https://moment.github.io/luxon/) | Timezone-aware date/time |

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

## Build

```bash
npm run build      # compile TypeScript and bundle with Vite
npm run preview    # preview the production build locally
```

## Usage

1. The left clock shows your **local time** and timezone abbreviation.
2. Click the label on the right clock (defaults to **UTC**) to open the timezone picker.
3. Select a **region**, then a **country**, then a **city** — click **Done** to apply.
4. The right clock updates immediately and ticks in sync with the selected timezone.

## Project Structure

```
chrono/
├── index.html          # App shell
├── src/
│   ├── main.ts         # Clock logic and timezone picker
│   ├── style.css       # Layout and clock styling
│   └── assets/
│       ├── tz-countries.json   # Region → country mappings
│       └── tz-zones.json       # Country → IANA timezone mappings
└── package.json
```

## Credits

Clock hand animation adapted from [imvpn22's CodePen](https://codepen.io/imvpn22/pen/RwPvOgQ).
