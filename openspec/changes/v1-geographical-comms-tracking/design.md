# Design: Geographical Comms Tracking v1

## Technical Approach

### Data Model

#### Asset

An asset is any communicating entity: a fixed site, mobile ground unit, or aircraft.

```json
{
  "id": "asset-001",
  "name": "Mobile Unit Bravo",
  "callsign": "BRAVO-6",
  "platform": "mobile",           // site | mobile | aircraft
  "position": {
    "lat": 34.0522,
    "lon": -118.2437,
    "alt_m": 0,
    "heading_deg": 45,
    "speed_kts": 30,
    "timestamp": "2026-02-10T14:30:00Z"
  },
  "status": "active",             // active | inactive | maintenance
  "commlinks": ["link-001", "link-003"],
  "addressbook_ref": "c005-mobile-unit-bravo",  // Commlink-Directory ID
  "icon": "mobile",
  "metadata": {
    "department": "Field Ops",
    "notes": "Equipped with SATCOM and HF radio"
  }
}
```

#### CommLink

A communication link between two or more assets.

```json
{
  "id": "link-001",
  "name": "SATCOM Bravo-to-HQ",
  "type": "satellite",            // satellite | los_radio | voip | xmpp
  "subtype": "GEO",              // GEO | MEO | LEO | UHF | VHF | HF | SHF | null
  "status": "active",            // active | degraded | unavailable | scheduled
  "endpoints": ["asset-001", "asset-002"],
  "frequency": {
    "value_mhz": 14250.0,
    "bandwidth_khz": 36000,
    "polarization": "RHCP",
    "modulation": "QPSK"
  },
  "satellite": {
    "name": "MUOS-5",
    "orbit": "GEO",
    "position_deg_w": 72.0,
    "transponder": "T3-K",
    "provider": "DoD"
  },
  "schedule": {
    "start": "2026-02-10T06:00:00Z",
    "end": "2026-02-10T18:00:00Z",
    "recurrence": "daily"
  },
  "quality": {
    "signal_strength_dbm": -85,
    "ber": 0.001,
    "latency_ms": 270
  }
}
```

#### Frequency Allocation

```json
{
  "id": "freq-001",
  "frequency_mhz": 243.0,
  "bandwidth_khz": 25,
  "designation": "Guard Emergency",
  "band": "UHF",
  "assigned_to": ["asset-001", "asset-003"],
  "link_ids": ["link-004"],
  "classification": "unclassified",
  "notes": "International distress frequency"
}
```

#### Satellite

```json
{
  "id": "sat-001",
  "name": "MUOS-5",
  "norad_id": 41622,
  "orbit_type": "GEO",
  "position_deg_w": 72.0,
  "transponders": [
    {
      "id": "T3-K",
      "band": "Ka",
      "bandwidth_mhz": 500,
      "allocated_to": ["link-001"]
    }
  ],
  "provider": "DoD",
  "status": "operational"
}
```

### Component Architecture

```
App.svelte
├── NavBar.svelte                    # Top navigation with view switcher
├── MapView.svelte                   # Primary map display
│   ├── AssetMarker.svelte           # Individual asset on map
│   ├── CommLinkLine.svelte          # Link visualization (lines/arcs)
│   ├── CoverageOverlay.svelte       # Satellite/radio coverage areas
│   ├── MapControls.svelte           # Zoom, layers, filters
│   └── AssetInfoPanel.svelte        # Slide-out detail panel
├── AddressBookView.svelte           # Commlink-Directory browser
│   ├── ContactCard.svelte           # Individual contact display
│   ├── ContactEditor.svelte         # Add/edit contact modal
│   ├── ImportExport.svelte          # XML import/export controls
│   └── SearchFilter.svelte          # Real-time search + filter chips
├── ReportsView.svelte               # Report dashboard
│   ├── NodeStatusReport.svelte      # Asset/node status summary
│   ├── FrequencyReport.svelte       # Frequency allocation chart
│   ├── SatelliteUsageReport.svelte  # Satellite transponder usage
│   ├── LinkAvailabilityReport.svelte# Uptime/downtime summary
│   └── ReportExporter.svelte        # PDF/CSV/JSON export
├── GuitarHeroView.svelte (v2)       # Future timeline display
│   ├── TimelineTrack.svelte         # Per-asset horizontal timeline
│   ├── AvailabilityBlock.svelte     # Color-coded time block
│   └── PlayheadCursor.svelte        # Current-time indicator
└── Sidebar.svelte                   # Collapsible nav + quick actions
```

### Map Visualization

- **Asset Markers**: Custom SVG icons per platform type (site=building, mobile=truck, aircraft=plane)
- **Comm Links**: Dashed lines between endpoints, color-coded by type:
  - Satellite: `#00bcd4` (cyan)
  - LOS Radio: `#4caf50` (green)
  - VoIP: `#ff9800` (orange)
  - XMPP: `#9c27b0` (purple)
- **Link Status**: Line style indicates status:
  - Active: solid
  - Degraded: dashed
  - Unavailable: dotted + red
  - Scheduled: thin dashed + gray
- **Coverage Circles**: Semi-transparent circles showing radio coverage radius

### Report Types

1. **Node Status Report**: Table/chart of all assets with current status, last contact, active links
2. **Frequency Allocation Report**: Plotly bar chart showing frequency usage by band, conflicts highlighted
3. **Satellite Usage Report**: Transponder utilization gauge charts, time-series of capacity
4. **Link Availability Report**: Uptime percentage per link, availability timeline
5. **Comm Summary Report**: Aggregate statistics exportable to CSV/PDF

### Guitar Hero Display (v2 Future)

A horizontal timeline where each row represents an asset, and colored blocks show when specific comm links are available or unavailable. A vertical playhead cursor marks the current time, scrolling forward like Guitar Hero notes approaching the player.

```
Time →   06:00  08:00  10:00  12:00  14:00  16:00  18:00
         ┌──────────────────────────────────────────────────
BRAVO-6  │ ████████████████░░░░░░████████████████████████████  SATCOM
         │ ░░░░░░░░████████████████████████░░░░░░░░░░░░░░░░  HF Radio
         │                    ▲ NOW
EAGLE-3  │ ████████████░░░░░░░░░░░░░░████████████████████████  SATCOM
         │ ████████████████████████████████████████████████████  UHF LOS
         └──────────────────────────────────────────────────
```

- Green blocks: link available
- Red blocks: link unavailable
- Yellow blocks: link degraded
- Gray blocks: link scheduled but not confirmed
- Playhead: animated vertical line at current time

### Database Schema (SQLite)

```sql
CREATE TABLE assets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  callsign TEXT,
  platform TEXT CHECK(platform IN ('site','mobile','aircraft')),
  lat REAL, lon REAL, alt_m REAL,
  heading_deg REAL, speed_kts REAL,
  status TEXT DEFAULT 'active',
  addressbook_ref TEXT,
  icon TEXT,
  metadata_json TEXT,
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE comm_links (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT CHECK(type IN ('satellite','los_radio','voip','xmpp')),
  subtype TEXT,
  status TEXT DEFAULT 'active',
  frequency_mhz REAL,
  bandwidth_khz REAL,
  polarization TEXT,
  modulation TEXT,
  satellite_id TEXT REFERENCES satellites(id),
  transponder TEXT,
  schedule_start TEXT,
  schedule_end TEXT,
  recurrence TEXT,
  signal_strength_dbm REAL,
  ber REAL,
  latency_ms REAL,
  metadata_json TEXT,
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE link_endpoints (
  link_id TEXT REFERENCES comm_links(id),
  asset_id TEXT REFERENCES assets(id),
  PRIMARY KEY (link_id, asset_id)
);

CREATE TABLE frequencies (
  id TEXT PRIMARY KEY,
  frequency_mhz REAL NOT NULL,
  bandwidth_khz REAL,
  designation TEXT,
  band TEXT,
  classification TEXT DEFAULT 'unclassified',
  notes TEXT
);

CREATE TABLE satellites (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  norad_id INTEGER,
  orbit_type TEXT CHECK(orbit_type IN ('GEO','MEO','LEO')),
  position_deg_w REAL,
  provider TEXT,
  status TEXT DEFAULT 'operational'
);

CREATE TABLE transponders (
  id TEXT PRIMARY KEY,
  satellite_id TEXT REFERENCES satellites(id),
  band TEXT,
  bandwidth_mhz REAL
);
```

### Commlink-Directory Integration

The system imports/exports Commlink-Directory XML files:

1. **Import**: Parse XML → map `<Contact>` elements to assets → preserve `id` as `addressbook_ref`
2. **Export**: Generate XML from asset data → include VoIP/XMPP/CustomServices from link metadata
3. **Sync**: Detect changes between local asset data and imported XML, highlight conflicts

Platform type mapping:
- `site` → fixed installation asset
- `mobile` → mobile ground unit asset
- `aircraft` → airborne platform asset
