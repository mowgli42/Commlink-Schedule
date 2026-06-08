/**
 * Report generation utilities.
 * Produces data structures suitable for Plotly charts and CSV export.
 */

import { validateSourceData } from './directoryValidation.js';

/**
 * Generate source-data validation report for Directory integration handoff.
 * @param {import('../data/stores.js').Asset[]} assets
 * @param {import('../data/stores.js').CommLink[]} links
 * @param {import('../data/stores.js').Resource[]} resources
 * @param {import('../data/stores.js').Contract[]} contracts
 * @param {import('../data/stores.js').Reservation[]} reservations
 * @param {import('../data/stores.js').UsageRecord[]} usageRecords
 */
export function generateSourceValidationReport(assets, links, resources, contracts, reservations, usageRecords) {
  const validation = validateSourceData({
    assets,
    commLinks: links,
    resources,
    contracts,
    reservations,
    usageRecords,
  });

  const rows = validation.issues.map((issue) => ({
    severity: issue.severity,
    code: issue.code,
    entity_type: issue.entity_type,
    entity_id: issue.entity_id,
    message: issue.message,
  }));

  return {
    rows,
    summary: validation.summary,
    generated: validation.generated,
  };
}

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
 * @param {import('../data/stores.js').Resource[]} resources
 * @param {import('../data/stores.js').UsageRecord[]} usageRecords
 * @returns {object}
 */
export function generateSatelliteReport(sats, links, resources = [], usageRecords = []) {
  const usageByResource = groupBy(usageRecords, 'resource_id');
  const rows = sats.map(sat => {
    const transponders = sat.transponders.map(t => {
      const activeLinks = t.allocated_to.filter(lid =>
        links.find(l => l.id === lid && l.status === 'active')
      ).length;
      const matchingResource = resources.find(r =>
        r.kind === 'satellite_transponder' &&
        r.name.toLowerCase().includes(sat.name.toLowerCase()) &&
        r.name.toLowerCase().includes(t.id.toLowerCase())
      );
      const usedMinutes = (usageByResource.get(matchingResource?.id) ?? [])
        .reduce((sum, u) => sum + u.minutes_used, 0);
      const reservedMinutes = t.allocated_to.length * 720;
      const utilization = reservedMinutes > 0 ? (usedMinutes / reservedMinutes) * 100
        : t.allocated_to.length > 0 ? (activeLinks / Math.max(t.allocated_to.length, 1)) * 100
        : 0;
      return {
        id: t.id,
        band: t.band,
        bandwidth_mhz: t.bandwidth_mhz,
        allocated_links: t.allocated_to.length,
        active_links: activeLinks,
        used_minutes: Math.round(usedMinutes),
        utilization: Math.round(utilization * 10) / 10
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
 * @param {import('../data/stores.js').Contract[]} contracts
 * @param {import('../data/stores.js').Reservation[]} reservations
 * @param {import('../data/stores.js').UsageRecord[]} usageRecords
 * @param {import('../data/stores.js').Resource[]} resources
 * @returns {object}
 */
export function generateLinkAvailabilityReport(links, contracts = [], reservations = [], usageRecords = [], resources = []) {
  const contractById = new Map(contracts.map(c => [c.id, c]));
  const resourceById = new Map(resources.map(r => [r.id, r]));
  const reservationsByLink = groupBy(reservations.filter(r => r.link_id), 'link_id');
  const usageByLink = groupBy(usageRecords.filter(u => u.link_id), 'link_id');
  const rows = links.map(l => {
    const linkReservations = reservationsByLink.get(l.id) ?? [];
    const linkUsage = usageByLink.get(l.id) ?? [];
    const scheduledHours = scheduledHoursForLink(l, linkReservations);
    const usedHours = linkUsage.reduce((sum, u) => sum + (u.minutes_used / 60), 0);
    const availableHours = availableHoursForStatus(l.status, scheduledHours);
    const uptimePercent = scheduledHours > 0 ? (availableHours / scheduledHours) * 100 : 0;
    const contract = contractById.get(l.contract_id) ?? contracts.find(c => c.resource_id === l.resource_id) ?? null;
    const resource = resourceById.get(l.resource_id) ?? null;
    const costEstimate = linkUsage.reduce((sum, u) => sum + (u.cost_estimate || 0), 0);

    return {
      id: l.id,
      name: l.name,
      type: l.type,
      subtype: l.subtype,
      status: l.status,
      resource: resource?.name ?? 'Unassigned',
      billing_model: contract?.billing_model ?? 'unknown',
      billing_label: contract?.label ?? 'N/A',
      reservation_status: linkReservations[0]?.status ?? (l.schedule ? 'scheduled' : 'unscheduled'),
      scheduled_hours: Math.round(scheduledHours * 10) / 10,
      available_hours: Math.round(availableHours * 10) / 10,
      used_hours: Math.round(usedHours * 10) / 10,
      unavailable_hours: Math.round((scheduledHours - availableHours) * 10) / 10,
      uptime_percent: Math.round(uptimePercent * 10) / 10,
      cost_estimate: Math.round(costEstimate * 100) / 100
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
      total_downtime_hours: Math.round(rows.reduce((s, r) => s + r.unavailable_hours, 0) * 10) / 10,
      metered_cost: Math.round(rows.reduce((s, r) => s + r.cost_estimate, 0) * 100) / 100
    },
    generated: new Date().toISOString()
  };
}

/**
 * Generate resource, asset, and link utilization report data.
 * @param {import('../data/stores.js').Resource[]} resources
 * @param {import('../data/stores.js').Contract[]} contracts
 * @param {import('../data/stores.js').Reservation[]} reservations
 * @param {import('../data/stores.js').UsageRecord[]} usageRecords
 * @param {import('../data/stores.js').Asset[]} assets
 * @param {import('../data/stores.js').CommLink[]} links
 * @returns {object}
 */
export function generateUtilizationReport(resources, contracts, reservations, usageRecords, assets, links) {
  const contractByResource = new Map(contracts.map(c => [c.resource_id, c]));
  const assetById = new Map(assets.map(a => [a.id, a]));
  const linkById = new Map(links.map(l => [l.id, l]));

  const resourceRows = resources.map(resource => {
    const contract = contractByResource.get(resource.id);
    const usage = usageRecords.filter(u => u.resource_id === resource.id);
    const reservedMinutes = reservations
      .filter(r => r.resource_id === resource.id && r.status !== 'denied')
      .reduce((sum, r) => sum + minutesBetween(r.start, r.end), 0);
    const usedMinutes = usage.reduce((sum, u) => sum + u.minutes_used, 0);
    const cost = usage.reduce((sum, u) => sum + u.cost_estimate, 0);
    return {
      id: resource.id,
      name: resource.name,
      kind: resource.kind,
      provider: resource.provider,
      billing: contract?.label ?? 'N/A',
      reserved_hours: Math.round((reservedMinutes / 60) * 10) / 10,
      used_hours: Math.round((usedMinutes / 60) * 10) / 10,
      utilization_percent: reservedMinutes > 0 ? Math.round((usedMinutes / reservedMinutes) * 1000) / 10 : 0,
      cost_estimate: Math.round(cost * 100) / 100,
      remaining_minutes: contract?.included_minutes ? Math.max(0, Math.round(contract.included_minutes - usedMinutes)) : null
    };
  });

  const assetRows = [...groupBy(usageRecords.filter(u => u.asset_id), 'asset_id')].map(([assetId, usage]) => ({
    id: assetId,
    callsign: assetById.get(assetId)?.callsign ?? assetId,
    name: assetById.get(assetId)?.name ?? assetId,
    used_hours: Math.round((usage.reduce((sum, u) => sum + u.minutes_used, 0) / 60) * 10) / 10,
    data_mb: Math.round(usage.reduce((sum, u) => sum + u.data_mb, 0) * 10) / 10,
    cost_estimate: Math.round(usage.reduce((sum, u) => sum + u.cost_estimate, 0) * 100) / 100,
    links: new Set(usage.map(u => u.link_id).filter(Boolean)).size
  }));

  const linkRows = links.map(link => {
    const usage = usageRecords.filter(u => u.link_id === link.id);
    return {
      id: link.id,
      name: link.name,
      type: link.type,
      billing: contractByResource.get(link.resource_id)?.label ?? 'N/A',
      used_hours: Math.round((usage.reduce((sum, u) => sum + u.minutes_used, 0) / 60) * 10) / 10,
      data_mb: Math.round(usage.reduce((sum, u) => sum + u.data_mb, 0) * 10) / 10,
      cost_estimate: Math.round(usage.reduce((sum, u) => sum + u.cost_estimate, 0) * 100) / 100,
      resource: linkById.get(link.id)?.resource_id ?? 'Unassigned'
    };
  });

  return {
    resourceRows,
    assetRows,
    linkRows,
    summary: {
      total_cost: Math.round(resourceRows.reduce((sum, r) => sum + r.cost_estimate, 0) * 100) / 100,
      metered_resources: resourceRows.filter(r => r.billing.includes('$') || r.billing.includes('OVERAGE')).length,
      reservation_count: reservations.length
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

function minutesBetween(start, end) {
  const diff = new Date(end).getTime() - new Date(start).getTime();
  return Number.isFinite(diff) && diff > 0 ? diff / 60000 : 0;
}

function hoursBetween(start, end) {
  return minutesBetween(start, end) / 60;
}

function scheduledHoursForLink(link, linkReservations) {
  if (linkReservations.length > 0) {
    return linkReservations.reduce((sum, r) => sum + hoursBetween(r.start, r.end), 0);
  }
  if (link.schedule) {
    return hoursBetween(link.schedule.start, link.schedule.end);
  }
  return 24;
}

function availableHoursForStatus(status, scheduledHours) {
  if (status === 'active') return scheduledHours;
  if (status === 'degraded') return scheduledHours * 0.7;
  return 0;
}

function groupBy(rows, key) {
  const grouped = new Map();
  for (const row of rows) {
    const groupKey = row[key];
    if (!grouped.has(groupKey)) grouped.set(groupKey, []);
    grouped.get(groupKey).push(row);
  }
  return grouped;
}
