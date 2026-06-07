# Commlink integration roadmap

## Strategic goal

Use Commlink-Directory XML as the source data format for assets, comm links, scarce resources, billing contracts, reservations, and utilization inputs. Commlink-Schedule should become the planner and validator for that source data before o-my or o-my-sim build live services on top of it.

```text
Commlink-Directory XML v1.1
        |
        v
Commlink-Schedule planning model
        |
        +--> validated scheduling/resource data
        +--> conflict and utilization reports
        +--> prototype fixtures for o-my and o-my-sim
```

## Current state

Commlink-Schedule already has the right internal concepts:

- assets
- commLinks
- resources
- contracts
- reservations
- usageRecords
- utilization reports
- asset/resource/link timeline modes

The gap is that these are still seed/localStorage objects. They need to round-trip with the Commlink-Directory source format.

## Phase dependency

Do not build downstream o-my prototypes from Schedule-only seed data. First consume a real Commlink-Directory v1.1 file.

## Phases

### Phase 1, source format alignment

Blocked by Commlink-Directory v1.1.

- Update `app/src/lib/utils/xml.js` to parse top-level `Resources`, `Contracts`, `CommLinks`, and `Reservations`.
- Preserve v1.0 contact-only import behavior.
- Export assets plus resources/contracts/commLinks/reservations back to v1.1 XML.
- Add fixtures that mirror Commlink-Directory sample XML.

### Phase 2, planning validation

Owned by this repo after import works.

- Validate resource references in imported links and reservations.
- Flag missing contract/resource references.
- Flag reservation conflicts using max concurrent links and bandwidth.
- Compute utilization by resource, asset, and link from imported usage records or operator-entered records.
- Add warnings for metered links scheduled without budget/approval.

### Phase 3, o-my prototype handoff fixture

Owned jointly with o-my.

- Export a minimal fixture that o-my can ingest:
  - contacts/assets
  - comm links
  - resources
  - contracts
  - reservations
- Include known scenarios:
  - subscription SATCOM
  - pay-per-minute LEO service
  - reservation-only mobile command center
  - conflict on a single satellite transponder

### Phase 4, o-my-sim handoff fixture

Owned jointly with o-my-sim.

- Export a sim-oriented fixture that maps directory contacts to OMS platform IDs.
- Include comm subsystem metadata usable in `PlatformStatusReport`.
- Include reservation windows that drive availability changes during scenario time.

## Data quality checks

Before downstream service work begins, this repo should answer:

- Which links have no backing resource?
- Which resources have no contract?
- Which reservations overlap beyond resource capacity?
- Which metered links have expected cost over budget?
- Which contacts are missing position/platform metadata needed for map/sim display?
- Which comm links reference unknown contacts?

## Acceptance criteria for this repo

- Importing Commlink-Directory v1.1 populates all planning stores.
- Exporting back to XML preserves source IDs.
- Existing v1.0 XML import still works.
- Reports and timeline work from imported data, not only seed data.
- Beads contains phase tasks for importer, validation, and handoff fixtures.
