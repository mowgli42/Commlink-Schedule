<script>
  import { onDestroy } from 'svelte';
  import { assets, upsertAsset, removeAsset, currentView } from '$lib/data/stores.js';
  import { parseCommLinkXML, exportCommLinkXML, downloadFile, generateExportFilename } from '$lib/utils/xml.js';
  import { toast } from '$lib/utils/toast.js';

  let allAssets = $state([]);
  let search = $state('');
  let platformFilter = $state('all');
  let showEditor = $state(false);
  let editingAsset = $state(null);

  const unsub = assets.subscribe(v => allAssets = v);
  onDestroy(unsub);

  let filtered = $derived(() => {
    let list = allAssets;
    if (platformFilter !== 'all') {
      list = list.filter(a => a.platform === platformFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.callsign.toLowerCase().includes(q) ||
        a.metadata?.department?.toLowerCase().includes(q) ||
        a.metadata?.notes?.toLowerCase().includes(q)
      );
    }
    return list;
  });

  function viewOnMap(assetId) {
    currentView.set('map');
    // Dispatch a custom event so the page can tell MapView to focus
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('geocomm:focus-asset', { detail: assetId }));
    }
  }

  function handleImport() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xml';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const { assets: imported, errors } = parseCommLinkXML(ev.target.result);
        if (imported.length > 0) {
          imported.forEach(a => upsertAsset(a));
          toast(`Imported ${imported.length} contacts`, 'success');
        }
        if (errors.length > 0) {
          toast(`${errors.length} entries skipped: ${errors[0]}`, 'warning');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  function handleExport() {
    if (allAssets.length === 0) {
      toast('No contacts to export', 'error');
      return;
    }
    const xml = exportCommLinkXML(allAssets);
    const filename = generateExportFilename(allAssets.length);
    downloadFile(xml, filename);
    toast(`Exported as ${filename}`, 'success');
  }

  function openEditor(asset = null) {
    editingAsset = asset ? { ...asset, metadata: { ...asset.metadata } } : {
      id: `asset-new-${Date.now()}`,
      name: '',
      callsign: '',
      platform: 'site',
      position: { lat: 34.05, lon: -118.24, alt_m: 0, heading_deg: 0, speed_kts: 0, timestamp: new Date().toISOString() },
      status: 'active',
      commlinks: [],
      addressbook_ref: '',
      icon: 'site',
      metadata: { department: '', notes: '' }
    };
    showEditor = true;
  }

  function saveContact() {
    if (!editingAsset.name) return;
    editingAsset.icon = editingAsset.platform;
    editingAsset.addressbook_ref = editingAsset.addressbook_ref || editingAsset.id;
    upsertAsset(editingAsset);
    showEditor = false;
    toast(`Saved: ${editingAsset.name}`, 'success');
  }

  function deleteContact(id, name) {
    if (confirm(`Delete ${name}?`)) {
      removeAsset(id);
      toast(`Deleted: ${name}`, 'info');
    }
  }

  const platformLabels = { site: 'Site', mobile: 'Mobile', aircraft: 'Aircraft' };
</script>

<div class="addressbook-layout">
  <!-- Sidebar filters -->
  <div class="ab-sidebar">
    <h2 class="ab-title">Address Book</h2>

    <div class="form-group">
      <input
        class="form-input"
        type="text"
        placeholder="Search contacts..."
        bind:value={search}
      />
    </div>

    <div class="filter-section">
      <div class="control-label">Platform</div>
      <div class="chip-group">
        <button class="chip" class:selected={platformFilter === 'all'} onclick={() => platformFilter = 'all'}>All</button>
        {#each Object.entries(platformLabels) as [key, label]}
          <button class="chip" class:selected={platformFilter === key} onclick={() => platformFilter = key}>{label}</button>
        {/each}
      </div>
    </div>

    <div class="ab-actions">
      <button class="btn btn-primary" onclick={() => openEditor()}>+ New Contact</button>
      <button class="btn" onclick={handleImport}>Import XML</button>
      <button class="btn" onclick={handleExport}>Export XML</button>
    </div>

    <div class="ab-stats text-xs text-muted">
      Showing {filtered().length} of {allAssets.length} contacts
    </div>
  </div>

  <!-- Contact cards -->
  <div class="ab-content">
    <div class="contact-grid">
      {#each filtered() as asset (asset.id)}
        <div class="card contact-card">
          <div class="card-header">
            <div>
              <div class="card-title">{asset.name}</div>
              <div class="text-xs font-mono text-muted">{asset.callsign}</div>
            </div>
            <div class="flex gap-xs">
              <span class="badge badge-{asset.platform}">{asset.platform}</span>
              <span class="badge badge-{asset.status}">{asset.status}</span>
            </div>
          </div>

          {#if asset.metadata?.department}
          <div class="contact-dept text-sm text-secondary">{asset.metadata.department}</div>
          {/if}

          <div class="contact-position text-xs font-mono text-muted">
            {asset.position.lat.toFixed(4)}, {asset.position.lon.toFixed(4)}
            {#if asset.position.alt_m > 0}
              | {asset.position.alt_m}m
            {/if}
          </div>

          {#if asset.metadata?.notes}
          <div class="contact-notes text-xs text-secondary mt-sm">{asset.metadata.notes}</div>
          {/if}

          <div class="contact-links mt-sm">
            <span class="text-xs text-muted">{asset.commlinks.length} comm links</span>
          </div>

          <div class="contact-actions mt-sm">
            <button class="btn btn-sm" onclick={() => viewOnMap(asset.id)}>View on Map</button>
            <button class="btn btn-sm" onclick={() => openEditor(asset)}>Edit</button>
            <button class="btn btn-sm" onclick={() => deleteContact(asset.id, asset.name)}>Delete</button>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Editor Modal -->
  {#if showEditor && editingAsset}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions a11y_interactive_supports_focus -->
  <div class="modal-overlay" role="dialog" aria-modal="true" aria-label="Contact editor" tabindex="-1" onclick={() => showEditor = false} onkeydown={(e) => { if (e.key === 'Escape') showEditor = false; }}>
    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions a11y_no_noninteractive_element_interactions a11y_no_static_element_interactions -->
    <div class="modal" role="presentation" onclick={(e) => e.stopPropagation()}>
      <div class="modal-header">
        <h3>{editingAsset.addressbook_ref ? 'Edit' : 'New'} Contact</h3>
        <button class="panel-close" onclick={() => showEditor = false}>&times;</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label" for="contact-name">Name *</label>
          <input id="contact-name" class="form-input" bind:value={editingAsset.name} placeholder="Contact name" />
        </div>
        <div class="form-group">
          <label class="form-label" for="contact-callsign">Callsign</label>
          <input id="contact-callsign" class="form-input" bind:value={editingAsset.callsign} placeholder="CALLSIGN" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="contact-platform">Platform</label>
            <select id="contact-platform" class="form-select" bind:value={editingAsset.platform}>
              <option value="site">Site</option>
              <option value="mobile">Mobile</option>
              <option value="aircraft">Aircraft</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="contact-status">Status</label>
            <select id="contact-status" class="form-select" bind:value={editingAsset.status}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="contact-lat">Latitude</label>
            <input id="contact-lat" class="form-input" type="number" step="0.0001" bind:value={editingAsset.position.lat} />
          </div>
          <div class="form-group">
            <label class="form-label" for="contact-lon">Longitude</label>
            <input id="contact-lon" class="form-input" type="number" step="0.0001" bind:value={editingAsset.position.lon} />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label" for="contact-dept">Department</label>
          <input id="contact-dept" class="form-input" bind:value={editingAsset.metadata.department} placeholder="Department" />
        </div>
        <div class="form-group">
          <label class="form-label" for="contact-notes">Notes</label>
          <textarea id="contact-notes" class="form-input" rows="3" bind:value={editingAsset.metadata.notes} placeholder="Notes..."></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn" onclick={() => showEditor = false}>Cancel</button>
        <button class="btn btn-primary" onclick={saveContact} disabled={!editingAsset.name}>Save Contact</button>
      </div>
    </div>
  </div>
  {/if}


</div>

<style>
  .addressbook-layout {
    display: flex;
    height: 100%;
  }

  .ab-sidebar {
    width: 280px;
    background: var(--bg-secondary);
    border-right: 1px solid var(--color-border);
    padding: var(--space-md);
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    overflow-y: auto;
  }

  .ab-title {
    font-size: var(--text-xl);
    font-weight: 700;
  }

  .filter-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .control-label {
    font-size: var(--text-xs);
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
  }

  .chip-group {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-xs);
  }

  .ab-actions {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .ab-content {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-md);
  }

  .contact-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: var(--space-md);
  }

  .contact-card {
    display: flex;
    flex-direction: column;
  }

  .contact-dept {
    margin-top: var(--space-xs);
  }

  .contact-position {
    margin-top: var(--space-xs);
  }

  .contact-actions {
    display: flex;
    gap: var(--space-sm);
  }

  /* Modal */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
  }

  .modal {
    background: var(--bg-secondary);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-xl);
    width: 480px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    box-shadow: var(--shadow-lg);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-md);
    border-bottom: 1px solid var(--color-border);
  }

  .modal-body {
    padding: var(--space-md);
    overflow-y: auto;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-sm);
    padding: var(--space-md);
    border-top: 1px solid var(--color-border);
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-md);
  }

  textarea.form-input {
    resize: vertical;
    min-height: 60px;
  }

  @media (max-width: 768px) {
    .addressbook-layout {
      flex-direction: column;
    }
    .ab-sidebar {
      width: 100%;
      border-right: none;
      border-bottom: 1px solid var(--color-border);
    }
    .contact-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
