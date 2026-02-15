<script>
	/**
	 * OnboardingTooltip Component
	 *
	 * Displays a positioned tooltip card with step content and navigation controls.
	 */
	const {
		step = {},
		position = { top: 0, left: 0 },
		stepNumber = 1,
		totalSteps = 1,
		onNext = () => {},
		onSkip = () => {}
	} = $props()

	const isLastStep = $derived(stepNumber === totalSteps)
	const widthClass = $derived(step.width === 'lg' ? 'max-w-[500px]' : 'max-w-[400px]')
</script>

<div
	class="fixed z-[1202] w-[calc(100vw-32px)] {widthClass}"
	style="top: {position.top}px; left: {position.left}px;"
	data-testid="onboarding-tooltip"
	role="dialog"
	aria-label="Onboarding step {stepNumber} of {totalSteps}"
>
	<div class="bg-white rounded-xl shadow-2xl border border-slate-200 p-5">
		<!-- Step indicator -->
		<div class="flex items-center gap-1.5 mb-3">
			{#each Array(totalSteps) as _, i}
				<div
					class="h-1.5 rounded-full transition-all duration-300 {i < stepNumber
						? 'bg-blue-500 w-6'
						: i === stepNumber - 1
							? 'bg-blue-500 w-6'
							: 'bg-slate-200 w-4'}"
				></div>
			{/each}
		</div>

		<!-- Content -->
		<h3 class="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
		<p class="text-sm text-slate-600 leading-relaxed mb-4">{step.content}</p>

		<!-- Controls -->
		<div class="flex items-center justify-between">
			<button
				onclick={onSkip}
				class="text-sm text-slate-400 hover:text-slate-600 transition-colors"
				data-testid="onboarding-skip"
			>
				Skip Tour
			</button>

			<button
				onclick={onNext}
				class="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
				data-testid="onboarding-next"
			>
				{isLastStep ? 'Get Started' : 'Next'}
			</button>
		</div>
	</div>
</div>
