<script>
  import { get } from 'svelte/store';
  import { commLinks, assetMap, resourceMap, contractByResource, reservations, usageRecords, removeCommLink } from '$lib/data/stores.js';
  import { toast } from '$lib/utils/toast.js';
  import { onDestroy } from 'svelte';

  /** @type {{ linkId: string, onclose: () => void, onedit: (link: any) => void }} */
  let { linkId, onclose, onedit } = $props();

  let allLinks = $state(get(commLinks));
  let lookup = $state(get(assetMap));
  let resourcesLookup = $state(get(resourceMap));
  let contractsLookup = $state(get(contractByResource));
  let allReservations = $state(get(reservations));
  let allUsage = $state(get(usageRecords));
  const unsub1 = commLinks.subscribe(v => allLinks = v);
  const unsub2 = assetMap.subscribe(v => lookup = v);
  const unsub3 = resourceMap.subscribe(v => resourcesLookup = v);
  const unsub4 = contractByResource.subscribe(v => contractsLookup = v);
  const unsub5 = reservations.subscribe(v => allReservations = v);
  const unsub6 = usageRecords.subscribe(v => allUsage = v);
  onDestroy(() => { unsub1(); unsub2(); unsub3(); unsub4(); unsub5(); unsub6(); });

  let link = $derived(allLinks.find(l => l.id === linkId));
  let resource = $derived(link?.resource_id ? resourcesLookup.get(link.resource_id) : null);
  let contract = $derived(link?.resource_id ? contractsLookup.get(link.resource_id) : null);
  let linkReservations = $derived(link ? allReservations.filter(r => r.link_id === link.id || r.resource_id === link.resource_id) : []);
  let linkUsage = $derived(link ? allUsage.filter(u => u.link_id === link.id || u.resource_id === link.resource_id) : []);
  let usedMinutes = $derived(linkUsage.reduce((sum, row) => sum + row.minutes_used, 0));
  let dataMb = $derived(Math.round(linkUsage.reduce((sum, row) => sum + row.data_mb, 0) * 10) / 10);
  let estimatedCost = $derived(Math.round(linkUsage.reduce((sum, row) => sum + row.cost_estimate, 0) * 100) / 100);

  const LINK_COLORS = {
    satellite: '#00bcd4',
    los_radio: '#4caf50',
    voip: '#ff9800',
    xmpp: '#9c27b0'
  };

  function endpointName(id) {
    return lookup.get(id)?.name || id;
  }

  function endpointCallsign(id) {
    return lookup.get(id)?.callsign || '';
  }

  function handleDelete() {
    if (!link) return;
    if (confirm(`Delete link "${link.name}"?`)) {
      removeCommLink(link.id);
      toast(`Deleted: ${link.name}`, 'info');
      onclose();
    }
  }
</script>

{#if link}
<div class="panel" style="border-left: 3px solid {LINK_COLORS[link.type] || '#888'}">
  <div class="panel-header">
    <h3 class="panel-title">{link.name}</h3>
    <button class="panel-close" onclick={onclose}>&times;</button>
  </div>

  <div class="info-grid">
    <div class="info-row">
      <span class="info-label">Type</span>
      <span class="badge badge-{link.type}">{link.type}{link.subtype ? ` (${link.subtype})` : ''}</span>
    </div>
    <div class="info-row">
      <span class="info-label">Status</span>
      <span class="badge badge-{link.status}">{link.status}</span>
    </div>
    {#if contract}
    <div class="info-row">
      <span class="info-label">Billing</span>
      <span class="badge badge-billing">{contract.label}</span>
    </div>
    {/if}
  </div>

  <!-- Resource / entitlement -->
  {#if resource || contract}
  <div class="section">
    <h4 class="section-title">Resource & Entitlement</h4>
    <div class="info-grid">
      {#if resource}
      <div class="info-row">
        <span class="info-label">Resource</span>
        <span class="info-value">{resource.name}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Provider</span>
        <span class="info-value">{resource.provider}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Capacity</span>
        <span class="info-value font-mono">{resource.capacity.bandwidth_khz ?? resource.capacity.channels ?? 'N/A'} {resource.capacity.bandwidth_khz ? 'kHz' : 'channels'}</span>
      </div>
      {/if}
      {#if contract}
      <div class="info-row">
        <span class="info-label">Model</span>
        <span class="info-value">{contract.billing_model.replaceAll('_', ' ')}</span>
      </div>
      {#if contract.included_minutes}
      <div class="info-row">
        <span class="info-label">Included</span>
        <span class="info-value font-mono">{contract.included_minutes} min</span>
      </div>
      {/if}
      {#if contract.overage_rate}
      <div class="info-row">
        <span class="info-label">Rate</span>
        <span class="info-value font-mono">${contract.overage_rate} {contract.billing_model === 'pay_per_minute' ? '/ min' : '/ unit'}</span>
      </div>
      {/if}
      {/if}
    </div>
  </div>
  {/if}

  <!-- Endpoints -->
  <div class="section">
    <h4 class="section-title">Endpoints</h4>
    {#each link.endpoints as epId}
      <div class="endpoint-row">
        <span class="font-mono text-sm">{endpointCallsign(epId)}</span>
        <span class="text-xs text-muted">{endpointName(epId)}</span>
      </div>
    {/each}
  </div>

  <!-- Frequency -->
  {#if link.frequency.value_mhz}
  <div class="section">
    <h4 class="section-title">Frequency</h4>
    <div class="info-grid">
      <div class="info-row">
        <span class="info-label">Freq</span>
        <span class="info-value font-mono">{link.frequency.value_mhz} MHz</span>
      </div>
      {#if link.frequency.bandwidth_khz}
      <div class="info-row">
        <span class="info-label">Bandwidth</span>
        <span class="info-value font-mono">{link.frequency.bandwidth_khz} kHz</span>
      </div>
      {/if}
      {#if link.frequency.modulation}
      <div class="info-row">
        <span class="info-label">Modulation</span>
        <span class="info-value">{link.frequency.modulation}</span>
      </div>
      {/if}
      {#if link.frequency.polarization}
      <div class="info-row">
        <span class="info-label">Polarization</span>
        <span class="info-value">{link.frequency.polarization}</span>
      </div>
      {/if}
    </div>
  </div>
  {/if}

  <!-- Satellite -->
  {#if link.satellite}
  <div class="section">
    <h4 class="section-title">Satellite</h4>
    <div class="info-grid">
      <div class="info-row">
        <span class="info-label">Name</span>
        <span class="info-value">{link.satellite.name}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Orbit</span>
        <span class="info-value">{link.satellite.orbit}</span>
      </div>
      {#if link.satellite.transponder}
      <div class="info-row">
        <span class="info-label">Transponder</span>
        <span class="info-value font-mono">{link.satellite.transponder}</span>
      </div>
      {/if}
      {#if link.satellite.provider}
      <div class="info-row">
        <span class="info-label">Provider</span>
        <span class="info-value">{link.satellite.provider}</span>
      </div>
      {/if}
    </div>
  </div>
  {/if}

  <!-- Quality -->
  {#if link.quality.latency_ms !== null || link.quality.signal_strength_dbm !== null}
  <div class="section">
    <h4 class="section-title">Quality</h4>
    <div class="info-grid">
      {#if link.quality.latency_ms !== null}
      <div class="info-row">
        <span class="info-label">Latency</span>
        <span class="info-value font-mono">{link.quality.latency_ms} ms</span>
      </div>
      {/if}
      {#if link.quality.signal_strength_dbm !== null}
      <div class="info-row">
        <span class="info-label">Signal</span>
        <span class="info-value font-mono">{link.quality.signal_strength_dbm} dBm</span>
      </div>
      {/if}
      {#if link.quality.ber !== null}
      <div class="info-row">
        <span class="info-label">BER</span>
        <span class="info-value font-mono">{link.quality.ber}</span>
      </div>
      {/if}
    </div>
  </div>
  {/if}

  <!-- Utilization -->
  <div class="section">
    <h4 class="section-title">Utilization</h4>
    <div class="info-grid">
      <div class="info-row">
        <span class="info-label">Used</span>
        <span class="info-value font-mono">{Math.round(usedMinutes / 6) / 10} h</span>
      </div>
      <div class="info-row">
        <span class="info-label">Data</span>
        <span class="info-value font-mono">{dataMb} MB</span>
      </div>
      <div class="info-row">
        <span class="info-label">Cost</span>
        <span class="info-value font-mono">${estimatedCost}</span>
      </div>
    </div>
  </div>

  <!-- Schedule -->
  {#if link.schedule}
  <div class="section">
    <h4 class="section-title">Schedule</h4>
    <div class="info-grid">
      <div class="info-row">
        <span class="info-label">Start</span>
        <span class="info-value text-xs">{new Date(link.schedule.start).toLocaleString()}</span>
      </div>
      <div class="info-row">
        <span class="info-label">End</span>
        <span class="info-value text-xs">{new Date(link.schedule.end).toLocaleString()}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Recurrence</span>
        <span class="info-value">{link.schedule.recurrence}</span>
      </div>
    </div>
  </div>
  {/if}

  {#if linkReservations.length > 0}
  <div class="section">
    <h4 class="section-title">Reservations</h4>
    {#each linkReservations.slice(0, 3) as reservation}
      <div class="endpoint-row reservation-row">
        <span class="font-mono text-sm">{reservation.mission}</span>
        <span class="badge badge-{reservation.status}">{reservation.status}</span>
        <span class="text-xs text-muted">{new Date(reservation.start).toLocaleString()} - {new Date(reservation.end).toLocaleTimeString()}</span>
      </div>
    {/each}
  </div>
  {/if}

  <div class="panel-actions">
    <button class="btn btn-sm" onclick={() => onedit(link)}>Edit Link</button>
    <button class="btn btn-sm btn-danger" onclick={handleDelete}>Delete Link</button>
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
    margin-bottom: var(--space-sm);
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
  .section {
    margin-top: var(--space-md);
    padding-top: var(--space-sm);
    border-top: 1px solid var(--color-border);
  }
  .section-title {
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--text-muted);
    margin-bottom: var(--space-sm);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .endpoint-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-xs) var(--space-sm);
    background: var(--bg-tertiary);
    border-radius: var(--radius-sm);
    margin-bottom: var(--space-xs);
  }
  .reservation-row {
    flex-wrap: wrap;
    align-items: flex-start;
    gap: var(--space-xs);
  }
  .panel-actions {
    display: flex;
    gap: var(--space-sm);
    margin-top: var(--space-lg);
    padding-top: var(--space-md);
    border-top: 1px solid var(--color-border);
  }
  .btn-danger {
    color: var(--color-unavailable);
    border-color: rgba(248,81,73,0.3);
  }
  .btn-danger:hover {
    background: rgba(248,81,73,0.15);
  }
</style>
