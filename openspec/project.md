# Geographical Comms Tracking — Project Overview

A web-based system for tracking communication links across geographical regions, monitoring mobile and aircraft assets connected via satellite or line-of-sight radio. Integrates with the Commlink-Directory address book and provides operational reports and availability displays.

## Technology Stack

- **Language**: JavaScript / Svelte 5
- **Runtime**: Node.js (≥18), browser-native
- **UI Framework**: Svelte + SvelteKit (lightweight, compiled, minimal runtime)
- **Mapping**: Leaflet.js (open-source, lightweight, mobile-friendly)
- **Charts**: Plotly.js (interactive, export-ready)
- **Database**: SQLite (via better-sqlite3) + JSON flat files for portability
- **Styling**: CSS custom properties, IxDF-aligned design system
- **Address Book**: Commlink-Directory XML import/export (https://github.com/mowgli42/Commlink-Directory)
- **Progress Tracking**: Beads (https://github.com/steveyegge/beads)

## Project Structure

```
src/
├── lib/
│   ├── components/     # Svelte UI components
│   │   ├── map/        # Leaflet map & overlays
│   │   ├── reports/    # Plotly-based report views
│   │   ├── addressbook/# Commlink-Directory integration
│   │   └── guitarhero/ # Future: link availability timeline
│   ├── data/           # Data models, stores, DB access
│   ├── utils/          # XML parsing, coordinate math, formatters
│   └── types/          # TypeScript-like JSDoc type definitions
├── routes/             # SvelteKit pages
└── static/             # Static assets, sample data
```

## Design Principles

- **IxDF Guidelines**: High-contrast dark theme, clear information hierarchy, minimal cognitive load, accessible color palettes, responsive layout
- **Simplicity First**: Prefer fewer dependencies; Svelte over React, SQLite over Postgres, Leaflet over Mapbox
- **Portable Data**: XML and JSON import/export; no hard dependency on a running database server
- **Operator-Centric**: Designed for comm operators managing live link status in operational environments

## Conventions

- Svelte 5 runes (`$state`, `$derived`, `$effect`) for reactivity
- CSS custom properties for theming (dark-first)
- RFC 2119 language in specs (SHALL, MUST, SHOULD, MAY)
- Beads (`bd`) for all task and progress tracking

## Error Handling

- Graceful degradation when map tiles fail to load
- Toast notifications for user-facing errors
- Console logging for debug information
- Fallback data when XML import encounters malformed entries

## Development Workflow

1. Use OpenSpec for planning and specification
2. Use Beads (`bd`) for task tracking and progress
3. Svelte dev server for local development
4. JSON seed data for development; SQLite for production
