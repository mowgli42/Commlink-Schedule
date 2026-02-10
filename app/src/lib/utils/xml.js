/**
 * Commlink-Directory XML Import/Export utilities.
 * Handles conversion between Commlink-Directory XML format and internal asset model.
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

      assets.push({
        id: `asset-${id}`,
        name,
        callsign: name.replace(/\s+/g, '-').toUpperCase().substring(0, 10),
        platform: /** @type {'site'|'mobile'|'aircraft'} */ (platform),
        position: { lat: 34.05 + (Math.random() - 0.5) * 0.3, lon: -118.24 + (Math.random() - 0.5) * 0.3, alt_m: 0, heading_deg: 0, speed_kts: 0, timestamp: new Date().toISOString() },
        status: 'active',
        commlinks: [],
        addressbook_ref: id,
        icon: platform,
        metadata: { department, notes: `${location}${notes ? ' - ' + notes : ''}` }
      });
    } catch (e) {
      errors.push(`Contact ${idx}: ${e.message}`);
    }
  });

  return { assets, errors };
}

/**
 * Export assets to Commlink-Directory XML format.
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
    xml += `  <Contact id="${escapeXml(ref)}" platform="${escapeXml(asset.platform)}">\n`;
    xml += `    <Name>${escapeXml(asset.name)}</Name>\n`;
    if (asset.metadata?.notes) {
      xml += `    <Location>${escapeXml(asset.metadata.notes.split(' - ')[0] || '')}</Location>\n`;
    }
    if (asset.metadata?.department) {
      xml += `    <Department>${escapeXml(asset.metadata.department)}</Department>\n`;
    }
    if (asset.metadata?.notes) {
      xml += `    <Notes>${escapeXml(asset.metadata.notes)}</Notes>\n`;
    }
    xml += `    <CreatedAt>${timestamp}</CreatedAt>\n`;
    xml += `    <UpdatedAt>${timestamp}</UpdatedAt>\n`;
    xml += `  </Contact>\n\n`;
  }

  xml += `</EnterpriseContactDirectory>\n`;
  return xml;
}

/**
 * @param {string} str
 * @returns {string}
 */
function escapeXml(str) {
  return str
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
 * @param {string} mimeType
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
 * @param {number} count - Number of contacts
 * @returns {string}
 */
export function generateExportFilename(count) {
  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const time = now.toISOString().split('T')[1].replace(/[:.]/g, '').substring(0, 6);
  return `enterprise-contact-directory_${date}_${time}_${count}-contacts.xml`;
}
