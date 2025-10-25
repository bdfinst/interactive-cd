<script>
	import Tooltip from './Tooltip.svelte'

	/**
	 * IconButton Component
	 *
	 * Reusable icon button with tooltip support
	 * Can render as button or link based on href prop
	 */
	const {
		ariaLabel,
		href = null,
		target = null,
		rel = null,
		tooltipText = null,
		tooltipPosition = 'bottom',
		onclick = () => {},
		children
	} = $props()

	let showTooltip = $state(false)
	let touchTimeout

	// Touch handler for mobile tooltip support
	function handleTouch(e) {
		e.preventDefault()
		clearTimeout(touchTimeout)
		showTooltip = !showTooltip
		// Auto-dismiss tooltip after 3 seconds
		if (showTooltip) {
			touchTimeout = setTimeout(() => {
				showTooltip = false
			}, 3000)
		}
	}

	const baseClasses =
		'relative inline-flex items-center gap-2 px-3 py-2 min-h-[44px] min-w-[44px] rounded-lg transition-colors duration-200 hover:bg-white/10 active:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent touch-manipulation active:scale-95'
</script>

{#if href}
	<a
		{href}
		{target}
		{rel}
		class={baseClasses}
		aria-label={ariaLabel}
		onmouseenter={() => (showTooltip = true)}
		onmouseleave={() => (showTooltip = false)}
		ontouchstart={handleTouch}
	>
		{@render children?.()}
		{#if tooltipText}
			<Tooltip text={tooltipText} visible={showTooltip} position={tooltipPosition} />
		{/if}
	</a>
{:else}
	<button
		type="button"
		class={baseClasses}
		aria-label={ariaLabel}
		{onclick}
		onmouseenter={() => (showTooltip = true)}
		onmouseleave={() => (showTooltip = false)}
		ontouchstart={handleTouch}
	>
		{@render children?.()}
		{#if tooltipText}
			<Tooltip text={tooltipText} visible={showTooltip} position={tooltipPosition} />
		{/if}
	</button>
{/if}
