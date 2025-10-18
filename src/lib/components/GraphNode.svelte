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

	$: categories =
		practice.categories && practice.categories.length > 0
			? practice.categories
			: Array.isArray(practice.category)
				? practice.category
				: [practice.category]

	$: borderClass = isSelected
		? 'border-4 border-blue-600'
		: 'border-2 border-black hover:border-gray-600'

	function handleExpand(event) {
		event.stopPropagation()
		if (onExpand) {
			onExpand()
		}
	}
</script>

<button
	class="block w-full bg-white text-gray-800 rounded-[20px] shadow-md p-4 text-left cursor-pointer transition-all duration-200 {borderClass} hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
	data-testid="graph-node"
	data-practice-id={practice.id}
	data-selected={isSelected}
	on:click={onClick}
>
	<!-- Title Section -->
	<div class="mb-2 text-center">
		<h3 class="mb-2 text-lg font-bold leading-tight text-gray-900">
			{practice.name}
		</h3>
		<div
			class="flex items-center justify-center gap-1"
			role="img"
			aria-label="Category: {categories.join(', ')}"
		>
			{#each categories as category}
				<span
					class="w-3.5 h-3.5 rounded-full flex-shrink-0"
					class:bg-[#10b981]={category === 'behavior'}
					class:bg-[#f59e0b]={category === 'culture'}
					class:bg-[#8b5cf6]={category === 'tooling'}
					class:bg-gray-500={!CATEGORIES[category]}
					title={category}
				></span>
			{/each}
		</div>
	</div>

	{#if isSelected}
		<!-- Description -->
		<p class="mb-3 text-sm text-gray-600">{practice.description}</p>

		<!-- Benefits -->
		{#if practice.benefits && practice.benefits.length > 0}
			<div class="mb-3">
				<h4 class="mb-2 text-sm font-semibold text-green-700">Benefits</h4>
				<ul class="pl-0 space-y-1 text-xs text-gray-700 list-none">
					{#each practice.benefits as benefit}
						<li class="flex items-start gap-2">
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
				class="w-full px-3 py-2 rounded-md font-semibold text-sm border-none cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 {isExpanded
					? 'bg-gray-500 text-white hover:bg-gray-600 focus:ring-gray-400'
					: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'}"
			>
				{isExpanded ? 'Collapse' : 'Expand'} Dependencies ({practice.dependencyCount})
			</button>
		{/if}
	{/if}
</button>
