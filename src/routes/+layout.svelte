<script>
	import Header from '$lib/components/Header.svelte'
	import SEO from '$lib/components/SEO.svelte'
	import '../app.css'
</script>

<SEO />

<Header />

<div class="min-h-screen pt-32 sm:pt-28">
	<slot />
</div>
