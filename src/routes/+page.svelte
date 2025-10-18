<script>
  import Legend from '$lib/components/Legend.svelte'
  import PracticeGraph from '$lib/components/PracticeGraph.svelte'
</script>

<Legend />

<div class="container px-4 mx-auto" style="padding-top: 6rem;">
  <div class="mb-6 text-center">
    <p class="text-gray-300" style="color: #d1d5db;">
      Explore Continuous Delivery practices and their dependencies
    </p>
  </div>

  <main>
    <div data-testid="practice-graph">
      <PracticeGraph />
    </div>
  </main>
</div>
