<script>
  import Legend from '$lib/components/Legend.svelte'
  import PracticeGraph from '$lib/components/PracticeGraph.svelte'
</script>

<Legend />

<div class="container px-4 mx-auto">
  <!-- <div class="mb-4">
    <p class="text-center text-gray-300">
      Explore CD practices and their dependencies
    </p>
  </div> -->

  <main>
    <div data-testid="practice-graph">
      <PracticeGraph />
    </div>
  </main>
</div>
