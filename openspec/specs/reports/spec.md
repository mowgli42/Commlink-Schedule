# Reports Specification

## Purpose

Define the generation and display of standard communication reports including node status, frequency allocation, satellite usage, and link availability.

## Requirements

### Requirement: Node Status Report

The system SHALL generate a report showing the current status of all tracked assets/nodes.

#### Scenario: View node status table

- GIVEN 20 assets in the system with mixed statuses
- WHEN the user navigates to Reports > Node Status
- THEN a table displays: Name, Callsign, Platform, Status, Active Links, Last Update
- AND rows are color-coded by status (green=active, yellow=maintenance, red=inactive)

#### Scenario: Node status chart

- GIVEN the node status report is displayed
- WHEN the user views the chart section
- THEN a Plotly bar chart shows asset counts grouped by platform type
- AND each bar is segmented by status (active/inactive/maintenance)

#### Scenario: Export node status

- GIVEN the node status report
- WHEN the user clicks "Export CSV"
- THEN a CSV file is downloaded containing all table data
- AND the filename includes the report date

### Requirement: Frequency Allocation Report

The system SHALL generate a report showing frequency assignments and potential conflicts.

#### Scenario: Frequency usage chart

- GIVEN 15 frequency allocations across HF, VHF, UHF, SHF bands
- WHEN the user navigates to Reports > Frequency Allocation
- THEN a Plotly grouped bar chart shows frequency count per band
- AND each bar segment shows allocation to specific assets

#### Scenario: Frequency conflict detection

- GIVEN two assets assigned the same frequency within overlapping coverage areas
- WHEN the frequency report is generated
- THEN a "Conflicts" section highlights the overlapping assignments
- AND each conflict shows: frequency, assets involved, coverage overlap

#### Scenario: Frequency table export

- GIVEN the frequency allocation report
- WHEN the user clicks "Export"
- THEN a table is downloadable as CSV with columns: Frequency, Band, Designation, Assigned Assets, Link IDs

### Requirement: Satellite Usage Report

The system SHALL generate a report showing satellite transponder utilization.

#### Scenario: Transponder utilization gauges

- GIVEN 3 satellites with multiple transponders
- WHEN the user navigates to Reports > Satellite Usage
- THEN gauge charts show utilization percentage for each transponder
- AND color changes from green (<70%) to yellow (70-90%) to red (>90%)

#### Scenario: Satellite capacity overview

- GIVEN satellite usage data
- WHEN the overview section is displayed
- THEN a summary card for each satellite shows: name, orbit type, total transponders, active links, capacity used

#### Scenario: Usage time series

- GIVEN historical satellite usage data
- WHEN the user selects a date range
- THEN a Plotly time-series line chart shows capacity utilization over time

### Requirement: Link Availability Report

The system SHALL generate a report showing communication link uptime and availability.

#### Scenario: Per-link uptime

- GIVEN 10 comm links with availability history
- WHEN the user navigates to Reports > Link Availability
- THEN each link shows: name, type, uptime percentage, total hours available/unavailable

#### Scenario: Availability timeline

- GIVEN a selected comm link
- WHEN the user clicks on it in the report
- THEN a horizontal timeline shows availability blocks over the selected period
- AND green blocks = available, red = unavailable, yellow = degraded

#### Scenario: Aggregate statistics

- GIVEN the link availability report
- WHEN viewing the summary section
- THEN aggregate stats show: mean availability %, worst link, best link, total downtime hours

### Requirement: Report Export

The system SHALL support exporting all reports to CSV and JSON formats.

#### Scenario: CSV export

- GIVEN any report view
- WHEN the user clicks the CSV export button
- THEN the browser downloads a properly formatted CSV file
- AND the first row contains column headers

#### Scenario: JSON export

- GIVEN any report view
- WHEN the user clicks the JSON export button
- THEN the browser downloads a JSON file with structured report data
- AND the JSON includes metadata (report type, generated timestamp, parameters)
