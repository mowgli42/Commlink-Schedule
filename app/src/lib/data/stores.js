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
 * @typedef {{ id: string, name: string, type: 'satellite'|'los_radio'|'voip'|'xmpp', subtype: string|null, status: 'active'|'degraded'|'unavailable'|'scheduled', endpoints: string[], frequency: FrequencyInfo, satellite: SatelliteInfo|null, schedule: Schedule|null, quality: LinkQuality }} CommLink
 * @typedef {{ id: string, frequency_mhz: number, bandwidth_khz: number, designation: string, band: string, assigned_to: string[], link_ids: string[], classification: string, notes: string }} Frequency
 * @typedef {{ id: string, band: string, bandwidth_mhz: number, allocated_to: string[] }} Transponder
 * @typedef {{ id: string, name: string, norad_id: number, orbit_type: 'GEO'|'MEO'|'LEO', position_deg_w: number|null, provider: string, status: string, transponders: Transponder[] }} Satellite
 */

import { writable, derived, get } from 'svelte/store';
import { seedAssets, seedCommLinks, seedSatellites, seedFrequencies } from './seed.js';
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

// Wire up persistence (browser-only; safe to call at module level in SPA mode)
if (typeof window !== 'undefined') {
  persistStore(assets, 'assets', seedAssets);
  persistStore(commLinks, 'commLinks', seedCommLinks);
  persistStore(satellites, 'satellites', seedSatellites);
  persistStore(frequencies, 'frequencies', seedFrequencies);
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

/** Reset all stores to seed data and clear localStorage. */
export function resetToSeedData() {
  assets.set(seedAssets);
  commLinks.set(seedCommLinks);
  satellites.set(seedSatellites);
  frequencies.set(seedFrequencies);
}
