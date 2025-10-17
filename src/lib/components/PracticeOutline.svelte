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

<div class="practice-outline" data-testid="practice-outline">
	<PracticeCard {practice} {level} />

	{#if practice.dependencies && practice.dependencies.length > 0}
		<div class="dependencies ml-4 mt-2">
			{#each practice.dependencies as dependency}
				<svelte:self practice={dependency} level={level + 1} />
			{/each}
		</div>
	{/if}
</div>

<style>
	.practice-outline {
		margin-bottom: 1rem;
	}

	.dependencies {
		border-left: 2px solid #e5e7eb;
		padding-left: 1rem;
	}
</style>
