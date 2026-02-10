# GeoComm Tracker — Geographical Communication Link Tracking

A lightweight, web-based system for tracking and visualizing communication links within a geographical region. Monitors mobile ground units, aircraft, and fixed site assets connected via satellite (GEO/MEO/LEO), line-of-sight radio, VoIP, and XMPP.

---

## Overview

GeoComm Tracker provides communication operators with a unified, map-centric view of their operational environment:

- **Interactive Map** — Leaflet.js-powered dark-themed map showing assets and comm links with color-coded status indicators
- **Comm Link Tracking** — Visualize satellite, LOS radio, VoIP, and XMPP connections between mobile, aircraft, and site assets
- **Address Book** — Integrated with [Commlink-Directory](https://github.com/mowgli42/Commlink-Directory) XML format for contact/endpoint management
- **Operational Reports** — Node status, frequency allocation, satellite usage, and link availability reports with Plotly.js charts
- **Guitar Hero Timeline** (v2) — Dynamic horizontal timeline showing comm link availability windows per asset
- **IxDF Design** — Dark-first operational theme following [IxDF](https://www.interaction-design.org/) design principles

---

## Screenshots

### Map View
Interactive Leaflet map with asset markers (site/mobile/aircraft icons), color-coded comm link lines, and filterable layer controls.

### Address Book
Card-based contact directory with search, platform filters, and Commlink-Directory XML import/export.

### Reports Dashboard
Plotly.js-powered charts: node status by platform, frequency allocation by band, satellite transponder utilization gauges, and link availability bars.

### Guitar Hero Timeline (v2 Preview)
Horizontal per-asset timeline with color-coded availability blocks and animated playhead cursor.

---

## Technology Stack

| Component | Technology | Why |
|-----------|-----------|-----|
| **UI Framework** | [Svelte 5](https://svelte.dev/) + SvelteKit | Compiled reactivity, smallest bundle, simplest DX |
| **Mapping** | [Leaflet.js](https://leafletjs.com/) | Open-source, lightweight (~40KB), no API key |
| **Charts** | [Plotly.js](https://plotly.com/javascript/) | Interactive, export-ready, no server needed |
| **Database** | JSON flat files (v1) / SQLite (v2) | Zero-config, portable, version-controllable |
| **Address Book** | [Commlink-Directory](https://github.com/mowgli42/Commlink-Directory) XML | Existing enterprise contact standard |
| **Design** | CSS Custom Properties (dark theme) | IxDF-aligned, responsive, accessible |
| **Specs** | [OpenSpec](https://github.com/Fission-AI/OpenSpec) | Iterative, artifact-driven specifications |
| **Progress** | [Beads](https://github.com/steveyegge/beads) | Git-backed, agent-friendly task tracking |

---

## Quick Start

### Prerequisites

- Node.js ≥ 18
- npm or pnpm

### Install & Run

```bash
# Clone the repository
git clone <this-repo-url>
cd geocomm-tracker

# Install dependencies
cd app
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
cd app
npm run build
npm run preview
```

---

## Project Structure

```
.
├── README.md                         # This file
├── LICENSE                           # Project license
├── openspec/                         # OpenSpec specifications
│   ├── config.yaml                   # OpenSpec configuration
│   ├── project.md                    # Project overview
│   ├── specs/                        # System specifications
│   │   ├── comm-tracking/spec.md     # Map & link tracking requirements
│   │   ├── address-book/spec.md      # Commlink-Directory integration
│   │   ├── reports/spec.md           # Report generation requirements
│   │   └── guitar-hero/spec.md       # Timeline display (v2)
│   └── changes/                      # Change proposals
│       └── v1-geographical-comms-tracking/
│           ├── proposal.md           # Project proposal
│           ├── design.md             # Technical design
│           └── tasks.md              # Implementation checklist
├── .beads/                           # Beads progress tracking
│   ├── config.yaml                   # Beads configuration
│   └── issues.jsonl                  # Task graph (JSONL)
└── app/                              # SvelteKit application
    ├── package.json
    ├── src/
    │   ├── app.css                   # IxDF design system (CSS custom properties)
    │   ├── app.html                  # HTML shell
    │   ├── routes/
    │   │   ├── +layout.svelte        # Root layout
    │   │   └── +page.svelte          # Main page (view switcher)
    │   └── lib/
    │       ├── data/
    │       │   ├── stores.js         # Svelte reactive stores
    │       │   └── seed.js           # Sample data (10 assets, 11 links, 4 sats)
    │       ├── components/
    │       │   ├── map/
    │       │   │   ├── MapView.svelte        # Leaflet map + overlays
    │       │   │   └── AssetInfoPanel.svelte  # Asset detail slide-out
    │       │   ├── addressbook/
    │       │   │   └── AddressBookView.svelte # Contact directory
    │       │   ├── reports/
    │       │   │   └── ReportsView.svelte     # Report dashboard
    │       │   └── guitarhero/
    │       │       └── GuitarHeroView.svelte  # Timeline display
    │       └── utils/
    │           ├── xml.js            # Commlink-Directory XML import/export
    │           └── reports.js        # Report data generators
    └── static/                       # Static assets
```

---

## Features

### Map View

- Custom SVG markers for each platform type (site=building, mobile=truck, aircraft=plane)
- Color-coded comm link lines:
  - **Satellite**: cyan (`#00bcd4`)
  - **LOS Radio**: green (`#4caf50`)
  - **VoIP**: orange (`#ff9800`)
  - **XMPP**: purple (`#9c27b0`)
- Link status indicated by line style (solid=active, dashed=degraded, dotted=unavailable)
- Toggle filters for link types and platform categories
- Click-to-inspect asset detail panel with comm link summary

### Address Book (Commlink-Directory Integration)

- Import contacts from [Commlink-Directory](https://github.com/mowgli42/Commlink-Directory) XML files
- Export current contacts as schema-compliant XML with XSLT stylesheet reference
- Card-based display with platform badges and service tags
- Real-time search across all fields
- Filter by platform type (site, mobile, aircraft)
- Create/edit contacts via modal form

### Reports

| Report | Description | Chart Type |
|--------|-------------|------------|
| **Node Status** | All assets with status, active links, last update | Grouped bar chart |
| **Frequency Allocation** | Frequency usage by band with conflict detection | Bar chart |
| **Satellite Usage** | Transponder utilization per satellite | Gauge charts |
| **Link Availability** | Uptime %, downtime hours, best/worst link | Bar chart + summary cards |

All reports exportable to **CSV** and **JSON**.

### Guitar Hero Timeline (v2 Preview)

- Horizontal timeline with per-asset tracks
- Color-coded availability blocks (green=available, red=down, yellow=degraded, gray=scheduled)
- Animated playhead cursor at current time
- Configurable time range (6h / 12h / 24h / 48h)
- Filter by platform and link type

---

## Data Model

### Assets
Tracked entities: fixed sites, mobile ground units, aircraft. Each has position (WGS84), callsign, platform type, and associated comm links.

### Comm Links
Connections between assets: satellite (GEO/MEO/LEO), line-of-sight radio (HF/VHF/UHF/SHF), VoIP, or XMPP. Include frequency, bandwidth, modulation, schedule, and quality metrics.

### Satellites
GEO/MEO/LEO satellites with transponder details, provider, and allocation tracking.

### Frequencies
Allocated frequencies with band, designation, assigned assets, and conflict detection.

---

## Design Principles (IxDF)

This project follows [IxDF (Interaction Design Foundation)](https://www.interaction-design.org/) design guidelines:

1. **Visibility of System Status** — Status bar shows live asset/link counts; color-coded indicators throughout
2. **Match Between System and Real World** — Uses standard comm terminology (callsign, frequency, transponder)
3. **User Control and Freedom** — Dismissible panels, undo-friendly operations, optional filters
4. **Consistency and Standards** — Commlink-Directory schema, standard report formats, consistent color coding
5. **Error Prevention** — Validation on coordinates, frequencies; duplicate detection in address book
6. **Recognition Rather Than Recall** — Asset cards show key info at a glance; filter chips persist state
7. **Flexibility and Efficiency** — Quick-search, filter chips, keyboard-accessible controls
8. **Aesthetic and Minimalist Design** — Dark operational theme, high-contrast colors, no visual clutter

---

## OpenSpec Specifications

This project uses [OpenSpec](https://github.com/Fission-AI/OpenSpec) for iterative, artifact-driven specifications.

- **Proposal**: `openspec/changes/v1-geographical-comms-tracking/proposal.md`
- **Design**: `openspec/changes/v1-geographical-comms-tracking/design.md`
- **Tasks**: `openspec/changes/v1-geographical-comms-tracking/tasks.md`
- **Specs**: `openspec/specs/` (comm-tracking, address-book, reports, guitar-hero)

---

## Beads Progress Tracking

This project uses [Beads](https://github.com/steveyegge/beads) for git-backed task tracking.

Task graph stored in `.beads/issues.jsonl`. Epics:

- **bd-a1f0**: GeoComm Tracker v1 (18 tasks, 16 closed)
- **bd-b2e0**: GeoComm Tracker v2 — Guitar Hero Live (5 tasks, all open)

---

## Roadmap

### v1 (Current)
- [x] Leaflet map with asset markers and comm link visualization
- [x] Commlink-Directory XML import/export
- [x] Node status, frequency, satellite, and availability reports
- [x] IxDF dark-theme design system
- [x] Guitar Hero timeline preview

### v2 (Future)
- [ ] Real-time comm link status data feeds
- [ ] Animated Guitar Hero playhead with auto-scroll
- [ ] Historical playback mode
- [ ] SQLite persistent storage backend
- [ ] Multi-region support
- [ ] Accessibility audit (WCAG 2.1 AA)

---

## License

See [LICENSE](LICENSE) for details.
