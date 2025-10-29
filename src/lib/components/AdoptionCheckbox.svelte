<script>
	/**
	 * AdoptionCheckbox Component
	 *
	 * Checkbox for marking a practice as adopted
	 */
	const { practiceId, isAdopted = false, ontoggle = () => {} } = $props()

	/**
	 * Handle checkbox toggle
	 */
	const handleToggle = () => {
		ontoggle({ practiceId })
	}
</script>

<label class="inline-flex items-center cursor-pointer">
	<input
		type="checkbox"
		checked={isAdopted}
		onchange={handleToggle}
		aria-label="Mark {practiceId} as adopted"
		data-testid="adoption-checkbox-{practiceId}"
		class="w-5 h-5 text-green-600 bg-white border-2 border-gray-300 rounded cursor-pointer
		       focus:ring-2 focus:ring-green-500 focus:ring-offset-1
		       checked:bg-green-600 checked:border-green-600
		       hover:border-green-500 transition-colors"
	/>
	<span class="sr-only">Mark {practiceId} as adopted</span>
</label>

<style>
	/* Ensure checkbox is clickable and visible */
	input[type='checkbox'] {
		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;
		display: inline-block;
		position: relative;
		flex-shrink: 0;
	}

	/* Custom checkmark */
	input[type='checkbox']:checked::before {
		content: '✓';
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		color: white;
		font-size: 0.875rem;
		font-weight: bold;
		line-height: 1;
	}

	/* Focus visible for accessibility */
	input[type='checkbox']:focus-visible {
		outline: 2px solid #10b981;
		outline-offset: 2px;
	}
</style>
