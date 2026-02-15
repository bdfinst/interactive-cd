<script>
	import AdoptionCheckbox from '$lib/components/AdoptionCheckbox.svelte'
	import CollapsibleSection from '$lib/components/CollapsibleSection.svelte'
	import IconButton from '$lib/components/IconButton.svelte'
	import ListWithIcons from '$lib/components/ListWithIcons.svelte'
	import MaturityBadge from '$lib/components/MaturityBadge.svelte'
	import {
		faCircleInfo,
		faExclamationTriangle,
		faExternalLinkAlt,
		faMapSigns,
		faTimes
	} from '@fortawesome/free-solid-svg-icons'
	import Fa from 'svelte-fa'

	/**
	 * GraphNode Component
	 *
	 * Displays a practice as a node in the dependency graph
	 */
	const {
		practice,
		isRoot: _isRoot = false,
		isSelected = false,
		nodeSize = 'standard',
		isTreeExpanded = false,
		isAdopted = false,
		adoptedDependencyCount = 0,
		totalDependencyCount = 0,
		onclick = () => {},
		onExpand: _onExpand = () => {},
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

	// Category label mapping
	const categoryLabel = $derived.by(() => {
		switch (practice.category) {
			case 'automation':
				return 'Automation'
			case 'behavior':
				return 'Behavior'
			case 'behavior-enabled-automation':
				return 'Automation & Behavior'
			case 'core':
				return 'Core'
			default:
				return practice.category || ''
		}
	})

	// Category-aware pill background class
	const pillBgClass = $derived.by(() => {
		switch (practice.category) {
			case 'automation':
				return 'bg-category-automation-pill'
			case 'behavior':
				return 'bg-category-behavior-pill'
			case 'behavior-enabled-automation':
				return 'bg-category-behavior-enabled-pill'
			case 'core':
				return 'bg-category-core-pill'
			default:
				return 'bg-black/[0.06]'
		}
	})

	// Category-aware progress bar fill class
	const barBgClass = $derived.by(() => {
		switch (practice.category) {
			case 'automation':
				return 'bg-category-automation-bar'
			case 'behavior':
				return 'bg-category-behavior-bar'
			case 'behavior-enabled-automation':
				return 'bg-category-behavior-enabled-bar'
			case 'core':
				return 'bg-category-core-bar'
			default:
				return 'bg-blue-500'
		}
	})

	// Category-aware percentage text color
	const barTextClass = $derived.by(() => {
		switch (practice.category) {
			case 'automation':
				return 'text-yellow-700'
			case 'behavior':
				return 'text-sky-700'
			case 'behavior-enabled-automation':
				return 'text-emerald-700'
			case 'core':
				return 'text-slate-600'
			default:
				return 'text-blue-700'
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

	function handleDetailsClick(e) {
		e?.stopPropagation()
		onclick()
	}

	function handleCardClick() {
		if (!isSelected) {
			onclick()
		}
	}
</script>

<div
	class="relative block w-full h-full text-gray-800 rounded-lg text-left transition-all duration-200 {bgClass}"
	class:shadow-md={!isSelected}
	class:shadow-lg={isSelected}
	data-testid="graph-node"
	data-practice-id={practice.id}
	data-node-size={nodeSize}
	data-selected={isSelected}
	onclick={handleCardClick}
	onkeydown={e => e.key === 'Enter' && handleCardClick()}
	role={isSelected ? undefined : 'button'}
	tabindex={isSelected ? undefined : 0}
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
				<Fa icon={isSelected ? faTimes : faCircleInfo} size="lg" />
			</IconButton>
		</div>

		<!-- Maturity Badge in center (only show if maturityLevel is defined and not root) -->
		{#if !_isRoot}
			<div class="z-10 flex items-center justify-center">
				<MaturityBadge maturityLevel={practice.maturityLevel} />
			</div>
		{:else}
			<!-- Spacer to maintain layout when no badge for root -->
			<div class="z-10 flex items-center justify-center min-w-6"></div>
		{/if}

		<!-- Adoption Checkbox in top-right corner (not shown for root) -->
		{#if !_isRoot}
			<div class="z-10" onclick={e => e.stopPropagation()} role="presentation">
				<AdoptionCheckbox practiceId={practice.id} {isAdopted} ontoggle={onToggleAdoption} />
			</div>
		{:else}
			<!-- Spacer to maintain layout when no checkbox for root -->
			<div class="z-10 min-w-[44px]"></div>
		{/if}
	</div>

	<!-- Title Section -->
	<div class="text-center node-section">
		<h3 class="font-bold leading-tight text-gray-900">
			{practice.name}
		</h3>
		<!-- Category Label - uses category-aware pill color -->
		{#if categoryLabel}
			<span
				class="inline-block text-[10px] font-medium uppercase tracking-wider text-gray-600 px-1.5 py-0.5 rounded {pillBgClass} mt-0.5"
				data-testid="category-label"
			>
				{categoryLabel}
			</span>
		{/if}
	</div>

	{#if isSelected}
		<!-- Description -->
		<p
			class="text-gray-700 node-section"
			class:text-xs={isCompactDisplay}
			class:text-sm={!isCompactDisplay}
		>
			{practice.description}
		</p>

		<!-- Adoption progress bar - category-aware colors -->
		{#if shouldShowAdoptionPercentage}
			<div class="flex items-center gap-2 node-section" data-testid="adoption-progress-bar">
				<div class="flex-1 h-1.5 bg-gray-200/60 rounded-full overflow-hidden">
					<div
						class="h-full {barBgClass} rounded-full transition-all"
						style="width: {adoptionData.percentage}%"
					></div>
				</div>
				<span class="text-xs font-semibold {barTextClass} tabular-nums"
					>{adoptionData.percentage}%</span
				>
			</div>
		{/if}

		<!-- Quick-Start Guide Link (selected view) -->
		{#if practice.quickStartGuide}
			<div class="node-section">
				<a
					href={practice.quickStartGuide}
					target="_blank"
					rel="noopener noreferrer"
					class="text-sm text-blue-600 hover:text-blue-700 transition-colors cursor-pointer inline-flex items-center gap-1.5"
					data-testid="quick-start-guide-link"
					onclick={e => e.stopPropagation()}
					aria-label="Quick-start guide for {practice.name}"
				>
					Quick-start Guide
					<Fa icon={faExternalLinkAlt} size="xs" />
					<span class="text-blue-400">&rarr;</span>
				</a>
			</div>
		{/if}

		<!-- Thin separator -->
		<div class="border-b border-gray-300/20 mb-1"></div>

		<!-- Requirements (collapsible, default open) -->
		{#if practice.requirements && practice.requirements.length > 0}
			<CollapsibleSection
				title="Requirements"
				titleColor="text-blue-700"
				count={practice.requirements.length}
				defaultOpen={true}
				compact={isCompactDisplay}
			>
				<ListWithIcons
					items={practice.requirements}
					icon="•"
					iconColor="text-gray-400"
					compact={isCompactDisplay}
					textSize={isCompactDisplay ? 'text-xs' : 'text-sm'}
				/>
			</CollapsibleSection>
		{/if}

		<!-- Benefits (collapsible, default closed) -->
		{#if practice.benefits && practice.benefits.length > 0}
			<CollapsibleSection
				title="Benefits"
				titleColor="text-green-700"
				count={practice.benefits.length}
				defaultOpen={false}
				compact={isCompactDisplay}
			>
				<ListWithIcons
					items={practice.benefits}
					icon="→"
					iconColor="text-green-600"
					compact={isCompactDisplay}
					textSize={isCompactDisplay ? 'text-xs' : 'text-sm'}
				/>
			</CollapsibleSection>
		{/if}

		<!-- Anti-patterns & Migration Guide Links -->
		{#if (practice.antiPatterns && practice.antiPatterns.length > 0) || practice.migrationGuideUrl}
			<div class="node-section node-links-section">
				{#if practice.antiPatterns && practice.antiPatterns.length > 0}
					<div class="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 text-xs leading-relaxed">
						<span class="text-amber-800/80 font-semibold flex items-center gap-1 shrink-0">
							<Fa icon={faExclamationTriangle} size="xs" />
							Anti-patterns:
						</span>
						{#each practice.antiPatterns as ap, i}
							<a
								href={ap.url}
								target="_blank"
								rel="noopener noreferrer"
								class="text-amber-700/70 hover:text-amber-900 underline decoration-dotted underline-offset-2 transition-colors"
								onclick={e => e.stopPropagation()}
								data-testid="anti-pattern-link">{ap.name}</a
							>{#if i < practice.antiPatterns.length - 1}<span class="text-gray-300">&middot;</span
								>{/if}
						{/each}
					</div>
				{/if}
				{#if practice.migrationGuideUrl}
					<div class="mt-1">
						<a
							href={practice.migrationGuideUrl}
							target="_blank"
							rel="noopener noreferrer"
							class="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1.5 w-fit transition-colors group"
							onclick={e => e.stopPropagation()}
							data-testid="migration-guide-link"
						>
							<Fa icon={faMapSigns} size="xs" />
							<span class="group-hover:underline">Migration Guide</span>
							<span class="text-indigo-400 group-hover:translate-x-0.5 transition-transform"
								>&rarr;</span
							>
						</a>
					</div>
				{/if}
			</div>
		{/if}
	{:else}
		<!-- Unselected view -->
		<div class="flex flex-col gap-1.5">
			<!-- Show dependency count only in collapsed view -->
			{#if !isTreeExpanded && practice.dependencyCount > 0}
				<div
					class="dependency-count text-center text-gray-500"
					class:text-xs={isCompactDisplay}
					class:text-sm={!isCompactDisplay}
				>
					{#if practice.directDependencyCount !== undefined && practice.totalDependencyCount !== undefined}
						<!-- Collapsed view: show both direct and total -->
						<div class={isCompactDisplay ? 'mt-0.5' : 'pt-1'}>
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

			<!-- Adoption progress bar - category-aware colors -->
			{#if shouldShowAdoptionPercentage}
				<div class="flex items-center gap-2 px-1" data-testid="adoption-progress-bar">
					<div class="flex-1 h-1.5 bg-gray-200/60 rounded-full overflow-hidden">
						<div
							class="h-full {barBgClass} rounded-full transition-all"
							style="width: {adoptionData.percentage}%"
						></div>
					</div>
					<span class="text-xs font-semibold {barTextClass} tabular-nums"
						>{adoptionData.percentage}%</span
					>
				</div>
			{/if}

			<!-- Drill-down affordance -->
			{#if !isTreeExpanded && practice.dependencyCount > 0}
				<div class="text-center" data-testid="explore-affordance">
					<span class="text-[11px] text-blue-400/60">Explore &rarr;</span>
				</div>
			{/if}

			<!-- Quick-Start Guide Link (unselected view) - inline labeled -->
			{#if practice.quickStartGuide}
				<div class="text-center">
					<a
						href={practice.quickStartGuide}
						target="_blank"
						rel="noopener noreferrer"
						class="text-xs text-blue-600 hover:text-blue-700 transition-colors cursor-pointer inline-flex items-center gap-1"
						data-testid="quick-start-guide-link"
						onclick={e => e.stopPropagation()}
						aria-label="Quick-start guide for {practice.name}"
					>
						Quick-start
						<Fa icon={faExternalLinkAlt} size="xs" />
					</a>
				</div>
			{/if}
		</div>
	{/if}
</div>
