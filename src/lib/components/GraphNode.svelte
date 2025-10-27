<script>
	import AdoptionCheckbox from '$lib/components/AdoptionCheckbox.svelte'
	import Button from '$lib/components/Button.svelte'
	import ListWithIcons from '$lib/components/ListWithIcons.svelte'
	import { isPracticeAdoptionEnabled } from '$lib/stores/featureFlags.js'
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
		isAdopted = false, // NEW: Is this practice adopted
		adoptedDependencyCount = 0, // NEW: How many dependencies are adopted
		totalDependencyCount = 0, // NEW: Total transitive dependency count
		onclick = () => {},
		onexpand = () => {},
		ontoggleadoption = () => {} // NEW: Toggle adoption callback
	} = $props()

	// Subscribe to feature flag
	let practiceAdoptionEnabled = $state(false)
	isPracticeAdoptionEnabled.subscribe(value => {
		practiceAdoptionEnabled = value
	})

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
		onclick()
		// Auto-expand dependencies when selecting a NON-ROOT practice with dependencies
		if (!isRoot && practice.dependencyCount > 0 && onexpand) {
			onexpand()
		}
	}

	function handleTouch() {
		// Call onclick directly for touch events
		handleClick()
	}
</script>

<button
	class="relative block w-full h-full text-gray-800 rounded-[20px] shadow-md text-left cursor-pointer transition-all duration-200 {bgClass} {borderClass} hover:shadow-lg active:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 touch-manipulation active:scale-[0.98] {compact
		? 'p-4 min-h-[48px]'
		: 'p-4 min-h-[64px]'}"
	data-testid="graph-node"
	data-practice-id={practice.id}
	data-selected={isSelected}
	onclick={handleClick}
	ontouchend={handleTouch}
>
	<!-- External link icon in upper left corner (unselected view only) -->
	{#if !isSelected && practice.quickStartGuide}
		<div class="absolute top-3 left-3 text-blue-600 z-10">
			<Fa icon={faExternalLinkAlt} size="sm" />
		</div>
	{/if}

	<!-- Adoption Checkbox in top-right corner (when feature enabled) -->
	{#if practiceAdoptionEnabled}
		<div class="absolute top-3 right-3 z-10" onclick={e => e.stopPropagation()} role="presentation">
			<AdoptionCheckbox practiceId={practice.id} {isAdopted} ontoggle={ontoggleadoption} />
		</div>
	{/if}

	<!-- Title Section -->
	<div class="{compact ? 'mb-0.5' : 'mb-2'} text-center">
		<h3
			class="{compact ? 'mb-0.5 text-base' : 'mb-2 text-lg'} font-bold leading-tight text-gray-900"
		>
			{practice.name}
		</h3>
	</div>

	{#if isSelected}
		<!-- Adoption percentage (when feature enabled and has dependencies) -->
		{#if practiceAdoptionEnabled && totalDependencyCount > 0}
			{@const totalWithParent = totalDependencyCount + 1}
			{@const adoptedWithParent = isAdopted ? adoptedDependencyCount + 1 : adoptedDependencyCount}
			{@const adoptionPercentage = Math.floor((adoptedWithParent / totalWithParent) * 100)}
			<div class="text-center {compact ? 'mb-1 text-xs' : 'mb-3 text-sm'} font-bold text-blue-700">
				{adoptionPercentage}% adoption
			</div>
		{/if}

		<!-- Description -->
		<p class="{compact ? 'mb-1 text-xs' : 'mb-3 text-sm'} text-gray-600">
			{practice.description}
		</p>

		<!-- Requirements -->
		{#if practice.requirements && practice.requirements.length > 0}
			<div class={compact ? 'mb-1' : 'mb-3'}>
				<h4 class="{compact ? 'mb-0.5 text-xs' : 'mb-2 text-sm'} font-semibold text-blue-700">
					Requirements
				</h4>
				<ListWithIcons
					items={practice.requirements}
					icon="•"
					iconColor="text-gray-400"
					{compact}
					textSize={compact ? 'text-xs' : 'text-sm'}
				/>
			</div>
		{/if}

		<!-- Benefits -->
		{#if practice.benefits && practice.benefits.length > 0}
			<div class={compact ? 'mb-1' : 'mb-3'}>
				<h4 class="{compact ? 'mb-0.5 text-xs' : 'mb-2 text-sm'} font-semibold text-green-700">
					Benefits
				</h4>
				<ListWithIcons
					items={practice.benefits}
					icon="→"
					iconColor="text-green-600"
					{compact}
					textSize={compact ? 'text-xs' : 'text-sm'}
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
				<div class="text-center {compact ? 'mt-1 pt-1 text-xs' : 'pt-3 text-sm'}  text-gray-500">
					{#if practice.directDependencyCount !== undefined && practice.totalDependencyCount !== undefined}
						<!-- Collapsed view: show both direct and total -->
						<div>
							<span class="font-semibold">{practice.directDependencyCount} direct</span>

							<span> - {practice.totalDependencyCount} total</span>
						</div>
					{:else}
						<!-- Fallback: show only dependency count -->
						{practice.dependencyCount}
						{practice.dependencyCount === 1 ? 'dependency' : 'dependencies'}
					{/if}
				</div>
			{/if}

			<!-- Adoption percentage (when feature enabled and has dependencies) -->
			{#if practiceAdoptionEnabled && totalDependencyCount > 0}
				{@const totalWithParent = totalDependencyCount + 1}
				{@const adoptedWithParent = isAdopted ? adoptedDependencyCount + 1 : adoptedDependencyCount}
				{@const adoptionPercentage = Math.floor((adoptedWithParent / totalWithParent) * 100)}
				<div class="text-center {compact ? 'text-xs' : 'text-sm'} font-bold text-blue-700">
					{adoptionPercentage}% adoption
				</div>
			{/if}
		</div>
	{/if}
</button>
