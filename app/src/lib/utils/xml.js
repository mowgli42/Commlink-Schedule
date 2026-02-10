/**
 * Commlink-Directory XML Import/Export utilities.
 * Handles conversion between Commlink-Directory XML format and internal asset model.
 * Preserves VoIP, XMPP, and CustomServices data in metadata.
 */

/**
 * Parse Commlink-Directory XML string into asset objects.
 * @param {string} xmlString - Raw XML content
 * @returns {{ assets: import('../data/stores.js').Asset[], errors: string[] }}
 */
export function parseCommLinkXML(xmlString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'application/xml');
  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    return { assets: [], errors: ['Invalid XML: ' + parseError.textContent] };
  }

  const contacts = doc.querySelectorAll('Contact');
  /** @type {import('../data/stores.js').Asset[]} */
  const assets = [];
  /** @type {string[]} */
  const errors = [];

  contacts.forEach((contact, idx) => {
    try {
      const id = contact.getAttribute('id') || `imported-${idx}`;
      const platform = contact.getAttribute('platform') || 'site';
      const name = contact.querySelector('Name')?.textContent || 'Unknown';
      const location = contact.querySelector('Location')?.textContent || '';
      const department = contact.querySelector('Department')?.textContent || '';
      const notes = contact.querySelector('Notes')?.textContent || '';

      // Extract VoIP data
      const voip = contact.querySelector('VoIP');
      const voipData = voip ? {
        ip: voip.querySelector('IP')?.textContent || '',
        port: voip.querySelector('Port')?.textContent || '',
        extension: voip.querySelector('Extension')?.textContent || '',
        codec: voip.querySelector('Codec')?.textContent || '',
        protocol: voip.querySelector('Protocol')?.textContent || '',
        transport: voip.querySelector('Transport')?.textContent || ''
      } : null;

      // Extract XMPP data
      const xmpp = contact.querySelector('XMPP');
      const xmppData = xmpp ? {
        jid: xmpp.querySelector('JID')?.textContent || '',
        server: xmpp.querySelector('Server')?.textContent || '',
        ip: xmpp.querySelector('IP')?.textContent || '',
        port: xmpp.querySelector('Port')?.textContent || '',
        encryption: xmpp.querySelector('Encryption')?.textContent || '',
        conference: xmpp.querySelector('Conference')?.textContent || ''
      } : null;

      // Extract CustomServices
      const customServices = [];
      contact.querySelectorAll('CustomServices > Service').forEach(svc => {
        customServices.push({
          name: svc.querySelector('ServiceName')?.textContent || '',
          ip: svc.querySelector('IP')?.textContent || '',
          port: svc.querySelector('Port')?.textContent || '',
          description: svc.querySelector('Description')?.textContent || ''
        });
      });

      const notesParts = [location, notes].filter(Boolean).join(' - ');

      assets.push({
        id: `asset-${id}`,
        name,
        callsign: name.replace(/\s+/g, '-').toUpperCase().substring(0, 10),
        platform: /** @type {'site'|'mobile'|'aircraft'} */ (platform),
        position: {
          lat: 34.05 + (Math.random() - 0.5) * 0.3,
          lon: -118.24 + (Math.random() - 0.5) * 0.3,
          alt_m: platform === 'aircraft' ? 3000 : 0,
          heading_deg: 0,
          speed_kts: 0,
          timestamp: new Date().toISOString()
        },
        status: 'active',
        commlinks: [],
        addressbook_ref: id,
        icon: platform,
        metadata: {
          department,
          notes: notesParts,
          voip: voipData,
          xmpp: xmppData,
          customServices: customServices.length > 0 ? customServices : undefined
        }
      });
    } catch (e) {
      errors.push(`Contact ${idx}: ${e.message}`);
    }
  });

  return { assets, errors };
}

/**
 * Export assets to Commlink-Directory XML format.
 * Re-emits VoIP/XMPP/CustomServices when available in metadata.
 * @param {import('../data/stores.js').Asset[]} assets
 * @returns {string}
 */
export function exportCommLinkXML(assets) {
  const timestamp = new Date().toISOString();
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<?xml-stylesheet type="text/xsl" href="enterprise-contact-directory.xsl"?>\n`;
  xml += `<EnterpriseContactDirectory exported="${timestamp}" version="1.0">\n\n`;

  for (const asset of assets) {
    const ref = asset.addressbook_ref || asset.id;
    xml += `  <Contact id="${esc(ref)}" platform="${esc(asset.platform)}">\n`;
    xml += `    <Name>${esc(asset.name)}</Name>\n`;

    const notesParts = (asset.metadata?.notes || '').split(' - ');
    const loc = notesParts[0] || '';
    const note = notesParts.slice(1).join(' - ');
    if (loc) xml += `    <Location>${esc(loc)}</Location>\n`;
    if (asset.metadata?.department) xml += `    <Department>${esc(asset.metadata.department)}</Department>\n`;
    if (note) xml += `    <Notes>${esc(note)}</Notes>\n`;
    xml += `    <CreatedAt>${timestamp}</CreatedAt>\n`;
    xml += `    <UpdatedAt>${timestamp}</UpdatedAt>\n`;

    // VoIP
    const v = asset.metadata?.voip;
    if (v && v.ip) {
      xml += `    <VoIP>\n`;
      xml += `      <IP>${esc(v.ip)}</IP>\n`;
      if (v.port) xml += `      <Port>${esc(v.port)}</Port>\n`;
      if (v.extension) xml += `      <Extension>${esc(v.extension)}</Extension>\n`;
      if (v.codec) xml += `      <Codec>${esc(v.codec)}</Codec>\n`;
      if (v.protocol) xml += `      <Protocol>${esc(v.protocol)}</Protocol>\n`;
      if (v.transport) xml += `      <Transport>${esc(v.transport)}</Transport>\n`;
      xml += `    </VoIP>\n`;
    }

    // XMPP
    const x = asset.metadata?.xmpp;
    if (x && x.jid) {
      xml += `    <XMPP>\n`;
      xml += `      <JID>${esc(x.jid)}</JID>\n`;
      if (x.server) xml += `      <Server>${esc(x.server)}</Server>\n`;
      if (x.ip) xml += `      <IP>${esc(x.ip)}</IP>\n`;
      if (x.port) xml += `      <Port>${esc(x.port)}</Port>\n`;
      if (x.encryption) xml += `      <Encryption>${esc(x.encryption)}</Encryption>\n`;
      if (x.conference) xml += `      <Conference>${esc(x.conference)}</Conference>\n`;
      xml += `    </XMPP>\n`;
    }

    // Custom Services
    const cs = asset.metadata?.customServices;
    if (cs && cs.length > 0) {
      xml += `    <CustomServices>\n`;
      for (const s of cs) {
        xml += `      <Service>\n`;
        xml += `        <ServiceName>${esc(s.name)}</ServiceName>\n`;
        if (s.ip) xml += `        <IP>${esc(s.ip)}</IP>\n`;
        if (s.port) xml += `        <Port>${esc(s.port)}</Port>\n`;
        if (s.description) xml += `        <Description>${esc(s.description)}</Description>\n`;
        xml += `      </Service>\n`;
      }
      xml += `    </CustomServices>\n`;
    }

    xml += `  </Contact>\n\n`;
  }

  xml += `</EnterpriseContactDirectory>\n`;
  return xml;
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

/**
 * Trigger a file download in the browser.
 * @param {string} content
 * @param {string} filename
 * @param {string} [mimeType]
 */
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

/**
 * Generate export filename following Commlink-Directory convention.
 * @param {number} count
 * @returns {string}
 */
export function generateExportFilename(count) {
  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const time = now.toISOString().split('T')[1].replace(/[:.]/g, '').substring(0, 6);
  return `enterprise-contact-directory_${date}_${time}_${count}-contacts.xml`;
}
