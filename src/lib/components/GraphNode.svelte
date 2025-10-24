<script>
	import Button from '$lib/components/Button.svelte'

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
		isTreeExpanded = false, // Add prop to know if we're in tree view
		onclick = () => {},
		onexpand = () => {}
	} = $props()

	// Determine background color class based on category
	// Colors defined in app.css @theme directive
	const bgClass = $derived.by(() => {
		switch (practice.category) {
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
	})

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
	class="block w-full text-gray-800 rounded-[20px] shadow-md text-left cursor-pointer transition-all duration-200 {bgClass} {borderClass} hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 {compact
		? 'p-1.5'
		: 'p-4'}"
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

		<!-- Quick-Start Guide Link -->
		{#if practice.quickStartGuide}
			<div class="mt-3 pt-3 border-t border-gray-200">
				<Button
					href={practice.quickStartGuide}
					variant="primary"
					size="md"
					data-testid="quick-start-guide-link"
					target="_blank"
					rel="noopener noreferrer"
					onclick={e => e.stopPropagation()}
				>
					<span>📚</span>
					<span>More Info</span>
					<svg
						class="w-4 h-4"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
						/>
					</svg>
				</Button>
			</div>
		{/if}
	{:else}
		<!-- Unselected view -->
		<div class="flex flex-col gap-2">
			<!-- External link icon for quickstart guide -->
			{#if practice.quickStartGuide}
				<div class="text-center {compact ? 'mt-1' : 'mt-2'}">
					<svg
						class="{compact ? 'w-4 h-4' : 'w-5 h-5'} mx-auto text-blue-600"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
						aria-hidden="true"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
						/>
					</svg>
				</div>
			{/if}

			<!-- Show dependency count only in collapsed view -->
			{#if !isTreeExpanded && practice.dependencyCount > 0}
				<div
					class="text-center {compact
						? 'mt-1 pt-1 text-[0.45rem]'
						: 'mt-3 pt-3 text-xs'} border-t border-gray-200 text-gray-500"
				>
					{#if practice.directDependencyCount !== undefined && practice.totalDependencyCount !== undefined}
						<!-- Collapsed view: show both direct and total -->
						<div class="font-semibold">{practice.directDependencyCount} direct</div>
						<div class="text-[0.9em]">{practice.totalDependencyCount} total</div>
					{:else}
						<!-- Fallback: show only dependency count -->
						{practice.dependencyCount}
						{practice.dependencyCount === 1 ? 'dependency' : 'dependencies'}
					{/if}
				</div>
			{/if}
		</div>
	{/if}
</button>
