<script>
  import Header from '$lib/components/Header.svelte'
  import '../app.css'
</script>

<Header />

<div class="min-h-screen pt-10">
  <slot />
</div>
