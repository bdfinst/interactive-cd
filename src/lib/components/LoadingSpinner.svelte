<script>
	/**
	 * LoadingSpinner Component
	 *
	 * Displays an animated loading spinner with optional text
	 */
	const { text = 'Loading dependencies...' } = $props()
</script>

<div class="flex items-center justify-center py-12" role="status" aria-live="polite">
	<div class="text-center">
		<div
			class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
			aria-hidden="true"
		></div>
		<p class="text-gray-300">{text}</p>
	</div>
</div>
