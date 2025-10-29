<script>
	/**
	 * Tooltip Component
	 *
	 * Reusable tooltip with positioning and sizing options
	 */

	const { text, visible = false, position = 'bottom', size = 'sm' } = $props()

	// Position classes
	const positionClasses = $derived.by(() => {
		switch (position) {
			case 'top':
				return 'bottom-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 after:content-[""] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-[6px] after:border-transparent after:border-t-black/90'
			case 'bottom':
				return 'top-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 before:content-[""] before:absolute before:bottom-full before:left-1/2 before:-translate-x-1/2 before:border-[6px] before:border-transparent before:border-b-black/90'
			case 'left':
				return 'right-[calc(100%+0.5rem)] top-1/2 -translate-y-1/2 after:content-[""] after:absolute after:left-full after:top-1/2 after:-translate-y-1/2 after:border-[6px] after:border-transparent after:border-l-black/90'
			case 'right':
				return 'left-[calc(100%+0.5rem)] top-1/2 -translate-y-1/2 after:content-[""] after:absolute after:right-full after:top-1/2 after:-translate-y-1/2 after:border-[6px] after:border-transparent after:border-r-black/90'
			default:
				return 'top-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 before:content-[""] before:absolute before:bottom-full before:left-1/2 before:-translate-x-1/2 before:border-[6px] before:border-transparent before:border-b-black/90'
		}
	})

	// Size classes
	const sizeClasses = $derived.by(() => {
		switch (size) {
			case 'xs':
				return 'px-2 py-1 text-xs'
			case 'sm':
				return 'px-2 py-1.5 text-xs sm:px-2.5 sm:py-1.5 sm:text-xs md:px-3 md:py-2 md:text-sm'
			case 'md':
				return 'px-3 py-2 text-sm md:px-3 md:py-2 md:text-sm'
			default:
				return 'px-2 py-1.5 text-xs sm:px-2.5 sm:py-1.5 sm:text-xs md:px-3 md:py-2 md:text-sm'
		}
	})

	const baseClasses =
		'absolute bg-black/90 text-white rounded-md whitespace-nowrap pointer-events-none z-[2000]'
</script>

{#if visible}
	<div class="{baseClasses} {positionClasses} {sizeClasses}">
		{text}
	</div>
{/if}
