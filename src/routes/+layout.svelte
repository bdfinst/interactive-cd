<script>
	import Header from '$lib/components/Header.svelte'
	import HeaderSpacer from '$lib/components/HeaderSpacer.svelte'
	import CategoryLegend from '$lib/components/CategoryLegend.svelte'
	import LegendSpacer from '$lib/components/LegendSpacer.svelte'
	import SEO from '$lib/components/SEO.svelte'
	import '../app.css'
</script>

<SEO />

<Header />
<HeaderSpacer />
<CategoryLegend />
<LegendSpacer />

<div class="min-h-screen">
	<slot />
</div>
