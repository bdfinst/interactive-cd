<script>
  import Legend from '$lib/components/Legend.svelte'
  import PracticeGraph from '$lib/components/PracticeGraph.svelte'
</script>

<Legend />

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
</div>
