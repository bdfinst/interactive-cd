<script>
	import { onMount } from 'svelte'
	import { browser } from '$app/environment'
	import Header from '$lib/components/Header.svelte'
	import HeaderSpacer from '$lib/components/HeaderSpacer.svelte'
	import CategoryLegend from '$lib/components/CategoryLegend.svelte'
	import LegendSpacer from '$lib/components/LegendSpacer.svelte'
	import SEO from '$lib/components/SEO.svelte'
	import Menu from '$lib/components/Menu.svelte'
	import { adoptionStore } from '$lib/stores/adoptionStore.js'
	import { menuStore } from '$lib/stores/menuStore.js'
	import { exportAdoptionState } from '$lib/utils/exportImport.js'
	import { get } from 'svelte/store'
	import { version } from '../../package.json'
	import '../app.css'

	/**
	 * Children snippet for layout content (Svelte 5)
	 */
	const { children } = $props()

	let totalPracticesCount = $state(0)

	/**
	 * Subscribe to menu store to get expanded state
	 */
	const isExpanded = $derived($menuStore.isExpanded)

	onMount(async () => {
		// Unregister any old service workers from the PWA branch
		if (browser && 'serviceWorker' in navigator) {
			try {
				const registrations = await navigator.serviceWorker.getRegistrations()
				for (const registration of registrations) {
					await registration.unregister()
					console.log('Unregistered old service worker')
				}
			} catch (error) {
				console.error('Failed to unregister service worker:', error)
			}
		}

		// Load practice data for total count
		loadPracticeData()
	})

	const loadPracticeData = async () => {
		try {
			const response = await fetch('/api/practices/tree?root=continuous-delivery')
			const result = await response.json()

			if (result.success) {
				// eslint-disable-next-line svelte/prefer-svelte-reactivity -- temporary Set, not reactive state
				const allIds = new Set()
				const extractIds = node => {
					allIds.add(node.id)
					if (node.dependencies) {
						node.dependencies.forEach(extractIds)
					}
				}
				extractIds(result.data)

				totalPracticesCount = allIds.size
			}
		} catch (error) {
			console.error('Failed to load practice data:', error)
		}
	}

	const handleExport = () => {
		const adoptedPractices = get(adoptionStore)
		exportAdoptionState(adoptedPractices, totalPracticesCount, version)
	}
</script>

<SEO />

<!-- Menu Sidebar (now handles import internally) -->
<Menu onExport={handleExport} />

<Header />
<HeaderSpacer />
<CategoryLegend />
<LegendSpacer />

<!-- Main content area with dynamic sidebar spacing -->
<main class="min-h-screen transition-all duration-300 {isExpanded ? 'ml-64' : 'ml-16'}">
	{@render children()}
</main>
