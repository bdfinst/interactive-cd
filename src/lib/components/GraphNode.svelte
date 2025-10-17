<script>
	/**
	 * GraphNode Component
	 *
	 * Displays a practice as a node in the dependency graph
	 */
	export let practice;
	export let isRoot = false;
	export let isSelected = false;
	export let onClick = () => {};
	export let onExpand = null; // Function to call when expanding dependencies

	// Get category icon
	const categoryIcons = {
		practice: '🔄',
		behavior: '👥',
		culture: '🌟',
		tooling: '🛠️'
	};

	const icon = categoryIcons[practice.category] || '📦';

	// Border styling based on selection
	$: borderClass = isSelected
		? 'border-4 border-blue-600'
		: 'border-2 border-black hover:border-gray-600';

	function handleExpand(event) {
		event.stopPropagation(); // Prevent card selection when clicking expand
		if (onExpand) {
			onExpand();
		}
	}
</script>

<button
	class="graph-node bg-white rounded-lg shadow-md p-4 w-full text-left transition-all cursor-pointer {borderClass}"
	class:hover:shadow-lg={!isSelected}
	data-testid="graph-node"
	data-practice-id={practice.id}
	data-selected={isSelected}
	on:click={onClick}
>
	<!-- Title Section (always visible) -->
	<div class="flex items-center gap-2 mb-2">
		<span class="text-2xl" aria-label="{practice.category} category">{icon}</span>
		<h3 class="text-lg font-bold text-gray-900 leading-tight">{practice.name}</h3>
	</div>

	{#if isSelected}
		<!-- Description (only when selected) -->
		<p class="text-gray-600 text-sm mb-3 line-clamp-3">{practice.description}</p>

		<!-- Dependency Count (only when selected) -->
		{#if practice.dependencyCount !== undefined && practice.dependencyCount > 0}
			<div class="mb-3 flex items-center gap-2">
				<span class="text-xs font-semibold text-gray-500">Dependencies:</span>
				<span class="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
					{practice.dependencyCount}
				</span>
			</div>
		{/if}

		<!-- Benefits (only when selected) -->
		{#if practice.benefits && practice.benefits.length > 0}
			<div class="mb-3">
				<h4 class="text-sm font-semibold text-green-700 mb-2">
					Benefits ({practice.benefitCount})
				</h4>
				<ul class="space-y-1 text-xs text-gray-700">
					{#each practice.benefits.slice(0, 3) as benefit}
						<li class="flex items-start gap-1">
							<span class="text-green-600">★</span>
							<span class="line-clamp-2">{benefit}</span>
						</li>
					{/each}
					{#if practice.benefits.length > 3}
						<li class="text-gray-500 italic">+{practice.benefits.length - 3} more...</li>
					{/if}
				</ul>
			</div>
		{/if}

		<!-- Expand Button (only when selected, has dependencies, and not root) -->
		{#if onExpand && practice.dependencyCount > 0 && !isRoot}
			<button
				on:click={handleExpand}
				class="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition-colors text-sm"
			>
				Expand Dependencies ({practice.dependencyCount})
			</button>
		{/if}
	{/if}
</button>

<style>
	.line-clamp-2 {
		overflow: hidden;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
	}

	.line-clamp-3 {
		overflow: hidden;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
	}
</style>
