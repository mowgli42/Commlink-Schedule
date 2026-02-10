<script>
  import { onMount } from 'svelte';
  import { assets, commLinks, assetMap } from '$lib/data/stores.js';

  let allAssets = $state([]);
  let allLinks = $state([]);
  let lookup = $state(new Map());

  assets.subscribe(v => allAssets = v);
  commLinks.subscribe(v => allLinks = v);
  assetMap.subscribe(v => lookup = v);

  let timeRange = $state(12); // hours
  let autoScroll = $state(true);
  let platformFilter = $state('all');
  let linkTypeFilter = $state('all');
  let timelineEl;
  let currentTime = $state(new Date());

  // Update current time every second
  let interval;
  onMount(() => {
    interval = setInterval(() => {
      currentTime = new Date();
    }, 1000);
    return () => clearInterval(interval);
  });

  // Compute timeline bounds
  let timeStart = $derived(new Date(currentTime.getTime() - (timeRange / 4) * 3600000));
  let timeEnd = $derived(new Date(timeStart.getTime() + timeRange * 3600000));
  let totalMs = $derived(timeEnd.getTime() - timeStart.getTime());

  // Filter assets
  let displayAssets = $derived(() => {
    let list = allAssets;
    if (platformFilter !== 'all') {
      list = list.filter(a => a.platform === platformFilter);
    }
    return list;
  });

  // Build track data
  let tracks = $derived(() => {
    return displayAssets().map(asset => {
      const assetLinks = allLinks.filter(l => l.endpoints.includes(asset.id));
      let filteredLinks = assetLinks;
      if (linkTypeFilter !== 'all') {
        filteredLinks = assetLinks.filter(l => l.type === linkTypeFilter);
      }

      const linkTracks = filteredLinks.map(link => {
        // Generate blocks based on schedule
        const blocks = generateBlocks(link, timeStart, timeEnd);
        return { link, blocks };
      });

      return { asset, linkTracks };
    }).filter(t => t.linkTracks.length > 0);
  });

  /**
   * Generate availability blocks for a link within a time range.
   * @param {import('../../data/stores.js').CommLink} link
   * @param {Date} start
   * @param {Date} end
   * @returns {Array<{start: Date, end: Date, status: string}>}
   */
  function generateBlocks(link, start, end) {
    if (!link.schedule) {
      // No schedule: fill entire range with current status
      return [{ start, end, status: link.status }];
    }

    const schedStart = new Date(link.schedule.start);
    const schedEnd = new Date(link.schedule.end);
    const blocks = [];

    // Simple model: scheduled window = link status, outside = unavailable
    // Repeat daily if recurrence is 'daily'
    const dayMs = 86400000;
    let dayOffset = 0;

    while (dayOffset < timeRange * 3600000 + dayMs) {
      const blockStart = new Date(schedStart.getTime() + Math.floor((start.getTime() - schedStart.getTime()) / dayMs + dayOffset / dayMs) * dayMs);
      const blockEnd = new Date(blockStart.getTime() + (schedEnd.getTime() - schedStart.getTime()));

      if (blockEnd.getTime() > start.getTime() && blockStart.getTime() < end.getTime()) {
        // Before scheduled: unavailable
        if (blockStart.getTime() > start.getTime() && blocks.length === 0) {
          blocks.push({
            start: start,
            end: new Date(Math.min(blockStart.getTime(), end.getTime())),
            status: 'unavailable'
          });
        }

        // Scheduled window
        blocks.push({
          start: new Date(Math.max(blockStart.getTime(), start.getTime())),
          end: new Date(Math.min(blockEnd.getTime(), end.getTime())),
          status: link.status
        });

        // After scheduled: unavailable
        if (blockEnd.getTime() < end.getTime()) {
          blocks.push({
            start: blockEnd,
            end: end,
            status: 'unavailable'
          });
        }
      }

      dayOffset += dayMs;
      if (link.schedule.recurrence !== 'daily') break;
    }

    if (blocks.length === 0) {
      blocks.push({ start, end, status: 'unavailable' });
    }

    return blocks;
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
    degraded: '#d29922',
    unavailable: '#f85149',
    scheduled: '#484f58'
  };

  const LINK_COLORS = {
    satellite: '#00bcd4',
    los_radio: '#4caf50',
    voip: '#ff9800',
    xmpp: '#9c27b0'
  };

  function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function formatTimeShort(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  // Generate time axis labels
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
    {#each tracks() as track (track.asset.id)}
      <div class="asset-track">
        <div class="track-label">
          <div class="track-name">{track.asset.callsign}</div>
          <span class="badge badge-{track.asset.platform}" style="font-size:9px">{track.asset.platform}</span>
        </div>
        <div class="track-content">
          {#each track.linkTracks as lt}
            <div class="link-row">
              <div class="link-row-label" style="color:{LINK_COLORS[lt.link.type] || '#888'}">
                {lt.link.name.length > 20 ? lt.link.name.substring(0, 20) + '...' : lt.link.name}
              </div>
              <div class="link-row-blocks">
                {#each lt.blocks as block}
                  <div
                    class="availability-block"
                    style="left:{getBlockLeft(block)}%; width:{getBlockWidth(block)}%; background:{statusColors[block.status] || '#484f58'}"
                    title="{block.status}: {formatTime(block.start)} - {formatTime(block.end)}"
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
