<script>
	/**
	 * OnboardingOverlay Component
	 *
	 * Orchestrates the onboarding tutorial experience.
	 * Shows once on first visit, with step-by-step tooltips
	 * pointing to UI elements.
	 */
	import { browser } from '$app/environment'
	import { getOnboardingSteps } from '$lib/domain/onboarding/steps.js'
	import { hasSeenOnboarding, markOnboardingSeen } from '$lib/services/onboardingPersistence.js'
	import { onboardingStore } from '$lib/stores/onboardingStore.js'
	import { onMount } from 'svelte'
	import OnboardingSpotlight from './OnboardingSpotlight.svelte'
	import OnboardingTooltip from './OnboardingTooltip.svelte'

	const steps = getOnboardingSteps()

	let isActive = $state(false)
	let currentStepIndex = $state(0)
	let targetBounds = $state(null)
	let tooltipPosition = $state({ top: 0, left: 0 })

	onboardingStore.subscribe(value => {
		isActive = value.isActive
		currentStepIndex = value.currentStepIndex
	})

	const currentStep = $derived(steps[currentStepIndex] || steps[0])

	onMount(() => {
		if (browser && !hasSeenOnboarding()) {
			// Delay start to let UI elements render
			setTimeout(() => {
				onboardingStore.start()
			}, 800)
		}
	})

	// Recalculate positions when step changes
	$effect(() => {
		if (!isActive || !browser) return

		// Access currentStepIndex to track it reactively
		const step = steps[currentStepIndex]
		if (!step) return

		// Use tick-like delay to ensure DOM is ready
		const timeoutId = setTimeout(() => {
			calculatePositions(step)
		}, 50)

		// Handle resize
		const handleResize = () => calculatePositions(step)
		window.addEventListener('resize', handleResize)

		return () => {
			clearTimeout(timeoutId)
			window.removeEventListener('resize', handleResize)
		}
	})

	// Lock body scroll when active
	$effect(() => {
		if (browser && isActive) {
			document.body.style.overflow = 'hidden'
			return () => {
				document.body.style.overflow = ''
			}
		}
	})

	function calculatePositions(step) {
		if (!step) return

		if (!step.targetSelector) {
			// Center position (welcome step)
			targetBounds = null
			tooltipPosition = {
				top: Math.max(16, window.innerHeight / 2 - 150),
				left: Math.max(16, window.innerWidth / 2 - 250)
			}
			return
		}

		const target = document.querySelector(step.targetSelector)
		if (!target) {
			// Fallback to center if target not found
			targetBounds = null
			tooltipPosition = {
				top: Math.max(16, window.innerHeight / 2 - 150),
				left: Math.max(16, window.innerWidth / 2 - 250)
			}
			return
		}

		const rect = target.getBoundingClientRect()
		targetBounds = {
			top: rect.top,
			left: rect.left,
			width: rect.width,
			height: rect.height
		}

		const tooltipWidth = step.width === 'lg' ? 500 : 400
		const gap = 16

		let top, left

		switch (step.position) {
			case 'bottom':
				top = rect.bottom + gap
				left = rect.left + rect.width / 2 - tooltipWidth / 2
				break
			case 'top':
				top = rect.top - 200 - gap
				left = rect.left + rect.width / 2 - tooltipWidth / 2
				break
			case 'left':
				top = rect.top + rect.height / 2 - 100
				left = rect.left - tooltipWidth - gap
				break
			case 'right':
				top = rect.top + rect.height / 2 - 100
				left = rect.right + gap
				break
			default:
				top = window.innerHeight / 2 - 150
				left = window.innerWidth / 2 - tooltipWidth / 2
		}

		// Boundary clamping
		left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16))
		top = Math.max(16, Math.min(top, window.innerHeight - 250))

		tooltipPosition = { top, left }
	}

	function handleNext() {
		if (currentStepIndex >= steps.length - 1) {
			handleComplete()
		} else {
			onboardingStore.next()
		}
	}

	function handleSkip() {
		markOnboardingSeen()
		onboardingStore.skip()
	}

	function handleComplete() {
		markOnboardingSeen()
		onboardingStore.complete()
	}

	function handleKeydown(event) {
		if (!isActive) return

		if (event.key === 'Escape') {
			handleSkip()
		} else if (event.key === 'ArrowRight' || event.key === 'Enter') {
			handleNext()
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isActive}
	<!-- Backdrop -->
	<div
		class="fixed inset-0 bg-black/60 z-[1200]"
		data-testid="onboarding-backdrop"
		onclick={handleSkip}
		role="presentation"
		aria-hidden="true"
	></div>

	<!-- Spotlight on target element -->
	<OnboardingSpotlight bounds={targetBounds} />

	<!-- Tooltip -->
	<OnboardingTooltip
		step={currentStep}
		position={tooltipPosition}
		stepNumber={currentStepIndex + 1}
		totalSteps={steps.length}
		onNext={handleNext}
		onSkip={handleSkip}
	/>
{/if}
