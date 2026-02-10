<script>
  import { onMount, onDestroy } from 'svelte';
  import { assets, commLinks, frequencies, satellites, get } from '$lib/data/stores.js';
  import {
    generateNodeStatusReport,
    generateFrequencyReport,
    generateSatelliteReport,
    generateLinkAvailabilityReport,
    toCSV
  } from '$lib/utils/reports.js';
  import { downloadFile } from '$lib/utils/xml.js';

  let activeTab = $state('nodes');
  let Plotly;
  let plotReady = $state(false);

  let allAssets = $state(get(assets));
  let allLinks = $state(get(commLinks));
  let allFreqs = $state(get(frequencies));
  let allSats = $state(get(satellites));

  const unsubs = [
    assets.subscribe(v => allAssets = v),
    commLinks.subscribe(v => allLinks = v),
    frequencies.subscribe(v => allFreqs = v),
    satellites.subscribe(v => allSats = v)
  ];
  onDestroy(() => unsubs.forEach(u => u()));

  let nodeReport = $derived(generateNodeStatusReport(allAssets, allLinks));
  let freqReport = $derived(generateFrequencyReport(allFreqs, allAssets));
  let satReport = $derived(generateSatelliteReport(allSats, allLinks));
  let availReport = $derived(generateLinkAvailabilityReport(allLinks));

  // Plotly chart containers
  let nodeChartEl = $state();
  let freqChartEl = $state();
  let satChartEl = $state();
  let availChartEl = $state();

  const darkLayout = {
    paper_bgcolor: '#161b22',
    plot_bgcolor: '#161b22',
    font: { color: '#8b949e', family: 'Inter, sans-serif', size: 12 },
    margin: { t: 40, r: 20, b: 40, l: 50 },
    xaxis: { gridcolor: '#30363d', zerolinecolor: '#30363d' },
    yaxis: { gridcolor: '#30363d', zerolinecolor: '#30363d' },
    legend: { bgcolor: 'rgba(0,0,0,0)', font: { color: '#8b949e' } },
    barmode: 'group'
  };

  const plotConfig = { displayModeBar: false, responsive: true };

  onMount(async () => {
    Plotly = (await import('plotly.js-dist-min')).default;
    plotReady = true;
    renderCharts();
  });

  function renderCharts() {
    if (!plotReady || !Plotly) return;

    // Node status chart
    if (nodeChartEl && activeTab === 'nodes') {
      const colors = { Active: '#3fb950', Inactive: '#f85149', Maintenance: '#d29922' };
      const data = nodeReport.chartData.map(d => ({
        ...d,
        marker: { color: colors[d.name] || '#888' }
      }));
      Plotly.newPlot(nodeChartEl, data, {
        ...darkLayout,
        title: { text: 'Assets by Platform & Status', font: { color: '#e6edf3', size: 14 } },
        barmode: 'group'
      }, plotConfig);
    }

    // Frequency chart
    if (freqChartEl && activeTab === 'frequency') {
      Plotly.newPlot(freqChartEl, freqReport.chartData, {
        ...darkLayout,
        title: { text: 'Frequency Allocations by Band', font: { color: '#e6edf3', size: 14 } }
      }, plotConfig);
    }

    // Satellite gauge charts
    if (satChartEl && activeTab === 'satellite') {
      const data = satReport.gaugeData.map((g, i) => ({
        type: 'indicator',
        mode: 'gauge+number',
        value: g.utilization,
        title: { text: `${g.satellite}<br>${g.transponder}`, font: { size: 11, color: '#8b949e' } },
        number: { suffix: '%', font: { size: 18, color: '#e6edf3' } },
        gauge: {
          axis: { range: [0, 100], tickcolor: '#30363d' },
          bar: { color: g.utilization > 90 ? '#f85149' : g.utilization > 70 ? '#d29922' : '#3fb950' },
          bgcolor: '#21262d',
          borderwidth: 1,
          bordercolor: '#30363d'
        },
        domain: {
          row: Math.floor(i / 3),
          column: i % 3
        }
      }));

      const rows = Math.ceil(satReport.gaugeData.length / 3);
      Plotly.newPlot(satChartEl, data, {
        ...darkLayout,
        grid: { rows, columns: 3, pattern: 'independent' },
        height: rows * 200,
        title: { text: 'Transponder Utilization', font: { color: '#e6edf3', size: 14 } }
      }, plotConfig);
    }

    // Availability chart
    if (availChartEl && activeTab === 'availability') {
      const data = [{
        type: 'bar',
        x: availReport.rows.map(r => r.name),
        y: availReport.rows.map(r => r.uptime_percent),
        marker: {
          color: availReport.rows.map(r =>
            r.uptime_percent > 90 ? '#3fb950' : r.uptime_percent > 50 ? '#d29922' : '#f85149'
          )
        },
        text: availReport.rows.map(r => r.uptime_percent + '%'),
        textposition: 'auto'
      }];
      Plotly.newPlot(availChartEl, data, {
        ...darkLayout,
        title: { text: 'Link Availability (%)', font: { color: '#e6edf3', size: 14 } },
        yaxis: { ...darkLayout.yaxis, range: [0, 105] }
      }, plotConfig);
    }
  }

  // Re-render when tab changes
  $effect(() => {
    if (activeTab && plotReady) {
      // Small delay to let DOM update
      setTimeout(renderCharts, 50);
    }
  });

  function exportCSV(rows, name) {
    const csv = toCSV(rows);
    downloadFile(csv, `${name}_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
  }

  function exportJSON(data, name) {
    const json = JSON.stringify({ report: name, generated: new Date().toISOString(), data }, null, 2);
    downloadFile(json, `${name}_${new Date().toISOString().split('T')[0]}.json`, 'application/json');
  }

  const tabs = [
    { id: 'nodes', label: 'Node Status' },
    { id: 'frequency', label: 'Frequency' },
    { id: 'satellite', label: 'Satellite' },
    { id: 'availability', label: 'Availability' }
  ];
</script>

<div class="reports-layout">
  <!-- Tab bar -->
  <div class="reports-tabs">
    {#each tabs as tab}
      <button class="tab-btn" class:active={activeTab === tab.id} onclick={() => activeTab = tab.id}>
        {tab.label}
      </button>
    {/each}
  </div>

  <div class="reports-content">
    <!-- NODE STATUS -->
    {#if activeTab === 'nodes'}
    <div class="report-section">
      <div class="report-header">
        <h2>Node Status Report</h2>
        <div class="flex gap-sm">
          <button class="btn btn-sm" onclick={() => exportCSV(nodeReport.rows, 'node-status')}>Export CSV</button>
          <button class="btn btn-sm" onclick={() => exportJSON(nodeReport.rows, 'node-status')}>Export JSON</button>
        </div>
      </div>

      <div class="chart-container" bind:this={nodeChartEl}></div>

      <div class="table-container mt-md">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Callsign</th>
              <th>Platform</th>
              <th>Status</th>
              <th>Active Links</th>
              <th>Total Links</th>
              <th>Last Update</th>
            </tr>
          </thead>
          <tbody>
            {#each nodeReport.rows as row}
            <tr>
              <td>{row.name}</td>
              <td class="font-mono">{row.callsign}</td>
              <td><span class="badge badge-{row.platform}">{row.platform}</span></td>
              <td><span class="badge badge-{row.status}">{row.status}</span></td>
              <td>{row.activeLinks}</td>
              <td>{row.totalLinks}</td>
              <td class="text-xs text-muted">{new Date(row.lastUpdate).toLocaleString()}</td>
            </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
    {/if}

    <!-- FREQUENCY ALLOCATION -->
    {#if activeTab === 'frequency'}
    <div class="report-section">
      <div class="report-header">
        <h2>Frequency Allocation Report</h2>
        <div class="flex gap-sm">
          <button class="btn btn-sm" onclick={() => exportCSV(freqReport.rows, 'frequency-allocation')}>Export CSV</button>
          <button class="btn btn-sm" onclick={() => exportJSON(freqReport.rows, 'frequency-allocation')}>Export JSON</button>
        </div>
      </div>

      <div class="chart-container" bind:this={freqChartEl}></div>

      {#if freqReport.conflicts.length > 0}
      <div class="conflicts-banner mt-md">
        <strong>Frequency Conflicts Detected ({freqReport.conflicts.length})</strong>
        {#each freqReport.conflicts as c}
          <div class="text-sm">{c.freq1} ↔ {c.freq2} at {c.frequency_mhz} MHz</div>
        {/each}
      </div>
      {/if}

      <div class="table-container mt-md">
        <table>
          <thead>
            <tr>
              <th>Frequency (MHz)</th>
              <th>Bandwidth (kHz)</th>
              <th>Band</th>
              <th>Designation</th>
              <th>Assigned To</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {#each freqReport.rows as row}
            <tr>
              <td class="font-mono">{row.frequency_mhz}</td>
              <td class="font-mono">{row.bandwidth_khz}</td>
              <td><span class="badge">{row.band}</span></td>
              <td>{row.designation}</td>
              <td class="text-xs">{row.assigned_to}</td>
              <td class="text-xs text-muted">{row.notes}</td>
            </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
    {/if}

    <!-- SATELLITE USAGE -->
    {#if activeTab === 'satellite'}
    <div class="report-section">
      <div class="report-header">
        <h2>Satellite Usage Report</h2>
        <div class="flex gap-sm">
          <button class="btn btn-sm" onclick={() => exportJSON(satReport.rows, 'satellite-usage')}>Export JSON</button>
        </div>
      </div>

      <!-- Satellite summary cards -->
      <div class="sat-cards">
        {#each satReport.rows as sat}
        <div class="card sat-card">
          <div class="card-header">
            <div class="card-title">{sat.name}</div>
            <span class="badge badge-{sat.status === 'operational' ? 'active' : 'inactive'}">{sat.status}</span>
          </div>
          <div class="sat-details text-sm">
            <div class="flex justify-between"><span class="text-muted">Orbit:</span><span>{sat.orbit_type}</span></div>
            <div class="flex justify-between"><span class="text-muted">Provider:</span><span>{sat.provider}</span></div>
            <div class="flex justify-between"><span class="text-muted">Transponders:</span><span>{sat.total_transponders}</span></div>
          </div>
        </div>
        {/each}
      </div>

      <div class="chart-container mt-md" bind:this={satChartEl}></div>
    </div>
    {/if}

    <!-- LINK AVAILABILITY -->
    {#if activeTab === 'availability'}
    <div class="report-section">
      <div class="report-header">
        <h2>Link Availability Report</h2>
        <div class="flex gap-sm">
          <button class="btn btn-sm" onclick={() => exportCSV(availReport.rows, 'link-availability')}>Export CSV</button>
          <button class="btn btn-sm" onclick={() => exportJSON({ rows: availReport.rows, summary: availReport.summary }, 'link-availability')}>Export JSON</button>
        </div>
      </div>

      <!-- Summary cards -->
      <div class="summary-cards">
        <div class="card summary-card">
          <div class="summary-value" style="color: var(--color-primary)">{availReport.summary.mean_uptime}%</div>
          <div class="summary-label">Mean Availability</div>
        </div>
        <div class="card summary-card">
          <div class="summary-value" style="color: var(--color-active)">{availReport.summary.best_uptime}%</div>
          <div class="summary-label">Best: {availReport.summary.best_link}</div>
        </div>
        <div class="card summary-card">
          <div class="summary-value" style="color: var(--color-unavailable)">{availReport.summary.worst_uptime}%</div>
          <div class="summary-label">Worst: {availReport.summary.worst_link}</div>
        </div>
        <div class="card summary-card">
          <div class="summary-value" style="color: var(--color-degraded)">{availReport.summary.total_downtime_hours}h</div>
          <div class="summary-label">Total Downtime</div>
        </div>
      </div>

      <div class="chart-container mt-md" bind:this={availChartEl}></div>

      <div class="table-container mt-md">
        <table>
          <thead>
            <tr>
              <th>Link Name</th>
              <th>Type</th>
              <th>Status</th>
              <th>Scheduled (h)</th>
              <th>Available (h)</th>
              <th>Down (h)</th>
              <th>Uptime %</th>
            </tr>
          </thead>
          <tbody>
            {#each availReport.rows as row}
            <tr>
              <td>{row.name}</td>
              <td><span class="badge badge-{row.type}">{row.type}</span></td>
              <td><span class="badge badge-{row.status}">{row.status}</span></td>
              <td>{row.scheduled_hours}</td>
              <td>{row.available_hours}</td>
              <td>{row.unavailable_hours}</td>
              <td class="font-mono" style="color: {row.uptime_percent > 90 ? 'var(--color-active)' : row.uptime_percent > 50 ? 'var(--color-degraded)' : 'var(--color-unavailable)'}">{row.uptime_percent}%</td>
            </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
    {/if}
  </div>
</div>

<style>
  .reports-layout {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .reports-tabs {
    display: flex;
    gap: var(--space-xs);
    padding: var(--space-sm) var(--space-md);
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--color-border);
  }

  .tab-btn {
    padding: var(--space-xs) var(--space-md);
    border: 1px solid transparent;
    border-radius: var(--radius-md);
    background: none;
    color: var(--text-secondary);
    font-size: var(--text-sm);
    font-family: var(--font-sans);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .tab-btn:hover {
    color: var(--text-primary);
    background: var(--bg-hover);
  }

  .tab-btn.active {
    color: var(--color-primary);
    background: rgba(88, 166, 255, 0.1);
    border-color: rgba(88, 166, 255, 0.3);
  }

  .reports-content {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-lg);
  }

  .report-section {
    max-width: 1200px;
    margin: 0 auto;
  }

  .report-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-lg);
  }

  .report-header h2 {
    font-size: var(--text-xl);
    font-weight: 700;
  }

  .chart-container {
    min-height: 300px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }

  .conflicts-banner {
    background: rgba(248, 81, 73, 0.1);
    border: 1px solid rgba(248, 81, 73, 0.3);
    border-radius: var(--radius-md);
    padding: var(--space-md);
    color: var(--color-unavailable);
  }

  .sat-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: var(--space-md);
    margin-bottom: var(--space-md);
  }

  .sat-card .sat-details {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
    margin-top: var(--space-sm);
  }

  .summary-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: var(--space-md);
    margin-bottom: var(--space-md);
  }

  .summary-card {
    text-align: center;
    padding: var(--space-lg);
  }

  .summary-value {
    font-size: var(--text-2xl);
    font-weight: 700;
    font-family: var(--font-mono);
  }

  .summary-label {
    font-size: var(--text-xs);
    color: var(--text-muted);
    margin-top: var(--space-xs);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
</style>
