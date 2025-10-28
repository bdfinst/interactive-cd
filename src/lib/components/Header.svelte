<script>
	import { headerHeight } from '$lib/stores/headerHeight.js'
	import { menuStore } from '$lib/stores/menuStore.js'
	import { adoptionStore } from '$lib/stores/adoptionStore.js'
	import { importAdoptionState } from '$lib/utils/exportImport.js'

	/**
	 * Subscribe to menu store to get expanded state
	 */
	const isExpanded = $derived($menuStore.isExpanded)

	// State for import feedback
	let importMessage = $state(null)
	let importMessageType = $state('success') // 'success' | 'error' | 'warning'

	// File input reference
	let fileInput = $state()

	// Valid practice IDs for import validation
	let validPracticeIds = $state(new Set())

	// Track header height
	let headerElement = $state()
	let currentHeight = $state(0)

	// Update store when height changes
	$effect(() => {
		if (headerElement) {
			currentHeight = headerElement.offsetHeight
			headerHeight.set(currentHeight)
		}
	})

	// Load practice data on mount
	$effect(() => {
		loadPracticeData()
	})

	/**
	 * Load all practice IDs for validation during import
	 */
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
			}
		} catch (error) {
			console.error('Failed to load practice data:', error)
		}
	}

	/**
	 * Handle file selection for import
	 */
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

			// Import successful - update the store with bulk import
			adoptionStore.importPractices(result.imported)

			// Show success message
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
			// Reset file input so the same file can be selected again
			if (fileInput) {
				fileInput.value = ''
			}
		}
	}
</script>

<header
	bind:this={headerElement}
	class="fixed top-0 right-0 bg-slate-200 text-gray-800 z-[1000] shadow-md transition-all duration-300 {isExpanded
		? 'left-64'
		: 'left-16'}"
>
	<div class="max-w-screen-xl mx-auto px-4 py-3">
		<!-- Large screens: Center title only -->
		<div class="hidden lg:flex lg:justify-center items-center">
			<h1 class="text-xl font-bold m-0 text-center whitespace-nowrap">
				<a
					href="/"
					class="text-gray-800 hover:text-gray-600 transition-colors rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
					aria-label="CD Dependency Tree - Return to home page"
				>
					CD Dependency Tree
				</a>
			</h1>
		</div>

		<!-- Mobile: Center title only -->
		<div class="lg:hidden flex flex-col items-center">
			<h1 class="text-lg font-bold m-0 text-center">
				<a
					href="/"
					class="text-gray-800 hover:text-gray-600 transition-colors rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
					aria-label="CD Dependency Tree - Return to home page"
				>
					CD Dependency Tree
				</a>
			</h1>
		</div>
	</div>
</header>

<!-- Hidden file input for import (moved from header but kept for functionality) -->
<input
	type="file"
	accept=".cdpa,application/vnd.cd-practices.adoption+json"
	bind:this={fileInput}
	onchange={handleFileChange}
	class="hidden"
	data-testid="import-file-input"
/>

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
