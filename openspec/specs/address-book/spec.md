# Address Book Specification

## Purpose

Define the integration with the Commlink-Directory (https://github.com/mowgli42/Commlink-Directory) for managing communication endpoints across site, mobile, and aircraft platforms.

## Requirements

### Requirement: XML Import

The system SHALL import Commlink-Directory XML files conforming to the enterprise-contact-directory.xsd schema.

#### Scenario: Import valid XML

- GIVEN a valid Commlink-Directory XML file with 10 contacts
- WHEN the user selects "Import XML" and chooses the file
- THEN all 10 contacts are parsed and displayed in the address book
- AND a success toast shows "Imported 10 contacts"

#### Scenario: Import with invalid entries

- GIVEN an XML file with 8 valid and 2 malformed contacts
- WHEN the file is imported
- THEN the 8 valid contacts are imported
- AND a warning toast lists the 2 skipped entries with reasons

#### Scenario: Merge with existing data

- GIVEN 5 contacts already in the system and an XML file with 3 new + 2 overlapping contacts
- WHEN the file is imported
- THEN the 3 new contacts are added
- AND the 2 overlapping contacts show a merge/overwrite dialog

### Requirement: XML Export

The system SHALL export address book data as Commlink-Directory-compatible XML.

#### Scenario: Export all contacts

- GIVEN 15 contacts in the address book
- WHEN the user clicks "Export XML"
- THEN a file is downloaded with filename pattern `enterprise-contact-directory_YYYY-MM-DD_HHMMSS_N-contacts.xml`
- AND the XML includes the XSLT stylesheet processing instruction
- AND the XML validates against enterprise-contact-directory.xsd

### Requirement: Contact Display

The system SHALL display contacts as cards with platform badges and service tags.

#### Scenario: Display site contact

- GIVEN a contact with platform "site" and VoIP + XMPP services
- WHEN viewing the address book
- THEN the card shows the contact name, location, department
- AND a "Site" platform badge is displayed
- AND "VoIP" and "XMPP" service tags are visible

#### Scenario: Display aircraft contact

- GIVEN a contact with platform "aircraft" and SATCOM custom service
- WHEN viewing the address book
- THEN the card shows an aircraft platform badge
- AND the SATCOM service details are visible

### Requirement: Search and Filter

The system SHALL provide real-time search and filter capabilities.

#### Scenario: Text search

- GIVEN 20 contacts in the address book
- WHEN the user types "bravo" in the search box
- THEN only contacts matching "bravo" in any field are shown
- AND results update as the user types (debounced 200ms)

#### Scenario: Platform filter

- GIVEN contacts of all three platform types
- WHEN the user selects the "Mobile" filter chip
- THEN only mobile platform contacts are displayed
- AND the filter chip appears selected/highlighted

### Requirement: Contact Editor

The system SHALL provide a modal form for creating and editing contacts.

#### Scenario: Create new contact

- GIVEN the user clicks "New Contact"
- WHEN the editor modal opens
- THEN fields are shown for: Name, Location, Department, Platform, Notes
- AND collapsible sections for VoIP, XMPP, and Custom Services
- AND the "Save" button is disabled until required fields are filled

#### Scenario: Edit existing contact

- GIVEN an existing contact card
- WHEN the user clicks the edit icon
- THEN the editor modal opens pre-populated with the contact's data
- AND changes are saved to the local store on submit

### Requirement: Asset Linking

The system SHALL link address book contacts to map assets.

#### Scenario: Link contact to asset

- GIVEN a contact "Ops Center Alpha" and a map asset at the same location
- WHEN the user views the contact card
- THEN a "View on Map" button is available
- AND clicking it centers the map on the linked asset
