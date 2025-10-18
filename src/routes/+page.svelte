<script>
  import Legend from '$lib/components/Legend.svelte'
  import PracticeGraph from '$lib/components/PracticeGraph.svelte'
</script>

<Legend />

<div class="container px-4 mx-auto">
  <main>
    <div data-testid="practice-graph">
      <PracticeGraph />
    </div>
  </main>
</div>
