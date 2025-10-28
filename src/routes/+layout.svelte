<script>
	import { onMount } from 'svelte'
	import { browser } from '$app/environment'
	import Header from '$lib/components/Header.svelte'
	import HeaderSpacer from '$lib/components/HeaderSpacer.svelte'
	import CategoryLegend from '$lib/components/CategoryLegend.svelte'
	import LegendSpacer from '$lib/components/LegendSpacer.svelte'
	import SEO from '$lib/components/SEO.svelte'
	import InstallPrompt from '$lib/components/InstallPrompt.svelte'
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

	let swRegistration = null
	let updateAvailable = $state(false)
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
		if (browser && 'serviceWorker' in navigator) {
			try {
				swRegistration = await navigator.serviceWorker.register('/sw.js')
				console.log('Service Worker registered:', swRegistration)

				// Check for updates
				swRegistration.addEventListener('updatefound', () => {
					const newWorker = swRegistration.installing
					newWorker.addEventListener('statechange', () => {
						if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
							// New service worker is ready
							updateAvailable = true
						}
					})
				})
			} catch (error) {
				console.error('Service Worker registration failed:', error)
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

	function handleUpdateClick() {
		if (swRegistration?.waiting) {
			swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' })
			window.location.reload()
		}
	}

	function handleDismissUpdate() {
		updateAvailable = false
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

<InstallPrompt />

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

{#if updateAvailable}
	<div
		class="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-blue-600 text-white rounded-lg shadow-2xl z-[2000]"
		role="alert"
		data-testid="update-notification"
	>
		<div class="p-4">
			<h3 class="text-lg font-bold mb-2">Update Available</h3>
			<p class="text-sm mb-4">A new version of Interactive CD is available.</p>
			<div class="flex gap-2">
				<button
					type="button"
					onclick={handleUpdateClick}
					class="flex-1 bg-white text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
				>
					Update Now
				</button>
				<button
					type="button"
					onclick={handleDismissUpdate}
					class="px-4 py-2 text-white rounded-md font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
				>
					Later
				</button>
			</div>
		</div>
	</div>
{/if}
