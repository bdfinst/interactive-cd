<script>
	import Header from '$lib/components/Header.svelte'
	import SEO from '$lib/components/SEO.svelte'
	import '../app.css'
</script>

<SEO />

<Header />

<div class="min-h-screen pt-10">
	<slot />
</div>
