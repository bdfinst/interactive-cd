<script>
	/**
	 * CategoryLegend Component
	 *
	 * Displays a horizontal legend showing the category colors and their meanings
	 */

	// Category colors and labels from mermaid diagram (excluding Core)
	const categories = [
		{ name: 'Automation', color: '#fffacd', description: 'Tools and automation platforms' },
		{ name: 'Behavior', color: '#d7e6ff', description: 'Team behaviors and processes' },
		{
			name: 'Behavior Enabled',
			color: '#d7f8d7',
			description: 'Automation that depends on behavioral practices'
		}
	]

	// Track which tooltip is showing
	let showTooltip = $state({})

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

<div class="flex justify-center" data-testid="category-legend">
	<div class="flex flex-wrap gap-2 items-center justify-center px-4">
		{#each categories as category, index}
			<div class="relative inline-flex">
				<div
					class="px-2 rounded-sm border border-gray-300 shadow-sm cursor-help"
					style="background-color: {category.color};"
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
</div>
