<script>
	import { onMount } from 'svelte'
	import { menuStore, getMenuItems } from '$lib/stores/menuStore.js'
	import { adoptionStore } from '$lib/stores/adoptionStore.js'
	import { importAdoptionState } from '$lib/utils/exportImport.js'
	import MenuItem from './MenuItem.svelte'
	import MenuToggle from './MenuToggle.svelte'
	import Fa from 'svelte-fa'
	import { faUpload } from '@fortawesome/free-solid-svg-icons'

	/**
	 * Props for action handlers
	 */
	const { onExport = null } = $props()

	/**
	 * Get menu items from pure function
	 */
	const menuItems = getMenuItems()

	/**
	 * Split menu items into main and bottom sections
	 */
	const bottomItemIds = ['support', 'github', 'minimum-cd']
	const mainItems = menuItems.filter(item => !bottomItemIds.includes(item.id))
	const bottomItems = bottomItemIds
		.map(id => menuItems.find(item => item.id === id))
		.filter(Boolean)

	/**
	 * Subscribe to menu store for reactive updates
	 */
	const isExpanded = $derived($menuStore.isExpanded)

	/**
	 * Import functionality state
	 */
	let fileInput
	let validPracticeIds = $state(new Set())
	let importMessage = $state(null)
	let importMessageType = $state('success')

	onMount(async () => {
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
			}
		} catch (error) {
			console.error('Failed to load practice data:', error)
		}
	}

	/**
	 * Handle toggle button click
	 */
	const handleToggle = () => {
		menuStore.toggle()
	}

	/**
	 * Handle file input change
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

	/**
	 * Handle export button click
	 */
	const handleExportClick = () => {
		if (onExport) {
			onExport()
		}
	}
</script>

<!-- Hidden file input for import -->
<input
	type="file"
	id="import-file-input"
	accept=".cdpa,application/vnd.cd-practices.adoption+json"
	bind:this={fileInput}
	onchange={handleFileChange}
	class="hidden"
	aria-label="Import adoption data file"
	data-testid="import-file-input"
/>

<!-- Navigation -->
<!-- Menu Sidebar - Always visible, toggles width -->
<nav
	data-testid="menu-content"
	aria-label="Main navigation"
	class="fixed top-0 left-0 h-full bg-slate-200 shadow-lg z-[1100] transition-all duration-300 ease-in-out {isExpanded
		? 'w-64'
		: 'w-16'} overflow-y-auto flex flex-col"
>
	<!-- Logo at top -->
	<div
		class="flex items-center justify-center {isExpanded
			? 'p-4'
			: 'p-2'} border-b border-slate-300 order-1"
	>
		<a
			href="/"
			class="rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
			aria-label="Return to home page"
		>
			<picture>
				<source srcset="/images/logo-md.webp 1x, /images/logo-lg.webp 2x" type="image/webp" />
				<img
					src="/images/logo.png"
					alt="Logo"
					class="{isExpanded ? 'h-12' : 'h-10'} w-auto transition-all duration-300"
					loading="lazy"
					decoding="async"
				/>
			</picture>
		</a>
	</div>

	<!-- Menu Items Container - Centers both sections together -->
	<div class="flex-1 flex flex-col items-center order-3">
		<div class="flex flex-col w-fit gap-2 py-2">
			<!-- Main Menu Items List -->
			<ul class="flex flex-col items-center gap-2">
				{#each mainItems as item (item.id)}
					<li>
						{#if item.id === 'import'}
							<!-- Import button as label for file input -->
							<label
								for="import-file-input"
								class={isExpanded
									? 'flex items-center gap-3 p-3 w-full text-left text-gray-800 rounded-md transition-colors hover:bg-black/10 active:bg-black/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 touch-manipulation cursor-pointer'
									: 'flex items-center justify-center p-3 w-full min-h-11 min-w-11 text-gray-800 rounded-md transition-colors hover:bg-black/10 active:bg-black/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 touch-manipulation cursor-pointer'}
								aria-label={item.label}
								data-testid="menu-item-{item.id}"
							>
								<span data-testid="menu-icon-{item.id}">
									<Fa icon={faUpload} size="lg" />
								</span>
								<span
									class="flex-1 {isExpanded ? '' : 'sr-only'}"
									data-testid="menu-label-{item.id}">{item.label}</span
								>
							</label>
						{:else if item.action === 'export'}
							<MenuItem {item} {isExpanded} onclick={handleExportClick} />
						{:else if item.href}
							<MenuItem {item} {isExpanded} />
						{/if}
					</li>
				{/each}
			</ul>

			<!-- Separator -->
			<div class="border-t border-slate-300 my-2"></div>

			<!-- Bottom Menu Items (GitHub, MinimumCD, Support) -->
			<ul class="flex flex-col items-start gap-2">
				{#each bottomItems as item (item.id)}
					<li>
						<MenuItem {item} {isExpanded} />
					</li>
				{/each}
			</ul>
		</div>
	</div>

	<!-- Toggle button -->
	<div
		class="flex items-center {isExpanded
			? 'justify-end'
			: 'justify-center'} p-2 border-b border-slate-300 order-2"
	>
		<MenuToggle {isExpanded} onclick={handleToggle} />
	</div>
</nav>

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
