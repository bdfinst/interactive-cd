<script>
	import PracticeGraph from '$lib/components/PracticeGraph.svelte';
</script>

<div class="min-h-screen bg-gray-50">
	<div class="container mx-auto px-4 py-8">
		<header class="mb-8 text-center">
			<h1 class="text-4xl font-bold text-gray-900 mb-2">CD Practices</h1>
			<p class="text-gray-600">
				Explore the Continuous Delivery practices and their dependencies from MinimumCD.org
			</p>
		</header>

		<main>
			<div data-testid="practice-graph">
				<PracticeGraph />
			</div>
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
</div>
