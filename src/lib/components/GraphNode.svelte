<script>
	import { shouldShowAuditIndicators } from '$lib/utils/devMode.js'

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

	// Dev mode audit indicator visibility
	const showAuditIndicator = $derived(shouldShowAuditIndicators() && practice.audited === false)

	// Category background colors from mermaid diagram
	const categoryColors = {
		automation: '#fffacd',
		'behavior-enabled-automation': '#d7f8d7',
		behavior: '#d7e6ff',
		core: '#e9d5ff' // light purple
	}

	/**
	 * Calculate color intensity based on total dependency count
	 * Higher dependency count = more saturated/darker color
	 */
	const calculateColorIntensity = (baseColor, totalDeps) => {
		if (!totalDeps || totalDeps === 0) return baseColor

		// Parse hex color
		const hex = baseColor.replace('#', '')
		const r = parseInt(hex.substr(0, 2), 16)
		const g = parseInt(hex.substr(2, 2), 16)
		const b = parseInt(hex.substr(4, 2), 16)

		// Calculate intensity factor (0.5 to 1.0)
		// Max out at 50 dependencies for reasonable saturation
		const maxDeps = 50
		const factor = 1 - Math.min(totalDeps / maxDeps, 0.5)

		// Darken by moving toward middle intensity
		const newR = Math.floor(r * factor + r * (1 - factor) * 0.7)
		const newG = Math.floor(g * factor + g * (1 - factor) * 0.7)
		const newB = Math.floor(b * factor + b * (1 - factor) * 0.7)

		return `rgb(${newR}, ${newG}, ${newB})`
	}

	const bgColor = $derived.by(() => {
		const baseColor = categoryColors[practice.category] || '#ffffff'
		// Only apply intensity in collapsed view (not expanded tree view)
		if (!isTreeExpanded && practice.totalDependencyCount) {
			return calculateColorIntensity(baseColor, practice.totalDependencyCount)
		}
		return baseColor
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

		<!-- Dev Mode: Audit Status Indicator -->
		{#if showAuditIndicator}
			<div
				class="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-800 {compact
					? 'text-[0.5rem]'
					: 'text-xs'} font-semibold"
				role="status"
				aria-label="This practice has not been audited yet"
				data-testid="audit-indicator-false"
			>
				<span aria-hidden="true">⚠️</span>
				<span>NOT AUDITED</span>
			</div>
		{/if}
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
	{/if}
</button>
