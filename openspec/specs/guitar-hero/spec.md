# Guitar Hero Display Specification (Future v2)

## Purpose

Define a dynamic timeline display inspired by Guitar Hero that visually tracks when communication links, scarce communication resources, and asset consumers are available, reserved, or unavailable. This provides operators with an intuitive, at-a-glance view of communication windows, metered cost exposure, and reservation conflicts.

## Requirements

### Requirement: Timeline Layout

The system SHALL display a horizontal timeline where each row represents an asset and colored blocks indicate comm link availability.

#### Scenario: Basic timeline display

- GIVEN 5 assets with scheduled comm links
- WHEN the user navigates to the Guitar Hero view
- THEN 5 horizontal tracks are displayed, one per asset
- AND the X-axis shows time (configurable: 6h, 12h, 24h, 48h)
- AND each track contains colored blocks per comm link

#### Scenario: Resource-first timeline display

- GIVEN satellite transponders, radio nets, IP services, and deployable mobile command centers
- WHEN the user selects "Resource" mode
- THEN each row represents a resource
- AND reservation blocks show requested, approved, active, denied, or conflicted use
- AND each row displays the resource billing badge (SUB, $/MIN, $/MB, RESERVE, BASE+OVERAGE)

#### Scenario: Link-first timeline display

- GIVEN communication links with backing resources and contracts
- WHEN the user selects "Comm Link" mode
- THEN each row represents a comm link
- AND blocks show scheduled windows, reservations, and unavailable gaps

#### Scenario: Multiple links per asset

- GIVEN an asset with SATCOM and HF Radio links
- WHEN displayed on the timeline
- THEN two sub-rows appear within the asset's track
- AND each sub-row is labeled with the link name

### Requirement: Availability Color Coding

The system SHALL use consistent colors to indicate link availability status.

#### Scenario: Available link

- GIVEN a comm link that is currently active and operational
- WHEN displayed on the timeline
- THEN the time block is filled with green (#4caf50)

#### Scenario: Unavailable link

- GIVEN a comm link that is currently down
- WHEN displayed on the timeline
- THEN the time block is filled with red (#f44336)

#### Scenario: Degraded link

- GIVEN a comm link operating with reduced capacity
- WHEN displayed on the timeline
- THEN the time block is filled with yellow (#ff9800)

#### Scenario: Scheduled but unconfirmed link

- GIVEN a comm link that is scheduled but not yet active
- WHEN displayed on the timeline
- THEN the time block is filled with gray (#616161) with a striped pattern

#### Scenario: Reservation state

- GIVEN a resource reservation is requested but not approved
- WHEN displayed on the timeline
- THEN the block is blue with a striped pattern
- AND approved or active reservations are green
- AND denied or conflicted reservations have a red outline

### Requirement: Playhead Cursor

The system SHALL display a vertical playhead line indicating the current time.

#### Scenario: Current time indicator

- GIVEN the timeline is displayed
- WHEN viewing the Guitar Hero display
- THEN a bright vertical line marks the current time position
- AND the line animates smoothly as time progresses
- AND blocks to the left of the playhead represent past status
- AND blocks to the right represent future/scheduled status

#### Scenario: Auto-scroll

- GIVEN auto-scroll mode is enabled
- WHEN the playhead approaches the right edge of the visible area
- THEN the timeline scrolls to keep the playhead centered

### Requirement: Interactive Controls

The system SHALL provide controls for zoom, scroll, and time range selection.

#### Scenario: Zoom in

- GIVEN the timeline showing a 24-hour range
- WHEN the user zooms in
- THEN the visible time range narrows (e.g., to 6 hours)
- AND more detail is visible in each block

#### Scenario: Time range selection

- GIVEN the timeline controls
- WHEN the user selects "Next 12 hours"
- THEN the timeline adjusts to show from now to +12 hours

#### Scenario: Inspect block

- GIVEN a colored availability block on the timeline
- WHEN the user hovers or clicks on it
- THEN a tooltip/popover shows: mission or link name, status, start time, end time, billing label, priority, and resource/provider context

### Requirement: Asset Filtering

The system SHOULD allow filtering which assets appear on the timeline.

#### Scenario: Filter by platform

- GIVEN assets of all platform types
- WHEN the user selects "Aircraft only"
- THEN only aircraft asset tracks are displayed

#### Scenario: Filter by link type

- GIVEN assets with various comm link types
- WHEN the user selects "Satellite links only"
- THEN only satellite link sub-rows are displayed within each track
