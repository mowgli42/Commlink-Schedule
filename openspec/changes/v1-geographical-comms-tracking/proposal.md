# Proposal: Geographical Communication Link Tracking System (v1)

## Summary

Build a lightweight, web-based system to track and visualize communication links within a geographical region. The system tracks mobile ground units, aircraft, and fixed sites connected via satellite (GEO/MEO/LEO), line-of-sight radio, VoIP, and XMPP. It integrates with the Commlink-Directory address book for node management and generates standard communication reports.

## Motivation

Communication operators managing multi-domain assets (ground mobile, air, fixed sites) need a unified view of:

1. **Where** assets are geographically located
2. **What** communication links connect them (satellite, LOS radio, IP-based)
3. **Whether** those links are currently available or degraded
4. **How** frequencies, satellites, and bandwidth are allocated

Current workflows rely on spreadsheets, radio logs, and separate tools. A single map-centric display with integrated reporting reduces operator cognitive load and improves situational awareness.

## Goals

- **G1**: Display assets on an interactive map with real-time position updates
- **G2**: Visualize comm links between assets (type, status, frequency)
- **G3**: Integrate Commlink-Directory XML address book for node management
- **G4**: Generate standard comm reports (node status, frequency allocation, satellite usage)
- **G5**: Provide a simple, deployable web application with minimal infrastructure
- **G6** (Future v2): Dynamic "Guitar Hero" timeline display showing link availability windows

## Non-Goals

- Real-time radio signal processing or SDR integration
- Classified/encrypted data handling (this is an unclassified planning tool)
- Full network management (SNMP, etc.)
- Mobile app (web-responsive is sufficient)

## Approach

### Technology Selection Rationale

| Choice | Why |
|--------|-----|
| **Svelte 5** | Smallest bundle size, compiled reactivity, simpler than React for operational UIs |
| **Leaflet.js** | Open-source, lightweight (~40KB), extensive plugin ecosystem, no API key required |
| **Plotly.js** | Interactive charts with export to PNG/SVG, no server needed |
| **SQLite** | Zero-config, single-file database, portable across environments |
| **JSON flat files** | Development seed data, easy to version control, human-readable |
| **Commlink-Directory XML** | Existing standard for enterprise contact/endpoint management |
| **Beads (bd)** | Git-native task tracking, agent-friendly, dependency-aware |

### Architecture

```
┌──────────────────────────────────────────────────────┐
│                    Browser Client                      │
│                                                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────────┐  │
│  │  Leaflet   │  │   Plotly   │  │  Guitar Hero   │  │
│  │  Map View  │  │  Reports   │  │  (Future v2)   │  │
│  └─────┬──────┘  └─────┬──────┘  └───────┬────────┘  │
│        │               │                  │            │
│  ┌─────┴───────────────┴──────────────────┴────────┐  │
│  │              Svelte App Layer                    │  │
│  │  Stores · Components · Reactive State           │  │
│  └─────────────────────┬───────────────────────────┘  │
│                        │                               │
│  ┌─────────────────────┴───────────────────────────┐  │
│  │              Data Layer                          │  │
│  │  JSON Store · XML Import/Export · SQLite (opt)   │  │
│  └─────────────────────────────────────────────────┘  │
│                                                        │
└──────────────────────────────────────────────────────┘
```

### IxDF Design Principles Applied

1. **Visibility of System Status**: Map shows live asset positions and link states with color-coded indicators
2. **Match Between System and Real World**: Uses standard comm terminology (freq, bandwidth, callsign, SATCOM)
3. **User Control and Freedom**: Undo/redo for edits, dismissible modals, optional filters
4. **Consistency and Standards**: Follows Commlink-Directory data schema, standard report formats
5. **Error Prevention**: Validation on frequency ranges, coordinate bounds, duplicate detection
6. **Recognition Rather Than Recall**: Asset cards show key info at a glance, filter chips persist
7. **Flexibility and Efficiency**: Keyboard shortcuts, bulk operations, quick-search
8. **Aesthetic and Minimalist Design**: Dark theme, high-contrast operational colors, no clutter

## Impact

- **Users**: Communication operators, mission planners, network engineers
- **Data**: Integrates with existing Commlink-Directory XML files
- **Deployment**: Static files + optional Node.js backend; deployable to any web server
- **Future**: v2 Guitar Hero display, real-time data feeds, multi-region support

## Risks

| Risk | Mitigation |
|------|------------|
| Leaflet tile server dependency | Support offline tile caching, fallback to OpenStreetMap |
| Large asset counts (>500) | Use Leaflet marker clustering, virtualized lists |
| XML schema drift | Pin Commlink-Directory XSD version, validate on import |
| Browser SQLite limitations | Use JSON fallback for pure client-side deployment |

## Timeline

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| **Phase 1**: Core map + data model | 2 weeks | Map view with assets and links |
| **Phase 2**: Address book integration | 1 week | Commlink-Directory import/export |
| **Phase 3**: Reports | 1 week | Node, frequency, satellite reports |
| **Phase 4**: Polish + deployment | 1 week | IxDF audit, responsive, documentation |
| **Phase 5** (Future): Guitar Hero display | 2 weeks | Timeline availability view |
