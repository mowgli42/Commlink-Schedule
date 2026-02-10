# Comm Link Tracking Specification

## Purpose

Define the behavior for tracking, visualizing, and managing communication links between geographical assets (sites, mobile units, aircraft) connected via satellite, line-of-sight radio, VoIP, or XMPP.

## Requirements

### Requirement: Asset Tracking on Map

The system SHALL display all registered assets on an interactive Leaflet map with icons distinguishing platform type.

#### Scenario: Display mobile asset

- GIVEN a mobile asset with coordinates (34.05, -118.24)
- WHEN the map view loads
- THEN a truck icon appears at the correct map position
- AND the icon tooltip shows the asset callsign

#### Scenario: Display aircraft asset

- GIVEN an aircraft asset with coordinates (35.12, -117.50) and altitude 25000ft
- WHEN the map view loads
- THEN a plane icon appears at the correct map position
- AND the icon tooltip shows callsign and altitude

#### Scenario: Asset position update

- GIVEN an asset currently displayed on the map
- WHEN the asset's position data is updated
- THEN the marker animates to the new position
- AND the heading indicator rotates to match

### Requirement: Comm Link Visualization

The system SHALL draw visual connections between assets to represent active communication links.

#### Scenario: Active satellite link

- GIVEN two assets connected by an active satellite link
- WHEN both assets are visible on the map
- THEN a solid cyan line connects the two asset markers
- AND clicking the line shows link details (frequency, satellite, status)

#### Scenario: Degraded link display

- GIVEN a comm link with status "degraded"
- WHEN the link is rendered on the map
- THEN the line is drawn with a dashed pattern in yellow
- AND a warning icon appears at the midpoint

#### Scenario: Unavailable link display

- GIVEN a comm link with status "unavailable"
- WHEN the link is rendered on the map
- THEN the line is drawn with a dotted pattern in red
- AND both endpoint markers show an alert badge

### Requirement: Link Type Differentiation

The system SHALL use distinct colors to differentiate communication link types.

#### Scenario: Color coding

- GIVEN comm links of types satellite, LOS radio, VoIP, and XMPP
- WHEN all are displayed on the map
- THEN satellite links are cyan (#00bcd4)
- AND LOS radio links are green (#4caf50)
- AND VoIP links are orange (#ff9800)
- AND XMPP links are purple (#9c27b0)

### Requirement: Map Layer Controls

The system SHALL provide layer toggle controls for filtering displayed elements.

#### Scenario: Hide satellite links

- GIVEN multiple link types displayed on the map
- WHEN the user toggles off the "Satellite" layer
- THEN all satellite link lines are hidden
- AND satellite-only assets remain visible

#### Scenario: Filter by platform type

- GIVEN assets of all platform types on the map
- WHEN the user unchecks "Aircraft" in the filter
- THEN aircraft markers are hidden
- AND links connected to only aircraft endpoints are hidden

### Requirement: Asset Detail Panel

The system SHALL display a detail panel when an asset marker is clicked.

#### Scenario: Open asset details

- GIVEN an asset marker on the map
- WHEN the user clicks the marker
- THEN a slide-out panel appears from the right
- AND it shows: name, callsign, platform, position, status, active comm links
- AND each listed comm link is clickable to show link details

### Requirement: Coverage Overlay

The system SHOULD display coverage areas for radio and satellite footprints.

#### Scenario: LOS radio coverage

- GIVEN a site asset with a VHF radio (range 50km)
- WHEN coverage overlay is enabled
- THEN a semi-transparent green circle of 50km radius is drawn around the asset

#### Scenario: Satellite footprint

- GIVEN a GEO satellite at 72°W
- WHEN satellite coverage layer is enabled
- THEN a large semi-transparent cyan area shows the satellite's beam footprint
