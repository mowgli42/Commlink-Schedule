<script>
  import { onMount, onDestroy } from 'svelte';
  import {
    assets,
    commLinks,
    assetMap,
    resources,
    contracts,
    reservations,
    usageRecords,
    get
  } from '$lib/data/stores.js';

  let allAssets = $state(get(assets));
  let allLinks = $state(get(commLinks));
  let lookup = $state(get(assetMap));
  let allResources = $state(get(resources));
  let allContracts = $state(get(contracts));
  let allReservations = $state(get(reservations));
  let allUsage = $state(get(usageRecords));

  const unsubs = [
    assets.subscribe(v => allAssets = v),
    commLinks.subscribe(v => allLinks = v),
    assetMap.subscribe(v => lookup = v),
    resources.subscribe(v => allResources = v),
    contracts.subscribe(v => allContracts = v),
    reservations.subscribe(v => allReservations = v),
    usageRecords.subscribe(v => allUsage = v)
  ];
  onDestroy(() => unsubs.forEach(u => u()));

  let timeRange = $state(12); // hours
  let autoScroll = $state(true);
  let platformFilter = $state('all');
  let linkTypeFilter = $state('all');
  let viewMode = $state('asset'); // asset | resource | link
  let timelineEl;
  let currentTime = $state(new Date());

  let interval;
  onMount(() => {
    interval = setInterval(() => {
      currentTime = new Date();
    }, 1000);
    return () => clearInterval(interval);
  });

  let timeStart = $derived(new Date(currentTime.getTime() - (timeRange / 4) * 3600000));
  let timeEnd = $derived(new Date(timeStart.getTime() + timeRange * 3600000));
  let totalMs = $derived(timeEnd.getTime() - timeStart.getTime());

  let displayAssets = $derived(() => {
    let list = allAssets;
    if (platformFilter !== 'all') {
      list = list.filter(a => a.platform === platformFilter);
    }
    return list;
  });

  const contractByResource = $derived(new Map(allContracts.map(c => [c.resource_id, c])));
  const resourceById = $derived(new Map(allResources.map(r => [r.id, r])));

  let tracks = $derived(() => {
    if (viewMode === 'resource') return buildResourceTracks();
    if (viewMode === 'link') return buildLinkTracks();
    return buildAssetTracks();
  });

  function buildAssetTracks() {
    return displayAssets().map(asset => {
      const assetLinks = allLinks.filter(l => l.endpoints.includes(asset.id));
      const filteredLinks = linkTypeFilter === 'all' ? assetLinks : assetLinks.filter(l => l.type === linkTypeFilter);
      const linkTracks = filteredLinks.map(link => ({
        label: link.name,
        color: LINK_COLORS[link.type] || '#888',
        billing: contractByResource.get(link.resource_id)?.label ?? 'N/A',
        blocks: generateLinkBlocks(link, timeStart, timeEnd)
      }));
      return {
        id: asset.id,
        label: asset.callsign,
        badge: asset.platform,
        badgeClass: asset.platform,
        linkTracks
      };
    }).filter(t => t.linkTracks.length > 0);
  }

  function buildResourceTracks() {
    return allResources.map(resource => {
      const contract = contractByResource.get(resource.id);
      const blocks = generateResourceBlocks(resource, timeStart, timeEnd);
      return {
        id: resource.id,
        label: resource.name,
        badge: contract?.label ?? resource.kind.replaceAll('_', ' '),
        badgeClass: contract?.billing_model ?? resource.status,
        linkTracks: [{
          label: `${resource.kind.replaceAll('_', ' ')}${contract ? ` · ${contract.label}` : ''}`,
          color: RESOURCE_COLORS[resource.kind] || '#8b949e',
          billing: contract?.label ?? 'N/A',
          blocks
        }]
      };
    }).filter(t => t.linkTracks[0].blocks.length > 0);
  }

  function buildLinkTracks() {
    let filteredLinks = allLinks;
    if (linkTypeFilter !== 'all') filteredLinks = filteredLinks.filter(l => l.type === linkTypeFilter);
    return filteredLinks.map(link => {
      const resource = resourceById.get(link.resource_id);
      const contract = contractByResource.get(link.resource_id);
      return {
        id: link.id,
        label: link.name,
        badge: contract?.label ?? link.type,
        badgeClass: contract?.billing_model ?? link.type,
        linkTracks: [{
          label: resource?.name ?? 'Unassigned resource',
          color: LINK_COLORS[link.type] || '#888',
          billing: contract?.label ?? 'N/A',
          blocks: generateLinkBlocks(link, timeStart, timeEnd)
        }]
      };
    });
  }

  function generateResourceBlocks(resource, start, end) {
    const reservationBlocks = allReservations
      .filter(r => r.resource_id === resource.id)
      .flatMap(r => clipBlock({
        start: new Date(r.start),
        end: new Date(r.end),
        status: r.status,
        label: r.mission,
        detail: `${r.priority} · ${r.requested_by}`
      }, start, end));

    if (reservationBlocks.length > 0) return reservationBlocks;

    return resource.availability_windows.flatMap(window =>
      expandWindow(window, start, end).map(w => ({
        start: w.start,
        end: w.end,
        status: resource.status === 'operational' ? 'available' : resource.status,
        label: 'available capacity',
        detail: resource.provider
      }))
    );
  }

  function generateLinkBlocks(link, start, end) {
    const reservationBlocks = allReservations
      .filter(r => r.link_id === link.id)
      .flatMap(r => clipBlock({
        start: new Date(r.start),
        end: new Date(r.end),
        status: r.status === 'active' ? link.status : r.status,
        label: r.mission,
        detail: `${contractByResource.get(link.resource_id)?.label ?? 'N/A'} · ${r.priority}`
      }, start, end));

    if (reservationBlocks.length > 0) return fillGaps(reservationBlocks, start, end, 'unavailable');

    const windows = link.schedule ? expandWindow(link.schedule, start, end) : [{ start, end }];
    if (windows.length === 0) return [{ start, end, status: 'unavailable', label: 'not scheduled', detail: '' }];
    return fillGaps(windows.map(w => ({
      start: w.start,
      end: w.end,
      status: link.status,
      label: link.name,
      detail: contractByResource.get(link.resource_id)?.label ?? 'N/A'
    })), start, end, 'unavailable');
  }

  function expandWindow(schedule, start, end) {
    if (!schedule || !schedule.start || !schedule.end) return [];
    const schedStart = new Date(schedule.start);
    const schedEnd = new Date(schedule.end);
    const windowMs = schedEnd.getTime() - schedStart.getTime();
    if (windowMs <= 0) return [];
    const recurrence = schedule.recurrence ?? 'none';
    const stepMs = recurrence === 'weekly' ? 7 * 86400000 : 86400000;
    const windows = [];
    if (recurrence === 'daily' || recurrence === 'weekly') {
      const stepsBefore = Math.floor((start.getTime() - schedStart.getTime()) / stepMs);
      for (let i = Math.max(0, stepsBefore - 1); ; i++) {
        const ws = new Date(schedStart.getTime() + i * stepMs);
        const we = new Date(ws.getTime() + windowMs);
        if (ws.getTime() >= end.getTime()) break;
        if (we.getTime() > start.getTime()) windows.push({ start: ws, end: we });
      }
    } else if (schedEnd.getTime() > start.getTime() && schedStart.getTime() < end.getTime()) {
      windows.push({ start: schedStart, end: schedEnd });
    }
    return windows.map(w => ({
      start: new Date(Math.max(w.start.getTime(), start.getTime())),
      end: new Date(Math.min(w.end.getTime(), end.getTime()))
    }));
  }

  function clipBlock(block, start, end) {
    if (block.end.getTime() <= start.getTime() || block.start.getTime() >= end.getTime()) return [];
    return [{
      ...block,
      start: new Date(Math.max(block.start.getTime(), start.getTime())),
      end: new Date(Math.min(block.end.getTime(), end.getTime()))
    }];
  }

  function fillGaps(blocks, start, end, gapStatus) {
    const sorted = [...blocks].sort((a, b) => a.start.getTime() - b.start.getTime());
    const out = [];
    let cursor = start;
    for (const block of sorted) {
      if (block.start.getTime() > cursor.getTime()) {
        out.push({ start: new Date(cursor), end: block.start, status: gapStatus, label: 'gap', detail: '' });
      }
      out.push(block);
      cursor = block.end;
    }
    if (cursor.getTime() < end.getTime()) {
      out.push({ start: new Date(cursor), end, status: gapStatus, label: 'gap', detail: '' });
    }
    return out;
  }

  function getBlockLeft(block) {
    const offset = block.start.getTime() - timeStart.getTime();
    return Math.max(0, (offset / totalMs) * 100);
  }

  function getBlockWidth(block) {
    const start = Math.max(block.start.getTime(), timeStart.getTime());
    const end = Math.min(block.end.getTime(), timeEnd.getTime());
    return Math.max(0, ((end - start) / totalMs) * 100);
  }

  function getPlayheadPosition() {
    const offset = currentTime.getTime() - timeStart.getTime();
    return Math.max(0, Math.min(100, (offset / totalMs) * 100));
  }

  const statusColors = {
    active: '#3fb950',
    available: '#3fb950',
    approved: '#3fb950',
    requested: '#58a6ff',
    degraded: '#d29922',
    conflicted: '#f85149',
    denied: '#f85149',
    unavailable: '#f85149',
    completed: '#8b949e',
    scheduled: '#484f58',
    maintenance: '#d29922',
    offline: '#f85149'
  };

  const LINK_COLORS = {
    satellite: '#00bcd4',
    los_radio: '#4caf50',
    voip: '#ff9800',
    xmpp: '#9c27b0'
  };

  const RESOURCE_COLORS = {
    satellite_transponder: '#00bcd4',
    mobile_command_center: '#ffa726',
    radio_net: '#4caf50',
    ip_service: '#9c27b0'
  };

  function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function formatTimeShort(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  let timeLabels = $derived(() => {
    const labels = [];
    const step = totalMs / 8;
    for (let i = 0; i <= 8; i++) {
      const t = new Date(timeStart.getTime() + step * i);
      labels.push({ position: (i / 8) * 100, label: formatTimeShort(t) });
    }
    return labels;
  });
</script>

<div class="gh-layout">
  <!-- Controls -->
  <div class="gh-controls">
    <div class="gh-title">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <path d="M3 9h18M9 3v18"/>
      </svg>
      <h2>Link Availability Timeline</h2>
      <span class="badge badge-degraded">FUTURE v2</span>
    </div>

    <div class="gh-filters">
      <div class="filter-group">
        <label class="form-label" for="gh-view-mode">View By</label>
        <select id="gh-view-mode" class="form-select" bind:value={viewMode}>
          <option value="asset">Asset</option>
          <option value="resource">Resource</option>
          <option value="link">Comm Link</option>
        </select>
      </div>

      <div class="filter-group">
        <label class="form-label" for="gh-time-range">Time Range</label>
        <select id="gh-time-range" class="form-select" bind:value={timeRange}>
          <option value={6}>6 hours</option>
          <option value={12}>12 hours</option>
          <option value={24}>24 hours</option>
          <option value={48}>48 hours</option>
        </select>
      </div>

      <div class="filter-group">
        <label class="form-label" for="gh-platform">Platform</label>
        <select id="gh-platform" class="form-select" bind:value={platformFilter}>
          <option value="all">All Platforms</option>
          <option value="site">Site</option>
          <option value="mobile">Mobile</option>
          <option value="aircraft">Aircraft</option>
        </select>
      </div>

      <div class="filter-group">
        <label class="form-label" for="gh-link-type">Link Type</label>
        <select id="gh-link-type" class="form-select" bind:value={linkTypeFilter}>
          <option value="all">All Types</option>
          <option value="satellite">Satellite</option>
          <option value="los_radio">LOS Radio</option>
          <option value="voip">VoIP</option>
          <option value="xmpp">XMPP</option>
        </select>
      </div>

      <div class="filter-group">
        <span class="form-label">&nbsp;</span>
        <label class="checkbox-label" for="gh-auto-scroll">
          <input id="gh-auto-scroll" type="checkbox" bind:checked={autoScroll} />
          Auto-scroll
        </label>
      </div>
    </div>

    <!-- Legend -->
    <div class="gh-legend">
      {#each Object.entries(statusColors) as [status, color]}
        <div class="legend-item">
          <div class="legend-swatch" style="background:{color}"></div>
          <span>{status}</span>
        </div>
      {/each}
    </div>
  </div>

  <!-- Timeline -->
  <div class="gh-timeline" bind:this={timelineEl}>
    <!-- Time axis -->
    <div class="time-axis">
      <div class="track-label-spacer"></div>
      <div class="time-axis-bar">
        {#each timeLabels() as tick}
          <div class="time-tick" style="left:{tick.position}%">
            <div class="tick-line"></div>
            <span class="tick-label">{tick.label}</span>
          </div>
        {/each}
      </div>
    </div>

    <!-- Asset tracks -->
    {#each tracks() as track (track.id)}
      <div class="asset-track">
        <div class="track-label">
          <div class="track-name">{track.label}</div>
          <span class="badge badge-{track.badgeClass}" style="font-size:9px">{track.badge}</span>
        </div>
        <div class="track-content">
          {#each track.linkTracks as lt}
            <div class="link-row">
              <div class="link-row-label" style="color:{lt.color || '#888'}">
                {lt.label.length > 24 ? lt.label.substring(0, 24) + '...' : lt.label}
                <span class="billing-chip">{lt.billing}</span>
              </div>
              <div class="link-row-blocks">
                {#each lt.blocks as block}
                  <div
                    class="availability-block block-{block.status}"
                    style="left:{getBlockLeft(block)}%; width:{getBlockWidth(block)}%; background:{statusColors[block.status] || '#484f58'}"
                    title="{block.label || block.status}: {formatTime(block.start)} - {formatTime(block.end)} {block.detail ? `· ${block.detail}` : ''}"
                  ></div>
                {/each}
              </div>
            </div>
          {/each}

          <!-- Playhead -->
          <div class="playhead" style="left:{getPlayheadPosition()}%">
            <div class="playhead-line"></div>
          </div>
        </div>
      </div>
    {/each}

    {#if tracks().length === 0}
      <div class="no-tracks">
        <p class="text-muted">No tracks to display. Adjust filters or add assets with comm links.</p>
      </div>
    {/if}
  </div>

  <!-- Current time -->
  <div class="gh-footer">
    <span class="text-xs text-muted">Current Time:</span>
    <span class="font-mono text-sm">{currentTime.toLocaleString()}</span>
  </div>
</div>

<style>
  .gh-layout {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  .gh-controls {
    padding: var(--space-md);
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--color-border);
  }

  .gh-title {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    margin-bottom: var(--space-md);
  }

  .gh-title h2 {
    font-size: var(--text-lg);
    font-weight: 700;
  }

  .gh-filters {
    display: flex;
    gap: var(--space-md);
    flex-wrap: wrap;
    margin-bottom: var(--space-sm);
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .filter-group .form-select {
    width: auto;
    min-width: 140px;
    padding: var(--space-xs) var(--space-sm);
    font-size: var(--text-xs);
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    font-size: var(--text-sm);
    color: var(--text-secondary);
    cursor: pointer;
  }

  .gh-legend {
    display: flex;
    gap: var(--space-md);
    font-size: var(--text-xs);
    color: var(--text-muted);
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
  }

  .legend-swatch {
    width: 12px;
    height: 12px;
    border-radius: 2px;
  }

  .gh-timeline {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 0 var(--space-md);
  }

  /* Time axis */
  .time-axis {
    display: flex;
    border-bottom: 1px solid var(--color-border);
    height: 32px;
    position: sticky;
    top: 0;
    background: var(--bg-primary);
    z-index: 10;
  }

  .track-label-spacer {
    width: 140px;
    flex-shrink: 0;
  }

  .time-axis-bar {
    flex: 1;
    position: relative;
  }

  .time-tick {
    position: absolute;
    top: 0;
    height: 100%;
    transform: translateX(-50%);
  }

  .tick-line {
    width: 1px;
    height: 8px;
    background: var(--color-border);
    margin: 0 auto;
  }

  .tick-label {
    font-size: 10px;
    color: var(--text-muted);
    font-family: var(--font-mono);
    white-space: nowrap;
  }

  /* Asset tracks */
  .asset-track {
    display: flex;
    border-bottom: 1px solid var(--color-border);
    min-height: 60px;
  }

  .track-label {
    width: 140px;
    flex-shrink: 0;
    padding: var(--space-sm);
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: var(--space-xs);
    border-right: 1px solid var(--color-border);
    background: var(--bg-secondary);
  }

  .track-name {
    font-size: var(--text-sm);
    font-weight: 600;
    font-family: var(--font-mono);
    color: var(--text-primary);
  }

  .track-content {
    flex: 1;
    position: relative;
    padding: var(--space-xs) 0;
  }

  .link-row {
    display: flex;
    align-items: center;
    height: 24px;
    margin-bottom: 2px;
  }

  .link-row-label {
    width: 0;
    overflow: hidden;
    font-size: 9px;
    font-family: var(--font-mono);
    white-space: nowrap;
    padding-right: 4px;
    opacity: 0;
    transition: all var(--transition-fast);
  }

  .asset-track:hover .link-row-label {
    width: 160px;
    opacity: 1;
  }

  .billing-chip {
    margin-left: var(--space-xs);
    padding: 1px 4px;
    border-radius: var(--radius-sm);
    background: rgba(88, 166, 255, 0.16);
    color: var(--color-primary);
    font-size: 8px;
  }

  .link-row-blocks {
    flex: 1;
    position: relative;
    height: 20px;
    border-radius: 3px;
    overflow: hidden;
    background: var(--bg-tertiary);
  }

  .availability-block {
    position: absolute;
    top: 0;
    height: 100%;
    border-radius: 2px;
    opacity: 0.85;
    transition: opacity var(--transition-fast);
    cursor: pointer;
  }

  .availability-block:hover {
    opacity: 1;
    z-index: 5;
  }

  .block-requested,
  .block-scheduled {
    background-image: repeating-linear-gradient(
      45deg,
      rgba(255,255,255,0.14) 0,
      rgba(255,255,255,0.14) 4px,
      transparent 4px,
      transparent 8px
    );
  }

  .block-conflicted,
  .block-denied {
    outline: 2px solid rgba(248, 81, 73, 0.75);
    outline-offset: -2px;
  }

  /* Playhead */
  .playhead {
    position: absolute;
    top: 0;
    bottom: 0;
    z-index: 20;
    pointer-events: none;
    transform: translateX(-50%);
  }

  .playhead-line {
    width: 2px;
    height: 100%;
    background: #ffffff;
    box-shadow: 0 0 6px rgba(255,255,255,0.5);
  }

  .no-tracks {
    padding: var(--space-2xl);
    text-align: center;
  }

  .gh-footer {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-sm) var(--space-md);
    background: var(--bg-secondary);
    border-top: 1px solid var(--color-border);
  }

  @media (max-width: 768px) {
    .gh-filters {
      flex-direction: column;
    }
    .track-label {
      width: 80px;
    }
  }
</style>
