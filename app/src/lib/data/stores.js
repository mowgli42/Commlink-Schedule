/**
 * Reactive Svelte stores for the Geographical Comms Tracking system.
 * Includes localStorage persistence and derived helpers.
 *
 * @typedef {{ lat: number, lon: number, alt_m: number, heading_deg: number, speed_kts: number, timestamp: string }} Position
 * @typedef {{ department?: string, notes?: string }} AssetMetadata
 * @typedef {{ id: string, name: string, callsign: string, platform: 'site'|'mobile'|'aircraft', position: Position, status: 'active'|'inactive'|'maintenance', commlinks: string[], addressbook_ref: string, icon: string, metadata: AssetMetadata }} Asset
 * @typedef {{ value_mhz: number|null, bandwidth_khz: number|null, polarization: string|null, modulation: string|null }} FrequencyInfo
 * @typedef {{ name: string, orbit: string, position_deg_w: number|null, transponder: string, provider: string }} SatelliteInfo
 * @typedef {{ start: string, end: string, recurrence: string }} Schedule
 * @typedef {{ signal_strength_dbm: number|null, ber: number|null, latency_ms: number|null }} LinkQuality
 * @typedef {{ id: string, name: string, type: 'satellite'|'los_radio'|'voip'|'xmpp', subtype: string|null, status: 'active'|'degraded'|'unavailable'|'scheduled', endpoints: string[], frequency: FrequencyInfo, satellite: SatelliteInfo|null, schedule: Schedule|null, quality: LinkQuality, resource_id?: string|null, contract_id?: string|null }} CommLink
 * @typedef {{ id: string, frequency_mhz: number, bandwidth_khz: number, designation: string, band: string, assigned_to: string[], link_ids: string[], classification: string, notes: string }} Frequency
 * @typedef {{ id: string, band: string, bandwidth_mhz: number, allocated_to: string[] }} Transponder
 * @typedef {{ id: string, name: string, norad_id: number, orbit_type: 'GEO'|'MEO'|'LEO', position_deg_w: number|null, provider: string, status: string, transponders: Transponder[] }} Satellite
 * @typedef {{ bandwidth_khz?: number|null, channels?: number|null, max_concurrent_links?: number|null, coverage_area?: string|null }} ResourceCapacity
 * @typedef {{ start: string, end: string, recurrence?: 'none'|'daily'|'weekly' }} AvailabilityWindow
 * @typedef {{ id: string, kind: 'satellite_transponder'|'mobile_command_center'|'radio_net'|'ip_service', name: string, owner: string, provider: string, status: 'operational'|'maintenance'|'offline', capacity: ResourceCapacity, availability_windows: AvailabilityWindow[], asset_id?: string|null, link_ids: string[] }} Resource
 * @typedef {{ id: string, resource_id: string, billing_model: 'subscription'|'owned'|'pay_per_minute'|'pay_per_mb'|'reservation'|'hybrid', label: string, included_minutes?: number|null, included_data_mb?: number|null, overage_rate?: number|null, currency?: string|null, priority_class?: string|null }} Contract
 * @typedef {{ id: string, resource_id: string, link_id: string|null, asset_ids: string[], start: string, end: string, status: 'requested'|'approved'|'active'|'completed'|'denied'|'conflicted', priority: 'routine'|'priority'|'emergency', mission: string, requested_by: string, approved_by?: string|null, bandwidth_khz?: number|null }} Reservation
 * @typedef {{ id: string, resource_id: string, link_id: string|null, asset_id: string|null, start: string, end: string, minutes_used: number, data_mb: number, cost_estimate: number, quality_summary: string }} UsageRecord
 */

import { writable, derived, get } from 'svelte/store';
import {
  seedAssets,
  seedCommLinks,
  seedSatellites,
  seedFrequencies,
  seedResources,
  seedContracts,
  seedReservations,
  seedUsageRecords
} from './seed.js';
import { persistStore } from '$lib/utils/persist.js';

// Re-export get() so components can read stores without subscribing
export { get } from 'svelte/store';

// ─── Primary stores (persisted to localStorage) ────────

/** @type {import('svelte/store').Writable<Asset[]>} */
export const assets = writable(seedAssets);

/** @type {import('svelte/store').Writable<CommLink[]>} */
export const commLinks = writable(seedCommLinks);

/** @type {import('svelte/store').Writable<Satellite[]>} */
export const satellites = writable(seedSatellites);

/** @type {import('svelte/store').Writable<Frequency[]>} */
export const frequencies = writable(seedFrequencies);

/** @type {import('svelte/store').Writable<Resource[]>} */
export const resources = writable(seedResources);

/** @type {import('svelte/store').Writable<Contract[]>} */
export const contracts = writable(seedContracts);

/** @type {import('svelte/store').Writable<Reservation[]>} */
export const reservations = writable(seedReservations);

/** @type {import('svelte/store').Writable<UsageRecord[]>} */
export const usageRecords = writable(seedUsageRecords);

// Wire up persistence (browser-only; safe to call at module level in SPA mode)
if (typeof window !== 'undefined') {
  persistStore(assets, 'assets', seedAssets);
  persistStore(commLinks, 'commLinks', seedCommLinks);
  persistStore(satellites, 'satellites', seedSatellites);
  persistStore(frequencies, 'frequencies', seedFrequencies);
  persistStore(resources, 'resources', seedResources);
  persistStore(contracts, 'contracts', seedContracts);
  persistStore(reservations, 'reservations', seedReservations);
  persistStore(usageRecords, 'usageRecords', seedUsageRecords);
  hydrateLinkEntitlements();
}

// ─── UI state stores ───────────────────────────────────

/** @type {import('svelte/store').Writable<string|null>} */
export const selectedAssetId = writable(null);

/** @type {import('svelte/store').Writable<string|null>} */
export const selectedLinkId = writable(null);

/** @type {import('svelte/store').Writable<Set<string>>} */
export const visibleLinkTypes = writable(new Set(['satellite', 'los_radio', 'voip', 'xmpp']));

/** @type {import('svelte/store').Writable<Set<string>>} */
export const visiblePlatforms = writable(new Set(['site', 'mobile', 'aircraft']));

/** @type {import('svelte/store').Writable<string>} */
export const currentView = writable('map');

/** @type {import('svelte/store').Writable<string>} */
export const searchQuery = writable('');

// ─── Derived stores ────────────────────────────────────

/** Selected asset object */
export const selectedAsset = derived(
  [assets, selectedAssetId],
  ([$assets, $id]) => $id ? $assets.find(a => a.id === $id) ?? null : null
);

/** Selected link object */
export const selectedLink = derived(
  [commLinks, selectedLinkId],
  ([$links, $id]) => $id ? $links.find(l => l.id === $id) ?? null : null
);

/** Assets filtered by visible platforms */
export const filteredAssets = derived(
  [assets, visiblePlatforms],
  ([$assets, $platforms]) => $assets.filter(a => $platforms.has(a.platform))
);

/** Links filtered by visible types AND whose endpoints both exist in the asset list */
export const filteredLinks = derived(
  [commLinks, visibleLinkTypes, assets],
  ([$links, $types, $assets]) => {
    const ids = new Set($assets.map(a => a.id));
    return $links.filter(l =>
      $types.has(l.type) &&
      l.endpoints.every(ep => ids.has(ep))
    );
  }
);

/** Asset lookup map (id -> asset) */
export const assetMap = derived(
  assets,
  ($assets) => new Map($assets.map(a => [a.id, a]))
);

/** Link lookup map (id -> link) */
export const linkMap = derived(
  commLinks,
  ($links) => new Map($links.map(l => [l.id, l]))
);

/** Resource lookup map (id -> resource) */
export const resourceMap = derived(
  resources,
  ($resources) => new Map($resources.map(r => [r.id, r]))
);

/** Contract lookup map (resource id -> contract) */
export const contractByResource = derived(
  contracts,
  ($contracts) => new Map($contracts.map(c => [c.resource_id, c]))
);

/** Reservation conflict summary by resource id. */
export const reservationConflicts = derived(
  [resources, reservations],
  ([$resources, $reservations]) => detectReservationConflicts($resources, $reservations)
);

/** Utilization by scarce resource. */
export const resourceUtilization = derived(
  [resources, contracts, reservations, usageRecords],
  ([$resources, $contracts, $reservations, $usage]) =>
    calculateResourceUtilization($resources, $contracts, $reservations, $usage)
);

/** Utilization by asset consumer. */
export const assetUtilization = derived(
  [assets, usageRecords],
  ([$assets, $usage]) => calculateAssetUtilization($assets, $usage)
);

/** Utilization by comm link. */
export const linkUtilization = derived(
  [commLinks, usageRecords],
  ([$links, $usage]) => calculateLinkUtilization($links, $usage)
);

/** Stats summary */
export const stats = derived(
  [assets, commLinks],
  ([$assets, $links]) => ({
    totalAssets: $assets.length,
    activeAssets: $assets.filter(a => a.status === 'active').length,
    totalLinks: $links.length,
    activeLinks: $links.filter(l => l.status === 'active').length,
    degradedLinks: $links.filter(l => l.status === 'degraded').length,
    unavailableLinks: $links.filter(l => l.status === 'unavailable').length,
    byPlatform: {
      site: $assets.filter(a => a.platform === 'site').length,
      mobile: $assets.filter(a => a.platform === 'mobile').length,
      aircraft: $assets.filter(a => a.platform === 'aircraft').length,
    },
    byLinkType: {
      satellite: $links.filter(l => l.type === 'satellite').length,
      los_radio: $links.filter(l => l.type === 'los_radio').length,
      voip: $links.filter(l => l.type === 'voip').length,
      xmpp: $links.filter(l => l.type === 'xmpp').length,
    }
  })
);

/**
 * @param {Resource[]} resourceList
 * @param {Reservation[]} reservationList
 */
function detectReservationConflicts(resourceList, reservationList) {
  return resourceList.map(resource => {
    const activeReservations = reservationList
      .filter(r => r.resource_id === resource.id && !['denied', 'completed'].includes(r.status))
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    const capacity = resource.capacity.max_concurrent_links ?? 1;
    const conflicts = [];
    for (let i = 0; i < activeReservations.length; i++) {
      const overlapping = activeReservations.filter(other =>
        other.id !== activeReservations[i].id &&
        new Date(other.start).getTime() < new Date(activeReservations[i].end).getTime() &&
        new Date(other.end).getTime() > new Date(activeReservations[i].start).getTime()
      );
      if (overlapping.length + 1 > capacity) {
        conflicts.push({ reservation: activeReservations[i], overlapping });
      }
    }
    return { resource_id: resource.id, capacity, conflicts };
  }).filter(row => row.conflicts.length > 0);
}

/**
 * @param {Resource[]} resourceList
 * @param {Contract[]} contractList
 * @param {Reservation[]} reservationList
 * @param {UsageRecord[]} usageList
 */
function calculateResourceUtilization(resourceList, contractList, reservationList, usageList) {
  const contractsByResource = new Map(contractList.map(c => [c.resource_id, c]));
  return resourceList.map(resource => {
    const contract = contractsByResource.get(resource.id) ?? null;
    const resourceReservations = reservationList.filter(r => r.resource_id === resource.id && r.status !== 'denied');
    const resourceUsage = usageList.filter(u => u.resource_id === resource.id);
    const reservedMinutes = resourceReservations.reduce((sum, r) => sum + minutesBetween(r.start, r.end), 0);
    const usedMinutes = resourceUsage.reduce((sum, u) => sum + (u.minutes_used || minutesBetween(u.start, u.end)), 0);
    const dataMb = resourceUsage.reduce((sum, u) => sum + (u.data_mb || 0), 0);
    const cost = resourceUsage.reduce((sum, u) => sum + (u.cost_estimate || 0), 0);
    return {
      resource,
      contract,
      reserved_minutes: Math.round(reservedMinutes),
      used_minutes: Math.round(usedMinutes),
      data_mb: Math.round(dataMb * 10) / 10,
      cost_estimate: Math.round(cost * 100) / 100,
      utilization_percent: reservedMinutes > 0 ? Math.round((usedMinutes / reservedMinutes) * 1000) / 10 : 0,
      remaining_included_minutes: contract?.included_minutes ? Math.max(0, Math.round(contract.included_minutes - usedMinutes)) : null,
      active_reservations: resourceReservations.filter(r => ['approved', 'active', 'requested'].includes(r.status)).length
    };
  });
}

/**
 * @param {Asset[]} assetList
 * @param {UsageRecord[]} usageList
 */
function calculateAssetUtilization(assetList, usageList) {
  return assetList.map(asset => {
    const rows = usageList.filter(u => u.asset_id === asset.id);
    return {
      asset,
      used_minutes: Math.round(rows.reduce((sum, u) => sum + (u.minutes_used || minutesBetween(u.start, u.end)), 0)),
      data_mb: Math.round(rows.reduce((sum, u) => sum + (u.data_mb || 0), 0) * 10) / 10,
      cost_estimate: Math.round(rows.reduce((sum, u) => sum + (u.cost_estimate || 0), 0) * 100) / 100,
      link_count: new Set(rows.map(u => u.link_id).filter(Boolean)).size
    };
  }).filter(row => row.used_minutes > 0 || row.data_mb > 0 || row.cost_estimate > 0);
}

/**
 * @param {CommLink[]} linkList
 * @param {UsageRecord[]} usageList
 */
function calculateLinkUtilization(linkList, usageList) {
  return linkList.map(link => {
    const rows = usageList.filter(u => u.link_id === link.id);
    return {
      link,
      used_minutes: Math.round(rows.reduce((sum, u) => sum + (u.minutes_used || minutesBetween(u.start, u.end)), 0)),
      data_mb: Math.round(rows.reduce((sum, u) => sum + (u.data_mb || 0), 0) * 10) / 10,
      cost_estimate: Math.round(rows.reduce((sum, u) => sum + (u.cost_estimate || 0), 0) * 100) / 100
    };
  });
}

function minutesBetween(start, end) {
  const diff = new Date(end).getTime() - new Date(start).getTime();
  return Number.isFinite(diff) && diff > 0 ? diff / 60000 : 0;
}

// ─── Actions ───────────────────────────────────────────

/** Add or update an asset. */
export function upsertAsset(asset) {
  assets.update(list => {
    const idx = list.findIndex(a => a.id === asset.id);
    if (idx >= 0) {
      list[idx] = asset;
      return [...list];
    }
    return [...list, asset];
  });
}

/** Remove an asset by ID and clean up any links referencing it. */
export function removeAsset(id) {
  assets.update(list => list.filter(a => a.id !== id));
  // Remove links that referenced this asset
  commLinks.update(list => list.filter(l => !l.endpoints.includes(id)));
}

/** Add or update a comm link. Also patches endpoint assets' commlinks arrays. */
export function upsertCommLink(link) {
  commLinks.update(list => {
    const idx = list.findIndex(l => l.id === link.id);
    if (idx >= 0) {
      list[idx] = link;
      return [...list];
    }
    return [...list, link];
  });
  // Ensure endpoint assets reference this link
  assets.update(list => list.map(a => {
    if (link.endpoints.includes(a.id) && !a.commlinks.includes(link.id)) {
      return { ...a, commlinks: [...a.commlinks, link.id] };
    }
    return a;
  }));
}

/** Remove a comm link by ID and clean up asset references. */
export function removeCommLink(id) {
  commLinks.update(list => list.filter(l => l.id !== id));
  assets.update(list => list.map(a => ({
    ...a,
    commlinks: a.commlinks.filter(lid => lid !== id)
  })));
}

/** Toggle a link type visibility. */
export function toggleLinkType(type) {
  visibleLinkTypes.update(set => {
    const next = new Set(set);
    if (next.has(type)) next.delete(type);
    else next.add(type);
    return next;
  });
}

/** Toggle a platform visibility. */
export function togglePlatform(platform) {
  visiblePlatforms.update(set => {
    const next = new Set(set);
    if (next.has(platform)) next.delete(platform);
    else next.add(platform);
    return next;
  });
}

/**
 * Import a parsed Directory document into planning stores.
 * @param {ReturnType<import('../utils/xml.js').parseDirectoryXML>} doc
 * @param {{ replace?: boolean }} [options]
 */
export function importDirectoryDocument(doc, options = {}) {
  const replace = options.replace ?? true;

  if (replace) {
    assets.set(doc.assets);
    commLinks.set(doc.commLinks);
    resources.set(doc.resources);
    contracts.set(doc.contracts);
    reservations.set(doc.reservations);
  } else {
    mergeById(assets, doc.assets);
    mergeById(commLinks, doc.commLinks);
    mergeById(resources, doc.resources);
    mergeById(contracts, doc.contracts);
    mergeById(reservations, doc.reservations);
  }

  syncAssetCommlinks();
  syncResourceLinkIds();
}

/** @param {import('svelte/store').Writable<any[]>} store @param {any[]} incoming */
function mergeById(store, incoming) {
  store.update((list) => {
    const map = new Map(list.map((item) => [item.id, item]));
    for (const item of incoming) map.set(item.id, item);
    return [...map.values()];
  });
}

function syncAssetCommlinks() {
  const linkList = get(commLinks);
  assets.update((list) =>
    list.map((asset) => ({
      ...asset,
      commlinks: linkList.filter((l) => l.endpoints.includes(asset.id)).map((l) => l.id),
    }))
  );
}

function syncResourceLinkIds() {
  const linkList = get(commLinks);
  resources.update((list) =>
    list.map((resource) => ({
      ...resource,
      link_ids: linkList.filter((l) => l.resource_id === resource.id).map((l) => l.id),
    }))
  );
}

/** Snapshot current planning data for Directory export. */
export function snapshotDirectoryDocument() {
  return {
    assets: get(assets),
    commLinks: get(commLinks),
    resources: get(resources),
    contracts: get(contracts),
    reservations: get(reservations),
  };
}

/** Reset all stores to seed data and clear localStorage. */
export function resetToSeedData() {
  assets.set(seedAssets);
  commLinks.set(seedCommLinks);
  satellites.set(seedSatellites);
  frequencies.set(seedFrequencies);
  resources.set(seedResources);
  contracts.set(seedContracts);
  reservations.set(seedReservations);
  usageRecords.set(seedUsageRecords);
}

/** Backfill resource/contract fields for users with pre-scheduling localStorage data. */
function hydrateLinkEntitlements() {
  const seedById = new Map(seedCommLinks.map(link => [link.id, link]));
  commLinks.update(list => list.map(link => {
    const seed = seedById.get(link.id);
    if (!seed) return link;
    return {
      ...link,
      resource_id: link.resource_id ?? seed.resource_id ?? null,
      contract_id: link.contract_id ?? seed.contract_id ?? null
    };
  }));
}
