<script>
	/**
	 * GraphNode Component
	 *
	 * Displays a practice as a node in the dependency graph
	 */
	import { CATEGORIES } from '$lib/constants/categories.js'

	export let practice
	export let isRoot = false
	export let isSelected = false
	export let isExpanded = false
	export let onClick = () => {}
	export let onExpand = null
	export let compact = false

	let hoveredCategory = null

	$: categories =
		practice.categories && practice.categories.length > 0
			? practice.categories
			: Array.isArray(practice.category)
				? practice.category
				: [practice.category]

	$: borderClass = isSelected
		? compact
			? 'border-2 border-blue-600'
			: 'border-4 border-blue-600'
		: compact
			? 'border border-black hover:border-gray-600'
			: 'border-2 border-black hover:border-gray-600'

	function handleExpand(event) {
		event.stopPropagation()
		if (onExpand) {
			onExpand()
		}
	}
</script>

<button
	class="block w-full bg-white text-gray-800 rounded-[20px] shadow-md text-left cursor-pointer transition-all duration-200 {borderClass} hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 {compact
		? 'p-1.5'
		: 'p-4'}"
	data-testid="graph-node"
	data-practice-id={practice.id}
	data-selected={isSelected}
	on:click={onClick}
>
	<!-- Title Section -->
	<div class="{compact ? 'mb-0.5' : 'mb-2'} text-center">
		<h3 class="{compact ? 'mb-0.5 text-xs' : 'mb-2 text-lg'} font-bold leading-tight text-gray-900">
			{practice.name}
		</h3>
		<div
			class="flex items-center justify-center {compact ? 'gap-0.5' : 'gap-1'}"
			role="img"
			aria-label="Category: {categories.join(', ')}"
		>
			{#each categories as category, index}
				<div class="relative inline-flex">
					<span
						class="{compact ? 'w-1.5 h-1.5' : 'w-3.5 h-3.5'} rounded-full flex-shrink-0 cursor-help"
						class:bg-[#10b981]={category === 'behavior'}
						class:bg-[#f59e0b]={category === 'culture'}
						class:bg-[#8b5cf6]={category === 'tooling'}
						class:bg-gray-500={!CATEGORIES[category]}
						on:mouseenter={() => (hoveredCategory = index)}
						on:mouseleave={() => (hoveredCategory = null)}
						role="tooltip"
						aria-label={CATEGORIES[category]?.label || category}
					></span>
					{#if hoveredCategory === index && CATEGORIES[category]}
						<div
							class="absolute top-[calc(100%+0.25rem)] left-1/2 -translate-x-1/2 bg-black/90 text-white px-2 py-1 rounded-md text-xs whitespace-nowrap pointer-events-none z-[2000] before:content-[''] before:absolute before:bottom-full before:left-1/2 before:-translate-x-1/2 before:border-[4px] before:border-transparent before:border-b-black/90"
						>
							{CATEGORIES[category].label}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>

	{#if isSelected}
		<!-- Description -->
		<p class="{compact ? 'mb-1 text-[0.5rem]' : 'mb-3 text-sm'} text-gray-600">
			{practice.description}
		</p>

		<!-- Benefits -->
		{#if practice.benefits && practice.benefits.length > 0}
			<div class={compact ? 'mb-1' : 'mb-3'}>
				<h4
					class="{compact ? 'mb-0.5 text-[0.5rem]' : 'mb-2 text-sm'} font-semibold text-green-700"
				>
					Benefits
				</h4>
				<ul
					class="pl-0 {compact ? 'space-y-0' : 'space-y-1'} {compact
						? 'text-[0.45rem]'
						: 'text-xs'} text-gray-700 list-none"
				>
					{#each practice.benefits as benefit}
						<li class="flex items-start {compact ? 'gap-0.5' : 'gap-2'}">
							<span class="flex-shrink-0 text-green-600">→</span>
							<span>{benefit}</span>
						</li>
					{/each}
				</ul>
			</div>
		{/if}

		<!-- Expand Button -->
		{#if onExpand && practice.dependencyCount > 0 && !isRoot}
			<button
				on:click={handleExpand}
				class="w-full {compact
					? 'px-1 py-0.5 text-[0.5rem]'
					: 'px-3 py-2 text-sm'} rounded-md font-semibold border-none cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 {isExpanded
					? 'bg-gray-500 text-white hover:bg-gray-600 focus:ring-gray-400'
					: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'}"
			>
				{isExpanded ? 'Collapse' : 'Expand'} Dependencies ({practice.dependencyCount})
			</button>
		{/if}
	{/if}
</button>
