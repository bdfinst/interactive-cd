<script>
	import { onMount } from 'svelte';
	import PracticeOutline from '$lib/components/PracticeOutline.svelte';

	let loading = true;
	let error = null;
	let practiceTree = null;
	let metadata = null;

	onMount(async () => {
		try {
			const response = await fetch('/api/practices/tree');
			const result = await response.json();

			if (!response.ok || !result.success) {
				throw new Error(result.error || 'Failed to load practices');
			}

			practiceTree = result.data;
			metadata = result.metadata;
		} catch (err) {
			error = err.message;
			console.error('Error loading practices:', err);
		} finally {
			loading = false;
		}
	});
</script>

<div class="container mx-auto px-4 py-8 max-w-4xl">
	<header class="mb-8">
		<h1 class="text-4xl font-bold text-gray-900 mb-2">CD Practices</h1>
		<p class="text-gray-600">
			Explore the Continuous Delivery practices and their dependencies from MinimumCD.org
		</p>
		{#if metadata}
			<p class="text-sm text-gray-500 mt-2" data-testid="practice-count">
				Total Practices: {metadata.totalPractices}
			</p>
		{/if}
	</header>

	<main>
		{#if loading}
			<div class="flex items-center justify-center py-12" data-testid="loading-indicator">
				<div class="text-center">
					<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
					<p class="text-gray-600">Loading practices...</p>
				</div>
			</div>
		{:else if error}
			<div
				class="bg-red-50 border border-red-200 rounded-lg p-6 text-center"
				role="alert"
				data-testid="error-message"
			>
				<p class="text-red-800 font-semibold mb-2">Error loading practices</p>
				<p class="text-red-600">{error}</p>
				<button
					on:click={() => window.location.reload()}
					class="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
				>
					Retry
				</button>
			</div>
		{:else if practiceTree}
			<div data-testid="practice-outline">
				<PracticeOutline practice={practiceTree} />
			</div>
		{:else}
			<p class="text-gray-500 text-center py-12">No practices found.</p>
		{/if}
	</main>

	<footer class="mt-12 pt-8 border-t border-gray-200">
		<p class="text-sm text-gray-500 text-center">
			Practice definitions from
			<a href="https://minimumcd.org" class="text-blue-600 hover:text-blue-800" target="_blank">
				MinimumCD.org
			</a>
		</p>
	</footer>
</div>
