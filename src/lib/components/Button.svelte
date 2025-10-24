<script>
	/**
	 * Button Component
	 *
	 * Standardized button based on the version number button style:
	 * - Rounded corners
	 * - Border with 2px thickness
	 * - Hover state with lighter background
	 * - Focus ring
	 * - Transition effects
	 */

	const {
		href = undefined,
		variant = 'primary', // 'primary' | 'secondary' | 'gray'
		size = 'md', // 'sm' | 'md' | 'lg'
		onclick = undefined,
		type = 'button',
		disabled = false,
		class: className = '',
		children,
		...restProps
	} = $props()

	// Variant styles matching version button pattern
	const variantClasses = $derived.by(() => {
		switch (variant) {
			case 'primary':
				return 'bg-blue-300 text-gray-800 border-blue-600 hover:bg-blue-500 focus:ring-blue-500'
			case 'secondary':
				return 'bg-green-100 text-gray-800 border-green-700 hover:bg-green-200 focus:ring-green-500'
			case 'gray':
				return 'bg-gray-600 text-white border-gray-600 hover:bg-gray-700 focus:ring-gray-500'
			default:
				return 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 focus:ring-blue-500'
		}
	})

	// Size classes
	const sizeClasses = $derived.by(() => {
		switch (size) {
			case 'sm':
				return 'px-2 py-1 text-xs'
			case 'md':
				return 'px-2 py-1 text-sm'
			case 'lg':
				return 'px-4 py-2 text-base'
			default:
				return 'px-2 py-1 text-sm'
		}
	})

	// Base classes (matching version button style exactly)
	const baseClasses =
		'inline-flex items-center justify-center gap-2 rounded-md border-2 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

	const combinedClasses = $derived(`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`)
</script>

{#if href}
	<a {href} class={combinedClasses} {...restProps}>
		{@render children()}
	</a>
{:else}
	<button {type} {disabled} {onclick} class={combinedClasses} {...restProps}>
		{@render children()}
	</button>
{/if}
