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
