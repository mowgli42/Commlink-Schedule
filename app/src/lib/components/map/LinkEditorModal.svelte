<script>
  import { get } from 'svelte/store';
  import { assets, upsertCommLink } from '$lib/data/stores.js';
  import { toast } from '$lib/utils/toast.js';

  /**
   * @type {{ link: import('$lib/data/stores.js').CommLink | null, onclose: () => void }}
   */
  let { link = null, onclose } = $props();

  let allAssets = $state(get(assets));
  const unsub = assets.subscribe(v => allAssets = v);

  // Build initial form value (runs once at mount; the modal is destroyed/recreated on each open)
  function buildInitialForm(existing) {
    if (existing) return structuredClone(existing);
    return {
      id: `link-${Date.now()}`,
      name: '',
      type: 'satellite',
      subtype: '',
      status: 'active',
      endpoints: ['', ''],
      frequency: { value_mhz: null, bandwidth_khz: null, polarization: '', modulation: '' },
      satellite: null,
      schedule: { start: '', end: '', recurrence: 'daily' },
      quality: { signal_strength_dbm: null, ber: null, latency_ms: null }
    };
  }

  // Modal is destroyed/recreated on each open, so capturing initial value is correct.
  // svelte-ignore state_referenced_locally
  let form = $state(buildInitialForm(link));

  let showSatFields = $derived(form.type === 'satellite');

  // Ensure satellite object when type is satellite
  $effect(() => {
    if (form.type === 'satellite' && !form.satellite) {
      form.satellite = { name: '', orbit: 'GEO', position_deg_w: null, transponder: '', provider: '' };
    }
  });

  const linkTypes = [
    { value: 'satellite', label: 'Satellite' },
    { value: 'los_radio', label: 'LOS Radio' },
    { value: 'voip', label: 'VoIP' },
    { value: 'xmpp', label: 'XMPP' }
  ];

  const subtypes = {
    satellite: ['GEO', 'MEO', 'LEO'],
    los_radio: ['HF', 'VHF', 'UHF', 'SHF'],
    voip: [],
    xmpp: []
  };

  const statuses = ['active', 'degraded', 'unavailable', 'scheduled'];

  function handleSave() {
    if (!form.name.trim()) return;
    if (!form.endpoints[0] || !form.endpoints[1]) {
      toast('Select two endpoints', 'warning');
      return;
    }
    if (form.endpoints[0] === form.endpoints[1]) {
      toast('Endpoints must be different assets', 'warning');
      return;
    }
    if (form.type !== 'satellite') {
      form.satellite = null;
    }
    upsertCommLink(form);
    toast(`Saved link: ${form.name}`, 'success');
    onclose();
  }

  function handleKeydown(e) {
    if (e.key === 'Escape') onclose();
  }

  // Cleanup
  import { onDestroy } from 'svelte';
  onDestroy(unsub);
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions a11y_interactive_supports_focus -->
<div class="modal-overlay" role="dialog" aria-modal="true" aria-label="Link editor" tabindex="-1"
     onclick={onclose} onkeydown={handleKeydown}>
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions a11y_no_noninteractive_element_interactions -->
  <div class="modal modal-wide" role="presentation" onclick={(e) => e.stopPropagation()}>
    <div class="modal-header">
      <h3>{link ? 'Edit' : 'New'} Comm Link</h3>
      <button class="panel-close" onclick={onclose}>&times;</button>
    </div>

    <div class="modal-body">
      <!-- Basic info -->
      <div class="form-group">
        <label class="form-label" for="link-name">Link Name *</label>
        <input id="link-name" class="form-input" bind:value={form.name} placeholder="e.g. SATCOM Alpha-Bravo" />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label" for="link-type">Type</label>
          <select id="link-type" class="form-select" bind:value={form.type}>
            {#each linkTypes as lt}
              <option value={lt.value}>{lt.label}</option>
            {/each}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="link-subtype">Subtype</label>
          {#if subtypes[form.type]?.length > 0}
            <select id="link-subtype" class="form-select" bind:value={form.subtype}>
              <option value="">None</option>
              {#each subtypes[form.type] as st}
                <option value={st}>{st}</option>
              {/each}
            </select>
          {:else}
            <input id="link-subtype" class="form-input" bind:value={form.subtype} placeholder="Optional" />
          {/if}
        </div>
        <div class="form-group">
          <label class="form-label" for="link-status">Status</label>
          <select id="link-status" class="form-select" bind:value={form.status}>
            {#each statuses as s}
              <option value={s}>{s}</option>
            {/each}
          </select>
        </div>
      </div>

      <!-- Endpoints -->
      <fieldset class="fieldset">
        <legend>Endpoints</legend>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="link-ep-a">Endpoint A *</label>
            <select id="link-ep-a" class="form-select" bind:value={form.endpoints[0]}>
              <option value="">-- Select asset --</option>
              {#each allAssets as a}
                <option value={a.id}>{a.callsign} — {a.name}</option>
              {/each}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="link-ep-b">Endpoint B *</label>
            <select id="link-ep-b" class="form-select" bind:value={form.endpoints[1]}>
              <option value="">-- Select asset --</option>
              {#each allAssets as a}
                <option value={a.id}>{a.callsign} — {a.name}</option>
              {/each}
            </select>
          </div>
        </div>
      </fieldset>

      <!-- Frequency -->
      <fieldset class="fieldset">
        <legend>Frequency</legend>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="link-freq">Frequency (MHz)</label>
            <input id="link-freq" class="form-input" type="number" step="0.001" bind:value={form.frequency.value_mhz} />
          </div>
          <div class="form-group">
            <label class="form-label" for="link-bw">Bandwidth (kHz)</label>
            <input id="link-bw" class="form-input" type="number" step="0.1" bind:value={form.frequency.bandwidth_khz} />
          </div>
          <div class="form-group">
            <label class="form-label" for="link-mod">Modulation</label>
            <input id="link-mod" class="form-input" bind:value={form.frequency.modulation} placeholder="e.g. QPSK, FM" />
          </div>
        </div>
      </fieldset>

      <!-- Satellite (conditional) -->
      {#if showSatFields}
      <fieldset class="fieldset">
        <legend>Satellite</legend>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="sat-name">Satellite Name</label>
            <input id="sat-name" class="form-input" bind:value={form.satellite.name} placeholder="e.g. MUOS-5" />
          </div>
          <div class="form-group">
            <label class="form-label" for="sat-orbit">Orbit</label>
            <select id="sat-orbit" class="form-select" bind:value={form.satellite.orbit}>
              <option value="GEO">GEO</option>
              <option value="MEO">MEO</option>
              <option value="LEO">LEO</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="sat-provider">Provider</label>
            <input id="sat-provider" class="form-input" bind:value={form.satellite.provider} placeholder="e.g. DoD" />
          </div>
        </div>
      </fieldset>
      {/if}

      <!-- Schedule -->
      <fieldset class="fieldset">
        <legend>Schedule</legend>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="sched-start">Start (ISO)</label>
            <input id="sched-start" class="form-input" type="datetime-local" bind:value={form.schedule.start} />
          </div>
          <div class="form-group">
            <label class="form-label" for="sched-end">End (ISO)</label>
            <input id="sched-end" class="form-input" type="datetime-local" bind:value={form.schedule.end} />
          </div>
          <div class="form-group">
            <label class="form-label" for="sched-recur">Recurrence</label>
            <select id="sched-recur" class="form-select" bind:value={form.schedule.recurrence}>
              <option value="none">None</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
        </div>
      </fieldset>
    </div>

    <div class="modal-footer">
      <button class="btn" onclick={onclose}>Cancel</button>
      <button class="btn btn-primary" onclick={handleSave}
              disabled={!form.name.trim() || !form.endpoints[0] || !form.endpoints[1]}>
        Save Link
      </button>
    </div>
  </div>
</div>

<style>
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
  }
  .modal-wide {
    background: var(--bg-secondary);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-xl);
    width: 640px;
    max-height: 85vh;
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
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: var(--space-md);
  }
  .fieldset {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-md);
    margin-bottom: var(--space-md);
  }
  .fieldset legend {
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-muted);
    font-weight: 600;
    padding: 0 var(--space-xs);
  }
</style>
