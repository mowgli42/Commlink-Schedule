<script>
  import { onMount } from 'svelte';
  import {
    filteredAssets, filteredLinks, assetMap,
    selectedAssetId, selectedLinkId,
    visibleLinkTypes, visiblePlatforms,
    toggleLinkType, togglePlatform
  } from '$lib/data/stores.js';
  import AssetInfoPanel from './AssetInfoPanel.svelte';

  let mapContainer;
  let map;
  let markersLayer;
  let linesLayer;
  let L;

  let showPanel = $state(false);
  let panelAssetId = $state(null);

  // Subscribe to stores
  let assets = $state([]);
  let links = $state([]);
  let assetLookup = $state(new Map());
  let linkTypes = $state(new Set(['satellite', 'los_radio', 'voip', 'xmpp']));
  let platforms = $state(new Set(['site', 'mobile', 'aircraft']));

  filteredAssets.subscribe(v => assets = v);
  filteredLinks.subscribe(v => links = v);
  assetMap.subscribe(v => assetLookup = v);
  visibleLinkTypes.subscribe(v => linkTypes = v);
  visiblePlatforms.subscribe(v => platforms = v);

  const LINK_COLORS = {
    satellite: '#00bcd4',
    los_radio: '#4caf50',
    voip: '#ff9800',
    xmpp: '#9c27b0'
  };

  const STATUS_DASH = {
    active: null,
    degraded: '10 6',
    unavailable: '4 8',
    scheduled: '2 8'
  };

  function getAssetIcon(platform) {
    const svgs = {
      site: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#42a5f5" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01M8 14h.01M16 14h.01M12 14h.01"/></svg>`,
      mobile: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#66bb6a" stroke-width="2"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h2a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="13.5" cy="18.5" r="2.5"/></svg>`,
      aircraft: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffa726" stroke-width="2"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>`
    };
    return svgs[platform] || svgs.site;
  }

  function renderMap() {
    if (!map || !L || !markersLayer || !linesLayer) return;

    markersLayer.clearLayers();
    linesLayer.clearLayers();

    // Draw comm link lines
    for (const link of links) {
      const endpointAssets = link.endpoints
        .map(id => assetLookup.get(id))
        .filter(Boolean);

      if (endpointAssets.length < 2) continue;

      const latlngs = endpointAssets.map(a => [a.position.lat, a.position.lon]);
      const color = LINK_COLORS[link.type] || '#888';
      const dashArray = STATUS_DASH[link.status] || null;
      const weight = link.status === 'active' ? 3 : 2;
      const opacity = link.status === 'unavailable' ? 0.4 : 0.8;

      const polyline = L.polyline(latlngs, {
        color: link.status === 'unavailable' ? '#f85149' : color,
        weight,
        dashArray,
        opacity
      });

      polyline.bindTooltip(`
        <div style="font-size:12px">
          <strong>${link.name}</strong><br/>
          Type: ${link.type}${link.subtype ? ' (' + link.subtype + ')' : ''}<br/>
          Status: ${link.status}<br/>
          ${link.frequency.value_mhz ? 'Freq: ' + link.frequency.value_mhz + ' MHz' : ''}
        </div>
      `, { sticky: true });

      polyline.on('click', () => {
        selectedLinkId.set(link.id);
      });

      linesLayer.addLayer(polyline);
    }

    // Draw asset markers
    for (const asset of assets) {
      const icon = L.divIcon({
        html: `<div style="display:flex;flex-direction:column;align-items:center;transform:translate(-16px,-16px)">
          ${getAssetIcon(asset.platform)}
          <span style="font-size:10px;color:#e6edf3;background:rgba(13,17,23,0.85);padding:1px 4px;border-radius:3px;margin-top:2px;white-space:nowrap">${asset.callsign}</span>
        </div>`,
        className: 'asset-marker',
        iconSize: [32, 48],
        iconAnchor: [16, 24]
      });

      const marker = L.marker([asset.position.lat, asset.position.lon], { icon });

      marker.bindTooltip(`
        <div style="font-size:12px">
          <strong>${asset.name}</strong> (${asset.callsign})<br/>
          Platform: ${asset.platform}<br/>
          Status: <span style="color:${asset.status === 'active' ? '#3fb950' : asset.status === 'maintenance' ? '#d29922' : '#f85149'}">${asset.status}</span><br/>
          Alt: ${asset.position.alt_m}m | Hdg: ${asset.position.heading_deg}&deg;
        </div>
      `);

      marker.on('click', () => {
        panelAssetId = asset.id;
        selectedAssetId.set(asset.id);
        showPanel = true;
      });

      markersLayer.addLayer(marker);
    }
  }

  onMount(async () => {
    L = (await import('leaflet')).default;

    map = L.map(mapContainer, {
      zoomControl: true,
      attributionControl: true
    }).setView([34.05, -118.25], 11);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19
    }).addTo(map);

    markersLayer = L.layerGroup().addTo(map);
    linesLayer = L.layerGroup().addTo(map);

    renderMap();

    // Re-render when data changes
    filteredAssets.subscribe(() => renderMap());
    filteredLinks.subscribe(() => renderMap());

    return () => {
      if (map) map.remove();
    };
  });

  function closePanel() {
    showPanel = false;
    panelAssetId = null;
    selectedAssetId.set(null);
  }

  const allLinkTypes = ['satellite', 'los_radio', 'voip', 'xmpp'];
  const allPlatforms = ['site', 'mobile', 'aircraft'];
  const linkTypeLabels = { satellite: 'Satellite', los_radio: 'LOS Radio', voip: 'VoIP', xmpp: 'XMPP' };
  const platformLabels = { site: 'Site', mobile: 'Mobile', aircraft: 'Aircraft' };
</script>

<div class="map-wrapper">
  <!-- Map Controls Overlay -->
  <div class="map-controls">
    <div class="control-section">
      <div class="control-label">Link Types</div>
      <div class="chip-group">
        {#each allLinkTypes as lt}
          <button
            class="chip"
            class:selected={linkTypes.has(lt)}
            onclick={() => toggleLinkType(lt)}
            style="--chip-color: {LINK_COLORS[lt]}"
          >
            <span class="chip-dot" style="background:{LINK_COLORS[lt]}"></span>
            {linkTypeLabels[lt]}
          </button>
        {/each}
      </div>
    </div>
    <div class="control-section">
      <div class="control-label">Platforms</div>
      <div class="chip-group">
        {#each allPlatforms as p}
          <button
            class="chip"
            class:selected={platforms.has(p)}
            onclick={() => togglePlatform(p)}
          >
            {platformLabels[p]}
          </button>
        {/each}
      </div>
    </div>
  </div>

  <!-- Leaflet Map -->
  <div bind:this={mapContainer} class="map-container"></div>

  <!-- Asset Detail Panel -->
  {#if showPanel && panelAssetId}
    <AssetInfoPanel assetId={panelAssetId} onclose={closePanel} />
  {/if}
</div>

<style>
  .map-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
  }

  .map-container {
    flex: 1;
    min-height: 400px;
    z-index: 1;
  }

  .map-controls {
    position: absolute;
    top: var(--space-md);
    left: var(--space-md);
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    background: rgba(22, 27, 34, 0.92);
    backdrop-filter: blur(8px);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-md);
  }

  .control-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .control-label {
    font-size: var(--text-xs);
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
  }

  .chip-group {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-xs);
  }

  .chip-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  :global(.asset-marker) {
    background: none !important;
    border: none !important;
  }

  :global(.leaflet-tooltip) {
    background: rgba(22, 27, 34, 0.95) !important;
    border: 1px solid var(--color-border) !important;
    color: var(--text-primary) !important;
    border-radius: var(--radius-md) !important;
    padding: 8px 12px !important;
    box-shadow: var(--shadow-md) !important;
  }

  :global(.leaflet-tooltip-top::before) {
    border-top-color: rgba(22, 27, 34, 0.95) !important;
  }

  :global(.leaflet-tooltip-bottom::before) {
    border-bottom-color: rgba(22, 27, 34, 0.95) !important;
  }
</style>
