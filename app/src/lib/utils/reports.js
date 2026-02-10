/**
 * Report generation utilities.
 * Produces data structures suitable for Plotly charts and CSV export.
 */

/**
 * Generate node status report data.
 * @param {import('../data/stores.js').Asset[]} assets
 * @param {import('../data/stores.js').CommLink[]} links
 * @returns {object}
 */
export function generateNodeStatusReport(assets, links) {
  const linkMap = new Map(links.map(l => [l.id, l]));

  const rows = assets.map(a => ({
    name: a.name,
    callsign: a.callsign,
    platform: a.platform,
    status: a.status,
    activeLinks: a.commlinks.filter(id => linkMap.get(id)?.status === 'active').length,
    totalLinks: a.commlinks.length,
    lastUpdate: a.position.timestamp,
    lat: a.position.lat,
    lon: a.position.lon
  }));

  // Chart data: grouped bar by platform and status
  const platforms = ['site', 'mobile', 'aircraft'];
  const statuses = ['active', 'inactive', 'maintenance'];
  const chartData = statuses.map(status => ({
    x: platforms,
    y: platforms.map(p => assets.filter(a => a.platform === p && a.status === status).length),
    name: status.charAt(0).toUpperCase() + status.slice(1),
    type: 'bar'
  }));

  return { rows, chartData, generated: new Date().toISOString() };
}

/**
 * Generate frequency allocation report data.
 * @param {import('../data/stores.js').Frequency[]} freqs
 * @param {import('../data/stores.js').Asset[]} assets
 * @returns {object}
 */
export function generateFrequencyReport(freqs, assets) {
  const bands = [...new Set(freqs.map(f => f.band))].sort();
  const assetMap = new Map(assets.map(a => [a.id, a]));

  const rows = freqs.map(f => ({
    frequency_mhz: f.frequency_mhz,
    bandwidth_khz: f.bandwidth_khz,
    designation: f.designation,
    band: f.band,
    assigned_to: f.assigned_to.map(id => assetMap.get(id)?.callsign || id).join(', '),
    link_ids: f.link_ids.join(', '),
    classification: f.classification,
    notes: f.notes
  }));

  // Chart: frequency count per band
  const chartData = [{
    x: bands,
    y: bands.map(b => freqs.filter(f => f.band === b).length),
    type: 'bar',
    marker: { color: bands.map(b => bandColor(b)) }
  }];

  // Conflicts: same frequency with overlapping assets
  const conflicts = [];
  for (let i = 0; i < freqs.length; i++) {
    for (let j = i + 1; j < freqs.length; j++) {
      if (Math.abs(freqs[i].frequency_mhz - freqs[j].frequency_mhz) < (freqs[i].bandwidth_khz / 2000)) {
        conflicts.push({
          freq1: freqs[i].designation,
          freq2: freqs[j].designation,
          frequency_mhz: freqs[i].frequency_mhz,
          overlap: true
        });
      }
    }
  }

  return { rows, chartData, conflicts, bands, generated: new Date().toISOString() };
}

/**
 * Generate satellite usage report data.
 * @param {import('../data/stores.js').Satellite[]} sats
 * @param {import('../data/stores.js').CommLink[]} links
 * @returns {object}
 */
export function generateSatelliteReport(sats, links) {
  const rows = sats.map(sat => {
    const transponders = sat.transponders.map(t => {
      const activeLinks = t.allocated_to.filter(lid =>
        links.find(l => l.id === lid && l.status === 'active')
      ).length;
      const utilization = t.allocated_to.length > 0 ? (activeLinks / Math.max(t.allocated_to.length, 1)) * 100 : 0;
      return {
        id: t.id,
        band: t.band,
        bandwidth_mhz: t.bandwidth_mhz,
        allocated_links: t.allocated_to.length,
        active_links: activeLinks,
        utilization
      };
    });

    return {
      id: sat.id,
      name: sat.name,
      orbit_type: sat.orbit_type,
      provider: sat.provider,
      status: sat.status,
      total_transponders: sat.transponders.length,
      transponders
    };
  });

  // Gauge data per transponder
  const gaugeData = rows.flatMap(sat =>
    sat.transponders.map(t => ({
      satellite: sat.name,
      transponder: t.id,
      utilization: t.utilization,
      band: t.band
    }))
  );

  return { rows, gaugeData, generated: new Date().toISOString() };
}

/**
 * Generate link availability report data.
 * @param {import('../data/stores.js').CommLink[]} links
 * @returns {object}
 */
export function generateLinkAvailabilityReport(links) {
  const rows = links.map(l => {
    // Simulate availability based on schedule and status
    const scheduledHours = l.schedule
      ? (new Date(l.schedule.end).getTime() - new Date(l.schedule.start).getTime()) / 3600000
      : 24;
    const availableHours = l.status === 'active' ? scheduledHours
      : l.status === 'degraded' ? scheduledHours * 0.7
      : 0;
    const uptimePercent = scheduledHours > 0 ? (availableHours / scheduledHours) * 100 : 0;

    return {
      id: l.id,
      name: l.name,
      type: l.type,
      subtype: l.subtype,
      status: l.status,
      scheduled_hours: Math.round(scheduledHours * 10) / 10,
      available_hours: Math.round(availableHours * 10) / 10,
      unavailable_hours: Math.round((scheduledHours - availableHours) * 10) / 10,
      uptime_percent: Math.round(uptimePercent * 10) / 10
    };
  });

  const meanUptime = rows.reduce((sum, r) => sum + r.uptime_percent, 0) / rows.length;
  const bestLink = rows.reduce((best, r) => r.uptime_percent > best.uptime_percent ? r : best, rows[0]);
  const worstLink = rows.reduce((worst, r) => r.uptime_percent < worst.uptime_percent ? r : worst, rows[0]);

  return {
    rows,
    summary: {
      mean_uptime: Math.round(meanUptime * 10) / 10,
      best_link: bestLink?.name || 'N/A',
      best_uptime: bestLink?.uptime_percent || 0,
      worst_link: worstLink?.name || 'N/A',
      worst_uptime: worstLink?.uptime_percent || 0,
      total_downtime_hours: Math.round(rows.reduce((s, r) => s + r.unavailable_hours, 0) * 10) / 10
    },
    generated: new Date().toISOString()
  };
}

/**
 * Export report data as CSV string.
 * @param {object[]} rows
 * @returns {string}
 */
export function toCSV(rows) {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(','),
    ...rows.map(row => headers.map(h => {
      const val = row[h];
      if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val ?? '';
    }).join(','))
  ];
  return lines.join('\n');
}

/**
 * @param {string} band
 * @returns {string}
 */
function bandColor(band) {
  const colors = { HF: '#ff7043', VHF: '#66bb6a', UHF: '#42a5f5', L: '#ab47bc', S: '#26c6da', Ku: '#ffa726', Ka: '#ef5350', SHF: '#8d6e63', X: '#78909c' };
  return colors[band] || '#90a4ae';
}
