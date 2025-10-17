<script>
	import PracticeGraph from '$lib/components/PracticeGraph.svelte';
</script>

<div class="container mx-auto px-4 py-8">
	<div class="mb-6 text-center">
		<p class="text-gray-600">
			Explore the Continuous Delivery practices and their dependencies
		</p>
	</div>

	<main>
		<div data-testid="practice-graph">
			<PracticeGraph />
		</div>
	</main>

	<footer class="mt-12 pt-8 border-t border-gray-200">
		<p class="text-sm text-gray-500 text-center">
			Practice definitions from MinimumCD.org
		</p>
	</footer>
</div>
