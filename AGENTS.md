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

## Commlink integration (cross-repo)

Phase order (see `docs/COMMLINK-INTEGRATION-ROADMAP.md`):

1. **Commlink-Directory** — XML v1.1 source format (canonical `sample-directory.xml`)
2. **This repo** — import/export + validation against that source
3. **o-my** — commlink status service (`uci.commlink.*` topics)
4. **o-my-sim** — OMS `PlatformStatusReport` comm subsystems + scenario readiness

Do not build o-my/o-my-sim prototypes from seed data alone. Import `app/static/fixtures/commlink-directory-v1.1.xml` (mirrors Directory sample) and run the **Reports → Source Validation** tab before handoff.

```bash
cd app && npm test    # XML import/export + validation smoke tests
cd app && npm run build
```

## Key Files

- `openspec/` — Specifications and proposals
- `docs/COMMLINK-INTEGRATION-ROADMAP.md` — Schedule-side integration phases
- `app/static/fixtures/commlink-directory-v1.1.xml` — Handoff fixture (sync with Commlink-Directory)
- `app/src/lib/data/stores.js` — Reactive data stores (assets, links, resources, contracts, reservations)
- `app/src/lib/data/seed.js` — Legacy seed data (superseded by Directory import for integration work)
- `app/src/lib/utils/xml.js` — Commlink-Directory XML v1.0/v1.1 import/export
- `app/src/lib/utils/directoryValidation.js` — Source-data validation before downstream handoff
- `app/src/lib/utils/reports.js` — Report data generators (includes source validation)
- `app/src/lib/components/` — Svelte UI components (map, addressbook, reports, guitarhero)

## Conventions

- Svelte 5 runes: `$state`, `$derived`, `$effect`, `$props`
- CSS custom properties in `app/src/app.css`
- RFC 2119 language in specs (SHALL, MUST, SHOULD, MAY)
- Dark theme first (operational environment)

## Issue Tracking

This project uses **bd (beads)** for issue tracking. Run `bd prime` for workflow context, or install hooks with `bd hooks install` for automatic context injection.

Quick reference:

- `bd ready` - find unblocked work
- `bd create "Title" --type task --priority 2` - create an issue
- `bd close <id>` - close completed work
- `bd dolt push` - push Beads data when using a shared Beads remote

For full workflow details, run `bd prime`.
