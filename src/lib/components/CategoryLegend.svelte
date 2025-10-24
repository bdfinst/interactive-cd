<script>
	import { headerHeight } from '$lib/stores/headerHeight.js'
	import { legendHeight } from '$lib/stores/legendHeight.js'
	import { expandButtonRenderer } from '$lib/stores/expandButton.js'
	import { CATEGORY_METADATA } from '$lib/constants/colors.js'

	/**
	 * CategoryLegend Component
	 *
	 * Displays a horizontal legend showing the category colors and their meanings
	 * Floats below the header using fixed positioning
	 */

	// Filter out 'core' category as it's not shown in the legend
	const categories = CATEGORY_METADATA.filter(cat => cat.key !== 'core')

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
</script>

<div
	bind:this={legendElement}
	class="fixed left-0 right-0 bg-gray-800 border-b border-gray-700 shadow-md z-[999] py-2"
	style="top: {$headerHeight}px;"
	data-testid="category-legend"
>
	<div class="max-w-screen-xl mx-auto px-4">
		<div class="grid grid-cols-[auto_1fr_auto] gap-4 items-center">
			<!-- Left: Expand Button -->
			<div class="flex justify-start">
				{#if $expandButtonRenderer}
					<button
						onclick={$expandButtonRenderer.toggleFullTree}
						class="px-3 py-1.5 rounded-lg font-semibold text-sm border-2 transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 {$expandButtonRenderer.isExpanded
							? 'bg-gray-600 text-white border-gray-600 hover:bg-gray-700 focus:ring-gray-500'
							: 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 focus:ring-blue-500'}"
						data-testid="toggle-full-tree"
						aria-label={$expandButtonRenderer.isExpanded
							? 'Collapse tree view'
							: 'Expand tree view'}
					>
						{$expandButtonRenderer.isExpanded ? 'Collapse' : 'Expand'}
					</button>
				{/if}
			</div>

			<!-- Center: Legend Items -->
			<div class="flex flex-wrap gap-2 items-center justify-center" data-testid="legend-items">
				{#each categories as category, index}
					<div class="relative inline-flex">
						<div
							class="px-2 py-0.5 rounded-sm border border-gray-300 shadow-sm cursor-help {category.bgClass}"
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

			<!-- Right: Empty spacer for balance -->
			<div></div>
		</div>
	</div>
</div>
