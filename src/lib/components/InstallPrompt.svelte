<script>
	import { onMount } from 'svelte'
	import { browser } from '$app/environment'
	import Fa from 'svelte-fa'
	import { faTimes, faDownload } from '@fortawesome/free-solid-svg-icons'

	let showPrompt = false
	let deferredPrompt = null
	let isInstalled = false

	onMount(() => {
		if (!browser) return

		// Check if app is already installed
		if (window.matchMedia('(display-mode: standalone)').matches) {
			isInstalled = true
			return
		}

		// Check if user has dismissed the prompt before
		const dismissed = localStorage.getItem('pwa-install-dismissed')
		const dismissedTime = dismissed ? parseInt(dismissed) : 0
		const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24)

		// Show prompt if never dismissed or dismissed more than 7 days ago
		if (!dismissed || daysSinceDismissed > 7) {
			// Listen for the beforeinstallprompt event
			window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
		}

		// Listen for successful install
		window.addEventListener('appinstalled', handleAppInstalled)

		return () => {
			window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
			window.removeEventListener('appinstalled', handleAppInstalled)
		}
	})

	function handleBeforeInstallPrompt(e) {
		// Prevent the mini-infobar from appearing on mobile
		e.preventDefault()
		// Stash the event so it can be triggered later
		deferredPrompt = e
		// Show the install prompt after a delay
		setTimeout(() => {
			showPrompt = true
		}, 3000) // 3 second delay
	}

	function handleAppInstalled() {
		isInstalled = true
		showPrompt = false
		deferredPrompt = null
		console.log('PWA was installed successfully')
	}

	async function handleInstallClick() {
		if (!deferredPrompt) return

		// Show the install prompt
		deferredPrompt.prompt()

		// Wait for the user to respond to the prompt
		const { outcome } = await deferredPrompt.userChoice

		if (outcome === 'accepted') {
			console.log('User accepted the install prompt')
		} else {
			console.log('User dismissed the install prompt')
		}

		// Clear the deferredPrompt
		deferredPrompt = null
		showPrompt = false
	}

	function handleDismissClick() {
		showPrompt = false
		localStorage.setItem('pwa-install-dismissed', Date.now().toString())
	}
</script>

{#if showPrompt && !isInstalled}
	<div
		class="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white border-2 border-blue-600 rounded-lg shadow-2xl z-[2000] animate-slide-up"
		role="dialog"
		aria-labelledby="install-prompt-title"
		data-testid="install-prompt"
	>
		<div class="p-4">
			<div class="flex justify-between items-start mb-3">
				<div class="flex items-center gap-3">
					<div class="bg-blue-100 p-2 rounded-lg">
						<Fa icon={faDownload} class="text-blue-600" size="lg" />
					</div>
					<h3 id="install-prompt-title" class="text-lg font-bold text-gray-900">Install App</h3>
				</div>
				<button
					type="button"
					on:click={handleDismissClick}
					class="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
					aria-label="Dismiss install prompt"
				>
					<Fa icon={faTimes} />
				</button>
			</div>

			<p class="text-sm text-gray-700 mb-4">
				Install Interactive CD for quick access and offline use. Works like a native app!
			</p>

			<div class="flex gap-2">
				<button
					type="button"
					on:click={handleInstallClick}
					class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
				>
					Install
				</button>
				<button
					type="button"
					on:click={handleDismissClick}
					class="px-4 py-2 text-gray-700 rounded-md font-medium hover:bg-gray-100 active:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
				>
					Not Now
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	@keyframes slide-up {
		from {
			transform: translateY(100%);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	.animate-slide-up {
		animation: slide-up 0.3s ease-out;
	}
</style>
