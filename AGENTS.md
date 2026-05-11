# Agent Instructions — GeoComm Tracker

## Project Context

This is a web-based system for tracking communication links within a geographical region.
It monitors mobile ground units, aircraft, and fixed site assets connected via satellite,
line-of-sight radio, VoIP, and XMPP.

## Tech Stack

- **UI**: Svelte 5 + SvelteKit (in `app/` directory)
- **Maps**: Leaflet.js with CartoDB dark tiles
- **Charts**: Plotly.js for reports
- **Data**: JSON flat files (Svelte stores), future SQLite
- **Address Book**: Commlink-Directory XML format
- **Design**: IxDF guidelines, dark theme, CSS custom properties

## Task Tracking

Use `bd` (Beads) for task tracking. Tasks are in `.beads/issues.jsonl`.

## Development

```bash
cd app
npm install
npm run dev   # Dev server at http://localhost:5173
npm run build # Static build to app/build/
```

## Key Files

- `openspec/` — Specifications and proposals
- `app/src/lib/data/stores.js` — Reactive data stores (assets, links, satellites, frequencies)
- `app/src/lib/data/seed.js` — Sample data
- `app/src/lib/utils/xml.js` — Commlink-Directory XML import/export
- `app/src/lib/utils/reports.js` — Report data generators
- `app/src/lib/components/` — Svelte UI components (map, addressbook, reports, guitarhero)

## Conventions

- Svelte 5 runes: `$state`, `$derived`, `$effect`, `$props`
- CSS custom properties in `app/src/app.css`
- RFC 2119 language in specs (SHALL, MUST, SHOULD, MAY)
- Dark theme first (operational environment)

## Cursor Cloud specific instructions

- **Single service**: This is a purely client-side SPA — no backend, no database, no Docker. The only service to run is the Vite dev server (`npm run dev` in `app/`).
- **Dev server**: Start with `cd app && npm run dev -- --host 0.0.0.0` to bind to all interfaces (needed for Cloud Agent browser access). Runs on port 5173.
- **Type checking**: `npm run check` reports many implicit-`any` warnings in `.js` files (pre-existing). These do not block the build or runtime. The build (`npm run build`) succeeds cleanly.
- **No dedicated lint command**: The project has no ESLint config. `npm run check` (svelte-check) is the closest lint/type-check available.
- **No automated tests**: Playwright is listed as a devDependency but no test files exist yet. Manual testing via the browser is the primary verification method.
- **Map tiles**: Leaflet loads CartoDB dark tiles from an external CDN. If internet is unavailable the map background will be blank, but the app itself still functions.
