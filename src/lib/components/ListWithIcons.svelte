<script>
	/**
	 * ListWithIcons Component
	 *
	 * Renders a list of items with customizable icons and styling
	 */
	const {
		items = [],
		icon = '•',
		iconColor = 'text-gray-400',
		compact = false,
		textSize = 'text-xs'
	} = $props()

	const gapClass = $derived(compact ? 'gap-1' : 'gap-2')
	const spacingClass = $derived(compact ? 'space-y-0' : 'space-y-1')
</script>

<ul class="pl-0 {spacingClass} {textSize} text-gray-700 list-none">
	{#each items as item (item)}
		<li class="flex items-start {gapClass}">
			<span class="flex-shrink-0 {iconColor}">{icon}</span>
			<span class="flex-1">{item}</span>
		</li>
	{/each}
</ul>
