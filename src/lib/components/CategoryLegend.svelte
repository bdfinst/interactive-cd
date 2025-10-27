<script>
	import Button from '$lib/components/Button.svelte'
	import { expandButtonRenderer } from '$lib/stores/expandButton.js'
	import { headerHeight } from '$lib/stores/headerHeight.js'
	import { legendHeight } from '$lib/stores/legendHeight.js'
	import { isPracticeAdoptionEnabled } from '$lib/stores/featureFlags.js'
	import { adoptionStore } from '$lib/stores/adoptionStore.js'

	/**
	 * CategoryLegend Component
	 *
	 * Displays a horizontal legend showing the category colors and their meanings
	 * Floats below the header using fixed positioning
	 */

	// Category definitions (excluding 'core' which isn't shown in legend)
	// Colors defined in app.css @theme directive
	const categories = [
		{
			name: 'Automation',
			key: 'automation',
			description: 'Tools and automation platforms'
		},
		{
			name: 'Behavior',
			key: 'behavior',
			description: 'Team behaviors and processes'
		},
		{
			name: 'Automation & Behavior',
			key: 'behavior-enabled-automation',
			description: 'Automation that depends on behavioral practices'
		}
	]

	// Get Tailwind background class for a category key
	const getCategoryBgClass = key => {
		switch (key) {
			case 'automation':
				return 'bg-category-automation'
			case 'behavior':
				return 'bg-category-behavior'
			case 'behavior-enabled-automation':
				return 'bg-category-behavior-enabled'
			case 'core':
				return 'bg-category-core'
			default:
				return 'bg-white'
		}
	}

	// Track which tooltip is showing
	let showTooltip = $state({})

	// Track legend height
	let legendElement = $state()
	let currentHeight = $state(0)

	// Update store when height changes
	$effect(() => {
		if (legendElement) {
			currentHeight = legendElement.offsetHeight
			legendHeight.set(currentHeight)
		}
	})

	function handleMouseEnter(index) {
		showTooltip = { ...showTooltip, [index]: true }
	}

	function handleMouseLeave(index) {
		showTooltip = { ...showTooltip, [index]: false }
	}

	function handleTouch(index) {
		// Toggle tooltip on touch
		showTooltip = { ...showTooltip, [index]: !showTooltip[index] }
	}

	/**
	 * Handle reset adoption button click with confirmation
	 */
	function handleResetAdoption() {
		// Use browser's native confirm dialog
		const confirmed = window.confirm(
			'Are you sure you want to reset all adoption data? This will clear all checkboxes and cannot be undone.'
		)

		if (confirmed) {
			adoptionStore.clearAll()
		}
	}
</script>

<div
	bind:this={legendElement}
	class="fixed left-0 right-0 bg-black border-b border-gray-700 shadow-md z-[999] py-2"
	style="top: {$headerHeight}px;"
	data-testid="category-legend"
>
	<div class="max-w-screen-xl mx-auto px-4">
		<div class="grid grid-cols-[auto_1fr_auto] gap-4 items-center">
			<!-- Left: Expand Button -->
			<div class="flex justify-start">
				{#if $expandButtonRenderer}
					<Button
						onclick={$expandButtonRenderer.toggleFullTree}
						variant={$expandButtonRenderer.isExpanded ? 'gray' : 'primary'}
						size="md"
						data-testid="toggle-full-tree"
						aria-label={$expandButtonRenderer.isExpanded
							? 'Collapse tree view'
							: 'Expand tree view'}
					>
						{$expandButtonRenderer.isExpanded ? 'Collapse' : 'Expand'}
					</Button>
				{/if}
			</div>

			<!-- Center: Legend Items -->
			<div class="flex flex-wrap gap-2 items-center justify-center" data-testid="legend-items">
				{#each categories as category, index}
					<div class="relative inline-flex">
						<div
							class="px-2 py-0.5 rounded-sm border border-gray-300 shadow-sm cursor-help {getCategoryBgClass(
								category.key
							)}"
							data-testid="legend-item"
							onmouseenter={() => handleMouseEnter(index)}
							onmouseleave={() => handleMouseLeave(index)}
							ontouchstart={() => handleTouch(index)}
							role="button"
							tabindex="0"
							aria-label="{category.name}: {category.description}"
						>
							<span class="text-xs font-medium text-gray-800">
								{category.name}
							</span>
						</div>
						{#if showTooltip[index]}
							<div
								class="absolute top-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 bg-black/90 text-white px-3 py-2 rounded-md text-sm whitespace-nowrap pointer-events-none z-[2000] before:content-[''] before:absolute before:bottom-full before:left-1/2 before:-translate-x-1/2 before:border-[6px] before:border-transparent before:border-b-black/90"
							>
								{category.description}
							</div>
						{/if}
					</div>
				{/each}
			</div>

			<!-- Right: Reset Adoption Button (when feature enabled) -->
			<div class="flex justify-end">
				{#if $isPracticeAdoptionEnabled}
					<Button
						onclick={handleResetAdoption}
						variant="danger"
						size="md"
						data-testid="reset-adoption-button"
						aria-label="Reset all adoption data"
					>
						Reset
					</Button>
				{/if}
			</div>
		</div>
	</div>
</div>
