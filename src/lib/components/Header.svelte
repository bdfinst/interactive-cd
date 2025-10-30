<script>
	import { headerHeight } from '$lib/stores/headerHeight.js'
	import { menuStore } from '$lib/stores/menuStore.js'
	import Fa from 'svelte-fa'
	import { faBars } from '@fortawesome/free-solid-svg-icons'

	/**
	 * Subscribe to menu store to get expanded state
	 */
	const isExpanded = $derived($menuStore.isExpanded)
	const isOpen = $derived($menuStore.isOpen)

	/**
	 * Handle hamburger button click
	 */
	const handleMobileMenuToggle = () => {
		menuStore.toggleMobile()
	}

	// Track header height
	let headerElement = $state()
	let currentHeight = $state(0)

	// Update store when height changes
	$effect(() => {
		if (headerElement) {
			currentHeight = headerElement.offsetHeight
			headerHeight.set(currentHeight)
		}
	})
</script>

<header
	bind:this={headerElement}
	class="fixed top-0 right-0 bg-slate-200 text-gray-800 z-[1000] shadow-md transition-all duration-300
		left-0
		{isExpanded ? 'md:left-64' : 'md:left-16'}"
>
	<div class="max-w-screen-xl mx-auto px-4 py-3">
		<div class="flex justify-between items-center">
			<!-- Hamburger button - Only visible on mobile -->
			<button
				onclick={handleMobileMenuToggle}
				class="md:hidden flex items-center justify-center min-h-[44px] min-w-[44px] p-2 rounded-md text-gray-800 hover:bg-black/10 active:bg-black/20 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
				aria-label={isOpen ? 'Close menu' : 'Open menu'}
				aria-expanded={isOpen}
				aria-controls="menu-content"
				data-testid="mobile-menu-button"
			>
				<Fa icon={faBars} size="lg" />
			</button>

			<!-- Title - Centered on mobile, left-aligned on tablet+ -->
			<h1
				class="text-lg lg:text-xl font-bold m-0 text-center whitespace-nowrap flex-1 md:flex-none"
			>
				CD Dependency Tree
			</h1>

			<!-- Spacer for mobile to keep title centered -->
			<div class="md:hidden min-w-[44px]"></div>
		</div>
	</div>
</header>
