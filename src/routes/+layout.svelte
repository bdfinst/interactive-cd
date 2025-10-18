<script>
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
</script>

<Header />

<div class="min-h-screen bg-gray-800 pt-40">
	<slot />
</div>
