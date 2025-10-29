<script>
	import Fa from 'svelte-fa'
	import { faBars, faChevronLeft } from '@fortawesome/free-solid-svg-icons'

	/**
	 * Props
	 * @type {boolean} isExpanded - Whether the menu is currently expanded
	 * @type {Function} onclick - Click handler function
	 */
	const { isExpanded = false, onclick = null } = $props()

	/**
	 * Base classes for menu toggle button (Tailwind utilities)
	 * Visible on all screen sizes now
	 */
	const baseClasses =
		'flex items-center justify-center text-gray-800 p-2 min-h-[44px] min-w-[44px] rounded-md transition-colors hover:bg-black/10 active:bg-black/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 touch-manipulation'
</script>

<button
	type="button"
	class={baseClasses}
	aria-label={isExpanded ? 'Collapse menu' : 'Expand menu'}
	aria-expanded={isExpanded}
	{onclick}
	data-testid="menu-toggle"
>
	{#if isExpanded}
		<Fa icon={faChevronLeft} size="lg" />
	{:else}
		<Fa icon={faBars} size="lg" />
	{/if}
</button>
