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

### 1.3 Map Display
- [x] Integrate Leaflet map component
- [x] Create custom asset markers (site, mobile, aircraft)
- [x] Draw comm link lines between assets with color/style coding
- [x] Add coverage overlay circles for radio/satellite footprints
- [x] Implement asset info panel (slide-out on click)
- [x] Add map controls (layer toggle, filter by link type)

## Phase 2: Address Book Integration

### 2.1 Commlink-Directory Import
- [x] Parse Commlink-Directory XML format
- [x] Map XML contacts to internal asset model
- [x] Handle VoIP, XMPP, and CustomServices data

### 2.2 Address Book UI
- [x] Contact card display with platform badges
- [x] Search and filter (by platform, service type)
- [x] Add/edit contact modal
- [x] XML export with Commlink-Directory schema compliance

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
- [x] Time-series usage plot

### 3.4 Link Availability Report
- [x] Per-link uptime percentage
- [x] Availability timeline visualization
- [x] Aggregate availability statistics

## Phase 4: Polish & Documentation

### 4.1 IxDF Design Audit
- [ ] Verify all 8 IxDF principles are met
- [ ] Accessibility check (contrast ratios, keyboard nav)
- [ ] Responsive layout verification

### 4.2 Documentation
- [x] README with setup instructions
- [x] OpenSpec proposal and design docs
- [x] Beads task initialization

## Phase 5: Guitar Hero Display (Future v2)

### 5.1 Timeline Component
- [x] Horizontal timeline with time axis
- [x] Per-asset track rows
- [x] Color-coded availability blocks

### 5.2 Playhead & Animation
- [x] Current-time playhead cursor
- [x] Auto-scroll / manual scroll modes
- [x] Zoom in/out on timeline

### 5.3 Data Integration
- [ ] Connect to comm link schedule data
- [ ] Real-time status updates
- [ ] Historical playback mode
