# Tasks: Geographical Comms Tracking v1

## Phase 1: Core Infrastructure

### 1.1 Project Scaffolding
- [x] Initialize SvelteKit project with Svelte 5
- [x] Configure Leaflet.js, Plotly.js dependencies
- [x] Set up CSS custom properties design system (IxDF dark theme)
- [x] Create base layout with navigation

### 1.2 Data Layer
- [x] Define JSON schemas for assets, comm links, frequencies, satellites
- [x] Create Svelte stores for reactive state management
- [x] Build JSON seed data with sample assets and links
- [x] Implement data import/export utilities
- [x] localStorage persistence (data survives page refresh)
- [x] Asset removal cascades to clean up orphan links
- [x] Link creation auto-patches endpoint assets' commlinks arrays

### 1.3 Map Display
- [x] Integrate Leaflet map component
- [x] Create custom asset markers (site, mobile, aircraft) with status-aware colors
- [x] Draw comm link lines between assets with color/style coding
- [x] Add coverage overlay circles for LOS radio footprints (HF/VHF/UHF/SHF)
- [x] Implement asset info panel (slide-out on click)
- [x] Implement link info panel (click link line to inspect)
- [x] Comm link editor modal (create/edit/delete with full field set)
- [x] Add map controls (layer toggle, filter by link type, coverage toggle)

## Phase 2: Address Book Integration

### 2.1 Commlink-Directory Import
- [x] Parse Commlink-Directory XML format
- [x] Map XML contacts to internal asset model
- [x] Preserve VoIP, XMPP, and CustomServices data through import/export

### 2.2 Address Book UI
- [x] Contact card display with platform badges
- [x] Search and filter (by platform, service type)
- [x] Add/edit contact modal
- [x] XML export with Commlink-Directory schema compliance
- [x] "View on Map" button (switches view and centers map on asset)

## Phase 3: Reports

### 3.1 Node Status Report
- [x] Table view of all assets with status indicators
- [x] Plotly chart: assets by platform type and status

### 3.2 Frequency Allocation Report
- [x] Frequency usage bar chart by band
- [x] Conflict detection and highlighting
- [x] Exportable frequency table

### 3.3 Satellite Usage Report
- [x] Transponder utilization gauge charts
- [x] Satellite capacity overview

### 3.4 Link Availability Report
- [x] Per-link uptime percentage
- [x] Availability bar chart with color thresholds
- [x] Aggregate summary cards (mean uptime, best/worst, total downtime)

### 3.5 Export
- [x] CSV export for all tabular reports
- [x] JSON export with metadata for all reports

## Phase 4: Polish & Documentation

### 4.1 IxDF Design Audit
- [x] Verify all 8 IxDF principles are applied
- [x] Accessibility: ARIA roles, keyboard navigation, labeled forms
- [x] Zero Svelte a11y warnings in production build
- [x] Responsive layout (desktop sidebar → mobile stacked)

### 4.2 Documentation
- [x] README with screenshots and full walkthrough (10 screenshots)
- [x] OpenSpec proposal, design, and task docs
- [x] Beads task tracking (3 epics, 35 tasks)
- [x] AGENTS.md for AI coding agents

### 4.3 Infrastructure
- [x] Shared toast notification system
- [x] Reset-to-seed-data button in navbar
- [x] Static adapter for zero-config deployment
- [x] Svelte store subscription cleanup (onDestroy in all components)

## Phase 5: Guitar Hero Display (v2 Preview)

### 5.1 Timeline Component
- [x] Horizontal timeline with time axis
- [x] Per-asset track rows with callsign + platform badge
- [x] Color-coded availability blocks (green/yellow/red/gray)

### 5.2 Playhead & Controls
- [x] Current-time playhead cursor (updates every second)
- [x] Auto-scroll toggle
- [x] Time range selector (6h/12h/24h/48h)
- [x] Platform and link type filters

### 5.3 Data Integration (Future v2)
- [ ] Connect to real-time comm link status feeds
- [ ] Historical playback mode
- [ ] SQLite persistent storage backend
