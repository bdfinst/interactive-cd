<script>
	/**
	 * PracticeCard Component
	 *
	 * Displays a practice card with title, description, dependency count, and benefits
	 */
	export let practice;

	// Get category icon
	const categoryIcons = {
		practice: '🔄',
		behavior: '👥',
		culture: '🌟',
		tooling: '🛠️'
	};

	const icon = categoryIcons[practice.category] || '📦';
</script>

<div
	class="practice-card bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
	data-testid="practice-card"
>
	<!-- Title Section -->
	<div class="mb-4">
		<div class="flex items-start gap-3 mb-2">
			<span class="text-3xl" aria-label="{practice.category} category">{icon}</span>
			<h2 class="text-2xl font-bold text-gray-900">{practice.name}</h2>
		</div>
	</div>

	<!-- Description -->
	<p class="text-gray-700 mb-4 leading-relaxed">{practice.description}</p>

	<!-- Dependency Count -->
	{#if practice.dependencyCount !== undefined}
		<div class="mb-4 flex items-center gap-2">
			<span class="text-sm font-semibold text-gray-600">Dependencies:</span>
			<span
				class="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full"
				data-testid="dependency-count"
			>
				{practice.dependencyCount}
			</span>
		</div>
	{/if}

	<!-- Benefits -->
	{#if practice.benefits && practice.benefits.length > 0}
		<div>
			<h3 class="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
				<span class="text-green-600">Benefits</span>
				<span class="text-sm text-gray-500">({practice.benefitCount})</span>
			</h3>
			<ul class="space-y-2" data-testid="benefits-list">
				{#each practice.benefits as benefit}
					<li class="flex items-start gap-2">
						<span class="text-green-600 mt-1">★</span>
						<span class="text-gray-700">{benefit}</span>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>
