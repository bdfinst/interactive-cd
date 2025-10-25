<script>
	import Button from '$lib/components/Button.svelte'
	import ListWithIcons from '$lib/components/ListWithIcons.svelte'
	import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
	import Fa from 'svelte-fa'

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
		// Auto-expand dependencies when selecting a NON-ROOT practice with dependencies
		if (!isRoot && practice.dependencyCount > 0 && onexpand) {
			onexpand({ practiceId: practice.id })
		}
	}
</script>

<button
	class="relative block w-full h-full text-gray-800 rounded-[20px] shadow-md text-left cursor-pointer transition-all duration-200 {bgClass} {borderClass} hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 {compact
		? 'p-3'
		: 'p-4'}"
	data-testid="graph-node"
	data-practice-id={practice.id}
	data-selected={isSelected}
	onclick={handleClick}
>
	<!-- External link icon in upper right corner (unselected view only) -->
	{#if !isSelected && practice.quickStartGuide}
		<div class="absolute top-3 right-3 text-blue-600">
			<Fa icon={faExternalLinkAlt} size="sm" />
		</div>
	{/if}

	<!-- Title Section -->
	<div class="{compact ? 'mb-0.5' : 'mb-2'} text-center">
		<h3
			class="{compact
				? isSelected
					? 'mb-0.5 text-base'
					: 'mb-0.5 text-xs'
				: 'mb-2 text-lg'} font-bold leading-tight text-gray-900"
		>
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
				<ListWithIcons
					items={practice.requirements}
					icon="•"
					iconColor="text-gray-400"
					{compact}
					textSize={compact ? 'text-[0.45rem]' : 'text-xs'}
				/>
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
				<ListWithIcons
					items={practice.benefits}
					icon="→"
					iconColor="text-green-600"
					{compact}
					textSize={compact ? 'text-[0.45rem]' : 'text-xs'}
				/>
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
					<Fa icon={faExternalLinkAlt} />
				</Button>
			</div>
		{/if}
	{:else}
		<!-- Unselected view -->
		<div class="flex flex-col gap-2">
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
