<script>
	import { onMount } from 'svelte'
	import { browser } from '$app/environment'
	import Header from '$lib/components/Header.svelte'
	import HeaderSpacer from '$lib/components/HeaderSpacer.svelte'
	import CategoryLegend from '$lib/components/CategoryLegend.svelte'
	import LegendSpacer from '$lib/components/LegendSpacer.svelte'
	import SEO from '$lib/components/SEO.svelte'
	import InstallPrompt from '$lib/components/InstallPrompt.svelte'
	import '../app.css'

	let swRegistration = null
	let updateAvailable = false

	onMount(async () => {
		if (browser && 'serviceWorker' in navigator) {
			try {
				swRegistration = await navigator.serviceWorker.register('/sw.js')
				console.log('Service Worker registered:', swRegistration)

				// Check for updates
				swRegistration.addEventListener('updatefound', () => {
					const newWorker = swRegistration.installing
					newWorker.addEventListener('statechange', () => {
						if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
							// New service worker is ready
							updateAvailable = true
						}
					})
				})
			} catch (error) {
				console.error('Service Worker registration failed:', error)
			}
		}
	})

	function handleUpdateClick() {
		if (swRegistration?.waiting) {
			swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' })
			window.location.reload()
		}
	}

	function handleDismissUpdate() {
		updateAvailable = false
	}
</script>

<SEO />

<Header />
<HeaderSpacer />
<CategoryLegend />
<LegendSpacer />

<div class="min-h-screen">
	<slot />
</div>

<InstallPrompt />

{#if updateAvailable}
	<div
		class="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-blue-600 text-white rounded-lg shadow-2xl z-[2000]"
		role="alert"
		data-testid="update-notification"
	>
		<div class="p-4">
			<h3 class="text-lg font-bold mb-2">Update Available</h3>
			<p class="text-sm mb-4">A new version of Interactive CD is available.</p>
			<div class="flex gap-2">
				<button
					type="button"
					on:click={handleUpdateClick}
					class="flex-1 bg-white text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
				>
					Update Now
				</button>
				<button
					type="button"
					on:click={handleDismissUpdate}
					class="px-4 py-2 text-white rounded-md font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
				>
					Later
				</button>
			</div>
		</div>
	</div>
{/if}
