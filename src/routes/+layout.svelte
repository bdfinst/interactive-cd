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
	import { exportAdoptionState, importAdoptionState } from '$lib/utils/exportImport.js'
	import { get } from 'svelte/store'
	import { version } from '../../package.json'
	import '../app.css'

	/**
	 * Children snippet for layout content (Svelte 5)
	 */
	const { children } = $props()

	let importMessage = $state(null)
	let importMessageType = $state('success')
	let fileInput = $state()
	let totalPracticesCount = $state(0)
	let validPracticeIds = $state(new Set())

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

		// Load practice data for validation
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

				validPracticeIds = allIds
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

	const handleImportClick = () => {
		if (fileInput) {
			fileInput.click()
		}
	}

	const handleFileChange = async event => {
		const file = event.target.files?.[0]
		if (!file) return

		try {
			const result = await importAdoptionState(file, validPracticeIds)

			if (!result.success) {
				importMessage = result.error
				importMessageType = 'error'
				setTimeout(() => {
					importMessage = null
				}, 5000)
				return
			}

			adoptionStore.importPractices(result.imported)

			const imported = result.imported.size
			const invalid = result.invalid.length
			if (invalid > 0) {
				importMessage = `Imported ${imported} practices. ${invalid} invalid practice IDs were skipped.`
				importMessageType = 'warning'
			} else {
				importMessage = `Successfully imported ${imported} practices.`
				importMessageType = 'success'
			}

			setTimeout(() => {
				importMessage = null
			}, 5000)
		} catch (error) {
			importMessage = `Failed to import: ${error.message}`
			importMessageType = 'error'
			setTimeout(() => {
				importMessage = null
			}, 5000)
		} finally {
			if (fileInput) {
				fileInput.value = ''
			}
		}
	}
</script>

<SEO />

<!-- Menu Sidebar -->
<Menu onExport={handleExport} onImport={handleImportClick} />

<!-- Hidden file input for import -->
<input
	type="file"
	accept=".cdpa,application/vnd.cd-practices.adoption+json"
	bind:this={fileInput}
	onchange={handleFileChange}
	class="hidden"
	data-testid="import-file-input"
/>

<Header />
<HeaderSpacer />
<CategoryLegend />
<LegendSpacer />

<!-- Main content area with dynamic sidebar spacing -->
<div class="min-h-screen transition-all duration-300 {isExpanded ? 'ml-64' : 'ml-16'}">
	{@render children()}
</div>

<!-- Import/Export Feedback Message -->
{#if importMessage}
	<div
		class="fixed top-20 left-1/2 -translate-x-1/2 z-[2000] max-w-md w-full px-4"
		data-testid="import-message"
		role="alert"
	>
		<div
			class="rounded-lg shadow-lg p-4 {importMessageType === 'success'
				? 'bg-green-100 border-2 border-green-600 text-green-900'
				: importMessageType === 'warning'
					? 'bg-amber-100 border-2 border-amber-600 text-amber-900'
					: 'bg-red-100 border-2 border-red-600 text-red-900'}"
		>
			<p class="text-sm font-semibold">{importMessage}</p>
		</div>
	</div>
{/if}
