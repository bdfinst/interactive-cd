<script>
	import Header from '$lib/components/Header.svelte'
	import HeaderSpacer from '$lib/components/HeaderSpacer.svelte'
	import SEO from '$lib/components/SEO.svelte'
	import '../app.css'
</script>

<SEO />

<Header />
<HeaderSpacer />

<div class="min-h-screen">
	<slot />
</div>
