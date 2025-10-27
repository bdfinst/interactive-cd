<script>
	import AdoptionCheckbox from '$lib/components/AdoptionCheckbox.svelte'
	import IconButton from '$lib/components/IconButton.svelte'
	import ListWithIcons from '$lib/components/ListWithIcons.svelte'
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
		nodeSize = 'standard', // NEW: size variant (tiny, compact, standard, expanded, selected-dependency)
		isTreeExpanded = false,
		isAdopted = false,
		adoptedDependencyCount = 0,
		totalDependencyCount = 0,
		onclick = () => {},
		onExpand = () => {},
		onToggleAdoption = () => {}
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

	// Adoption percentage calculation (DRY)
	const adoptionData = $derived.by(() => {
		if (totalDependencyCount === 0) {
			return null
		}

		const totalWithParent = totalDependencyCount + 1
		const adoptedWithParent = isAdopted ? adoptedDependencyCount + 1 : adoptedDependencyCount
		const percentage = Math.floor((adoptedWithParent / totalWithParent) * 100)

		return {
			totalWithParent,
			adoptedWithParent,
			percentage
		}
	})

	// Determine when to show adoption percentage
	const shouldShowAdoptionPercentage = $derived(
		adoptionData !== null && (isSelected || !isTreeExpanded)
	)

	// Determine if node is in compact display mode (affects content shown)
	const isCompactDisplay = $derived(nodeSize === 'tiny' || nodeSize === 'compact')

	function handleDetailsClick() {
		onclick()
		// Auto-expand dependencies when selecting a NON-ROOT practice with dependencies
		if (!isRoot && practice.dependencyCount > 0 && onExpand) {
			onExpand()
		}
	}
</script>

<div
	class="relative block w-full h-full text-gray-800 rounded-[10px] shadow-md text-left transition-all duration-200 {bgClass}"
	data-testid="graph-node"
	data-practice-id={practice.id}
	data-node-size={nodeSize}
	data-selected={isSelected}
>
	<div class="flex justify-between items-center -mt-4">
		<!-- Details/Close button in top-left corner -->
		<div class="z-10">
			<IconButton
				onclick={handleDetailsClick}
				ariaLabel={isSelected
					? `Close details for ${practice.name}`
					: `View details for ${practice.name}`}
			>
				<Fa icon={isSelected ? faTimes : faExpand} size="md" />
			</IconButton>
		</div>

		<!-- Adoption Checkbox in top-right corner -->
		<div class="z-10" onclick={e => e.stopPropagation()} role="presentation">
			<AdoptionCheckbox practiceId={practice.id} {isAdopted} ontoggle={onToggleAdoption} />
		</div>
	</div>

	<!-- Title Section -->
	<div class="text-center node-section">
		<h3 class="font-bold leading-tight text-gray-900">
			{practice.name}
		</h3>
	</div>

	{#if isSelected}
		<!-- Adoption percentage (when has dependencies) -->
		{#if shouldShowAdoptionPercentage}
			<div class="adoption-percentage text-center font-bold text-blue-700 node-section">
				{adoptionData.percentage}% adoption
			</div>
		{/if}

		<!-- Quick-Start Guide Link (selected view) -->
		{#if practice.quickStartGuide}
			<div class="flex justify-start node-section">
				<a
					href={practice.quickStartGuide}
					target="_blank"
					rel="noopener noreferrer"
					class="text-blue-600 hover:text-blue-700 transition-colors"
					data-testid="quick-start-guide-link"
					onclick={e => e.stopPropagation()}
					aria-label="Quick-start guide for {practice.name}"
				>
					<Fa icon={faExternalLinkAlt} size="md" />
				</a>
			</div>
		{/if}

		<!-- Description -->
		<p
			class="text-gray-600 node-section"
			class:text-xs={isCompactDisplay}
			class:text-sm={!isCompactDisplay}
		>
			{practice.description}
		</p>

		<!-- Requirements -->
		{#if practice.requirements && practice.requirements.length > 0}
			<div class="node-section">
				<h4
					class="font-semibold text-blue-700"
					class:text-xs={isCompactDisplay}
					class:text-sm={!isCompactDisplay}
				>
					Requirements
				</h4>
				<ListWithIcons
					items={practice.requirements}
					icon="•"
					iconColor="text-gray-400"
					compact={isCompactDisplay}
					textSize={isCompactDisplay ? 'text-xs' : 'text-sm'}
				/>
			</div>
		{/if}

		<!-- Benefits -->
		{#if practice.benefits && practice.benefits.length > 0}
			<div class="node-section">
				<h4
					class="font-semibold text-green-700"
					class:text-xs={isCompactDisplay}
					class:text-sm={!isCompactDisplay}
				>
					Benefits
				</h4>
				<ListWithIcons
					items={practice.benefits}
					icon="→"
					iconColor="text-green-600"
					compact={isCompactDisplay}
					textSize={isCompactDisplay ? 'text-xs' : 'text-sm'}
				/>
			</div>
		{/if}
	{:else}
		<!-- Unselected view -->
		<div class="flex flex-col gap-2">
			<!-- Show dependency count only in collapsed view -->
			{#if !isTreeExpanded && practice.dependencyCount > 0}
				<div
					class="dependency-count text-center text-gray-500"
					class:text-xs={isCompactDisplay}
					class:text-sm={!isCompactDisplay}
				>
					{#if practice.directDependencyCount !== undefined && practice.totalDependencyCount !== undefined}
						<!-- Collapsed view: show both direct and total -->
						<div class={isCompactDisplay ? 'mt-1 pt-1' : 'pt-3'}>
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

			<!-- Adoption percentage (when has dependencies and NOT in tree expanded view) -->
			{#if shouldShowAdoptionPercentage}
				<div class="adoption-percentage text-center font-bold text-blue-700">
					{adoptionData.percentage}% adoption
				</div>
			{/if}

			<!-- Quick-Start Guide Link (unselected view) -->
			{#if practice.quickStartGuide}
				<div class="flex justify-start">
					<a
						href={practice.quickStartGuide}
						target="_blank"
						rel="noopener noreferrer"
						class="text-blue-600 hover:text-blue-700 transition-colors"
						data-testid="quick-start-guide-link"
						onclick={e => e.stopPropagation()}
						aria-label="Quick-start guide for {practice.name}"
					>
						<Fa icon={faExternalLinkAlt} size="md" />
					</a>
				</div>
			{/if}
		</div>
	{/if}
</div>
