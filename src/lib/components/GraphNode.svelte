<script>
	/**
	 * GraphNode Component
	 *
	 * Displays a practice as a node in the dependency graph
	 */
	const {
		practice,
		isRoot = false,
		isSelected = false,
		compact = false,
		onclick = () => {},
		onexpand = () => {}
	} = $props()

	// Category background colors from mermaid diagram
	const categoryColors = {
		automation: '#f9d5d3',
		'behavior-enabled-automation': '#d7f8d7',
		behavior: '#d7e6ff',
		core: '#fff9e6'
	}

	const bgColor = $derived(categoryColors[practice.category] || '#ffffff')

	const borderClass = $derived(
		isSelected
			? compact
				? 'border-2 border-blue-600'
				: 'border-4 border-blue-600'
			: compact
				? 'border border-black hover:border-gray-600'
				: 'border-2 border-black hover:border-gray-600'
	)

	function handleClick() {
		onclick({ practiceId: practice.id })
		// Auto-expand dependencies when selecting a practice
		if (practice.dependencyCount > 0 && !isRoot) {
			onexpand({ practiceId: practice.id })
		}
	}
</script>

<button
	class="block w-full text-gray-800 rounded-[20px] shadow-md text-left cursor-pointer transition-all duration-200 {borderClass} hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 {compact
		? 'p-1.5'
		: 'p-4'}"
	style="background-color: {bgColor};"
	data-testid="graph-node"
	data-practice-id={practice.id}
	data-selected={isSelected}
	onclick={handleClick}
>
	<!-- Title Section -->
	<div class="{compact ? 'mb-0.5' : 'mb-2'} text-center">
		<h3 class="{compact ? 'mb-0.5 text-xs' : 'mb-2 text-lg'} font-bold leading-tight text-gray-900">
			{practice.name}
		</h3>
	</div>

	{#if isSelected}
		<!-- Description -->
		<p class="{compact ? 'mb-1 text-[0.5rem]' : 'mb-3 text-sm'} text-gray-600">
			{practice.description}
		</p>

		<!-- Requirements -->
		{#if practice.requirements && practice.requirements.length > 0}
			<div class={compact ? 'mb-1' : 'mb-3'}>
				<h4 class="{compact ? 'mb-0.5 text-[0.5rem]' : 'mb-2 text-sm'} font-semibold text-blue-700">
					Requirements
				</h4>
				<ul
					class="pl-0 {compact ? 'space-y-0' : 'space-y-1'} {compact
						? 'text-[0.45rem]'
						: 'text-xs'} text-gray-700 list-none"
				>
					{#each practice.requirements as requirement (requirement)}
						<li class="flex items-start {compact ? 'gap-1' : 'gap-2'}">
							<span class="flex-shrink-0 text-gray-400">•</span>
							<span class="flex-1">{requirement}</span>
						</li>
					{/each}
				</ul>
			</div>
		{/if}

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
					{#each practice.benefits as benefit (benefit)}
						<li class="flex items-start {compact ? 'gap-0.5' : 'gap-2'}">
							<span class="flex-shrink-0 text-green-600">→</span>
							<span>{benefit}</span>
						</li>
					{/each}
				</ul>
			</div>
		{/if}
	{:else}
		<!-- Show dependency count when not selected -->
		{#if practice.dependencyCount > 0}
			<div
				class="text-center {compact
					? 'mt-1 pt-1 text-[0.45rem]'
					: 'mt-3 pt-3 text-xs'} border-t border-gray-200 text-gray-500"
			>
				{practice.dependencyCount}
				{practice.dependencyCount === 1 ? 'dependency' : 'dependencies'}
			</div>
		{/if}
	{/if}
</button>
