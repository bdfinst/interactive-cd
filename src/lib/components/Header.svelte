<script>
	import { headerHeight } from '$lib/stores/headerHeight.js'
	import { menuStore } from '$lib/stores/menuStore.js'

	/**
	 * Subscribe to menu store to get expanded state
	 */
	const isExpanded = $derived($menuStore.isExpanded)

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
	class="fixed top-0 right-0 bg-slate-200 text-gray-800 z-[1000] shadow-md transition-all duration-300 {isExpanded
		? 'left-64'
		: 'left-16'}"
>
	<div class="max-w-screen-xl mx-auto px-4 py-3">
		<!-- Single H1 for both desktop and mobile -->
		<div class="flex justify-center items-center">
			<h1 class="text-lg lg:text-xl font-bold m-0 text-center whitespace-nowrap">
				CD Dependency Tree
			</h1>
		</div>
	</div>
</header>
