<script>
	/**
	 * PracticeOutline Component
	 *
	 * Recursively displays the practice tree in hierarchical outline format
	 */
	import PracticeCard from './PracticeCard.svelte';

	export let practice;
	export let level = 0;
</script>

<div class="mb-4" data-testid="practice-outline">
	<PracticeCard {practice} {level} />

	{#if practice.dependencies && practice.dependencies.length > 0}
		<div class="ml-4 mt-2 border-l-2 border-gray-200 pl-4">
			{#each practice.dependencies as dependency}
				<svelte:self practice={dependency} level={level + 1} />
			{/each}
		</div>
	{/if}
</div>
