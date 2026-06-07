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
    quality: { signal_strength_dbm: -85, ber: 0.001, latency_ms: 270 },
    resource_id: 'res-muos-t3k',
    contract_id: 'contract-muos-sub'
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
    quality: { signal_strength_dbm: -72, ber: 0.01, latency_ms: 5 },
    resource_id: 'res-hf-net',
    contract_id: 'contract-hf-owned'
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
    quality: { signal_strength_dbm: -95, ber: 0.05, latency_ms: 2 },
    resource_id: 'res-uhf-tactical',
    contract_id: 'contract-uhf-owned'
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
    quality: { signal_strength_dbm: -90, ber: 0.002, latency_ms: 40 },
    resource_id: 'res-iridium-lband',
    contract_id: 'contract-iridium-metered'
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
    quality: { signal_strength_dbm: null, ber: null, latency_ms: null },
    resource_id: 'res-vhf-net',
    contract_id: 'contract-vhf-owned'
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
    quality: { signal_strength_dbm: -78, ber: 0.0005, latency_ms: 125 },
    resource_id: 'res-o3b-ka7',
    contract_id: 'contract-o3b-hybrid'
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
    quality: { signal_strength_dbm: null, ber: 0.0001, latency_ms: 3 },
    resource_id: 'res-ip-voice',
    contract_id: 'contract-ip-sub'
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
    quality: { signal_strength_dbm: null, ber: null, latency_ms: 8 },
    resource_id: 'res-xmpp-core',
    contract_id: 'contract-xmpp-sub'
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
    quality: { signal_strength_dbm: null, ber: 0.02, latency_ms: 150 },
    resource_id: 'res-ip-voice',
    contract_id: 'contract-ip-sub'
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
    quality: { signal_strength_dbm: -80, ber: 0.003, latency_ms: 2 },
    resource_id: 'res-uhf-air-control',
    contract_id: 'contract-uhf-air-owned'
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
    quality: { signal_strength_dbm: null, ber: null, latency_ms: null },
    resource_id: 'res-wgs-x2',
    contract_id: 'contract-wgs-reservation'
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

/** @type {import('./stores.js').Resource[]} */
export const seedResources = [
  {
    id: 'res-muos-t3k',
    kind: 'satellite_transponder',
    name: 'MUOS-5 T3-K',
    owner: 'Operations',
    provider: 'DoD',
    status: 'operational',
    capacity: { bandwidth_khz: 36000, channels: 1, max_concurrent_links: 1, coverage_area: 'GEO western CONUS beam' },
    availability_windows: [{ start: '2026-02-10T00:00:00Z', end: '2026-02-11T00:00:00Z', recurrence: 'daily' }],
    asset_id: null,
    link_ids: ['link-001']
  },
  {
    id: 'res-iridium-lband',
    kind: 'satellite_transponder',
    name: 'Iridium L-Band PTT',
    owner: 'Field Ops',
    provider: 'Iridium',
    status: 'operational',
    capacity: { bandwidth_khz: 41.667, channels: 2, max_concurrent_links: 2, coverage_area: 'LEO global spot beam' },
    availability_windows: [{ start: '2026-02-10T00:00:00Z', end: '2026-02-11T00:00:00Z', recurrence: 'daily' }],
    asset_id: null,
    link_ids: ['link-004']
  },
  {
    id: 'res-o3b-ka7',
    kind: 'satellite_transponder',
    name: 'O3b MEO Ka-7',
    owner: 'Air Ops',
    provider: 'SES',
    status: 'operational',
    capacity: { bandwidth_khz: 500, channels: 1, max_concurrent_links: 1, coverage_area: 'MEO steerable beam' },
    availability_windows: [{ start: '2026-02-10T04:00:00Z', end: '2026-02-10T16:00:00Z', recurrence: 'daily' }],
    asset_id: null,
    link_ids: ['link-006']
  },
  {
    id: 'res-wgs-x2',
    kind: 'satellite_transponder',
    name: 'WGS-6 X-2',
    owner: 'Air Ops',
    provider: 'DoD',
    status: 'operational',
    capacity: { bandwidth_khz: 18000, channels: 1, max_concurrent_links: 1, coverage_area: 'GEO Pacific beam' },
    availability_windows: [{ start: '2026-02-10T10:00:00Z', end: '2026-02-10T22:00:00Z', recurrence: 'daily' }],
    asset_id: null,
    link_ids: ['link-011']
  },
  {
    id: 'res-mobile-command-center',
    kind: 'mobile_command_center',
    name: 'Mobile Command Center MCC-01',
    owner: 'Field Ops',
    provider: 'Internal',
    status: 'operational',
    capacity: { bandwidth_khz: 25000, channels: 4, max_concurrent_links: 4, coverage_area: '30 km deployable bubble' },
    availability_windows: [{ start: '2026-02-10T12:00:00Z', end: '2026-02-10T20:00:00Z', recurrence: 'none' }],
    asset_id: 'asset-005',
    link_ids: []
  },
  {
    id: 'res-hf-net',
    kind: 'radio_net',
    name: 'HF Net Primary',
    owner: 'Field Ops',
    provider: 'Internal',
    status: 'operational',
    capacity: { bandwidth_khz: 3, channels: 1, max_concurrent_links: 1, coverage_area: 'Regional HF skywave' },
    availability_windows: [{ start: '2026-02-10T00:00:00Z', end: '2026-02-11T00:00:00Z', recurrence: 'daily' }],
    asset_id: null,
    link_ids: ['link-002']
  },
  {
    id: 'res-vhf-net',
    kind: 'radio_net',
    name: 'VHF Channel 16',
    owner: 'Field Ops',
    provider: 'Internal',
    status: 'maintenance',
    capacity: { bandwidth_khz: 25, channels: 1, max_concurrent_links: 1, coverage_area: '50 km line-of-sight' },
    availability_windows: [{ start: '2026-02-10T06:00:00Z', end: '2026-02-10T22:00:00Z', recurrence: 'daily' }],
    asset_id: null,
    link_ids: ['link-005']
  },
  {
    id: 'res-uhf-tactical',
    kind: 'radio_net',
    name: 'UHF Tactical',
    owner: 'Air Ops',
    provider: 'Internal',
    status: 'operational',
    capacity: { bandwidth_khz: 25, channels: 1, max_concurrent_links: 1, coverage_area: 'Air-ground LOS' },
    availability_windows: [{ start: '2026-02-10T08:00:00Z', end: '2026-02-10T20:00:00Z', recurrence: 'daily' }],
    asset_id: null,
    link_ids: ['link-003']
  },
  {
    id: 'res-uhf-air-control',
    kind: 'radio_net',
    name: 'UHF Air Control',
    owner: 'Security',
    provider: 'Internal',
    status: 'operational',
    capacity: { bandwidth_khz: 25, channels: 1, max_concurrent_links: 1, coverage_area: 'SOC air control sector' },
    availability_windows: [{ start: '2026-02-10T07:00:00Z', end: '2026-02-10T19:00:00Z', recurrence: 'daily' }],
    asset_id: null,
    link_ids: ['link-010']
  },
  {
    id: 'res-ip-voice',
    kind: 'ip_service',
    name: 'Core VoIP PBX',
    owner: 'IT Infrastructure',
    provider: 'Internal',
    status: 'operational',
    capacity: { channels: 80, max_concurrent_links: 80, coverage_area: 'Enterprise LAN/WAN' },
    availability_windows: [{ start: '2026-02-10T00:00:00Z', end: '2026-02-11T00:00:00Z', recurrence: 'daily' }],
    asset_id: 'asset-002',
    link_ids: ['link-007', 'link-009']
  },
  {
    id: 'res-xmpp-core',
    kind: 'ip_service',
    name: 'XMPP Core Messaging',
    owner: 'IT Infrastructure',
    provider: 'Internal',
    status: 'operational',
    capacity: { channels: 500, max_concurrent_links: 500, coverage_area: 'Enterprise LAN/WAN' },
    availability_windows: [{ start: '2026-02-10T00:00:00Z', end: '2026-02-11T00:00:00Z', recurrence: 'daily' }],
    asset_id: 'asset-002',
    link_ids: ['link-008']
  }
];

/** @type {import('./stores.js').Contract[]} */
export const seedContracts = [
  { id: 'contract-muos-sub', resource_id: 'res-muos-t3k', billing_model: 'subscription', label: 'SUB', included_minutes: 1440, included_data_mb: null, overage_rate: 0, currency: 'USD', priority_class: 'mission' },
  { id: 'contract-iridium-metered', resource_id: 'res-iridium-lband', billing_model: 'pay_per_minute', label: '$/MIN', included_minutes: 60, included_data_mb: null, overage_rate: 2.0, currency: 'USD', priority_class: 'field' },
  { id: 'contract-o3b-hybrid', resource_id: 'res-o3b-ka7', billing_model: 'hybrid', label: 'BASE+OVERAGE', included_minutes: 480, included_data_mb: 10000, overage_rate: 0.12, currency: 'USD', priority_class: 'air' },
  { id: 'contract-wgs-reservation', resource_id: 'res-wgs-x2', billing_model: 'reservation', label: 'RESERVE', included_minutes: null, included_data_mb: null, overage_rate: 0, currency: 'USD', priority_class: 'priority' },
  { id: 'contract-mcc-reservation', resource_id: 'res-mobile-command-center', billing_model: 'reservation', label: 'RESERVE', included_minutes: null, included_data_mb: null, overage_rate: 0, currency: 'USD', priority_class: 'priority' },
  { id: 'contract-hf-owned', resource_id: 'res-hf-net', billing_model: 'subscription', label: 'OWNED', included_minutes: 1440, included_data_mb: null, overage_rate: 0, currency: 'USD', priority_class: 'routine' },
  { id: 'contract-vhf-owned', resource_id: 'res-vhf-net', billing_model: 'subscription', label: 'OWNED', included_minutes: 960, included_data_mb: null, overage_rate: 0, currency: 'USD', priority_class: 'routine' },
  { id: 'contract-uhf-owned', resource_id: 'res-uhf-tactical', billing_model: 'subscription', label: 'OWNED', included_minutes: 720, included_data_mb: null, overage_rate: 0, currency: 'USD', priority_class: 'routine' },
  { id: 'contract-uhf-air-owned', resource_id: 'res-uhf-air-control', billing_model: 'subscription', label: 'OWNED', included_minutes: 720, included_data_mb: null, overage_rate: 0, currency: 'USD', priority_class: 'routine' },
  { id: 'contract-ip-sub', resource_id: 'res-ip-voice', billing_model: 'subscription', label: 'SUB', included_minutes: 1440, included_data_mb: null, overage_rate: 0, currency: 'USD', priority_class: 'routine' },
  { id: 'contract-xmpp-sub', resource_id: 'res-xmpp-core', billing_model: 'subscription', label: 'SUB', included_minutes: 1440, included_data_mb: null, overage_rate: 0, currency: 'USD', priority_class: 'routine' }
];

/** @type {import('./stores.js').Reservation[]} */
export const seedReservations = [
  { id: 'resv-001', resource_id: 'res-muos-t3k', link_id: 'link-001', asset_ids: ['asset-001', 'asset-005'], start: '2026-02-10T06:00:00Z', end: '2026-02-10T18:00:00Z', status: 'active', priority: 'priority', mission: 'Bravo field operations', requested_by: 'Field Ops', approved_by: 'SATCOM Desk', bandwidth_khz: 36000 },
  { id: 'resv-002', resource_id: 'res-iridium-lband', link_id: 'link-004', asset_ids: ['asset-001', 'asset-008'], start: '2026-02-10T14:00:00Z', end: '2026-02-10T16:00:00Z', status: 'approved', priority: 'routine', mission: 'Airborne surveillance fallback', requested_by: 'Air Ops', approved_by: 'Network Ops', bandwidth_khz: 41.667 },
  { id: 'resv-003', resource_id: 'res-mobile-command-center', link_id: null, asset_ids: ['asset-005', 'asset-006'], start: '2026-02-10T14:00:00Z', end: '2026-02-10T18:00:00Z', status: 'approved', priority: 'priority', mission: 'Temporary command bubble for field teams', requested_by: 'Field Ops', approved_by: 'Operations', bandwidth_khz: 25000 },
  { id: 'resv-004', resource_id: 'res-wgs-x2', link_id: 'link-011', asset_ids: ['asset-009', 'asset-010'], start: '2026-02-10T10:00:00Z', end: '2026-02-10T22:00:00Z', status: 'requested', priority: 'routine', mission: 'UAV control restoration', requested_by: 'Air Ops', approved_by: null, bandwidth_khz: 18000 },
  { id: 'resv-005', resource_id: 'res-wgs-x2', link_id: null, asset_ids: ['asset-008'], start: '2026-02-10T12:00:00Z', end: '2026-02-10T15:00:00Z', status: 'requested', priority: 'emergency', mission: 'Emergency ISR backhaul', requested_by: 'SOC', approved_by: null, bandwidth_khz: 18000 }
];

/** @type {import('./stores.js').UsageRecord[]} */
export const seedUsageRecords = [
  { id: 'usage-001', resource_id: 'res-muos-t3k', link_id: 'link-001', asset_id: 'asset-005', start: '2026-02-10T06:00:00Z', end: '2026-02-10T14:30:00Z', minutes_used: 510, data_mb: 3200, cost_estimate: 0, quality_summary: 'Nominal Ku SATCOM' },
  { id: 'usage-002', resource_id: 'res-iridium-lband', link_id: 'link-004', asset_id: 'asset-008', start: '2026-02-10T14:00:00Z', end: '2026-02-10T14:47:00Z', minutes_used: 47, data_mb: 120, cost_estimate: 94, quality_summary: 'Metered fallback voice/data' },
  { id: 'usage-003', resource_id: 'res-hf-net', link_id: 'link-002', asset_id: 'asset-006', start: '2026-02-10T00:00:00Z', end: '2026-02-10T14:30:00Z', minutes_used: 870, data_mb: 6, cost_estimate: 0, quality_summary: 'Owned HF net' },
  { id: 'usage-004', resource_id: 'res-mobile-command-center', link_id: null, asset_id: 'asset-005', start: '2026-02-10T14:00:00Z', end: '2026-02-10T15:00:00Z', minutes_used: 60, data_mb: 900, cost_estimate: 0, quality_summary: 'Reserved MCC coverage bubble' },
  { id: 'usage-005', resource_id: 'res-ip-voice', link_id: 'link-007', asset_id: 'asset-001', start: '2026-02-10T00:00:00Z', end: '2026-02-10T14:30:00Z', minutes_used: 870, data_mb: 450, cost_estimate: 0, quality_summary: 'Enterprise VoIP subscription' },
  { id: 'usage-006', resource_id: 'res-o3b-ka7', link_id: 'link-006', asset_id: 'asset-008', start: '2026-02-10T04:00:00Z', end: '2026-02-10T14:00:00Z', minutes_used: 600, data_mb: 8700, cost_estimate: 24, quality_summary: 'Hybrid MEO relay, nearing included data cap' }
];
