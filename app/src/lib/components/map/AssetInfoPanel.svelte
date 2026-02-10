<script>
  import { assets, commLinks, assetMap } from '$lib/data/stores.js';

  /** @type {{ assetId: string, onclose: () => void }} */
  let { assetId, onclose } = $props();

  let allAssets = $state([]);
  let allLinks = $state([]);
  let lookup = $state(new Map());

  assets.subscribe(v => allAssets = v);
  commLinks.subscribe(v => allLinks = v);
  assetMap.subscribe(v => lookup = v);

  let asset = $derived(allAssets.find(a => a.id === assetId));
  let assetLinks = $derived(
    asset ? allLinks.filter(l => l.endpoints.includes(asset.id)) : []
  );

  const LINK_COLORS = {
    satellite: '#00bcd4',
    los_radio: '#4caf50',
    voip: '#ff9800',
    xmpp: '#9c27b0'
  };

  function getEndpointName(linkEndpoints, currentId) {
    const otherId = linkEndpoints.find(id => id !== currentId);
    return otherId ? (lookup.get(otherId)?.name || otherId) : 'Unknown';
  }
</script>

{#if asset}
<div class="panel">
  <div class="panel-header">
    <h3 class="panel-title">{asset.name}</h3>
    <button class="panel-close" onclick={onclose}>&times;</button>
  </div>

  <div class="info-grid">
    <div class="info-row">
      <span class="info-label">Callsign</span>
      <span class="info-value font-mono">{asset.callsign}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Platform</span>
      <span class="badge badge-{asset.platform}">{asset.platform}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Status</span>
      <span class="badge badge-{asset.status}">{asset.status}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Position</span>
      <span class="info-value font-mono">{asset.position.lat.toFixed(4)}, {asset.position.lon.toFixed(4)}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Altitude</span>
      <span class="info-value">{asset.position.alt_m}m</span>
    </div>
    {#if asset.position.heading_deg}
    <div class="info-row">
      <span class="info-label">Heading</span>
      <span class="info-value">{asset.position.heading_deg}&deg;</span>
    </div>
    {/if}
    {#if asset.position.speed_kts}
    <div class="info-row">
      <span class="info-label">Speed</span>
      <span class="info-value">{asset.position.speed_kts} kts</span>
    </div>
    {/if}
    {#if asset.metadata?.department}
    <div class="info-row">
      <span class="info-label">Department</span>
      <span class="info-value">{asset.metadata.department}</span>
    </div>
    {/if}
  </div>

  {#if asset.metadata?.notes}
  <div class="notes-section">
    <div class="info-label">Notes</div>
    <p class="text-sm text-secondary">{asset.metadata.notes}</p>
  </div>
  {/if}

  <div class="links-section">
    <h4 class="section-title">Communication Links ({assetLinks.length})</h4>
    {#each assetLinks as link}
      <div class="link-card" style="border-left: 3px solid {LINK_COLORS[link.type] || '#888'}">
        <div class="link-header">
          <span class="link-name">{link.name}</span>
          <span class="badge badge-{link.status}">{link.status}</span>
        </div>
        <div class="link-details">
          <span class="badge badge-{link.type}">{link.type}{link.subtype ? ` (${link.subtype})` : ''}</span>
          <span class="text-xs text-muted">→ {getEndpointName(link.endpoints, asset.id)}</span>
        </div>
        {#if link.frequency.value_mhz}
        <div class="link-freq text-xs font-mono text-secondary">
          {link.frequency.value_mhz} MHz {link.frequency.modulation ? `/ ${link.frequency.modulation}` : ''}
        </div>
        {/if}
        {#if link.quality.latency_ms !== null}
        <div class="link-quality text-xs text-muted">
          Latency: {link.quality.latency_ms}ms
          {link.quality.signal_strength_dbm !== null ? ` | Signal: ${link.quality.signal_strength_dbm} dBm` : ''}
        </div>
        {/if}
      </div>
    {/each}
  </div>
</div>
{/if}

<style>
  .panel {
    width: 360px;
    background: var(--bg-secondary);
    border-left: 1px solid var(--color-border);
    overflow-y: auto;
    padding: var(--space-md);
    z-index: 500;
    height: 100%;
  }

  .info-grid {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    margin-bottom: var(--space-md);
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .info-label {
    font-size: var(--text-xs);
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
  }

  .info-value {
    font-size: var(--text-sm);
    color: var(--text-primary);
  }

  .notes-section {
    margin-bottom: var(--space-md);
    padding: var(--space-sm);
    background: var(--bg-tertiary);
    border-radius: var(--radius-md);
  }

  .links-section {
    margin-top: var(--space-md);
  }

  .section-title {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: var(--space-sm);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .link-card {
    background: var(--bg-tertiary);
    border-radius: var(--radius-md);
    padding: var(--space-sm) var(--space-md);
    margin-bottom: var(--space-sm);
    transition: background var(--transition-fast);
  }

  .link-card:hover {
    background: var(--bg-hover);
  }

  .link-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-xs);
  }

  .link-name {
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--text-primary);
  }

  .link-details {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    margin-bottom: var(--space-xs);
  }

  .link-freq, .link-quality {
    margin-top: var(--space-xs);
  }
</style>
