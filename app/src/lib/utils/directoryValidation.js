/**
 * Source-data validation for Commlink-Directory imports.
 * Answers data-quality questions before o-my / o-my-sim handoff.
 */

/**
 * @typedef {'error'|'warning'|'info'} ValidationSeverity
 * @typedef {{
 *   severity: ValidationSeverity,
 *   code: string,
 *   message: string,
 *   entity_type: string,
 *   entity_id: string
 * }} ValidationIssue
 */

/**
 * @param {import('../data/stores.js').Resource[]} resources
 * @param {import('../data/stores.js').Reservation[]} reservations
 */
function detectReservationConflicts(resources, reservations) {
  return resources.map((resource) => {
    const activeReservations = reservations
      .filter((r) => r.resource_id === resource.id && !['denied', 'completed'].includes(r.status))
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    const capacity = resource.capacity.max_concurrent_links ?? 1;
    const conflicts = [];
    for (const reservation of activeReservations) {
      const overlapping = activeReservations.filter(
        (other) =>
          other.id !== reservation.id &&
          new Date(other.start).getTime() < new Date(reservation.end).getTime() &&
          new Date(other.end).getTime() > new Date(reservation.start).getTime()
      );
      if (overlapping.length + 1 > capacity) {
        conflicts.push({ reservation, overlapping });
      }
    }
    return { resource_id: resource.id, capacity, conflicts };
  }).filter((row) => row.conflicts.length > 0);
}

/**
 * Validate imported planning data against cross-repo integration rules.
 * @param {{
 *   assets: import('../data/stores.js').Asset[],
 *   commLinks: import('../data/stores.js').CommLink[],
 *   resources: import('../data/stores.js').Resource[],
 *   contracts: import('../data/stores.js').Contract[],
 *   reservations: import('../data/stores.js').Reservation[],
 *   usageRecords?: import('../data/stores.js').UsageRecord[],
 * }} state
 */
export function validateSourceData(state) {
  const { assets, commLinks, resources, contracts, reservations, usageRecords = [] } = state;
  /** @type {ValidationIssue[]} */
  const issues = [];

  const assetIds = new Set(assets.map((a) => a.id));
  const contactRefs = new Set(assets.map((a) => a.addressbook_ref));
  const resourceIds = new Set(resources.map((r) => r.id));
  const contractIds = new Set(contracts.map((c) => c.id));
  const contractsByResource = new Map(contracts.map((c) => [c.resource_id, c]));
  const usageByResource = new Map();
  for (const row of usageRecords) {
    if (!usageByResource.has(row.resource_id)) usageByResource.set(row.resource_id, []);
    usageByResource.get(row.resource_id).push(row);
  }

  for (const asset of assets) {
    const hasPosition = asset.position && Number.isFinite(asset.position.lat) && Number.isFinite(asset.position.lon);
    const defaultPos = hasPosition && Math.abs(asset.position.lat - 34.05) < 0.001 && Math.abs(asset.position.lon + 118.24) < 0.001;
    if (!hasPosition) {
      issues.push({
        severity: 'warning',
        code: 'CONTACT_MISSING_POSITION',
        message: `${asset.name} has no geospatial position (needed for map and o-my-sim display).`,
        entity_type: 'asset',
        entity_id: asset.id,
      });
    } else if (defaultPos && !asset.metadata?.capabilities?.length) {
      issues.push({
        severity: 'info',
        code: 'CONTACT_DEFAULT_POSITION',
        message: `${asset.name} uses the default CONUS placeholder position.`,
        entity_type: 'asset',
        entity_id: asset.id,
      });
    }
  }

  for (const resource of resources) {
    if (!contractsByResource.has(resource.id)) {
      issues.push({
        severity: 'warning',
        code: 'RESOURCE_NO_CONTRACT',
        message: `Resource ${resource.name} (${resource.id}) has no billing contract.`,
        entity_type: 'resource',
        entity_id: resource.id,
      });
    }
    if (resource.status === 'maintenance') {
      issues.push({
        severity: 'warning',
        code: 'RESOURCE_MAINTENANCE',
        message: `Resource ${resource.name} is in maintenance — dependent links may be unavailable.`,
        entity_type: 'resource',
        entity_id: resource.id,
      });
    }
  }

  for (const link of commLinks) {
    if (!link.resource_id) {
      issues.push({
        severity: 'error',
        code: 'LINK_NO_RESOURCE',
        message: `Comm link ${link.name} (${link.id}) has no backing resource.`,
        entity_type: 'comm_link',
        entity_id: link.id,
      });
    } else if (!resourceIds.has(link.resource_id)) {
      issues.push({
        severity: 'error',
        code: 'LINK_UNKNOWN_RESOURCE',
        message: `Comm link ${link.id} references unknown resource ${link.resource_id}.`,
        entity_type: 'comm_link',
        entity_id: link.id,
      });
    }

    if (link.contract_id && !contractIds.has(link.contract_id)) {
      issues.push({
        severity: 'error',
        code: 'LINK_UNKNOWN_CONTRACT',
        message: `Comm link ${link.id} references unknown contract ${link.contract_id}.`,
        entity_type: 'comm_link',
        entity_id: link.id,
      });
    }

    for (const ep of link.endpoints) {
      if (!assetIds.has(ep)) {
        issues.push({
          severity: 'error',
          code: 'LINK_UNKNOWN_CONTACT',
          message: `Comm link ${link.id} references unknown endpoint ${ep}.`,
          entity_type: 'comm_link',
          entity_id: link.id,
        });
      }
    }

    const contract = link.resource_id ? contractsByResource.get(link.resource_id) : null;
    if (contract && ['pay_per_minute', 'pay_per_mb', 'hybrid'].includes(contract.billing_model)) {
      const usage = usageByResource.get(link.resource_id) || [];
      const usedMinutes = usage.reduce((sum, u) => sum + (u.minutes_used || 0), 0);
      const usedMb = usage.reduce((sum, u) => sum + (u.data_mb || 0), 0);
      const approvedReservation = reservations.some(
        (r) => r.link_id === link.id && ['approved', 'active'].includes(r.status)
      );

      if (!approvedReservation && link.schedule) {
        issues.push({
          severity: 'warning',
          code: 'METERED_NO_APPROVAL',
          message: `Metered link ${link.name} is scheduled without an approved reservation.`,
          entity_type: 'comm_link',
          entity_id: link.id,
        });
      }

      if (contract.included_minutes != null && usedMinutes > contract.included_minutes) {
        issues.push({
          severity: 'warning',
          code: 'METERED_OVER_MINUTES',
          message: `Resource ${link.resource_id} exceeded included minutes (${usedMinutes}/${contract.included_minutes}).`,
          entity_type: 'resource',
          entity_id: link.resource_id,
        });
      }

      if (contract.included_data_mb != null && usedMb > contract.included_data_mb) {
        issues.push({
          severity: 'warning',
          code: 'METERED_OVER_DATA',
          message: `Resource ${link.resource_id} exceeded included data (${usedMb}MB/${contract.included_data_mb}MB).`,
          entity_type: 'resource',
          entity_id: link.resource_id,
        });
      }
    }
  }

  for (const reservation of reservations) {
    if (!resourceIds.has(reservation.resource_id)) {
      issues.push({
        severity: 'error',
        code: 'RESERVATION_UNKNOWN_RESOURCE',
        message: `Reservation ${reservation.id} references unknown resource ${reservation.resource_id}.`,
        entity_type: 'reservation',
        entity_id: reservation.id,
      });
    }
    if (reservation.link_id && !commLinks.some((l) => l.id === reservation.link_id)) {
      issues.push({
        severity: 'error',
        code: 'RESERVATION_UNKNOWN_LINK',
        message: `Reservation ${reservation.id} references unknown link ${reservation.link_id}.`,
        entity_type: 'reservation',
        entity_id: reservation.id,
      });
    }
  }

  const conflictRows = detectReservationConflicts(resources, reservations);
  for (const row of conflictRows) {
    for (const conflict of row.conflicts) {
      issues.push({
        severity: 'error',
        code: 'RESERVATION_OVER_CAPACITY',
        message: `Reservation ${conflict.reservation.id} on ${row.resource_id} exceeds max concurrent links (${row.capacity}).`,
        entity_type: 'reservation',
        entity_id: conflict.reservation.id,
      });
    }
  }

  // Transponder conflict: multiple active links on single-channel resource
  for (const resource of resources) {
    const maxLinks = resource.capacity.max_concurrent_links ?? 1;
    if (maxLinks === 1) {
      const activeLinks = commLinks.filter((l) => l.resource_id === resource.id && l.status !== 'unavailable');
      if (activeLinks.length > 1) {
        issues.push({
          severity: 'warning',
          code: 'TRANSPONDER_CONFLICT',
          message: `Resource ${resource.name} allows one link but ${activeLinks.length} are active (${activeLinks.map((l) => l.id).join(', ')}).`,
          entity_type: 'resource',
          entity_id: resource.id,
        });
      }
    }
  }

  const errors = issues.filter((i) => i.severity === 'error').length;
  const warnings = issues.filter((i) => i.severity === 'warning').length;

  return {
    issues,
    summary: {
      errors,
      warnings,
      infos: issues.filter((i) => i.severity === 'info').length,
      ready_for_handoff: errors === 0,
      contact_count: assets.length,
      resource_count: resources.length,
      link_count: commLinks.length,
      reservation_count: reservations.length,
      contact_refs: [...contactRefs],
    },
    generated: new Date().toISOString(),
  };
}
