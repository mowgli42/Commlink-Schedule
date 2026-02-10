/**
 * Seed data for Geographical Comms Tracking system.
 * Provides sample assets, comm links, frequencies, and satellites.
 */

/** @type {import('./stores.js').Asset[]} */
export const seedAssets = [
  {
    id: 'asset-001',
    name: 'Ops Center Alpha',
    callsign: 'ALPHA-HQ',
    platform: 'site',
    position: { lat: 34.0522, lon: -118.2437, alt_m: 50, heading_deg: 0, speed_kts: 0, timestamp: '2026-02-10T14:00:00Z' },
    status: 'active',
    commlinks: ['link-001', 'link-004', 'link-007'],
    addressbook_ref: 'c001-ops-center-alpha',
    icon: 'site',
    metadata: { department: 'Operations', notes: 'Primary operations center - 24/7 staffed' }
  },
  {
    id: 'asset-002',
    name: 'Server Room Delta',
    callsign: 'DELTA-SRV',
    platform: 'site',
    position: { lat: 34.0580, lon: -118.2500, alt_m: 10, heading_deg: 0, speed_kts: 0, timestamp: '2026-02-10T14:00:00Z' },
    status: 'active',
    commlinks: ['link-007', 'link-008'],
    addressbook_ref: 'c002-server-room-delta',
    icon: 'site',
    metadata: { department: 'IT Infrastructure', notes: 'Core PBX and XMPP server hosting' }
  },
  {
    id: 'asset-003',
    name: 'Conference Room Echo',
    callsign: 'ECHO-CONF',
    platform: 'site',
    position: { lat: 34.0540, lon: -118.2460, alt_m: 25, heading_deg: 0, speed_kts: 0, timestamp: '2026-02-10T14:00:00Z' },
    status: 'active',
    commlinks: ['link-008', 'link-009'],
    addressbook_ref: 'c003-conf-room-echo',
    icon: 'site',
    metadata: { department: 'Executive', notes: 'VTC-equipped board room' }
  },
  {
    id: 'asset-004',
    name: 'Security Operations Center',
    callsign: 'SOC-1',
    platform: 'site',
    position: { lat: 34.0500, lon: -118.2410, alt_m: 5, heading_deg: 0, speed_kts: 0, timestamp: '2026-02-10T14:00:00Z' },
    status: 'active',
    commlinks: ['link-009', 'link-010'],
    addressbook_ref: 'c004-security-ops',
    icon: 'site',
    metadata: { department: 'Security', notes: '24/7 physical and cyber security monitoring' }
  },
  {
    id: 'asset-005',
    name: 'Mobile Unit Bravo',
    callsign: 'BRAVO-6',
    platform: 'mobile',
    position: { lat: 34.1000, lon: -118.3000, alt_m: 0, heading_deg: 45, speed_kts: 30, timestamp: '2026-02-10T14:30:00Z' },
    status: 'active',
    commlinks: ['link-001', 'link-002', 'link-005'],
    addressbook_ref: 'c005-mobile-unit-bravo',
    icon: 'mobile',
    metadata: { department: 'Field Ops', notes: 'Equipped with SATCOM terminal and VHF radio' }
  },
  {
    id: 'asset-006',
    name: 'Mobile Unit Charlie',
    callsign: 'CHARLIE-3',
    platform: 'mobile',
    position: { lat: 33.9500, lon: -118.2200, alt_m: 0, heading_deg: 180, speed_kts: 15, timestamp: '2026-02-10T14:25:00Z' },
    status: 'active',
    commlinks: ['link-002', 'link-003', 'link-006'],
    addressbook_ref: 'c006-mobile-unit-charlie',
    icon: 'mobile',
    metadata: { department: 'Field Ops', notes: 'HF radio with automatic link establishment' }
  },
  {
    id: 'asset-007',
    name: 'Recon Vehicle Foxtrot',
    callsign: 'FOXTROT-9',
    platform: 'mobile',
    position: { lat: 34.2000, lon: -118.4000, alt_m: 0, heading_deg: 270, speed_kts: 45, timestamp: '2026-02-10T14:28:00Z' },
    status: 'maintenance',
    commlinks: ['link-005'],
    addressbook_ref: 'c007-recon-foxtrot',
    icon: 'mobile',
    metadata: { department: 'Reconnaissance', notes: 'Currently at maintenance depot' }
  },
  {
    id: 'asset-008',
    name: 'Eagle One',
    callsign: 'EAGLE-1',
    platform: 'aircraft',
    position: { lat: 34.1500, lon: -118.1500, alt_m: 7620, heading_deg: 90, speed_kts: 250, timestamp: '2026-02-10T14:30:00Z' },
    status: 'active',
    commlinks: ['link-003', 'link-004', 'link-006'],
    addressbook_ref: 'c008-eagle-one',
    icon: 'aircraft',
    metadata: { department: 'Air Ops', notes: 'Fixed-wing surveillance aircraft' }
  },
  {
    id: 'asset-009',
    name: 'Hawk Three',
    callsign: 'HAWK-3',
    platform: 'aircraft',
    position: { lat: 33.8500, lon: -118.3500, alt_m: 3048, heading_deg: 315, speed_kts: 120, timestamp: '2026-02-10T14:29:00Z' },
    status: 'active',
    commlinks: ['link-010', 'link-011'],
    addressbook_ref: 'c009-hawk-three',
    icon: 'aircraft',
    metadata: { department: 'Air Ops', notes: 'Rotary-wing helicopter' }
  },
  {
    id: 'asset-010',
    name: 'Drone Sierra',
    callsign: 'SIERRA-UAV',
    platform: 'aircraft',
    position: { lat: 34.0800, lon: -118.1000, alt_m: 1524, heading_deg: 200, speed_kts: 60, timestamp: '2026-02-10T14:30:00Z' },
    status: 'inactive',
    commlinks: ['link-011'],
    addressbook_ref: 'c010-drone-sierra',
    icon: 'aircraft',
    metadata: { department: 'Reconnaissance', notes: 'Small UAV - link lost 10 min ago' }
  }
];

/** @type {import('./stores.js').CommLink[]} */
export const seedCommLinks = [
  {
    id: 'link-001',
    name: 'SATCOM Alpha-Bravo (GEO)',
    type: 'satellite',
    subtype: 'GEO',
    status: 'active',
    endpoints: ['asset-001', 'asset-005'],
    frequency: { value_mhz: 14250.0, bandwidth_khz: 36000, polarization: 'RHCP', modulation: 'QPSK' },
    satellite: { name: 'MUOS-5', orbit: 'GEO', position_deg_w: 72.0, transponder: 'T3-K', provider: 'DoD' },
    schedule: { start: '2026-02-10T06:00:00Z', end: '2026-02-10T18:00:00Z', recurrence: 'daily' },
    quality: { signal_strength_dbm: -85, ber: 0.001, latency_ms: 270 }
  },
  {
    id: 'link-002',
    name: 'HF Net Bravo-Charlie',
    type: 'los_radio',
    subtype: 'HF',
    status: 'active',
    endpoints: ['asset-005', 'asset-006'],
    frequency: { value_mhz: 7.350, bandwidth_khz: 3, polarization: null, modulation: 'USB' },
    satellite: null,
    schedule: { start: '2026-02-10T00:00:00Z', end: '2026-02-11T00:00:00Z', recurrence: 'daily' },
    quality: { signal_strength_dbm: -72, ber: 0.01, latency_ms: 5 }
  },
  {
    id: 'link-003',
    name: 'UHF LOS Charlie-Eagle',
    type: 'los_radio',
    subtype: 'UHF',
    status: 'degraded',
    endpoints: ['asset-006', 'asset-008'],
    frequency: { value_mhz: 380.0, bandwidth_khz: 25, polarization: 'Vertical', modulation: 'FM' },
    satellite: null,
    schedule: { start: '2026-02-10T08:00:00Z', end: '2026-02-10T20:00:00Z', recurrence: 'daily' },
    quality: { signal_strength_dbm: -95, ber: 0.05, latency_ms: 2 }
  },
  {
    id: 'link-004',
    name: 'SATCOM Alpha-Eagle (LEO)',
    type: 'satellite',
    subtype: 'LEO',
    status: 'active',
    endpoints: ['asset-001', 'asset-008'],
    frequency: { value_mhz: 1616.0, bandwidth_khz: 41.667, polarization: 'RHCP', modulation: 'FDMA/TDMA' },
    satellite: { name: 'Iridium-NEXT-42', orbit: 'LEO', position_deg_w: null, transponder: 'L-Band-3', provider: 'Iridium' },
    schedule: { start: '2026-02-10T00:00:00Z', end: '2026-02-11T00:00:00Z', recurrence: 'daily' },
    quality: { signal_strength_dbm: -90, ber: 0.002, latency_ms: 40 }
  },
  {
    id: 'link-005',
    name: 'VHF Net Bravo-Foxtrot',
    type: 'los_radio',
    subtype: 'VHF',
    status: 'unavailable',
    endpoints: ['asset-005', 'asset-007'],
    frequency: { value_mhz: 156.800, bandwidth_khz: 25, polarization: 'Vertical', modulation: 'FM' },
    satellite: null,
    schedule: { start: '2026-02-10T06:00:00Z', end: '2026-02-10T22:00:00Z', recurrence: 'daily' },
    quality: { signal_strength_dbm: null, ber: null, latency_ms: null }
  },
  {
    id: 'link-006',
    name: 'SHF Relay Charlie-Eagle',
    type: 'satellite',
    subtype: 'MEO',
    status: 'active',
    endpoints: ['asset-006', 'asset-008'],
    frequency: { value_mhz: 7500.0, bandwidth_khz: 500, polarization: 'LHCP', modulation: '8PSK' },
    satellite: { name: 'O3b-MEO-12', orbit: 'MEO', position_deg_w: 47.5, transponder: 'Ka-7', provider: 'SES' },
    schedule: { start: '2026-02-10T04:00:00Z', end: '2026-02-10T16:00:00Z', recurrence: 'daily' },
    quality: { signal_strength_dbm: -78, ber: 0.0005, latency_ms: 125 }
  },
  {
    id: 'link-007',
    name: 'VoIP Alpha-Delta',
    type: 'voip',
    subtype: null,
    status: 'active',
    endpoints: ['asset-001', 'asset-002'],
    frequency: { value_mhz: null, bandwidth_khz: null, polarization: null, modulation: null },
    satellite: null,
    schedule: { start: '2026-02-10T00:00:00Z', end: '2026-02-11T00:00:00Z', recurrence: 'daily' },
    quality: { signal_strength_dbm: null, ber: 0.0001, latency_ms: 3 }
  },
  {
    id: 'link-008',
    name: 'XMPP Chat Delta-Echo',
    type: 'xmpp',
    subtype: null,
    status: 'active',
    endpoints: ['asset-002', 'asset-003'],
    frequency: { value_mhz: null, bandwidth_khz: null, polarization: null, modulation: null },
    satellite: null,
    schedule: { start: '2026-02-10T00:00:00Z', end: '2026-02-11T00:00:00Z', recurrence: 'daily' },
    quality: { signal_strength_dbm: null, ber: null, latency_ms: 8 }
  },
  {
    id: 'link-009',
    name: 'VoIP Echo-SOC',
    type: 'voip',
    subtype: null,
    status: 'degraded',
    endpoints: ['asset-003', 'asset-004'],
    frequency: { value_mhz: null, bandwidth_khz: null, polarization: null, modulation: null },
    satellite: null,
    schedule: { start: '2026-02-10T00:00:00Z', end: '2026-02-11T00:00:00Z', recurrence: 'daily' },
    quality: { signal_strength_dbm: null, ber: 0.02, latency_ms: 150 }
  },
  {
    id: 'link-010',
    name: 'UHF LOS SOC-Hawk',
    type: 'los_radio',
    subtype: 'UHF',
    status: 'active',
    endpoints: ['asset-004', 'asset-009'],
    frequency: { value_mhz: 420.0, bandwidth_khz: 25, polarization: 'Vertical', modulation: 'FM' },
    satellite: null,
    schedule: { start: '2026-02-10T07:00:00Z', end: '2026-02-10T19:00:00Z', recurrence: 'daily' },
    quality: { signal_strength_dbm: -80, ber: 0.003, latency_ms: 2 }
  },
  {
    id: 'link-011',
    name: 'SATCOM Hawk-Drone (GEO)',
    type: 'satellite',
    subtype: 'GEO',
    status: 'unavailable',
    endpoints: ['asset-009', 'asset-010'],
    frequency: { value_mhz: 12450.0, bandwidth_khz: 18000, polarization: 'LHCP', modulation: 'QPSK' },
    satellite: { name: 'WGS-6', orbit: 'GEO', position_deg_w: 177.0, transponder: 'X-2', provider: 'DoD' },
    schedule: { start: '2026-02-10T10:00:00Z', end: '2026-02-10T22:00:00Z', recurrence: 'daily' },
    quality: { signal_strength_dbm: null, ber: null, latency_ms: null }
  }
];

/** @type {import('./stores.js').Satellite[]} */
export const seedSatellites = [
  {
    id: 'sat-001',
    name: 'MUOS-5',
    norad_id: 41622,
    orbit_type: 'GEO',
    position_deg_w: 72.0,
    provider: 'DoD',
    status: 'operational',
    transponders: [
      { id: 'T3-K', band: 'Ka', bandwidth_mhz: 500, allocated_to: ['link-001'] }
    ]
  },
  {
    id: 'sat-002',
    name: 'Iridium-NEXT-42',
    norad_id: 43077,
    orbit_type: 'LEO',
    position_deg_w: null,
    provider: 'Iridium',
    status: 'operational',
    transponders: [
      { id: 'L-Band-3', band: 'L', bandwidth_mhz: 41.667, allocated_to: ['link-004'] }
    ]
  },
  {
    id: 'sat-003',
    name: 'O3b-MEO-12',
    norad_id: 39191,
    orbit_type: 'MEO',
    position_deg_w: 47.5,
    provider: 'SES',
    status: 'operational',
    transponders: [
      { id: 'Ka-7', band: 'Ka', bandwidth_mhz: 500, allocated_to: ['link-006'] }
    ]
  },
  {
    id: 'sat-004',
    name: 'WGS-6',
    norad_id: 39222,
    orbit_type: 'GEO',
    position_deg_w: 177.0,
    provider: 'DoD',
    status: 'operational',
    transponders: [
      { id: 'X-2', band: 'X', bandwidth_mhz: 1000, allocated_to: ['link-011'] },
      { id: 'Ka-1', band: 'Ka', bandwidth_mhz: 2500, allocated_to: [] }
    ]
  }
];

/** @type {import('./stores.js').Frequency[]} */
export const seedFrequencies = [
  { id: 'freq-001', frequency_mhz: 14250.0, bandwidth_khz: 36000, designation: 'Ku-Band SATCOM Uplink', band: 'Ku', assigned_to: ['asset-001', 'asset-005'], link_ids: ['link-001'], classification: 'unclassified', notes: 'Primary SATCOM channel' },
  { id: 'freq-002', frequency_mhz: 7.350, bandwidth_khz: 3, designation: 'HF Net Primary', band: 'HF', assigned_to: ['asset-005', 'asset-006'], link_ids: ['link-002'], classification: 'unclassified', notes: 'ALE-capable HF channel' },
  { id: 'freq-003', frequency_mhz: 380.0, bandwidth_khz: 25, designation: 'UHF Tactical', band: 'UHF', assigned_to: ['asset-006', 'asset-008'], link_ids: ['link-003'], classification: 'unclassified', notes: 'Air-ground tactical channel' },
  { id: 'freq-004', frequency_mhz: 1616.0, bandwidth_khz: 41.667, designation: 'Iridium L-Band', band: 'L', assigned_to: ['asset-001', 'asset-008'], link_ids: ['link-004'], classification: 'unclassified', notes: 'LEO satellite phone channel' },
  { id: 'freq-005', frequency_mhz: 156.800, bandwidth_khz: 25, designation: 'VHF Channel 16', band: 'VHF', assigned_to: ['asset-005', 'asset-007'], link_ids: ['link-005'], classification: 'unclassified', notes: 'International distress/safety frequency' },
  { id: 'freq-006', frequency_mhz: 7500.0, bandwidth_khz: 500, designation: 'SHF Relay', band: 'SHF', assigned_to: ['asset-006', 'asset-008'], link_ids: ['link-006'], classification: 'unclassified', notes: 'MEO satellite relay' },
  { id: 'freq-007', frequency_mhz: 420.0, bandwidth_khz: 25, designation: 'UHF Air Control', band: 'UHF', assigned_to: ['asset-004', 'asset-009'], link_ids: ['link-010'], classification: 'unclassified', notes: 'SOC to helicopter control' },
  { id: 'freq-008', frequency_mhz: 12450.0, bandwidth_khz: 18000, designation: 'Ku-Band SATCOM Downlink', band: 'Ku', assigned_to: ['asset-009', 'asset-010'], link_ids: ['link-011'], classification: 'unclassified', notes: 'GEO satellite downlink' },
  { id: 'freq-009', frequency_mhz: 243.0, bandwidth_khz: 25, designation: 'Guard Emergency', band: 'UHF', assigned_to: ['asset-001', 'asset-005', 'asset-008', 'asset-009'], link_ids: [], classification: 'unclassified', notes: 'Military emergency/distress frequency' },
  { id: 'freq-010', frequency_mhz: 121.5, bandwidth_khz: 25, designation: 'Civil Emergency', band: 'VHF', assigned_to: ['asset-008', 'asset-009', 'asset-010'], link_ids: [], classification: 'unclassified', notes: 'International aeronautical emergency' }
];
