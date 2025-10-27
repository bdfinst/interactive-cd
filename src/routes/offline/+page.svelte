<script>
	import Fa from 'svelte-fa'
	import { faWifi, faRotateRight } from '@fortawesome/free-solid-svg-icons'

	function handleRetry() {
		window.location.reload()
	}
</script>

<svelte:head>
	<title>Offline - Interactive CD</title>
	<meta name="description" content="You are currently offline" />
</svelte:head>

<div class="flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
	<div class="max-w-md w-full text-center">
		<div class="mb-8">
			<div class="inline-flex items-center justify-center w-24 h-24 bg-gray-200 rounded-full mb-4">
				<Fa icon={faWifi} size="3x" class="text-gray-400" />
			</div>
			<h1 class="text-3xl font-bold text-gray-900 mb-2">You're Offline</h1>
			<p class="text-gray-600 text-lg">
				No internet connection detected. Please check your network and try again.
			</p>
		</div>

		<button
			type="button"
			on:click={handleRetry}
			class="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg"
		>
			<Fa icon={faRotateRight} />
			Try Again
		</button>

		<div class="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
			<h2 class="text-sm font-semibold text-blue-900 mb-2">Cached Content Available</h2>
			<p class="text-sm text-blue-800">
				Previously viewed pages may still be accessible while offline. Use your browser's back
				button to return to cached content.
			</p>
		</div>
	</div>
</div>

<style>
	:global(body) {
		background-color: #f9fafb;
	}
</style>
