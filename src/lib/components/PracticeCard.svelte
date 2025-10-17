<script>
	/**
	 * PracticeCard Component
	 *
	 * Displays a single practice with its details
	 */
	export let practice;
	export let level = 0;

	// Get category icon
	const categoryIcons = {
		practice: '🔄',
		behavior: '👥',
		culture: '🌟',
		tooling: '🛠️'
	};

	const icon = categoryIcons[practice.category] || '📦';

	// Calculate indentation based on level
	const indentClass = level === 0 ? '' : `ml-${level * 6}`;
</script>

<div class="practice-card {indentClass} mb-4 border-l-4 border-blue-500 pl-4" data-testid="practice-card">
	<div class="flex items-start gap-3">
		<span class="text-2xl" aria-label="Category icon">{icon}</span>
		<div class="flex-1">
			<svelte:element this={`h${Math.min(level + 2, 6)}`} class="text-xl font-bold text-gray-900">
				{practice.name}
			</svelte:element>
			<p class="text-gray-600 text-sm mb-2">{practice.description}</p>

			<div class="flex gap-4 text-sm text-gray-500">
				<span data-testid="requirements-count">
					Requirements: ({practice.requirementCount || 0})
				</span>
				<span data-testid="benefits-count">
					Benefits: ({practice.benefitCount || 0})
				</span>
			</div>

			{#if practice.requirements && practice.requirements.length > 0}
				<details class="mt-2">
					<summary class="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
						View Requirements
					</summary>
					<ul class="list-disc list-inside mt-2 text-sm text-gray-700">
						{#each practice.requirements as req}
							<li>{req}</li>
						{/each}
					</ul>
				</details>
			{/if}

			{#if practice.benefits && practice.benefits.length > 0}
				<details class="mt-2">
					<summary class="cursor-pointer text-sm text-green-600 hover:text-green-800">
						View Benefits
					</summary>
					<ul class="list-disc list-inside mt-2 text-sm text-gray-700">
						{#each practice.benefits as benefit}
							<li>{benefit}</li>
						{/each}
					</ul>
				</details>
			{/if}

			{#if !practice.hasPrerequisites && practice.dependencies?.length === 0}
				<p class="mt-2 text-sm text-gray-500 italic">No dependencies (Leaf)</p>
			{/if}
		</div>
	</div>
</div>
