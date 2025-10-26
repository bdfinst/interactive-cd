<script>
	import { headerHeight } from '$lib/stores/headerHeight.js'
	import { isPracticeAdoptionEnabled } from '$lib/stores/featureFlags.js'
	import { adoptionStore } from '$lib/stores/adoptionStore.js'
	import { exportAdoptionState, importAdoptionState } from '$lib/utils/exportImport.js'
	import { get } from 'svelte/store'
	import {
		faBug,
		faCircleInfo,
		faFlask,
		faDownload,
		faUpload
	} from '@fortawesome/free-solid-svg-icons'
	import Fa from 'svelte-fa'
	import { version } from '../../../package.json'

	let showGithubTooltip = $state(false)
	let showBugTooltip = $state(false)
	let showHelpTooltip = $state(false)
	let showMinimumCDTooltip = $state(false)
	let showSupportTooltip = $state(false)
	let showVersionTooltip = $state(false)
	let showExperimentalTooltip = $state(false)
	let showExportTooltip = $state(false)
	let showImportTooltip = $state(false)

	// State for import feedback
	let importMessage = $state(null)
	let importMessageType = $state('success') // 'success' | 'error'

	// File input reference
	let fileInput = $state()

	// Track total practices count for export
	let totalPracticesCount = $state(0)
	let validPracticeIds = $state(new Set())

	// Touch handlers for mobile tooltip support
	const touchTimeouts = {}

	function createTooltipTouchHandler(tooltipKey, setter) {
		return e => {
			e.preventDefault()
			clearTimeout(touchTimeouts[tooltipKey])
			const currentValue = setter(prev => !prev)
			// Auto-dismiss after 3 seconds
			if (currentValue !== false) {
				touchTimeouts[tooltipKey] = setTimeout(() => setter(false), 3000)
			}
		}
	}

	// Determine if version is beta (< 1.0.0)
	const isBeta = version.split('.')[0] === '0'

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

	// Load practice data when feature is enabled
	$effect(() => {
		if ($isPracticeAdoptionEnabled) {
			loadPracticeData()
		}
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
				totalPracticesCount = allIds.size
			}
		} catch (error) {
			console.error('Failed to load practice data:', error)
		}
	}

	/**
	 * Handle export button click
	 */
	const handleExport = () => {
		const adoptedPractices = get(adoptionStore)
		exportAdoptionState(adoptedPractices, totalPracticesCount, version)
	}

	/**
	 * Handle import button click - open file picker
	 */
	const handleImportClick = () => {
		if (fileInput) {
			fileInput.click()
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
	class="fixed top-0 left-0 right-0 bg-slate-300 text-gray-800 z-[1000] shadow-md"
>
	<div class="max-w-screen-xl mx-auto px-6 py-5">
		<!-- Large screens: 3-column grid (logo left, title center, menu right) -->
		<div class="hidden lg:grid lg:grid-cols-[1fr_auto_1fr] items-center gap-4">
			<!-- Left: Logo -->
			<div class="flex items-center justify-start">
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
							class="h-logo-lg w-auto"
							loading="lazy"
							decoding="async"
						/>
					</picture>
				</a>
			</div>

			<!-- Center: Title -->
			<div class="flex flex-col items-center">
				<h1 class="text-title-lg font-bold m-0 text-center whitespace-nowrap">
					<a
						href="/"
						class="text-gray-800 hover:text-gray-600 transition-colors rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
						aria-label="CD Dependency Tree - Return to home page"
					>
						CD Dependency Tree
					</a>
				</h1>
				<div class="relative inline-flex">
					<a
						href="/help"
						class="text-sm text-gray-800 mt-0.5 px-2 py-1 min-h-[44px] inline-flex items-center rounded-md bg-green-100 border-2 border-green-700 transition-colors hover:bg-green-200 active:bg-green-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 touch-manipulation"
						aria-label="View capabilities and help"
						onmouseenter={() => (showVersionTooltip = true)}
						onmouseleave={() => (showVersionTooltip = false)}
						ontouchstart={createTooltipTouchHandler('version', v => (showVersionTooltip = v))}
					>
						{#if isBeta}
							<span class="font-semibold">v{version}</span>
							<span
								class="ml-1 px-1.5 py-0.5 bg-amber-500 text-white rounded text-xs font-bold uppercase"
								>beta</span
							>
						{:else}
							<span class="font-semibold">v{version}</span>
						{/if}
					</a>
					{#if showVersionTooltip}
						<div
							class="absolute top-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 bg-black/90 text-white px-3 py-2 rounded-md text-sm whitespace-nowrap pointer-events-none z-[2000] before:content-[''] before:absolute before:bottom-full before:left-1/2 before:-translate-x-1/2 before:border-[6px] before:border-transparent before:border-b-black/90"
						>
							View capabilities & help
						</div>
					{/if}
				</div>
			</div>

			<!-- Right: Menu buttons -->
			<div class="flex items-center justify-end gap-3">
				<!-- Experimental Feature Indicator -->
				{#if $isPracticeAdoptionEnabled}
					<div class="relative inline-flex">
						<div
							role="status"
							class="flex items-center gap-2 px-3 py-1.5 min-h-[44px] rounded-md bg-amber-100 border-2 border-amber-600 cursor-default"
							aria-label="Experimental feature enabled"
							onmouseenter={() => (showExperimentalTooltip = true)}
							onmouseleave={() => (showExperimentalTooltip = false)}
							ontouchstart={createTooltipTouchHandler(
								'experimental',
								v => (showExperimentalTooltip = v)
							)}
						>
							<Fa icon={faFlask} class="text-amber-700" />
							<span class="text-sm font-semibold text-amber-900 uppercase">Experimental</span>
						</div>
						{#if showExperimentalTooltip}
							<div
								class="absolute top-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 bg-black/90 text-white px-3 py-2 rounded-md text-sm whitespace-nowrap pointer-events-none z-[2000] before:content-[''] before:absolute before:bottom-full before:left-1/2 before:-translate-x-1/2 before:border-[6px] before:border-transparent before:border-b-black/90"
							>
								Practice Adoption feature enabled
							</div>
						{/if}
					</div>

					<!-- Export Button -->
					<div class="relative inline-flex">
						<button
							type="button"
							class="flex items-center justify-center text-gray-800 p-2 min-h-[44px] min-w-[44px] rounded-md transition-colors hover:bg-black/10 active:bg-black/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 touch-manipulation active:scale-95"
							aria-label="Export adoption data"
							data-testid="export-button"
							onclick={handleExport}
							onmouseenter={() => (showExportTooltip = true)}
							onmouseleave={() => (showExportTooltip = false)}
							ontouchstart={createTooltipTouchHandler('export', v => (showExportTooltip = v))}
						>
							<Fa icon={faDownload} size="1.5x" />
						</button>
						{#if showExportTooltip}
							<div
								class="absolute top-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 bg-black/90 text-white px-2 py-1.5 rounded-md text-xs whitespace-nowrap pointer-events-none z-[2000] before:content-[''] before:absolute before:bottom-full before:left-1/2 before:-translate-x-1/2 before:border-[6px] before:border-transparent before:border-b-black/90 sm:px-2.5 sm:py-1.5 sm:text-xs md:px-3 md:py-2 md:text-sm"
							>
								Export Adoption Data
							</div>
						{/if}
					</div>

					<!-- Import Button -->
					<div class="relative inline-flex">
						<button
							type="button"
							class="flex items-center justify-center text-gray-800 p-2 min-h-[44px] min-w-[44px] rounded-md transition-colors hover:bg-black/10 active:bg-black/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 touch-manipulation active:scale-95"
							aria-label="Import adoption data"
							data-testid="import-button"
							onclick={handleImportClick}
							onmouseenter={() => (showImportTooltip = true)}
							onmouseleave={() => (showImportTooltip = false)}
							ontouchstart={createTooltipTouchHandler('import', v => (showImportTooltip = v))}
						>
							<Fa icon={faUpload} size="1.5x" />
						</button>
						{#if showImportTooltip}
							<div
								class="absolute top-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 bg-black/90 text-white px-2 py-1.5 rounded-md text-xs whitespace-nowrap pointer-events-none z-[2000] before:content-[''] before:absolute before:bottom-full before:left-1/2 before:-translate-x-1/2 before:border-[6px] before:border-transparent before:border-b-black/90 sm:px-2.5 sm:py-1.5 sm:text-xs md:px-3 md:py-2 md:text-sm"
							>
								Import Adoption Data
							</div>
						{/if}
					</div>

					<!-- Hidden file input -->
					<input
						type="file"
						accept=".cdpa,application/vnd.cd-practices.adoption+json"
						bind:this={fileInput}
						onchange={handleFileChange}
						class="hidden"
						data-testid="import-file-input"
					/>
				{/if}

				<!-- GitHub Link -->
				<div class="relative inline-flex">
					<a
						href="https://github.com/bdfinst/interactive-cd"
						target="_blank"
						rel="noopener noreferrer"
						class="flex items-center justify-center text-gray-800 p-2 min-h-[44px] min-w-[44px] rounded-md transition-colors hover:bg-black/10 active:bg-black/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 touch-manipulation active:scale-95"
						aria-label="View on GitHub"
						onmouseenter={() => (showGithubTooltip = true)}
						onmouseleave={() => (showGithubTooltip = false)}
						ontouchstart={createTooltipTouchHandler('github', v => (showGithubTooltip = v))}
					>
						<svg
							width="29"
							height="29"
							viewBox="0 0 24 24"
							fill="currentColor"
							xmlns="http://www.w3.org/2000/svg"
							class="w-6 sm:w-7 md:w-7"
						>
							<path
								d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
							/>
						</svg>
					</a>
					{#if showGithubTooltip}
						<div
							class="absolute top-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 bg-black/90 text-white px-2 py-1.5 rounded-md text-xs whitespace-nowrap pointer-events-none z-[2000] before:content-[''] before:absolute before:bottom-full before:left-1/2 before:-translate-x-1/2 before:border-[6px] before:border-transparent before:border-b-black/90 sm:px-2.5 sm:py-1.5 sm:text-xs md:px-3 md:py-2 md:text-sm"
						>
							View on GitHub
						</div>
					{/if}
				</div>

				<!-- Bug Report Link -->
				<div class="relative inline-flex">
					<a
						href="https://github.com/bdfinst/interactive-cd/issues"
						target="_blank"
						rel="noopener noreferrer"
						class="flex items-center justify-center text-gray-800 p-2 min-h-[44px] min-w-[44px] rounded-md transition-colors hover:bg-black/10 active:bg-black/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 touch-manipulation active:scale-95"
						aria-label="Report a bug or request a feature"
						onmouseenter={() => (showBugTooltip = true)}
						onmouseleave={() => (showBugTooltip = false)}
						ontouchstart={createTooltipTouchHandler('bug', v => (showBugTooltip = v))}
					>
						<Fa icon={faBug} size="1.5x" />
					</a>
					{#if showBugTooltip}
						<div
							class="absolute top-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 bg-black/90 text-white px-2 py-1.5 rounded-md text-xs whitespace-nowrap pointer-events-none z-[2000] before:content-[''] before:absolute before:bottom-full before:left-1/2 before:-translate-x-1/2 before:border-[6px] before:border-transparent before:border-b-black/90 sm:px-2.5 sm:py-1.5 sm:text-xs md:px-3 md:py-2 md:text-sm"
						>
							Report Bug / Request Feature
						</div>
					{/if}
				</div>

				<!-- MinimumCD Logo -->
				<div class="relative inline-flex">
					<a
						href="https://minimumcd.org"
						target="_blank"
						rel="noopener noreferrer"
						class="flex items-center px-2 py-1 min-h-[44px] rounded-md transition-colors hover:bg-black/10 active:bg-black/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 touch-manipulation active:scale-95"
						aria-label="MinimumCD.org"
						onmouseenter={() => (showMinimumCDTooltip = true)}
						onmouseleave={() => (showMinimumCDTooltip = false)}
						ontouchstart={createTooltipTouchHandler('minimumcd', v => (showMinimumCDTooltip = v))}
					>
						<img
							src="/images/minimumCD-logo-sm.png"
							alt="MinimumCD.org"
							class="h-6 sm:h-7 md:h-7 w-auto"
						/>
					</a>
					{#if showMinimumCDTooltip}
						<div
							class="absolute top-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 bg-black/90 text-white px-2 py-1.5 rounded-md text-xs whitespace-nowrap pointer-events-none z-[2000] before:content-[''] before:absolute before:bottom-full before:left-1/2 before:-translate-x-1/2 before:border-[6px] before:border-transparent before:border-b-black/90 sm:px-2.5 sm:py-1.5 sm:text-xs md:px-3 md:py-2 md:text-sm"
						>
							MinimumCD.org
						</div>
					{/if}
				</div>

				<!-- Ko-fi Button -->
				<div class="relative inline-flex">
					<a
						href="https://ko-fi.com/bryanfinster"
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center justify-center text-gray-800 no-underline p-2 min-h-[44px] min-w-[44px] rounded-md transition-colors text-2xl md:text-3xl leading-none hover:bg-black/10 active:bg-black/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 touch-manipulation active:scale-95"
						aria-label="Support this project"
						onmouseenter={() => (showSupportTooltip = true)}
						onmouseleave={() => (showSupportTooltip = false)}
						ontouchstart={createTooltipTouchHandler('support', v => (showSupportTooltip = v))}
					>
						🥃
					</a>
					{#if showSupportTooltip}
						<div
							class="absolute top-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 bg-black/90 text-white px-2 py-1.5 rounded-md text-xs whitespace-nowrap pointer-events-none z-[2000] before:content-[''] before:absolute before:bottom-full before:left-1/2 before:-translate-x-1/2 before:border-[6px] before:border-transparent before:border-b-black/90 sm:px-2.5 sm:py-1.5 sm:text-xs md:px-3 md:py-2 md:text-sm"
						>
							Support this project
						</div>
					{/if}
				</div>

				<!-- Info Icon -->
				<div class="relative inline-flex">
					<a
						href="/help"
						class="flex items-center justify-center text-gray-800 p-2 min-h-[44px] min-w-[44px] rounded-md transition-colors hover:bg-black/10 active:bg-black/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 touch-manipulation active:scale-95"
						aria-label="View help and capabilities"
						onmouseenter={() => (showHelpTooltip = true)}
						onmouseleave={() => (showHelpTooltip = false)}
						ontouchstart={createTooltipTouchHandler('help', v => (showHelpTooltip = v))}
					>
						<Fa icon={faCircleInfo} size="1.5x" />
					</a>
					{#if showHelpTooltip}
						<div
							class="absolute top-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 bg-black/90 text-white px-2 py-1.5 rounded-md text-xs whitespace-nowrap pointer-events-none z-[2000] before:content-[''] before:absolute before:bottom-full before:left-1/2 before:-translate-x-1/2 before:border-[6px] before:border-transparent before:border-b-black/90 sm:px-2.5 sm:py-1.5 sm:text-xs md:px-3 md:py-2 md:text-sm"
						>
							Help & Capabilities
						</div>
					{/if}
				</div>
			</div>
		</div>

		<!-- Medium and smaller: Stacked layout (no logo) -->
		<div class="flex lg:hidden flex-col gap-4">
			<!-- Top: Title (centered) -->
			<div class="flex flex-col items-center">
				<h1
					class="text-title-sm md:text-title-md font-bold m-0 text-center whitespace-nowrap min-h-[44px] flex items-center"
				>
					<a
						href="/"
						class="text-gray-800 hover:text-gray-600 transition-colors rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
						aria-label="CD Dependency Tree - Return to home page"
					>
						CD Dependency Tree
					</a>
				</h1>
				<div class="relative inline-flex">
					<a
						href="/help"
						class="text-xs md:text-sm text-gray-800 mt-0.5 px-2 py-1 min-h-[44px] inline-flex items-center rounded-md bg-green-100 border-2 border-green-700 transition-colors hover:bg-green-200 active:bg-green-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 touch-manipulation"
						aria-label="View capabilities and help"
					>
						{#if isBeta}
							<span class="font-semibold">v{version}</span>
							<span
								class="ml-1 px-1.5 py-0.5 bg-amber-500 text-white rounded text-[10px] md:text-xs font-bold uppercase"
								>beta</span
							>
						{:else}
							<span class="font-semibold">v{version}</span>
						{/if}
					</a>
				</div>
			</div>

			<!-- Bottom: Menu buttons (centered) -->
			<div class="flex items-center justify-center gap-2 md:gap-3 flex-wrap">
				<!-- Experimental Feature Indicator (Mobile) -->
				{#if $isPracticeAdoptionEnabled}
					<div
						class="flex items-center gap-1.5 px-2.5 py-1 min-h-[44px] rounded-md bg-amber-100 border-2 border-amber-600 cursor-default w-full justify-center"
						aria-label="Experimental feature enabled"
					>
						<Fa icon={faFlask} class="text-amber-700" size="sm" />
						<span class="text-xs font-semibold text-amber-900 uppercase">Experimental</span>
					</div>

					<!-- Export/Import Buttons (Mobile) -->
					<div class="flex items-center gap-2">
						<!-- Export Button -->
						<button
							type="button"
							class="flex items-center justify-center text-gray-800 p-2 min-h-[44px] min-w-[44px] rounded-md transition-colors hover:bg-black/10 active:bg-black/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 touch-manipulation active:scale-95"
							aria-label="Export adoption data"
							data-testid="export-button-mobile"
							onclick={handleExport}
						>
							<Fa icon={faDownload} size="lg" />
						</button>

						<!-- Import Button -->
						<button
							type="button"
							class="flex items-center justify-center text-gray-800 p-2 min-h-[44px] min-w-[44px] rounded-md transition-colors hover:bg-black/10 active:bg-black/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 touch-manipulation active:scale-95"
							aria-label="Import adoption data"
							data-testid="import-button-mobile"
							onclick={handleImportClick}
						>
							<Fa icon={faUpload} size="lg" />
						</button>
					</div>
				{/if}

				<!-- GitHub Link -->
				<div class="relative inline-flex">
					<a
						href="https://github.com/bdfinst/interactive-cd"
						target="_blank"
						rel="noopener noreferrer"
						class="flex items-center justify-center text-gray-800 p-2 min-h-[44px] min-w-[44px] rounded-md transition-colors hover:bg-black/10 active:bg-black/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 touch-manipulation active:scale-95"
						aria-label="View on GitHub"
					>
						<svg
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="currentColor"
							xmlns="http://www.w3.org/2000/svg"
							class="w-6"
						>
							<path
								d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
							/>
						</svg>
					</a>
				</div>

				<!-- Bug Report Link -->
				<div class="relative inline-flex">
					<a
						href="https://github.com/bdfinst/interactive-cd/issues"
						target="_blank"
						rel="noopener noreferrer"
						class="flex items-center justify-center text-gray-800 p-2 min-h-[44px] min-w-[44px] rounded-md transition-colors hover:bg-black/10 active:bg-black/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 touch-manipulation active:scale-95"
						aria-label="Report a bug or request a feature"
					>
						<Fa icon={faBug} size="lg" />
					</a>
				</div>

				<!-- MinimumCD Logo -->
				<div class="relative inline-flex">
					<a
						href="https://minimumcd.org"
						target="_blank"
						rel="noopener noreferrer"
						class="flex items-center px-2 py-1 min-h-[44px] rounded-md transition-colors hover:bg-black/10 active:bg-black/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 touch-manipulation active:scale-95"
						aria-label="MinimumCD.org"
					>
						<img src="/images/minimumCD-logo-sm.png" alt="MinimumCD.org" class="h-6 w-auto" />
					</a>
				</div>

				<!-- Ko-fi Button -->
				<div class="relative inline-flex">
					<a
						href="https://Ko-fi.com/bryanfinster"
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center justify-center text-gray-800 no-underline p-2 min-h-[44px] min-w-[44px] rounded-md transition-colors text-2xl leading-none hover:bg-black/10 active:bg-black/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 touch-manipulation active:scale-95"
						aria-label="Support this project"
					>
						🥃
					</a>
				</div>

				<!-- Info Icon -->
				<div class="relative inline-flex">
					<a
						href="/help"
						class="flex items-center justify-center text-gray-800 p-2 min-h-[44px] min-w-[44px] rounded-md transition-colors hover:bg-black/10 active:bg-black/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 touch-manipulation active:scale-95"
						aria-label="View help and capabilities"
					>
						<Fa icon={faCircleInfo} size="lg" />
					</a>
				</div>
			</div>
		</div>
	</div>
</header>

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
