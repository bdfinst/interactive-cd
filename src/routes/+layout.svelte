<script>
	import { onMount } from 'svelte'
	import { browser } from '$app/environment'
	import { goto } from '$app/navigation'
	import Header from '$lib/components/Header.svelte'
	import HeaderSpacer from '$lib/components/HeaderSpacer.svelte'
	import CategoryLegend from '$lib/components/CategoryLegend.svelte'
	import LegendSpacer from '$lib/components/LegendSpacer.svelte'
	import SEO from '$lib/components/SEO.svelte'
	import Menu from '$lib/components/Menu.svelte'
	import OnboardingOverlay from '$lib/components/OnboardingOverlay.svelte'
	import GuidedWalkthrough from '$lib/components/GuidedWalkthrough.svelte'
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
		// Register service worker for cache management
		if (browser && 'serviceWorker' in navigator) {
			try {
				const registration = await navigator.serviceWorker.register('/service-worker.js')
				console.log('Service Worker registered:', registration.scope)

				// Listen for updates
				registration.addEventListener('updatefound', () => {
					const newWorker = registration.installing
					if (newWorker) {
						newWorker.addEventListener('statechange', () => {
							if (newWorker.state === 'activated') {
								console.log('New Service Worker activated - reloading for fresh content')
								window.location.reload()
							}
						})
					}
				})
			} catch (error) {
				console.error('Service Worker registration failed:', error)
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

	function handleNavigateToPractice(practiceId) {
		goto(`/?practice=${practiceId}`)
	}
</script>

<SEO />

<!-- Menu Sidebar (now handles import internally) -->
<Menu onExport={handleExport} />

<!-- Onboarding Tutorial (shows once on first visit) -->
<OnboardingOverlay />

<Header />
<HeaderSpacer />
<CategoryLegend />
<LegendSpacer />

<!-- Main content area with responsive sidebar spacing -->
<!-- Mobile: no left margin (full width), Tablet+: dynamic margin based on sidebar state -->
<main
	class="min-h-screen transition-all duration-300 bg-grid-pattern
	ml-0
	{isExpanded ? 'md:ml-[200px]' : 'md:ml-16'}"
>
	{@render children()}
</main>

<!-- Guided Walkthrough Panel -->
<GuidedWalkthrough onNavigateToPractice={handleNavigateToPractice} />
