<script>
	/**
	 * CollapsibleSection Component
	 *
	 * Reusable toggle section with rotating chevron, title, and item count.
	 */
	const {
		title,
		titleColor = 'text-gray-700',
		count = 0,
		defaultOpen = false,
		compact = false,
		children
	} = $props()

	let isOpen = $state(defaultOpen)

	function toggle() {
		isOpen = !isOpen
	}
</script>

<div>
	<button
		type="button"
		class="flex items-center gap-1.5 w-full text-left group"
		onclick={toggle}
		aria-expanded={isOpen}
		data-testid="collapsible-toggle"
	>
		<span class="text-gray-400 transition-transform duration-150 text-xs" class:rotate-90={isOpen}>
			&#9656;
		</span>
		<h4 class="font-semibold {titleColor}" class:text-xs={compact} class:text-sm={!compact}>
			{title}
		</h4>
		<span class="text-[10px] text-gray-400 tabular-nums">({count})</span>
	</button>
	{#if isOpen}
		<div class="mt-0.5">
			{@render children?.()}
		</div>
	{/if}
</div>
