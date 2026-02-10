<script>
	import { onMount, onDestroy } from 'svelte';
	import { currentView, stats, get, resetToSeedData } from '$lib/data/stores.js';
	import { toast } from '$lib/utils/toast.js';
	import { clearAllStorage } from '$lib/utils/persist.js';
	import MapView from '$lib/components/map/MapView.svelte';
	import AddressBookView from '$lib/components/addressbook/AddressBookView.svelte';
	import ReportsView from '$lib/components/reports/ReportsView.svelte';
	import GuitarHeroView from '$lib/components/guitarhero/GuitarHeroView.svelte';
	import ToastContainer from '$lib/components/ToastContainer.svelte';

	let view = $state('map');
	let statsVal = $state(get(stats));
	let mapViewRef = $state();

	const unsubs = [
		currentView.subscribe(v => view = v),
		stats.subscribe(v => statsVal = v)
	];
	onDestroy(() => unsubs.forEach(u => u()));

	function setView(v) {
		currentView.set(v);
	}

	function handleReset() {
		if (confirm('Reset all data to defaults? This cannot be undone.')) {
			clearAllStorage();
			resetToSeedData();
			toast('Data reset to defaults', 'info');
		}
	}

	// Listen for "View on Map" events from Address Book
	function handleFocusAsset(e) {
		const assetId = e.detail;
		// Small delay so the map view has time to mount
		setTimeout(() => {
			if (mapViewRef?.focusAsset) {
				mapViewRef.focusAsset(assetId);
			}
		}, 100);
	}

	onMount(() => {
		window.addEventListener('geocomm:focus-asset', handleFocusAsset);
		return () => window.removeEventListener('geocomm:focus-asset', handleFocusAsset);
	});
</script>

<div class="app-layout">
	<!-- Navigation Bar -->
	<nav class="navbar">
		<div class="navbar-brand">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<circle cx="12" cy="12" r="10"/>
				<path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
			</svg>
			<span>GeoComm Tracker</span>
		</div>

		<div class="navbar-nav">
			<button class="nav-link" class:active={view === 'map'} onclick={() => setView('map')}>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z"/><path d="M8 2v16M16 6v16"/></svg>
				<span>Map</span>
			</button>
			<button class="nav-link" class:active={view === 'addressbook'} onclick={() => setView('addressbook')}>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
				<span>Address Book</span>
			</button>
			<button class="nav-link" class:active={view === 'reports'} onclick={() => setView('reports')}>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
				<span>Reports</span>
			</button>
			<button class="nav-link" class:active={view === 'guitarhero'} onclick={() => setView('guitarhero')}>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/></svg>
				<span>Timeline</span>
			</button>
		</div>

		{#if statsVal}
		<div class="navbar-stats">
			<div class="stat-item">
				<div class="stat-dot" style="background: var(--color-active)"></div>
				{statsVal.activeAssets}/{statsVal.totalAssets} assets
			</div>
			<div class="stat-item">
				<div class="stat-dot" style="background: var(--color-satellite)"></div>
				{statsVal.activeLinks} active
			</div>
			<div class="stat-item">
				<div class="stat-dot" style="background: var(--color-degraded)"></div>
				{statsVal.degradedLinks} degraded
			</div>
			<div class="stat-item">
				<div class="stat-dot" style="background: var(--color-unavailable)"></div>
				{statsVal.unavailableLinks} down
			</div>
			<button class="nav-link" onclick={handleReset} title="Reset to seed data" style="margin-left:var(--space-sm);font-size:var(--text-xs);padding:2px 6px;">
				Reset
			</button>
		</div>
		{/if}
	</nav>

	<!-- Main Content -->
	<div class="app-main">
		<div class="app-content">
			{#if view === 'map'}
				<MapView bind:this={mapViewRef} />
			{:else if view === 'addressbook'}
				<AddressBookView />
			{:else if view === 'reports'}
				<ReportsView />
			{:else if view === 'guitarhero'}
				<GuitarHeroView />
			{/if}
		</div>
	</div>
</div>

<ToastContainer />
