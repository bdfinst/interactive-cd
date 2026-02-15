<script>
	/**
	 * OnboardingSpotlight Component
	 *
	 * Highlights a target element with a pulsing border during onboarding.
	 * Positioned absolutely based on the target element's bounding rect.
	 */
	const { bounds = null } = $props()
</script>

{#if bounds}
	<div
		class="fixed rounded-lg pointer-events-none z-[1201]"
		style="
			top: {bounds.top - 4}px;
			left: {bounds.left - 4}px;
			width: {bounds.width + 8}px;
			height: {bounds.height + 8}px;
		"
		data-testid="onboarding-spotlight"
		aria-hidden="true"
	>
		<div class="absolute inset-0 rounded-lg border-2 border-white animate-pulse"></div>
	</div>
{/if}
