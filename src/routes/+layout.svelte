<script>
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
</script>

<Header />

<div class="min-h-screen bg-gray-50 pt-20">
	<slot />
</div>
