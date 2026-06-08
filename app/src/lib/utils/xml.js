/**
 * Commlink-Directory XML v1.0 / v1.1 import and export.
 * Aligns with Commlink-Directory directory-xml.js and enterprise-contact-directory.xsd.
 */

// ─── XML DOM helpers ─────────────────────────────────────

/** @param {Element} parent @param {string} tag */
function directChild(parent, tag) {
  for (let i = 0; i < parent.childNodes.length; i++) {
    const node = parent.childNodes[i];
    if (node.nodeType === 1 && node.tagName === tag) return /** @type {Element} */ (node);
  }
  return null;
}

/** @param {Element} parent @param {string} tag */
function directChildren(parent, tag) {
  /** @type {Element[]} */
  const out = [];
  for (let i = 0; i < parent.childNodes.length; i++) {
    const node = parent.childNodes[i];
    if (node.nodeType === 1 && node.tagName === tag) out.push(/** @type {Element} */ (node));
  }
  return out;
}

/** @param {Element} parent @param {string} tag */
function getText(parent, tag) {
  const el = directChild(parent, tag);
  return el ? el.textContent.trim() : '';
}

/** @param {Element} el @param {string} name */
function getAttr(el, name) {
  const v = el.getAttribute(name);
  return v === null ? '' : v.trim();
}

/** @param {string} str */
function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** @param {string} contactRef */
function contactRefToAssetId(contactRef) {
  return `asset-${contactRef}`;
}

/** @param {string} assetId */
function assetIdToContactRef(assetId) {
  return assetId.startsWith('asset-') ? assetId.slice(6) : assetId;
}

// ─── Parse v1.1 sections ─────────────────────────────────

/** @param {Element} el */
function parseContactElement(el) {
  const contactId = getAttr(el, 'id');
  const platform = getAttr(el, 'platform') || 'site';
  const name = getText(el, 'Name');
  const location = getText(el, 'Location');
  const department = getText(el, 'Department');
  const notes = getText(el, 'Notes');

  const posEl = directChild(el, 'Position');
  const lat = posEl ? parseFloat(getAttr(posEl, 'lat')) : NaN;
  const lon = posEl ? parseFloat(getAttr(posEl, 'lon')) : NaN;
  const alt_m = posEl && getAttr(posEl, 'alt_m') ? parseFloat(getAttr(posEl, 'alt_m')) : (platform === 'aircraft' ? 0 : 0);

  const capabilities = [];
  const capsEl = directChild(el, 'Capabilities');
  if (capsEl) {
    directChildren(capsEl, 'Capability').forEach((capEl) => {
      capabilities.push({
        kind: getAttr(capEl, 'kind'),
        resourceRef: getAttr(capEl, 'resourceRef'),
      });
    });
  }

  const voipEl = directChild(el, 'VoIP');
  const voipData = voipEl ? {
    ip: getText(voipEl, 'IP'),
    port: getText(voipEl, 'Port') || '5060',
    extension: getText(voipEl, 'Extension'),
    codec: getText(voipEl, 'Codec'),
    protocol: getText(voipEl, 'Protocol') || 'SIP',
    transport: getText(voipEl, 'Transport') || 'UDP',
  } : null;

  const xmppEl = directChild(el, 'XMPP');
  const xmppData = xmppEl ? {
    jid: getText(xmppEl, 'JID'),
    server: getText(xmppEl, 'Server'),
    ip: getText(xmppEl, 'IP'),
    port: getText(xmppEl, 'Port') || '5222',
    encryption: getText(xmppEl, 'Encryption') || 'STARTTLS',
    conference: getText(xmppEl, 'Conference'),
  } : null;

  const customServices = [];
  const customEl = directChild(el, 'CustomServices');
  if (customEl) {
    directChildren(customEl, 'Service').forEach((sEl) => {
      customServices.push({
        name: getText(sEl, 'ServiceName'),
        ip: getText(sEl, 'IP'),
        port: getText(sEl, 'Port'),
        description: getText(sEl, 'Description'),
      });
    });
  }

  const notesParts = [location, notes].filter(Boolean).join(' - ');
  const timestamp = getText(el, 'UpdatedAt') || getText(el, 'CreatedAt') || new Date().toISOString();

  return {
    id: contactRefToAssetId(contactId),
    name,
    callsign: name.replace(/\s+/g, '-').toUpperCase().substring(0, 12),
    platform: /** @type {'site'|'mobile'|'aircraft'} */ (platform),
    position: {
      lat: Number.isFinite(lat) ? lat : 34.05,
      lon: Number.isFinite(lon) ? lon : -118.24,
      alt_m: Number.isFinite(alt_m) ? alt_m : 0,
      heading_deg: 0,
      speed_kts: 0,
      timestamp,
    },
    status: /** @type {'active'|'inactive'|'maintenance'} */ ('active'),
    commlinks: [],
    addressbook_ref: contactId,
    icon: platform,
    metadata: {
      department,
      notes: notesParts,
      capabilities: capabilities.length ? capabilities : undefined,
      voip: voipData,
      xmpp: xmppData,
      customServices: customServices.length ? customServices : undefined,
    },
  };
}

/** @param {Element} el */
function parseResourceElement(el) {
  const capEl = directChild(el, 'Capacity');
  return {
    id: getAttr(el, 'id'),
    kind: /** @type {import('../data/stores.js').Resource['kind']} */ (getAttr(el, 'kind')),
    name: getText(el, 'Name'),
    owner: getText(el, 'Owner'),
    provider: getAttr(el, 'provider'),
    status: /** @type {import('../data/stores.js').Resource['status']} */ (getAttr(el, 'status') || 'operational'),
    capacity: capEl ? {
      bandwidth_khz: getAttr(capEl, 'bandwidth_khz') ? parseFloat(getAttr(capEl, 'bandwidth_khz')) : null,
      channels: getAttr(capEl, 'channels') ? parseInt(getAttr(capEl, 'channels'), 10) : null,
      max_concurrent_links: getAttr(capEl, 'maxConcurrentLinks')
        ? parseInt(getAttr(capEl, 'maxConcurrentLinks'), 10)
        : null,
      coverage_area: getAttr(capEl, 'coverageArea') || null,
    } : {},
    availability_windows: directChildren(el, 'Availability').map((avEl) => ({
      start: getAttr(avEl, 'start'),
      end: getAttr(avEl, 'end'),
      recurrence: /** @type {'none'|'daily'|'weekly'} */ (getAttr(avEl, 'recurrence') || 'none'),
    })),
    asset_id: null,
    link_ids: [],
  };
}

/** @param {Element} el */
function parseContractElement(el) {
  const incEl = directChild(el, 'Included');
  const incDataEl = directChild(el, 'IncludedData');
  const ovEl = directChild(el, 'Overage');
  const ovDataEl = directChild(el, 'OverageData');
  return {
    id: getAttr(el, 'id'),
    resource_id: getAttr(el, 'resourceRef'),
    billing_model: /** @type {import('../data/stores.js').Contract['billing_model']} */ (getAttr(el, 'billingModel')),
    label: getAttr(el, 'label'),
    priority_class: getAttr(el, 'priorityClass') || null,
    included_minutes: incEl && getAttr(incEl, 'minutes') ? parseInt(getAttr(incEl, 'minutes'), 10) : null,
    included_data_mb: (incEl && getAttr(incEl, 'data_mb'))
      ? parseInt(getAttr(incEl, 'data_mb'), 10)
      : (incDataEl && getAttr(incDataEl, 'data_mb') ? parseInt(getAttr(incDataEl, 'data_mb'), 10) : null),
    overage_rate: ovEl && getAttr(ovEl, 'rate') ? parseFloat(getAttr(ovEl, 'rate')) : (ovDataEl ? parseFloat(getAttr(ovDataEl, 'rate')) : null),
    currency: ovEl ? getAttr(ovEl, 'currency') : (ovDataEl ? getAttr(ovDataEl, 'currency') : 'USD'),
  };
}

/** @param {Element} el @param {Map<string, string>} contactToAsset */
function parseCommLinkElement(el, contactToAsset) {
  const linkId = getAttr(el, 'id');
  const type = getAttr(el, 'type');
  const subtype = getAttr(el, 'subtype') || null;
  const endpoints = directChildren(el, 'Endpoint').map((epEl) => {
    const ref = getAttr(epEl, 'contactRef');
    return contactToAsset.get(ref) || contactRefToAssetId(ref);
  });

  const schedEl = directChild(el, 'Schedule');
  const schedule = schedEl ? {
    start: getAttr(schedEl, 'start'),
    end: getAttr(schedEl, 'end'),
    recurrence: getAttr(schedEl, 'recurrence') || 'daily',
  } : null;

  const freqEl = directChild(el, 'Frequency');
  const frequency = freqEl ? {
    value_mhz: getAttr(freqEl, 'value_mhz') ? parseFloat(getAttr(freqEl, 'value_mhz')) : null,
    bandwidth_khz: getAttr(freqEl, 'bandwidth_khz') ? parseFloat(getAttr(freqEl, 'bandwidth_khz')) : null,
    polarization: null,
    modulation: null,
  } : { value_mhz: null, bandwidth_khz: null, polarization: null, modulation: null };

  const endpointNames = endpoints.map((id) => id.replace('asset-', '')).join(' / ');

  return {
    id: linkId,
    name: `${type}${subtype ? ` (${subtype})` : ''}: ${endpointNames}`.substring(0, 80),
    type: /** @type {import('../data/stores.js').CommLink['type']} */ (type),
    subtype,
    status: /** @type {import('../data/stores.js').CommLink['status']} */ ('active'),
    endpoints,
    frequency,
    satellite: type === 'satellite' ? {
      name: subtype || 'SATCOM',
      orbit: subtype || 'GEO',
      position_deg_w: null,
      transponder: getAttr(el, 'resourceRef'),
      provider: '',
    } : null,
    schedule,
    quality: { signal_strength_dbm: null, ber: null, latency_ms: null },
    resource_id: getAttr(el, 'resourceRef') || null,
    contract_id: getAttr(el, 'contractRef') || null,
  };
}

/** @param {Element} el @param {Map<string, import('../data/stores.js').CommLink>} linksById */
function parseReservationElement(el, linksById) {
  const linkRef = getAttr(el, 'linkRef') || null;
  const link = linkRef ? linksById.get(linkRef) : null;
  const winEl = directChild(el, 'Window');
  return {
    id: getAttr(el, 'id'),
    resource_id: getAttr(el, 'resourceRef'),
    link_id: linkRef || null,
    asset_ids: link ? [...link.endpoints] : [],
    start: winEl ? getAttr(winEl, 'start') : '',
    end: winEl ? getAttr(winEl, 'end') : '',
    status: /** @type {import('../data/stores.js').Reservation['status']} */ (getAttr(el, 'status') || 'requested'),
    priority: /** @type {import('../data/stores.js').Reservation['priority']} */ (getAttr(el, 'priority') || 'routine'),
    mission: getText(el, 'Mission'),
    requested_by: 'Directory import',
    approved_by: getAttr(el, 'status') === 'approved' || getAttr(el, 'status') === 'active' ? 'Schedule' : null,
    bandwidth_khz: null,
  };
}

/**
 * Parse Commlink-Directory XML into planning store shapes.
 * @param {string} xmlString
 * @returns {{
 *   version: string,
 *   exported: string|null,
 *   assets: import('../data/stores.js').Asset[],
 *   commLinks: import('../data/stores.js').CommLink[],
 *   resources: import('../data/stores.js').Resource[],
 *   contracts: import('../data/stores.js').Contract[],
 *   reservations: import('../data/stores.js').Reservation[],
 *   errors: string[]
 * }}
 */
export function parseDirectoryXML(xmlString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'application/xml');
  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    return {
      version: '1.0',
      exported: null,
      assets: [],
      commLinks: [],
      resources: [],
      contracts: [],
      reservations: [],
      errors: ['Invalid XML: ' + parseError.textContent],
    };
  }

  const root = doc.documentElement;
  const version = getAttr(root, 'version') || '1.0';
  const exported = getAttr(root, 'exported') || null;
  /** @type {string[]} */
  const errors = [];

  /** @type {import('../data/stores.js').Asset[]} */
  const assets = [];
  const contactsWrapper = directChild(root, 'Contacts');
  if (contactsWrapper) {
    directChildren(contactsWrapper, 'Contact').forEach((el) => {
      try { assets.push(parseContactElement(el)); } catch (e) { errors.push(`Contact: ${e.message}`); }
    });
  }
  directChildren(root, 'Contact').forEach((el) => {
    try { assets.push(parseContactElement(el)); } catch (e) { errors.push(`Contact: ${e.message}`); }
  });

  if (assets.length === 0) {
    errors.push('No contacts found in XML');
  }

  const contactToAsset = new Map(assets.map((a) => [a.addressbook_ref, a.id]));

  /** @type {import('../data/stores.js').Resource[]} */
  const resources = [];
  const resourcesWrapper = directChild(root, 'Resources');
  if (resourcesWrapper) {
    directChildren(resourcesWrapper, 'Resource').forEach((el) => {
      try { resources.push(parseResourceElement(el)); } catch (e) { errors.push(`Resource: ${e.message}`); }
    });
  }

  /** @type {import('../data/stores.js').Contract[]} */
  const contracts = [];
  const contractsWrapper = directChild(root, 'Contracts');
  if (contractsWrapper) {
    directChildren(contractsWrapper, 'Contract').forEach((el) => {
      try { contracts.push(parseContractElement(el)); } catch (e) { errors.push(`Contract: ${e.message}`); }
    });
  }

  /** @type {import('../data/stores.js').CommLink[]} */
  const commLinks = [];
  const commLinksWrapper = directChild(root, 'CommLinks');
  if (commLinksWrapper) {
    directChildren(commLinksWrapper, 'CommLink').forEach((el) => {
      try { commLinks.push(parseCommLinkElement(el, contactToAsset)); } catch (e) { errors.push(`CommLink: ${e.message}`); }
    });
  }

  const linksById = new Map(commLinks.map((l) => [l.id, l]));

  /** @type {import('../data/stores.js').Reservation[]} */
  const reservations = [];
  const reservationsWrapper = directChild(root, 'Reservations');
  if (reservationsWrapper) {
    directChildren(reservationsWrapper, 'Reservation').forEach((el) => {
      try { reservations.push(parseReservationElement(el, linksById)); } catch (e) { errors.push(`Reservation: ${e.message}`); }
    });
  }

  // Patch resource link_ids and asset commlinks from imported links
  for (const link of commLinks) {
    if (link.resource_id) {
      const resource = resources.find((r) => r.id === link.resource_id);
      if (resource && !resource.link_ids.includes(link.id)) {
        resource.link_ids.push(link.id);
      }
    }
    for (const assetId of link.endpoints) {
      const asset = assets.find((a) => a.id === assetId);
      if (asset && !asset.commlinks.includes(link.id)) {
        asset.commlinks.push(link.id);
      }
    }
  }

  // MCC resources may reference a mobile asset via capabilities
  for (const asset of assets) {
    const mccCap = asset.metadata?.capabilities?.find((c) => c.kind === 'mcc');
    if (mccCap) {
      const resource = resources.find((r) => r.id === mccCap.resourceRef);
      if (resource) resource.asset_id = asset.id;
    }
  }

  return { version, exported, assets, commLinks, resources, contracts, reservations, errors };
}

/**
 * @param {string} xmlString
 * @returns {{ assets: import('../data/stores.js').Asset[], errors: string[] }}
 */
export function parseCommLinkXML(xmlString) {
  const doc = parseDirectoryXML(xmlString);
  return { assets: doc.assets, errors: doc.errors };
}

/**
 * Export full Directory v1.1 document from planning stores.
 * @param {{
 *   assets: import('../data/stores.js').Asset[],
 *   commLinks?: import('../data/stores.js').CommLink[],
 *   resources?: import('../data/stores.js').Resource[],
 *   contracts?: import('../data/stores.js').Contract[],
 *   reservations?: import('../data/stores.js').Reservation[],
 *   exported?: string,
 * }} data
 * @returns {string}
 */
export function exportDirectoryXML(data) {
  const {
    assets,
    commLinks = [],
    resources = [],
    contracts = [],
    reservations = [],
    exported = new Date().toISOString(),
  } = data;

  const useV11 = resources.length > 0 || commLinks.length > 0 || contracts.length > 0 || reservations.length > 0;
  const version = useV11 ? '1.1' : '1.0';

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<?xml-stylesheet type="text/xsl" href="enterprise-contact-directory.xsl"?>\n`;
  xml += `<EnterpriseContactDirectory exported="${esc(exported)}" version="${version}">\n`;

  if (useV11) xml += `  <Contacts>\n`;
  const contactPad = useV11 ? '    ' : '  ';

  for (const asset of assets) {
    const ref = asset.addressbook_ref || assetIdToContactRef(asset.id);
    xml += `${contactPad}<Contact id="${esc(ref)}" platform="${esc(asset.platform)}">\n`;
    xml += `${contactPad}  <Name>${esc(asset.name)}</Name>\n`;

    const notesParts = (asset.metadata?.notes || '').split(' - ');
    const loc = notesParts[0] || '';
    const note = notesParts.slice(1).join(' - ');
    if (loc) xml += `${contactPad}  <Location>${esc(loc)}</Location>\n`;
    if (asset.metadata?.department) xml += `${contactPad}  <Department>${esc(asset.metadata.department)}</Department>\n`;
    if (note) xml += `${contactPad}  <Notes>${esc(note)}</Notes>\n`;
    xml += `${contactPad}  <UpdatedAt>${esc(asset.position.timestamp || exported)}</UpdatedAt>\n`;

    if (asset.position) {
      xml += `${contactPad}  <Position lat="${asset.position.lat}" lon="${asset.position.lon}"`;
      if (asset.position.alt_m) xml += ` alt_m="${asset.position.alt_m}"`;
      xml += ` />\n`;
    }

    const caps = asset.metadata?.capabilities;
    if (caps?.length) {
      xml += `${contactPad}  <Capabilities>\n`;
      for (const cap of caps) {
        xml += `${contactPad}    <Capability kind="${esc(cap.kind)}" resourceRef="${esc(cap.resourceRef)}" />\n`;
      }
      xml += `${contactPad}  </Capabilities>\n`;
    }

    const v = asset.metadata?.voip;
    if (v?.ip) {
      xml += `${contactPad}  <VoIP>\n`;
      xml += `${contactPad}    <IP>${esc(v.ip)}</IP>\n`;
      if (v.port) xml += `${contactPad}    <Port>${esc(v.port)}</Port>\n`;
      if (v.extension) xml += `${contactPad}    <Extension>${esc(v.extension)}</Extension>\n`;
      if (v.codec) xml += `${contactPad}    <Codec>${esc(v.codec)}</Codec>\n`;
      if (v.protocol) xml += `${contactPad}    <Protocol>${esc(v.protocol)}</Protocol>\n`;
      if (v.transport) xml += `${contactPad}    <Transport>${esc(v.transport)}</Transport>\n`;
      xml += `${contactPad}  </VoIP>\n`;
    }

    const x = asset.metadata?.xmpp;
    if (x?.jid) {
      xml += `${contactPad}  <XMPP>\n`;
      xml += `${contactPad}    <JID>${esc(x.jid)}</JID>\n`;
      if (x.server) xml += `${contactPad}    <Server>${esc(x.server)}</Server>\n`;
      if (x.ip) xml += `${contactPad}    <IP>${esc(x.ip)}</IP>\n`;
      if (x.port) xml += `${contactPad}    <Port>${esc(x.port)}</Port>\n`;
      if (x.encryption) xml += `${contactPad}    <Encryption>${esc(x.encryption)}</Encryption>\n`;
      if (x.conference) xml += `${contactPad}    <Conference>${esc(x.conference)}</Conference>\n`;
      xml += `${contactPad}  </XMPP>\n`;
    }

    const cs = asset.metadata?.customServices;
    if (cs?.length) {
      xml += `${contactPad}  <CustomServices>\n`;
      for (const s of cs) {
        xml += `${contactPad}    <Service>\n`;
        xml += `${contactPad}      <ServiceName>${esc(s.name)}</ServiceName>\n`;
        if (s.ip) xml += `${contactPad}      <IP>${esc(s.ip)}</IP>\n`;
        if (s.port) xml += `${contactPad}      <Port>${esc(s.port)}</Port>\n`;
        if (s.description) xml += `${contactPad}      <Description>${esc(s.description)}</Description>\n`;
        xml += `${contactPad}    </Service>\n`;
      }
      xml += `${contactPad}  </CustomServices>\n`;
    }

    xml += `${contactPad}</Contact>\n\n`;
  }

  if (useV11) xml += `  </Contacts>\n\n`;

  if (resources.length) {
    xml += `  <Resources>\n`;
    for (const r of resources) {
      xml += `    <Resource id="${esc(r.id)}" kind="${esc(r.kind)}" provider="${esc(r.provider)}" status="${esc(r.status)}">\n`;
      xml += `      <Name>${esc(r.name)}</Name>\n`;
      if (r.owner) xml += `      <Owner>${esc(r.owner)}</Owner>\n`;
      const c = r.capacity;
      if (c && (c.bandwidth_khz || c.channels || c.max_concurrent_links)) {
        xml += `      <Capacity`;
        if (c.bandwidth_khz) xml += ` bandwidth_khz="${c.bandwidth_khz}"`;
        if (c.channels) xml += ` channels="${c.channels}"`;
        if (c.max_concurrent_links) xml += ` maxConcurrentLinks="${c.max_concurrent_links}"`;
        if (c.coverage_area) xml += ` coverageArea="${esc(c.coverage_area)}"`;
        xml += ` />\n`;
      }
      for (const av of r.availability_windows || []) {
        xml += `      <Availability start="${esc(av.start)}" end="${esc(av.end)}"`;
        if (av.recurrence) xml += ` recurrence="${esc(av.recurrence)}"`;
        xml += ` />\n`;
      }
      xml += `    </Resource>\n`;
    }
    xml += `  </Resources>\n\n`;
  }

  if (contracts.length) {
    xml += `  <Contracts>\n`;
    for (const c of contracts) {
      xml += `    <Contract id="${esc(c.id)}" resourceRef="${esc(c.resource_id)}" billingModel="${esc(c.billing_model)}" label="${esc(c.label)}"`;
      if (c.priority_class) xml += ` priorityClass="${esc(c.priority_class)}"`;
      xml += `>\n`;
      if (c.included_minutes || c.included_data_mb) {
        xml += `      <Included`;
        if (c.included_minutes) xml += ` minutes="${c.included_minutes}"`;
        if (c.included_data_mb) xml += ` data_mb="${c.included_data_mb}"`;
        xml += ` />\n`;
      }
      if (c.overage_rate != null && c.billing_model !== 'owned') {
        const unit = c.billing_model === 'pay_per_mb' ? 'mb' : 'minute';
        xml += `      <Overage rate="${c.overage_rate}" currency="${esc(c.currency || 'USD')}" unit="${unit}" />\n`;
      }
      xml += `    </Contract>\n`;
    }
    xml += `  </Contracts>\n\n`;
  }

  if (commLinks.length) {
    xml += `  <CommLinks>\n`;
    for (const link of commLinks) {
      xml += `    <CommLink id="${esc(link.id)}" type="${esc(link.type)}"`;
      if (link.subtype) xml += ` subtype="${esc(link.subtype)}"`;
      if (link.resource_id) xml += ` resourceRef="${esc(link.resource_id)}"`;
      if (link.contract_id) xml += ` contractRef="${esc(link.contract_id)}"`;
      xml += `>\n`;
      for (const ep of link.endpoints) {
        xml += `      <Endpoint contactRef="${esc(assetIdToContactRef(ep))}" />\n`;
      }
      if (link.schedule) {
        xml += `      <Schedule start="${esc(link.schedule.start)}" end="${esc(link.schedule.end)}"`;
        if (link.schedule.recurrence) xml += ` recurrence="${esc(link.schedule.recurrence)}"`;
        xml += ` />\n`;
      }
      if (link.frequency?.value_mhz) {
        xml += `      <Frequency value_mhz="${link.frequency.value_mhz}"`;
        if (link.frequency.bandwidth_khz) xml += ` bandwidth_khz="${link.frequency.bandwidth_khz}"`;
        xml += ` />\n`;
      }
      xml += `    </CommLink>\n`;
    }
    xml += `  </CommLinks>\n\n`;
  }

  if (reservations.length) {
    xml += `  <Reservations>\n`;
    for (const r of reservations) {
      xml += `    <Reservation id="${esc(r.id)}" resourceRef="${esc(r.resource_id)}"`;
      if (r.link_id) xml += ` linkRef="${esc(r.link_id)}"`;
      xml += ` status="${esc(r.status)}" priority="${esc(r.priority)}">\n`;
      xml += `      <Window start="${esc(r.start)}" end="${esc(r.end)}" />\n`;
      if (r.mission) xml += `      <Mission>${esc(r.mission)}</Mission>\n`;
      xml += `    </Reservation>\n`;
    }
    xml += `  </Reservations>\n\n`;
  }

  xml += `</EnterpriseContactDirectory>\n`;
  return xml;
}

/**
 * @param {import('../data/stores.js').Asset[]} assets
 * @returns {string}
 */
export function exportCommLinkXML(assets) {
  return exportDirectoryXML({ assets });
}

/** @param {string} content @param {string} filename @param {string} [mimeType] */
export function downloadFile(content, filename, mimeType = 'application/xml') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** @param {number} count @param {boolean} [v11] */
export function generateExportFilename(count, v11 = false) {
  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const time = now.toISOString().split('T')[1].replace(/[:.]/g, '').substring(0, 6);
  const suffix = v11 ? 'directory-v1.1' : 'contacts';
  return `enterprise-contact-directory_${date}_${time}_${count}-${suffix}.xml`;
}
