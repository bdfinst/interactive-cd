<script>
	import { browser } from '$app/environment'
	import { adoptionStore } from '$lib/stores/adoptionStore.js'
	import { getMenuItems, menuStore } from '$lib/stores/menuStore.js'
	import { importAdoptionState } from '$lib/utils/exportImport.js'
	import { faXmark } from '@fortawesome/free-solid-svg-icons'
	import { onMount } from 'svelte'
	import Fa from 'svelte-fa'
	import { fade } from 'svelte/transition'
	import MenuItem from './MenuItem.svelte'
	import MenuToggle from './MenuToggle.svelte'

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
	const isOpen = $derived($menuStore.isOpen)

	/**
	 * On mobile, always show labels when menu is open
	 * On tablet+, respect isExpanded state
	 * This ensures labels always show on mobile overlay
	 */
	const shouldShowLabels = $derived(isOpen || isExpanded)

	/**
	 * Body scroll lock effect - locks scroll when mobile menu is open
	 */
	$effect(() => {
		if (browser && isOpen) {
			document.body.style.overflow = 'hidden'
			return () => {
				document.body.style.overflow = ''
			}
		}
	})

	/**
	 * Handle Escape key to close mobile menu
	 */
	const handleKeydown = event => {
		if (event.key === 'Escape' && isOpen) {
			menuStore.closeMobile()
		}
	}

	/**
	 * Handle backdrop click to close mobile menu
	 */
	const handleBackdropClick = () => {
		menuStore.closeMobile()
	}

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

<!-- Escape key handler -->
<svelte:window onkeydown={handleKeydown} />

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

<!-- Backdrop - Only visible on mobile when menu is open -->
{#if isOpen}
	<div
		transition:fade={{ duration: 200 }}
		onclick={handleBackdropClick}
		class="fixed inset-0 bg-black/50 z-[1099] md:hidden"
		data-testid="menu-backdrop"
		role="presentation"
		aria-hidden="true"
	></div>
{/if}

<!-- Navigation -->
<!-- Responsive: Mobile overlay (<768px), Tablet/Desktop sidebar (≥768px) -->
<nav
	data-testid="menu-content"
	id="menu-content"
	aria-label="Main navigation"
	class="fixed top-0 left-0 h-full bg-slate-200 shadow-lg z-[1100] transition-all duration-300 ease-in-out overflow-y-auto flex flex-col
		{isOpen ? 'translate-x-0' : '-translate-x-full'}
		md:translate-x-0
		{isExpanded ? 'md:w-[200px]' : 'md:w-16'}"
>
	<!-- Logo at top -->
	<div
		class="flex items-center justify-center {shouldShowLabels
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
					class="{shouldShowLabels ? 'h-12' : 'h-10'} w-auto transition-all duration-300"
					loading="lazy"
					decoding="async"
				/>
			</picture>
		</a>
	</div>

	<!-- Menu Items Container - Centers both sections together -->
	<div class="flex flex-col items-center flex-1 order-3">
		<div class="flex flex-col gap-2 py-2 w-fit">
			<!-- Main Menu Items List -->
			<ul class="flex flex-col items-center gap-2">
				{#each mainItems as item (item.id)}
					<li>
						{#if item.action === 'export'}
							<MenuItem {item} isExpanded={shouldShowLabels} onclick={handleExportClick} />
						{:else}
							<MenuItem {item} isExpanded={shouldShowLabels} />
						{/if}
					</li>
				{/each}
			</ul>

			<!-- Separator -->
			<div class="my-2 border-t border-slate-300"></div>

			<!-- Bottom Menu Items (GitHub, MinimumCD, Support) -->
			<ul class="flex flex-col items-start gap-2">
				{#each bottomItems as item (item.id)}
					<li>
						<MenuItem {item} isExpanded={shouldShowLabels} />
					</li>
				{/each}
			</ul>
		</div>
	</div>

	<!-- Toggle button - Hidden on mobile, visible on tablet+ -->
	<div
		class="hidden md:flex items-center {isExpanded
			? 'justify-end'
			: 'justify-center'} p-2 border-b border-slate-300 order-2"
	>
		<MenuToggle {isExpanded} onclick={handleToggle} />
	</div>

	<!-- Close button for mobile -->
	<div class="flex items-center justify-end order-2 p-2 border-b md:hidden border-slate-300">
		<button
			onclick={() => menuStore.closeMobile()}
			class="flex items-center justify-center p-2 text-gray-800 transition-colors rounded-md hover:bg-black/10 active:bg-black/20"
			aria-label="Close menu"
			data-testid="mobile-close-button"
		>
			<Fa icon={faXmark} size="lg" />
		</button>
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
