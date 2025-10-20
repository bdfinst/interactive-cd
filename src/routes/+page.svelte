<script>
	import PracticeGraph from '$lib/components/PracticeGraph.svelte'

	/** @type {import('./$types').PageData} */
	const { data } = $props()
</script>

<div class="container px-4 mx-auto">
	<main>
		<div data-testid="practice-graph">
			<PracticeGraph initialData={data} />
		</div>
	</main>
</div>
