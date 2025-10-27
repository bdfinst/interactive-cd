<script>
	import AdoptionCheckbox from '$lib/components/AdoptionCheckbox.svelte'
	import IconButton from '$lib/components/IconButton.svelte'
	import ListWithIcons from '$lib/components/ListWithIcons.svelte'
	import { isPracticeAdoptionEnabled } from '$lib/stores/featureFlags.js'
	import { faExpand, faExternalLinkAlt, faTimes } from '@fortawesome/free-solid-svg-icons'
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
		onExpand = () => {},
		onToggleAdoption = () => {} // NEW: Toggle adoption callback
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
				? 'border border-black'
				: 'border-2 border-black'
	)

	function handleDetailsClick() {
		onclick()
		// Auto-expand dependencies when selecting a NON-ROOT practice with dependencies
		if (!isRoot && practice.dependencyCount > 0 && onExpand) {
			onExpand()
		}
	}
</script>

<div
	class="relative block w-full h-full text-gray-800 rounded-[20px] shadow-md text-left transition-all duration-200 {bgClass} {borderClass} {compact
		? 'p-4 min-h-12'
		: 'p-4 min-h-16'}"
	data-testid="graph-node"
	data-practice-id={practice.id}
	data-selected={isSelected}
>
	<!-- Details/Close button in top-left corner -->
	<div class="absolute top-3 left-3 z-10">
		<IconButton
			onclick={handleDetailsClick}
			ariaLabel={isSelected
				? `Close details for ${practice.name}`
				: `View details for ${practice.name}`}
		>
			<Fa icon={isSelected ? faTimes : faExpand} size="md" />
		</IconButton>
	</div>

	<!-- Adoption Checkbox in top-right corner (when feature enabled) -->
	{#if practiceAdoptionEnabled}
		<div class="absolute top-3 right-3 z-10" onclick={e => e.stopPropagation()} role="presentation">
			<AdoptionCheckbox practiceId={practice.id} {isAdopted} ontoggle={onToggleAdoption} />
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

	<!-- Quick-Start Guide Link (bottom center for all views) -->
	{#if practice.quickStartGuide}
		<div class="absolute bottom-3 left-0 right-0 flex justify-center z-10">
			<a
				href={practice.quickStartGuide}
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex items-center gap-1 px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors text-xs font-medium"
				data-testid="quick-start-guide-link"
				onclick={e => e.stopPropagation()}
			>
				<span>📚</span>
				<span>Guide</span>
				<Fa icon={faExternalLinkAlt} size="xs" />
			</a>
		</div>
	{/if}
</div>
